import { useEffect, useMemo, useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  FileSearch,
  Headphones,
  Home as HomeIcon,
  Landmark,
  LockKeyhole,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Plus,
  ScanLine,
  Send,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  UserRoundPlus,
  Users,
  Volume2,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { scanMessage } from "@shared/safeguard";
import "./index.css";

type Role = "customer" | "guardian" | "analyst";
type TxnStatus = "completed" | "held" | "awaiting" | "blocked" | "cancelled";

type Transaction = {
  id: string;
  payee: string;
  initials: string;
  amount: number;
  date: string;
  status: TxnStatus;
  score: number;
  reason: string;
  scamType?: string;
  owner?: string;
};

type ReviewTransaction = {
  id: string;
  payee: string;
  account: string;
  amount: number;
  note: string;
  score: number;
  tier: "caution" | "high" | "blocked";
  newPayee: boolean;
};

const seedTransactions: Transaction[] = [
  { id: "t1", payee: "Asha Groceries", initials: "AG", amount: 1280, date: "Today, 9:42 AM", status: "completed", score: 8, reason: "Usual payee" },
  { id: "t2", payee: "City Utilities", initials: "CU", amount: 2140, date: "Yesterday, 6:08 PM", status: "completed", score: 12, reason: "Regular monthly bill" },
  { id: "t3", payee: "Unknown UPI ID", initials: "?", amount: 45000, date: "Today, 11:48 PM", status: "awaiting", score: 85, reason: "New payee, large amount, urgent note", scamType: "Impersonation", owner: "Margaret" },
  { id: "t4", payee: "Wellness Pharmacy", initials: "WP", amount: 860, date: "Mon, 11:03 AM", status: "cancelled", score: 42, reason: "Unusual payment time" },
];

const DEMO_STORAGE_KEY = "safeguard-bank-demo-transactions";

function loadDemoTransactions(): Transaction[] {
  if (typeof window === "undefined") return seedTransactions;
  try {
    const saved = window.localStorage.getItem(DEMO_STORAGE_KEY);
    return saved ? JSON.parse(saved) as Transaction[] : seedTransactions;
  } catch {
    return seedTransactions;
  }
}

const navItems = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/send", label: "Send money", icon: Send },
  { href: "/scan", label: "Scan a message", icon: ScanLine },
  { href: "/ask", label: "Ask Guardian", icon: MessageCircle },
  { href: "/transactions", label: "Activity", icon: WalletCards },
  { href: "/profile", label: "Safety settings", icon: Settings2 },
];

const formatMoney = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    toast.info("Read aloud is not available in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function ReadAloud({ text, label = "Read this aloud" }: { text: string; label?: string }) {
  return (
    <button className="icon-button" aria-label={label} title={label} onClick={() => speak(text)}>
      <Volume2 size={17} />
    </button>
  );
}

function StatusBadge({ status }: { status: TxnStatus }) {
  const labels: Record<TxnStatus, string> = { completed: "Completed", held: "Held for safety", awaiting: "Awaiting guardian", blocked: "Blocked", cancelled: "Cancelled" };
  return <span className={`status-badge status-${status}`}><span className="status-dot" />{labels[status]}</span>;
}

function RiskGauge({ score, small = false }: { score: number; small?: boolean }) {
  const tone = score >= 90 ? "danger" : score >= 65 ? "high" : score >= 40 ? "caution" : "safe";
  const label = score >= 90 ? "Blocked" : score >= 65 ? "High risk" : score >= 40 ? "Caution" : "Safe";
  return (
    <div className={`risk-gauge ${small ? "risk-gauge-small" : ""}`}>
      <div className={`gauge-ring gauge-${tone}`} style={{ "--score": `${score * 1.8}deg` } as React.CSSProperties}>
        <div className="gauge-center"><strong>{score}</strong><span>/100</span></div>
      </div>
      <span className={`risk-label risk-${tone}`}>{label}</span>
    </div>
  );
}

function ReasonCard({ icon: Icon, title, text, tone = "neutral" }: { icon: typeof AlertTriangle; title: string; text: string; tone?: string }) {
  return <div className={`reason-card reason-${tone}`}><div className="reason-icon"><Icon size={18} /></div><div><strong>{title}</strong><p>{text}</p></div></div>;
}

function AppShell({ children, role, userName, simpleMode, setSimpleMode, onRoleSwitch, notificationCount }: { children: React.ReactNode; role: Role; userName: string; simpleMode: boolean; setSimpleMode: (value: boolean) => void; onRoleSwitch: (role: Role) => void; notificationCount: number }) {
  const [location] = useLocation();
  const isCustomer = role === "customer";
  const items = isCustomer ? navItems : role === "guardian" ? [{ href: "/guardian", label: "Guardian view", icon: Users }, { href: "/transactions", label: "Interventions", icon: ShieldAlert }, { href: "/profile", label: "My settings", icon: Settings2 }] : [{ href: "/analyst", label: "Overview", icon: BarChart3 }, { href: "/transactions", label: "Interceptions", icon: ShieldAlert }];
  return (
    <div className={`app-frame ${simpleMode ? "simple-mode" : ""}`}>
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><ShieldCheck size={22} /></div><div><strong>SafeGuard</strong><span>Bank</span></div></div>
        <div className="role-pill"><span className="role-avatar">{role === "customer" ? "M" : role === "guardian" ? "P" : "A"}</span><div><small>{role === "customer" ? "Protected account" : role === "guardian" ? "Trusted guardian" : "Bank operations"}</small><strong>{userName}</strong></div></div>
        <nav className="side-nav" aria-label="Main navigation">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={location === href ? "active" : ""}><Icon size={18} /><span>{label}</span>{href === "/guardian" && notificationCount > 0 && <b className="nav-count">{notificationCount}</b>}</Link>)}</nav>
        <div className="sidebar-bottom"><div className="safe-side-card"><ShieldCheck size={18} /><div><strong>Always watching</strong><span>Protection is on</span></div></div><button className="switch-user" onClick={() => onRoleSwitch("customer")}><ArrowLeft size={15} /> Switch demo user</button></div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div className="mobile-brand"><div className="brand-mark"><ShieldCheck size={19} /></div><strong>SafeGuard Bank</strong></div><div className="topbar-spacer" /><button className={`simple-toggle ${simpleMode ? "on" : ""}`} onClick={() => setSimpleMode(!simpleMode)}><span className="toggle-dot" /> Simple mode <span className="toggle-state">{simpleMode ? "On" : "Off"}</span></button><Link href="/notifications" className="notification-button" aria-label="Notifications"><Bell size={19} />{notificationCount > 0 && <span>{notificationCount}</span>}</Link><div className="top-avatar">{userName.slice(0, 1)}</div></header>
        <div className="content-wrap">{children}</div>
        <nav className="bottom-nav">{items.slice(0, 5).map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={location === href ? "active" : ""}><Icon size={19} /><span>{label.split(" ")[0]}</span></Link>)}</nav>
      </main>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action, speakText }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode; speakText?: string }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><div className="title-line"><h1>{title}</h1>{speakText && <ReadAloud text={speakText} />}</div>{description && <p>{description}</p>}</div>{action}</div>;
}

function HomePage({ onPanic, frozen, goToSend }: { onPanic: () => void; frozen: boolean; goToSend: () => void }) {
  return <>
    {frozen && <div className="freeze-banner"><div className="freeze-icon"><LockKeyhole size={19} /></div><div><strong>Outgoing payments are paused</strong><span>We are giving you time to think. Your money is safe.</span></div><button onClick={() => toast.success("Payments stay paused until the safety window ends.")}>Why?</button></div>}
    <PageHeader eyebrow="Tuesday, 19 September 2026" title="Good morning, Margaret" description="Your account is protected by your personal fraud guardian." speakText="Good morning, Margaret. Your account is protected by your personal fraud guardian." action={<div className="secure-chip"><ShieldCheck size={16} /> Protected now</div>} />
    <section className="hero-grid">
      <div className="balance-card"><div className="balance-top"><span>Available balance</span><button className="visibility-button" aria-label="Hide balance">•••</button></div><strong className="balance-value">₹84,620<span>.50</span></strong><div className="balance-bottom"><span><TrendingUp size={14} /> 4.2% this month</span><span>•• 2248</span></div></div>
      <div className="safety-card"><div className="safety-top"><div><span>Safety score</span><strong>92 <small>/ 100</small></strong></div><div className="safety-check"><Check size={18} /></div></div><div className="safety-bar"><span style={{ width: "92%" }} /></div><p>Strong protection. We checked 12 payments this week.</p><Link href="/profile">View your safety profile <ArrowRight size={14} /></Link></div>
    </section>
    <section className="quick-actions"><button className="primary-action" onClick={goToSend}><span className="action-icon"><Send size={20} /></span><span><strong>Send money</strong><small>Pay someone safely</small></span><ChevronRight size={18} /></button><Link href="/scan" className="secondary-action"><span className="action-icon scan-action"><ScanLine size={20} /></span><span><strong>Check a message</strong><small>Before you click or pay</small></span><ChevronRight size={18} /></Link></section>
    <button className="panic-card" onClick={onPanic}><div className="panic-pulse"><Phone size={21} /></div><div><strong>Someone is asking me to pay right now</strong><span>Tap to pause payments and call someone you trust</span></div><ArrowRight size={18} /></button>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Recent activity</span><h2>Your latest payments</h2></div><Link href="/transactions" className="text-link">See all <ArrowRight size={14} /></Link></div><div className="transaction-list">{seedTransactions.slice(0, 3).map(tx => <TransactionRow key={tx.id} tx={tx} />)}</div></section>
    <section className="care-card"><div className="care-icon"><Sparkles size={20} /></div><div><strong>Stay safe this week</strong><p>Banks never ask you to move money to “protect” it. When in doubt, pause and ask someone you trust.</p></div><ReadAloud text="Stay safe this week. Banks never ask you to move money to protect it. When in doubt, pause and ask someone you trust." /></section><DemoStory onStart={goToSend} />
  </>;
}

function TransactionRow({ tx }: { tx: Transaction }) {
  return <div className="transaction-row"><div className={`payee-avatar ${tx.status === "blocked" ? "avatar-alert" : ""}`}>{tx.initials}</div><div className="transaction-main"><strong>{tx.payee}</strong><span>{tx.date} · {tx.reason}</span></div><div className="transaction-amount"><strong>{formatMoney(tx.amount)}</strong><StatusBadge status={tx.status} /></div></div>;
}

function DemoStory({ onStart }: { onStart: () => void }) {
  return <section className="demo-story"><div className="demo-story-copy"><div className="eyebrow">Your judging moment</div><h2>One payment. Three layers of protection.</h2><p>SafeGuard catches pressure before money leaves the account, explains the reason, and brings a trusted person into the decision.</p><button className="story-button" onClick={onStart}><Play size={15} /> Rehearse the ₹45,000 demo flow <ArrowRight size={15} /></button></div><div className="impact-metrics"><div><strong>₹45,000</strong><span>protected in this demo</span></div><div><strong>5</strong><span>warning signals explained</span></div><div><strong>1 tap</strong><span>to involve a guardian</span></div></div><div className="story-steps"><div className="story-step"><b>01</b><span>Pause</span><small>before sending</small></div><div className="story-connector" /><div className="story-step"><b>02</b><span>Explain</span><small>without jargon</small></div><div className="story-connector" /><div className="story-step"><b>03</b><span>Protect</span><small>with trusted help</small></div></div></section>;
}

function SendPage({ onSubmit }: { onSubmit: (data: { payee: string; account: string; amount: number; note: string }) => void }) {
  const [payee, setPayee] = useState("Officer James — Tax Dept");
  const [account, setAccount] = useState("james.tax@upi");
  const [amount, setAmount] = useState("45000");
  const [note, setNote] = useState("urgent penalty fee");
  return <><PageHeader eyebrow="Send money" title="Who would you like to pay?" description="We will check the payment before it leaves your account." speakText="Send money. Who would you like to pay? We will check the payment before it leaves your account." /><form className="form-stack" onSubmit={e => { e.preventDefault(); onSubmit({ payee, account, amount: Number(amount), note }); }}><div className="form-card"><div className="form-card-heading"><div className="field-icon"><UserRoundPlus size={18} /></div><div><strong>New payee</strong><span>This person is not in your usual payees</span></div><span className="new-badge">New</span></div><label>Payee name<input value={payee} onChange={e => setPayee(e.target.value)} placeholder="e.g. Asha Groceries" /></label><label>UPI ID or account number<input value={account} onChange={e => setAccount(e.target.value)} placeholder="e.g. name@bank" /></label></div><div className="form-card"><label>How much? <span className="field-hint">Available ₹84,620.50</span><div className="amount-input"><span>₹</span><input inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))} /></div></label><label>Payment note <span className="field-hint">Optional</span><input value={note} onChange={e => setNote(e.target.value)} /></label><div className="form-tip"><ShieldCheck size={16} /><span>Our guardian looks for warning signs like unusual amounts, urgent notes, and new payees.</span></div></div><button className="wide-primary" type="submit"><ShieldCheck size={18} /> Check this payment safely <ArrowRight size={18} /></button><Link href="/home" className="back-link"><ArrowLeft size={15} /> Go back</Link></form></>;
}

function ReviewPage({ review, onCancel, onHold, onGuardian, onBlock, onComplete }: { review: ReviewTransaction; onCancel: () => void; onHold: () => void; onGuardian: () => void; onBlock: () => void; onComplete: () => void }) {
  const [answers, setAnswers] = useState([false, false, false]);
  const [checked, setChecked] = useState(false);
  const adjusted = Math.min(100, review.score + (answers[0] ? 25 : 0) + (answers[1] ? 25 : 0) + (answers[2] ? 15 : 0));
  const blocked = checked && adjusted >= 90;
  return <div className="review-page"><button className="back-link" onClick={onCancel}><ArrowLeft size={15} /> Cancel and go back</button><div className={`pause-hero ${blocked ? "pause-blocked" : ""}`}><div className="pause-icon"><ShieldCheck size={30} /></div><div><div className="eyebrow">Payment safety check</div><h1>{blocked ? "We stopped this payment" : "Let’s pause for a moment"}</h1><p>{blocked ? "This payment shows several strong warning signs. Your money is still safe." : "A quick check can help you feel sure before money leaves your account."}</p></div></div><div className="review-layout"><div className="review-main"><div className="payment-summary"><div className="summary-payee"><div className="payee-avatar avatar-alert">OJ</div><div><span>Sending to</span><strong>{review.payee}</strong><small>{review.account}</small></div></div><div className="summary-amount">{formatMoney(review.amount)}<small>Payment amount</small></div></div><div className="gauge-card"><RiskGauge score={blocked ? adjusted : adjusted} /><div className="gauge-copy"><strong>{blocked ? "This looks like a scam" : "Your guardian noticed a few things"}</strong><p>{blocked ? "We recommend that you do not send this payment." : "None of these signs proves it is a scam. They are reasons to slow down."}</p></div></div><div className="reasons-grid"><ReasonCard icon={UserRoundPlus} title="New payee" text="You've never sent money to this person before." /><ReasonCard icon={TrendingUp} title="Unusual amount" text="This is much larger than what you usually send." tone="caution" /><ReasonCard icon={AlertTriangle} title="Urgent words" text="Scammers often use words like “urgent” and “penalty”." tone="danger" /><ReasonCard icon={Clock3} title="Late at night" text="It is late — pressure can make it harder to think clearly." tone="caution" /></div>{!blocked && <div className="scam-check-card"><div className="section-heading"><div><div className="eyebrow">Scam check</div><h2>Can you answer three quick questions?</h2></div><ReadAloud text="Scam check. Can you answer three quick questions?" /></div><p className="muted">Honest answers help us protect you. There is no wrong answer.</p>{["Did someone call you and tell you to make this payment?", "Were you told to keep this payment secret?", "Were you told to act right away?"] .map((q, i) => <button key={q} className={`yes-no-row ${answers[i] ? "selected" : ""}`} onClick={() => setAnswers(a => a.map((v, index) => index === i ? !v : v))}><span className={`question-check ${answers[i] ? "checked" : ""}`}>{answers[i] && <Check size={14} />}</span><span>{q}</span><span className="yes-no-value">{answers[i] ? "Yes" : "No"}</span></button>)}<button className="wide-secondary" onClick={() => setChecked(true)}><ShieldCheck size={17} /> {checked ? "Safety check updated" : "Update my safety check"}</button></div>}{blocked && <div className="blocked-note"><div className="blocked-note-icon"><ShieldAlert size={20} /></div><div><strong>Please stop and talk to someone you trust.</strong><p>Real banks, police, and government offices will never ask you to move money to keep it safe.</p></div></div>}</div><aside className="review-side"><div className="help-card"><div className="help-card-top"><CircleHelp size={18} /><strong>Not sure what to do?</strong></div><p>You can cancel without any fee. You can also ask Priya, your trusted contact, to look at this payment.</p><button onClick={onGuardian}><Users size={17} /> Ask Priya to help</button><button className="quiet-button" onClick={() => speak("Banks never ask you to move money to protect it. When in doubt, hang up and call the number on your card.")}><Volume2 size={16} /> Hear a safety tip</button></div><div className="review-actions">{blocked ? <><button className="wide-danger" onClick={onBlock}><ShieldAlert size={17} /> Report this payee</button><button className="quiet-button" onClick={onCancel}>Go back home</button></> : <><button className="wide-primary" onClick={onComplete}>Continue with payment <ArrowRight size={17} /></button><button className="wide-secondary" onClick={onHold}><Clock3 size={17} /> Wait 24 hours</button><button className="quiet-button danger-text" onClick={onCancel}>Cancel — I think this is a scam</button></>}</div></aside></div></div>;
}

function TransactionsPage({ transactions, onCancel }: { transactions: Transaction[]; onCancel: (id: string) => void }) {
  return <><PageHeader eyebrow="Your money" title="Activity" description="Every payment, with a clear reason for its status." speakText="Activity. Every payment, with a clear reason for its status." action={<Link href="/send" className="small-primary"><Plus size={16} /> New payment</Link>} /><div className="activity-summary"><div><span>Checked this week</span><strong>12 payments</strong></div><div><span>Protected from scams</span><strong>₹45,000</strong></div><div><span>Safety score</span><strong className="green-text">92/100</strong></div></div><div className="filter-row"><button className="filter-chip active">All activity</button><button className="filter-chip">Needs action <span>1</span></button><button className="filter-chip">Completed</button></div><div className="full-transaction-list">{transactions.map(tx => <div className="full-tx" key={tx.id}><TransactionRow tx={tx} />{(tx.status === "held" || tx.status === "awaiting") && <div className="tx-action"><div className="hold-message"><Clock3 size={15} /><span>{tx.status === "awaiting" ? "Priya is reviewing this payment" : "Held until tomorrow at 11:48 PM"}</span></div><button onClick={() => onCancel(tx.id)}>Cancel payment</button></div>}</div>)}</div></>;
}

function ScannerPage() {
  const [text, setText] = useState("URGENT: Your bank account will be blocked today. Verify your account now at http://bit.ly/verify-safe. Share your OTP to avoid a penalty.");
  const [scanned, setScanned] = useState(true);
  const phrases = ["URGENT", "account will be blocked", "Verify your account", "OTP", "penalty", "bit.ly/verify-safe"];
  const scan = scanMessage(text);
  const danger = scanned && scan.verdict !== "safe";
  return <><PageHeader eyebrow="Message safety" title="Check a message before you act" description="Paste an SMS, WhatsApp message, email, or link. We will point out warning signs in plain language." speakText="Check a message before you act. Paste a message, email, or link and we will point out warning signs." /><div className="scanner-layout"><div className="scanner-input-card"><div className="input-card-top"><div className="field-icon"><ScanLine size={18} /></div><div><strong>Paste the message here</strong><span>Nothing is sent to the person who wrote it.</span></div></div><textarea value={text} onChange={e => { setText(e.target.value); setScanned(false); }} rows={9} placeholder="Paste a message or link..." /><div className="scanner-footer"><span>{text.length} characters</span><button className="wide-primary compact-button" onClick={() => { setScanned(true); toast.success("Message checked safely"); }}><ScanLine size={17} /> Check this message</button></div></div>{scanned && <div className={`scan-result ${danger ? "result-danger" : "result-safe"}`}><div className="result-heading"><div className="result-icon">{danger ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}</div><div><span className="eyebrow">Our read</span><h2>{danger ? "This message looks dangerous" : "No obvious warning signs"}</h2></div><ReadAloud text={danger ? "This message looks dangerous. Someone may be trying to rush you into sharing private information." : "No obvious warning signs found."} /></div><p>{danger ? "Someone may be trying to rush you into sharing private information or sending money. Do not click the link, share an OTP, or call the number in this message." : "Still take your time. If someone is asking for money or a password, call them back using a number you already trust."}</p>{danger && <div className="flagged-list"><strong>We noticed:</strong><div>{phrases.filter(p => text.toLowerCase().includes(p.toLowerCase())).map(p => <span key={p}>{p}</span>)}</div></div>}<Link href="/ask" className="ask-link"><MessageCircle size={17} /> Ask Guardian about this <ArrowRight size={15} /></Link></div>}</div></>;
}

function AskPage() {
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hello, I’m here to help you slow down and think clearly. What happened?" }]);
  const [input, setInput] = useState("");
  const send = (value = input) => { if (!value.trim()) return; setMessages(m => [...m, { role: "user", text: value }, { role: "assistant", text: value.toLowerCase().includes("otp") || value.toLowerCase().includes("blocked") ? "This sounds like a common scam pattern. A real bank will not ask for your OTP, PIN, or password over the phone. Please do not click any links or send money. Hang up and call the number on the back of your card." : "You did the right thing by checking first. Do not rush. If money or private information is involved, stop and call the person back using a trusted number." }]); setInput(""); };
  return <><PageHeader eyebrow="Your safety companion" title="Ask Guardian" description="Ask a question in your own words. You will get a calm answer without jargon." speakText="Ask Guardian. Ask a question in your own words and get a calm answer without jargon." /><div className="chat-shell"><div className="chat-intro"><div className="guardian-orb"><ShieldCheck size={26} /></div><div><strong>Your personal fraud guardian</strong><span>Usually replies in a few seconds · Private to you</span></div><span className="online-dot">Online</span></div><div className="suggestions"><span>Try asking:</span>{["Is this message a scam?", "Someone asked me for an OTP", "I got a call from my bank"].map(q => <button key={q} onClick={() => send(q)}>{q}</button>)}</div><div className="chat-messages">{messages.map((m, i) => <div className={`chat-bubble ${m.role}`} key={i}><div className="bubble-avatar">{m.role === "assistant" ? <ShieldCheck size={15} /> : "M"}</div><div><p>{m.text}</p>{m.role === "assistant" && <button className="read-message" onClick={() => speak(m.text)}><Volume2 size={14} /> Read aloud</button>}</div></div>)}</div><div className="chat-composer"><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Type your question here..." rows={2} /><button aria-label="Send message" onClick={() => send()}><ArrowRight size={18} /></button></div></div></>;
}

function NotificationsPage() {
  const items = [{ title: "Payment held for your safety", body: "Your payment to Unknown UPI ID is waiting. You can cancel it at any time.", time: "Just now", tone: "warning", icon: ShieldAlert }, { title: "You are protected", body: "We checked a new payment and found no warning signs.", time: "Yesterday", tone: "success", icon: CheckCircle2 }, { title: "A new scam to watch for", body: "Scammers are pretending to be delivery companies and asking for small ‘verification’ fees.", time: "Monday", tone: "info", icon: Bell }];
  return <><PageHeader eyebrow="Stay informed" title="Notifications" description="Short, clear updates about your account safety." speakText="Notifications. Short, clear updates about your account safety." action={<button className="small-secondary" onClick={() => toast.success("All notifications marked as read")}>Mark all read</button>} /><div className="notification-list">{items.map(item => <div className={`notification-card notification-${item.tone}`} key={item.title}><div className="notification-icon"><item.icon size={18} /></div><div className="notification-content"><div><strong>{item.title}</strong><span>{item.time}</span></div><p>{item.body}</p><button className="read-message" onClick={() => speak(`${item.title}. ${item.body}`)}><Volume2 size={14} /> Read aloud</button></div><span className="unread-dot" /></div>)}</div></>;
}

function ProfilePage({ simpleMode, setSimpleMode }: { simpleMode: boolean; setSimpleMode: (v: boolean) => void }) {
  return <><PageHeader eyebrow="Your settings" title="Profile & safety" description="Choose the level of support that feels right for you." speakText="Profile and safety. Choose the level of support that feels right for you." /><div className="profile-grid"><section className="settings-card"><div className="settings-heading"><div className="profile-avatar">M</div><div><h2>Margaret Wilson</h2><p>Protected account · Joined March 2023</p></div><button className="icon-button"><Settings2 size={17} /></button></div><div className="setting-row"><div><strong>Simple mode</strong><span>Large text, higher contrast, and fewer choices</span></div><button className={`toggle-control ${simpleMode ? "active" : ""}`} onClick={() => setSimpleMode(!simpleMode)}><span /></button></div><div className="setting-row"><div><strong>24-hour cooling-off period</strong><span>Give yourself time to cancel unusual payments</span></div><button className="toggle-control active"><span /></button></div><div className="setting-row"><div><strong>Trusted contact approval</strong><span>Priya can help review payments over ₹10,000</span></div><button className="toggle-control active"><span /></button></div></section><section className="baseline-card"><div className="eyebrow">Your normal pattern</div><h2>So we can spot what is unusual</h2><p>This is based on your recent activity. It helps us explain our checks.</p><div className="baseline-row"><span>Typical payment</span><strong>₹500 – ₹3,000</strong></div><div className="baseline-row"><span>Usual payees</span><strong>Groceries · Utilities · Pharmacy</strong></div><div className="baseline-row"><span>Usual payment time</span><strong>8 AM – 8 PM</strong></div><div className="guardian-contact"><div className="contact-avatar">P</div><div><span>Your trusted contact</span><strong>Priya Wilson</strong><small>Can approve or block risky payments</small></div><Phone size={16} /></div></section></div><section className="badge-section"><div className="section-heading"><div><div className="eyebrow">Practice makes safer</div><h2>Your safety badges</h2></div><Link href="/practice" className="text-link">Practice more <ArrowRight size={14} /></Link></div><div className="badges-row"><div className="earned-badge"><div>✓</div><strong>Link checker</strong><span>Spotted a fake link</span></div><div className="earned-badge"><div>✓</div><strong>Pause champion</strong><span>Took time to check</span></div><div className="locked-badge"><div><LockKeyhole size={18} /></div><strong>Scam spotter</strong><span>Try a practice scenario</span></div></div></section></>;
}

function PracticePage() {
  const [completed, setCompleted] = useState(false);
  return <><PageHeader eyebrow="Learn by doing" title="Practice spotting scams" description="Short, friendly scenarios help you feel ready if a real message arrives." speakText="Practice spotting scams. Short, friendly scenarios help you feel ready." /><div className="practice-banner"><div className="practice-icon"><Play size={21} /></div><div><strong>Five minutes can protect your money</strong><p>There is no score to worry about. Pick what you would do, then see why.</p></div><span>1 of 3 complete</span></div><div className="scenario-grid">{[{ title: "A fake bank call", type: "Phone call", icon: Phone, copy: "Someone says they are from your bank and asks you to move money.", tone: "teal" }, { title: "A grandchild in trouble", type: "Text message", icon: MessageCircle, copy: "A message says your grandchild needs gift cards right away.", tone: "amber" }, { title: "A refund popup", type: "Website", icon: FileSearch, copy: "A popup says you have won a refund and asks for your card details.", tone: "violet" }].map((s, i) => <div className="scenario-card" key={s.title}><div className={`scenario-icon scenario-${s.tone}`}><s.icon size={20} /></div><span className="scenario-type">{s.type}</span><h2>{s.title}</h2><p>{s.copy}</p><button className="scenario-button" onClick={() => { setCompleted(true); toast.success("Good choice — you spotted the warning sign!"); }}>{completed && i === 0 ? "Completed ✓" : "Start scenario"}<ArrowRight size={15} /></button></div>)}</div></>;
}

function GuardianPage({ transactions, onDecision }: { transactions: Transaction[]; onDecision: (id: string, decision: "approved" | "blocked") => void }) {
  const pending = transactions.filter(tx => tx.status === "awaiting");
  return <><PageHeader eyebrow="Trusted contact view" title="Guardian dashboard" description="Help Margaret slow down when a payment feels unusual." speakText="Guardian dashboard. Help Margaret slow down when a payment feels unusual." action={<div className="live-chip"><span /> Live updates</div>} />{pending.length > 0 ? <div className="guardian-alert"><div className="guardian-alert-icon"><Bell size={20} /></div><div><strong>Margaret needs a second pair of eyes</strong><span>{pending.length} payment waiting for your review</span></div><ReadAloud text="Margaret needs a second pair of eyes. A payment is waiting for your review." /></div> : <div className="empty-guardian"><CheckCircle2 size={25} /><strong>No payments waiting</strong><span>You will see a clear alert here if Margaret needs help.</span></div>}<div className="section-heading guardian-section-heading"><div><div className="eyebrow">Needs your attention</div><h2>Pending approvals</h2></div><span className="muted">Updates every 5 seconds</span></div><div className="pending-grid">{pending.map(tx => <div className="approval-card" key={tx.id}><div className="approval-top"><div className="approval-person"><div className="contact-avatar">M</div><div><strong>Margaret Wilson</strong><span>is trying to send money</span></div></div><RiskGauge score={tx.score} small /></div><div className="approval-payment"><div><span>To</span><strong>{tx.payee}</strong></div><strong>{formatMoney(tx.amount)}</strong></div><div className="approval-reasons"><span><AlertTriangle size={14} /> New payee</span><span><TrendingUp size={14} /> Unusual amount</span><span><Clock3 size={14} /> Late at night</span></div><div className="approval-note"><MessageCircle size={15} /><span>“urgent penalty fee”</span></div><div className="approval-actions"><button className="approve-button" onClick={() => onDecision(tx.id, "approved")}><Check size={16} /> Approve</button><button className="block-button" onClick={() => onDecision(tx.id, "blocked")}><X size={16} /> Block</button><a className="call-button" href="tel:+910000000000"><Phone size={15} /> Call Margaret</a></div></div>)}</div><div className="section-heading guardian-section-heading history-heading"><div><div className="eyebrow">Last 30 days</div><h2>Intervention history</h2></div></div><div className="history-table"><div className="history-head"><span>Person</span><span>Payment</span><span>Outcome</span><span>Date</span></div>{transactions.filter(tx => tx.status !== "awaiting").slice(0, 3).map(tx => <div className="history-row" key={tx.id}><span className="person-cell"><span className="mini-avatar">M</span> Margaret</span><span>{tx.payee} · {formatMoney(tx.amount)}</span><StatusBadge status={tx.status} /><span>{tx.date.split(",")[0]}</span></div>)}</div></>;
}

function AnalystPage({ transactions }: { transactions: Transaction[] }) {
  const bars = [{ label: "Impersonation", value: 78 }, { label: "Urgency", value: 58 }, { label: "Fake refund", value: 42 }, { label: "OTP request", value: 31 }];
  return <><PageHeader eyebrow="Bank operations" title="Fraud analyst overview" description="A bank-wide view of the moments SafeGuard stepped in." speakText="Fraud analyst overview. A bank-wide view of the moments SafeGuard stepped in." action={<div className="analyst-chip"><BarChart3 size={16} /> Demo data</div>} /><div className="kpi-grid"><div className="kpi-card"><span>Threats blocked</span><strong>28</strong><small><TrendingUp size={13} /> 18% this week</small></div><div className="kpi-card"><span>Money protected</span><strong>₹4.8L</strong><small><ShieldCheck size={13} /> Across 64 users</small></div><div className="kpi-card"><span>Average risk score</span><strong>71<span>/100</span></strong><small><AlertTriangle size={13} /> High attention</small></div><div className="kpi-card"><span>Guardian interventions</span><strong>19</strong><small><Users size={13} /> 92% resolved</small></div></div><div className="chart-grid"><div className="chart-card"><div className="chart-heading"><div><span className="eyebrow">What we are stopping</span><h2>Scam patterns</h2></div><span className="chart-period">Last 30 days</span></div><div className="bar-chart">{bars.map(bar => <div className="bar-row" key={bar.label}><span>{bar.label}</span><div className="bar-track"><div style={{ width: `${bar.value}%` }} /></div><strong>{bar.value}</strong></div>)}</div></div><div className="chart-card"><div className="chart-heading"><div><span className="eyebrow">Interceptions</span><h2>Seven day view</h2></div><span className="chart-period">+24%</span></div><div className="line-chart"><svg viewBox="0 0 420 150" role="img" aria-label="Interceptions rising over seven days"><path d="M0 124 C35 118 42 82 78 96 S118 70 150 85 S188 42 222 58 S260 28 292 45 S340 18 370 35 S395 10 420 18" fill="none" stroke="#2a9d8f" strokeWidth="4" strokeLinecap="round" /><path d="M0 124 C35 118 42 82 78 96 S118 70 150 85 S188 42 222 58 S260 28 292 45 S340 18 370 35 S395 10 420 18 L420 150 L0 150 Z" fill="url(#fill)" opacity=".18" /><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#2a9d8f" /><stop offset="1" stopColor="#2a9d8f" stopOpacity="0" /></linearGradient></defs></svg><div className="line-labels"><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span></div></div></div></div><div className="analyst-table-card"><div className="chart-heading"><div><span className="eyebrow">Live queue</span><h2>Recent interventions</h2></div><button className="small-secondary" onClick={() => toast.success("CSV export prepared")}>Export CSV</button></div><div className="analyst-table"><div className="analyst-row analyst-head"><span>Account holder</span><span>Payee</span><span>Risk</span><span>Amount</span><span>Outcome</span></div>{transactions.map(tx => <div className="analyst-row" key={tx.id}><span className="person-cell"><span className="mini-avatar">{tx.owner ? "M" : "M"}</span>{tx.owner || "Margaret"}</span><span>{tx.payee}</span><span className={`score-pill score-${tx.score >= 65 ? "high" : "low"}`}>{tx.score}/100</span><span>{formatMoney(tx.amount)}</span><StatusBadge status={tx.status} /></div>)}</div></div></>;
}

function LoginPage({ onLogin }: { onLogin: (role: Role) => void }) {
  return <div className="login-page"><div className="login-ambient" /><div className="login-inner"><div className="login-brand"><div className="brand-mark large"><ShieldCheck size={28} /></div><div><strong>SafeGuard</strong><span>Bank</span></div></div><div className="login-copy"><div className="eyebrow">A kinder kind of banking</div><h1>Money that looks out for you.</h1><p>Choose a demo account to see how SafeGuard pauses suspicious payments, explains why, and brings the right person in to help.</p></div><div className="demo-grid"><button className="demo-card" onClick={() => onLogin("customer")}><div className="demo-card-top"><div className="demo-avatar margaret">M</div><span className="demo-role">Customer</span></div><strong>Margaret</strong><span>Senior account holder · 74</span><div className="demo-card-arrow"><ArrowRight size={17} /></div></button><button className="demo-card" onClick={() => onLogin("guardian")}><div className="demo-card-top"><div className="demo-avatar priya">P</div><span className="demo-role">Guardian</span></div><strong>Priya</strong><span>Trusted contact for Margaret</span><div className="demo-card-arrow"><ArrowRight size={17} /></div></button><button className="demo-card" onClick={() => onLogin("analyst")}><div className="demo-card-top"><div className="demo-avatar analyst">A</div><span className="demo-role">Bank view</span></div><strong>Fraud analyst</strong><span>See protection across the bank</span><div className="demo-card-arrow"><ArrowRight size={17} /></div></button></div><div className="login-footer"><ShieldCheck size={15} /> Demo environment · No real money moves <span>·</span> <LockKeyhole size={14} /> Built for calm, clear decisions</div></div></div>;
}

function App() {
  const [location, navigate] = useLocation();
  const [role, setRole] = useState<Role>("customer");
  const [userName, setUserName] = useState("Margaret");
  const [simpleMode, setSimpleMode] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(loadDemoTransactions);
  const [review, setReview] = useState<ReviewTransaction | null>(null);
  const notificationCount = transactions.filter(tx => tx.status === "awaiting").length;

  useEffect(() => {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const syncDemoState = (event: StorageEvent) => {
      if (event.key !== DEMO_STORAGE_KEY || !event.newValue) return;
      try { setTransactions(JSON.parse(event.newValue) as Transaction[]); } catch { /* keep the current demo state */ }
    };
    window.addEventListener("storage", syncDemoState);
    return () => window.removeEventListener("storage", syncDemoState);
  }, []);

  const login = (nextRole: Role) => { setRole(nextRole); setUserName(nextRole === "customer" ? "Margaret" : nextRole === "guardian" ? "Priya" : "Aisha"); navigate(nextRole === "customer" ? "/home" : nextRole === "guardian" ? "/guardian" : "/analyst"); };
  const submitTransfer = (data: { payee: string; account: string; amount: number; note: string }) => { setReview({ id: `review-${Date.now()}`, ...data, score: 85, tier: "high", newPayee: true }); navigate("/send/review"); };
  const cancelReview = () => { if (review) setTransactions(tx => [{ id: review.id, payee: review.payee, initials: "OJ", amount: review.amount, date: "Just now", status: "cancelled", score: review.score, reason: "Cancelled after safety check" }, ...tx]); setReview(null); toast.success("Good call. Your money is safe."); navigate("/home"); };
  const holdReview = () => { if (review) setTransactions(tx => [{ id: review.id, payee: review.payee, initials: "OJ", amount: review.amount, date: "Held just now", status: "held", score: review.score, reason: "Cooling-off period", scamType: "Impersonation", owner: "Margaret" }, ...tx]); setReview(null); toast.success("Payment held for 24 hours. You can cancel anytime."); navigate("/transactions"); };
  const askGuardian = () => { if (review) setTransactions(tx => [{ id: review.id, payee: review.payee, initials: "OJ", amount: review.amount, date: "Waiting just now", status: "awaiting", score: review.score, reason: "Guardian review requested", scamType: "Impersonation", owner: "Margaret" }, ...tx]); setReview(null); toast.success("Priya has been asked to review this payment."); navigate("/home"); };
  const blockReview = () => { if (review) setTransactions(tx => [{ id: review.id, payee: review.payee, initials: "OJ", amount: review.amount, date: "Blocked just now", status: "blocked", score: 100, reason: "Blocked by SafeGuard", scamType: "Impersonation", owner: "Margaret" }, ...tx]); setReview(null); toast.success("Payee reported. We stopped the payment."); navigate("/home"); };
  const completeReview = () => { if (review) setTransactions(tx => [{ id: review.id, payee: review.payee, initials: "OJ", amount: review.amount, date: "Completed just now", status: "completed", score: review.score, reason: "Confirmed by you" }, ...tx]); setReview(null); toast.success("Payment completed safely."); navigate("/transactions"); };
  const decideGuardian = (id: string, decision: "approved" | "blocked") => { setTransactions(tx => tx.map(t => t.id === id ? { ...t, status: decision === "approved" ? "completed" : "blocked", date: decision === "approved" ? "Approved just now" : "Blocked just now", reason: decision === "approved" ? "Approved by Priya" : "Blocked by Priya" } : t)); toast.success(decision === "approved" ? "Payment approved for Margaret." : "Payment blocked. Margaret has been notified."); };
  const panic = () => { setFrozen(true); toast.success("Payments paused for one hour. You are in control."); };
  const cancelTransaction = (id: string) => { setTransactions(tx => tx.map(t => t.id === id ? { ...t, status: "cancelled", reason: "Cancelled by account holder" } : t)); toast.success("Payment cancelled. Your money is safe."); };

  if (location === "/" || location === "/login") return <><LoginPage onLogin={login} /><Toaster position="bottom-right" /></>;
  const page = <Switch><Route path="/home"><HomePage onPanic={panic} frozen={frozen} goToSend={() => navigate("/send")} /></Route><Route path="/send"><SendPage onSubmit={submitTransfer} /></Route><Route path="/send/review"><ReviewPage review={review || { id: "demo", payee: "Officer James — Tax Dept", account: "james.tax@upi", amount: 45000, note: "urgent penalty fee", score: 85, tier: "high", newPayee: true }} onCancel={cancelReview} onHold={holdReview} onGuardian={askGuardian} onBlock={blockReview} onComplete={completeReview} /></Route><Route path="/transactions"><TransactionsPage transactions={transactions} onCancel={cancelTransaction} /></Route><Route path="/scan"><ScannerPage /></Route><Route path="/ask"><AskPage /></Route><Route path="/notifications"><NotificationsPage /></Route><Route path="/profile"><ProfilePage simpleMode={simpleMode} setSimpleMode={setSimpleMode} /></Route><Route path="/practice"><PracticePage /></Route><Route path="/guardian"><GuardianPage transactions={transactions} onDecision={decideGuardian} /></Route><Route path="/analyst"><AnalystPage transactions={transactions} /></Route><Route><HomePage onPanic={panic} frozen={frozen} goToSend={() => navigate("/send")} /></Route></Switch>;
  return <AppShell role={role} userName={userName} simpleMode={simpleMode} setSimpleMode={setSimpleMode} onRoleSwitch={login} notificationCount={notificationCount}>{page}</AppShell>;
}

export default App;
