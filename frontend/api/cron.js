/**
 * Vercel Cron Job Handler
 * Route: /api/cron
 * Schedule: 0 10 * * * (daily at 10:00 UTC)
 *
 * Vercel automatically attaches the CRON_SECRET as a Bearer token
 * in the Authorization header for all cron invocations.
 * Set CRON_SECRET in your Vercel project environment variables.
 */
export default function handler(req, res) {
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;

  // Reject any request that doesn't carry the correct secret
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).end('Unauthorized');
  }

  // ---------------------------------------------------------------
  // Place your scheduled task logic here.
  // For example: triggering a backend cleanup, sending a digest email,
  // refreshing cached data, etc.
  // ---------------------------------------------------------------
  console.log(`[cron] Job ran at ${new Date().toISOString()}`);

  return res.status(200).json({ ok: true });
}
