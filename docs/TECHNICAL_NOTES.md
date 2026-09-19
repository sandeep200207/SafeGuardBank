# Technical Notes and Scope

## Architecture

The submission uses React, TypeScript, Vite, Tailwind CSS, Lucide icons, Recharts-style SVG visualization, Wouter routing, and the full-stack WebDev scaffold with Drizzle and server support available. The customer, guardian, and analyst views are kept in one demo application so judges can move between roles quickly.

The risk engine is a pure TypeScript function. It scores flagged payees, new payees, unusual amounts, balance percentage, late-night timing, urgency keywords, transfer velocity, frozen transfers, and scam-check answers. Scores map to Safe, Caution, High Risk, or Blocked tiers. The message scanner uses deterministic patterns so it works without network access or an API key.

## Demo persistence

For this hackathon handoff, transaction outcomes are stored in browser `localStorage`. The browser `storage` event synchronizes updates between tabs on the same origin. This makes the customer-to-guardian demo reliable on a single laptop while keeping the project free of secrets and external service dependencies.

## Deliberate limitations

This is not a live banking product. It does not connect to a payment rail, store real account balances, implement production authentication, or claim that an AI model has made a fraud decision. The balance, users, transactions, and analyst numbers are demo data. The safe next production step would be to move transaction creation, risk evaluation, and guardian decisions into server-side procedures backed by a database, then add role-based authentication and audit logging.

## Accessibility and safety choices

Simple Mode switches to an accessibility-oriented font, larger controls, stronger contrast, and simpler action presentation. Read-aloud controls use the browser Web Speech API. Safety copy avoids blame, uses short sentences, and explains that legitimate banks do not ask customers to move money to protect it. The interface labels itself as a demo environment and does not imply that real money is moving.
