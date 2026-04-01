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
      '<a href="#/gsc" class="' + (active === 'gsc' ? 'active' : '') + '"><span class="icon">\u{1F50D}</span> Search Console</a>' +
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
      '<a href="#/gsc" class="btn btn-secondary">Search Console</a>' +
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
      '<button class="btn btn-primary" onclick="App.showConnectModal()">+ Connect CMS</button></div>' +
      list;
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
      '<button class="btn btn-primary" onclick="App.showSourceModal()">+ Add Source</button></div>' +
      list;
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
      connections.forEach(c => {
        connOpts += '<option value="' + c.id + '">' + (c.site_name || c.platform) + ' (' + c.platform + ')</option>';
      });
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
      '<div class="form-group"><label>Target CMS</label><select id="pubTarget" required>' +
      (connOpts || '<option value="">No connections - add one first</option>') +
      '</select></div>' +
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
    return '<div class="page-header"><div><h2>Publications</h2><p>Track your published content</p></div></div>' +
      list;
  },

  // === Google Search Console Page ===
  gscPage(connections, topPages, activeConn, perfData) {
    if (!connections || connections.length === 0) {
      return '<div class="page-header"><div><h2>Search Console</h2><p>Google Search Console performance data</p></div></div>' +
        '<div class="empty-state">' +
        '<div class="icon">\u{1F50D}</div>' +
        '<h3>No Search Console Connected</h3>' +
        '<p>Connect your Google Search Console to view search performance data</p>' +
        '<button class="btn btn-primary" onclick="App.connectGSC()">Connect Google Search Console</button>' +
        '</div>';
    }

    let connList = '';
    connections.forEach(c => {
      const isActive = activeConn && activeConn === c.id;
      connList += '<div class="connection-card" style="' + (isActive ? 'border-color:var(--primary)' : '') + ';cursor:pointer" onclick="App.viewGSCData(\'' + c.id + '\')">' +
        '<div class="platform-icon" style="background:#4285f4;color:#fff">G</div>' +
        '<div class="info"><h4>' + c.site_url + '</h4>' +
        '<div class="meta">Connected: ' + new Date(c.created_at).toLocaleDateString() + '</div></div>' +
        '<div class="actions">' +
        (isActive ? '<span class="status-badge active">Active</span>' : '<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();App.viewGSCData(\'' + c.id + '\')">View Data</button>') +
        '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();App.deleteGSCConnection(\'' + c.id + '\')">Disconnect</button>' +
        '</div></div>';
    });

    let header = '<div class="page-header"><div><h2>Search Console</h2><p>Google Search Console performance data</p></div>' +
      '<button class="btn btn-primary" onclick="App.showGSCSitePicker()">+ Add Property</button></div>';

    let summarySection = '';
    if (activeConn && topPages && topPages.length > 0) {
      let totalClicks = 0, totalImpressions = 0, totalCtr = 0, totalPosition = 0;
      topPages.forEach(p => {
        totalClicks += (p.clicks || 0);
        totalImpressions += (p.impressions || 0);
        totalCtr += (p.ctr || 0);
        totalPosition += (p.position || 0);
      });
      const avgCtr = topPages.length > 0 ? (totalCtr / topPages.length * 100).toFixed(1) : '0.0';
      const avgPos = topPages.length > 0 ? (totalPosition / topPages.length).toFixed(1) : '0.0';
      summarySection = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:24px 0">' +
        '<div class="card"><div style="font-size:28px;font-weight:700;color:#4285f4">' + totalClicks.toLocaleString() + '</div><div style="color:var(--text-muted);font-size:13px;margin-top:4px">Total Clicks</div></div>' +
        '<div class="card"><div style="font-size:28px;font-weight:700;color:#9b59b6">' + totalImpressions.toLocaleString() + '</div><div style="color:var(--text-muted);font-size:13px;margin-top:4px">Total Impressions</div></div>' +
        '<div class="card"><div style="font-size:28px;font-weight:700;color:#2ecc71">' + avgCtr + '%</div><div style="color:var(--text-muted);font-size:13px;margin-top:4px">Avg CTR</div></div>' +
        '<div class="card"><div style="font-size:28px;font-weight:700;color:#f39c12">' + avgPos + '</div><div style="color:var(--text-muted);font-size:13px;margin-top:4px">Avg Position</div></div>' +
        '</div>';
    }

    let chartSection = '';
    if (activeConn && perfData && perfData.length > 0) {
      chartSection = '<div class="card" style="margin-bottom:24px"><div class="card-header"><h3>Performance Trend</h3></div>' +
        '<div id="gscChart" style="padding:16px">' + UI.gscPerformanceChart(perfData) + '</div></div>';
    }


    let trendSection = '';
    if (performanceData && performanceData.length > 0) {
      trendSection = '<div class="card" style="margin-bottom:16px"><div class="card-header"><h3>Performance Trend</h3></div>' +
        '<div id="gscTrendChart" style="height:200px;position:relative;overflow:hidden">' + UI.gscTrendChart(performanceData) + '</div></div>';
    }

    let dataSection = '';
    if (activeConn) {
      dataSection = '<div class="card"><div class="card-header" style="display:flex;justify-content:space-between;align-items:center"><h3>Top Pages</h3>' +
        '<div style="display:flex;gap:8px">' +
        '<select id="gscDays" onchange="App.viewGSCData(\'' + activeConn + '\')">' +
        '<option value="7">Last 7 days</option>' +
        '<option value="28" selected>Last 28 days</option>' +
        '<option value="90">Last 90 days</option></select></div></div>' +
        UI.gscTopPagesTable(topPages, activeConn) +
        '</div>';
    }

    return header + connList + summarySection + chartSection + dataSection;
  },

  gscPerformanceChart(perfData) {
    if (!perfData || perfData.length === 0) return '<div style="text-align:center;color:var(--text-muted);padding:20px">No performance data</div>';
    const maxClicks = Math.max(...perfData.map(d => d.clicks || 0), 1);
    const maxImpressions = Math.max(...perfData.map(d => d.impressions || 0), 1);
    const barWidth = Math.max(Math.floor(100 / perfData.length) - 1, 2);
    let bars = '';
    perfData.forEach((d, i) => {
      const date = d.keys ? d.keys[0] : '';
      const shortDate = date.slice(5);
      const clickH = Math.round((d.clicks || 0) / maxClicks * 120);
      const impH = Math.round((d.impressions || 0) / maxImpressions * 120);
      bars += '<div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:0">' +
        '<div style="display:flex;align-items:flex-end;gap:2px;height:120px">' +
        '<div style="width:' + Math.max(barWidth/2, 6) + 'px;height:' + clickH + 'px;background:#4285f4;border-radius:2px 2px 0 0" title="Clicks: ' + (d.clicks||0) + '"></div>' +
        '<div style="width:' + Math.max(barWidth/2, 6) + 'px;height:' + impH + 'px;background:rgba(155,89,182,0.5);border-radius:2px 2px 0 0" title="Impressions: ' + (d.impressions||0) + '"></div>' +
        '</div>' +
        (i % Math.ceil(perfData.length / 7) === 0 ? '<div style="font-size:10px;color:var(--text-muted);margin-top:4px;white-space:nowrap">' + shortDate + '</div>' : '<div style="height:18px"></div>') +
        '</div>';
    });
    return '<div style="display:flex;gap:2px;align-items:flex-end;margin-bottom:8px">' +
      '<div style="display:flex;flex-direction:column;justify-content:space-between;height:120px;margin-right:8px;font-size:10px;color:var(--text-muted)"><span>' + maxClicks.toLocaleString() + '</span><span>0</span></div>' +
      bars + '</div>' +
      '<div style="display:flex;gap:16px;justify-content:center;margin-top:12px;font-size:12px">' +
      '<span><span style="display:inline-block;width:12px;height:12px;background:#4285f4;border-radius:2px;margin-right:4px;vertical-align:middle"></span>Clicks</span>' +
      '<span><span style="display:inline-block;width:12px;height:12px;background:rgba(155,89,182,0.5);border-radius:2px;margin-right:4px;vertical-align:middle"></span>Impressions</span></div>';
  },


  gscTrendChart(data) {
    if (!data || data.length === 0) return '<div style="padding:20px;text-align:center;color:var(--text-muted)">No trend data</div>';
    const maxClicks = Math.max(...data.map(d => d.clicks || 0), 1);
    const maxImpressions = Math.max(...data.map(d => d.impressions || 0), 1);
    const w = 100, h = 160, pad = 30;
    let cPath = '', iPath = '';
    const sp = data.length > 1 ? (w - 2) / (data.length - 1) : 0;
    data.forEach((d, i) => {
      const x = (i * sp + 1).toFixed(2);
      const yC = (h - pad - ((d.clicks || 0) / maxClicks) * (h - pad - 10)).toFixed(2);
      const yI = (h - pad - ((d.impressions || 0) / maxImpressions) * (h - pad - 10)).toFixed(2);
      cPath += (i === 0 ? 'M' : 'L') + x + ',' + yC;
      iPath += (i === 0 ? 'M' : 'L') + x + ',' + yI;
    });
    let labels = '';
    const step = Math.max(1, Math.floor(data.length / 6));
    data.forEach((d, i) => {
      if (i % step === 0 || i === data.length - 1) {
        const x = (i * sp + 1).toFixed(2);
        const lbl = (d.keys && d.keys[0]) ? d.keys[0].substring(5) : '';
        labels += '<text x="' + x + '" y="' + (h - 5) + '" fill="var(--text-dim)" font-size="3" text-anchor="middle">' + lbl + '</text>';
      }
    });
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:100%" preserveAspectRatio="none">' +
      '<path d="' + iPath + '" fill="none" stroke="#9b59b6" stroke-width="0.5" opacity="0.6"/>' +
      '<path d="' + cPath + '" fill="none" stroke="#4285f4" stroke-width="0.8"/>' + labels + '</svg>' +
      '<div style="position:absolute;top:8px;right:12px;display:flex;gap:16px;font-size:11px">' +
      '<span style="color:#4285f4">\u25CF Clicks</span><span style="color:#9b59b6">\u25CF Impressions</span></div>';
  },

  gscTopPagesTable(pages, connId) {
    if (!pages || pages.length === 0) return '<div style="padding:20px;text-align:center;color:var(--text-muted)">No data available for this period</div>';
    let rows = '';
    pages.forEach(p => {
      rows += '<tr><td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
        '<a href="#" onclick="App.viewPageQueries(\'' + connId + '\',\'' + encodeURIComponent(p.keys[0]) + '\');return false" style="color:var(--primary)">' +
        p.keys[0] + '</a></td>' +
        '<td style="text-align:right">' + (p.clicks || 0).toLocaleString() + '</td>' +
        '<td style="text-align:right">' + (p.impressions || 0).toLocaleString() + '</td>' +
        '<td style="text-align:right">' + ((p.ctr || 0) * 100).toFixed(1) + '%</td>' +
        '<td style="text-align:right">' + (p.position || 0).toFixed(1) + '</td></tr>';
    });
    return '<table class="data-table"><thead><tr><th>Page</th><th style="text-align:right">Clicks</th><th style="text-align:right">Impressions</th><th style="text-align:right">CTR</th><th style="text-align:right">Avg Position</th></tr></thead><tbody>' + rows + '</tbody></table>';
  },

  gscPageQueriesModal(queries, pageUrl) {
    let rows = '';
    if (queries && queries.length > 0) {
      queries.forEach(q => {
        rows += '<tr><td>' + q.keys[0] + '</td><td style="text-align:right">' + (q.clicks || 0).toLocaleString() + '</td>' +
          '<td style="text-align:right">' + (q.impressions || 0).toLocaleString() + '</td>' +
          '<td style="text-align:right">' + ((q.ctr || 0) * 100).toFixed(1) + '%</td>' +
          '<td style="text-align:right">' + (q.position || 0).toFixed(1) + '</td></tr>';
      });
    }
    const decodedUrl = decodeURIComponent(pageUrl || '');
    return '<div class="modal-overlay" onclick="if(event.target===this)App.closeModal()">' +
      '<div class="modal" style="max-width:800px"><h3>Queries for Page</h3>' +
      '<p style="color:var(--text-muted);font-size:13px;word-break:break-all;margin-bottom:16px">' + decodedUrl + '</p>' +
      (rows ? '<table class="data-table"><thead><tr><th>Query</th><th style="text-align:right">Clicks</th><th style="text-align:right">Impressions</th><th style="text-align:right">CTR</th><th style="text-align:right">Position</th></tr></thead><tbody>' + rows + '</tbody></table>'
        : '<p style="text-align:center;color:var(--text-muted)">No query data available</p>') +
      '<div class="modal-actions"><button class="btn btn-secondary" onclick="App.closeModal()">Close</button></div></div></div>';
  },

  gscSitePickerModal(sites) {
    let siteList = '';
    if (!sites || sites.length === 0) {
      siteList = '<p style="text-align:center;color:var(--text-muted);padding:20px">No sites found in your Google Search Console account.</p>';
    } else {
      sites.forEach(s => {
        const isDomain = s.site_url.startsWith('sc-domain:');
        const icon = isDomain ? '\u{1F310}' : '\u{1F517}';
        const typeLabel = isDomain ? 'Domain property' : 'URL prefix';
        const permLabel = s.permission_level === 'siteOwner' ? 'Owner' : s.permission_level === 'siteFullUser' ? 'Full' : s.permission_level === 'siteRestrictedUser' ? 'Restricted' : s.permission_level;
        const permClass = s.permission_level === 'siteOwner' ? 'active' : s.permission_level === 'siteFullUser' ? 'active' : 'pending';
        siteList += '<div class="connection-card" style="cursor:pointer;transition:border-color 0.2s" onmouseover="this.style.borderColor=\'var(--primary)\'" onmouseout="this.style.borderColor=\'\'" onclick="App.selectGSCSite(\'' + s.site_url.replace(/'/g, "\\\'") + '\')">' +
          '<div class="platform-icon" style="background:#4285f4;color:#fff;font-size:20px">' + icon + '</div>' +
          '<div class="info"><h4>' + s.site_url + '</h4><div class="meta">' + typeLabel + '</div></div>' +
          '<div class="actions"><span class="status-badge ' + permClass + '">' + permLabel + '</span></div></div>';
      });
    }
    return '<div class="modal-overlay" onclick="if(event.target===this)App.closeModal()">' +
      '<div class="modal" style="max-width:600px"><h3>Select a Search Console Property</h3>' +
      '<p style="color:var(--text-muted);margin-bottom:16px">Choose a property to connect from your Google Search Console account</p>' +
      '<div id="gscSiteList">' + siteList + '</div>' +
      '<div class="modal-actions"><button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button></div></div></div>';
  },

  gscSitePickerLoading() {
    return '<div class="modal-overlay" onclick="if(event.target===this)App.closeModal()">' +
      '<div class="modal" style="max-width:600px"><h3>Loading Properties...</h3>' +
      '<div class="loading-page" style="min-height:120px"><div class="spinner"></div></div>' +
      '<p style="text-align:center;color:var(--text-muted)">Fetching your Google Search Console properties...</p></div></div>';
  },

  loading() {
    return '<div class="loading-page"><div class="spinner"></div></div>';
  }
};
