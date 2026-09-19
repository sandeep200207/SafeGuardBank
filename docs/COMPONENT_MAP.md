# Component and Feature Map

## Application entry points

| Path | Responsibility |
|---|---|
| `client/src/App.tsx` | Main React application, routes, demo roles, customer flow, guardian flow, analyst flow, local persistence, and reusable UI components |
| `client/src/index.css` | Visual system, responsive layouts, Simple Mode styling, status colors, gauges, cards, and mobile navigation |
| `client/index.html` | Page metadata, title, theme color, and root mount point |

## Customer experience

- `/home` presents the protected balance, safety score, recent activity, panic button, and judging story panel.
- `/send` collects a payee, amount, and note using a pre-filled high-risk demo payment.
- `/send/review` presents the Pause & Protect intervention, risk gauge, reasons, Scam Check questions, cooling-off action, guardian action, and block/cancel actions.
- `/transactions` shows completed, held, awaiting guardian, cancelled, and blocked outcomes.
- `/scan` detects suspicious urgency, blocked-account, OTP, PIN, prize, and shortened-link patterns.
- `/ask` provides a calm guardian-style assistant with suggested questions and read-aloud responses.
- `/practice` contains three short scam-spotting scenarios.
- `/notifications` contains plain-language safety alerts.
- `/profile` contains Simple Mode, cooling-off, trusted contact, behavioral baseline, and safety badges.

## Supporting views

- `/guardian` shows pending payments, risk reasons, approval/block actions, call action, and intervention history.
- `/analyst` shows protected-money KPIs, scam-pattern bars, seven-day interception trend, and recent intervention records.

## Reusable logic and tests

- `shared/safeguard.ts` contains the pure risk-scoring and message-scanning functions.
- `server/safeguard-demo.test.ts` covers high-risk scoring, coercion escalation, automatic blocking, dangerous-message detection, and safe-message detection.
- `server/auth.logout.test.ts` is the scaffold authentication regression test.
