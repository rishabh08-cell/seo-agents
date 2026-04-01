// Main Application Controller
const App = {
  modal: null,
  render(html) { document.getElementById('app').innerHTML = html; },
  closeModal() { if (this.modal) { this.modal.remove(); this.modal = null; } },
  showModal(html) {
    this.closeModal();
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
    this.modal = div;
  },
  logout() { API.logout(); localStorage.removeItem('user'); Router.navigate('/login'); },

  // Auth
  bindLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Signing in...';
      try {
        const data = await API.login(document.getElementById('loginEmail').value, document.getElementById('loginPass').value);
        localStorage.setItem('user', JSON.stringify(data.user));
        Router.navigate('/');
      } catch (err) { UI.toast(err.message, 'error'); btn.disabled = false; btn.textContent = 'Sign In'; }
    };
  },
  bindSignup() {
    const form = document.getElementById('signupForm');
    if (!form) return;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Creating...';
      try {
        const data = await API.signup(document.getElementById('signupEmail').value, document.getElementById('signupPass').value, document.getElementById('signupName').value);
        localStorage.setItem('user', JSON.stringify(data.user));
        Router.navigate('/');
      } catch (err) { UI.toast(err.message, 'error'); btn.disabled = false; btn.textContent = 'Create Account'; }
    };
  },

  // CMS Connections
  async showConnectModal() {
    this.showModal(UI.connectModal());
    const platSel = document.getElementById('cmsPlatform');
    const credDiv = document.getElementById('credFields');
    const updateCreds = () => { credDiv.innerHTML = UI.credFieldsFor(platSel.value); };
    platSel.onchange = updateCreds;
    updateCreds();
    document.getElementById('connectForm').onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Connecting...';
      try {
        const platform = platSel.value;
        const site_url = document.getElementById('cmsSiteUrl').value;
        let credentials = {};
        if (platform === 'wordpress') {
          credentials = { username: document.getElementById('cmsUser').value, application_password: document.getElementById('cmsPass').value };
        } else {
          credentials = { api_token: document.getElementById('cmsToken').value };
        }
        await API.connectCMS(platform, site_url, credentials);
        UI.toast('CMS connected successfully!', 'success');
        this.closeModal();
        Router.navigate('/connections');
      } catch (err) { UI.toast(err.message, 'error'); btn.disabled = false; btn.textContent = 'Connect'; }
    };
  },
  async testConnection(id) {
    try { const r = await API.testConnection(id); UI.toast(r.valid ? 'Connection is valid!' : 'Connection failed', r.valid ? 'success' : 'error'); } catch (err) { UI.toast(err.message, 'error'); }
  },
  async syncSchema(id) {
    try { await API.syncSchema(id); UI.toast('Schema synced!', 'success'); } catch (err) { UI.toast(err.message, 'error'); }
  },
  async deleteConnection(id) {
    if (!confirm('Remove this CMS connection?')) return;
    try { await API.deleteConnection(id); UI.toast('Connection removed', 'success'); Router.navigate('/connections'); } catch (err) { UI.toast(err.message, 'error'); }
  },

  // Content Sources
  showSourceModal() {
    this.showModal(UI.sourceModal());
    document.getElementById('sourceForm').onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type=submit]');
      btn.disabled = true;
      try {
        await API.addSource(document.getElementById('srcType').value, document.getElementById('srcRef').value, document.getElementById('srcTitle').value);
        UI.toast('Source added!', 'success');
        this.closeModal();
        Router.navigate('/content');
      } catch (err) { UI.toast(err.message, 'error'); btn.disabled = false; }
    };
  },
  async deleteSource(id) {
    if (!confirm('Remove this content source?')) return;
    try { await API.deleteSource(id); UI.toast('Source removed', 'success'); Router.navigate('/content'); } catch (err) { UI.toast(err.message, 'error'); }
  },

  // Publish
  getPublishContent() {
    const slug = document.getElementById('pubSlug').value || document.getElementById('pubTitle').value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      title: document.getElementById('pubTitle').value,
      body: document.getElementById('pubBody').value,
      body_format: 'html',
      slug: slug,
      excerpt: document.getElementById('pubExcerpt').value,
      status: document.getElementById('pubStatus').value,
      seo: { meta_title: document.getElementById('pubMetaTitle').value || document.getElementById('pubTitle').value, meta_description: document.getElementById('pubMetaDesc').value, slug: slug }
    };
  },
  async validatePublish() {
    try {
      const content = this.getPublishContent();
      const target = document.getElementById('pubTarget').value;
      const r = await API.validateContent(content, target);
      if (r.is_ready) { UI.toast('Content is ready to publish!', 'success'); }
      else { UI.toast('Issues found: ' + r.missing.length, 'warning'); alert('Validation issues:\n\n' + r.missing.map(m => m.label + ': ' + m.reason).join('\n')); }
    } catch (err) { UI.toast(err.message, 'error'); }
  },
  async preparePublish() {
    try {
      const content = this.getPublishContent();
      const target = document.getElementById('pubTarget').value;
      UI.toast('Running AI preparation...', 'info');
      const r = await API.prepareContent(content, target);
      if (r.result && r.result.content) {
        const c = r.result.content;
        if (c.title) document.getElementById('pubTitle').value = c.title;
        if (c.slug) document.getElementById('pubSlug').value = c.slug;
        if (c.excerpt) document.getElementById('pubExcerpt').value = c.excerpt;
        if (c.seo) { if (c.seo.meta_title) document.getElementById('pubMetaTitle').value = c.seo.meta_title; if (c.seo.meta_description) document.getElementById('pubMetaDesc').value = c.seo.meta_description; }
        UI.toast('AI preparation complete!', 'success');
      }
    } catch (err) { UI.toast(err.message, 'error'); }
  },
  bindPublish() {
    const form = document.getElementById('publishForm');
    if (!form) return;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Publishing...';
      try {
        const content = this.getPublishContent();
        const target = document.getElementById('pubTarget').value;
        if (!target) { UI.toast('Select a target CMS', 'error'); btn.disabled = false; btn.textContent = 'Publish'; return; }
        const r = await API.publish([target], content, content.status);
        const pub = r.publications && r.publications[0];
        if (pub && pub.success) { UI.toast('Published successfully!', 'success'); Router.navigate('/publications'); }
        else { UI.toast('Publish failed: ' + (pub ? pub.error : 'Unknown error'), 'error'); btn.disabled = false; btn.textContent = 'Publish'; }
      } catch (err) { UI.toast(err.message, 'error'); btn.disabled = false; btn.textContent = 'Publish'; }
    };
  },
  async auditPublication(id) {
    try { UI.toast('Running SEO audit...', 'info'); const r = await API.auditPublication(id); alert('SEO Audit Results:\n\n' + JSON.stringify(r.audit, null, 2)); } catch (err) { UI.toast(err.message, 'error'); }
  },

  // Google Search Console
  _gscActiveConn: null,

  async connectGSC() {
    try {
      UI.toast('Checking Google connection...', 'info');
      const sitesData = await API.getGSCSites();
      if (sitesData.sites && sitesData.sites.length > 0) {
        App.showModal(UI.gscSitePickerModal(sitesData.sites));
        return;
      }
    } catch (e) {
      // No tokens yet - need OAuth
    }
    try {
      UI.toast('Getting Google authorization URL...', 'info');
      const r = await API.getGSCAuthUrl();
      if (r.url) {
        window.open(r.url, '_blank', 'width=600,height=700');
        UI.toast('Complete Google sign-in in the popup, then refresh.', 'info');
      } else {
        UI.toast('Could not get authorization URL. Check Google OAuth credentials.', 'error');
      }
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  },

  async showGSCSitePicker() {
    try {
      App.showModal(UI.gscSitePickerLoading());
      const sitesData = await API.getGSCSites();
      if (sitesData.sites && sitesData.sites.length > 0) {
        App.closeModal();
        App.showModal(UI.gscSitePickerModal(sitesData.sites));
      } else {
        App.closeModal();
        UI.toast('No properties found. Make sure you have sites in Google Search Console.', 'warning');
      }
    } catch (err) {
      App.closeModal();
      App.connectGSC();
    }
  },

  async selectGSCSite(siteUrl) {
    try {
      UI.toast('Connecting ' + siteUrl + '...', 'info');
      const r = await API.connectGSCSite(siteUrl);
      App.closeModal();
      UI.toast('Connected ' + siteUrl + ' successfully!', 'success');
      App._gscActiveConn = r.connection ? r.connection.id : null;
      Router.navigate('/gsc');
    } catch (err) {
      UI.toast('Failed to connect site: ' + err.message, 'error');
    }
  },

  async viewGSCData(connId) {
    this._gscActiveConn = connId;
    try {
      const daysEl = document.getElementById('gscDays');
      const days = daysEl ? daysEl.value : 28;
      const [conns, topPages, perfData] = await Promise.all([
        API.getGSCConnections(),
        API.getGSCTopPages(connId, days),
        API.getGSCPerformance(connId, days)
      ]);
      App.render(UI.layout(UI.gscPage(conns.connections, topPages.rows || [], connId, perfData.rows || []), 'gsc'));
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  },

  async viewPageQueries(connId, encodedUrl) {
    try {
      const pageUrl = decodeURIComponent(encodedUrl);
      UI.toast('Loading queries...', 'info');
      const r = await API.getGSCPageQueries(connId, pageUrl);
      App.showModal(UI.gscPageQueriesModal(r.rows || [], encodedUrl));
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  },

  async deleteGSCConnection(id) {
    if (!confirm('Disconnect this Search Console property?')) return;
    try {
      await API.deleteGSCConnection(id);
      if (App._gscActiveConn === id) App._gscActiveConn = null;
      UI.toast('Disconnected', 'success');
      Router.navigate('/gsc');
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }
};

Router.add('/login', () => { App.render(UI.loginPage()); App.bindLogin(); });
Router.add('/signup', () => { App.render(UI.signupPage()); App.bindSignup(); });

Router.add('/', async () => {
  App.render(UI.layout(UI.loading(), 'dashboard'));
  try {
    const [conns, pubs] = await Promise.all([API.getConnections(), API.getPublications()]);
    App.render(UI.layout(UI.dashboardPage(conns.connections, pubs.publications), 'dashboard'));
  } catch (err) {
    App.render(UI.layout('<div class="empty-state"><h3>Welcome!</h3><p>Get started by connecting a CMS.</p><a href="#/connections" class="btn btn-primary">Connect CMS</a></div>', 'dashboard'));
  }
});

Router.add('/connections', async () => {
  App.render(UI.layout(UI.loading(), 'connections'));
  try { const data = await API.getConnections(); App.render(UI.layout(UI.connectionsPage(data.connections), 'connections')); }
  catch (err) { UI.toast(err.message, 'error'); }
});

Router.add('/content', async () => {
  App.render(UI.layout(UI.loading(), 'content'));
  try { const data = await API.getSources(); App.render(UI.layout(UI.contentPage(data.sources), 'content')); }
  catch (err) { UI.toast(err.message, 'error'); }
});

Router.add('/publish', async () => {
  App.render(UI.layout(UI.loading(), 'publish'));
  try { const data = await API.getConnections(); App.render(UI.layout(UI.publishPage(data.connections), 'publish')); App.bindPublish(); }
  catch (err) { UI.toast(err.message, 'error'); }
});

Router.add('/publications', async () => {
  App.render(UI.layout(UI.loading(), 'publications'));
  try { const data = await API.getPublications(); App.render(UI.layout(UI.publicationsPage(data.publications), 'publications')); }
  catch (err) { UI.toast(err.message, 'error'); }
});

Router.add('/gsc', async () => {
  App.render(UI.layout(UI.loading(), 'gsc'));
  try {
    const data = await API.getGSCConnections();
    const connections = data.connections || [];
    if (connections.length > 0 && !App._gscActiveConn) App._gscActiveConn = connections[0].id;
    if (App._gscActiveConn) {
      const [topPages, perfData] = await Promise.all([
        API.getGSCTopPages(App._gscActiveConn, 28),
        API.getGSCPerformance(App._gscActiveConn, 28)
      ]);
      App.render(UI.layout(UI.gscPage(connections, topPages.rows || [], App._gscActiveConn, perfData.rows || []), 'gsc'));
    } else {
      App.render(UI.layout(UI.gscPage(connections, null, null, null), 'gsc'));
    }
  } catch (err) {
    App.render(UI.layout(UI.gscPage(null, null, null, null), 'gsc'));
  }
});

// Handle GSC OAuth callback
if (window.location.search.includes('code=')) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    API.handleGSCCallback(code).then(async () => {
      UI.toast('Google account connected!', 'success');
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
      try {
        const sitesData = await API.getGSCSites();
        if (sitesData.sites && sitesData.sites.length > 0) {
          App.showModal(UI.gscSitePickerModal(sitesData.sites));
        } else {
          UI.toast('No GSC properties found. Add a property in Google Search Console first.', 'warning');
          Router.navigate('/gsc');
        }
      } catch (e) {
        Router.navigate('/gsc');
      }
    }).catch(err => {
      UI.toast('GSC connection failed: ' + err.message, 'error');
    });
  }
}

Router.start();
