import random
from flask import Flask, request, jsonify
from flask_cors import CORS
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

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes so React can fetch

# --- Global Models ---
risk_model = None
vector_db = None
embedding_model = None
rag_chain = None

def load_models():
    global risk_model, vector_db, embedding_model, rag_chain
    print("Loading models and data for API...")
    
    try:
        # Load Risk Model
        risk_model = joblib.load("risk_model.joblib")
        
        # Load RAG Components
        embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector_db = FAISS.load_local("faiss_index", embedding_model, allow_dangerous_deserialization=True)
        
        # Setup RAG Chain
        retriever = vector_db.as_retriever()
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

        Final Answer:
        """
        prompt = ChatPromptTemplate.from_template(template)
        
        # Use whatever key is in the env. Note: User must have GROQ_API_KEY set.
        model_to_use = os.environ.get("GROQ_CHAT_MODEL", "llama-3.1-8b-instant")
        llm = ChatGroq(model_name=model_to_use)
        
        rag_chain = (
            {"context": retriever, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        print("Models successfully loaded!")
    except Exception as e:
        print(f"Error loading models: {e}")

# Load on startup
load_models()

# --- Agent Functions ---
def assess_risk(applicant_details):
    features = ['loan_amnt', 'annual_inc', 'dti', 'fico_range_low']
    # Ensure they are numeric
    for f in features:
        applicant_details[f] = float(applicant_details[f])
        
    applicant_features = pd.DataFrame([applicant_details])[features]
    risk_probability = risk_model.predict_proba(applicant_features)[0][1]
    return float(risk_probability)

def make_decision(risk_probability):
    if risk_probability > 0.5: return 'Rejected', 'High risk score'
    elif risk_probability > 0.2: return 'Approved with Conditions', 'Moderate risk score'
    else: return 'Approved', 'Low risk score'

def calculate_emi(applicant_details, interest_rate=8.5):
    loan_amount = float(applicant_details['loan_amnt'])
    term_val = str(applicant_details['term']).replace(' months', '').strip()
    term_in_months = int(term_val) if term_val.isdigit() else 36
    monthly_rate = (interest_rate / 100) / 12
    emi = -npf.pmt(rate=monthly_rate, nper=term_in_months, pv=loan_amount)
    return float(emi)

# --- Routes ---
@app.route('/api/assess', methods=['POST'])
def assess_loan():
    try:
        data = request.json
        
        # Calculate DTI
        annual_inc = float(data.get('annual_inc', 0))
        existing_debt = float(data.get('existing_debt', 0))
        if annual_inc > 0:
            dti = (existing_debt / (annual_inc / 12)) * 100
        else:
            dti = 0.0
        data['dti'] = dti

        # Handle Credit Score
        credit_score = data.get('credit_score')
        if not credit_score or str(credit_score).strip() == '':
            credit_score = random.randint(600, 850)
        data['fico_range_low'] = float(credit_score)

        risk_prob = assess_risk(data)
        decision, reason = make_decision(risk_prob)
        
        result = {
            "decision": decision,
            "reason": reason,
            "risk_prob": risk_prob,
            "calculated_dti": dti,
            "credit_score": credit_score
        }
        
        if decision.startswith('Approved'):
            emi = calculate_emi(data)
            result["emi"] = emi
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/query', methods=['POST'])
def query_documents():
    try:
        data = request.json
        question = data.get("question")
        
        if "GROQ_API_KEY" not in os.environ:
            return jsonify({"answer": "GROQ_API_KEY is not set. Please set it as an environment variable."}), 400
            
        if not rag_chain:
            return jsonify({"answer": "RAG models failed to load. Check logs."}), 500
            
        response = rag_chain.invoke(question)
        return jsonify({"answer": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    # Run on port 5000 as React expects
    app.run(host='0.0.0.0', port=5000, debug=True)
