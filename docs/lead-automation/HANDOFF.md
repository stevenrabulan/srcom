# Handoff — RX Speed-to-Lead PoC (requirements phase)

Date: 2026-07-13. This session ran against the wrong repo
(`stevenrabulan/stevenrabulan`, branch `claude/real-estate-lead-automation-e4wjqj`);
work continues in Steven's local project repo. **Copy both files in
`docs/lead-automation/` (SPEC.md + this doc) into the new repo**, then this
branch can be deleted.

## What this project is

Blake Wilder (Broker/Owner, Wilder Realty, Austin TX) gets exclusive leads from
ReferralExchange ("RX") by email; if he responds too slowly the lead is passed
to another broker. We're building a PoC that, within 60 seconds of the RX
email: parses it, logs into RX and auto-accepts, scrapes the lead's contact
info, and texts the lead Blake's opener from a new 512 number. Blake and Steven
share a Quo (formerly OpenPhone) inbox; on the lead's first reply, Blake gets a
summary and takes over from the same number. Steven builds/hosts/operates
(~$40–60/mo, ceiling $100). Long-term: generalize to other agents, other lead
services, other industries — but build single-tenant-and-tidy for now.

## State of play

- **`SPEC.md` (same folder) is the source of truth** — v0.1 draft covering
  goals/metrics, all confirmed decisions, architecture (mermaid sequence
  diagram), components, verbatim message templates and error-alert copy,
  compliance/risk register, rejected alternatives, open questions (§11), cost
  estimate, and suggested build order.
- **No code written yet** — still in requirements. Do not start building past
  what §13 build-order step allows until §11's blocking questions are answered.
- Key research already verified (don't redo): OpenPhone rebranded to **Quo**;
  API sends SMS (`POST /v1/messages`, ~$0.01/segment prepaid) and delivers
  `message.received` webhooks; automated-texting features available on all
  plans (~$15–23/user/mo).

## Key findings (hard-won context)

1. **The RX email contains no lead data** — just a "Click Here to View
   Referral" button and a Referral ID. Accept requires authenticated
   login + scrape (Playwright), making it the riskiest component and the
   reason §11.1 (a click-through walkthrough of the RX site) blocks design.
2. **Subject line encodes lead type + city**:
   `New (Buyer|Seller) Referral in <City> from ReferralExchange` — template
   selection doesn't depend on scraping. Referral ID = dedupe key.
3. RX currently notifies `admin@wilderrealtytx.com` (Blake's Workspace domain).
4. Option C (Twilio relay to Blake's personal phone) was analyzed and rejected;
   notably, iOS's threaded "Reply" feature cannot disambiguate leads (iMessage-
   only; SMS has no reply-reference; Twilio/Quo webhooks carry no such field).
   Details in SPEC §10 — keep for when Blake asks "why a new app?"

## ✅ Checklist: things Steven needs from Blake

1. **Intake email address on wilderrealtytx.com** — Is creating a new address
   (e.g. `rx-leads@wilderrealtytx.com`) easy for him? Two paths:
   - *Blake does it:* he creates a free alias/group (not a paid seat) and
     forwards to wherever Steven specifies; or simply adds a forwarding rule
     on the existing `admin@` for RX emails.
   - *Blake delegates:* gives Steven admin access to Workspace/DNS to set it
     up himself. Also ask where the domain's DNS is hosted — if it's on (or
     movable to) Cloudflare, free Email Routing → Worker is the cleanest
     sub-60s push path (SPEC §5.1).
   Either way, Blake should stay CC'd on raw RX notifications during the PoC.
2. **A2P 10DLC registration inputs** *(longest lead time — ask first)*:
   Wilder Realty legal name **exactly as on IRS records** (best: a copy of the
   CP-575/EIN letter — name mismatch is the top rejection cause), EIN, complete
   business address, website. Registration happens **inside Quo** ("Trust"
   settings; Quo submits to The Campaign Registry): ~10–15 min form, approval
   typically 5–7 business days, $19.50 one-time + $1.50/mo. Form also asks for
   sample messages (use Blake's openers) and opt-in description ("consumer
   requested an agent via ReferralExchange and consented to contact"). Register
   the brand as Wilder Realty (Blake's EIN) even though Steven owns the
   workspace. Per-provider — no prior registration carries over.
3. **Opener wording — city templating**: buyer template hardcodes "Austin
   area" but sample lead was Marble Falls. OK to substitute the lead's city
   from the subject line ("…buying a home in the Marble Falls area…")?
4. **Handoff flow confirmation**: v1 sends the opener only (it already asks
   the qualifying question — the 10–15 min call). Any lead reply → summary to
   Blake → bot silent. Confirm, or does he want one more scripted question?
5. **Alert channel**: summaries + error alerts to his cell (512-593-0013),
   email, or both?
6. **Quo app buy-in**: he'll need to install Quo and reply to leads there
   (that's how he answers from the bot's number). Confirm he's game.
7. **Quiet hours sign-off**: current decision is text immediately 24/7.
   Flag once more that TCPA/state rules generally restrict marketing texts to
   8am–9pm local; a `QUIET_HOURS` toggle will exist either way (SPEC §9.2).
8. **RX relationship check**: does he know if RX tolerates automation /
   has an API? Worst case for ToS-violating scraping is account suspension
   (SPEC §9.3) — his call on risk appetite since it's his lead source.

## Steven's own next actions (not Blake-dependent)

- Capture the RX click-through with his own login (SPEC §11.1): URL behind the
  button, login wall, explicit Accept button?, fields shown, 2FA/CAPTCHA.
  Screenshots + URLs unblock the scraper design.
- Skim RX's agent terms for automation language.
- Once #1–2 above are answered: create the Quo workspace (Steven as owner,
  Blake as second seat), buy a 512 number, start A2P registration — then
  follow SPEC §13 build order (log-only intake mode before any real texting).

## Decisions already locked (don't re-litigate)

Dedicated intake address · auto-accept every lead · <60s first text ·
Quo/Option A · 512 area code · both get seats · Blake's verbatim buyer/seller
openers · Steven's verbatim error-alert copy · 30-min staleness abort (E4) ·
alerts to both Blake & Steven · metrics = time-to-first-text + response rate ·
single-tenant but tidy · ~5 leads/week · $100/mo ceiling.
