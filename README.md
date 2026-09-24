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
