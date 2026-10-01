(() => {
  'use strict';

  const product = window.Orvexa?.product;
  const page = document.body.dataset.observePage || document.body.dataset.activePage;
  const main = document.querySelector('main');
  const observePages = new Set(['traces', 'sessions', 'logs-errors', 'performance-slo', 'alerts-incidents', 'reliability-capacity']);
  if (!product || !main || !observePages.has(page)) return;

  const obs = product.observability || {};
  const requestRows = product.developerKit?.tableRows || [];
  const icon = name => `<i data-lucide="${name}"></i>`;
  const toast = (message, glyph = 'sparkles') => window.showToast?.(message, glyph);
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
  const tone = (value = '') => /healthy|recovered|resolved|complete|available|within|active|pass|covered|expected|enforced/i.test(value) ? 'good' : /watch|investigating|mitigating|acknowledged|review|high|medium|fallback|at risk/i.test(value) ? 'warn' : /critical|paging|open|error|failed|blocked/i.test(value) ? 'bad' : /live|now|streaming/i.test(value) ? 'live' : 'info';
  const status = label => `<span class="p5-status ${tone(label)}">${escapeHtml(label)}</span>`;
  const button = (label, glyph = 'sliders-horizontal', primary = false, attrs = '') => `<button class="p5-btn ${primary ? 'primary' : ''}" ${/\btype=/.test(attrs) ? '' : 'type="button"'} ${attrs}>${icon(glyph)}${escapeHtml(label)}</button>`;
  const head = (title, copy, actions = '') => `<section class="p5-head"><div class="p5-title"><div class="observe-eyebrow">${icon('radar')}Production observability</div><h1>${title}</h1></div><div class="p5-context">${actions}</div></section>`;
  const metrics = items => `<section class="p5-metrics ${items.length === 5 ? 'five' : ''}">${items.map(item => `<article class="p5-metric"><span class="p5-metric-icon">${icon(item[3] || 'activity')}</span><small>${escapeHtml(item[0])}</small><strong>${escapeHtml(item[1])}</strong><em class="${item[4] || ''}">${escapeHtml(item[2])}</em></article>`).join('')}</section>`;

  const ensureModal = () => {
    let modal = document.querySelector('#observe-workflow-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'observe-workflow-modal';
    modal.className = 'observe-modal';
    modal.hidden = true;
    modal.innerHTML = `<div class="observe-modal-backdrop" data-observe-modal-close></div><section class="observe-modal-card" role="dialog" aria-modal="true" aria-labelledby="observe-modal-title"><header><div><small id="observe-modal-kicker">Workflow</small><h2 id="observe-modal-title">Action</h2></div><button class="p5-btn" type="button" aria-label="Close" data-observe-modal-close>${icon('x')}</button></header><div class="observe-modal-body" id="observe-modal-body"></div></section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', event => { if (event.target.closest('[data-observe-modal-close]')) closeModal(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
    return modal;
  };
  const openModal = ({ kicker = 'Workflow', title, body }) => {
    const modal = ensureModal();
    modal.querySelector('#observe-modal-kicker').textContent = kicker;
    modal.querySelector('#observe-modal-title').textContent = title;
    modal.querySelector('#observe-modal-body').innerHTML = body;
    modal.hidden = false;
    document.body.classList.add('observe-modal-open');
    requestAnimationFrame(() => modal.classList.add('open'));
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
    modal.querySelector('input,select,button:not([data-observe-modal-close])')?.focus();
  };
  const closeModal = () => {
    const modal = document.querySelector('#observe-workflow-modal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.classList.remove('observe-modal-open');
    setTimeout(() => { modal.hidden = true; }, 160);
  };

  const openOperationalDrawer = ({ title, kind = 'Operational evidence', body }) => {
    let drawer = document.querySelector('.p5-drawer');
    let backdrop = document.querySelector('.p5-drawer-backdrop');
    if (!drawer) {
      backdrop = document.createElement('div');
      backdrop.className = 'p5-drawer-backdrop';
      drawer = document.createElement('aside');
      drawer.className = 'p5-drawer';
      drawer.innerHTML = `<div class="p5-drawer-head"><div><small data-observe-drawer-kind></small><h2 data-observe-drawer-title></h2></div><button class="p5-btn" type="button" data-observe-drawer-close aria-label="Close inspector">${icon('x')}</button></div><div class="p5-drawer-body" data-observe-drawer-body></div>`;
      document.body.append(backdrop, drawer);
      backdrop.addEventListener('click', closeOperationalDrawer);
      drawer.addEventListener('click', event => { if (event.target.closest('[data-observe-drawer-close]')) closeOperationalDrawer(); });
    }
    const kindTarget = drawer.querySelector('[data-observe-drawer-kind], #p5-drawer-kind');
    const titleTarget = drawer.querySelector('[data-observe-drawer-title], #p5-drawer-title');
    const bodyTarget = drawer.querySelector('[data-observe-drawer-body], #p5-drawer-body');
    if (kindTarget) kindTarget.textContent = kind;
    if (titleTarget) titleTarget.textContent = title;
    if (bodyTarget) bodyTarget.innerHTML = body;
    drawer.classList.add('open');
    backdrop?.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  };
  const closeOperationalDrawer = () => {
    document.querySelector('.p5-drawer')?.classList.remove('open');
    document.querySelector('.p5-drawer-backdrop')?.classList.remove('open');
    document.body.style.overflow = '';
  };

  const downloadText = (filename, text, type = 'text/plain') => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const traceUserByApp = {'APP-CONTACT-002':'ext_usr_18422','APP-SUPPORT-001':'ext_usr_77401','APP-DOC-003':'ext_usr_31891','APP-GROWTH-004':'ext_usr_92018'};
  const traceSessionByApp = {'APP-CONTACT-002':'SES-CALL-10482','APP-SUPPORT-001':'SES-WEB-12015','APP-DOC-003':'SES-DOC-12012','APP-GROWTH-004':'SES-WEB-10468'};
  const traceScores = ['96.8%','97.2%','95.1%','92.8%','98.1%'];
  const traceRecords = requestRows.map((row, index) => ({ ...row, user: traceUserByApp[row.appId] || `ext_usr_${18422+index}`, score: traceScores[index % traceScores.length], session: traceSessionByApp[row.appId] || `SES-${String(10479-index).padStart(5,'0')}` }));
  const traceOutcome = row => row.trace === 'TRC-DOC-93E7A' ? 'Grounding failed' : row.status;
  const traceAppClass = appId => ({'APP-SUPPORT-001':'app-support','APP-CONTACT-002':'app-contact','APP-DOC-003':'app-doc','APP-GROWTH-004':'app-growth'})[appId] || '';
  const traceGrounding = row => row.trace === 'TRC-DOC-93E7A' ? { score:'95.1%', gate:'96.0%', state:'Failed' } : null;

  const makeSpans = row => {
    const issueTrace = obs.issues?.find(issue => issue.trace === row.trace);
    if (issueTrace?.traceSpans?.length) {
      let start = 0;
      return issueTrace.traceSpans.map(span => { const result = { ...span, start }; start += Number(span.duration) || 0; return result; });
    }
    if (row.trace === product.trace?.id) return product.trace.spans;
    const total = Math.max(Number(row.latency) || 700, 260);
    const parts = [
      ['Gateway accepted','GW-001',0.04,'Healthy'],
      ['Route decision',row.route,0.05,'Healthy'],
      ['Knowledge retrieval',row.appId === 'APP-DOC-003' ? 'RET-DOC-03' : 'RET-HYBRID-04',0.16,row.status === 'Error' ? 'Watch' : 'Healthy'],
      ['Tool / context step',row.appId === 'APP-GROWTH-004' ? 'MCP-CAMPAIGN-04' : 'MCP-CRM-01',0.13,row.status === 'Review' ? 'Watch' : 'Healthy'],
      ['Model generation',row.provider,0.48,/Fallback|Error/.test(row.status) ? 'Watch' : 'Healthy'],
      ['Policy verdict','POL-OUTPUT-007',0.06,'Healthy'],
      ['Response delivery','EDGE-DELIVERY-01',0.08,row.status === 'Error' ? 'Failed' : 'Healthy'],
    ];
    let start = 0;
    return parts.map((item, index) => {
      const duration = index === parts.length - 1 ? Math.max(total - start, 12) : Math.max(Math.round(total * item[2]), 12);
      const span = { name:item[0], component:item[1], start, duration, state:item[3] };
      start += duration;
      return span;
    });
  };

  const traceWaterfall = row => {
    const spans = makeSpans(row);
    const total = Math.max(Number(row.latency) || spans.reduce((sum, span) => sum + span.duration, 0), 1);
    return `<div class="observe-waterfall-scale" aria-label="Trace duration from zero to ${total} milliseconds"><span>0ms</span><i></i><span>${total}ms</span></div><div class="observe-waterfall" data-observe-waterfall>${spans.map(span => {
      const left = Math.min((span.start / total) * 100, 96);
      const width = Math.max((span.duration / total) * 100, 2.2);
      return `<button class="observe-span" type="button" data-observe-span="${escapeHtml(span.name)}" data-component="${escapeHtml(span.component)}" data-duration="${span.duration}" data-state="${escapeHtml(span.state)}"><span class="observe-span-copy"><b>${escapeHtml(span.name)}</b><small title="${escapeHtml(span.component)}">${escapeHtml(span.component)}</small></span><span class="observe-span-track"><i class="${tone(span.state)}" style="--span-left:${left}%;--span-width:${Math.min(width, 100-left)}%"></i></span><span class="observe-span-meta"><b>${span.duration}ms</b>${status(span.state)}</span></button>`;
    }).join('')}</div>`;
  };

  const traceDetail = row => {
    const grounding = traceGrounding(row);
    const outcome = traceOutcome(row);
    const sessionUrl = `./sessions.html?session=${encodeURIComponent(row.session)}&trace=${encodeURIComponent(row.trace)}`;
    const logsUrl = `./logs-errors.html?request=${encodeURIComponent(row.request)}&trace=${encodeURIComponent(row.trace)}`;
    const requestUrl = `./requests-runs.html?request=${encodeURIComponent(row.request)}&trace=${encodeURIComponent(row.trace)}`;
    return `<div class="observe-trace-detail-head"><div><small>Selected trace</small><h2 title="${escapeHtml(row.trace)}">${escapeHtml(row.trace)}</h2><p>${escapeHtml(row.request)} · ${escapeHtml(row.appId)} · ${escapeHtml(row.user)}</p></div><div class="observe-trace-head-actions">${status(row.status)}<button class="p5-btn observe-inspector-close" type="button" aria-label="Close trace inspector" data-observe-inspector-close>${icon('x')}</button></div></div><div class="observe-trace-ribbon"><div><small>Duration</small><b>${row.latency >= 1000 ? `${(row.latency/1000).toFixed(2)}s` : `${row.latency}ms`}</b></div><div><small>Tokens</small><b>${Number(row.tokens).toLocaleString()}</b></div><div><small>Cost</small><b>$${Number(row.cost).toFixed(4)}</b></div><div><small>Quality</small><b>${row.score}</b></div></div><div class="observe-trace-meta-line"><span title="${escapeHtml(row.route)}"><small>Route</small><b>${escapeHtml(row.route)}</b></span><span title="${escapeHtml(`${row.provider} · ${row.model}`)}"><small>Provider / model</small><b>${escapeHtml(row.provider)} · ${escapeHtml(row.model)}</b></span></div>${grounding ? `<div class="observe-trace-quality-note"><div><small>Grounding</small><b>${grounding.score} · gate ${grounding.gate}</b><p>Overall quality remains ${escapeHtml(row.score)}, but this required grounding gate failed.</p></div>${status('Grounding failed')}</div>` : ''}<div class="observe-detail-section-head"><div><h3>Execution waterfall</h3><p>Operational spans only: routing, retrieval, tools, model calls, policies and delivery.</p></div><button class="p5-btn" type="button" data-observe-copy-trace="${escapeHtml(row.trace)}" title="Copy ${escapeHtml(row.trace)}">${icon('copy')}Copy trace ID</button></div>${traceWaterfall(row)}<div class="observe-trace-links"><a class="p5-btn" href="${sessionUrl}" data-observe-deep-link="session">${icon('messages-square')}Open session</a><a class="p5-btn" href="${logsUrl}" data-observe-deep-link="logs">${icon('scroll-text')}Related logs</a><a class="p5-btn" href="${requestUrl}" data-observe-deep-link="request">${icon('list-tree')}Request record</a></div>`;
  };

  const traceRow = row => `<button class="observe-trace-row ${traceAppClass(row.appId)}" type="button" data-trace-id="${escapeHtml(row.trace)}" data-search="${escapeHtml(`${row.trace} ${row.request} ${row.app} ${row.appId} ${row.user} ${row.route} ${row.model} ${row.provider} ${row.status} ${traceOutcome(row)}`.toLowerCase())}"><span class="observe-trace-id"><b title="${escapeHtml(row.trace)}">${escapeHtml(row.trace)}</b><small>${escapeHtml(row.request)} · ${escapeHtml(row.time)}</small></span><span class="observe-trace-app"><b>${escapeHtml(row.app)}</b><small>${escapeHtml(row.appId)} · ${escapeHtml(row.user)}</small></span><span class="observe-trace-runtime"><b>${row.latency >= 1000 ? `${(row.latency/1000).toFixed(2)}s` : `${row.latency}ms`}</b><small title="${escapeHtml(row.model)}">${escapeHtml(row.model)}</small></span><span class="observe-trace-economics"><b>${Number(row.tokens).toLocaleString()}</b><small>$${Number(row.cost).toFixed(4)}</small></span><span class="observe-trace-quality"><b>${row.score}</b>${status(traceOutcome(row))}</span></button>`;


  const renderTraces = () => {
    document.title = 'Traces — Orvexa';
    document.body.dataset.observePage = 'traces';
    main.className = 'p5-page observe-traces-page';
    main.innerHTML = `${head('Traces', 'Trace every model call, retrieval, tool and application step end to end.', `${button('Export CSV','download',false,'data-observe-trace-export')}${button('Request ledger','list-tree',true,'data-observe-link="requests-runs.html"')}`)}${metrics([
      ['Root traces / min','2,842','Production · 4 applications','git-branch'],['P95 end-to-end','742ms','108ms below 850ms SLO · 24h','timer'],['Average trace cost','$0.0083','Production · Last 24h','circle-dollar-sign'],['Fallback traces','0.7%','Production · 24h · mostly voice','route','warn']
    ])}<section class="p5-panel observe-trace-shell"><header class="p5-panel-head"><div><h2>Trace explorer</h2><p>Search and compare production traces, then inspect every operational span.</p></div><div class="observe-toolbar"><input class="p5-input" id="observe-trace-search" placeholder="Search trace, request, app or user" aria-label="Search traces"><select class="p5-input" id="observe-trace-app" aria-label="Filter application"><option value="">All applications</option>${[...new Set(traceRecords.map(row=>row.app))].map(value=>`<option>${escapeHtml(value)}</option>`).join('')}</select><select class="p5-input" id="observe-trace-status" aria-label="Filter status"><option value="">All states</option>${[...new Set(traceRecords.map(row=>row.status))].map(value=>`<option>${escapeHtml(value)}</option>`).join('')}</select><select class="p5-input" id="observe-trace-sort" aria-label="Sort traces"><option value="newest">Newest</option><option value="latency">Highest latency</option><option value="cost">Highest cost</option></select></div></header><div class="observe-trace-grid"><div class="observe-trace-list"><div class="observe-trace-table-head"><span>Trace / request</span><span>Application / user</span><span>Duration / model</span><span>Tokens / cost</span><span>Quality / status</span></div><div id="observe-trace-rows"></div><footer class="observe-pagination orvexa-pagination orvexa-pagination-compact"><span class="orvexa-pagination-summary" id="observe-trace-count"></span><div class="orvexa-pagination-pages"><button class="p5-mini orvexa-page-button" id="observe-trace-prev" type="button" aria-label="Previous page">${icon('chevron-left')}</button><span id="observe-trace-pages"></span><button class="p5-mini orvexa-page-button" id="observe-trace-next" type="button" aria-label="Next page">${icon('chevron-right')}</button></div></footer></div><div class="observe-inspector-backdrop" data-observe-inspector-close></div><aside class="observe-trace-inspector" id="observe-trace-detail">${traceDetail(traceRecords[0])}</aside></div></section>`;

    const search = main.querySelector('#observe-trace-search');
    const app = main.querySelector('#observe-trace-app');
    const state = main.querySelector('#observe-trace-status');
    const sort = main.querySelector('#observe-trace-sort');
    let currentPage = 1;
    const perPage = 6;
    const requestedTrace = new URLSearchParams(window.location.search).get('trace');
    let selected = traceRecords.some(row => row.trace === requestedTrace) ? requestedTrace : traceRecords[0]?.trace;

    const filtered = () => {
      const query = search.value.trim().toLowerCase();
      let rows = traceRecords.filter(row => (!query || `${row.trace} ${row.request} ${row.app} ${row.appId} ${row.user} ${row.route} ${row.model} ${row.provider} ${row.status}`.toLowerCase().includes(query)) && (!app.value || row.app === app.value) && (!state.value || row.status === state.value));
      if (sort.value === 'latency') rows = [...rows].sort((a,b)=>b.latency-a.latency);
      if (sort.value === 'cost') rows = [...rows].sort((a,b)=>b.cost-a.cost);
      return rows;
    };
    const drawRows = () => {
      const rows = filtered();
      const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
      currentPage = Math.min(currentPage, totalPages);
      const start = (currentPage-1)*perPage;
      const visible = rows.slice(start,start+perPage);
      main.querySelector('#observe-trace-rows').innerHTML = visible.length ? visible.map(traceRow).join('') : `<div class="p5-empty"><i>${icon('search-x')}</i><h3>No matching traces</h3><p>Adjust application, status, sort, or search terms.</p></div>`;
      main.querySelector('#observe-trace-count').textContent = rows.length ? `${start+1}–${Math.min(start+perPage,rows.length)} of ${rows.length}` : '0 traces';
      main.querySelector('#observe-trace-pages').innerHTML = Array.from({length:totalPages},(_,index)=>`<button class="p5-mini orvexa-page-button ${currentPage===index+1?'active':''}" type="button" data-observe-trace-page="${index+1}" ${currentPage===index+1?'aria-current="page"':''}>${index+1}</button>`).join('');
      main.querySelector('#observe-trace-prev').disabled = currentPage===1;
      main.querySelector('#observe-trace-next').disabled = currentPage===totalPages;
      if (!rows.some(row=>row.trace===selected) && rows[0]) selected=rows[0].trace;
      const selectedRow = rows.find(row=>row.trace===selected) || traceRecords[0];
      if (selectedRow) main.querySelector('#observe-trace-detail').innerHTML=traceDetail(selectedRow);
      main.querySelectorAll('[data-trace-id]').forEach(row=>row.classList.toggle('active',row.dataset.traceId===selected));
      window.lucide?.createIcons?.({ attrs: { 'stroke-width':1.8 } });
    };
    [search,app,state,sort].forEach(control=>control.addEventListener(control===search?'input':'change',()=>{currentPage=1;drawRows();}));
    main.addEventListener('click', event => {
      const row = event.target.closest('[data-trace-id]');
      if (row) { selected=row.dataset.traceId; drawRows(); if (window.matchMedia('(max-width:1100px)').matches) { main.querySelector('.observe-trace-shell')?.classList.add('inspector-open'); document.body.classList.add('observe-trace-inspector-open'); } return; }
      const pageButton=event.target.closest('[data-observe-trace-page]');
      if(pageButton){currentPage=Number(pageButton.dataset.observeTracePage);drawRows();return;}
      if(event.target.closest('#observe-trace-prev')){currentPage=Math.max(1,currentPage-1);drawRows();return;}
      if(event.target.closest('#observe-trace-next')){currentPage+=1;drawRows();return;}
      const span=event.target.closest('[data-observe-span]');
      if(span){openOperationalDrawer({title:span.dataset.observeSpan,kind:'Trace span',body:`<div class="p5-insight"><div class="p5-insight-hero"><b>${escapeHtml(span.dataset.observeSpan)}</b><p>Operational span evidence for ${escapeHtml(selected)}. No private chain-of-thought is exposed.</p></div><div class="p5-inspector-facts"><div><small>Component</small><b>${escapeHtml(span.dataset.component)}</b></div><div><small>Duration</small><b>${escapeHtml(span.dataset.duration)}ms</b></div><div><small>State</small><b>${escapeHtml(span.dataset.state)}</b></div><div><small>Trace</small><b>${escapeHtml(selected)}</b></div></div></div>`});return;}
      if(event.target.closest('[data-observe-inspector-close]')){main.querySelector('.observe-trace-shell')?.classList.remove('inspector-open');document.body.classList.remove('observe-trace-inspector-open');return;}
      const deepLink=event.target.closest('[data-observe-deep-link]');
      if(deepLink){try{localStorage.setItem('orvexa-selected-trace',selected);}catch(_){} return;}
      const copy=event.target.closest('[data-observe-copy-trace]');
      if(copy){navigator.clipboard?.writeText(copy.dataset.observeCopyTrace);toast(`${copy.dataset.observeCopyTrace} copied`,'copy');return;}
      const link=event.target.closest('[data-observe-link]');
      if(link){window.location.href=`./${link.dataset.observeLink}`;return;}
      if(event.target.closest('[data-observe-trace-export]')){const rows=filtered();const csv=['Trace,Request,Application,User,Route,Model,Provider,Tokens,Latency,Cost,Quality,Status',...rows.map(r=>[r.trace,r.request,r.app,r.user,r.route,r.model,r.provider,r.tokens,r.latency,r.cost,r.score,r.status].map(v=>`"${String(v).replaceAll('"','""')}"`).join(','))].join('\n');downloadText('orvexa-traces.csv',csv,'text/csv');toast('Trace evidence exported','download');}
    });
    drawRows();
  };

  const enhanceSessions = () => {
    document.title = 'Sessions & Threads — Orvexa';
    const layout = main.querySelector('.p5-session-layout');
    if (!layout) return;
    const requestedSession = new URLSearchParams(window.location.search).get('session');
    if (requestedSession) requestAnimationFrame(() => main.querySelector(`[data-p5-session="${CSS.escape(requestedSession)}"]`)?.click() || main.querySelector(`[data-p5-session-row="${CSS.escape(requestedSession)}"]`)?.click());
    const topAction=main.querySelector('.p5-context .p5-btn.primary');
    if(topAction){ delete topAction.dataset.p5Action; topAction.dataset.observeSessionExport='true'; }

    const search=main.querySelector('#observe-session-search');
    const channel=main.querySelector('#observe-session-channel');
    const state=main.querySelector('#observe-session-state');
    const outcome=main.querySelector('#observe-session-outcome');
    const recordFor = node => obs.sessions.find(item => item.id === (node.dataset.p5Session || node.dataset.p5SessionRow));
    const matches = record => {
      if(!record) return false;
      const query=(search?.value||'').trim().toLowerCase();
      const hay=`${record.id} ${record.user} ${record.app} ${record.appName||''} ${record.channel} ${record.state} ${record.outcome}`.toLowerCase();
      return (!query||hay.includes(query)) && (!channel?.value||record.channel===channel.value) && (!state?.value||record.state===state.value) && (!outcome?.value||record.outcome===outcome.value);
    };
    const applyFilters=()=>{
      let recentVisible=0, registryVisible=0;
      main.querySelectorAll('[data-p5-session]').forEach(node=>{const show=matches(recordFor(node));node.hidden=!show;if(show)recentVisible++;});
      main.querySelectorAll('[data-p5-session-row]').forEach(node=>{const show=matches(recordFor(node));node.hidden=!show;if(show)registryVisible++;});
      const recentEmpty=main.querySelector('#observe-session-list-empty'); if(recentEmpty) recentEmpty.hidden=recentVisible>0;
      const registryEmpty=main.querySelector('#p5-session-empty'); if(registryEmpty) registryEmpty.hidden=registryVisible>0;
    };
    search?.addEventListener('input',applyFilters); [channel,state,outcome].forEach(control=>control?.addEventListener('change',applyFilters));

    let replayTimer=null, replayIndex=-1, replaySpeed=1, replayPlaying=false;
    const activeReplay=()=>main.querySelector('#p5-session-detail [data-observe-session-replay]');
    const moments=()=>[...main.querySelectorAll('#p5-session-detail [data-observe-session-moment]')];
    const stopReplay=(reset=false)=>{ if(replayTimer){clearTimeout(replayTimer);replayTimer=null;} replayPlaying=false; const toggle=main.querySelector('[data-observe-replay-toggle]'); if(toggle)toggle.innerHTML=`${icon('play')}<span>Play</span>`; if(reset){replayIndex=-1; moments().forEach(node=>node.classList.remove('observe-replay-active')); const bar=main.querySelector('[data-observe-replay-progress]'); if(bar)bar.style.width='0%';} };
    const activateMoment=index=>{const nodes=moments(); if(!nodes.length)return; replayIndex=Math.max(0,Math.min(index,nodes.length-1)); nodes.forEach((node,i)=>node.classList.toggle('observe-replay-active',i===replayIndex)); const bar=main.querySelector('[data-observe-replay-progress]'); const position=Number(nodes[replayIndex]?.dataset.replayPosition||0); if(bar)bar.style.width=`${position}%`; nodes[replayIndex]?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'}); };
    const scheduleNext=()=>{ if(!replayPlaying)return; const nodes=moments(); if(replayIndex>=nodes.length-1){stopReplay(false);toast('Conversation replay complete','play');return;} replayTimer=setTimeout(()=>{activateMoment(replayIndex+1);scheduleNext();},Math.round(720/replaySpeed)); };
    const play=()=>{ if(replayPlaying){stopReplay(false);return;} if(replayIndex>=moments().length-1) replayIndex=-1; replayPlaying=true; const toggle=main.querySelector('[data-observe-replay-toggle]'); if(toggle)toggle.innerHTML=`${icon('pause')}<span>Pause</span>`; if(replayIndex<0)activateMoment(0); scheduleNext(); };

    main.addEventListener('observe:session-selected',()=>stopReplay(true));
    main.addEventListener('click',event=>{
      if(event.target.closest('[data-observe-session-export]')){const rows=obs.sessions.filter(matches);const csv=['Session,User,Application,Application ID,Channel,Turns,Duration,Tokens,Cost,Quality,Outcome,State',...rows.map(s=>[s.id,s.user,s.appName||s.app,s.app,s.channel,s.turns,s.duration,s.tokens,s.cost,s.quality,s.outcome,s.state].map(v=>`"${String(v).replaceAll('"','""')}"`).join(','))].join('\n');downloadText('orvexa-sessions.csv',csv,'text/csv');toast(`${rows.length} session records exported`,'download');return;}
      if(event.target.closest('[data-observe-replay-toggle]')){play();return;}
      if(event.target.closest('[data-observe-replay-next]')){stopReplay(false);activateMoment(Math.min(replayIndex+1,moments().length-1));return;}
      const speed=event.target.closest('[data-observe-replay-speed]'); if(speed){replaySpeed=replaySpeed===1?2:1;speed.textContent=`${replaySpeed}×`;if(replayPlaying){clearTimeout(replayTimer);scheduleNext();}return;}
      const marker=event.target.closest('[data-observe-replay-jump]'); if(marker){stopReplay(false);activateMoment(Number(marker.dataset.observeReplayJump));return;}
      if(event.target.closest('[data-observe-session-close]')){stopReplay(true);layout.classList.remove('detail-open');document.body.classList.remove('observe-session-detail-open');return;}
      if(event.target.closest('[data-p5-session], [data-p5-session-row]')){setTimeout(()=>stopReplay(true),0);}
    });
    applyFilters();
  };

  const enhanceLogs = () => {
    document.title = 'Logs & Errors — Orvexa';
    const panel = main.querySelector('#p5-log-table')?.closest('.p5-panel');
    if (!panel) return;
    const appNames={'APP-SUPPORT-001':'Support AI','APP-CONTACT-002':'AI Contact Center','APP-DOC-003':'Document Intelligence','APP-GROWTH-004':'Growth Assistant'};
    const requestedLogRequest = new URLSearchParams(window.location.search).get('request');
    if (requestedLogRequest) { const searchInput = main.querySelector('#p5-log-search'); if (searchInput) searchInput.value = requestedLogRequest; }
    const topAction = main.querySelector('.p5-context .p5-btn.primary');
    if (topAction) { topAction.dataset.observeLiveTail='true'; topAction.innerHTML=`${icon('pause')}<span>Pause live tail</span>`; }
    let live=true;
    let sequence=1;
    let timer=null;
    let statusTimer=null;
    let groupFilter='';
    let lastEventAt=Date.now();
    const liveRecords=new Map();
    const byId=id=>liveRecords.get(id)||obs.logs.find(item=>item.id===id);
    const liveState=main.querySelector('#observe-live-state');
    const renderLiveState=()=>{
      if(!liveState)return;
      if(live){liveState.innerHTML=`${icon('radio')}<b>Live tail active</b>`;return;}
      const seconds=Math.max(0,Math.floor((Date.now()-lastEventAt)/1000));
      liveState.innerHTML=`${icon('pause')}<b>Paused · last event ${seconds}s ago</b>`;
      window.lucide?.createIcons?.({ attrs:{'stroke-width':1.8} });
    };
    const applyFilters=()=>{
      const query=main.querySelector('#p5-log-search')?.value.trim().toLowerCase()||'';
      const severity=main.querySelector('#observe-log-severity')?.value||'';
      const app=main.querySelector('#observe-log-app')?.value||'';
      let visible=0;
      main.querySelectorAll('[data-p5-log-search]').forEach(row=>{
        const show=(!query||row.dataset.p5LogSearch.includes(query))&&(!severity||row.dataset.observeSeverity===severity)&&(!app||row.dataset.observeApp===app)&&(!groupFilter||row.dataset.observeGroup===groupFilter);
        row.hidden=!show;if(show)visible++;
      });
      const empty=main.querySelector('#p5-log-empty');if(empty)empty.hidden=visible>0;
    };
    const logDetail = log => {
      const related=log.group?obs.logs.filter(item=>item.group===log.group).length:1;
      const correlation=log.incident||log.correlation||'No active incident';
      return `<div class="observe-log-detail"><div class="observe-log-detail-hero"><span>${status(log.severity)}</span><b>${escapeHtml(log.message)}</b><small>${escapeHtml(log.timestamp)} · ${escapeHtml(log.environment)} · ${escapeHtml(log.state||'Observed')}</small></div><div class="observe-log-detail-grid"><div><small>Component</small><b>${escapeHtml(log.component)}</b></div><div><small>Application</small><b>${escapeHtml(appNames[log.app]||log.app)}</b><em>${escapeHtml(log.app)}</em></div><div><small>Request</small><b>${escapeHtml(log.request)}</b></div><div><small>Trace</small><b>${escapeHtml(log.trace||'—')}</b></div></div><section class="observe-log-context"><h3>Execution context</h3><div class="observe-log-context-grid"><span><small>Provider / service</small><b>${escapeHtml(log.provider||log.component)}</b></span><span><small>Route</small><b>${escapeHtml(log.route||'—')}</b></span><span><small>Retry</small><b>${escapeHtml(log.retry||'—')}</b></span><span><small>Fallback / outcome</small><b>${escapeHtml(log.fallback||log.state||'—')}</b></span><span><small>Policy</small><b>${escapeHtml(log.policy||'—')}</b></span><span><small>Correlation</small><b>${escapeHtml(correlation)}</b></span></div></section><section class="observe-log-correlation"><h3>Correlation</h3><p>${log.group?`${escapeHtml(log.group)} · ${related} featured event${related===1?'':'s'} in the bundled stream.`:'No featured correlated group is assigned to this event.'}</p></section><div class="p5-insight-actions">${button('Open request','list-tree',false,`data-observe-link="requests-runs.html?request=${encodeURIComponent(log.request)}"`)}${log.trace?button('Open trace','git-branch',true,`data-observe-link="traces.html?trace=${encodeURIComponent(log.trace)}"`):''}${log.incident?button('Open incident','siren',false,`data-observe-link="alerts-incidents.html?incident=${encodeURIComponent(log.incident)}"`):''}${button('Copy JSON','copy',false,`data-observe-log-copy="${escapeHtml(log.id)}"`)}</div></div>`;
    };
    const makeLiveRow=record=>`<button class="p5-row observe-log-row log-${record.severity.toLowerCase()} observe-log-new" type="button" data-observe-log-event="${record.id}" data-observe-severity="${record.severity}" data-observe-app="${record.app}" data-observe-group="${record.group||''}" data-p5-log-search="${`${record.id} ${record.timestamp} ${record.severity} ${record.component} ${record.app} ${appNames[record.app]||''} ${record.request} ${record.trace} ${record.message} ${record.environment}`.toLowerCase()}"><span><b>${record.timestamp}</b><small>${record.id}</small></span><span>${status(record.severity)}</span><span class="p5-mono">${record.component}</span><span><b>${appNames[record.app]||record.app}</b><small class="p5-mono">${record.app}</small></span><span class="p5-mono">${record.request}</span><span class="p5-log-message">${record.message}</span><span>${record.environment}</span></button>`;
    const tick=()=>{
      if(!live)return;
      const first=main.querySelector('#p5-log-table .p5-row');if(!first)return;
      const now=new Date();
      const stamp=now.toTimeString().slice(0,8)+'.'+String(now.getMilliseconds()).padStart(3,'0');
      const id=`LOG-LIVE-${String(sequence).padStart(4,'0')}`;
      const req=`REQ-LIVE-${String(sequence).padStart(4,'0')}`;
      const trc=`TRC-LIVE-${String(sequence).padStart(4,'0')}`;
      const apps=['APP-SUPPORT-001','APP-CONTACT-002','APP-DOC-003','APP-GROWTH-004'];
      const app=apps[(sequence-1)%apps.length];sequence++;
      const record={id,timestamp:stamp,severity:'Info',component:'GW-001',app,request:req,trace:trc,group:'',message:'Production request completed; routing, policy and delivery checks passed.',environment:'Production',state:'Normal',provider:'AI Gateway',route:'Policy-selected route',retry:'No retry',fallback:'Not required',policy:'Production policy set',incident:''};
      liveRecords.set(id,record);first.insertAdjacentHTML('beforebegin',makeLiveRow(record));lastEventAt=Date.now();renderLiveState();window.lucide?.createIcons?.({attrs:{'stroke-width':1.8}});
      const rows=[...main.querySelectorAll('#p5-log-table .p5-row')];rows.slice(12).forEach(row=>{liveRecords.delete(row.dataset.observeLogEvent);row.remove();});
      setTimeout(()=>main.querySelector(`[data-observe-log-event="${id}"]`)?.classList.remove('observe-log-new'),900);applyFilters();
    };
    main.querySelector('#p5-log-search')?.addEventListener('input',applyFilters);
    main.querySelector('#observe-log-severity')?.addEventListener('change',()=>{groupFilter='';main.querySelectorAll('[data-observe-error-group]').forEach(card=>card.classList.remove('active'));applyFilters();});
    main.querySelector('#observe-log-app')?.addEventListener('change',()=>{groupFilter='';main.querySelectorAll('[data-observe-error-group]').forEach(card=>card.classList.remove('active'));applyFilters();});
    if (requestedLogRequest) applyFilters();
    timer=setInterval(tick,6000);statusTimer=setInterval(renderLiveState,1000);
    main.addEventListener('click',event=>{
      const liveButton=event.target.closest('[data-observe-live-tail]');
      if(liveButton){live=!live;liveButton.classList.toggle('active',!live);liveButton.innerHTML=live?`${icon('pause')}<span>Pause live tail</span>`:`${icon('play')}<span>Resume live tail</span>`;if(live)lastEventAt=Date.now();renderLiveState();toast(live?'Live log tail resumed':'Live log tail paused',live?'radio':'pause');window.lucide?.createIcons?.();return;}
      const groupCard=event.target.closest('[data-observe-error-group]');
      if(groupCard){const group=obs.errorGroups.find(item=>item.id===groupCard.dataset.observeErrorGroup);if(!group)return;groupFilter=group.id;const app=main.querySelector('#observe-log-app');const sev=main.querySelector('#observe-log-severity');const q=main.querySelector('#p5-log-search');if(q)q.value='';if(app)app.value=/^APP-/.test(group.affected)?group.affected:'';if(sev)sev.value=group.filterSeverity||'';main.querySelectorAll('[data-observe-error-group]').forEach(card=>card.classList.toggle('active',card===groupCard));applyFilters();toast(`${group.id} filtered in the event stream`,'filter');return;}
      const row=event.target.closest('[data-observe-log-event]');
      if(row){const log=byId(row.dataset.observeLogEvent);if(log){openOperationalDrawer({title:log.id,kind:'Log event evidence',body:logDetail(log)});}return;}
      if(event.target.closest('[data-observe-log-reset]')){const q=main.querySelector('#p5-log-search');const sev=main.querySelector('#observe-log-severity');const app=main.querySelector('#observe-log-app');if(q)q.value='';if(sev)sev.value='';if(app)app.value='';groupFilter='';main.querySelectorAll('[data-observe-error-group]').forEach(card=>card.classList.remove('active'));applyFilters();toast('Log filters reset','rotate-ccw');return;}
      if(event.target.closest('[data-observe-log-export]')){const visibleIds=[...main.querySelectorAll('[data-observe-log-event]:not([hidden])')].map(row=>row.dataset.observeLogEvent);const records=visibleIds.map(byId).filter(Boolean);downloadText('orvexa-live-logs.json',JSON.stringify(records,null,2),'application/json');toast(`${records.length} filtered log events downloaded`,'download');return;}
      const copy=event.target.closest('[data-observe-log-copy]');if(copy){const log=byId(copy.dataset.observeLogCopy);if(log){navigator.clipboard?.writeText(JSON.stringify(log,null,2));toast(`${log.id} JSON copied`,'copy');}return;}
    },true);
    window.addEventListener('beforeunload',()=>{clearInterval(timer);clearInterval(statusTimer);},{once:true});
  };

  const enhancePerformance = () => {
    document.title = 'Performance & SLO — Orvexa';
    const registryPanel = main.querySelector('.observe-slo-registry-panel');
    const renderBurnCard = slo => { const used=Number(slo.budgetUsed ?? parseInt(slo.budget) ?? 0); return `<button type="button" class="observe-burn-card" data-observe-slo="${escapeHtml(slo.id)}"><div><span><b>${escapeHtml(slo.name)}</b><small>${escapeHtml(slo.id)}</small></span>${status(slo.state)}</div><div class="observe-burn-track"><i style="--burn:${Math.min(used,100)}%" class="${used>=70?'bad':used>=50?'warn':'good'}"></i></div><footer><span>${escapeHtml(slo.budget)}</span><b>${escapeHtml(slo.burn)} burn</b></footer></button>`; };
    const renderSloRow = slo => `<button class="p5-row observe-slo-row" type="button" data-observe-slo="${escapeHtml(slo.id)}"><span><b>${escapeHtml(slo.name)}</b><small class="p5-id">${escapeHtml(slo.id)}</small></span><span><b>${escapeHtml(slo.target)}</b><small>${escapeHtml(slo.sli || 'Production SLI')}</small></span><span>${escapeHtml(slo.displayCurrent || slo.current)}</span><span>${escapeHtml(slo.window)}</span><span>${escapeHtml(slo.budget)}</span><span>${escapeHtml(slo.burn)}</span><span>${status(slo.state)}</span></button>`;
    if(registryPanel){registryPanel.insertAdjacentHTML('beforebegin',`<section class="p5-panel p5-section observe-burn-panel"><header class="p5-panel-head"><div><h2>Error-budget burn</h2><p>Current 30-day budget consumption and multi-window burn for the most important SLOs.</p></div>${status('1 at risk')}</header><div class="observe-burn-grid">${obs.slos.map(renderBurnCard).join('')}</div></section>`);}
    const newSlo=main.querySelector('.p5-context .p5-btn.primary');
    if(newSlo){delete newSlo.dataset.p5Action;newSlo.dataset.observeNewSlo='true';}
    const sloExport=registryPanel?.querySelector('[data-p5-action]');
    if(sloExport){delete sloExport.dataset.p5Action;sloExport.dataset.observeSloExport='true';}

    const sloDetail = slo => `<div class="observe-slo-detail"><div class="observe-slo-detail-hero"><div><small>${escapeHtml(slo.id)} · ${escapeHtml(slo.window)}</small><b>${escapeHtml(slo.target)}</b><p>Current SLI ${escapeHtml(slo.displayCurrent || slo.current)}. ${escapeHtml(slo.budgetBasis || 'Budget consumption is calculated from production SLI violations in the active window.')}</p></div>${status(slo.state)}</div><div class="observe-slo-detail-grid"><div><small>SLI</small><b>${escapeHtml(slo.sli || 'Production objective')}</b></div><div><small>Current</small><b>${escapeHtml(slo.displayCurrent || slo.current)}</b></div><div><small>Error budget</small><b>${escapeHtml(slo.budget)}</b></div><div><small>Burn rate</small><b>${escapeHtml(slo.burn)}</b></div><div><small>Owner</small><b>${escapeHtml(slo.owner || 'Platform Reliability')}</b></div><div><small>Demo snapshot</small><b>${escapeHtml(product.demoClock?.label || 'Aug 27, 2026 · 14:45 UTC')}</b></div></div><div class="observe-slo-definition"><i>${icon('info')}</i><span><b>Error-budget definition</b><small>${escapeHtml(slo.budgetBasis || 'Calculated from objective breaches over the rolling window.')}</small></span></div><div class="observe-slo-actions">${button('Copy SLO ID','copy',false,`data-observe-copy-slo="${escapeHtml(slo.id)}"`)}${button('Export this SLO','download',false,`data-observe-export-one-slo="${escapeHtml(slo.id)}"`)}</div></div>`;

    const sloSteps = ['SLO definition','SLI','Target','Window','Error budget','Burn policy','Ownership','Review'];
    const openSloWizard = () => {
      const stepMarkup = sloSteps.map((label,index)=>`<button type="button" data-observe-slo-step-jump="${index}" class="${index===0?'active':''}"><span>${index+1}</span><b>${label}</b></button>`).join('');
      openOperationalDrawer({title:'New SLO',kind:'Reliability policy · progressive setup',body:`<form class="observe-slo-wizard" id="observe-slo-form" data-slo-step="0"><nav class="observe-slo-stepper" aria-label="SLO setup steps">${stepMarkup}</nav><div class="observe-slo-step-panels"><section data-observe-slo-step-panel="0" class="active"><div class="observe-slo-form-head"><small>Step 1 of 8</small><h3>SLO definition</h3><p>Name the production objective and define what service or workflow it protects.</p></div><label class="observe-form-field"><span>SLO name</span><input class="p5-input" name="name" required value="Realtime answer success"></label><label class="observe-form-field"><span>Service scope</span><select class="p5-input" name="scope"><option>All production applications</option><option>AI Gateway</option><option>Support AI</option><option>AI Contact Center</option><option>Document Intelligence</option><option>Growth Assistant</option></select></label></section><section data-observe-slo-step-panel="1"><div class="observe-slo-form-head"><small>Step 2 of 8</small><h3>Service-level indicator</h3><p>Select the production signal that produces objective evidence.</p></div><label class="observe-form-field"><span>SLI</span><select class="p5-input" name="sli"><option>Successful requests</option><option>Requests under latency objective</option><option>Completed agent runs</option><option>Successful tool calls</option><option>Successful retrievals</option></select></label><div class="observe-slo-note">Budget consumption is calculated from objective breaches, not from a single aggregate KPI.</div></section><section data-observe-slo-step-panel="2"><div class="observe-slo-form-head"><small>Step 3 of 8</small><h3>Target</h3><p>Set the production objective that the SLI must satisfy.</p></div><label class="observe-form-field"><span>Target</span><input class="p5-input" name="target" required value="99.5%"></label></section><section data-observe-slo-step-panel="3"><div class="observe-slo-form-head"><small>Step 4 of 8</small><h3>Rolling window</h3><p>Choose the window used for SLO compliance and budget accounting.</p></div><label class="observe-form-field"><span>Window</span><select class="p5-input" name="window"><option>30 days</option><option>28 days</option><option>7 days</option></select></label></section><section data-observe-slo-step-panel="4"><div class="observe-slo-form-head"><small>Step 5 of 8</small><h3>Error budget</h3><p>The template derives the budget from the target and records consumption from SLI violations.</p></div><div class="observe-slo-review-grid"><div><small>Initial budget use</small><b>0% used</b></div><div><small>Remaining</small><b>100%</b></div></div><div class="observe-slo-note">For a 99.5% success target, the allowable failure envelope is 0.5% of eligible events in the selected window.</div></section><section data-observe-slo-step-panel="5"><div class="observe-slo-form-head"><small>Step 6 of 8</small><h3>Burn policy</h3><p>Choose how sustained consumption changes operational behavior.</p></div><label class="observe-form-field"><span>Policy</span><select class="p5-input" name="burnPolicy"><option>Standard multi-window · Page / Gate / Auto</option><option>Observe only</option><option>Release gate only</option></select></label><div class="observe-slo-policy-preview"><span><b>Fast</b><small>&gt;14x / 1h or &gt;6x / 6h → PAGE</small></span><span><b>Slow</b><small>&gt;1x sustained → GATE</small></span><span><b>Healthy</b><small>&lt;1x → AUTO</small></span></div></section><section data-observe-slo-step-panel="6"><div class="observe-slo-form-head"><small>Step 7 of 8</small><h3>Ownership</h3><p>Assign operational accountability without changing global access roles.</p></div><label class="observe-form-field"><span>Owner</span><select class="p5-input" name="owner"><option>Platform Reliability</option><option>Runtime Platform</option><option>Agent Platform</option><option>Knowledge Systems</option><option>Tooling Platform</option></select></label></section><section data-observe-slo-step-panel="7"><div class="observe-slo-form-head"><small>Step 8 of 8</small><h3>Review</h3><p>Create a versioned static-demo objective. No production policy is changed.</p></div><div class="observe-slo-review" data-observe-slo-review></div><div class="observe-slo-note">Demo snapshot: ${escapeHtml(product.demoClock?.label || 'Aug 27, 2026 · 14:45 UTC')}</div></section></div><footer class="observe-slo-wizard-footer"><button class="p5-btn" type="button" data-observe-slo-save-draft>${icon('save')}Save draft</button><span></span><button class="p5-btn" type="button" data-observe-slo-prev disabled>${icon('arrow-left')}Previous</button><button class="p5-btn primary" type="button" data-observe-slo-next>Next${icon('arrow-right')}</button><button class="p5-btn primary" type="submit" data-observe-slo-create hidden>${icon('plus')}Create SLO</button></footer></form>`});
      syncSloWizard();
    };

    const syncSloWizard = () => {
      const form=document.querySelector('#observe-slo-form'); if(!form)return;
      const step=Math.max(0,Math.min(7,Number(form.dataset.sloStep||0)));
      form.dataset.sloStep=String(step);
      form.querySelectorAll('[data-observe-slo-step-panel]').forEach((panel,index)=>panel.classList.toggle('active',index===step));
      form.querySelectorAll('[data-observe-slo-step-jump]').forEach((item,index)=>{item.classList.toggle('active',index===step);item.classList.toggle('complete',index<step);});
      const prev=form.querySelector('[data-observe-slo-prev]'); const next=form.querySelector('[data-observe-slo-next]'); const create=form.querySelector('[data-observe-slo-create]');
      if(prev)prev.disabled=step===0; if(next)next.hidden=step===7; if(create)create.hidden=step!==7;
      if(step===7){const fd=new FormData(form);const review=form.querySelector('[data-observe-slo-review]');if(review)review.innerHTML=`<div><small>Name</small><b>${escapeHtml(fd.get('name')||'Realtime answer success')}</b></div><div><small>SLI</small><b>${escapeHtml(fd.get('sli')||'Successful requests')}</b></div><div><small>Target</small><b>${escapeHtml(fd.get('target')||'99.5%')}</b></div><div><small>Window</small><b>${escapeHtml(fd.get('window')||'30 days')}</b></div><div><small>Burn policy</small><b>${escapeHtml(fd.get('burnPolicy')||'Standard multi-window')}</b></div><div><small>Owner</small><b>${escapeHtml(fd.get('owner')||'Platform Reliability')}</b></div>`;}
    };

    main.addEventListener('click',event=>{
      const card=event.target.closest('[data-observe-slo]');
      if(card){const slo=obs.slos.find(item=>item.id===card.dataset.observeSlo);if(slo)openOperationalDrawer({title:slo.name,kind:'SLO evidence',body:sloDetail(slo)});return;}
      if(event.target.closest('[data-observe-slo-export]')){const csv=['SLO,Name,SLI,Target,Current,Error budget,Burn,Window,Owner,State',...obs.slos.map(s=>[s.id,s.name,s.sli,s.target,s.displayCurrent||s.current,s.budget,s.burn,s.window,s.owner,s.state].map(v=>`"${v}"`).join(','))].join('\n');downloadText('orvexa-slo-report.csv',csv,'text/csv');toast('SLO report exported','download');return;}
      if(event.target.closest('[data-observe-new-slo]')){openSloWizard();return;}
    });

    document.addEventListener('click',event=>{
      const form=document.querySelector('#observe-slo-form');
      if(form){
        const next=event.target.closest('[data-observe-slo-next]');const prev=event.target.closest('[data-observe-slo-prev]');const jump=event.target.closest('[data-observe-slo-step-jump]');
        if(next){form.dataset.sloStep=String(Math.min(7,Number(form.dataset.sloStep||0)+1));syncSloWizard();return;}
        if(prev){form.dataset.sloStep=String(Math.max(0,Number(form.dataset.sloStep||0)-1));syncSloWizard();return;}
        if(jump){form.dataset.sloStep=jump.dataset.observeSloStepJump;syncSloWizard();return;}
        if(event.target.closest('[data-observe-slo-save-draft]')){toast('SLO draft saved in demo workspace','save');return;}
      }
      const copy=event.target.closest('[data-observe-copy-slo]');if(copy){navigator.clipboard?.writeText(copy.dataset.observeCopySlo);toast(`${copy.dataset.observeCopySlo} copied`,'copy');return;}
      const exportOne=event.target.closest('[data-observe-export-one-slo]');if(exportOne){const slo=obs.slos.find(item=>item.id===exportOne.dataset.observeExportOneSlo);if(slo){downloadText(`${slo.id}.json`,JSON.stringify(slo,null,2),'application/json');toast(`${slo.id} exported`,'download');}return;}
    });
    document.addEventListener('input',event=>{if(event.target.closest('#observe-slo-form'))syncSloWizard();});
    document.addEventListener('change',event=>{if(event.target.closest('#observe-slo-form'))syncSloWizard();});
    document.addEventListener('submit',event=>{if(event.target.id!=='observe-slo-form')return;event.preventDefault();const form=event.target;const fd=new FormData(form);const id=`SLO-CUSTOM-${String(obs.slos.length+1).padStart(2,'0')}`;const record={id,name:String(fd.get('name')||'Realtime answer success'),target:String(fd.get('target')||'99.5%'),current:'Collecting',displayCurrent:'Collecting',budget:'0% used',budgetUsed:0,burn:'0.00x',window:String(fd.get('window')||'30 days'),state:'Healthy',sli:String(fd.get('sli')||'Successful requests'),budgetBasis:'Budget consumption will be derived from SLI violations after enough production evidence is collected.',owner:String(fd.get('owner')||'Platform Reliability')};obs.slos.unshift(record);main.querySelector('.observe-slo-table')?.insertAdjacentHTML('beforeend',renderSloRow(record));main.querySelector('.observe-burn-grid')?.insertAdjacentHTML('afterbegin',renderBurnCard(record));closeOperationalDrawer();toast(`${id} created in demo workspace`,'badge-check');window.lucide?.createIcons?.();});
  };

  const incidentWorkflowConfig = incident => {
    const provider = incident.id === 'INC-2047';
    return provider ? {
      context:'Orbit AI provider latency', stage:'Mitigating', stageIndex:2,
      steps:[['Detected','Automatic latency signal','radio'],['Acknowledged',`${incident.owner} owns the response`,'user-check'],['Mitigating','Approved provider fallback active','shield-alert'],['Monitoring','P95 recovery must remain under SLO','activity'],['Resolved','Resolution evidence recorded','check']],
      automation:[['Provider fallback','Shift eligible Contact Center traffic while the Orbit AI route exceeds approved latency.','route','Active'],['Release freeze','Available if elevated burn begins to threaten a release window.','pause','Standby'],['Resolution evidence','Trace, owner timeline and recovery validation are required before closure.','file-check','Required']]
    } : {
      context:'Campaign tool schema rejection spike', stage:'Acknowledged', stageIndex:1,
      steps:[['Detected','Schema rejection spike detected','radio'],['Acknowledged',`${incident.owner} owns the response`,'user-check'],['Mitigating','Campaign tool isolation ready','shield-alert'],['Monitoring','Rejected-call rate must return to baseline','activity'],['Resolved','Schema validation evidence recorded','check']],
      automation:[['Reject malformed tool calls','Block invalid budget arguments before tool execution.','shield-x','Active'],['Campaign tool isolation','Restrict the affected MCP binding if malformed traffic persists.','pause','Ready'],['Resolution evidence','Attach schema fix, rejected-call sample and verification run before closure.','file-check','Required']]
    };
  };
  const renderIncidentWorkspace = incidentId => {
    const incident=obs.incidents?.find(item=>item.id===incidentId); if(!incident)return;
    const cfg=incidentWorkflowConfig(incident);
    main.querySelectorAll('[data-observe-incident]').forEach(card=>{const selected=card.dataset.observeIncident===incident.id;card.classList.toggle('selected',selected);card.setAttribute('aria-pressed',String(selected));});
    const context=main.querySelector('#observe-workflow-context');
    if(context)context.innerHTML=`<span class="observe-context-kicker">Selected incident</span><b>${escapeHtml(incident.id)} · ${escapeHtml(cfg.context)}</b><small>Current stage · ${escapeHtml(cfg.stage)}</small>`;
    const workflow=main.querySelector('#observe-response-workflow');
    if(workflow)workflow.innerHTML=cfg.steps.map((item,index)=>`<div class="p5-workflow-step ${index<cfg.stageIndex?'complete':index===cfg.stageIndex?'current':'future'}"><i>${icon(item[2])}</i><b>${escapeHtml(item[0])}</b><small>${escapeHtml(item[1])}</small></div>`).join('');
    const autoContext=main.querySelector('#observe-automation-context');
    if(autoContext)autoContext.innerHTML=`<span class="observe-context-kicker">Selected incident</span><b>${escapeHtml(incident.id)} · ${escapeHtml(cfg.context)} response</b><small>${escapeHtml(incident.severity)} · ${escapeHtml(incident.owner)} · ${escapeHtml(incident.started)}</small>`;
    const automation=main.querySelector('#observe-response-automation');
    if(automation)automation.innerHTML=cfg.automation.map(item=>`<div class="p5-auto"><i>${icon(item[2])}</i><span><b>${escapeHtml(item[0])}</b><small>${escapeHtml(item[1])}</small></span>${status(item[3])}</div>`).join('');
    window.lucide?.createIcons?.({ attrs:{'stroke-width':1.8} });
  };
  const alertEvidence = alert => `<div class="p5-insight observe-alert-evidence"><div class="p5-insight-hero"><b>${escapeHtml(alert.rule)}</b><p>${escapeHtml(alert.source)} is ${escapeHtml(alert.state.toLowerCase())}; no incident has been declared yet.</p></div><div class="p5-inspector-facts"><div><small>Alert</small><b>${escapeHtml(alert.id)}</b></div><div><small>Severity</small><b>${escapeHtml(alert.severity)}</b></div><div><small>Current</small><b>${escapeHtml(alert.current)}</b></div><div><small>Started</small><b>${escapeHtml(alert.started)}</b></div><div><small>Owner</small><b>${escapeHtml(alert.owner)}</b></div><div><small>Application</small><b>${escapeHtml(alert.app || '—')}</b></div></div><div class="p5-insight-actions">${button('Declare incident','siren',true,`data-observe-declare-from-alert="${alert.id}"`)}${button('Open source evidence','external-link',false,`data-observe-alert-source="${alert.id}"`)}</div></div>`;
  const incidentDetail = incident => { const cfg=incidentWorkflowConfig(incident); return `<div class="p5-insight observe-incident-detail"><div class="p5-insight-hero"><b>${escapeHtml(incident.title)}</b><p>${escapeHtml(incident.impact)}</p></div><div class="p5-inspector-facts"><div><small>Incident</small><b>${incident.id}</b></div><div><small>Severity</small><b>${incident.severity}</b></div><div><small>Affected app</small><b>${incident.apps}</b></div><div><small>Owner</small><b>${incident.owner}</b></div><div><small>Provider / source</small><b>${incident.provider}</b></div><div><small>Started</small><b>${incident.started}</b></div></div><section class="observe-incident-timeline"><h3>Response timeline</h3>${cfg.steps.map((item,index)=>`<div class="${index<=cfg.stageIndex?'active':''}"><i>${icon(item[2])}</i><span><b>${escapeHtml(item[0])}</b><small>${escapeHtml(item[1])}</small></span></div>`).join('')}</section><div class="p5-insight-actions">${button('Activate mitigation','shield-check',true,`data-observe-mitigate="${incident.id}"`)}${button('Open related traces','git-branch',false,'data-observe-link="traces.html"')}${button('Resolve incident','check',false,`data-observe-resolve-incident="${incident.id}"`)}${button('Add timeline note','message-square-plus',false,'data-observe-incident-note')}</div></div>`; };

  const incidentSourceOptions = selectedAlertId => (obs.alerts||[]).map(alert=>`<option value="${alert.id}" ${alert.id===selectedAlertId?'selected':''}>${escapeHtml(alert.id)} · ${escapeHtml(alert.rule)}</option>`).join('');
  const openDeclareIncidentDrawer = (selectedAlertId='ALT-5812') => {
    const alert=(obs.alerts||[]).find(item=>item.id===selectedAlertId) || obs.alerts?.find(item=>item.incident==='None') || obs.alerts?.[0];
    const title=alert?.rule === 'Grounding gate regression' ? 'Grounding quality regression' : alert?.rule === 'Source freshness missed' ? 'Knowledge source freshness degradation' : 'Production AI degradation';
    openOperationalDrawer({title:'Declare incident',kind:'Incident command · governed declaration',body:`<form class="observe-incident-drawer-form" id="observe-incident-form"><section class="observe-incident-form-section"><div class="observe-slo-form-head"><small>Source</small><h3>Source alert</h3><p>Link the incident to the operational signal that created the response.</p></div><label class="observe-form-field"><span>Alert</span><select class="p5-input" name="sourceAlert" data-observe-incident-source>${incidentSourceOptions(alert?.id)}</select></label></section><section class="observe-incident-form-section"><div class="observe-slo-form-head"><small>Classification</small><h3>Incident definition</h3></div><div class="observe-form-grid"><label class="observe-form-field"><span>Severity</span><select class="p5-input" name="severity"><option>SEV-2</option><option>SEV-1</option><option>SEV-3</option></select></label><label class="observe-form-field"><span>Owner</span><input class="p5-input" name="owner" value="${escapeHtml(alert?.owner || 'Platform Reliability')}" required></label></div><label class="observe-form-field"><span>Incident title</span><input class="p5-input" name="title" value="${escapeHtml(title)}" required></label><label class="observe-form-field"><span>Affected application</span><select class="p5-input" name="app"><option ${alert?.app==='APP-CONTACT-002'?'selected':''}>APP-CONTACT-002</option><option ${alert?.app==='APP-SUPPORT-001'?'selected':''}>APP-SUPPORT-001</option><option ${alert?.app==='APP-DOC-003'?'selected':''}>APP-DOC-003</option><option ${alert?.app==='APP-GROWTH-004'?'selected':''}>APP-GROWTH-004</option></select></label></section><section class="observe-incident-form-section"><div class="observe-slo-form-head"><small>Impact & response</small><h3>Operational context</h3></div><label class="observe-form-field"><span>Customer / workload impact</span><textarea class="p5-input" name="impact" rows="3" required>${escapeHtml(alert?.id==='ALT-5812'?'Support release grounding evidence is below the 96.0% gate.':'Production workload requires coordinated incident ownership.')}</textarea></label><label class="observe-form-field"><span>Initial response</span><textarea class="p5-input" name="response" rows="3" required>${escapeHtml(alert?.id==='ALT-5812'?'Hold risky promotion and inspect failed grounding evidence.':'Acknowledge owner and preserve request, trace and policy evidence.')}</textarea></label></section><section class="observe-incident-review"><span><small>Review</small><b>Declaring an incident creates accountable coordination evidence only.</b></span><span>${status('No automatic production write')}</span></section><footer class="observe-incident-form-footer">${button('Save draft','save',false,'data-observe-incident-save-draft')}${button('Declare incident','siren',true,'type="submit"')}</footer></form>`});
  };
  const alertRulesDrawer = () => `<form class="observe-alert-rules-form" id="observe-alert-rules-form"><div class="p5-insight-hero"><b>Alert routing rules</b><p>Signals become pages, investigations or operator watches according to sustained thresholds and ownership policy.</p></div><div class="observe-alert-rule-list">${(obs.alerts||[]).map(alert=>`<section class="observe-alert-rule"><header><span><b>${escapeHtml(alert.rule)}</b><small>${escapeHtml(alert.id)} · ${escapeHtml(alert.source)}</small></span>${status(alert.severity)}</header><div class="observe-alert-rule-grid"><label><small>Signal / threshold</small><input class="p5-input" value="${escapeHtml(alert.current)} current" aria-label="${escapeHtml(alert.rule)} threshold"></label><label><small>Window</small><select class="p5-input"><option>${alert.id==='ALT-5821'?'8 minutes':alert.id==='ALT-5818'?'10 minutes':alert.id==='ALT-5812'?'Release evaluation':'24 hours'}</option></select></label><label><small>Paging policy</small><select class="p5-input"><option>${alert.state==='Paging'?'Page owner':alert.state==='Acknowledged'?'Notify owner':'Operator queue'}</option></select></label><label><small>Cooldown</small><select class="p5-input"><option>15 minutes</option><option>30 minutes</option></select></label><label><small>Incident auto-create</small><select class="p5-input"><option>${alert.incident!=='None'?'Enabled':'Manual'}</option></select></label><label><small>Owner</small><input class="p5-input" value="${escapeHtml(alert.owner)}"></label></div></section>`).join('')}</div><footer class="observe-incident-form-footer">${button('Save demo rules','save',true,'type="submit"')}</footer></form>`;
  const updateIncidentCounts = () => {
    const count=(obs.incidents||[]).filter(item=>item.state!=='Resolved').length;
    const activeStrong=[...main.querySelectorAll('.p5-metric')].find(card=>card.querySelector('small')?.textContent.trim()==='Active incidents')?.querySelector('strong'); if(activeStrong)activeStrong.textContent=String(count);
    const badge=main.querySelector('#observe-active-count .p5-status'); if(badge)badge.textContent=`${count} active`;
  };
  const enhanceIncidents = () => {
    document.title = 'Alerts & Incidents — Orvexa';
    const declare=main.querySelector('.p5-context .p5-btn.primary'); if(declare)declare.dataset.observeDeclareIncident='true';
    const alertRules=main.querySelector('.p5-table.alerts')?.closest('.p5-panel')?.querySelector('[data-p5-action]'); if(alertRules){delete alertRules.dataset.p5Action;alertRules.dataset.observeAlertRules='true';}
    renderIncidentWorkspace('INC-2047');
    main.addEventListener('click',event=>{
      const incidentCard=event.target.closest('[data-observe-incident]'); if(incidentCard){renderIncidentWorkspace(incidentCard.dataset.observeIncident);return;}
      const alertAction=event.target.closest('[data-observe-alert-action]');
      if(alertAction){const alert=(obs.alerts||[]).find(item=>item.id===alertAction.dataset.alertId);if(!alert)return;const action=alertAction.dataset.observeAlertAction;
        if(action==='ack'){const wasPaging=alert.state==='Paging';alert.state='Acknowledged';const row=main.querySelector(`[data-alert-id="${alert.id}"]`);const stateCell=row?.querySelector('.p5-alert-state');if(stateCell)stateCell.innerHTML=`${status('Acknowledged')}${alert.incident!=='None'?`<button class="p5-mini" type="button" data-observe-alert-action="incident" data-alert-id="${alert.id}" data-incident-id="${alert.incident}">Open incident</button>`:''}`;if(wasPaging){const paging=[...main.querySelectorAll('.p5-metric')].find(card=>card.querySelector('small')?.textContent.trim()==='Paging alerts')?.querySelector('strong');if(paging)paging.textContent='0';}const ack=[...main.querySelectorAll('.p5-metric')].find(card=>card.querySelector('small')?.textContent.trim()==='Acknowledged')?.querySelector('strong');if(ack)ack.textContent=String(Number(ack.textContent||0)+1);toast(`${alert.id} acknowledged`,'user-check');window.lucide?.createIcons?.();return;}
        if(action==='incident'){renderIncidentWorkspace(alert.incident);main.querySelector('.observe-active-incidents')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
        if(action==='investigation'){openOperationalDrawer({title:alert.id,kind:'Alert investigation',body:alertEvidence(alert)});return;}
      }
      if(event.target.closest('[data-observe-alert-rules]')){openOperationalDrawer({title:'Alert rules',kind:'Alert routing policy',body:alertRulesDrawer()});return;}
      const fromAlert=event.target.closest('[data-observe-declare-from-alert]');if(fromAlert){closeOperationalDrawer();setTimeout(()=>openDeclareIncidentDrawer(fromAlert.dataset.observeDeclareFromAlert),180);return;}
      if(event.target.closest('[data-observe-declare-incident]')){openDeclareIncidentDrawer();return;}
      if(event.target.closest('[data-observe-incident-save-draft]')){toast('Incident draft saved in demo workspace','save');return;}
      const source=event.target.closest('[data-observe-alert-source]');if(source){const alert=(obs.alerts||[]).find(item=>item.id===source.dataset.observeAlertSource);if(alert?.source==='EVAL-GROUND-012')window.location.href='./performance-slo.html';else if(alert?.source==='SRC-POLICY-022')window.location.href='../pages/sources-ingestion.html?source=SRC-POLICY-022';return;}
      const resolve=event.target.closest('[data-observe-resolve-incident]');if(resolve){const incident=obs.incidents?.find(item=>item.id===resolve.dataset.observeResolveIncident);if(incident){incident.state='Resolved';incident.stage='Resolved';const card=main.querySelector(`[data-observe-incident="${incident.id}"]`);card?.classList.add('observe-resolved');updateIncidentCounts();closeOperationalDrawer();toast(`${incident.id} marked resolved in demo state`,'check');}return;}
      if(event.target.closest('[data-observe-incident-note]')){toast('Timeline note added','message-square-plus');return;}
      const link=event.target.closest('[data-observe-link]');if(link){window.location.href=`./${link.dataset.observeLink}`;}
    },true);
    document.addEventListener('change',event=>{if(!event.target.matches('[data-observe-incident-source]'))return;const alert=(obs.alerts||[]).find(item=>item.id===event.target.value);const form=event.target.closest('#observe-incident-form');if(!alert||!form)return;form.elements.owner.value=alert.owner;form.elements.app.value=alert.app||'APP-CONTACT-002';form.elements.title.value=alert.rule==='Grounding gate regression'?'Grounding quality regression':alert.rule==='Source freshness missed'?'Knowledge source freshness degradation':alert.rule;});
    document.addEventListener('submit',event=>{
      if(event.target.id==='observe-alert-rules-form'){event.preventDefault();closeOperationalDrawer();toast('Alert routing rules saved in demo workspace','settings-2');return;}
      if(event.target.id!=='observe-incident-form')return;event.preventDefault();const form=new FormData(event.target);let numeric=2049;const ids=new Set((obs.incidents||[]).map(item=>item.id));while(ids.has(`INC-${numeric}`))numeric++;const id=`INC-${numeric}`;const alert=(obs.alerts||[]).find(item=>item.id===form.get('sourceAlert'));const impact=String(form.get('impact')||'Newly declared production impact.');const record={id,title:String(form.get('title')),impact,impactValue:'New',impactLabel:'declared impact',apps:String(form.get('app')),provider:alert?.source||'Manual declaration',owner:String(form.get('owner')),started:'Now',stage:'Acknowledged',severity:String(form.get('severity')),state:'Active'};obs.incidents.unshift(record);if(alert){alert.incident=id;alert.state='Acknowledged';}const grid=main.querySelector('.p5-incident-grid');grid?.insertAdjacentHTML('afterbegin',`<button class="p5-incident incident-generic selected" type="button" data-observe-incident="${id}" aria-pressed="true"><div class="p5-incident-top"><span><div class="observe-incident-titleline"><span class="observe-sev-badge">${escapeHtml(record.severity)}</span><small class="p5-id">${id}</small></div><h3>${escapeHtml(record.title)}</h3></span>${status('Acknowledged')}</div><p>${escapeHtml(record.impact)}</p><div class="observe-incident-impact"><strong>New</strong><span>declared impact</span></div><div class="p5-incident-meta"><span>${escapeHtml(record.apps)} · ${escapeHtml(record.provider)}</span><span>${escapeHtml(record.owner)} · Now</span></div></button>`);updateIncidentCounts();closeOperationalDrawer();renderIncidentWorkspace(id);toast(`${id} declared`,'siren');window.lucide?.createIcons?.();
    });
  };

  const heatmapHours = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00'];
  const heatmapCells = [
    ['Astra AI',[58,62,66,71,74,69,65]],['Meridian AI',[42,48,54,59,63,57,52]],['Orbit AI',[66,72,78,82,88,91,84]],['Nimbus AI',[24,28,34,38,42,39,31]]
  ];
  const heatmapTone = value => value >= 90 ? 'critical' : value >= 85 ? 'high' : value >= 70 ? 'warm' : 'cool';
  const heatmapMarkup = () => `<div class="observe-heatmap"><div class="observe-heatmap-head"><span>Provider</span>${heatmapHours.map(hour=>`<span>${hour}</span>`).join('')}</div>${heatmapCells.map(([name,values])=>`<div class="observe-heatmap-row"><b>${name}</b>${values.map((value,index)=>{const tip=`${name} · ${heatmapHours[index]} · ${value}% utilization · ${100-value}% remaining capacity`;return `<span class="${heatmapTone(value)}" tabindex="0" data-heatmap-tip="${escapeHtml(tip)}" aria-label="${escapeHtml(tip)}"><i style="--load:${value/100}"></i><small>${value}%</small></span>`;}).join('')}</div>`).join('')}<div class="observe-heatmap-legend" aria-label="Capacity heatmap legend"><span class="cool"><i></i>Low &lt;70%</span><span class="warm"><i></i>Moderate 70–84%</span><span class="high"><i></i>High 85–89%</span><span class="critical"><i></i>Critical ≥90%</span></div></div>`;
  const forecastBars = days => (days===30?[62,68,71,76,82,86,91]:[61,65,69,74,79,84,88]).map((value,index)=>`<span><i style="--forecast:${value}%"></i><small>${days===30?['D1','D5','D10','D15','D20','D25','D30'][index]:['Sat','Sun','Mon','Tue','Wed','Thu','Fri'][index]}</small><b>${value}%</b></span>`).join('');

  const openCapacityPlanDrawer = () => {
    const summary = obs.capacitySummary || {};
    openOperationalDrawer({title:'Capacity plan',kind:'Reserve production capacity',body:`<form class="observe-form observe-capacity-plan-form" id="observe-capacity-form"><div class="observe-capacity-plan-summary"><div><small>Effective headroom</small><b>${escapeHtml(summary.effectiveHeadroom || '32%')}</b><span>Raw fleet ${escapeHtml(summary.rawHeadroom || '36.9%')}</span></div><div><small>Constrained provider</small><b>${escapeHtml(summary.constrainedProvider || 'PRV-GOOGLE-03')}</b><span>${escapeHtml(summary.constrainedHeadroom || '18%')} headroom</span></div><div><small>Peak coverage</small><b>${escapeHtml(summary.peakCoverage || '1.42×')}</b><span>${escapeHtml(summary.projectedPeak || '14:00 UTC')} projected peak</span></div></div><label><span>Provider</span><select class="p5-input" name="provider">${obs.providers.map(p=>`<option value="${p.id}">${escapeHtml(p.name)} · ${escapeHtml(p.routingRole)} · ${escapeHtml(p.headroom)} headroom</option>`).join('')}</select></label><label><span>Target effective headroom</span><input class="p5-input" name="headroom" value="32%" required></label><label><span>Reservation window</span><select class="p5-input" name="window"><option>${escapeHtml(summary.peakWindow || '13:00–16:00 UTC')}</option><option>Next 24 hours</option><option>Next 7 days</option></select></label><label><span>Overflow policy</span><select class="p5-input" name="policy"><option>Approved fallback route</option><option>Queue low-priority traffic</option><option>Reserved provider only</option></select></label><div class="observe-capacity-definition"><i>${icon('info')}</i><span><b>Effective headroom</b><small>Raw fleet headroom is ${escapeHtml(summary.rawHeadroom || '36.9%')}; the ${escapeHtml(summary.effectiveHeadroom || '32%')} operating value accounts for peak reservations and routing constraints.</small></span></div><footer>${button('Cancel','x',false,'data-p5-close')}${button('Save capacity plan','calendar-check',true,'type="submit"')}</footer></form>`});
  };

  const enhanceCapacity = () => {
    document.title = 'Reliability & Capacity — Orvexa';
    const summary = obs.capacitySummary || {};
    const metricCards=[...main.querySelectorAll('.p5-metric')];
    if(metricCards[0])metricCards[0].title=`Raw fleet headroom ${summary.rawHeadroom || '36.9%'}; effective headroom ${summary.effectiveHeadroom || '32%'} after peak reservations and routing constraints.`;
    if(metricCards[2])metricCards[2].title=`Peak affected-route fallback during INC-2047 mitigation. Current AI Gateway 15-minute fallback is 4.2%.`;
    if(metricCards[3])metricCards[3].title=`${summary.peakCoverageDefinition || 'Reserved capacity ÷ projected peak demand'} at the ${summary.projectedPeak || '14:00 UTC'} projected peak.`;
    const providerPanel=main.querySelector('.p5-table.providers')?.closest('.p5-panel');
    if(providerPanel)providerPanel.insertAdjacentHTML('beforebegin',`<section class="p5-grid equal p5-section observe-capacity-secondary"><article class="p5-panel"><header class="p5-panel-head"><div><h2>Provider capacity heatmap</h2><p>Hourly utilization against approved production quota.</p></div>${status('Live')}</header>${heatmapMarkup()}</article><article class="p5-panel"><header class="p5-panel-head"><div><h2>Demand forecast</h2><p>Projected peak utilization before reserve and fallback protection.</p></div><div class="observe-segmented"><button class="active" type="button" data-observe-forecast="7">7 day</button><button type="button" data-observe-forecast="30">30 day</button></div></header><div class="observe-forecast" id="observe-forecast-bars">${forecastBars(7)}</div><div class="observe-forecast-note"><i>${icon('shield-check')}</i><span><b>Peak coverage ${escapeHtml(summary.peakCoverage || '1.42×')}</b><small>${escapeHtml(summary.peakCoverageDefinition || 'Reserved capacity ÷ projected peak demand')} · projected ${escapeHtml(summary.projectedPeak || '14:00 UTC')} peak.</small></span></div></article></section>`);
    const capacityPlan=main.querySelector('.p5-context .p5-btn.primary');if(capacityPlan)capacityPlan.dataset.observeCapacityPlan='true';
    const providerHead=providerPanel?.querySelector('.p5-panel-head');
    const providerPolicy=providerHead?.querySelector('[data-p5-action]');
    if(providerPolicy){delete providerPolicy.dataset.p5Action;providerPolicy.dataset.observeProviderPolicy='true';}
    if(providerHead){
      const controls=document.createElement('div');controls.className='observe-provider-toolbar';controls.innerHTML=`<input class="p5-input" id="observe-provider-search" placeholder="Search provider" aria-label="Search provider"><select class="p5-input" id="observe-provider-state"><option value="">All states</option><option>Healthy</option><option>Watch</option></select>`;
      if(providerPolicy)controls.append(providerPolicy);
      providerHead.append(controls);
    }
    const filterProviders=()=>{const q=main.querySelector('#observe-provider-search')?.value.trim().toLowerCase()||'';const s=main.querySelector('#observe-provider-state')?.value||'';main.querySelectorAll('.p5-table.providers .p5-row').forEach((row,index)=>{const provider=obs.providers[index];row.hidden=!( (!q||`${provider.name} ${provider.id} ${provider.routingRole}`.toLowerCase().includes(q)) && (!s||provider.state===s));});};
    main.querySelector('#observe-provider-search')?.addEventListener('input',filterProviders);main.querySelector('#observe-provider-state')?.addEventListener('change',filterProviders);
    main.addEventListener('click',event=>{
      const forecast=event.target.closest('[data-observe-forecast]');if(forecast){main.querySelectorAll('[data-observe-forecast]').forEach(btn=>btn.classList.toggle('active',btn===forecast));main.querySelector('#observe-forecast-bars').innerHTML=forecastBars(Number(forecast.dataset.observeForecast));toast(`${forecast.dataset.observeForecast}-day demand forecast selected`,'chart-column-increasing');return;}
      if(event.target.closest('[data-observe-provider-policy]')){openOperationalDrawer({title:'Provider capacity policy',kind:'Routing safeguard',body:`<div class="p5-insight"><div class="p5-insight-hero"><b>Capacity-aware routing</b><p>Provider headroom, region, availability, P95 latency and fallback compatibility govern traffic placement. Routing role is a default fleet posture; application route policies still own the actual fallback chain.</p></div><div class="p5-inspector-facts"><div><small>Effective headroom</small><b>${escapeHtml(summary.effectiveHeadroom || '32%')}</b></div><div><small>Raw fleet headroom</small><b>${escapeHtml(summary.rawHeadroom || '36.9%')}</b></div><div><small>Headroom page</small><b>15%</b></div><div><small>Peak coverage floor</small><b>1.2×</b></div><div><small>Region policy</small><b>Approved regions only</b></div><div><small>Fallback quality</small><b>Gate enforced</b></div></div></div>`});return;}
      if(event.target.closest('[data-observe-capacity-plan]')){openCapacityPlanDrawer();return;}
    });
    document.addEventListener('submit',event=>{if(event.target.id!=='observe-capacity-form')return;event.preventDefault();const form=new FormData(event.target);closeOperationalDrawer();toast(`Capacity plan saved for ${form.get('provider')} · ${form.get('headroom')} effective headroom`,'calendar-check');});
  };

  document.addEventListener('click', event => {
    const mitigate=event.target.closest('[data-observe-mitigate]');
    if(mitigate){toast(`${mitigate.dataset.observeMitigate}: approved mitigation activated`,'shield-check');return;}
    const resolve=event.target.closest('[data-observe-resolve-incident]');
    if(resolve){const card=main.querySelector(`[data-observe-incident="${resolve.dataset.observeResolveIncident}"]`);card?.classList.add('observe-resolved');closeOperationalDrawer();toast(`${resolve.dataset.observeResolveIncident} marked resolved in demo state`,'check');return;}
    if(event.target.closest('[data-observe-incident-note]')){toast('Timeline note added','message-square-plus');return;}
    const link=event.target.closest('.p5-drawer [data-observe-link]');if(link){window.location.href=`./${link.dataset.observeLink}`;}
  });

  const normalizeHeadButtons = () => {
    const primary=main.querySelector('.p5-context .p5-btn.primary');
    if(primary && primary.dataset.p5Action){delete primary.dataset.p5Action;}
  };

  if (page === 'traces') renderTraces();
  else {
    normalizeHeadButtons();
    if (page === 'sessions') enhanceSessions();
    if (page === 'logs-errors') enhanceLogs();
    if (page === 'performance-slo') enhancePerformance();
    if (page === 'alerts-incidents') enhanceIncidents();
    if (page === 'reliability-capacity') enhanceCapacity();
  }

  window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
})();
