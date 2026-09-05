# 🚀 ReviveFlow

> **Turning failed subscription payments into automated revenue retention with multi-agent AI.**

ReviveFlow is an AI-powered payment recovery system designed to reduce **involuntary churn** in recurring billing. It intercepts failed subscription payments in real time, understands the failure context and customer persona, generates a personalized recovery message, verifies it through an independent policy layer, and delivers a frictionless payment retry link.

---

## 📌 Overview

Recurring billing failures caused by bank timeouts, insufficient funds, mandate friction, and similar issues can result in otherwise recoverable subscribers being lost.

Traditional recovery workflows often depend on generic, delayed emails that customers ignore.

**ReviveFlow takes a real-time, context-aware approach:**

- ⚡ Processes payment failures asynchronously with a Redis-backed queue
- 🔐 Masks and hashes PII before it reaches the AI layer
- 🤖 Uses a multi-agent **Generator → Verifier** pipeline
- 💬 Generates empathetic, context-aware messages, including localized communication such as Hinglish
- 🔗 Creates dynamic Razorpay retry links
- 📧 Sends recovery messages through the Resend HTTPS API
- 📊 Provides merchants with real-time telemetry, AI confidence scores, and audit logs

### 🎯 Goal

**Recover revenue that would otherwise be lost to preventable subscription payment failures while keeping the customer experience secure, respectful, and low-friction.**

---

## ✨ Key Features

### 1. ⚡ Decoupled Webhook Ingestion

Razorpay `payment.failed` webhooks are acknowledged immediately and pushed into an **Upstash Redis queue** for asynchronous processing.

This keeps the webhook endpoint lightweight and resilient during high billing traffic.

**Flow:**

```text
Razorpay Webhook
       ↓
Signature Validation
       ↓
Redis Queue
       ↓
HTTP 2xx Response
       ↓
Background Worker
```

---

### 2. 🔐 Privacy-First AI Processing

Before customer information is passed to the AI layer:

- Personally Identifiable Information (PII) is removed or masked
- Relevant identifiers are cryptographically hashed using **SHA-256**
- The AI layer receives only the information required for recovery reasoning

This creates a privacy boundary between raw payment data and AI processing.

---

### 3. 🤖 Multi-Agent AI Pipeline

ReviveFlow uses an **Actor-Critic-inspired Generator → Verifier architecture**.

#### Generator Agent

Analyzes:

- Payment failure reason
- Failure persona/context
- Customer communication context
- Appropriate tone and localization

It then generates a personalized recovery message.

#### Verifier Agent

An independent policy layer evaluates the generated message for:

- Tone safety
- Policy compliance
- Non-coercive language
- Recovery relevance
- Overall confidence

Only messages that pass the verification layer proceed to delivery.

```text
                    ┌──────────────────┐
                    │ Payment Failure  │
                    └────────┬─────────┘
                             ↓
                    ┌──────────────────┐
                    │ Generator Agent  │
                    └────────┬─────────┘
                             ↓
                    ┌──────────────────┐
                    │ Verifier Agent   │
                    └────────┬─────────┘
                             ↓
                    ┌──────────────────┐
                    │ Approved Message │
                    └──────────────────┘
```

---

### 4. 💬 Context-Aware Recovery Messaging

Instead of sending the same generic payment reminder to every customer, ReviveFlow adapts the message to the failure context.

For example:

| Failure Context | Recovery Approach |
|---|---|
| Insufficient funds | Helpful, non-judgmental reminder |
| Bank timeout | Reassurance and retry suggestion |
| Mandate friction | Clear explanation and next step |
| Temporary gateway issue | Encourage retry after the issue resolves |

Messages can also support localized communication styles such as **Hinglish**.

---

### 5. 🔗 Frictionless Payment Recovery

For eligible failed payments, ReviveFlow generates a dynamic **Razorpay payment link** and embeds it directly into the recovery message.

This reduces the number of steps required for a customer to complete payment.

```text
Recovery Message
       ↓
One-click Retry Link
       ↓
Razorpay Checkout
       ↓
Subscription Recovered
```

---

### 6. 📧 HTTPS-Based Communication Delivery

Recovery emails are dispatched through the **Resend API over HTTPS** rather than relying on direct SMTP connections.

This simplifies cloud deployment and avoids common SMTP port restrictions in hosted environments.

---

### 7. 📊 Merchant War Room

A **Next.js dashboard** provides merchants with visibility into the recovery pipeline.

It includes:

- Real-time payment recovery telemetry
- AI confidence scores
- Recovery status
- Processing events
- Immutable audit logs
- Decision-tree visibility

---

## 🏗️ System Architecture

```text
                         ┌─────────────────┐
                         │    Razorpay     │
                         │ Payment Gateway │
                         └────────┬────────┘
                                  │
                           payment.failed
                                  │
                                  ↓
                    ┌─────────────────────────┐
                    │   Node.js / Express     │
                    │  Webhook + Validation   │
                    └────────────┬────────────┘
                                 │
                                 ↓
                    ┌─────────────────────────┐
                    │      Upstash Redis       │
                    │      Message Queue       │
                    └────────────┬────────────┘
                                 │
                                 ↓
                    ┌─────────────────────────┐
                    │    Background Worker    │
                    └────────────┬────────────┘
                                 │
                         PII Sanitization
                                 │
                                 ↓
                    ┌─────────────────────────┐
                    │       Gemini AI         │
                    │     Generator Agent     │
                    └────────────┬────────────┘
                                 │
                                 ↓
                    ┌─────────────────────────┐
                    │     Verifier Agent      │
                    │   Policy + Confidence   │
                    └────────────┬────────────┘
                                 │
                     ┌───────────┴───────────┐
                     ↓                       ↓
            ┌─────────────────┐     ┌─────────────────┐
            │    Razorpay     │     │     Resend      │
            │ Payment Link    │     │   Email API     │
            └────────┬────────┘     └────────┬────────┘
                     │                       │
                     └───────────┬───────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │       PostgreSQL        │
                    │  Audit Logs + Telemetry │
                    └────────────┬────────────┘
                                 │
                                 ↓
                    ┌─────────────────────────┐
                    │     Next.js Dashboard   │
                    │     Merchant War Room   │
                    └─────────────────────────┘
```

---

## 🚀 End-to-End Pipeline

### 1. Trigger

A customer subscription payment fails.

Razorpay sends a:

```text
payment.failed
```

webhook to the ReviveFlow backend.

### 2. Ingest

The Express server:

1. Validates the Razorpay webhook signature
2. Pushes the event into Redis
3. Immediately acknowledges the webhook

### 3. Process

A background worker consumes the queued event and sanitizes sensitive customer information.

### 4. Reason

The sanitized failure context is passed to the Gemini Generator Agent, which determines the appropriate recovery strategy and message.

### 5. Verify

The Verifier Agent evaluates the generated message against safety and policy rules and assigns a confidence score.

### 6. Execute

For an approved recovery:

1. A dynamic Razorpay payment link is generated
2. The link is embedded into the recovery message
3. Resend delivers the email through its HTTPS API

### 7. Audit

Processing decisions, verification results, confidence scores, and relevant events are recorded in PostgreSQL for merchant visibility and auditing.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Frontend Hosting | Vercel |
| Backend | Node.js + Express |
| Backend Hosting | Render |
| Database | PostgreSQL |
| Database Platform | Supabase |
| ORM | Prisma |
| Connection Pooling | Supabase Transaction Pooler / PgBouncer |
| Message Queue | Redis |
| Queue Platform | Upstash |
| AI | Google Gemini API |
| Payment Gateway | Razorpay |
| Email Delivery | Resend |
| Privacy | SHA-256 hashing |

---

## 📁 Project Structure

```text
ReviveFlow/
│
├── client/                 # Next.js frontend
│   ├── app/
│   ├── components/
│   └── ...
│
├── server/                 # Node.js / Express backend
│   ├── controllers/
│   ├── routes/
│   ├── workers/
│   ├── services/
│   ├── prisma/
│   └── ...
│
├── README.md
└── ...
```

> The exact structure may vary depending on the current implementation.

---

# 💻 Local Setup

## Prerequisites

Make sure you have installed:

- Node.js 18+
- npm
- Git
- A Supabase PostgreSQL database
- An Upstash Redis database
- Razorpay account/API credentials
- Google Gemini API key
- Resend API key

---

## 1. Clone the Repository

```bash
git clone https://github.com/NidhiMBhat/ReviveFlow.git
cd ReviveFlow
```

---

## 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000

DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

REDIS_URL="rediss://default:[password]@[upstash-url]:6379"

RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."

GEMINI_API_KEY="..."

RESEND_API_KEY="..."

FRONTEND_URL="http://localhost:3000"
```

Start the backend:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
```

Create `.env.local` inside the `client` directory:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
```

Start the frontend:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend

| Variable | Description |
|---|---|
| `PORT` | Express server port |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `REDIS_URL` | Upstash Redis connection URL |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verification secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `RESEND_API_KEY` | Resend API key |
| `FRONTEND_URL` | Frontend origin |

### Frontend

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public/test key ID |

> **Never commit `.env` or `.env.local` files to GitHub.** Add them to `.gitignore`.

---

## 🔒 Security Considerations

ReviveFlow is designed with security and privacy in mind:

- Razorpay webhook signatures are validated before processing
- PII is sanitized before AI processing
- SHA-256 is used for cryptographic hashing where required
- Secrets are stored in environment variables
- AI-generated content passes through an independent verification layer
- Payment links are generated through Razorpay APIs rather than constructed manually
- Processing decisions are recorded for auditing

---

## 📈 Why ReviveFlow?

Traditional payment recovery:

```text
Payment Failure
      ↓
Wait
      ↓
Generic Email
      ↓
Customer Has To Find Payment Page
      ↓
High Friction
      ↓
Potential Churn
```

ReviveFlow:

```text
Payment Failure
      ↓
Real-time Webhook
      ↓
Async Processing
      ↓
PII Sanitization
      ↓
AI Context Analysis
      ↓
Generator Agent
      ↓
Verifier Agent
      ↓
Dynamic Retry Link
      ↓
Personalized Recovery Message
      ↓
Lower Friction
      ↓
Revenue Recovery
```

---

## 🎯 Future Improvements

Potential extensions include:

- 📱 WhatsApp/SMS recovery channels
- 🧠 Reinforcement learning from successful recovery outcomes
- 📊 Recovery-rate and revenue-impact analytics
- 🌍 Additional regional languages
- 🔄 Automated retry timing optimization
- 🎯 Customer-level recovery strategy selection
- 🛡️ More granular policy controls for merchants
- 📈 A/B testing of recovery messaging strategies

---

## 🏆 Project Highlights

**ReviveFlow combines event-driven backend architecture, payment infrastructure, privacy-aware AI, and autonomous decision-making into a single revenue recovery pipeline.**

The core idea is simple:

> **Don't just tell customers that a payment failed — understand why it failed, communicate appropriately, and make recovery as frictionless as possible.**

---

## 👩‍💻 Author

**Nidhi Mahesh Bhat**

GitHub: [@NidhiMBhat](https://github.com/NidhiMBhat)

---

## 📄 License

Add your preferred license here, such as MIT, if applicable.
