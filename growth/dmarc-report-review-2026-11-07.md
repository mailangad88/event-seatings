# DMARC report review — Nov 7, 2026

## What came in

Google sent a DMARC aggregate report for `beyondchiavari.com` covering Nov 5, 2026 (one day, 6 emails total). Here's what it actually says.

## The short version

**Nothing is broken and nothing is being spoofed.** Every single email in the report passed both checks and lined up with our domain. No action is required to stop a problem — the remaining work is just finishing the setup so these checks can start actually blocking fake email instead of only watching.

## What the report showed

- All 6 emails came from Amazon's servers (IP addresses starting with `54.240.`) — that's expected, because Resend (our email tool) sends through Amazon SES behind the scenes.
- All 6 passed SPF (the check that says "this server is allowed to send for this domain").
- All 6 passed DKIM (the check that says "this email's signature matches this domain").
- All 6 were reported as "beyondchiavari.com" in the From address, and matched up correctly with both checks above.
- Current policy is set to "none" — meaning right now these checks only watch and report, they don't block or quarantine anything yet. That's the safe default while we confirm everything's clean.

In plain terms: these were our own real emails (quotes, confirmations, etc. sent through Resend), properly signed and verified, and no outside sender is currently pretending to be beyondchiavari.com.

## What I couldn't check from here

This cloud session can't reach outside DNS lookup services (its network is locked down), and our domain's DNS lives at Squarespace, not Vercel, so I don't have an API into it either. The DMARC report itself already confirms the key records exist and work, so there isn't a gap in our understanding — but I couldn't independently re-verify every DNS record myself, or check Resend's dashboard for a "verified" badge. The steps below tell you exactly what to look for if you want to confirm it yourself, or you can just trust the report (it's telling us things are already working).

## Click-steps: confirm your DNS matches what the report says

1. Go to [Squarespace Domains](https://account.squarespace.com/domains), click on **beyondchiavari.com**, then click **DNS Settings**.
2. Look for a TXT record on the host `resend._domainkey` — it should have a long value starting with `p=`. This is the DKIM signature Resend uses, and the report confirms it's working.
3. Look for a TXT record on the host `_dmarc` — it should start with `v=DMARC1; p=none`. The report confirms this already exists.
4. Look for a TXT record on the host `rsend` (or check Resend's own setup page shows this) — it should say `v=spf1 include:amazonses.com ~all` or similar. The report confirms this is passing too.
5. If all three are present, you're done here — nothing to change on DNS today.

## Click-steps: confirm Resend shows the domain as verified

1. Log into [resend.com](https://resend.com) and go to **Domains**.
2. Click on **beyondchiavari.com** (or the sending subdomain, likely `rsend.beyondchiavari.com`).
3. Check that SPF, DKIM, and DMARC all show green checkmarks, not a pending/red state.
4. If anything shows pending or failed, click **Verify** again — DNS propagation can lag, but since real mail is already passing per the report, this is likely just a dashboard state issue.

## What to do about the DMARC policy itself (no DNS change needed yet)

The policy is at `p=none` right now, which is the right place to be — it's "watch mode," not "block mode." Here's the path forward:

1. **Now through the next ~3–4 weeks:** leave it at `p=none`. We only have one day of data (6 emails) — too little to be confident nothing else sends mail as beyondchiavari.com (for example, if a CRM, invoicing tool, or marketing platform ever gets added that sends as @beyondchiavari.com). Keep collecting reports and skim them weekly for anything unexpected.
2. **Once a few weeks look clean:** tighten to `p=quarantine; pct=25` (quarantine just a quarter of failing mail at first, as a safety net), then step up to `pct=100` over a couple more weeks if nothing bad shows up.
3. **After quarantine looks clean for a few weeks:** move to `p=reject` — this is the strict setting that actually blocks spoofed email outright, which is the end goal.
4. Keep a `rua=` address in the `_dmarc` TXT record the whole time, so reports like this one keep arriving — that's how we'll know if it's safe to tighten further. If you're not sure what address is currently set, check the `_dmarc` TXT record value in Squarespace DNS settings (step 3 above) — whatever follows `rua=mailto:` is where these reports are going.

## Bottom line

This report is good news, not a warning. No spoofing, nothing failing, both SPF and DKIM solid. The only real "to-do" is the policy-tightening timeline above, which is just a matter of waiting and watching a few more reports — no urgent fix needed.
