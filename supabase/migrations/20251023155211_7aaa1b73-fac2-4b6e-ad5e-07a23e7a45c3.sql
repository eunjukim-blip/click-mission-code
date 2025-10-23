-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to run daily at 1 AM (UTC)
SELECT cron.schedule(
  'daily-ranking-rewards',
  '0 1 * * *', -- Every day at 1 AM
  $$
  SELECT
    net.http_post(
        url:='https://pcdhsnfnuwvpveimyoae.supabase.co/functions/v1/daily-ranking-rewards',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZGhzbmZudXd2cHZlaW15b2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTMwMDksImV4cCI6MjA3NjQ2OTAwOX0.4vTf-Y6287z08Jn66jcFx6fSzAv6qfm-zk9N_v-nNMU"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);