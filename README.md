SafeGuard Bank
==============

A safety-first banking prototype that helps older adults and digitally inexperienced customers slow down under pressure, understand why a payment may be risky, and involve someone they trust before money leaves the account.

Repository: https://github.com/sandeep200207/SafeGuardBank

Overview
--------

Digital financial fraud often relies on urgency, impersonation, secrecy, and confusing technical language. SafeGuard Bank presents a calmer banking experience: it explains warning signs in plain language, pauses suspicious transfers, offers a trusted-guardian workflow, and provides a message scanner for suspicious SMS, email, chat, and link text.

This repository contains a hackathon prototype. It does not connect to a live bank, move real money, or provide production-grade authentication or fraud guarantees.

Personas and product flows
--------------------------

Margaret: protected customer
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Margaret sees a simplified banking dashboard with an available balance, safety score, recent activity, clear primary actions, and a visible panic control. Simple Mode increases the visual emphasis of controls, uses larger typography, and reduces cognitive load. Read-aloud buttons use the browser Web Speech API when available.

When Margaret starts a payment, SafeGuard evaluates signals including a new payee, an unusually large amount, a late-night transaction, repeated transfers, suspicious payment-note language, and answers to scam-check questions. The review explains the contributing reasons and offers choices to cancel, wait, involve a guardian, or block the payment.

Priya: trusted guardian
~~~~~~~~~~~~~~~~~~~~~~

The guardian view shows pending high-risk payments with the amount, payee, score, and reasons. Priya can approve or block a pending payment, call Margaret, and review intervention history. The demo stores transaction decisions in browser `localStorage`; the browser storage event synchronizes the customer and guardian views across tabs on the same origin.

Fraud analyst: operations view
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The analyst view presents seeded demonstration metrics for protected money, threats blocked, average risk score, guardian interventions, scam-pattern frequency, a seven-day interception trend, and recent intervention activity. These values illustrate the operational concept; they are not connected to live bank data.

Safety flow
-----------

1. The customer enters a payee, account identifier, amount, and optional note.
2. A deterministic TypeScript risk engine scores the payment from 0 to 100 and assigns a Safe, Caution, High Risk, or Blocked tier.
3. The interface explains the reasons rather than presenting an opaque decision.
4. Scam-check questions can add context about phone pressure, secrecy, or urgency.
5. The customer can cancel, pause, block, or request guardian involvement.
6. A second browser tab can act as the guardian and approve or block the held payment.
7. The analyst view records the intervention in the demo's seeded operational narrative.

Message scanner
---------------

The message scanner accepts pasted message or link text and applies deterministic patterns for urgency, account-blocking threats, requests for OTP, PIN, or passwords, prize and lottery language, secrecy, and shortened links such as `bit.ly` or `tinyurl.com`. It returns a Safe, Suspicious, or Dangerous verdict and displays the phrases that triggered the result. It runs locally and does not require an API key.

Accessibility and safety design
-------------------------------

The prototype uses short, non-blaming safety copy and makes the pause action prominent. Simple Mode provides larger controls, stronger contrast, and a simpler presentation. Read-aloud controls use `speechSynthesis` in browsers that support the Web Speech API. The panic action pauses outgoing demo payments and explains that the customer has time to think and contact someone trusted.

Technology and architecture
---------------------------

- React 19, TypeScript, Vite, Wouter, Tailwind CSS, Lucide icons, and reusable Radix-style UI components power the client.
- `client/src/App.tsx` contains the customer, guardian, and analyst demo routes and role flows.
- `shared/safeguard.ts` contains the pure risk-scoring and message-scanning functions.
- Browser `localStorage` and the storage event provide demo persistence and cross-tab synchronization.
- The repository includes the Node.js, Express, tRPC, Drizzle ORM, and MySQL configuration scaffold for future server-backed features.
- Optional server-side LLM helpers read `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` from the environment. They are not required by the current demo flow.

Local setup
-----------

Requirements: Node.js 20 or newer and pnpm 10 or newer.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite, normally `http://localhost:3000`.

To build and run the production bundle locally:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The demo does not require database credentials or external service credentials. Do not commit `.env` files or secret values. The optional database command is intended for future server-backed work:

```bash
pnpm db:push
```

Demo walkthrough
----------------

1. Open the customer view as Margaret and review the safety score, panic control, and recent activity.
2. Select the payment rehearsal or open Send money. Submit the pre-filled payment to `Officer James — Tax Dept` for `₹45,000` with the note `urgent penalty fee`.
3. Review the new-payee, unusual-amount, urgency-language, and late-night signals. Answer the phone-pressure and secrecy questions to escalate the result to Blocked.
4. Open Scan a message and inspect the sample account-blocking, OTP, urgency, and shortened-link warnings.
5. Open a second tab as Priya, review the pending payment, and approve or block it. Observe the cross-tab update.
6. Open the Fraud Analyst view to review the seeded protection metrics and intervention history.
7. Return to Margaret and use the panic control to demonstrate the outgoing-payment freeze.

Validation
----------

```bash
pnpm test
pnpm check
pnpm build
```

The test suite covers the risk engine, coercion escalation, automatic blocking, dangerous-message detection, safe-message detection, and the scaffold logout behavior.

Limitations and future improvements
-----------------------------------

The current prototype uses seeded users, balances, transactions, and analyst metrics. It does not implement real account authentication, role-based authorization, payment-rail integration, server-side transaction persistence, secure balance updates, production audit logging, or a regulated fraud-decision process. The next production steps would be to move transaction creation, risk evaluation, guardian decisions, and audit history into authenticated server procedures backed by a database; add strong authorization and audit controls; integrate approved fraud signals; and conduct accessibility, security, and financial-compliance reviews.

Project map
-----------

- `client/src/App.tsx`: primary demo routes, role flows, safety interventions, and demo persistence.
- `client/src/index.css`: visual system, responsive layouts, Simple Mode, and status states.
- `shared/safeguard.ts`: deterministic risk engine and message scanner.
- `server/safeguard-demo.test.ts`: safety-engine and scanner tests.
- `server/auth.logout.test.ts`: authentication scaffold regression test.
- `docs/COMPONENT_MAP.md`: screen and component responsibilities.
- `docs/DEMO_SCRIPT.md`: short presentation script.
- `docs/TECHNICAL_NOTES.md`: architecture decisions, safety choices, and limitations.
