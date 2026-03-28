import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { GSCClient, getGSCAuthUrl, exchangeCodeForTokens } from '../lib/gsc';
import { encrypt, decrypt } from '../lib/encryption';

const router = Router();

router.get('/auth-url', requireAuth, (_req: AuthRequest, res: Response) => {
  res.json({ url: getGSCAuthUrl() });
});

router.get('/callback', requireAuth, async (req: AuthRequest, res: Response) => {
  const { code } = req.query;
  if (!code || typeof code !== 'string') { res.status(400).json({ error: 'Missing authorization code' }); return; }
  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.access_token) { res.status(400).json({ error: 'Failed to obtain access token' }); return; }
    await supabase.from('users').update({ google_access_token: encrypt(tokens.access_token), google_refresh_token: tokens.refresh_token ? encrypt(tokens.refresh_token) : null }).eq('id', req.userId);
    res.json({ success: true });
  } catch (err) { console.error('GSC callback error:', err); res.status(500).json({ error: 'OAuth failed' }); }
});

router.get('/sites', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const client = await getClientForUser(req.userId);
    if (!client) { res.status(401).json({ error: 'Google not connected' }); return; }
    res.json({ sites: await client.listSites() });
  } catch (err) { console.error('GSC sites error:', err); res.status(500).json({ error: 'Failed to list sites' }); }
});

router.post('/connect', requireAuth, async (req: AuthRequest, res: Response) => {
  const { site_url } = req.body;
  if (!site_url) { res.status(400).json({ error: 'site_url required' }); return; }
  try {
    const { data: user } = await supabase.from('users').select('google_access_token, google_refresh_token').eq('id', req.userId).single();
    if (!user?.google_access_token) { res.status(401).json({ error: 'Google not connected' }); return; }
    const { data, error } = await supabase.from('gsc_connections').upsert({ user_id: req.userId, site_url, google_access_token_encrypted: user.google_access_token, google_refresh_token_encrypted: user.google_refresh_token || '' }, { onConflict: 'user_id,site_url' }).select('id, site_url, created_at').single();
    if (error) throw error;
    res.status(201).json({ connection: data });
  } catch (err) { console.error('GSC connect error:', err); res.status(500).json({ error: 'Failed to save connection' }); }
});

router.get('/connections', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase.from('gsc_connections').select('id, site_url, created_at').eq('user_id', req.userId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ connections: data || [] });
  } catch (err) { console.error('GSC connections error:', err); res.status(500).json({ error: 'Failed to fetch connections' }); }
});

router.post('/:id/query', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const conn = await getGSCConnection(req.params.id, req.userId);
    if (!conn) { res.status(404).json({ error: 'Not found' }); return; }
    const { start_date, end_date, dimensions, dimension_filters, row_limit } = req.body;
    if (!start_date || !end_date) { res.status(400).json({ error: 'start_date and end_date required' }); return; }
    const rows = await buildClient(conn).queryAnalytics(conn.site_url, { start_date, end_date, dimensions, dimension_filters, row_limit });
    res.json({ rows, count: rows.length });
  } catch (err) { console.error('GSC query error:', err); res.status(500).json({ error: 'Query failed' }); }
});

router.get('/:id/top-pages', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const conn = await getGSCConnection(req.params.id, req.userId);
    if (!conn) { res.status(404).json({ error: 'Not found' }); return; }
    const { startDate, endDate } = dateRange(parseInt(req.query.days as string) || 28);
    const rows = await buildClient(conn).topPages(conn.site_url, startDate, endDate, parseInt(req.query.limit as string) || 50);
    res.json({ rows, period: { start_date: startDate, end_date: endDate } });
  } catch (err) { console.error('GSC top-pages error:', err); res.status(500).json({ error: 'Failed' }); }
});

router.get('/:id/page-queries', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const conn = await getGSCConnection(req.params.id, req.userId);
    if (!conn) { res.status(404).json({ error: 'Not found' }); return; }
    const pageUrl = req.query.url as string;
    if (!pageUrl) { res.status(400).json({ error: 'url param required' }); return; }
    const { startDate, endDate } = dateRange(parseInt(req.query.days as string) || 28);
    const rows = await buildClient(conn).queriesForPage(conn.site_url, pageUrl, startDate, endDate);
    res.json({ page_url: pageUrl, rows, period: { start_date: startDate, end_date: endDate } });
  } catch (err) { console.error('GSC page-queries error:', err); res.status(500).json({ error: 'Failed' }); }
});

router.get('/:id/performance', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const conn = await getGSCConnection(req.params.id, req.userId);
    if (!conn) { res.status(404).json({ error: 'Not found' }); return; }
    const { startDate, endDate } = dateRange(parseInt(req.query.days as string) || 28);
    const rows = await buildClient(conn).performanceByDate(conn.site_url, startDate, endDate);
    res.json({ rows, period: { start_date: startDate, end_date: endDate } });
  } catch (err) { console.error('GSC performance error:', err); res.status(500).json({ error: 'Failed' }); }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase.from('gsc_connections').delete().eq('id', req.params.id).eq('user_id', req.userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { console.error('GSC delete error:', err); res.status(500).json({ error: 'Failed' }); }
});

function dateRange(days: number) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  return { startDate, endDate };
}

function buildClient(conn: { google_access_token_encrypted: string; google_refresh_token_encrypted?: string }) {
  return new GSCClient(decrypt(conn.google_access_token_encrypted), conn.google_refresh_token_encrypted ? decrypt(conn.google_refresh_token_encrypted) : undefined);
}

async function getClientForUser(userId: string): Promise<GSCClient | null> {
  const { data: user } = await supabase.from('users').select('google_access_token, google_refresh_token').eq('id', userId).single();
  if (!user?.google_access_token) return null;
  return new GSCClient(decrypt(user.google_access_token), user.google_refresh_token ? decrypt(user.google_refresh_token) : undefined);
}

async function getGSCConnection(id: string, userId: string) {
  const { data, error } = await supabase.from('gsc_connections').select('*').eq('id', id).eq('user_id', userId).single();
  return error || !data ? null : data;
}

export default router;
