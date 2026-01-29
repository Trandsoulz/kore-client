KORE FULL INTEGRATIONS ARCHITECTURE
DOCUMENT
Internal Engineering & Integrations Team Document
Version 1.0 — Confidential
TABLE OF CONTENTS
1.​ Introduction​
2.​ System Overview​
3.​ Core Design Principles​
4.​ High-Level System Architecture​
5.​ Income Detection & Execution Model​
6.​ Mandate Strategy & Money Movement Logic​
7.​ Rules Engine Architecture​
8.​ Orchestration Layer Architecture​
9.​ Financial Buckets (Deep Integration Logic)​
10.​PayWithAccount API Consumption Plan​
11.​Webhook Strategy & Idempotency​
12.​Kore Partner Integration Layer​
13.​Internal Ledger & Audit Trail​14.​Security & Compliance Architecture​
15.​Scalability & Reliability Strategy​
16.​Future Expansion: Open Banking Integration​
17.​Appendix — Sequence Diagrams​
1. INTRODUCTION
This document describes how Kore integrates with external financial services (primarily
PayWithAccount by OnePipe) and how Kore’s internal systems coordinate this integration to
automate personal finance for users with:
●​ Predictable income (monthly salary earners)​
●​ Unpredictable income (gig workers, freelancers, independent contractors)​
This is Kore’s master integration architecture, used internally by:
●​ Backend Engineering​
●​ ML Engineering​
●​ Integrations Team​
●​ Product & Compliance​
●​ DevOps​
2. SYSTEM OVERVIEW
Kore is a financial automation platform that:●​ Pulls money from customer accounts using PayWithAccount mandates​
●​ Applies Kore’s Rules Engine to determine what to do with the funds​
●​ Orchestrates the flow of money into:​
○​ Savings​
○​ Rent​
○​ Tax​
○​ Investments​
○​ Loans​
○​ Subscriptions​
○​ Pensions​
●​ Executes transfers to partners, lenders, landlords, investment providers, utilities, etc.​
●​ Tracks, reconciles & reports all movements internally through a non-custodial ledger.​
IMPORTANT:​
Kore never holds customer funds.​
All executions flow through partner rails, not Kore wallets.
3. CORE DESIGN PRINCIPLES
1.​ Non-Custodial Money Movement​
Kore never stores user money. We only trigger actions.​
2.​ Customer-Controlled Automations​
Kore only moves money based on rules users approve.​
3.​ Mandate-Led Execution​
Users authorize Kore to debit via PayWithAccount.​4.​ Rules First, ML Assisted​
ML suggests; rules decide.​
5.​ Partner-Executed, Kore-Orchestrated​
Kore orchestrates flows, APIs execute them.​
6.​ Idempotency Everywhere​
Every execution must be safe to retry.​
7.​ Full Observability​
Every flow is logged, traceable & auditable.​
4. HIGH-LEVEL SYSTEM ARCHITECTURE
Mobile App (Flutter/React Native)
|
v
API Gateway
|
v
Kore Backend
┌───────────────────────────┐
│ Rules Engine
│
│ Orchestration Layer │
│ Mandate Service
│
│ Income Scheduler
│
│ Partner Integration │
│ Ledger & Reconciliation │
└───────────────────────────┘
|
|
|
v
v
v
PayWithAccount Partners ML Engine
APIs
(Loans, (optional)
Investments,
Utilities)
Databases:●​ PostgreSQL​
●​ Redis Cache​
●​ Redis Queue (Celery workers)​
5. INCOME DETECTION & EXECUTION
MODEL
5.1 Why Kore Does NOT Depend on Open Banking
Open banking in Nigeria is:
●​ Not widely implemented​
●​ Not real-time​
●​ Not reliable for income alerts​
Therefore, Kore uses a hybrid model.
5.2 Income Trigger Models Used by Kore
1. User-Triggered Pull
User sets:​
“Whenever my balance is above ₦X, apply my rules.”
2. Scheduled Pulls (e.g., daily/weekly/monthly)
Useful for predictable-income users.
3. ML-Assisted Expected Income Estimation
ML predicts when income usually comes in.​
Not used for automation; used only for notifications & suggestions.4. Budgeting-Based Pull
User says:​
“Pull ₦20,000 every week for rent.”
6. MANDATE STRATEGY & MONEY
MOVEMENT LOGIC
6.1 Mandate Types Kore Uses
Kore supports:
Single Master Mandate per Customer Account
●​ One mandate per funding bank account​
●​ This mandate authorizes Kore to pull funds anytime rules require it.​
Advantages:
●​ Simpler reconciliation​
●​ Less user friction​
●​ Easier expiry & revocation tracking​
6.2 How Debits Are Performed
User → Creates Mandate
Kore → Stores mandateID
Kore → Requests debit via /collect
PWA → Pulls funds → Sends callback
Kore → Executes bucket logic6.3 Money Never Touches Kore
After collecting via PWA, funds must go to:
●​ Partner investment provider​
●​ Utility company​
●​ Lender​
●​ Pension manager​
●​ Rent escrow partner​
●​ Kore partner savings vehicle​
Kore never receives settlement funds.
7. RULES ENGINE ARCHITECTURE
Kore’s rule engine determines what to do with incoming funds.
7.1 Rule Categories
●​ Savings rules​
●​ Rent rules​
●​ Loan repayment rules​
●​ Tax rules​
●​ Subscription rules​
●​ Investment rules​
●​ Pension rules​7.2 Rule Evaluation Flow
Start
|
Fetch active rules
|
Sort by priority
|
Check constraints (min balance, time of day, limits)
|
For each rule → Decide operation
|
Orchestration engine schedules & executes
7.3 Rule Types
●​ Percentage-based​
●​ Fixed amount​
●​ Threshold-based​
●​ Conditional rules​
●​ Seasonal/periodic rules​
8. ORCHESTRATION LAYER ARCHITECTURE
This layer executes financial flows triggered by rules.
Orchestration Lifecycle
1.​ Receives "intent" from rules engine​
2.​ Validates user balance (shadow balance + previous debits)​
3.​ Calls PayWithAccount /collect​4.​ Waits for webhook​
5.​ Executes partner logic​
6.​ Generates ledger entries​
7.​ Sends notifications​
8.​ Marks orchestration complete​
9. FINANCIAL BUCKETS (DETAILED
BEHAVIOR)
Each bucket has:
●​ Purpose​
●​ Rules​
●​ Orchestration steps​
●​ Required partner APIs​
●​ Required PayWithAccount APIs​
●​ Failure behavior​
9.1 Savings Bucket
Purpose
Help users build automated savings.
Execution Flow1.​ Rule triggers savings​
2.​ Orchestration calls /collect​
3.​ Webhook confirms​
4.​ Funds sent directly to Kore savings partner (e.g. Cowrywise, Piggyvest-like partner)​
5.​ Ledger entry logged​
9.2 Rent Bucket
Purpose
Help users gradually accumulate rent payments.
Method
Kore partners with a rent escrow provider. Funds go directly from customer → escrow account.
9.3 Loan Bucket
Purpose
Automate loan repayment.
Execution Flow
1.​ Rule triggers repayment​
2.​ /collect initiated​
3.​ Webhook confirms​
4.​ Kore sends API POST to lender​
Kore never receives or stores the funds.9.4 Tax Bucket
Purpose
Help users plan for PAYE/Self-assessed tax.
Flow
1.​ Kore estimates tax​
2.​ Pulls funds according to user rules​
3.​ Sends to FIRS/State Remittance Partner​
4.​ Stores tax receipt references​
9.5 Subscriptions Bucket
Supports:
●​ Electricity​
●​ Cable TV​
●​ Internet​
●​ Phone data​
●​ Gas​
●​ Gym​
●​ Insurance​
Kore triggers partner API → vendor receives settlement.9.6 Investment Bucket
Purpose
Invest user funds into chosen instruments.
Flow
1.​ User selects investment provider​
2.​ Kore generates an investment "intent"​
3.​ /collect pulls funds​
4.​ Partner investment API executes purchase​
5.​ Kore reconciles the investment reference​
10. PAYWITHACCOUNT API CONSUMPTION
PLAN
These are the exact APIs Kore must use:
1. Create Mandate
POST /mandates​
Used to authorize Kore.
2. Verify Mandate (Optional)
GET /mandates/:id
3. Collect (Debit)
POST /mandates/:id/collect
4. Webhooks/collection.success​
/collection.failed
5. Transaction Lookup
GET /transactions/:id
6. Mandate Deactivation
POST /mandates/:id/deactivate
These are sufficient for Kore’s non-custodial model.
11. WEBHOOK STRATEGY & IDEMPOTENCY
Every webhook event must be:
●​ Verified​
●​ Logged​
●​ Idempotent​
●​ Mapped to an orchestrated intent​
Tables to support idempotency:
●​ webhook_events​
●​ orchestration_runs​
●​ transaction_attempts​
●​ ledger_entries​
12. KORE PARTNER INTEGRATION LAYERThis layer has abstractions for:
●​ Savings provider​
●​ Rent escrow provider​
●​ Investment companies​
●​ Loan companies​
●​ Utility companies​
●​ Pension fund administrators​
Kore never integrates vendor-specific logic in business code — all partners conform to a shared
internal interface.
13. INTERNAL LEDGER & AUDIT TRAIL
Even though Kore is non-custodial, we maintain a full ledger.
Ledger entries include:
●​ Debit attempts​
●​ Successful debits​
●​ Failed debits​
●​ Partner transfers​
●​ Exceptions​
●​ Reconciliations​
The ledger is immutable.14. SECURITY & COMPLIANCE
ARCHITECTURE
Kore requires:
●​ JWT auth​
●​ AES-256 encrypted PII​
●​ HTTPS mandatory​
●​ Role-based access​
●​ Mandate consent logs​
●​ Audit logging​
●​ Rate limiting​
●​ Webhook signature verification​
●​ PCI-DSS alignment (no card handling)​
15. SCALABILITY & RELIABILITY STRATEGY
We scale using:
●​ Django monolith (initial)​
●​ PostgreSQL + read replica​
●​ Redis caching & queues​
●​ Horizontal backend scaling​
●​ Circuit breakers for partner APIs​●​ Background retries​
●​ Dead-letter queues​
16. FUTURE EXPANSION — OPEN BANKING
Once reliable, Kore will:
●​ Connect to Open Banking aggregators​
●​ Enable balance-based triggers​
●​ Enable income detection​
●​ Pull bank statements automatically​
●​ Build stronger ML models​
17. SEQUENCE DIAGRAMS
Below are simplified diagrams.
Savings Execution Diagram
Rule Engine → Orchestrator → PWA.collect → Webhook.success → Partner.Savings → Ledger →
User Notification
Loan Repayment Diagram
Rule Engine → Orchestrator → PWA.collect → Webhook → Lender API → LedgerInvestment Diagram
User Intent → Rule Engine → Orchestrator → PWA.collect → Webhook → Investment API → Ledger
→ Portfolio Update