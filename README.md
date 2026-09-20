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
