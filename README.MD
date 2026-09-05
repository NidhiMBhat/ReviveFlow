🚀 ReviveFlow
Transforming failed subscription payments into automated revenue retention through multi-agent AI.

📌 Overview
In recurring billing models, involuntary churn (failed payments due to bank timeouts, insufficient funds, or e-mandate friction) accounts for up to 40% of lost subscribers. Traditional recovery systems rely on rigid, robotic emails sent days later, which customers routinely ignore.

ReviveFlow intercepts failed transactions in real-time and routes them through a decoupled, multi-agent AI pipeline. Instead of generic alerts, it analyzes the specific failure context and customer persona to generate an empathetic, context-aware recovery message (supporting localized dialects like Hinglish). Embedded with a dynamic, one-click retry link, ReviveFlow eliminates friction and securely salvages lost revenue.

✨ Key Features
Decoupled Webhook Ingestion: Razorpay webhooks are immediately dropped into an in-memory Redis queue (Upstash). This guarantees sub-50ms HTTP acknowledgments and prevents dropped events during massive billing traffic spikes.

DPDP-Compliant Privacy Layer: All Personally Identifiable Information (PII) is masked and cryptographically hashed (SHA-256) before any payload reaches the AI layer.

Multi-Agent AI Pipeline (Actor-Critic):

Generator Agent: Analyzes the failure persona (e.g., bank outage vs. insufficient funds) and synthesizes empathetic, targeted copy.

Verifier Agent: An independent policy engine that scores the generated output for compliance, non-coercion, and tone safety.

Frictionless Payment Links: Automatically hits the Razorpay API to generate live, dynamic short-links (rzp.io) embedded directly in the outreach.

Firewall-Bypassing Delivery: Dispatches recovery communications over HTTPS via the Resend API, guaranteeing 100% deliverability by bypassing cloud SMTP port restrictions.

Merchant War Room: A Next.js dashboard providing real-time telemetry, AI confidence scores, and immutable audit logs via PostgreSQL.

🏗️ Architecture & Tech Stack
Frontend: Next.js (Deployed on Vercel)

Backend: Node.js / Express (Deployed on Render)

Database: PostgreSQL via Supabase (Utilizing IPv4 Transaction Pooler / PgBouncer on port 6543)

ORM: Prisma

Message Queue: Redis via Upstash

Intelligence: Google Gemini API (Gemini 3.6 Flash)

Integrations: Razorpay (Gateway & Webhooks), Resend (HTTP Email API)

🚀 How It Works (The Pipeline)
Trigger: Customer transaction fails; Razorpay fires a payment.failed webhook.

Ingest: Express backend validates the signature and enqueues the job in Redis.

Process: Background worker polls the queue and sanitizes PII.

Reason: Gemini analyzes the failure and drafts a localized recovery strategy.

Verify: Policy engine approves the draft and assigns a confidence score.

Execute: Worker generates a dynamic Razorpay link and fires the email via Resend.

Audit: The entire decision tree is logged immutably in Supabase.

💻 Local Setup & Installation
1. Clone the repository

Bash
git clone https://github.com/NidhiMBhat/ReviveFlow.git
cd ReviveFlow
2. Backend Setup

Bash
cd server
npm install
Create a .env file in the server directory:

Code snippet
PORT=5000
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
REDIS_URL="rediss://default:[password]@[upstash-url]:6379"
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."
GEMINI_API_KEY="..."
RESEND_API_KEY="..."
FRONTEND_URL="http://localhost:3000"
Start the backend development server:

Bash
npm run dev
3. Frontend Setup

Bash
cd client
npm install
Create a .env.local file in the client directory:

Code snippet
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
Start the frontend development server:

Bash
npm run dev
