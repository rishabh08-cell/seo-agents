// UI Components & Page Renderers
const UI = {
  toast(msg, type) {
    const c = document.getElementById('toasts');
    const t = document.createElement('div');
    t.className = 'toast ' + (type || 'info');
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  },

  // === Auth Pages ===
  loginPage() {
    return '<div class="auth-page"><div class="auth-card">' +
      '<div class="logo">SEO<span>Agents</span></div>' +
      '<h1>Welcome back</h1><p>Sign in to your account</p>' +
      '<form id="loginForm">' +
      '<div class="form-group"><label>Email</label><input type="email" id="loginEmail" required placeholder="you@example.com"></div>' +
      '<div class="form-group"><label>Password</label><input type="password" id="loginPass" required placeholder="Your password"></div>' +
      '<button type="submit" class="btn btn-primary btn-block">Sign In</button>' +
      '</form>' +
      '<p style="margin-top:16px;text-align:center">Don\u2019t have an account? <a href="#/signup">Sign up</a></p>' +
      '</div></div>';
  },

  signupPage() {
    return '<div class="auth-page"><div class="auth-card">' +
      '<div class="logo">SEO<span>Agents</span></div>' +
      '<h1>Create account</h1><p>Get started with SEO Agents</p>' +
      '<form id="signupForm">' +
      '<div class="form-group"><label>Name</label><input type="text" id="signupName" placeholder="Your name"></div>' +
      '<div class="form-group"><label>Email</label><input type="email" id="signupEmail" required placeholder="you@example.com"></div>' +
      '<div class="form-group"><label>Password</label><input type="password" id="signupPass" required placeholder="Min 6 characters" minlength="6"></div>' +
      '<button type="submit" class="btn btn-primary btn-block">Create Account</button>' +
      '</form>' +
      '<p style="margin-top:16px;text-align:center">Already have an account? <a href="#/login">Sign in</a></p>' +
      '</div></div>';
  },

  // === App Layout ===
  layout(page, active) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const initial = (user.name || user.email || '?')[0].toUpperCase();
    return '<div class="app-layout">' +
      '<aside class="sidebar">' +
      '<div class="logo">SEO<span>Agents</span></div>' +
      '<nav>' +
      '<a href="#/" class="' + (active === 'dashboard' ? 'active' : '') + '"><span class="icon">\u{1F4CA}</span> Dashboard</a>' +
      '<a href="#/connections" class="' + (active === 'connections' ? 'active' : '') + '"><span class="icon">\u{1F517}</span> CMS Connections</a>' +
      '<a href="#/content" class="' + (active === 'content' ? 'active' : '') + '"><span class="icon">\u{1F4DD}</span> Content Sources</a>' +
      '<a href="#/publish" class="' + (active === 'publish' ? 'active' : '') + '"><span class="icon">\u{1F680}</span> Publish</a>' +
      '<a href="#/publications" class="' + (active === 'publications' ? 'active' : '') + '"><span class="icon">\u{1F4E6}</span> Publications</a>' +
      '</nav>' +
      '<div class="user-section">' +
      '<div class="avatar">' + initial + '</div>' +
      '<div><div>' + (user.name || user.email || 'User') + '</div>' +
      '<a href="#" onclick="App.logout();return false" style="font-size:12px;color:var(--text-dim)">Sign out</a></div>' +
      '</div></aside>' +
      '<main class="main-content">' + page + '</main></div>';
  },

  // === Dashboard ===
  dashboardPage(connections, publications) {
    const connCount = connections ? connections.length : 0;
    const pubCount = publications ? publications.length : 0;
    const published = publications ? publications.filter(p => p.status === 'published').length : 0;
    return '<div class="page-header"><div><h2>Dashboard</h2><p>Overview of your SEO publishing pipeline</p></div></div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">' +
      '<div class="card"><div style="font-size:32px;font-weight:700;color:var(--primary)">' + connCount + '</div><div style="color:var(--text-muted);font-size:14px;margin-top:4px">CMS Connections</div></div>' +
      '<div class="card"><div style="font-size:32px;font-weight:700;color:var(--warning)">' + pubCount + '</div><div style="color:var(--text-muted);font-size:14px;margin-top:4px">Total Publications</div></div>' +
      '<div class="card"><div style="font-size:32px;font-weight:700;color:var(--success)">' + published + '</div><div style="color:var(--text-muted);font-size:14px;margin-top:4px">Published</div></div>' +
      '</div>' +
      '<div class="card"><div class="card-header"><h3>Quick Actions</h3></div>' +
      '<div style="display:flex;gap:12px">' +
      '<a href="#/connections" class="btn btn-primary">Connect CMS</a>' +
      '<a href="#/publish" class="btn btn-secondary">Publish Content</a>' +
      '</div></div>';
  },

  // === Connections Page ===
  connectionsPage(connections) {
    let list = '';
    if (!connections || connections.length === 0) {
      list = '<div class="empty-state"><div class="icon">\u{1F517}</div><h3>No CMS Connections</h3>' +
        '<p>Connect your WordPress or Strapi site to start publishing</p>' +
        '<button class="btn btn-primary" onclick="App.showConnectModal()">Connect CMS</button></div>';
    } else {
      connections.forEach(c => {
        const icon = c.platform === 'wordpress' ? 'W' : 'S';
        const synced = c.last_synced_at ? new Date(c.last_synced_at).toLocaleDateString() : 'Never';
        list += '<div class="connection-card">' +
          '<div class="platform-icon ' + c.platform + '">' + icon + '</div>' +
          '<div class="info"><h4>' + (c.site_name || c.platform) + '</h4>' +
          '<div class="url">' + c.site_url + '</div>' +
          '<div class="meta">Last synced: ' + synced + '</div></div>' +
          '<div class="actions">' +
          '<span class="status-badge ' + (c.is_active ? 'active' : 'failed') + '">' + (c.is_active ? 'Active' : 'Inactive') + '</span>' +
          '<button class="btn btn-sm btn-secondary" onclick="App.testConnection(\'' + c.id + '\')">Test</button>' +
          '<button class="btn btn-sm btn-secondary" onclick="App.syncSchema(\'' + c.id + '\')">Sync</button>' +
          '<button class="btn btn-sm btn-danger" onclick="App.deleteConnection(\'' + c.id + '\')">Remove</button>' +
          '</div></div>';
      });
    }
    return '<div class="page-header"><div><h2>CMS Connections</h2><p>Manage your connected CMS platforms</p></div>' +
      '<button class="btn btn-primary" onclick="App.showConnectModal()">+ Connect CMS</button></div>' + list;
  },

  connectModal() {
    return '<div class="modal-overlay" onclick="if(event.target===this)App.closeModal()">' +
      '<div class="modal"><h3>Connect CMS Platform</h3>' +
      '<form id="connectForm">' +
      '<div class="form-group"><label>Platform</label><select id="cmsPlatform"><option value="wordpress">WordPress</option><option value="strapi">Strapi</option></select></div>' +
      '<div class="form-group"><label>Site URL</label><input type="url" id="cmsSiteUrl" required placeholder="https://yoursite.com"></div>' +
      '<div id="credFields"></div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>' +
      '<button type="submit" class="btn btn-primary">Connect</button></div>' +
      '</form></div></div>';
  },

  credFieldsFor(platform) {
    if (platform === 'wordpress') {
      return '<div class="form-group"><label>Username</label><input type="text" id="cmsUser" required placeholder="WordPress username"></div>' +
        '<div class="form-group"><label>Application Password</label><input type="password" id="cmsPass" required placeholder="WordPress application password">' +
        '<div class="help-text">Generate an Application Password in WordPress > Users > Profile</div></div>';
    }
    return '<div class="form-group"><label>API Token</label><input type="text" id="cmsToken" required placeholder="Strapi API token">' +
      '<div class="help-text">Create a token in Strapi Admin > Settings > API Tokens</div></div>';
  },

  // === Content Sources Page ===
  contentPage(sources) {
    let list = '';
    if (!sources || sources.length === 0) {
      list = '<div class="empty-state"><div class="icon">\u{1F4DD}</div><h3>No Content Sources</h3>' +
        '<p>Add a Google Doc or Sheet to use as content source</p>' +
        '<button class="btn btn-primary" onclick="App.showSourceModal()">Add Source</button></div>';
    } else {
      sources.forEach(s => {
        const icon = s.source_type === 'google_doc' ? '\u{1F4C4}' : '\u{1F4CA}';
        list += '<div class="connection-card">' +
          '<div class="platform-icon" style="background:var(--primary-bg);color:var(--primary)">' + icon + '</div>' +
          '<div class="info"><h4>' + (s.title || 'Untitled') + '</h4>' +
          '<div class="url">' + s.source_type.replace('_', ' ') + '</div></div>' +
          '<div class="actions">' +
          '<button class="btn btn-sm btn-danger" onclick="App.deleteSource(\'' + s.id + '\')">Remove</button>' +
          '</div></div>';
      });
    }
    return '<div class="page-header"><div><h2>Content Sources</h2><p>Manage your content sources</p></div>' +
      '<button class="btn btn-primary" onclick="App.showSourceModal()">+ Add Source</button></div>' + list;
  },

  sourceModal() {
    return '<div class="modal-overlay" onclick="if(event.target===this)App.closeModal()">' +
      '<div class="modal"><h3>Add Content Source</h3>' +
      '<form id="sourceForm">' +
      '<div class="form-group"><label>Type</label><select id="srcType"><option value="google_doc">Google Doc</option><option value="google_sheet">Google Sheet</option></select></div>' +
      '<div class="form-group"><label>Title</label><input type="text" id="srcTitle" placeholder="My article draft"></div>' +
      '<div class="form-group"><label>URL / Reference</label><input type="url" id="srcRef" required placeholder="https://docs.google.com/document/d/..."></div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>' +
      '<button type="submit" class="btn btn-primary">Add Source</button></div>' +
      '</form></div></div>';
  },

  // === Publish Page ===
  publishPage(connections) {
    let connOpts = '';
    if (connections && connections.length > 0) {
      connections.forEach(c => { connOpts += '<option value="' + c.id + '">' + (c.site_name || c.platform) + ' (' + c.platform + ')</option>'; });
    }
    return '<div class="page-header"><div><h2>Publish Content</h2><p>Prepare and publish content to your CMS</p></div></div>' +
      '<div class="card"><div class="card-header"><h3>Content</h3></div>' +
      '<form id="publishForm">' +
      '<div class="form-group"><label>Title</label><input type="text" id="pubTitle" required placeholder="Article title"></div>' +
      '<div class="form-group"><label>Body (HTML)</label><textarea id="pubBody" placeholder="<p>Your article content here...</p>"></textarea></div>' +
      '<div class="form-group"><label>Slug</label><input type="text" id="pubSlug" placeholder="my-article-slug"></div>' +
      '<div class="form-group"><label>Excerpt</label><textarea id="pubExcerpt" style="min-height:60px" placeholder="Brief summary..."></textarea></div>' +
      '<div class="form-group"><label>Meta Title</label><input type="text" id="pubMetaTitle" placeholder="SEO title"></div>' +
      '<div class="form-group"><label>Meta Description</label><textarea id="pubMetaDesc" style="min-height:60px" placeholder="SEO description (150-160 chars)"></textarea></div>' +
      '<div class="form-group"><label>Target CMS</label><select id="pubTarget" required>' + (connOpts || '<option value="">No connections - add one first</option>') + '</select></div>' +
      '<div class="form-group"><label>Publish Status</label><select id="pubStatus"><option value="draft">Draft</option><option value="publish">Publish Immediately</option></select></div>' +
      '<div style="display:flex;gap:12px;margin-top:20px">' +
      '<button type="button" class="btn btn-secondary" onclick="App.validatePublish()">Validate</button>' +
      '<button type="button" class="btn btn-secondary" onclick="App.preparePublish()">AI Prepare</button>' +
      '<button type="submit" class="btn btn-primary">Publish</button>' +
      '</div></form></div>';
  },

  // === Publications Page ===
  publicationsPage(publications) {
    let list = '';
    if (!publications || publications.length === 0) {
      list = '<div class="empty-state"><div class="icon">\u{1F4E6}</div><h3>No Publications Yet</h3>' +
        '<p>Publish content to see it here</p></div>';
    } else {
      publications.forEach(p => {
        const platform = p.cms_connections ? p.cms_connections.platform : 'unknown';
        const siteName = p.cms_connections ? p.cms_connections.site_name : '';
        const date = new Date(p.created_at).toLocaleDateString();
        list += '<div class="pub-card">' +
          '<div class="pub-header"><span class="pub-title">' + platform + ' - ' + siteName + '</span>' +
          '<span class="status-badge ' + p.status + '">' + p.status + '</span></div>' +
          '<div class="pub-meta">Published: ' + date + (p.error_message ? ' | Error: ' + p.error_message : '') + '</div>' +
          (p.cms_post_url ? '<a class="pub-link" href="' + p.cms_post_url + '" target="_blank">View on CMS \u2192</a>' : '') +
          '<div style="margin-top:8px"><button class="btn btn-sm btn-secondary" onclick="App.auditPublication(\'' + p.id + '\')">SEO Audit</button></div>' +
          '</div>';
      });
    }
    return '<div class="page-header"><div><h2>Publications</h2><p>Track your published content</p></div></div>' + list;
  },

  loading() { return '<div class="loading-page"><div class="spinner"></div></div>'; }
};
