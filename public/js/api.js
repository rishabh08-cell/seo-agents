// API Client for SEO Agents
const API = {
  base: '',
  token: localStorage.getItem('token'),

  headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = 'Bearer ' + this.token;
    return h;
  },

  async request(method, path, body) {
    const opts = { method, headers: this.headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(this.base + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  // Auth
  async login(email, password) {
    const data = await this.request('POST', '/auth/login', { email, password });
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  },

  async signup(email, password, name) {
    const data = await this.request('POST', '/auth/signup', { email, password, name });
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  },

  async getMe() {
    return this.request('GET', '/auth/me');
  },

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  },

  // CMS
  async getPlatforms() {
    return this.request('GET', '/api/cms/platforms');
  },

  async connectCMS(platform, site_url, credentials) {
    return this.request('POST', '/api/cms/connect', { platform, site_url, credentials });
  },

  async getConnections() {
    return this.request('GET', '/api/cms/connections');
  },

  async testConnection(id) {
    return this.request('POST', '/api/cms/' + id + '/test');
  },

  async syncSchema(id) {
    return this.request('POST', '/api/cms/' + id + '/sync-schema');
  },

  async deleteConnection(id) {
    return this.request('DELETE', '/api/cms/' + id);
  },

  // Content
  async getSources() {
    return this.request('GET', '/api/content/sources');
  },

  async addSource(source_type, source_ref, title, column_mapping) {
    return this.request('POST', '/api/content/sources', { source_type, source_ref, title, column_mapping });
  },

  async deleteSource(id) {
    return this.request('DELETE', '/api/content/sources/' + id);
  },

  async fetchDoc(doc_url) {
    return this.request('POST', '/api/content/fetch-doc', { doc_url });
  },

  async fetchSheet(sheet_url, range, column_mapping) {
    return this.request('POST', '/api/content/fetch-sheet', { sheet_url, range, column_mapping });
  },

  async getSheetHeaders(sheet_url, sheet_name) {
    const params = new URLSearchParams({ sheet_url });
    if (sheet_name) params.set('sheet_name', sheet_name);
    return this.request('GET', '/api/content/sheet-headers?' + params);
  },

  // Publish
  async prepareContent(content, cms_connection_id, instructions) {
    return this.request('POST', '/api/publish/prepare', { content, cms_connection_id, instructions });
  },

  async validateContent(content, cms_connection_id) {
    return this.request('POST', '/api/publish/validate', { content, cms_connection_id });
  },

  async publish(cms_connection_ids, content, publish_status) {
    return this.request('POST', '/api/publish', { cms_connection_ids, content, publish_status });
  },

  async getPublications(status, cms_connection_id) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (cms_connection_id) params.set('cms_connection_id', cms_connection_id);
    const qs = params.toString();
    return this.request('GET', '/api/publish/publications' + (qs ? '?' + qs : ''));
  },

  async syncPublication(id, content) {
    return this.request('PUT', '/api/publish/' + id + '/sync', { content });
  },

  async auditPublication(id) {
    return this.request('POST', '/api/publish/' + id + '/audit');
  },

  // Google Search Console
  async getGSCAuthUrl() {
    return this.request('GET', '/api/gsc/auth-url');
  },

  async handleGSCCallback(code) {
    return this.request('POST', '/api/gsc/callback', { code });
  },

  async getGSCSites(token) {
    const params = new URLSearchParams({ access_token: token });
    return this.request('GET', '/api/gsc/sites?' + params);
  },

  async connectGSCSite(site_url, access_token, refresh_token) {
    return this.request('POST', '/api/gsc/connect', { site_url, access_token, refresh_token });
  },

  async getGSCConnections() {
    return this.request('GET', '/api/gsc/connections');
  },

  async deleteGSCConnection(id) {
    return this.request('DELETE', '/api/gsc/' + id);
  },

  async getGSCTopPages(id, days) {
    const params = days ? '?days=' + days : '';
    return this.request('GET', '/api/gsc/' + id + '/top-pages' + params);
  },

  async getGSCPageQueries(id, pageUrl, days) {
    const params = new URLSearchParams({ url: pageUrl });
    if (days) params.set('days', days);
    return this.request('GET', '/api/gsc/' + id + '/page-queries?' + params);
  },

  async getGSCPerformance(id, days) {
    const params = days ? '?days=' + days : '';
    return this.request('GET', '/api/gsc/' + id + '/performance' + params);
  }
};
