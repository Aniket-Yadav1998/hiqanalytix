# Supabase lead database setup

This backend stores contact enquiries, ROI calculator requests, and insight newsletter subscriptions in Supabase PostgreSQL. Insight articles continue to use the existing MongoDB database.

## 1. Create the database

1. Create a project at [Supabase](https://supabase.com/dashboard).
2. Choose the region nearest to the Render API service and save the database password.
3. Open **SQL Editor**, create a new query, paste the contents of `migrations/001_create_lead_tables.sql`, and run it.

## 2. Configure Render

1. In Supabase, open **Connect** and copy the PostgreSQL connection string. For Render, use the connection pooler string if direct connections are unavailable.
2. In the Render service running `backend/server.py`, add this secret environment variable:

   ```text
   SUPABASE_DATABASE_URL=postgresql://...
   ```

3. Do not add this value to the frontend or to any `REACT_APP_*` variable. It grants database access and must remain a backend-only secret.
4. Redeploy the backend. Its health endpoint will report `lead_database_configured: true` once the pool has connected.

## 3. Verify the deployment

Submit one test contact request, ROI request, and newsletter subscription through the website. In Supabase, open **Table Editor** and confirm that a row appears in `contact_leads`, `roi_leads`, and `newsletter_subscribers`.

## Free-tier notes

Supabase's free tier is suitable for early production use, but it has project-size and inactivity limits. Enable email notifications in Supabase and export important leads regularly. Upgrade before relying on it for high-volume or business-critical workloads.
