(() => {
  'use strict';

  const product = window.Orvexa?.product;
  const data = product?.analytics;
  const main = document.querySelector('main.p6-page');
  const page = document.body.dataset.analyticsPage || document.body.dataset.activePage;
  if (!product || !data || !main || !['usage-analytics','end-user-usage','cost-budgets','rate-limits-quotas'].includes(page)) return;

  const icon = name => `<i data-lucide="${name}"></i>`;
  const toast = (message, glyph = 'sparkles') => window.showToast?.(message, glyph);
  const escapeCsv = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const download = (name, rows) => {
    const blob = new Blob([rows.map(row => row.map(escapeCsv).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  };
  const setButtonLabel = (button, label) => {
    const icons = button.querySelectorAll('svg,i');
    const first = icons[0]?.outerHTML || icon('calendar-range');
    const last = icons.length > 1 ? (icons[icons.length - 1]?.outerHTML || icon('chevron-down')) : icon('chevron-down');
    button.innerHTML = `${first}<span>${label}</span>${last}`;
  };

  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'p6-modal-backdrop';
  const modal = document.createElement('section');
  modal.className = 'p6-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
  document.body.append(modalBackdrop, modal);
  let modalReturnFocus = null;
  let modalSubmit = null;

  const closeModal = () => {
    modal.classList.remove('open'); modalBackdrop.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
    modalSubmit = null; modalReturnFocus?.focus?.();
  };
  const openModal = ({ title, copy, body, submitLabel = 'Apply', onSubmit, trigger }) => {
    modalReturnFocus = trigger || document.activeElement;
    modal.innerHTML = `<header class="p6-modal-head"><div><h2>${title}</h2><p>${copy}</p></div><button class="p6-btn" type="button" aria-label="Close" data-an-close>${icon('x')}</button></header><div class="p6-modal-body">${body}</div><footer class="p6-modal-foot"><button class="p6-btn" type="button" data-an-close>Cancel</button><button class="p6-btn primary" type="button" data-an-submit>${icon('check')} ${submitLabel}</button></footer>`;
    modalSubmit = onSubmit || null;
    modal.classList.add('open'); modalBackdrop.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
    requestAnimationFrame(() => modal.querySelector('input,select,button')?.focus());
  };
  modal.addEventListener('click', event => {
    if (event.target.closest('[data-an-close]')) closeModal();
    if (event.target.closest('[data-an-submit]')) modalSubmit?.(modal, closeModal);
    const period = event.target.closest('[data-an-period]');
    if (period) modal.querySelectorAll('[data-an-period]').forEach(item => item.classList.toggle('active', item === period));
  });
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  const periodButton = [...main.querySelectorAll('[data-p6-action="Period selector"]')][0];
  const periodKey = 'orvexa-analytics-period-v1';
  const periodState = (() => { try { return JSON.parse(localStorage.getItem(periodKey)) || { period: '30', compare: true }; } catch (_) { return { period: '30', compare: true }; } })();
  if (page === 'usage-analytics' || page === 'cost-budgets') { periodState.period = '30'; localStorage.setItem(periodKey, JSON.stringify(periodState)); }
  if (periodButton) setButtonLabel(periodButton, `Last ${periodState.period} days`);
  let compareStrip = null;
  if (page !== 'rate-limits-quotas') {
    compareStrip = document.createElement('section');
    compareStrip.className = 'p6-compare-strip';
    compareStrip.classList.toggle('users', page === 'end-user-usage');
    compareStrip.classList.toggle('costs', page === 'cost-budgets');
    compareStrip.innerHTML = page === 'end-user-usage'
      ? `<div><small>Period comparison</small><b id="an-compare-label">Last ${periodState.period} days vs previous period</b></div><div><small>Sessions / user</small><strong class="positive">${data.userFeatureComparison.sessionsPerUser}</strong></div><div><small>Feature adoption</small><strong class="positive">${data.userFeatureComparison.featureAdoption}</strong></div><div><small>User satisfaction</small><strong class="positive">${data.userFeatureComparison.userSatisfaction}</strong></div><div><small>Flagged users</small><strong class="positive">${data.userFeatureComparison.flaggedUsers}</strong></div>`
      : page === 'cost-budgets'
        ? `<div><small>FinOps comparison</small><b id="an-compare-label">Selected 30D budget window</b></div><div><small>Budget utilized</small><strong>${data.costComparison.budgetUtilized}</strong></div><div><small>Forecast vs budget</small><strong class="positive">${data.costComparison.forecastVsBudget}</strong></div><div><small>Verified savings</small><strong class="positive">${data.costComparison.verifiedSavings}</strong></div><div><small>Cost / request</small><strong class="positive">${data.costComparison.costPerRequest}</strong></div>`
        : `<div><small>Period comparison</small><b id="an-compare-label">Last ${periodState.period} days vs previous period</b></div><div><small>Requests</small><strong class="positive">+9.8%</strong></div><div><small>Quality impact</small><strong class="positive">+1.4 pts</strong></div><div><small>Cost / request</small><strong class="positive">−4.2%</strong></div>`;
    const metrics = main.querySelector('.p6-metrics');
    if (metrics) metrics.insertAdjacentElement('afterend', compareStrip);
    compareStrip.hidden = !periodState.compare;
  }

  const openPeriod = trigger => {
    if (page === 'usage-analytics') return openModal({
      title: 'Usage reporting window', copy: 'Usage Analytics is intentionally anchored to the canonical 30-day reporting window so its ledger reconciles with the 1.32M/day Gateway volume model.', trigger,
      body: `<div class="p6-budget-state"><b>Last 30 days</b><br>39.6M requests · 84.2B processed tokens · 38.4K referenced users · 25.0K agent runs.<br><small>Comparison: previous 30-day period. The daily operational view remains in AI Gateway and Reliability & Capacity.</small></div><label class="p6-check"><input type="checkbox" id="an-compare" ${periodState.compare ? 'checked' : ''}><span><b>Compare previous 30 days</b><small>Show request, quality-impact, and cost-efficiency deltas.</small></span></label>`,
      onSubmit: (root, done) => { periodState.period='30'; periodState.compare=root.querySelector('#an-compare')?.checked ?? true; localStorage.setItem(periodKey, JSON.stringify(periodState)); if(periodButton) setButtonLabel(periodButton,'Last 30 days'); if(compareStrip) compareStrip.hidden=!periodState.compare; const label=compareStrip?.querySelector('#an-compare-label'); if(label) label.textContent='Last 30 days vs previous period'; done(); toast('Usage Analytics remains anchored to 30 days','calendar-range'); }
    });
    if (page === 'cost-budgets') return openModal({
      title: 'FinOps budget window', copy: 'AI Cost & Budgets is anchored to the selected 30-day managed budget window so spend, forecast, headroom, savings, and allocation reconcile.', trigger,
      body: `<div class="p6-budget-state"><b>Last 30 days · managed AI spend</b><br>$10.64K spend · $12.00K approved budget · $11.58K forecast · $420 expected headroom.<br><small>The chart shows the recent 7-day daily slice inside this 30-day budget window; approved pace is $400/day.</small></div><label class="p6-check"><input type="checkbox" id="an-compare" ${periodState.compare ? 'checked' : ''}><span><b>Show FinOps comparison</b><small>Show budget utilization, forecast variance, verified savings, and cost/request context.</small></span></label>`,
      onSubmit: (root, done) => { periodState.period='30'; periodState.compare=root.querySelector('#an-compare')?.checked ?? true; localStorage.setItem(periodKey, JSON.stringify(periodState)); if(periodButton) setButtonLabel(periodButton,'Last 30 days'); if(compareStrip) compareStrip.hidden=!periodState.compare; const label=compareStrip?.querySelector('#an-compare-label'); if(label) label.textContent='Selected 30D budget window'; done(); toast('FinOps remains anchored to the 30-day budget window','wallet-cards'); }
    });
    return openModal({
      title: 'Analytics period', copy: 'Choose a reporting window and compare it with the immediately preceding period.', trigger,
      body: `<div class="p6-period-options">${['7','30','90'].map(value => `<button class="p6-period-option ${String(periodState.period) === value ? 'active' : ''}" type="button" data-an-period="${value}">Last ${value} days</button>`).join('')}</div><label class="p6-check"><input type="checkbox" id="an-compare" ${periodState.compare ? 'checked' : ''}><span><b>Compare previous period</b><small>${page === 'end-user-usage' ? 'Show sessions/user, adoption, satisfaction, and flagged-user deltas.' : 'Show directional change for requests, quality, and cost efficiency.'}</small></span></label>`,
      onSubmit: (root, done) => { const selected=root.querySelector('[data-an-period].active')?.dataset.anPeriod || '30'; const compare=root.querySelector('#an-compare')?.checked ?? true; periodState.period=selected; periodState.compare=compare; localStorage.setItem(periodKey,JSON.stringify(periodState)); if(periodButton) setButtonLabel(periodButton,`Last ${selected} days`); if(compareStrip) compareStrip.hidden=!compare; const label=compareStrip?.querySelector('#an-compare-label'); if(label) label.textContent=`Last ${selected} days vs previous period`; done(); toast(`Analytics period set to ${selected} days`,'calendar-range'); }
    });
  };

  const applyRows = (selector, predicate) => {
    let visible = 0;
    main.querySelectorAll(selector).forEach((row, index) => { const show = predicate(row, index); row.hidden = !show; if (show) visible += 1; });
    return visible;
  };
  const toolbar = selector => main.querySelector(selector)?.closest('.p6-panel-head')?.querySelector('.p6-filters');
  const appendSort = (filterRoot, type) => {
    if (!filterRoot) return;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'p6-btn'; button.dataset.anSort = type; button.innerHTML = `${icon('arrow-up-down')}Sort`;
    filterRoot.appendChild(button); window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  };

  if (page === 'usage-analytics') {
    const root = toolbar('#p6-usage-search');
    appendSort(root, 'usage');
    if (root) {
      const save = document.createElement('button'); save.type='button'; save.className='p6-btn'; save.dataset.anSaveView='usage'; save.innerHTML=`${icon('bookmark-plus')}Save view`; root.appendChild(save);
      const stored = (()=>{try{return JSON.parse(localStorage.getItem('orvexa-usage-saved-view-v1'))}catch(_){return null}})();
      const search = main.querySelector('#p6-usage-search');
      if (stored?.search && search) { search.value=stored.search; search.dispatchEvent(new Event('input',{bubbles:true})); }
      if (stored?.dimension) { const dimension = main.querySelector(`[data-p6-dimension="${stored.dimension}"]`); dimension?.click(); }
    }
  }
  if (page === 'end-user-usage') {
    const userToolbar = toolbar('#p6-user-search');
    appendSort(userToolbar, 'users');
    const userSearch = main.querySelector('#p6-user-search');
    const userRisk = main.querySelector('#p6-user-risk');
    const userApp = main.querySelector('#p6-user-app');
    const applyUserInlineFilters = () => {
      const query = userSearch?.value.trim().toLowerCase() || '';
      const risk = userRisk?.value.toLowerCase() || '';
      const app = userApp?.value.toLowerCase() || '';
      const visible = applyRows('[data-p6-user-search]', row => {
        const haystack = row.dataset.p6UserSearch || '';
        return (!query || haystack.includes(query)) && (!risk || haystack.includes(risk)) && (!app || haystack.includes(app));
      });
      const empty = main.querySelector('#p6-user-empty'); if (empty) empty.hidden = visible > 0;
    };
    userSearch?.addEventListener('input', applyUserInlineFilters);
    userRisk?.addEventListener('change', applyUserInlineFilters);
    userApp?.addEventListener('change', applyUserInlineFilters);
    const featurePanel = [...main.querySelectorAll('.p6-panel')].find(panel => panel.textContent.includes('Feature adoption'));
    if (featurePanel) {
      const scatter = document.createElement('section'); scatter.className = 'p6-panel p6-section p6-chart-panel';
      scatter.innerHTML = `<header class="p6-panel-head"><div><h2>Adoption vs quality</h2><p>Compare feature reach with production quality to spot scale opportunities and quality risk.</p></div><span class="p6-status info">Feature lens</span></header><div class="p6-chart" id="p6-feature-scatter"></div><div class="p6-panel-body"><p class="p6-chart-note">${icon('info')} Bubble size represents active feature users; higher and further right is stronger adoption with better quality.</p></div>`;
      featurePanel.insertAdjacentElement('afterend', scatter);
    }
  }


  if (page === 'rate-limits-quotas') {
    const windowSelect = main.querySelector('#p6-intervention-window');
    const applyInterventionWindow = () => {
      const hours = Number(windowSelect?.value || 24);
      const visible = applyRows('[data-quota-event-age]', row => Number(row.dataset.quotaEventAge || 24) <= hours);
      const note = main.querySelector('#p6-intervention-count');
      if (note) note.textContent = `${visible} events shown · ${hours === 24 ? 'last 24h' : hours === 168 ? 'last 7 days' : 'last 30 days'} production evidence`;
    };
    windowSelect?.addEventListener('change', applyInterventionWindow);
    applyInterventionWindow();
  }

  const exportUsage = () => download('orvexa-usage-analytics.csv', [['Application','Application ID','Requests','Tokens','Users','Agent runs','Provider','Model','Feature','Environment','Region'], ...data.usage.map(item => [item.application,item.appId,item.requests,item.tokens,item.users,item.agentRuns,item.provider,item.model,item.feature,item.environment,item.region])]);
  const exportUsers = () => {
    const visibleIds = new Set([...main.querySelectorAll('[data-p6-user-search]')].filter(row => !row.hidden).map(row => row.dataset.p6Record));
    const rows = data.users.filter(item => visibleIds.has(item.id));
    download('orvexa-user-feature-usage.csv', [['External user','Application','Sessions','Requests','Tokens','Cost','Feedback','Last active','Risk','Top features','Quality'], ...rows.map(item => [item.id,item.application,item.sessions,item.requests,item.tokens,item.cost,item.feedback,item.lastActive,item.risk,item.topFeatures,item.quality])]);
    toast(`Exported ${rows.length} demo user row${rows.length === 1 ? '' : 's'}`, 'download');
  };
  const exportCosts = () => download('orvexa-managed-cost-allocation.csv', [['Application','Application ID','Model','Provider','Team','Spend','Forecast','Spend change','Budget state'], ...data.usage.map((item,index) => [item.application,item.appId,item.model,item.provider,data.budgets[index].team,item.cost,data.budgets[index].forecast,item.growth,data.budgets[index].state])]);

  const openUsageFilters = trigger => openModal({
    title: 'Usage dimensions', copy: 'Filter the application ledger without changing the underlying production evidence.', trigger,
    body: `<div class="p6-form-grid"><div class="p6-field"><label>Provider</label><select id="an-provider"><option value="">All providers</option>${[...new Set(data.usage.map(x=>x.provider))].map(x=>`<option>${x}</option>`).join('')}</select></div><div class="p6-field"><label>Environment</label><select id="an-env"><option value="">All environments</option>${[...new Set(data.usage.map(x=>x.environment))].map(x=>`<option>${x}</option>`).join('')}</select></div><div class="p6-field full"><label>Feature</label><select id="an-feature"><option value="">All features</option>${[...new Set(data.usage.map(x=>x.feature))].map(x=>`<option>${x}</option>`).join('')}</select></div></div>`,
    onSubmit: (root, done) => {
      const provider = root.querySelector('#an-provider').value, env = root.querySelector('#an-env').value, feature = root.querySelector('#an-feature').value;
      const visible = applyRows('[data-p6-usage-search]', row => (!provider || row.dataset.p6UsageSearch.includes(provider.toLowerCase())) && (!env || row.dataset.p6UsageSearch.includes(env.toLowerCase())) && (!feature || row.dataset.p6UsageSearch.includes(feature.toLowerCase())));
      done(); toast(`${visible} usage records match filters`, 'filter');
    }
  });
  const openUserFilters = trigger => openModal({
    title: 'User & feature filters', copy: 'Focus the privacy-safe external-user ledger by application and review state.', trigger,
    body: `<div class="p6-form-grid"><div class="p6-field"><label>Application</label><select id="an-user-app"><option value="">All applications</option>${[...new Set(data.users.map(x=>x.application))].map(x=>`<option>${x}</option>`).join('')}</select></div><div class="p6-field"><label>Risk state</label><select id="an-risk"><option value="">All risk states</option>${[...new Set(data.users.map(x=>x.risk))].map(x=>`<option>${x}</option>`).join('')}</select></div></div>`,
    onSubmit: (root, done) => {
      const app = root.querySelector('#an-user-app').value, risk = root.querySelector('#an-risk').value;
      const visible = applyRows('[data-p6-user-search]', row => (!app || row.dataset.p6UserSearch.includes(app.toLowerCase())) && (!risk || row.dataset.p6UserSearch.includes(risk.toLowerCase())));
      done(); toast(`${visible} external users match filters`, 'filter');
    }
  });

  const sortRows = type => {
    const table = type === 'usage' ? main.querySelector('#p6-usage-table') : main.querySelector('.p6-table.users');
    if (!table) return;
    const rows = [...table.querySelectorAll('.p6-row')];
    const numeric = value => Number(String(value).replace(/[^0-9.]/g,'')) || 0;
    if (type === 'usage') rows.sort((a,b) => numeric(b.children[1]?.textContent) - numeric(a.children[1]?.textContent));
    else rows.sort((a,b) => numeric(b.children[3]?.textContent) - numeric(a.children[3]?.textContent));
    rows.forEach(row => table.appendChild(row)); toast(type === 'usage' ? 'Sorted by request volume' : 'Sorted by user request volume', 'arrow-up-down');
  };

  const budgetDrawerBackdrop = document.createElement('div');
  budgetDrawerBackdrop.className = 'p6-action-drawer-backdrop';
  const budgetDrawer = document.createElement('aside');
  budgetDrawer.className = 'p6-action-drawer';
  budgetDrawer.setAttribute('role', 'dialog');
  budgetDrawer.setAttribute('aria-modal', 'true');
  budgetDrawer.setAttribute('aria-hidden', 'true');
  budgetDrawer.setAttribute('aria-label', 'Application budget editor');
  document.body.append(budgetDrawerBackdrop, budgetDrawer);
  let budgetReturnFocus = null;
  const closeBudgetDrawer = () => { budgetDrawer.classList.remove('open'); budgetDrawerBackdrop.classList.remove('open'); budgetDrawer.setAttribute('aria-hidden','true'); document.body.style.overflow=''; budgetReturnFocus?.focus?.(); };
  const budgetFormPayload = () => ({ id: budgetDrawer.querySelector('#an-budget-scope')?.value, monthlyBudget: budgetDrawer.querySelector('#an-budget-monthly')?.value.trim(), threshold: budgetDrawer.querySelector('#an-budget-threshold')?.value.trim(), hardLimit: budgetDrawer.querySelector('#an-budget-hard')?.value.trim(), channels: budgetDrawer.querySelector('#an-budget-channels')?.value.trim(), owner: budgetDrawer.querySelector('#an-budget-owner')?.value.trim(), forecastPolicy: budgetDrawer.querySelector('#an-budget-forecast')?.value });
  const renderBudgetDrawer = id => {
    const item = data.budgets.find(x => x.id === id) || data.budgets[0];
    budgetDrawer.innerHTML = `<header class="p6-action-drawer-head"><div><small>Application budget</small><h2>Manage budget control</h2><p>Update the bundled demo policy without exposing or changing provider billing credentials.</p></div><button class="p6-btn" type="button" aria-label="Close budget manager" data-budget-close>${icon('x')}</button></header><div class="p6-action-drawer-body"><div class="p6-field"><label>Application</label><select id="an-budget-scope">${data.budgets.map(x=>`<option value="${x.id}" ${x.id===item.id?'selected':''}>${x.scope}</option>`).join('')}</select></div><div class="p6-form-grid"><div class="p6-field"><label>Monthly budget</label><input id="an-budget-monthly" value="${item.budget}"></div><div class="p6-field"><label>Alert threshold</label><input id="an-budget-threshold" value="${item.threshold}"></div><div class="p6-field"><label>Hard limit</label><input id="an-budget-hard" value="${item.hardLimit}"></div><div class="p6-field"><label>Alert channels</label><input id="an-budget-channels" value="${item.alert}"></div><div class="p6-field full"><label>Owner</label><input id="an-budget-owner" value="${item.owner}"></div><div class="p6-field full"><label>Forecast policy</label><select id="an-budget-forecast"><option ${item.forecastPolicy==='30D trend + scheduled demand'?'selected':''}>30D trend + scheduled demand</option><option ${item.forecastPolicy==='30D trend + voice demand'?'selected':''}>30D trend + voice demand</option><option ${item.forecastPolicy==='30D trend + document queue'?'selected':''}>30D trend + document queue</option><option ${item.forecastPolicy==='30D trend + media job forecast'?'selected':''}>30D trend + media job forecast</option><option>Trailing 14D + 10% safety buffer</option></select></div></div><div class="p6-budget-state"><b>Current evidence:</b> ${item.actual} spend · ${item.forecast} forecast · ${item.state}.${item.hardLimitContext ? `<br><small>${item.hardLimitContext}</small>` : ''}</div></div><footer class="p6-action-drawer-foot"><button class="p6-btn" type="button" data-budget-draft>${icon('save')}Save draft</button><button class="p6-btn primary" type="button" data-budget-apply>${icon('check')}Apply budget</button></footer>`;
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  };
  const openBudgetManager = trigger => { budgetReturnFocus=trigger; renderBudgetDrawer(data.budgets[0].id); budgetDrawer.classList.add('open'); budgetDrawerBackdrop.classList.add('open'); budgetDrawer.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; requestAnimationFrame(()=>budgetDrawer.querySelector('select,input,button')?.focus()); };
  budgetDrawer.addEventListener('change', event => { if (event.target.matches('#an-budget-scope')) renderBudgetDrawer(event.target.value); });
  budgetDrawer.addEventListener('click', event => {
    if (event.target.closest('[data-budget-close]')) { closeBudgetDrawer(); return; }
    const draft = event.target.closest('[data-budget-draft]');
    const apply = event.target.closest('[data-budget-apply]');
    if (!draft && !apply) return;
    const payload = budgetFormPayload();
    if (!payload.monthlyBudget || !payload.threshold || !payload.owner) { toast('Budget, threshold, and owner are required','triangle-alert'); return; }
    localStorage.setItem(`orvexa-budget-${draft ? 'draft' : 'control'}-${payload.id}`, JSON.stringify({ ...payload, at:new Date().toISOString() }));
    if (apply) closeBudgetDrawer();
    toast(draft ? `Budget draft saved for ${payload.id}` : `Budget applied for ${payload.id}`, draft ? 'save' : 'wallet-cards');
  });
  budgetDrawerBackdrop.addEventListener('click', closeBudgetDrawer);
  document.addEventListener('keydown', event => { if (event.key==='Escape' && budgetDrawer.classList.contains('open')) closeBudgetDrawer(); });

  const quotaDrawerBackdrop = document.createElement('div');
  quotaDrawerBackdrop.className = 'p6-action-drawer-backdrop';
  const quotaDrawer = document.createElement('aside');
  quotaDrawer.className = 'p6-action-drawer p6-quota-action-drawer';
  quotaDrawer.setAttribute('role','dialog'); quotaDrawer.setAttribute('aria-modal','true'); quotaDrawer.setAttribute('aria-hidden','true'); quotaDrawer.setAttribute('aria-label','Create operational limit');
  document.body.append(quotaDrawerBackdrop, quotaDrawer);
  let quotaReturnFocus = null;
  const closeQuotaDrawer = () => { quotaDrawer.classList.remove('open'); quotaDrawerBackdrop.classList.remove('open'); quotaDrawer.setAttribute('aria-hidden','true'); document.body.style.overflow=''; quotaReturnFocus?.focus?.(); };
  const quotaPayload = () => ({
    scopeType:quotaDrawer.querySelector('#an-limit-scope-type')?.value, scope:quotaDrawer.querySelector('#an-limit-scope')?.value.trim(), metric:quotaDrawer.querySelector('#an-limit-metric')?.value,
    limit:quotaDrawer.querySelector('#an-limit-value')?.value.trim(), reset:quotaDrawer.querySelector('#an-limit-reset')?.value, warn:quotaDrawer.querySelector('#an-limit-warn')?.value.trim(), throttle:quotaDrawer.querySelector('#an-limit-throttle')?.value.trim(), hardStop:quotaDrawer.querySelector('#an-limit-hard')?.value.trim(),
    burst:quotaDrawer.querySelector('#an-limit-burst')?.value, priority:quotaDrawer.querySelector('#an-limit-priority')?.value, owner:quotaDrawer.querySelector('#an-limit-owner')?.value.trim(), reason:quotaDrawer.querySelector('#an-limit-reason')?.value.trim(), review:quotaDrawer.querySelector('#an-limit-review')?.value
  });
  const renderQuotaDrawer = () => { quotaDrawer.innerHTML = `<header class="p6-action-drawer-head"><div><small>Operational capacity policy</small><h2>Create operational limit</h2><p>Define a runtime boundary independently from customer plan or billing allowances.</p></div><button class="p6-btn" type="button" aria-label="Close limit editor" data-quota-close>${icon('x')}</button></header><div class="p6-action-drawer-body"><div class="p6-form-grid"><div class="p6-field"><label>Scope type</label><select id="an-limit-scope-type"><option>Tenant</option><option>Application</option><option>Feature</option><option>Provider</option></select></div><div class="p6-field"><label>Scope</label><input id="an-limit-scope" value="TEN-001"></div><div class="p6-field"><label>Metric</label><select id="an-limit-metric"><option>RPM</option><option>TPM</option><option>Requests</option><option>Agent runs</option><option>Jobs</option><option>Minutes</option><option>Concurrency</option></select></div><div class="p6-field"><label>Limit</label><input id="an-limit-value" value="8,000"></div><div class="p6-field full"><label>Reset</label><select id="an-limit-reset"><option>Rolling minute</option><option>Hourly</option><option>Daily</option><option>Monthly</option></select></div><div class="p6-field"><label>Warn threshold</label><input id="an-limit-warn" value="75%"></div><div class="p6-field"><label>Throttle threshold</label><input id="an-limit-throttle" value="90%"></div><div class="p6-field full"><label>Hard stop</label><input id="an-limit-hard" value="100%"></div><div class="p6-field"><label>Burst</label><select id="an-limit-burst"><option>Disabled</option><option>Allowed</option></select></div><div class="p6-field"><label>Priority</label><select id="an-limit-priority"><option>Protect</option><option>Route</option><option>Defer</option></select></div><div class="p6-field full"><label>Owner</label><input id="an-limit-owner" value="Platform Operations"></div><div class="p6-field full"><label>Reason</label><textarea id="an-limit-reason">Protect production capacity and preserve the highest-impact user journeys.</textarea></div><div class="p6-field full"><label>Review</label><select id="an-limit-review"><option>Required before production</option><option>Not required for draft</option></select></div></div><div class="p6-limit-preview"><div><small>Warn</small><b>75%</b></div><div><small>Throttle</small><b>90%</b></div><div><small>Hard stop</small><b>100%</b></div></div></div><footer class="p6-action-drawer-foot"><button class="p6-btn" type="button" data-quota-draft>${icon('save')}Save draft</button><button class="p6-btn primary" type="button" data-quota-create>${icon('plus')}Create limit</button></footer>`; window.lucide?.createIcons?.({attrs:{'stroke-width':1.8}}); };
  const openNewLimit = trigger => { quotaReturnFocus=trigger; renderQuotaDrawer(); quotaDrawer.classList.add('open'); quotaDrawerBackdrop.classList.add('open'); quotaDrawer.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; requestAnimationFrame(()=>quotaDrawer.querySelector('select,input,button')?.focus()); };
  quotaDrawer.addEventListener('click', event => {
    if (event.target.closest('[data-quota-close]')) { closeQuotaDrawer(); return; }
    const draft=event.target.closest('[data-quota-draft]'); const create=event.target.closest('[data-quota-create]'); if(!draft && !create) return;
    const payload=quotaPayload(); if(!payload.scope || !payload.limit || !payload.owner || !payload.reason){toast('Scope, limit, owner, and reason are required','triangle-alert');return;}
    localStorage.setItem(`orvexa-quota-${draft?'draft':'limit'}-${Date.now()}`,JSON.stringify({...payload,at:new Date().toISOString()}));
    if(create){ const grid=main.querySelector('.p6-quota-grid'); if(grid){const item=document.createElement('button');item.type='button';item.className='p6-quota tone-mint';item.innerHTML=`<span class="p6-quota-ring" style="--util:0;--threshold:75;--ring-color:var(--mint-text)"><b>0%</b></span><span><h3>${payload.metric}</h3><small>${payload.scope} · ${payload.reset}</small><span class="p6-quota-values"><span>Current<b>0</b></span><span>Limit<b>${payload.limit}</b></span></span><small class="p6-quota-threshold-copy">Warn ${payload.warn} · throttle ${payload.throttle}</small><small>${payload.priority} · ${payload.burst} burst</small></span>`;grid.appendChild(item);} closeQuotaDrawer(); }
    toast(draft?'Operational limit draft saved':`${payload.metric} limit created for ${payload.scope}`,draft?'save':'gauge');
  });
  quotaDrawerBackdrop.addEventListener('click',closeQuotaDrawer);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&quotaDrawer.classList.contains('open'))closeQuotaDrawer();});
  const openQuotaPolicies = trigger => openModal({
    title: 'Quota policy editor', copy: 'Set the default overflow behavior used when utilization approaches a governed boundary.', trigger,
    body: `<div class="p6-form-grid"><div class="p6-field full"><label>Interactive traffic</label><select id="an-policy-interactive"><option>Queue briefly, then approved fallback</option><option>Throttle</option><option>Hard stop</option></select></div><div class="p6-field full"><label>Batch traffic</label><select id="an-policy-batch"><option>Defer until capacity recovers</option><option>Route to secondary provider</option><option>Hard stop</option></select></div><div class="p6-field full"><label>Alert threshold</label><input id="an-policy-alert" value="80%"></div></div><div class="p6-limit-preview"><div><small>Voice</small><b>Protected</b></div><div><small>Interactive</small><b>Fallback</b></div><div><small>Batch</small><b>Deferred</b></div></div>`,
    submitLabel:'Save policy', onSubmit:(root,done)=>{ localStorage.setItem('orvexa-quota-policy-v1',JSON.stringify({interactive:root.querySelector('#an-policy-interactive').value,batch:root.querySelector('#an-policy-batch').value,alert:root.querySelector('#an-policy-alert').value})); done(); toast('Quota policy saved', 'shield-check'); }
  });

  main.addEventListener('click', event => {
    const action = event.target.closest('[data-p6-action]');
    if (action) {
      const name = action.dataset.p6Action;
      const handled = {
        'Period selector': () => openPeriod(action),
        'Export usage': () => page === 'end-user-usage' ? exportUsers() : exportUsage(),
        'Usage dimensions': () => openUsageFilters(action),
        'User risk filters': () => openUserFilters(action),
        'Manage budgets': () => openBudgetManager(action),
        'Export cost allocation': exportCosts,
        'New limit': () => openNewLimit(action),
        'Quota policies': () => openQuotaPolicies(action),
      }[name];
      if (handled) { event.preventDefault(); event.stopImmediatePropagation(); handled(); return; }
    }
    const sort = event.target.closest('[data-an-sort]'); if (sort) { event.preventDefault(); event.stopImmediatePropagation(); sortRows(sort.dataset.anSort); return; }
    const saveView = event.target.closest('[data-an-save-view]'); if (saveView) { event.preventDefault(); event.stopImmediatePropagation(); const search=main.querySelector('#p6-usage-search')?.value||''; localStorage.setItem('orvexa-usage-saved-view-v1',JSON.stringify({search,dimension:main.querySelector('[data-p6-dimension].active')?.dataset.p6Dimension || 'Application',period:'30',compare:periodState.compare,savedAt:new Date().toISOString()})); toast('Usage analytics view saved','bookmark-check'); }
  }, true);

  const renderScatter = () => {
    const target = document.querySelector('#p6-feature-scatter'); if (!target || !window.ApexCharts) return null;
    const dark = document.documentElement.classList.contains('dark');
    const series = data.features.map(feature => ({ name: feature.name, data: [{ x: Number(feature.adoption.replace('%','')), y: Number(feature.quality.replace('%','')), z: Number(feature.activeUsers.replace('K','')) }] }));
    const chart = new ApexCharts(target, { chart:{type:'bubble',height:315,toolbar:{show:false},background:'transparent',foreColor:dark?'#a8b2bd':'#68727e',fontFamily:'Manrope, sans-serif'},series,colors:['#e6a515','#9a86d8','#7aa2d6','#62afa8','#d18473'],dataLabels:{enabled:false},fill:{opacity:.72},grid:{borderColor:dark?'rgba(255,255,255,.08)':'rgba(20,27,34,.1)',strokeDashArray:4},annotations:{xaxis:[{x:50,borderColor:dark?'rgba(230,165,21,.58)':'rgba(166,113,0,.52)',strokeDashArray:5,label:{text:'Adoption target · 50%',orientation:'horizontal',style:{fontSize:'12px',fontWeight:700}}}],yaxis:[{y:96,borderColor:dark?'rgba(98,175,168,.62)':'rgba(42,132,125,.54)',strokeDashArray:5,label:{text:'Quality gate · 96%',style:{fontSize:'12px',fontWeight:700}}}]},xaxis:{min:10,max:85,tickAmount:5,title:{text:'Adoption %'}},yaxis:{min:90,max:100,tickAmount:5,title:{text:'Quality %'}},legend:{position:'top',horizontalAlign:'left',labels:{colors:dark?'#a8b2bd':'#68727e'}},tooltip:{theme:dark?'dark':'light',custom:({seriesIndex})=>{const f=data.features[seriesIndex];return `<div style="padding:10px 12px"><b>${f.name}</b><div style="margin-top:5px;font-size:12px">Adoption ${f.adoption} · Quality ${f.quality}<br>${f.activeUsers} active of ${f.eligibleUsers} eligible · ${f.application}</div></div>`;}} });
    chart.render(); return chart;
  };
  const scatterChart = renderScatter();
  if (scatterChart) {
    main.querySelectorAll('[data-p6-feature-index]').forEach(card => {
      const feature = data.features[Number(card.dataset.p6FeatureIndex)];
      card.addEventListener('pointerenter', () => scatterChart.highlightSeries?.(feature.name));
      card.addEventListener('pointerleave', () => scatterChart.resetSeries?.());
      card.addEventListener('focus', () => scatterChart.highlightSeries?.(feature.name));
      card.addEventListener('blur', () => scatterChart.resetSeries?.());
    });
  }
  document.addEventListener('orvexa:themechange', () => {
    const dark=document.documentElement.classList.contains('dark');
    scatterChart?.updateOptions({chart:{foreColor:dark?'#a8b2bd':'#68727e'},grid:{borderColor:dark?'rgba(255,255,255,.08)':'rgba(20,27,34,.1)'},annotations:{xaxis:[{x:50,borderColor:dark?'rgba(230,165,21,.58)':'rgba(166,113,0,.52)',strokeDashArray:5,label:{text:'Adoption target · 50%',orientation:'horizontal',style:{fontSize:'12px',fontWeight:700}}}],yaxis:[{y:96,borderColor:dark?'rgba(98,175,168,.62)':'rgba(42,132,125,.54)',strokeDashArray:5,label:{text:'Quality gate · 96%',style:{fontSize:'12px',fontWeight:700}}}]},legend:{labels:{colors:dark?'#a8b2bd':'#68727e'}},tooltip:{theme:dark?'dark':'light'}});
  });

  window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
})();
