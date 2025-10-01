# Unified Education Interface (UEI) 🚀

A centralized platform to integrate and analyze data of **students, teachers, and higher education institutions** under one unified system.  
Built for **Smart India Hackathon 2025 (Problem Code: SIH25252)**.

---

## 📌 Overview
The **Unified Education Interface (UEI)** addresses the lack of a single mechanism to store, access, and analyze education-related data in India.  
Currently, data is scattered across multiple bodies (AISHE, NIRF, UGC, AICTE, institutions), making it hard to track student life cycles, teacher performance, institutional rankings, and scheme beneficiaries.  

UEI provides a **secure, Aadhaar/APAR/AISHE-verified platform** that unifies data and offers **role-based dashboards** with powerful analytics.

---

## ✨ Key Features
- 🔑 **Secure Authentication & Verification**  
  - Aadhaar-based eKYC for Students  
  - Aadhaar + APAR ID for Teachers  
  - AISHE Code + Admin Aadhaar for Institutions  
  - Govt Email + Aadhaar MFA for Ministry  

- 📊 **Role-Based Dashboards**
  - **Students** → Academic profile, performance tracking, scheme eligibility  
  - **Teachers** → APAR, research, student progress monitoring  
  - **Institutions** → NIRF/NAAC compliance, ranking metrics, project uploads  
  - **Ministry** → Nationwide analytics, scheme evaluation, decision support  

- 📂 **Centralized Data Storage**
  - PostgreSQL/MySQL for structured data  
  - MongoDB for unstructured data (projects, research, reports)  

- 🤖 **AI-Driven Analytics**
  - Student performance trends  
  - Institution ranking predictions (NIRF metrics)  
  - Effectiveness of govt schemes  

- 🔒 **Governance & Security**
  - Role-based access control (RBAC)  
  - Consent management for data linking  
  - Encrypted Aadhaar/APAR/AISHE IDs  
  - Audit logs for all actions  

---

## 🏗️ Tech Stack
- **Backend:** Flask (Python), Flask-JWT-Extended, SQLAlchemy ORM  
- **Frontend:** Flask-Jinja2 / React.js (for dashboards)  
- **Database:** PostgreSQL/MySQL + MongoDB  
- **Analytics:** Pandas, NumPy, Scikit-learn, Plotly  
- **Security:** JWT, Aadhaar eKYC (mock API), MFA, HTTPS  
- **Deployment:** Docker, Gunicorn + Nginx, AWS/GCP/NIC Cloud  

---

## 🔄 System Workflow
1. **User Login & Verification**  
   - Students → Aadhaar + Enrollment No  
   - Teachers → Aadhaar + APAR ID  
   - Institutions → AISHE Code + Admin Aadhaar  
   - Ministry → Govt Email + Aadhaar OTP  

2. **Role-Based Access** → Different dashboards based on role.  

3. **Data Collection Layer** → Performance, achievements, schemes, compliance.  

4. **Unified Database** → Structured + unstructured storage with security.  

5. **Analytics Engine** → ML models for rankings, trends, and scheme insights.  

6. **Reports & Dashboards** → Interactive dashboards + downloadable reports.  

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+  
- PostgreSQL / MySQL  
- MongoDB  

### Installation
```bash
# Clone repo
git clone https://github.com/VaibhavUPratap/SIH.git

# Create virtual environment
python -m venv venv
source venv/bin/activate   # For Linux/Mac
venv\Scripts\activate      # For Windows

# Install dependencies
pip install -r requirements.txt

# Run Flask app
flask run
