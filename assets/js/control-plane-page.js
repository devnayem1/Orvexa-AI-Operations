(() => {
  'use strict';
  const data = window.Orvexa?.controlPlane;
  const ui = window.Orvexa?.controlComponents;
  if (!data || !ui) return;
  const page = document.currentScript?.dataset.page || '';
  const refreshIcons = () => window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });

  function renderApplications() {
    const host = document.getElementById('applications-grid');
    if (host) host.innerHTML = data.applications.map(ui.applicationCard).join('');
    const chart = document.getElementById('application-traffic-chart');
    if (chart && window.ApexCharts) {
      new ApexCharts(chart, {
        chart: { type: 'donut', height: 300, background: 'transparent', toolbar: { show: false } },
        series: [612, 428, 184, 96], labels: data.applications.map(a => a.name),
        colors: ['#f2bd4f','#4ed6c4','#66d69a','#f4a84c'],
        stroke: { width: 0 }, legend: { position: 'bottom', labels: { colors: '#91a2b1' }, fontSize: '12px' },
        dataLabels: { enabled: false }, plotOptions: { pie: { donut: { size: '72%', labels: { show: true, total: { show: true, label: '30D requests', color: '#91a2b1', formatter: () => '1.32M' }, value: { color: '#edf3f7', fontSize: '24px', fontWeight: 800 } } } } },
        tooltip: { theme: 'dark' }
      }).render();
    }
  }

  function metricMarkup(label, value, detail, accent, icon, bars) {
    const visual = (bars || [42, 58, 72, 64, 86]).map(height => `<span style="--bar-height:${height}%"></span>`).join('');
    return `<article class="cp-metric" style="--cp-accent:${accent}"><div class="cp-metric-head"><span class="cp-metric-icon"><i data-lucide="${icon}"></i></span><span class="cp-metric-pulse"></span></div><div class="cp-metric-content"><div class="cp-metric-copy"><p>${label}</p><strong>${value}</strong><small>${detail}</small></div><div class="cp-metric-visual" aria-hidden="true">${visual}</div></div></article>`;
  }

  function renderLive() {
    const metrics = document.getElementById('live-metrics');
    if (metrics) metrics.innerHTML = [
      ['Requests / min','2,842','Across 4 production apps','var(--primary-2)','activity',[36,48,56,70,88]],
      ['Active AI sessions','343','96 contact-center sessions','var(--cyan)','radio-tower',[42,54,68,62,84]],
      ['Running agents','7','3 approval-bound runs','var(--mint)','bot',[28,44,52,66,82]],
      ['P95 end-to-end','1.42s','80ms SLO headroom · target 1.50s','var(--amber)','gauge',[82,72,61,52,44]],
    ].map(x => metricMarkup(...x)).join('');
    const table = document.getElementById('live-request-table');
    if (table) table.innerHTML = data.liveRequests.map(ui.requestRow).join('');
  }

  function renderRequests() {
    const host = document.getElementById('request-ledger');
    const table = document.getElementById('request-table');
    const input = document.getElementById('request-filter');
    const meta = document.getElementById('request-page-meta');
    const label = document.getElementById('request-page-label');
    const prev = document.getElementById('request-prev');
    const next = document.getElementById('request-next');
    const pageSizeControl = document.getElementById('request-page-size');
    const appFilter = document.getElementById('request-app-filter');
    const channelFilter = document.getElementById('request-channel-filter');
    const statusFilter = document.getElementById('request-status-filter');
    const rangeFilter = document.getElementById('request-range-filter');
    const envFilter = document.getElementById('request-env-filter');
    const sortControl = document.getElementById('request-sort');
    const requestedRequest = new URLSearchParams(window.location.search).get('request');
    if (requestedRequest && input) input.value = requestedRequest;
    const empty = document.getElementById('request-empty');
    const drawer = document.getElementById('request-drawer');
    const drawerBackdrop = document.getElementById('request-drawer-backdrop');
    const drawerBody = document.getElementById('request-drawer-body');
    const drawerTitle = document.getElementById('request-drawer-title');
    const outcomePeriod = document.getElementById('request-outcome-period');
    const routePeriod = document.getElementById('request-cost-period');
    const routeHost = document.getElementById('request-route-costs');
    const analytics = data.requestAnalytics || {};
    const demoRecordLimit = Math.min(100, Number(analytics.demoRecordLimit || 100));
    const rangeLabels = { '24h': 'Last 24 hours', '7d': 'Last 7 days', '30d': 'Last 30 days' };
    const rangeFactors = { '24h': 1/30, '7d': 7/30, '30d': 1 };
    let pageSize = Number(pageSizeControl?.value || 25);
    let pageIndex = 0;
    let pool = [];
    let totalMatches = demoRecordLimit;
    let currentRows = [];
    let returnFocus = null;
    let outcomeChart = null;

    const latencyNumber = value => { const text = String(value ?? '').trim().toLowerCase(); const amount = parseFloat(text) || 0; return text.endsWith('ms') ? amount : text.endsWith('s') ? amount * 1000 : amount; };
    const costNumber = value => parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    const shortNumber = value => value >= 1000000 ? `${(value/1000000).toFixed(value >= 10000000 ? 1 : 2).replace(/\.0+$/,'')}M` : value >= 1000 ? `${(value/1000).toFixed(value >= 100000 ? 0 : 1).replace(/\.0$/,'')}K` : String(Math.round(value));
    const money = value => value >= 1000 ? `$${(value/1000).toFixed(value >= 10000 ? 1 : 2).replace(/\.0$/,'')}K` : `$${Math.round(value).toLocaleString()}`;
    const quote = value => `"${String(value ?? '').replaceAll('"','""')}"`;

    if (appFilter) {
      [...new Map(data.liveRequests.map(item => [item.appId, item.app])).entries()].forEach(([id, name]) => {
        const option = document.createElement('option'); option.value = id; option.textContent = name; appFilter.append(option);
      });
    }

    const closeDrawer = () => {
      drawer?.classList.remove('open'); drawerBackdrop?.classList.remove('open');
      drawer?.setAttribute('aria-hidden', 'true'); drawerBackdrop?.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
      returnFocus?.focus?.();
    };

    const requestContext = req => {
      const profiles = {
        'APP-CONTACT-002': { prompt:'PRM-VOICE-11 v11.7', knowledge:'KB-CONTACT-02 · 4 retrieved chunks', tools:'CRM lookup · Billing context', guardrail:'POL-VOICE-04 · passed', cache:'21% route cache' },
        'APP-SUPPORT-001': { prompt:'PRM-SUPPORT-18 v18.4', knowledge:'KB-SUPPORT-01 · 6 retrieved chunks', tools:req.path.includes('Refund') ? 'Account lookup · Refund tool' : 'Account lookup', guardrail:req.status === 'Guardrail retry' ? 'POL-SUPPORT-07 · retry allowed' : 'POL-SUPPORT-07 · passed', cache:'68% route cache' },
        'APP-DOC-003': { prompt:'PRM-DOC-09 v9.3', knowledge:'KB-DOC-03 · 8 retrieved chunks', tools:req.path.includes('Export') ? 'ACL check · Export tool' : 'OCR · Schema validator', guardrail:'POL-DOC-05 · passed', cache:'74% route cache' },
        'APP-GROWTH-004': { prompt:'PROMPT-GROWTH-08 v18', knowledge:'KB-GROWTH-04 · 5 retrieved chunks', tools:'Brand policy resolver', guardrail:'POL-MKT-03 · passed', cache:'42% route cache' },
      };
      return profiles[req.appId] || profiles['APP-SUPPORT-001'];
    };
    const inspectorMarkup = req => {
      const ctx = requestContext(req);
      const latencyMs = latencyNumber(req.latency);
      const index = Math.abs(String(req.requestId).split('').reduce((a,c)=>a+c.charCodeAt(0),0));
      const inputTokens = 760 + (index % 1600), outputTokens = 180 + (index % 520);
      const ttft = Math.max(92, Math.round(latencyMs * .22));
      const timestamp = new Date(Date.now() - (index % 260) * 1000).toLocaleString([], { hour:'2-digit', minute:'2-digit', second:'2-digit', year:'numeric', month:'short', day:'numeric' });
      const resultDetail = req.status === 'Fallback' ? 'Primary provider crossed latency policy; the route completed on the configured fallback without losing the request.' : req.status === 'Human handoff' ? 'The AI preserved context and transferred the interaction to a human operator.' : req.status === 'Human review' ? 'Execution paused at the review gate until an authorized reviewer makes a decision.' : req.status === 'Guardrail retry' ? 'Prompt-injection guard requested a clean rerun; the retry completed under the same policy envelope.' : `${req.status} under the active production policy.`;
      return `<div class="command-inspector-hero"><b>${ui.escapeHtml(req.requestId)} · ${ui.escapeHtml(req.traceId)}</b><p>${ui.escapeHtml(req.app)} · ${ui.escapeHtml(timestamp)} · ${ui.escapeHtml(req.channel)} request through ${ui.escapeHtml(req.route)}.</p></div><div class="command-inspector-grid"><div><small>Application</small><b>${ui.escapeHtml(req.appId)}</b></div><div><small>Environment</small><b>${ui.escapeHtml(envFilter?.value || 'ENV-PROD-001')}</b></div><div><small>External user</small><b>${ui.escapeHtml(req.externalUserId)}</b></div><div><small>Session</small><b>${ui.escapeHtml(req.sessionId)}</b></div><div><small>TTFT</small><b>${ttft}ms</b></div><div><small>Total latency</small><b>${ui.escapeHtml(req.latency)}</b></div><div><small>Input tokens</small><b>${inputTokens.toLocaleString()}</b></div><div><small>Output tokens</small><b>${outputTokens.toLocaleString()}</b></div><div><small>Cache</small><b>${ui.escapeHtml(ctx.cache)}</b></div><div><small>Total cost</small><b>${ui.escapeHtml(req.cost)}</b></div></div><section class="command-inspector-section"><h3>AI execution</h3><p><b>${ui.escapeHtml(req.model)}</b> · ${ui.escapeHtml(ctx.prompt)}<br>${ui.escapeHtml(ctx.knowledge)}<br>${ui.escapeHtml(ctx.tools)}<br>${ui.escapeHtml(ctx.guardrail)}</p></section><section class="command-inspector-section"><h3>Execution path</h3><p>${ui.escapeHtml(req.path)}</p></section><section class="command-inspector-section"><h3>Result</h3><p>${ui.escapeHtml(resultDetail)}</p></section><div class="command-inspector-actions"><button class="btn-primary" type="button" data-request-open-trace><i data-lucide="git-branch"></i>Open full trace</button><button class="btn-secondary" type="button" data-request-open-session><i data-lucide="messages-square"></i>Open session</button><button class="btn-secondary" type="button" data-request-save-case><i data-lucide="flask-conical"></i>Add to dataset</button><button class="btn-secondary" type="button" data-request-create-eval><i data-lucide="clipboard-check"></i>Create evaluation</button><button class="btn-secondary" type="button" data-request-copy="${ui.escapeHtml(req.requestId)}"><i data-lucide="copy"></i>Copy ID</button></div>`;
    };
    const openDrawer = (req, trigger) => {
      if (!drawer || !drawerBody) return; returnFocus = trigger;
      drawer.dataset.requestId = req.requestId; drawer.dataset.traceId = req.traceId; drawer.dataset.sessionId = req.sessionId;
      if (drawerTitle) drawerTitle.textContent = req.requestId;
      drawerBody.innerHTML = inspectorMarkup(req); drawer.classList.add('open'); drawerBackdrop?.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false'); drawerBackdrop?.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
      refreshIcons(); document.getElementById('request-drawer-close')?.focus();
    };

    const makeVirtualRequest = (sourcePool, globalIndex) => {
      if (!sourcePool.length) return null;
      if (globalIndex < sourcePool.length) return { ...sourcePool[globalIndex], demoIndex: globalIndex };
      const source = sourcePool[globalIndex % sourcePool.length];
      const code = ((0x9B0000 + (globalIndex + 1) * 37) & 0xFFFFFF).toString(16).toUpperCase().padStart(6,'0');
      const latencyMs = Math.max(180, Math.round(latencyNumber(source.latency) * (.88 + (globalIndex % 9) * .03)));
      const adjustedCost = Math.max(.001, costNumber(source.cost) * (.86 + (globalIndex % 7) * .04));
      const sessionPrefix = source.channel === 'Voice' ? 'CALL' : source.channel === 'API' ? 'DOC' : source.channel === 'Chat' ? 'CHAT' : 'WEB';
      return { ...source, requestId:`REQ-${code}`, traceId:`TRC-${code}`, externalUserId:`ext_usr_${String(20000 + (globalIndex*7919)%79999).padStart(5,'0')}`, sessionId:`SES-${sessionPrefix}-${String(12000 + globalIndex).slice(-5)}`, latency: latencyMs >= 1000 ? `${(latencyMs/1000).toFixed(2)}s` : `${latencyMs}ms`, cost:`$${adjustedCost.toFixed(4)}`, virtual:true };
    };

    const demoRequests = Array.from({ length: demoRecordLimit }, (_, index) => makeVirtualRequest(data.liveRequests, index)).filter(Boolean);
    pool = [...demoRequests];

    const applyColumns = () => {
      document.querySelectorAll('[data-request-column]').forEach((control) => {
        const index = Number(control.dataset.requestColumn) + 1;
        table?.querySelectorAll(`tr > :nth-child(${index})`).forEach((cell) => { cell.hidden = !control.checked; });
      });
    };

    const calculateTotalMatches = () => pool.length;

    const render = () => {
      if (!host) return;
      totalMatches = calculateTotalMatches();
      pageSize = Number(pageSizeControl?.value || pageSize || 25);
      const pages = Math.max(1, Math.ceil(totalMatches / pageSize)); pageIndex = Math.min(pageIndex, pages - 1);
      const start = pageIndex * pageSize;
      currentRows = pool.slice(start, start + pageSize);
      host.innerHTML = currentRows.map(ui.requestRow).join(''); applyColumns();
      if (empty) empty.hidden = currentRows.length > 0;
      if (meta) meta.textContent = totalMatches ? `Showing ${(start + 1).toLocaleString()}–${Math.min(start + currentRows.length, totalMatches).toLocaleString()} of ${totalMatches.toLocaleString()} requests` : 'Showing 0 requests';
      if (label) label.textContent = `Page ${(pageIndex + 1).toLocaleString()} of ${pages.toLocaleString()}`;
      if (prev) prev.disabled = pageIndex === 0; if (next) next.disabled = pageIndex >= pages - 1;
      refreshIcons();
    };

    const renderRoutes = () => {
      if (!routeHost) return;
      const range = rangeFilter?.value || '24h';
      const factor = rangeFactors[range] || 1/30;
      const app = appFilter?.value || 'all';
      const routes = (analytics.routes || []).filter(route => app === 'all' || route.appId === app);
      routeHost.innerHTML = routes.length ? routes.map(route => {
        const cost = route.cost30d * factor, requests = Math.round(route.requests30d * factor), per1k = requests ? cost / requests * 1000 : 0;
        return `<div class="cp-stream-item"><span class="cp-stream-icon"><i data-lucide="${route.icon}"></i></span><div class="cp-stream-copy"><b>${ui.escapeHtml(route.id)}</b><p>${ui.escapeHtml(route.label)}</p><small>${shortNumber(requests)} requests · $${per1k.toFixed(2)} / 1K</small></div><div class="cp-stream-meta"><b>${money(cost)}</b><span>${rangeLabels[range]}</span></div></div>`;
      }).join('') : `<div class="request-support-empty">No route-cost concentration for this application in the selected period.</div>`;
      refreshIcons();
    };

    const drawOutcome = () => {
      const chart = document.getElementById('request-outcome-chart');
      if (!chart || !window.ApexCharts) return; outcomeChart?.destroy?.();
      const dark = document.documentElement.classList.contains('dark');
      const outcomes = analytics.outcomes || [{label:'Completed',value:98.6},{label:'Fallback',value:.7},{label:'Human intervention',value:.5},{label:'Blocked / failed',value:.2}];
      outcomeChart = new ApexCharts(chart, {
        chart: { type:'donut', height:230, background:'transparent', toolbar:{show:false} },
        series: outcomes.map(item => item.value), labels: outcomes.map(item => item.label),
        colors:['#45af80','#e6a515','#8177d8','#de6959'], stroke:{width:0}, dataLabels:{enabled:false},
        plotOptions:{pie:{donut:{size:'72%',labels:{show:true,total:{show:true,label:'Matching requests',color:dark?'#9fb0b8':'#737d78',fontSize:'12px',formatter:()=>shortNumber(totalMatches)},value:{show:false}}}}},
        legend:{show:true,position:'bottom',fontSize:'12px',labels:{colors:dark?'#aebbc4':'#67716d'}}, tooltip:{theme:dark?'dark':'light',y:{formatter:v=>`${v}%`}}
      }); outcomeChart.render();
    };

    const updateSupportingAnalytics = () => {
      const range = rangeFilter?.value || '24h'; const text = rangeLabels[range] || 'Last 24 hours';
      if (outcomePeriod) outcomePeriod.textContent = `Outcome distribution · ${text}.`;
      if (routePeriod) routePeriod.textContent = `Cost concentration · ${text}.`;
      renderRoutes(); drawOutcome();
    };

    const applyFilters = () => {
      const q = input?.value.toLowerCase().trim() || '';
      pool = demoRequests.filter(r => {
        const searchOk = !q || Object.values(r).join(' ').toLowerCase().includes(q);
        const appOk = !appFilter || appFilter.value === 'all' || r.appId === appFilter.value;
        const channelOk = !channelFilter || channelFilter.value === 'all' || r.channel === channelFilter.value;
        const statusOk = !statusFilter || statusFilter.value === 'all' || r.status === statusFilter.value;
        return searchOk && appOk && channelOk && statusOk;
      });
      const sort = sortControl?.value || 'newest';
      if (sort === 'latency-desc') pool.sort((a,b) => latencyNumber(b.latency) - latencyNumber(a.latency));
      if (sort === 'cost-desc') pool.sort((a,b) => costNumber(b.cost) - costNumber(a.cost));
      if (sort === 'application') pool.sort((a,b) => a.app.localeCompare(b.app));
      pageIndex = 0; render(); updateSupportingAnalytics();
    };

    [input, appFilter, channelFilter, statusFilter, rangeFilter, envFilter, sortControl].forEach(control => control?.addEventListener(control === input ? 'input' : 'change', applyFilters));
    pageSizeControl?.addEventListener('change', () => { pageSize = Number(pageSizeControl.value); pageIndex = 0; render(); });
    prev?.addEventListener('click', () => { if (pageIndex > 0) { pageIndex -= 1; render(); } });
    next?.addEventListener('click', () => { const pages = Math.max(1, Math.ceil(totalMatches / pageSize)); if (pageIndex < pages - 1) { pageIndex += 1; render(); } });
    document.querySelectorAll('[data-request-column]').forEach(control => control.addEventListener('change', applyColumns));

    table?.addEventListener('click', event => { const row = event.target.closest('tbody tr[data-request-id]'); if (row) { const req = currentRows.find(item => item.requestId === row.dataset.requestId) || data.liveRequests.find(item => item.requestId === row.dataset.requestId); if (req) openDrawer(req, row); } });
    table?.addEventListener('keydown', event => { if (!['Enter',' '].includes(event.key)) return; const row = event.target.closest('tbody tr[data-request-id]'); if (row) { event.preventDefault(); const req = currentRows.find(item => item.requestId === row.dataset.requestId) || data.liveRequests.find(item => item.requestId === row.dataset.requestId); if (req) openDrawer(req, row); } });
    document.getElementById('request-drawer-close')?.addEventListener('click', closeDrawer); drawerBackdrop?.addEventListener('click', closeDrawer);
    drawer?.addEventListener('click', event => {
      const traceId = drawer.dataset.traceId || '';
      const sessionId = drawer.dataset.sessionId || '';
      if (event.target.closest('[data-request-open-trace]')) { try { localStorage.setItem('orvexa-selected-trace', traceId); } catch (_) {} window.location.href = `./traces.html?trace=${encodeURIComponent(traceId)}`; }
      if (event.target.closest('[data-request-open-session]')) { try { localStorage.setItem('orvexa-selected-session', sessionId); } catch (_) {} window.location.href = './sessions.html'; }
      const copy = event.target.closest('[data-request-copy]'); if (copy) { navigator.clipboard?.writeText(copy.dataset.requestCopy); window.showToast?.('Request ID copied', 'copy'); }
      if (event.target.closest('[data-request-save-case]')) { try { localStorage.setItem('orvexa-dataset-source-trace', traceId); } catch (_) {} window.location.href = './datasets.html'; }
      if (event.target.closest('[data-request-create-eval]')) { try { localStorage.setItem('orvexa-evaluation-source-trace', traceId); } catch (_) {} window.location.href = './evaluations.html'; }
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && drawer?.classList.contains('open')) closeDrawer(); });

    document.getElementById('request-save-view')?.addEventListener('click', () => {
      const view = { query: input?.value || '', app: appFilter?.value || 'all', channel: channelFilter?.value || 'all', status: statusFilter?.value || 'all', range: rangeFilter?.value || '24h', environment: envFilter?.value || 'ENV-PROD-001', sort: sortControl?.value || 'newest', pageSize:Number(pageSizeControl?.value || 25), savedAt: Date.now() };
      try { localStorage.setItem('orvexa-requests-saved-view', JSON.stringify(view)); } catch (_) {}
      window.showToast?.('Request view saved', 'bookmark-check');
    });

    document.getElementById('request-export')?.addEventListener('click', () => {
      const headers = ['Request ID','Trace ID','Application','Environment','User','Session','Channel','Route','Model','Execution path','Latency','Cost','Status'];
      const csvRows = pool.map(r => [r.requestId,r.traceId,r.appId,envFilter?.value || 'ENV-PROD-001',r.externalUserId,r.sessionId,r.channel,r.route,r.model,r.path,r.latency,r.cost,r.status]);
      const csv = [headers, ...csvRows].map(row => row.map(quote).join(',')).join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' })); const a = document.createElement('a');
      a.href = url; a.download = `orvexa-requests-${rangeFilter?.value || '24h'}-demo.csv`; a.click(); URL.revokeObjectURL(url); window.showToast?.(`Exported ${pool.length} demo records`, 'download');
    });

    document.getElementById('request-lineage-open')?.addEventListener('click', () => { try { localStorage.setItem('orvexa-selected-trace','TRC-8A42F1'); } catch (_) {} window.location.href = './traces.html?trace=TRC-8A42F1'; });

    try {
      const saved = JSON.parse(localStorage.getItem('orvexa-requests-saved-view') || 'null');
      if (saved) { if (input) input.value = saved.query || ''; if (appFilter) appFilter.value = saved.app || 'all'; if (channelFilter) channelFilter.value = saved.channel || 'all'; if (statusFilter) statusFilter.value = saved.status || 'all'; if (rangeFilter) rangeFilter.value = saved.range || '24h'; if (envFilter) envFilter.value = saved.environment || 'ENV-PROD-001'; if (sortControl) sortControl.value = saved.sort || 'newest'; if (pageSizeControl) pageSizeControl.value = String(saved.pageSize || 25); }
    } catch (_) {}
    applyFilters();
    document.addEventListener('orvexa:themechange', () => window.setTimeout(drawOutcome, 30));
  }

  function renderContact() {
    const cc = data.contactCenter;
    const metrics = document.getElementById('contact-metrics');
    if (metrics) metrics.innerHTML = cc.metrics.map(ui.contactMetric).join('');
    const channels = document.getElementById('channel-grid');
    if (channels) channels.innerHTML = cc.channels.map(c => `<article class="cp-channel-card"><div class="cp-channel-head"><div class="cp-channel-name"><span><i data-lucide="${c.icon}"></i></span><b>${c.name}</b></div><span class="cp-status ${c.status === 'Healthy' ? 'is-good' : 'is-warn'}"><span></span>${c.status}</span></div><div class="cp-channel-stats"><div><span>Live</span><b>${c.live}</b></div><div><span>Queued</span><b>${c.queued}</b></div><div><span>Service</span><b>${c.service}</b></div><div><span>AI share</span><b>${c.aiShare}</b></div></div><div class="cp-app-foot"><span>P50 turn</span><span>${c.p50}</span></div></article>`).join('');
    const pipeline = document.getElementById('contact-pipeline');
    if (pipeline) pipeline.innerHTML = cc.pipeline.map(p => `<div class="cp-pipeline-step"><span class="cp-pipeline-icon"><i data-lucide="${p.icon}"></i></span><b>${p.label}</b><p>${p.detail}</p><em>${p.metric} · ${p.state}</em></div>`).join('');
    const alerts = document.getElementById('contact-alerts');
    if (alerts) alerts.innerHTML = cc.alerts.map(a => `<div class="cp-alert ${a.severity === 'High' ? 'is-high' : ''}"><i></i><div><b>${a.title}</b><p>${a.detail}</p></div><time>${a.time}</time></div>`).join('');
    const intents = document.getElementById('intent-list');
    if (intents) intents.innerHTML = cc.intents.map(i => `<div class="cp-intent-row"><div><span>${i.label}</span><b>${i.value}% · ${i.change}</b></div><div class="cp-intent-bar"><span style="width:${i.value}%"></span></div></div>`).join('');
    const table = document.getElementById('contact-table');
    if (table) table.innerHTML = cc.liveContacts.map(c => `<tr><td><b style="font-family:ui-monospace;font-size:10.5px">${c.id}</b><div class="cp-table-secondary">${c.duration}</div></td><td><div class="cp-table-primary">${c.channel}</div><div class="cp-table-secondary">${c.queue}</div></td><td>${c.externalUser}</td><td>${c.mode}</td><td>${c.intent}</td><td><span class="cp-status ${c.sentimentTone === 'danger' ? 'is-danger' : c.sentimentTone === 'warning' ? 'is-warn' : c.sentimentTone === 'good' ? 'is-good' : ''}"><span></span>${c.sentiment}</span></td><td>${c.action}</td><td><b>${c.state}</b></td></tr>`).join('');
    const quality = document.getElementById('contact-quality');
    if (quality) quality.innerHTML = cc.quality.map(q => `<div class="cp-quality-card"><span>${q.label}</span><b>${q.value}%</b><small>${q.detail}</small><div class="cp-quality-bar"><i style="width:${q.value}%"></i></div></div>`).join('');
    const volumeChart = document.getElementById('contact-volume-chart');
    if (volumeChart && window.ApexCharts) {
      new ApexCharts(volumeChart, {
        chart: { type: 'area', height: 285, background: 'transparent', toolbar: { show: false }, zoom: { enabled: false } },
        series: [
          { name: 'AI contained', data: [182,204,226,248,274,292,318,304,336,358,372,348] },
          { name: 'Human assisted', data: [74,78,82,88,91,96,104,101,109,112,118,110] },
          { name: 'Escalated', data: [19,18,21,24,23,27,29,26,31,34,32,29] },
        ],
        colors: ['#66d69a','#4ed6c4','#f4a84c'], stroke: { curve: 'smooth', width: [2.4,2.2,2] }, fill: { type: 'gradient', gradient: { opacityFrom: .25, opacityTo: .02, stops: [0,92,100] } },
        grid: { borderColor: 'rgba(145,162,177,.09)', strokeDashArray: 4 },
        xaxis: { categories: ['02','03','04','05','06','07','08','09','10','11','12','13'], labels: { style: { colors: '#738493', fontSize: '12px' } }, axisBorder: { show:false }, axisTicks:{show:false} },
        yaxis: { labels: { style: { colors: '#738493', fontSize: '12px' } } },
        legend: { position: 'top', horizontalAlign: 'left', labels: { colors: '#91a2b1' }, fontSize: '12px' }, dataLabels: { enabled: false }, tooltip: { theme: 'dark' }
      }).render();
    }
    const outcomeChart = document.getElementById('contact-outcome-chart');
    if (outcomeChart && window.ApexCharts) {
      new ApexCharts(outcomeChart, {
        chart: { type: 'donut', height: 285, background: 'transparent' },
        series: [71.8,18.4,6.2,3.6], labels: ['AI resolved','Human handoff','Supervisor assist','Abandoned'],
        colors: ['#66d69a','#4ed6c4','#f4a84c','#ef6f6c'], stroke: { width:0 }, dataLabels:{enabled:false},
        legend:{position:'bottom',labels:{colors:'#91a2b1'},fontSize:'12px'},
        plotOptions:{pie:{donut:{size:'70%',labels:{show:true,total:{show:true,label:'AI resolved',color:'#91a2b1',formatter:()=> '71.8%'},value:{color:'#edf3f7',fontSize:'22px',fontWeight:800}}}}}, tooltip:{theme:'dark'}
      }).render();
    }
    const wave = document.getElementById('live-wave');
    if (wave) wave.innerHTML = Array.from({length:38}, (_,i) => `<i style="height:${18 + ((i*19)%70)}%;animation-delay:-${(i%9)*.08}s"></i>`).join('');
  }

  function renderUsers() {
    const table = document.getElementById('external-user-table');
    if (!table) return;
    table.innerHTML = data.externalUsers.map(u => `<tr><td><b style="font-family:ui-monospace;font-size:10.5px">${u.externalUserId}</b></td><td>${u.tenantId}</td><td>${u.application}</td><td>${u.sessions30d}</td><td>${u.requests30d}</td><td>${u.tokens}</td><td>${u.cost}</td><td>${u.feedback}</td><td>${u.lastActive}</td><td><span class="cp-status ${u.risk === 'Review' ? 'is-warn' : 'is-good'}"><span></span>${u.risk}</span></td></tr>`).join('');
  }

  function renderTraces() {
    const host = document.getElementById('trace-steps');
    const trace = data.traceExample;
    if (host) host.innerHTML = trace.steps.map((step,index) => ui.traceStep(step,index,trace.steps.length)).join('');
  }

  ({ applications: renderApplications, live: renderLive, requests: renderRequests, contact: renderContact, users: renderUsers, traces: renderTraces }[page] || (()=>{}))();
  refreshIcons();
})();
