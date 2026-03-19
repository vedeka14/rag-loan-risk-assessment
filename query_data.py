import os
import joblib
import pandas as pd
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq

def list_available_docs(path="data/extracted_data/text/train"):
    """Lists the application IDs from the filenames in the directory."""
    try:
        ids = [f.split('_')[-1].split('.')[0] for f in os.listdir(path) if f.startswith("loan_app")]
        return ids
    except FileNotFoundError:
        return []

def format_docs(docs):
    """Helper function to format retrieved documents into a single string."""
    return "\n\n".join(doc.page_content for doc in docs)

def main():
    """Main function to load the database and answer questions."""
    if "GROQ_API_KEY" not in os.environ or not os.environ["GROQ_API_KEY"]:
        print("🔴 ERROR: GROQ_API_KEY is not set.")
        print("Please get a free API key from https://console.groq.com/keys and set it.")
        return

    # --- Load the Risk Model and the full CSV dataset ---
    print("➡️  Loading Risk Assessment Model...")
    try:
        risk_model = joblib.load("risk_model.joblib")
        print("✅ Risk Model loaded.")
        
        print("➡️  Loading full loan dataset for lookups...")
        required_cols = ['id', 'loan_amnt', 'annual_inc', 'dti', 'fico_range_low']
        loan_df = pd.read_csv("dataset/loan.csv", usecols=required_cols)
        print("✅ Full dataset loaded.")
        
    except FileNotFoundError:
        print("🔴 ERROR: Could not find 'risk_model.joblib' or 'dataset/loan.csv'.")
        print("Please make sure you have run the training script and the data is in place.")
        return
# --- RAG LOAD ---
    print("➡️  Loading RAG system...")
    embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_db = FAISS.load_local("faiss_index", embedding_model, allow_dangerous_deserialization=True)
    retriever = vector_db.as_retriever()
    print("✅ RAG system loaded.")
    
    print("\n✅ System ready.")
    
    print("\n   Type a question (e.g., 'What is the loan status for 68407277?')")
    print("   OR 'assess risk for [ID]'")
    print("   OR 'exit' to quit.")

    template = """
Use the following context to answer the user's question precisely.

Context:
{context}

Question: {question}

INSTRUCTIONS:
1. Analyze the user's question to identify the data field they are asking about (e.g., "FICO score", "loan amount").
2. Scan the context to find all values for that specific data field.
3. Perform the requested comparison (e.g., find the lowest or highest value).
4. State the answer in a clear, simple sentence using the exact format from the examples below.

---
EXAMPLE 1:
Question: What is the lowest FICO score?
Answer: The lowest FICO score is 660.0.

EXAMPLE 2:
Question: What is the application id with the lowest loan amount?
Answer: The application with the lowest loan amount is 68534381.

EXAMPLE 3:
Question: What is the application id with the highest loan amount?
Answer: Application ID: 68535544 with a loan amount of $23,525.00.
---

Now, based on the context, answer the user's question.

Answer:
"""
    prompt = ChatPromptTemplate.from_template(template)
    
    model_to_use = os.environ.get("GROQ_CHAT_MODEL", "llama-3.1-8b-instant")
    llm = ChatGroq(model_name=model_to_use)
    
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    while True:
        question = input("\nYour Command: ")
        if question.lower() == 'exit':
            break

        # --- Logic to switch between RAG and Risk Assessment ---
        if question.lower().startswith("assess risk for"):
            try:
                app_id = int(question.split()[-1])
                
                applicant_data = loan_df[loan_df['id'] == app_id]
                
                if applicant_data.empty:
                    print("\nAnswer: Applicant ID not found in the dataset.")
                    continue
                
                features = ['loan_amnt', 'annual_inc', 'dti', 'fico_range_low']
                applicant_features = applicant_data[features].dropna()

                if applicant_features.empty:
                    print("\nAnswer: Applicant data is missing key features for assessment.")
                    continue

                prediction = risk_model.predict(applicant_features)[0]
                probability = risk_model.predict_proba(applicant_features)[0]
                
                print("\n--- Risk Assessment Report ---")
                print(f"Applicant ID: {app_id}")
                if prediction == 0:
                    print("Prediction: Good Risk ✅")
                    print(f"Confidence: {probability[0]:.2%}")
                else:
                    print("Prediction: High Risk 🔴")
                    print(f"Confidence: {probability[1]:.2%}")
                print("-----------------------------")

            except (ValueError, IndexError):
                print("\nInvalid command. Please use the format: assess risk for [ID]")
        else:
            # If not an assess command, use the RAG chain
            # The line printing the model name has been removed from here
            answer = rag_chain.invoke(question)
            print("\nAnswer:", answer)

if __name__ == "__main__":
    main()