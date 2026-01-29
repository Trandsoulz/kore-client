KORE Updated Funds Flow (Settlement +
Post-Settlement Disbursement Model)
(Technical Architecture Description)
1. Overview
Kore operates a rule-based mandate-driven automated allocation system powered by
PayWithAccount. Due to PayWithAccount’s natural collection flow (source account → settlement
account), Kore adopts a single-settlement + post-settlement disbursement architecture.
Under this model:
●​ Kore initiates a collection (debit) from the user’s bank account using an active
mandate.
●​ PayWithAccount settles the full amount into Kore’s designated settlement account.
●​ After settlement is confirmed via webhook, Kore executes multi-pocket routing through
disbursement operations into the user’s configured financial buckets (savings, rent,
loans, tax, etc.).
●​ Kore retains its service fee from each collection event.
This architecture ensures Kore can support multi-bucket splitting even when splitting is not
supported mid-flight inside PayWithAccount’s collection lifecycle.
2. End-to-End Flow (Step-by-Step)
Step 1 — Mandate Setup
1.​ User links a bank account during onboarding.
2.​ Kore initiates managed mandate creation via PayWithAccount.
3.​ Once the user authorizes the mandate, the mandate becomes ACTIVE.
4.​ Kore stores mandate metadata in the database (mandate_id, bank, max debit limit,
status, expiry).
Step 2 — Rule Engine Generates an Allocation PlanOn a configured schedule or trigger event:
1.​ Kore executes the user’s rules.
2.​ Kore generates a Collection Intent (planned debit event), including:
○​ total debit amount (bucket total + Kore service fee)
○​ breakdown allocations by financial bucket
○​ correlation reference ID
○​ routing configuration
Example:
●​
●​
●​
●​
Savings: ₦30,000
Loan: ₦50,000
Rent: ₦20,000
Service fee: ₦300​
Total collection amount: ₦100,300
Step 3 — Kore Executes Collection via PayWithAccount
Kore calls PayWithAccount’s collection endpoint with:
●​
●​
●​
●​
mandate_id
amount = total debit amount (including service fee)
external reference (unique)
metadata payload (optional)
PayWithAccount debits the user’s bank account and settles the collected funds to Kore’s
settlement account.
Step 4 — PayWithAccount Settles Funds to Kore Settlement Account
PayWithAccount performs settlement:
●​ Source: user bank account (mandated)
●​ Destination: Kore settlement account (single destination)
At this point, Kore has temporary custody of pulled funds, enabling post-settlement splitting.
Step 5 — Kore Receives Settlement Confirmation WebhookPayWithAccount sends a webhook to Kore indicating:
●​
●​
●​
●​
●​
collection status (SUCCESS/FAILED)
amount settled
external reference
settlement timestamp
transaction reference identifiers
Kore uses the webhook data to confirm that funds were actually received.
Step 6 — Kore Runs Post-Settlement Allocation (Disbursement Phase)
Once settlement is confirmed:
1.​ Kore marks the collection intent as SETTLED.
2.​ Kore separates the service fee component.
3.​ Kore initiates disbursements to partner buckets based on the allocation plan.
Disbursement executes transfers such as:
●​
●​
●​
●​
Kore Settlement → Savings partner account
Kore Settlement → Lender repayment account
Kore Settlement → Rent escrow partner
Kore Settlement → Tax reserve account
Step 7 — Kore Ledgering and Reconciliation
Each stage is recorded in Kore’s internal ledger as:
●​
●​
●​
●​
●​
●​
“debit initiated”
“settlement confirmed”
“service fee retained”
“disbursement executed”
“allocation completed”
“allocation failed / retry scheduled”
This allows Kore to support:
●​
●​
●​
●​
audit trails
retries
dispute resolution
partner reconciliation3. How Kore Identifies the Correct
Customer for Every Settlement Inflow
3.1 The Core Principle
Kore ensures that:
Every collection is created with a unique external reference​
The same reference is received back in the webhook​
Kore uses the reference to resolve:
●​
●​
●​
●​
which customer
which mandate
which rule execution
which financial buckets to fund
3.2 The Required Identifier: collection_reference
For every PayWithAccount collection request, Kore generates a unique reference:
Recommended Reference Format
KORE-{environment}-{user_id}-{intent_id}-{timestamp}
Example:
KORE-PROD-8217-INTENT_55001-20260116T143012Z
This reference becomes the primary key that links:
●​
●​
●​
●​
user
rule execution
settlement inflow
disbursement plan3.3 Data Model (What Kore Stores Before Calling Collect)
Table: collection_intents
Each collect attempt is logged BEFORE the API call is made.
Fields:
●​ intent_id (UUID)
●​ user_id
●​ mandate_id
●​ collection_reference (unique)
●​ total_amount
●​ service_fee_amount
●​ allocation_breakdown (JSON)
●​ status = PENDING / INITIATED / SETTLED / FAILED
●​ created_at
●​ scheduled_for
Example allocation breakdown:
{
"savings": 30000,
"loan_repayment": 50000,
"rent": 20000
}
3.4 Settlement Webhook Handling
When PayWithAccount sends settlement confirmation:
Webhook includes:
●​ collection_reference
●​ status
●​ settled_amount
●​ transaction_id
Kore then runs:1.​ Lookup collection_intents using collection_reference
2.​ Confirm amounts match expected
3.​ Confirm status transition rules
4.​ Mark settled
5.​ Trigger disbursement job
3.5 Idempotency and Safety
Webhooks can be delivered multiple times.
Therefore Kore enforces:
Only one settlement record per collection_reference​
Only one disbursement execution per intent
Implementation:
●​ a unique database constraint on collection_reference
●​ a disbursement “lock” key
●​ status transitions must be atomic
Example:
●​ If status is already SETTLED, ignore duplicate webhook.
●​ If disbursement already processed, do not repeat transfers.
4. Service Fee Handling
Kore’s collection includes both:
●​ customer allocation amount
●​ Kore’s service fee amount
Total collected:
total_amount = allocations_total + kore_service_fee4.1 Service Fee Accounting
To avoid mixing user funds with revenue:
Kore maintains two accounts:
Account A — Kore’s Settlement Account
Temporary inflow holding account for customer funds + fee.
Account B — Kore’s Revenue Account
Permanent account for fees only.
4.2 Technical Fee Separation Flow
After settlement confirmation:
Kore computes:​
1.​ alloc_amount = total_amount - service_fee
2.​ Kore transfers:
○​ service fee → Kore revenue account
3.​ Kore disburses:
○​ alloc_amount → bucket destinations
4.3 Why We Must Separate Fee Immediately
This prevents:
●​
●​
●​
●​
revenue mixing with customer routed funds
accounting disputes
operational confusion
compliance red flags
It also allows clean reporting:
●​ fee revenue by customer
●​ fee revenue by bucket
●​ cost per collection●​ net margin per user
5. Practical Example End-to-End
Kore Rules Output:
●​ Savings: ₦20,000
●​ Loans: ₦70,000
●​ Tax: ₦10,000​
Service Fee: ₦300​
Total: ₦100,300
Kore calls PayWithAccount Collect:
amount = ₦100,300​
reference = KORE-PROD-8217-INTENT_55001-20260116T143012Z
Settlement Webhook arrives:
Reference found → intent resolved → user identified.
Kore executes:
●​ Move ₦300 → Kore Revenue Account
●​ Disburse ₦100,000 across configured buckets
All tied to the same intent record.
6. Summary
Updated Kore Model is now:
Mandate → Collect → Settlement to Kore​
Kore identifies inflow by unique reference​
Kore splits post-settlement via disbursement​
Kore retains service fee​
Kore logs everything in an internal ledger