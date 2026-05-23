# Lead Distribution System - System Architecture & Setup Guide

## 1. Setup Instructions

The application is built using Next.js 14 (App Router), TypeScript, Prisma ORM, and PostgreSQL. It is designed to be easily deployable to Vercel and any Postgres provider (like Neon or Supabase).

### Local Development
1. **Install Dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```
2. **Configure Environment:**
   Create a `.env` file in the root directory and add your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@host/database"
   ```
3. **Initialize Database & Seed Data:**
   Push the Prisma schema to the database and populate it with initial Services, Providers, and Allocation States.
   ```bash
   npx prisma db push --accept-data-loss
   npm run prisma:seed
   ```
4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

---

## 2. Allocation Algorithm

The system features an advanced, fair, and rule-based allocation engine. Every time a new lead requests a service, the system must assign exactly 3 providers based on strict routing rules.

### Core Logic:
1. **Validation & De-duplication:** The engine first checks if the lead's phone number already exists for the requested service. If so, it immediately rejects the lead to prevent duplicate charging or spam.
2. **Mandatory Providers:** The engine identifies the mandatory providers for the requested service (e.g., Service 1 requires Provider 1). It checks if they have available quota and selects them first.
3. **Round-Robin Pool Selection:** To fill the remaining slots (up to 3 total), the engine iterates through the service's specific pool of providers in a round-robin fashion.
   - It tracks the `lastProviderId` to ensure fair, sequential distribution among pool members.
   - It skips any providers whose quota has been exhausted.
4. **Quota Deduction:** Once the providers are finalized, their respective monthly quotas are deducted, and the lead assignments are recorded.

---

## 3. Concurrency Safety & Row-Level Locking

In a production environment, hundreds of leads might request a service at the exact same millisecond. To prevent race conditions (where multiple leads are assigned to the same provider before their quota is updated), the system utilizes strict database-level concurrency controls.

### Implementation Details:
- **Prisma Interactive Transactions:** The entire allocation algorithm runs within an ACID-compliant transaction (`prisma.$transaction`).
- **PostgreSQL \`FOR UPDATE\` Locks:** When the engine queries the `AllocationState` (to get the last round-robin index) and the `Provider` tables (to check quotas), it uses raw SQL `SELECT ... FOR UPDATE`.
- **Serialization:** This row-level lock forces concurrent requests to line up sequentially. If 10 requests hit the server simultaneously, Request 2 will patiently wait for Request 1 to finish allocating and deducting quotas before it reads the new, accurate quota values.
- **Transaction Timeouts:** The interactive transaction is configured with extended `maxWait` and `timeout` limits to comfortably handle high-concurrency queuing without dropping requests.

---

## 4. Webhook Idempotency

Webhooks are notoriously unreliable—they can be delayed, dropped, or sent multiple times for the same event (at-least-once delivery). To ensure that a "Reset Quota" webhook doesn't accidentally reset a provider's quota multiple times if duplicated, the endpoint is designed to be **strictly idempotent**.

### Implementation Details:
- **Event Tracking Table:** The database features a `WebhookEvent` table dedicated to tracking processed webhooks by their unique `eventId`.
- **Atomic Processing:** When a webhook payload is received, the system opens a transaction and attempts to insert the `eventId` into the `WebhookEvent` table.
- **Unique Constraint Rejection:** If the `eventId` already exists, the transaction identifies it as a duplicate and safely ignores the request, returning a `200 OK` so the sender stops retrying.
- **State Guarantee:** This ensures that no matter how many times the same webhook is fired concurrently, the provider's quota is only reset exactly once per unique event.
