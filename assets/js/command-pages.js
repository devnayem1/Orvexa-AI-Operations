(() => {
  'use strict';
  const page = document.body.dataset.activePage;
  const data = window.Orvexa?.controlPlane;
  const refreshIcons = () => window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  const toast = (message, icon = 'sparkles') => window.showToast?.(message, icon);

  if (page === 'live-operations' && data) {
    const table = document.getElementById('live-request-table');
    const toggle = document.getElementById('live-stream-toggle');
    const status = document.getElementById('live-stream-status');
    const updateState = document.getElementById('live-update-state');
    const app = document.getElementById('live-app-filter');
    const channel = document.getElementById('live-channel-filter');
    const env = document.getElementById('live-env-filter');
    const drawer = document.getElementById('live-request-drawer');
    const drawerBackdrop = document.getElementById('live-request-drawer-backdrop');
    const drawerBody = document.getElementById('live-request-drawer-body');
    const drawerTitle = document.getElementById('live-request-drawer-title');
    let paused = false;
    let sortKey = '';
    let sortDirection = 1;
    let lastUpdated = Date.now() - 2000;
    let returnFocus = null;

    const latencyMs = (value) => { const text = String(value ?? '').trim().toLowerCase(); const amount = parseFloat(text) || 0; return text.endsWith('ms') ? amount : text.endsWith('s') ? amount * 1000 : amount; };
    const visibleRequests = () => data.liveRequests.filter((item) => (app?.value === 'all' || item.appId === app?.value) && (channel?.value === 'all' || item.channel === channel?.value));
    const sortedRequests = () => {
      const rows = [...visibleRequests()];
      if (!sortKey) return rows;
      return rows.sort((a,b) => {
        let av; let bv;
        if (sortKey === 'application') { av = a.app; bv = b.app; }
        else if (sortKey === 'latency') { av = latencyMs(a.latency); bv = latencyMs(b.latency); }
        else if (sortKey === 'status') { av = a.status; bv = b.status; }
        else { av = a.requestId; bv = b.requestId; }
        return (typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))) * sortDirection;
      });
    };
    const renderRows = () => {
      if (!table) return;
      const order = sortedRequests();
      const body = table.closest('tbody') || table;
      order.forEach((req) => {
        const row = table.querySelector(`tr[data-request-id="${req.requestId}"]`);
        if (row) { row.hidden = false; body.append(row); }
      });
      table.querySelectorAll('tr[data-request-id]').forEach((row) => {
        if (!order.some(req => req.requestId === row.dataset.requestId)) row.hidden = true;
      });
    };
    const updateClock = () => {
      if (!updateState) return;
      const seconds = Math.max(0, Math.round((Date.now() - lastUpdated) / 1000));
      const copy = updateState.querySelector('span');
      if (copy) copy.textContent = paused ? 'Paused' : `Live · Updated ${seconds <= 1 ? 'just now' : `${seconds}s ago`}`;
      updateState.classList.toggle('is-paused', paused);
    };
    const refreshTick = () => { if (!paused) lastUpdated = Date.now(); updateClock(); };
    setInterval(() => { if (!paused && Date.now() - lastUpdated >= 4000) lastUpdated = Date.now(); updateClock(); }, 1000);

    const closeDrawer = () => {
      drawer?.classList.remove('open'); drawerBackdrop?.classList.remove('open');
      drawer?.setAttribute('aria-hidden','true'); drawerBackdrop?.setAttribute('aria-hidden','true');
      document.body.style.overflow = ''; returnFocus?.focus?.();
    };
    const requestDetail = (req) => `<div class="command-inspector-hero"><b>${req.requestId} · ${req.traceId}</b><p>${req.app} · ${req.channel} · ${req.route} · ${req.model}</p></div><div class="command-inspector-grid"><div><small>Application</small><b>${req.appId}</b></div><div><small>User / session</small><b>${req.externalUserId} · ${req.sessionId}</b></div><div><small>Latency</small><b>${req.latency}</b></div><div><small>Total cost</small><b>${req.cost}</b></div><div><small>Input tokens</small><b>${(980 + data.liveRequests.indexOf(req) * 81).toLocaleString()}</b></div><div><small>Output tokens</small><b>${(246 + data.liveRequests.indexOf(req) * 23).toLocaleString()}</b></div></div><section class="command-inspector-section"><h3>Execution path</h3><p>${req.path}</p></section><section class="command-inspector-section"><h3>Operational result</h3><p>${req.status}. Route and policy evidence are available in the linked trace.</p></section><div class="command-inspector-actions"><button class="btn-primary" type="button" data-live-open-trace="${req.traceId}"><i data-lucide="git-branch"></i>Open trace</button><button class="btn-secondary" type="button" data-live-copy-request="${req.requestId}"><i data-lucide="copy"></i>Copy request ID</button></div>`;
    const openDrawer = (row) => {
      const req = data.liveRequests.find((item) => item.requestId === row?.dataset.requestId);
      if (!req || !drawer || !drawerBody) return;
      returnFocus = row; if (drawerTitle) drawerTitle.textContent = req.requestId; drawerBody.innerHTML = requestDetail(req);
      drawer.classList.add('open'); drawerBackdrop?.classList.add('open'); drawer.setAttribute('aria-hidden','false'); drawerBackdrop?.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden'; refreshIcons(); document.getElementById('live-request-drawer-close')?.focus();
    };

    [app, channel].forEach((control) => control?.addEventListener('change', () => { renderRows(); refreshTick(); }));
    env?.addEventListener('change', () => { refreshTick(); toast(`${env.options[env.selectedIndex].text} context selected`, 'radio'); });
    document.getElementById('live-filter-reset')?.addEventListener('click', () => {
      if (app) app.value = 'all'; if (channel) channel.value = 'all'; if (env) env.value = 'ENV-PROD-001'; sortKey = ''; sortDirection = 1; renderRows(); refreshTick(); toast('Live Operations filters reset', 'rotate-ccw');
    });
    toggle?.addEventListener('click', () => {
      paused = !paused; toggle.setAttribute('aria-pressed', String(paused));
      const icon = toggle.querySelector('[data-lucide]'); const label = toggle.querySelector('span');
      if (icon) icon.setAttribute('data-lucide', paused ? 'play' : 'pause'); if (label) label.textContent = paused ? 'Resume stream' : 'Pause stream';
      if (status) { status.classList.toggle('is-good', !paused); status.classList.toggle('is-warn', paused); status.innerHTML = `<span></span>${paused ? 'Paused' : 'Streaming'}`; }
      if (!paused) lastUpdated = Date.now(); updateClock(); refreshIcons(); toast(paused ? 'Live request stream paused' : 'Live request stream resumed', paused ? 'pause' : 'play');
    });
    document.querySelectorAll('[data-live-sort]').forEach((button) => button.addEventListener('click', () => {
      const next = button.dataset.liveSort; sortDirection = sortKey === next ? sortDirection * -1 : 1; sortKey = next;
      document.querySelectorAll('[data-live-sort]').forEach((item) => item.classList.toggle('is-active', item === button)); renderRows();
    }));
    table?.addEventListener('click', (event) => { const row = event.target.closest('tr[data-request-id]'); if (row) openDrawer(row); });
    table?.addEventListener('keydown', (event) => { if (!['Enter',' '].includes(event.key)) return; const row = event.target.closest('tr[data-request-id]'); if (!row) return; event.preventDefault(); openDrawer(row); });
    document.getElementById('live-request-drawer-close')?.addEventListener('click', closeDrawer); drawerBackdrop?.addEventListener('click', closeDrawer);
    drawer?.addEventListener('click', (event) => {
      const trace = event.target.closest('[data-live-open-trace]'); if (trace) window.location.href = `./traces.html?trace=${encodeURIComponent(trace.dataset.liveOpenTrace)}`;
      const copy = event.target.closest('[data-live-copy-request]'); if (copy) { navigator.clipboard?.writeText(copy.dataset.liveCopyRequest); toast('Request ID copied', 'copy'); }
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && drawer?.classList.contains('open')) closeDrawer(); });
    updateClock();
  }

  if (page === 'ai-issues') {
    const main = document.querySelector('main');
    const head = main?.querySelector('.p5-head');
    const list = document.getElementById('p5-issue-list');
    if (head && list && !main.querySelector('.command-issue-filters')) {
      const bar = document.createElement('section');
      bar.className = 'command-issue-filters';
      bar.innerHTML = `<select id="issue-severity-filter" aria-label="Issue severity"><option value="all">All severities</option><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option></select><select id="issue-app-filter" aria-label="Affected application"><option value="all">All applications</option><option value="APP-SUPPORT-001">Support AI</option><option value="APP-CONTACT-002">AI Contact Center</option><option value="APP-DOC-003">Document Intelligence</option><option value="APP-GROWTH-004">Growth Assistant</option></select><select id="issue-time-filter" aria-label="Issue time range"><option value="60">Last 1h</option><option value="360">Last 6h</option><option value="1440" selected>Last 24h</option><option value="10080">Last 7d</option></select><button class="p5-btn" type="button" id="issue-filter-reset"><i data-lucide="rotate-ccw"></i>Reset filters</button>`;
      head.insertAdjacentElement('afterend', bar);
      const severity = bar.querySelector('#issue-severity-filter');
      const app = bar.querySelector('#issue-app-filter');
      const time = bar.querySelector('#issue-time-filter');
      const search = main.querySelector('#p5-issue-search');
      const sort = main.querySelector('#p5-issue-sort');
      const count = main.querySelector('#p5-issue-count');
      const apply = () => {
        const query = (search?.value || '').trim().toLowerCase();
        const rows = [...list.querySelectorAll('[data-p5-search]')];
        let visible = 0;
        rows.forEach(item => {
          const hay = item.dataset.p5Search || '';
          const okSeverity = severity.value === 'all' || hay.includes(severity.value.toLowerCase());
          const okApp = app.value === 'all' || hay.includes(app.value.toLowerCase());
          const okTime = Number(item.dataset.p5Age || 0) <= Number(time.value || 1440);
          const okSearch = !query || hay.includes(query);
          item.hidden = !(okSeverity && okApp && okTime && okSearch);
          if (!item.hidden) visible += 1;
        });
        const mode = sort?.value || 'severity';
        rows.sort((a,b) => mode === 'impact' ? Number(b.dataset.p5Impact)-Number(a.dataset.p5Impact) : mode === 'last-seen' ? Number(a.dataset.p5Age)-Number(b.dataset.p5Age) : mode === 'traces' ? Number(b.dataset.p5Traces)-Number(a.dataset.p5Traces) : Number(b.dataset.p5SeverityRank)-Number(a.dataset.p5SeverityRank));
        rows.forEach(row => list.appendChild(row));
        const empty = document.getElementById('p5-issue-empty'); if (empty) empty.hidden = visible > 0;
        if (count) count.textContent = `Showing ${visible} active cluster${visible === 1 ? '' : 's'}`;
      };
      [severity, app, time, sort].forEach(control => control?.addEventListener('change', apply));
      search?.addEventListener('input', apply);
      bar.querySelector('#issue-filter-reset').addEventListener('click', () => { severity.value = 'all'; app.value = 'all'; time.value = '1440'; if (search) search.value = ''; if (sort) sort.value = 'severity'; apply(); toast('Issue filters reset', 'rotate-ccw'); });
      apply();
      refreshIcons();
    }
  }

  if (page === 'approval-center') {
    const queue = document.getElementById('approval-queue');
    const search = document.getElementById('approval-search');
    const risk = document.getElementById('approval-risk-filter');
    const age = document.getElementById('approval-age-filter');
    const empty = document.getElementById('approval-empty');
    const apply = () => {
      const q = (search?.value || '').trim().toLowerCase(); let visible = 0;
      queue?.querySelectorAll('.approval-item').forEach((item) => {
        const text = item.textContent.toLowerCase(); const riskText = item.querySelector('.approval-risk')?.textContent.trim() || '';
        const ageText = item.querySelector('.approval-meta small')?.textContent || ''; const mins = Number((ageText.match(/(\d+)m/) || [0,999])[1]);
        const ageOk = age?.value === 'all' || (age?.value === '10' && mins < 10) || (age?.value === '20' && mins < 20) || (age?.value === 'older' && mins >= 20);
        const priorityHidden = item.classList.contains('is-overflow') && !queue.classList.contains('show-all');
        const show = (!q || text.includes(q)) && (risk?.value === 'all' || riskText === risk?.value) && ageOk && !priorityHidden;
        item.hidden = !show; if (show) visible += 1;
      }); if (empty) empty.hidden = visible > 0;
    };
    search?.addEventListener('input', apply); risk?.addEventListener('change', apply); age?.addEventListener('change', apply);
  }
})();
