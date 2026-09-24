# ANGA / NEXUS Investor Portal V32

V32 adds cloud-ready reward configuration persistence while retaining localStorage as an offline/cache fallback.

## Database setup (Supabase)
1. Create a Supabase project.
2. Run `supabase-schema.sql` in the SQL editor.
3. Deploy this project to Vercel (or adapt `api/config.js` to your serverless host).
4. Add server environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXUS_ALLOWED_ORIGIN` (your exact portal origin). Never place the service-role key in `config.js`.
5. `apiUrl` is preconfigured as `/api`, so the browser uses the Vercel API on the same deployment automatically.

## Important security gate
This V32 stage intentionally implements persistence first, as planned. It does **not** yet prove wallet ownership before writes. Do not expose cloud writes to real investors until V33 wallet-signature authentication is added. Public Stellar addresses are public identifiers, not passwords.

## Behavior
- Cloud configured: configurations load/save through `/api/config`, with local cache fallback.
- Cloud not configured: portal continues to work locally.
- Stellar secret keys are never requested or stored.


## V32.2 Supabase key compatibility
This build supports the current Supabase `sb_secret_...` server key format. The key is sent only in the `apikey` header; it is never exposed to the browser. Failed Supabase calls log only the upstream HTTP status and response body in Vercel server logs, never the secret key.

## Production V1.1 — Dividend Center

V1.1 adds an ANGA Dividend Center with 10 live ANGA tiers, 11 dividend-credit categories, daily/7-day/30-day views, tier simulator, next-tier progress, and a server-side daily credit ledger.

### One-time deployment steps
1. In Supabase SQL Editor run `supabase-dividends-v1.1.sql`.
2. In Vercel add a Production Secret environment variable named `CRON_SECRET` with a long random value, then redeploy.
3. Vercel Cron calls `/api/dividends-run` daily at 00:05 UTC. The endpoint scans ANGA holders from Stellar Horizon and writes one immutable credit row per eligible wallet/date. Duplicate daily runs are ignored by the `(wallet, credit_date)` primary key.
4. Existing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXUS_ALLOWED_ORIGIN` variables remain unchanged.

Dividend entries are internal NEXUS account credits. Asset labels identify the dividend-credit category and do not by themselves represent custody or an on-chain transfer of BTC, ETH, SOL, USDC, XLM, XRP, USDT, GOLD, SILVER, S&P 500, or XDC.

## V1.1.1 — Live dividend ledger update
- Replaced XDC, USDT, XRP, XLM, GOLD, SILVER and S&P 500 artwork with the supplied investor-facing images.
- Removed the About Dividend Credits panel from the Dividend Center.
- Dividend history now expands day-by-day and shows the exact 11 asset amounts credited on each date, plus the tier and ANGA balance captured for that credit.
- The newest credited day opens automatically.
- No retroactive rows are generated. Deployment/activation day can be Day 1 by manually invoking the protected `/api/dividends-run` endpoint once after deployment; subsequent runs are scheduled daily at 00:05 UTC.

### Activation order
1. Run `supabase-dividends-v1.1.sql` once in the existing Supabase project.
2. Add `CRON_SECRET` as a Production secret in Vercel (long random value) and redeploy.
3. Confirm the deployment is Ready.
4. Trigger `/api/dividends-run` once with `Authorization: Bearer <CRON_SECRET>` to create Day 1 immediately, or allow the scheduled daily run to create the first row at 00:05 UTC.
5. Open an eligible investor wallet in the portal and confirm Dividend Account History shows the new day and all 11 amounts.

The dividend ledger is an internal account ledger; this job records credits and does not send the named underlying assets on-chain.

## V1.1.2 accumulated dividend totals
Dividend Center now shows Today, Last 30 Days, and All Time totals per dividend asset, calculated from the investor's stored Supabase dividend ledger. The API paginates ledger rows server-side and still returns the latest 90 daily entries for the expandable history view.

## V1.1.3 — Universal Reward Allocations
- Repeatable allocations are now enabled for every NEXUS reward category, including Vehicles, Supercars, Jets, Helicopters, Yachts, Ships, Healing Units/Centres, Energy Systems and Mining Units.
- Each allocation can have its own quantity, intended use, model/style preference, features, destination and instructions.
- Allocated / Remaining / Allocation count is shown consistently and additional allocations can be added until the entitlement is used.
- Existing saved single configurations are migrated into the first allocation when opened; existing multi-allocation categories remain compatible.
