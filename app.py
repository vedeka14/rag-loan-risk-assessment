import streamlit as st
import pandas as pd
import joblib
import numpy_financial as npf
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
import os

# --- Page Configuration ---
st.set_page_config(
    page_title="AI Loan Processor",
    page_icon="🤖",
    layout="wide"
)

# --- Caching Models and Data for Performance ---
@st.cache_resource
def load_models_and_data():
    """Loads all necessary models and data once and caches them."""
    print("Loading models and data...")
    risk_model = joblib.load("risk_model.joblib")
    
    # Memory optimization
    required_cols = ['id', 'loan_amnt', 'term', 'annual_inc', 'dti', 'fico_range_low']
    loan_df = pd.read_csv("dataset/loan.csv", usecols=required_cols)
    
    # Clean the ID column
    loan_df['id'] = pd.to_numeric(loan_df['id'], errors='coerce')
    loan_df.dropna(subset=['id'], inplace=True)
    loan_df['id'] = loan_df['id'].astype(int)
    
    # Load RAG Components
    embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_db = FAISS.load_local("faiss_index", embedding_model, allow_dangerous_deserialization=True)
    
    print("Loading complete.")
    return risk_model, loan_df, vector_db, embedding_model

# --- Agent Functions ---
def assess_risk(applicant_details, risk_model):
    features = ['loan_amnt', 'annual_inc', 'dti', 'fico_range_low']
    applicant_features = pd.DataFrame([applicant_details])[features]
    risk_probability = risk_model.predict_proba(applicant_features)[0][1]
    return risk_probability

def make_decision(risk_probability):
    if risk_probability > 0.5: return 'Rejected', 'High risk score'
    elif risk_probability > 0.2: return 'Approved with Conditions', 'Moderate risk score'
    else: return 'Approved', 'Low risk score'

def calculate_emi(applicant_details, interest_rate=8.5):
    loan_amount = applicant_details['loan_amnt']
    term_in_months = int(str(applicant_details['term']).strip().split()[0])
    monthly_rate = (interest_rate / 100) / 12
    emi = -npf.pmt(rate=monthly_rate, nper=term_in_months, pv=loan_amount)
    return emi

# --- Main Application UI ---
st.title("🤖 RAG-Enabled Loan Application & Risk Assessment System")

try:
    risk_model, loan_df, vector_db, embedding_model = load_models_and_data()
    
    st.sidebar.title("Select Mode")
    app_mode = st.sidebar.radio(
        "Choose the system's function:",
        ("Loan Risk Assessment", "Query Documents (RAG)")
    )

    if app_mode == "Loan Risk Assessment":
        st.header("Loan Application Risk Assessment")
        
        applicant_ids = loan_df['id'].head(100).tolist()
        selected_id = st.selectbox("Select an Applicant ID to Assess:", applicant_ids)

        if st.button("Assess Risk"):
            with st.spinner("Running workflow..."):
                applicant_details = loan_df[loan_df['id'] == selected_id].iloc[0].to_dict()
                
                risk_prob = assess_risk(applicant_details, risk_model)
                decision, reason = make_decision(risk_prob)

                st.subheader(f"Assessment for Applicant ID: {selected_id}")
                
                if decision.startswith('Approved'):
                    st.success(f"Decision: {decision} (Reason: {reason})")
                    st.metric(label="Calculated Risk Probability", value=f"{risk_prob:.2%}")
                    emi = calculate_emi(applicant_details)
                    st.info(f"Generated EMI: **${emi:,.2f} / month**")
                else:
                    st.error(f"Decision: {decision} (Reason: {reason})")
                    st.metric(label="Calculated Risk Probability", value=f"{risk_prob:.2%}")
                    st.warning(
                        "**Recommendation:** Improve credit score and/or reduce debt-to-income ratio before reapplying."
                    )

    elif app_mode == "Query Documents (RAG)":
        st.header("Query Loan Documents with RAG")
        
        retriever = vector_db.as_retriever()
        
        # --- FINAL, STRICTER PROMPT TEMPLATE ---
        template = """
Use the following context to answer the user's question(s).

Context:
{context}

Question: {question}

**CRITICAL INSTRUCTIONS:**
1. You **must** always answer in a complete, natural-sounding sentence.
2. **Never** provide just a number, an ID, or a data fragment as the answer.
3. If asked multiple questions, answer each with a full sentence in a bulleted list.
4. Do not repeat the user's question in your response.
5. Strictly follow the sentence structure of the examples below.

---
**EXAMPLES OF REQUIRED ANSWER FORMAT:**

# Example for highest loan amount:
The application with the highest loan amount is 68535544, with a value of $23,525.00.

# Example for FICO score:
The lowest FICO score found in the documents is 660.0.

# Example for multiple questions:
- The loan status for application 68547291 is not available.
- The annual income for application 68617034 is $43,160.00.
---

Based on the context and the critical instructions, provide your answer(s).

Final Answer:
"""
        prompt = ChatPromptTemplate.from_template(template)
        
        model_to_use = os.environ.get("GROQ_CHAT_MODEL", "llama-3.1-8b-instant")
        llm = ChatGroq(model_name=model_to_use)
        
        rag_chain = (
            {"context": retriever, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        
        user_question = st.text_input("Ask a question about the loan data:")
        
        if user_question:
            if "GROQ_API_KEY" not in os.environ or not os.environ["GROQ_API_KEY"]:
                st.error("GROQ_API_KEY is not set. Please set it as an environment variable.")
            else:
                with st.spinner("Searching for answers..."):
                    response = rag_chain.invoke(user_question)
                    st.markdown(response)

except FileNotFoundError as e:
    st.error(f"🔴 CRITICAL ERROR: A required file was not found.")
    st.error(f"Details: {e}")
    st.info("Please ensure 'dataset/loan.csv', 'risk_model.joblib', and the 'faiss_index' folder are present.")