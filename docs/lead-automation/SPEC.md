# RX Speed-to-Lead PoC — Requirements & Spec (v0.1 draft)

Automated system that detects a new ReferralExchange ("RX") lead for Blake Wilder
(Wilder Realty, Austin TX), accepts it, and sends the lead a personalized first
text within 60 seconds — then hands the conversation to Blake in a shared inbox.

Status: **requirements/spec phase — no code yet.** Open questions at the bottom
block implementation of specific components; everything else is settled.

---

## 1. Goals & success metrics

| Goal | Metric |
|---|---|
| Win speed-to-lead (RX leads are exclusive but reassigned if response is slow) | Time from RX notification email received → first SMS delivered. Target **< 60s**; hard abort at 30 min (see error handling). |
| Start real conversations | Lead response rate to the opener. |
| Prove value to Blake | Both metrics logged per lead, reviewable weekly. Baseline: Blake's current manual response time. |

Volume: ~5 inbound leads/week. Single-tenant, built tidy so it can generalize
later (other agents → other lead services → other industries).

## 2. Actors

- **Lead** — consumer who requested an agent through RX. RX consent covers automated texts from the agent.
- **Blake** — broker/owner, Wilder Realty (`blake@wilderrealtytx.com`, cell 512‑593‑0013). Takes over conversations; receives summaries and error alerts.
- **Steven** — builds, hosts, and operates the system; has an RX login; needs read/reply access to all threads for QA.
- **RX** — sends notification emails from `support@referralexchange.com`; lead details live behind login at the "View Referral" link.

## 3. Confirmed decisions

| Topic | Decision |
|---|---|
| Email intake | Dedicated address (no new paid Workspace seat — Google Group forwarder or equivalent; see §5.1). RX notification target changed from `admin@wilderrealtytx.com` to it. |
| Accept logic | Auto-accept **every** lead. No penalty; Blake can reverse/cancel in RX. |
| Speed target | First text < 60s from email arrival. |
| SMS platform | **Quo (formerly OpenPhone)** — Option A from the alternatives analysis (§10). New local number, **512** area code preferred. |
| Shared access | Blake + Steven both get Quo seats; either can read/reply on any thread from the same number the bot uses. |
| First message | Blake-provided buyer/seller templates (§7), selected by lead type parsed from the email subject. |
| Conversation depth (v1) | Opener only (it already asks the qualifying question — a 10–15 min call today/tomorrow). On any lead reply: summary to Blake, bot goes silent. Decision tree / AI chat is a later phase. |
| Quiet hours | Send immediately regardless of hour (see risk note §9.2). |
| Staleness guard | If first text hasn't been sent within **30 min** of lead arrival, don't send it — alert Blake + Steven instead. |
| Alerts | Text (or email) to Blake and Steven; exact copy in §8. |
| Metrics | Time-to-first-text and response rate, logged per lead. |
| Budget | Steven hosts/pays; minimize cost; ceiling $100/mo. |
| Tenancy | Single-tenant but tidy. |

## 4. Findings from the sample RX email

Source: "New Buyer Referral in Marble Falls from ReferralExchange",
`support@referralexchange.com` → `admin@wilderrealtytx.com`, Jul 8 2026.

1. **The email contains no lead contact data.** Only: greeting, "A new Buyer
   referral is available in your account," a **Click Here to View Referral**
   button, RX support phone, and `(ref: Referral ID# 13791009)`. All lead
   details (name, phone, criteria) are behind the RX login. ⇒ The accept step
   is not a bare HTTP GET; the system must authenticate to RX and scrape the
   referral page (§5.2). This is the highest-risk component.
2. **The subject line encodes lead type and city:**
   `New (Buyer|Seller) Referral in <City> from ReferralExchange`. ⇒ Buyer vs.
   seller template can be chosen from the subject alone, before scraping.
3. **Referral ID is in the body** — use as the idempotency key (never text the
   same referral twice, dedupe re-sent notifications).
4. City mismatch note: sample lead is **Marble Falls**, but the buyer template
   says "buying a home in the Austin area." Open question §11.3.

## 5. Architecture

```mermaid
sequenceDiagram
    participant RX as ReferralExchange
    participant Mail as Intake address
    participant Svc as Lead service (ours)
    participant Quo as Quo (OpenPhone)
    participant Lead
    participant Blake

    RX->>Mail: New referral email
    Mail->>Svc: Push (webhook / Gmail push)
    Svc->>Svc: Parse subject (type, city) + Referral ID; dedupe
    Svc->>RX: Login, open referral, ACCEPT, scrape name+phone
    Svc->>Quo: POST /v1/messages (buyer|seller opener)
    Quo->>Lead: First text (from 512 number)
    Lead-->>Quo: Reply
    Quo-->>Svc: webhook message.received
    Svc->>Blake: Summary text ("lead replied — take over")
    Blake->>Quo: Replies in Quo app, same number
```

One small always-on service (Node/TypeScript), Playwright for the RX step,
SQLite for state/metrics. Hosted on a ~$5/mo VPS or Fly.io/Railway
(always-on instance — cold starts would eat the 60s budget). Secrets (RX
credentials, Quo API key) in environment/secret store, never in the repo.

### 5.1 Email intake (push, no new Workspace seat)

Requirement: sub-60s end-to-end rules out slow polling; intake must be push
(or ≤15s polling as fallback). Options, preferred first:

1. **Cloudflare Email Routing** (free): point RX at e.g.
   `rx-leads@<a domain whose DNS we control>`; an Email Worker fires an HTTP
   POST to the service within seconds. Simplest push path — **if** a suitable
   domain's DNS is (or can be) on Cloudflare. (Open question §11.4.)
2. **Google Group forwarder + Gmail push**: free Google Group
   (e.g. `rx-leads@` on Steven's Workspace domain) with an existing Gmail/Workspace
   mailbox as member; that mailbox is watched via Gmail API `watch` +
   Cloud Pub/Sub push. No new seat, all-Google, but more moving parts
   (OAuth, Pub/Sub, watch renewal every 7 days).
3. **Fallback**: poll the member mailbox via Gmail API every 10–15s. Ugly but
   dependable; acceptable interim.

Either way, RX's notification email setting (or `admin@wilderrealtytx.com`
forwarding) is changed to the intake address. Keep Blake's address CC'd/as a
group member during the PoC so nothing is lost if the system is down.

### 5.2 RX accept & scrape worker ⚠ (design blocked on §11.1)

- Playwright (headless Chromium) logs into RX with Steven's credentials
  (persisted session/cookies to skip login when possible), opens the referral
  from the email link or by Referral ID, clicks **Accept**, scrapes: lead first/last
  name, phone, email, buyer/seller detail, city, any criteria shown.
- Unknowns to confirm from a live click-through (§11.1): login wall behavior,
  whether Accept is an explicit button or viewing implies acceptance, field
  layout, 2FA/CAPTCHA presence.
- Retry: 3 attempts with backoff; on persistent failure → error alert (§8) with
  the raw email content so a human can act.
- Risk: scraping is brittle (RX markup changes) and may touch RX Terms of
  Service — see §9.3.

### 5.3 Messaging (Quo / formerly OpenPhone)

- New number, 512 area code, in a Quo workspace with two seats (Blake, Steven).
- Send opener via `POST /v1/messages` (API messaging: ~$0.01/segment, prepaid
  credits — keep topped up; a failed-for-credits send triggers the error path).
- Subscribe webhook `message.received` (and `message.delivered` for metrics).
- **Bot-stop rule (v1):** the bot only ever sends the opener (+ error-path
  messages to Blake/Steven). First inbound reply from the lead → summary to
  Blake → bot permanently silent on that thread. No collision handling needed.
- **A2P 10DLC registration is the long pole** — required for automated SMS,
  needs Wilder Realty's legal name, EIN, address, website. Start immediately
  (§11.5); approval can take days to ~2 weeks.

### 5.4 Notifications to Blake & Steven

Via the same Quo number (to their cells) or email — final channel per §3.
- **Lead-replied summary** to Blake: lead name, phone, city, buyer/seller,
  their reply text, deep link to the Quo thread.
- **Error alerts**: §8, to both Blake and Steven.

### 5.5 Metrics & state (SQLite)

Per referral: referral ID, email-received / accepted / first-text-sent /
delivered / first-reply timestamps, lead type, city, phone-present flag, error
states. Derived: time-to-first-text, response rate. Surfacing for the PoC: a
tiny read-only status page or weekly digest — simplest thing that works.

## 6. End-to-end flow (happy path)

1. RX email arrives at intake address → push to service (t≈0s).
2. Parse subject → type + city; extract Referral ID; skip if already processed.
3. **Staleness check:** if now − email `Date` > 30 min → error path E4, stop.
4. Playwright: login → open referral → accept → scrape contact (t≈10–40s).
5. Validate phone: present and mobile/textable (Quo send failure = not textable). Missing → E1.
6. Send opener (buyer or seller template, `[First Name]` filled) → E2 on failure.
7. Log timestamps. Done — wait for webhook.
8. On `message.received`: summary to Blake; bot silent thereafter. `STOP`/opt-out replies are honored by carrier/Quo — never re-text that number.

## 7. First-message templates (Blake-provided, verbatim)

**Buyer:**
> Hi [First Name], this is Blake Wilder, Broker & Owner of Wilder Realty. I just received your request about buying a home in the Austin area and wanted to reach out personally.
>
> I'd love to learn more about what you're looking for and answer any questions you may have. Do you have 10–15 minutes for a quick phone call today or tomorrow? Once I know your needs, I'll put together a list of homes that closely match what you're looking for.
>
> I look forward to speaking with you!

**Seller:**
> Hi [First Name], this is Blake Wilder, Broker & Owner of Wilder Realty. I just received your request regarding selling your home and wanted to reach out personally.
>
> I'd love to learn a little more about your property, your timeline, and your goals so I can explain the selling process and give you an idea of what your home may be worth in today's market. Do you have 10–15 minutes for a quick phone call today or tomorrow?
>
> I look forward to speaking with you!

Note: ~2–3 SMS segments each, or one MMS — costs pennies either way. §11.3 on the "Austin area" wording.

## 8. Error handling (alert copy is Steven-provided, verbatim)

| # | Condition | Action |
|---|---|---|
| E1 | Referral accepted but **no phone number** on the referral | Alert: "Referral from [First name] received, but no phone number provided. Please reach out to them manually." + lead email/details if available |
| E2 | Phone present but **first text failed** (landline, carrier reject, no Quo credits) | Alert: "Referral from [First name] received, but sending the first text message failed. Please reach out to them manually." + phone number so Blake can call |
| E3 | RX **accept/scrape failed** after retries, or email parse failed | Alert both with raw email content + link, so a human can accept manually |
| E4 | **> 30 min** since lead arrival and first text not yet sent | Do **not** send the text; alert both (stale-lead message + lead details if scraped) |

All alerts go to both Blake and Steven. Every error state is also logged to metrics.

## 9. Compliance & risk register

1. **A2P 10DLC** — mandatory for automated texting from a local number; needs
   business registration details (§11.5). Longest lead-time item; start first.
2. **Quiet hours / TCPA** — decision is to text immediately 24/7. Flagged risk:
   TCPA and several state laws restrict marketing texts to 8am–9pm local time,
   and a 2am text is a poor first impression regardless. Recommendation:
   implement a `QUIET_HOURS` config (hold + send at 8am), even if it ships
   disabled per Blake's preference. Consent: confirmed RX consent covers
   automated agent texts; `STOP` opt-outs honored (Quo handles this).
3. **RX Terms of Service** — automated login + auto-accept may violate RX's ToS
   (account suspension = worst case). Steven to skim RX's ToS/agent agreement
   before launch. Mitigations: human-like Playwright pacing, low volume,
   Steven's real account. Also ask RX support whether an API/webhook exists —
   politely, without over-disclosing.
4. **Impersonation surface** — texts are signed as Blake and Blake genuinely
   takes over; keep it that way (no claims the bot is Blake beyond the opener he wrote).
5. **Fragility** — RX email format or site markup changes break intake/scrape.
   E3/E4 alerts are the safety net; Blake stays CC'd on raw RX notifications during PoC.
6. **Secrets** — RX credentials + Quo API key live only in the deployment
   secret store. Repo is public-facing; nothing sensitive committed.

## 10. Alternatives considered (rejected for PoC)

- **Option B — Twilio + custom dashboard:** full control, best long-term
  multi-tenant path, but the PoC would mostly be spent building an inbox UI
  Quo already provides. Revisit when productizing.
- **Option C — Twilio relay to Blake's personal phone:** viable only with a
  per-lead number pool on Blake's side; more custom routing code, N× A2P
  registrations, no shared history UI. Notable finding: iOS's threaded
  "Reply" feature can't disambiguate leads — it's iMessage-only (absent on
  SMS), SMS has no reply-reference field, and Twilio/Quo inbound webhooks
  carry no such metadata even over RCS.

## 11. Open questions (blocking → answer before build)

1. **RX click-through walkthrough** *(blocks §5.2)* — On the next lead (or an
   existing one), capture: the URL the button opens, whether login is required,
   presence/wording of an explicit Accept button, what fields the referral page
   shows, any 2FA/CAPTCHA. Screenshots + copied URLs are enough.
2. **Handoff flow confirmation** — v1 = opener only; the opener itself is the
   "one question" (the call ask); any lead reply → summary to Blake → bot
   silent. Correct, or should the bot ask one more scripted question first?
3. **City templating** — Sample lead was Marble Falls but the buyer template
   says "Austin area." Use the subject-line city (e.g. "…about buying a home in
   the Marble Falls area…")? Needs Blake's OK on wording.
4. **Intake address details** — Which domain hosts the intake address, and is
   its DNS on (or movable to) Cloudflare? If not, we do the Google Group +
   Gmail-push route. Also: who changes the notification address in RX settings
   (Steven has login — confirm the setting exists).
5. **A2P registration inputs** *(start now)* — Wilder Realty legal entity name,
   EIN, business address, website. Blake to provide; Steven registers via Quo.
6. **Alert channel** — Summaries/errors to Blake: SMS to his cell (512‑593‑0013), email, or both?
7. **Quo workspace ownership** — Created under Steven's account (he operates it)
   with Blake as the second seat? Billing to Steven per §3.

## 12. Estimated monthly cost

| Item | Est. |
|---|---|
| Quo seats × 2 (Starter $15/user; Business $23/user if needed) | $30–46 |
| A2P 10DLC fees | ~$2–3 |
| API message credits (~5 leads/wk × few segments) | < $5 |
| Hosting (small VPS / Fly.io) | ~$5 |
| Cloudflare Email Routing / Google Group | $0 |
| **Total** | **~$40–60/mo** (ceiling $100 ✓) |

## 13. Suggested build order

1. Kick off A2P registration (blocked on §11.5) — longest lead time.
2. RX click-through walkthrough (§11.1) → finalize accept/scrape design.
3. Stand up intake address + change RX notification target; log-only mode
   (parse + alert, no texting) to validate parsing on real leads.
4. Quo workspace, number, webhook plumbing; send/receive tested against
   Steven's own phone.
5. Wire accept/scrape → send; enable for real leads with Blake CC'd on everything.
6. Metrics page/digest; two-week measurement window; review with Blake.
