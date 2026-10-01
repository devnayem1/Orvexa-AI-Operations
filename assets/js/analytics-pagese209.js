(() => {
  'use strict';

  const product = window.Orvexa?.product;
  const data = product?.analytics;
  const page = document.body.dataset.analyticsPage || document.body.dataset.activePage;
  const main = document.querySelector('main');
  if (!product || !data || !main) return;

  const icon = name => `<i data-lucide="${name}"></i>`;
  const tone = (value = '') => /healthy|on track|normal|complete|resolved|stable|growing|enforced|covered/i.test(value) ? 'good' : /watch|review|investigating|at risk|approached|watching/i.test(value) ? 'warn' : /critical|blocked|abuse|hard limit|failed/i.test(value) ? 'bad' : /live|now/i.test(value) ? 'live' : 'info';
  const status = (label, custom) => `<span class="p6-status ${custom || tone(label)}">${label}</span>`;
  const button = (label, glyph = 'sliders-horizontal', primary = false, attrs = '') => `<button class="p6-btn ${primary ? 'primary' : ''}" type="button" ${attrs}>${icon(glyph)}${label}</button>`;
  const panelHead = (title, copy, extra = '') => `<header class="p6-panel-head"><div><h2>${title}</h2><p>${copy}</p></div>${extra}</header>`;
  const head = (title, copy, action, glyph = 'download') => `<section class="p6-head"><div class="p6-title"><h1>${title}</h1></div><div class="p6-context"><button class="p6-select" type="button" data-p6-action="Workspace selector">${icon('building-2')}Nova Intelligence${icon('chevron-down')}</button><button class="p6-select" type="button" data-p6-action="Period selector">${icon('calendar-range')}Last 30 days${icon('chevron-down')}</button>${action ? button(action, glyph, true, `data-p6-action="${action}"`) : ''}</div></section>`;
  const quotaHead = () => `<section class="p6-head"><div class="p6-title"><h1>Rate Limits &amp; Quotas</h1></div><div class="p6-context"><button class="p6-select" type="button" data-p6-action="Workspace selector">${icon('building-2')}Nova Intelligence${icon('chevron-down')}</button><span class="p6-select p6-current-context">${icon('activity')}Production</span>${button('New limit', 'plus', true, 'data-p6-action="New limit"')}</div></section>`;
  const metrics = items => `<section class="p6-metrics ${items.length === 5 ? 'five' : ''}">${items.map(item => `<article class="p6-metric"><span class="p6-metric-icon">${icon(item[3] || 'activity')}</span><small>${item[0]}</small><strong>${item[1]}</strong><em class="${item[4] || ''}">${item[2]}</em></article>`).join('')}</section>`;

  const dimensions = [
    ['Application', 'Connected product surface', 'panels-top-left'], ['Model', 'Runtime model family', 'cpu'], ['Provider', 'Inference provider', 'server'],
    ['Feature', 'Runtime capability', 'sparkles'], ['Environment', 'Production or non-production', 'layers-3'], ['Region', 'Processing boundary', 'globe-2'],
  ];
  const appTone = label => ({'Support AI':'support','AI Contact Center':'contact','Document Intelligence':'document','Growth Assistant':'growth'}[label] || 'neutral');
  const dimensionMix = {
    Application: data.usage.map(item => [item.application, `${item.requests} · ${item.requestShare}`, Number(item.requestShare.replace('%','')), appTone(item.application)]),
    Model: [['Astra Reasoner X', '21.24M · 53.6%', 53.6, 'support'], ['Orbit Pro X', '12.84M · 32.4%', 32.4, 'contact'], ['Meridian Core X', '5.52M · 13.9%', 13.9, 'document']],
    Provider: [['Astra AI', '21.24M · 53.6%', 53.6, 'support'], ['Orbit AI', '12.84M · 32.4%', 32.4, 'contact'], ['Meridian AI', '5.52M · 13.9%', 13.9, 'document']],
    Feature: [['Answer generation', '18.36M · 46.4%', 46.4, 'support'], ['Voice assistance', '12.84M · 32.4%', 32.4, 'contact'], ['RAG extraction', '5.52M · 13.9%', 13.9, 'document'], ['Media generation', '2.88M · 7.3%', 7.3, 'growth']],
    Environment: [['Production', '37.22M · 94.0%', 94, 'support'], ['Staging', '1.58M · 4.0%', 4, 'contact'], ['Development', '0.80M · 2.0%', 2, 'document']],
    Region: [['US / EU', '23.88M · 60.3%', 60.3, 'document'], ['Global', '12.84M · 32.4%', 32.4, 'contact'], ['US', '2.88M · 7.3%', 7.3, 'growth']],
  };
  const mixRows = dimension => dimensionMix[dimension].map(item => `<div class="p6-mix tone-${item[3] || 'neutral'}"><span><b>${item[0]}</b><small>${dimension} attribution</small></span><span class="p6-inline-meter" style="--value:${item[2]}%"><i></i></span><strong>${item[1]}</strong></div>`).join('');
  const usageRows = () => data.usage.map(item => `<button class="p6-row tone-${item.appTone || appTone(item.application)}" type="button" data-p6-inspect data-p6-kind="Application usage" data-p6-record="${item.appId}" data-p6-title="${item.application}" data-p6-usage-search="${`${item.appId} ${item.application} ${item.model} ${item.provider} ${item.feature} ${item.environment} ${item.region}`.toLowerCase()}"><span><b>${item.application}</b><small class="p6-mono">${item.appId}</small></span><span>${item.requests}</span><span>${item.tokens}</span><span>${item.users}</span><span>${item.agentRuns}</span><span><b>${item.provider}</b><small>${item.model}</small></span><span><b>${item.feature}</b><small>${item.environment} · ${item.region}</small></span></button>`).join('');
  const usagePage = () => `${head('Usage Analytics', 'Analyze 30-day AI consumption by application, model, provider, runtime capability, environment, and region.', 'Export usage')}${metrics([
    ['Requests', data.usageWindow?.requests || '39.6M', '+9.8% vs prior 30D', 'activity'], ['Processed tokens', data.usageWindow?.tokens || '84.2B', '+7.4% vs prior 30D', 'binary'], ['Referenced users', data.usageWindow?.referencedUsers || '38.4K', 'External IDs only', 'users-round'], ['Agent runs', data.usageWindow?.agentRuns || '25.0K', '+11.2% vs prior period', 'bot'],
  ])}<section class="p6-grid two"><article class="p6-panel">${panelHead('Consumption index', '7-day movement normalized to Aug 21 = 100.', status('30D context', 'live'))}<div class="p6-chart" id="p6-usage-chart"></div></article><aside class="p6-panel">${panelHead('Attribution dimensions', 'Switch the operating lens without losing the same underlying request evidence.')}<div class="p6-dimensions">${dimensions.map((item, index) => `<button class="p6-dimension ${index === 0 ? 'active' : ''}" type="button" title="Attribute usage by ${item[0].toLowerCase()} while preserving the same request lineage" data-p6-dimension="${item[0]}"><i>${icon(item[2])}</i><span><b>${item[0]}</b><small>${item[1]}</small></span></button>`).join('')}</div></aside></section><section class="p6-grid equal p6-section"><article class="p6-panel">${panelHead('Consumption mix', 'Ranked request contribution for the selected attribution dimension.', status('Application', 'info'))}<div class="p6-mix-list" id="p6-mix-list">${mixRows('Application')}</div></article><aside class="p6-panel">${panelHead('Usage data contract', 'The analytics layer attributes consumption without copying buyer identity records.')}<div class="p6-policy-list"><div class="p6-policy"><i>${icon('fingerprint')}</i><span><b>External identity reference</b><small>Only external_user_id links usage to a buyer-managed identity.</small></span><strong>Reference only</strong></div><div class="p6-policy"><i>${icon('git-branch')}</i><span><b>Request lineage</b><small>Every aggregate resolves to application, route, trace, and environment.</small></span><strong>Traceable</strong></div><div class="p6-policy"><i>${icon('shield-check')}</i><span><b>Processing boundary</b><small>Region filters reflect approved runtime and data policies.</small></span><strong>Policy-bound</strong></div></div></aside></section><section class="p6-panel p6-section">${panelHead('Application usage ledger', '30-day operational consumption grouped by connected AI application and runtime dimension.', `<div class="p6-filters"><input class="p6-input" id="p6-usage-search" aria-label="Search usage" placeholder="Search application or provider"></div>`)}<div class="p6-table" id="p6-usage-table"><div class="p6-table-head"><span>Application</span><span>Requests</span><span>Processed tokens</span><span>Users</span><span>Agent runs</span><span>Provider / model</span><span>Feature / boundary</span></div>${usageRows()}</div><div class="p6-empty" id="p6-usage-empty" hidden><i>${icon('search-x')}</i><h3>No matching usage</h3><p>Try an application ID, model, provider, feature, environment, or region.</p></div></section>`;

  const costRows = () => data.usage.map((item, index) => {
    const budget = data.budgets[index];
    const share = [30, 46, 14, 10][index];
    return `<button class="p6-row tone-${item.appTone || appTone(item.application)}" type="button" data-p6-inspect data-p6-kind="Cost allocation" data-p6-record="${budget.id}" data-p6-title="${item.application}"><span><b>${item.application}</b><small class="p6-mono">${item.appId}</small></span><span>${item.model}</span><span>${item.provider}</span><span>${budget.team}</span><span><b>${item.cost}</b><small>${share}% share</small></span><span>${budget.forecast}</span><span>${item.growth}</span><span>${status(budget.state)}</span></button>`;
  }).join('');
  const budgetCards = () => data.budgets.map(item => `<button class="p6-budget tone-${appTone(item.scope)}" type="button" data-p6-inspect data-p6-kind="Budget control" data-p6-record="${item.id}" data-p6-title="${item.scope}"><div class="p6-budget-top"><span><h3>${item.scope}</h3><small class="p6-mono">${item.id} / ${item.owner}</small></span>${status(item.state)}</div><div class="p6-budget-data"><span><small>Threshold</small><b>${item.threshold}</b></span><span><small>Alert</small><b>${item.alert}</b></span><span><small>Hard limit</small><b>${item.hardLimit}</b></span></div>${item.hardLimitContext ? `<small class="p6-budget-note">${item.hardLimitContext}</small>` : ''}</button>`).join('');
  const providerFlowNodes = () => data.costScope.providers.map(item => `<div class="p6-flow-node"><div class="p6-flow-node-top"><span><small>${item.name}</small><b>${item.spend}</b></span><strong>${item.share}%</strong></div><span class="p6-flow-meter" style="--value:${item.share}%"><i></i></span><small>${item.detail}</small></div>`).join('');
  const applicationFlowNodes = () => data.usage.map((item, index) => { const share=[30,46,14,10][index]; const team=data.budgets[index].team; return `<div class="p6-flow-node tone-${item.appTone || appTone(item.application)}"><div class="p6-flow-node-top"><span><small>${item.application}</small><b>${item.cost}</b></span><strong>${share}%</strong></div><span class="p6-flow-meter" style="--value:${share}%"><i></i></span><small>${team}</small></div>`; }).join('');
  const allocationLinks = () => data.costScope.allocations.map(item => `<div class="p6-flow-link tone-${item.tone}" style="--thickness:${Math.min(8, 2 + item.share * .12).toFixed(1)}px"><span>${item.from}</span><i></i><strong>${item.amount}</strong><span>${item.to}</span></div>`).join('');
  const costPage = () => `${head('AI Cost &amp; Budgets', 'Operate internal AI FinOps across managed provider spend, optimization evidence, application allocation, forecasts, and budget controls.', 'Manage budgets', 'wallet-cards')}${metrics([
    ['Managed AI spend', '$10.64K', 'Across 4 budget-managed production applications', 'circle-dollar-sign'], ['Budget', '$12.00K', '88.7% utilized · $1.36K remaining', 'wallet-cards'], ['Forecast', '$11.58K', '$420 expected headroom', 'chart-spline'], ['Verified optimization savings', '$1.52K', 'Five accountable optimization levers', 'badge-dollar-sign'], ['Anomalies', '1', 'Growth route under review', 'triangle-alert', 'warn'],
  ])}<section class="p6-economics-banner"><span class="p6-economics-icon">${icon('split-square-horizontal')}</span><div><small>Economics boundary</small><b>This page tracks AI provider cost, optimization, and internal allocation.</b><p>Customer <a href="usage-credits.html">usage &amp; credits</a>, <a href="subscriptions-billing.html">subscriptions &amp; billing</a>, and revenue remain in Monetize.</p></div><a class="p6-btn" href="usage-credits.html">${icon('arrow-up-right')}Open Monetize</a></section><section class="p6-panel p6-section">${panelHead('AI spend flow', 'Managed provider cost passes through governed routing, verified optimization, and trace-level attribution before landing on four accountable applications.', `<div class="p6-status-stack">${status('$10.64K allocated', 'info')}${status('3 providers in current cost scope', 'live')}</div>`)}<div class="p6-cost-flow"><div class="p6-flow-stack"><div class="p6-flow-caption"><b>Provider cost</b><small>30D managed scope</small></div>${providerFlowNodes()}</div><div class="p6-flow-core"><div class="p6-flow-stages"><div class="p6-flow-stage accent"><i>${icon('route')}</i><span><small>AI Gateway</small><b>Quality + cost routing</b></span></div><div class="p6-flow-stage"><i>${icon('badge-dollar-sign')}</i><span><small>Optimization</small><b>$1.52K avoided</b></span></div><div class="p6-flow-stage"><i>${icon('git-branch')}</i><span><small>Attribution</small><b>Trace-level allocation</b></span></div></div><div class="p6-flow-links">${allocationLinks()}</div></div><div class="p6-flow-stack"><div class="p6-flow-caption"><b>Application allocation</b><small>Accountable teams</small></div>${applicationFlowNodes()}</div></div><div class="p6-cost-scope-note">${icon('info')}<span>${data.costScope.providerNote}</span></div></section><section class="p6-grid two p6-section"><article class="p6-panel">${panelHead('Spend versus budget pace', 'Recent 7-day daily spend within the selected 30-day budget window.', status('$420 30D headroom'))}<div class="p6-chart" id="p6-cost-chart"></div><div class="p6-chart-footnote">Approved budget pace = <b>$400/day</b> from $12,000 ÷ 30 days. Forecast is $11.58K for the selected 30D window.</div></article><aside class="p6-panel">${panelHead('Optimization evidence', 'Verified savings stay tied to a specific operating lever and accountable owner.')}<div class="p6-savings">${data.savings.map(item => `<button class="p6-saving" type="button" data-p6-inspect data-p6-kind="Savings evidence" data-p6-record="${item.id}" data-p6-title="${item.label}"><i>${icon(item.icon)}</i><span><b>${item.label}</b><small>${item.detail} / ${item.owner}</small></span><strong>${item.value}</strong></button>`).join('')}</div></aside></section><section class="p6-panel p6-section">${panelHead('Cost allocation', 'Managed spend reconciles to application, model, provider, and accountable team.', button('Export allocation', 'download', false, 'data-p6-action="Export cost allocation"'))}<div class="p6-table costs"><div class="p6-table-head"><span>Application</span><span>Model</span><span>Provider</span><span>Team</span><span>Spend</span><span>Forecast</span><span>Spend change</span><span>Status</span></div>${costRows()}</div></section><section class="p6-grid cost-controls p6-section"><article class="p6-panel">${panelHead('Budget controls', 'Threshold, alert channel, hard limit, and accountable owner.')}<div class="p6-budget-grid">${budgetCards()}</div></article><aside class="p6-panel">${panelHead('Cost anomaly', 'One route-level forecast regression is currently under investigation.', status('Investigating', 'warn'))}<div class="p6-panel-body"><div class="p6-anomaly"><i>${icon('triangle-alert')}</i><span><b>${data.anomalies[0].title}</b><small>${data.anomalies[0].impact} vs route baseline / ${data.anomalies[0].source} / ${data.anomalies[0].detected}</small></span>${button('Inspect', 'search', false, `data-p6-inspect data-p6-kind="Cost anomaly" data-p6-record="${data.anomalies[0].id}" data-p6-title="${data.anomalies[0].title}"`)}</div></div></aside></section>`;
  const featureCards = () => data.features.map((feature, index) => `<button class="p6-feature tone-${feature.tone}" type="button" data-p6-feature-index="${index}" data-p6-inspect data-p6-kind="Feature adoption" data-p6-record="${feature.id}" data-p6-title="${feature.name}"><i>${icon(['message-square-text','audio-lines','database','wrench','image'][index])}</i><b>${feature.name}</b><small>${feature.application}</small><strong>${feature.adoption} adoption</strong><div class="p6-feature-foot"><span>${feature.activeUsers} of ${feature.eligibleUsers} eligible</span>${status(feature.state)}</div></button>`).join('');
  const userRows = () => data.users.map(user => `<button class="p6-row tone-${appTone(user.application)}" type="button" data-p6-inspect data-p6-kind="External user usage" data-p6-record="${user.id}" data-p6-title="${user.id}" data-p6-user-search="${`${user.id} ${user.tenant} ${user.application} ${user.risk} ${user.topFeatures}`.toLowerCase()}"><span><b class="p6-mono">${user.id}</b><small>Buyer-provided reference</small></span><span>${user.application}</span><span>${user.sessions}</span><span>${user.requests}</span><span>${user.tokens}</span><span>${user.cost}</span><span>${user.feedback}</span><span>${user.lastActive}</span><span>${status(user.risk)}</span></button>`).join('');
  const usersPage = () => `${head('User &amp; Feature Usage', 'Understand adoption, engagement, quality and cost by privacy-safe external user reference and feature.', 'Export usage')}${metrics([
    ['Referenced users', '38.4K', 'Across four applications', 'users-round'], ['AI sessions', '184K', '4.79 sessions per user', 'messages-square'], ['User satisfaction', '92.6%', 'Among rated referenced-user sessions', 'thumbs-up'], ['Users flagged', '184', '0.48% of referenced users', 'user-search', 'warn'],
  ])}<section class="p6-panel"><div class="p6-privacy"><i>${icon('shield-check')}</i><span><b>Identity boundary</b><small>Orvexa stores external ID references only; the buyer remains the identity system of record.</small></span>${status('External IDs only')}</div></section><section class="p6-panel p6-section">${panelHead('Feature adoption', 'External-user adoption, active reach, and quality by buyer-facing AI capability.', status('5 capabilities', 'live'))}<div class="p6-feature-grid">${featureCards()}</div></section><section class="p6-panel p6-section">${panelHead('External user usage', '5 featured references shown · 38.4K referenced users across the reporting window.', `<div class="p6-filters p6-user-toolbar"><input class="p6-input" id="p6-user-search" aria-label="Search external users" placeholder="Search external user…"><select class="p6-filter-select" id="p6-user-risk" aria-label="Filter by risk"><option value="">All risk</option>${[...new Set(data.users.map(user => user.risk))].map(value => `<option value="${value}">${value}</option>`).join('')}</select><select class="p6-filter-select" id="p6-user-app" aria-label="Filter by application"><option value="">All applications</option>${[...new Set(data.users.map(user => user.application))].map(value => `<option value="${value}">${value}</option>`).join('')}</select></div>`)}<div class="p6-table users"><div class="p6-table-head"><span>External user</span><span>Application</span><span>Sessions</span><span>Requests</span><span>Tokens</span><span>Cost</span><span>Feedback</span><span>Last active</span><span>Risk</span></div>${userRows()}</div><div class="p6-empty" id="p6-user-empty" hidden><i>${icon('user-x')}</i><h3>No matching external users</h3><p>Try an external user ID, application, feature, or risk state.</p></div><div class="p6-demo-note">5 demo users shown. Export usage includes only the currently filtered bundled demo rows.</div></section>`;

  const quotaTone = utilization => utilization >= 100 ? 'danger' : utilization > 85 ? 'danger' : utilization >= 75 ? 'amber' : utilization >= 60 ? 'primary' : 'mint';
  const quotaCards = () => data.quotas.map(item => `<button class="p6-quota tone-${quotaTone(item.utilization)}" type="button" data-p6-inspect data-p6-kind="Quota policy" data-p6-record="${item.id}" data-p6-title="${item.name}"><span class="p6-quota-ring" style="--util:${item.utilization};--threshold:${item.threshold || 80};--ring-color:var(--${quotaTone(item.utilization)});"><b>${item.utilization}%</b></span><span><h3>${item.name}</h3><small>${item.scope} · ${item.reset}</small><span class="p6-quota-values"><span>Current<b>${item.current}</b></span><span>Limit<b>${item.limit}</b></span></span><small class="p6-quota-threshold-copy">${item.thresholdLabel || '80% alert'}</small><small>${item.policy}</small></span></button>`).join('');
  const eventRows = () => data.quotaEvents.map(item => `<button class="p6-row" type="button" data-p6-inspect data-p6-kind="Quota event" data-p6-record="${item.id}" data-p6-title="${item.event}" data-quota-event-age="${item.ageHours || 24}"><span><b>${item.time}</b><small>${item.timeNote || item.id}</small><small class="p6-mono">${item.id}</small></span><span class="p6-mono">${item.scope}</span><span><b>${item.event}</b><small>${item.value}</small></span><span>${item.action}</span><span>${item.result}</span><span>${item.value}</span><span>${status(item.state)}</span></button>`).join('');
  const quotaAuthority = () => `<section class="p6-panel p6-quota-authority"><div class="p6-authority-icon">${icon('scale')}</div><div><b>Quota authority</b><small>Runtime quotas govern operational capacity. Commercial allowances remain owned by <a href="plans-entitlements.html">Plans &amp; Entitlements</a> and <a href="usage-credits.html">Usage &amp; Credits</a>.</small></div><a class="p6-btn" href="plans-entitlements.html">Open entitlements${icon('arrow-up-right')}</a></section>`;
  const interventionFilter = `<select class="p6-filter-select p6-intervention-window" id="p6-intervention-window" aria-label="Capacity intervention history"><option value="24">Last 24h</option><option value="168">7d</option><option value="720">30d</option></select>`;
  const quotasPage = () => `${quotaHead()}${metrics([
    ['Tenant RPM', '47%', '2,842 of 6,000 RPM · rolling minute', 'gauge'], ['Tenant TPM', '74%', '74.2M of 100M tokens/min', 'binary'], ['Daily requests', '66%', '1.32M of 2.00M · resets 00:00 UTC', 'calendar-range'], ['Interventions', '4', 'No SLO breaches', 'shield-check'],
  ])}${quotaAuthority()}<section class="p6-panel p6-section">${panelHead('Quota registry', 'Current production use, approved limit, utilization, reset window, and protective policy.', button('Quota policies', 'settings-2', false, 'data-p6-action="Quota policies"'))}<div class="p6-quota-grid">${quotaCards()}</div></section><section class="p6-grid two p6-section"><article class="p6-panel">${panelHead('Capacity interventions', 'Recent throttles, rebalancing, quota raises, and provider-threshold actions.', interventionFilter)}<div class="p6-table events"><div class="p6-table-head"><span>Time</span><span>Scope</span><span>Event</span><span>Action</span><span>Result</span><span>Value</span><span>Status</span></div>${eventRows()}</div><div class="p6-demo-note" id="p6-intervention-count">4 events shown · current production evidence</div></article><aside class="p6-panel">${panelHead('Priority policy', 'Graceful degradation protects the highest-impact user journeys first.')}<div class="p6-policy-list"><div class="p6-policy tone-protect"><i>${icon('audio-lines')}</i><span><b>Realtime voice</b><small>Reserve warm capacity. Never defer an active conversation.</small></span><strong>PROTECT</strong></div><div class="p6-policy tone-route"><i>${icon('message-square')}</i><span><b>Interactive chat</b><small>Queue briefly, then use an approved fallback route.</small></span><strong>ROUTE</strong></div><div class="p6-policy tone-defer"><i>${icon('layers-3')}</i><span><b>Batch and media</b><small>Delay or schedule work when provider quota pressure rises.</small></span><strong>DEFER</strong></div><div class="p6-policy tone-audit"><i>${icon('file-check')}</i><span><b>Policy change</b><small>Log actor, old limit, new limit, reason, and effective time.</small></span><strong>AUDIT</strong></div></div></aside></section>`;

  const renderers = { 'usage-analytics': usagePage, 'cost-budgets': costPage, 'end-user-usage': usersPage, 'rate-limits-quotas': quotasPage };
  const render = renderers[page];
  if (!render) return;

  main.className = 'p6-page';
  main.innerHTML = render();

  const backdrop = document.createElement('div');
  backdrop.className = 'p6-drawer-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  const drawer = document.createElement('aside');
  drawer.className = 'p6-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-label', 'Analytics inspector');
  drawer.innerHTML = `<div class="p6-drawer-head"><div><small id="p6-drawer-kind">Analytics evidence</small><h2 id="p6-drawer-title">Inspector</h2></div><button class="p6-btn" type="button" aria-label="Close inspector" data-p6-close>${icon('x')}</button></div><div class="p6-drawer-body" id="p6-drawer-body"></div>`;
  document.body.append(backdrop, drawer);

  const records = [...data.usage, ...data.savings, ...data.budgets, ...data.anomalies, ...data.users, ...data.features, ...data.quotas, ...data.quotaEvents];
  let returnFocus = null;
  const findRecord = id => records.find(item => item.id === id || item.appId === id);
  const recordBody = (record, kind) => {
    if (!record) return `<div class="p6-inspector-hero"><b>Analytics evidence</b><p>This aggregate remains connected to its production lineage and accountable scope.</p></div>`;
    if (kind === 'Cost anomaly') return `<div class="p6-inspector-hero"><b>${record.title}</b><p>${record.impact} vs route baseline. The route remains under investigation; no customer billing value is inferred from this operator-cost anomaly.</p></div><div class="p6-inspector-facts"><div><small>Application</small><b>Growth Assistant</b></div><div><small>Route</small><b>${record.source}</b></div><div><small>Route baseline</small><b>${record.routeBaseline}</b></div><div><small>Route forecast</small><b>${record.routeForecast}</b></div><div><small>Cost delta</small><b>${record.costDelta}</b></div><div><small>Model / provider</small><b>${record.model} / ${record.provider}</b></div><div><small>Contributing traces</small><b>${record.contributingTraces}</b></div><div><small>Owner</small><b>${record.owner}</b></div></div><div class="p6-inspector-recommendation"><small>Recommendation</small><b>${record.recommendation}</b></div><div class="p6-actions">${button('Copy ID', 'copy', false, `data-p6-copy="${record.id}"`)}${button('Open traces', 'external-link', true, 'data-p6-link="traces.html"')}${button('Export record', 'download', false, 'data-p6-action="Export analytics record"')}</div>`;
    if (kind === 'Quota event') return `<div class="p6-inspector-hero"><b>${record.event}</b><p>${record.time} · ${record.timeNote || 'Production capacity evidence'}. This event records a governed capacity action rather than commercial plan consumption.</p></div><div class="p6-inspector-facts"><div><small>Event ID</small><b>${record.id}</b></div><div><small>Scope</small><b>${record.scope}</b></div><div><small>Capacity evidence</small><b>${record.value}</b></div><div><small>Action</small><b>${record.action}</b></div><div><small>Result</small><b>${record.result}</b></div><div><small>State</small><b>${record.state}</b></div></div><div class="p6-actions">${button('Copy ID', 'copy', false, `data-p6-copy="${record.id}"`)}${button('Open Reliability', 'activity', true, 'data-p6-link="reliability-capacity.html"')}${button('Open logs', 'scroll-text', false, 'data-p6-link="logs-errors.html"')}</div>`;
    const excluded = new Set(['title', 'name', 'application', 'detail', 'icon']);
    const facts = Object.entries(record).filter(([key]) => !excluded.has(key)).slice(0, 14);
    const summary = record.detail || record.title || record.application || `${kind} details and operating controls.`;
    return `<div class="p6-inspector-hero"><b>${record.title || record.name || record.application || kind}</b><p>${summary}</p></div><div class="p6-inspector-facts">${facts.map(([key, value]) => `<div><small>${key.replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase())}</small><b>${value}</b></div>`).join('')}</div><div class="p6-actions">${button('Copy ID', 'copy', false, `data-p6-copy="${record.id || record.appId}"`)}${button('Open traces', 'external-link', true, 'data-p6-link="traces.html"')}${button('Export record', 'download', false, 'data-p6-action="Export analytics record"')}</div>`;
  };
  const closeDrawer = () => { drawer.classList.remove('open'); backdrop.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; returnFocus?.focus?.(); };
  const openDrawer = trigger => {
    const record = findRecord(trigger.dataset.p6Record);
    returnFocus = trigger;
    drawer.querySelector('#p6-drawer-kind').textContent = trigger.dataset.p6Kind || 'Analytics evidence';
    drawer.querySelector('#p6-drawer-title').textContent = trigger.dataset.p6Title || record?.title || record?.name || record?.application || 'Inspector';
    drawer.querySelector('#p6-drawer-body').innerHTML = recordBody(record, trigger.dataset.p6Kind || 'Record');
    drawer.classList.add('open');
    backdrop.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    drawer.querySelector('[data-p6-close]').focus();
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  };
  const toast = (message, glyph = 'sparkles') => window.showToast?.(message, glyph);

  main.addEventListener('click', event => {
    const dimension = event.target.closest('[data-p6-dimension]');
    if (dimension) {
      main.querySelectorAll('[data-p6-dimension]').forEach(item => item.classList.toggle('active', item === dimension));
      main.querySelector('#p6-mix-list').innerHTML = mixRows(dimension.dataset.p6Dimension);
      const badge = main.querySelector('#p6-mix-list')?.closest('.p6-panel')?.querySelector('.p6-status');
      if (badge) badge.textContent = dimension.dataset.p6Dimension;
      return;
    }
    const inspect = event.target.closest('[data-p6-inspect]');
    if (inspect) { openDrawer(inspect); return; }
    const link = event.target.closest('[data-p6-link]');
    if (link) { window.location.href = `./${link.dataset.p6Link}`; return; }
    const action = event.target.closest('[data-p6-action]');
    if (action) toast(`${action.dataset.p6Action} opened`);
  });
  drawer.addEventListener('click', event => {
    if (event.target.closest('[data-p6-close]')) closeDrawer();
    const link = event.target.closest('[data-p6-link]');
    if (link) window.location.href = `./${link.dataset.p6Link}`;
    const copy = event.target.closest('[data-p6-copy]');
    if (copy) { navigator.clipboard?.writeText(copy.dataset.p6Copy); toast(`${copy.dataset.p6Copy} copied`, 'copy'); }
    const action = event.target.closest('[data-p6-action]');
    if (action) toast(`${action.dataset.p6Action} opened`);
  });
  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    if (event.key === 'Tab' && drawer.classList.contains('open')) {
      const focusable = [...drawer.querySelectorAll('button,[href],input,[tabindex]:not([tabindex="-1"])')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const bindFilter = (inputId, rowSelector, emptyId, dataKey) => {
    const input = document.querySelector(inputId);
    if (!input) return;
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      document.querySelectorAll(rowSelector).forEach(row => {
        const matches = (row.dataset[dataKey] || '').includes(query);
        row.hidden = !matches;
        if (matches) visible += 1;
      });
      const empty = document.querySelector(emptyId);
      if (empty) empty.hidden = visible > 0;
    });
  };
  bindFilter('#p6-usage-search', '[data-p6-usage-search]', '#p6-usage-empty', 'p6UsageSearch');
  bindFilter('#p6-user-search', '[data-p6-user-search]', '#p6-user-empty', 'p6UserSearch');

  if (window.ApexCharts) {
    const analyticsCharts = [];
    const palette = () => {
      const isDark = document.documentElement.classList.contains('dark');
      return {
        isDark,
        fore: isDark ? '#9aa6b2' : '#68727e',
        grid: isDark ? 'rgba(255,255,255,.08)' : 'rgba(20,27,34,.1)',
        tooltip: isDark ? 'dark' : 'light',
      };
    };
    const common = () => {
      const colors = palette();
      return { chart: { toolbar: { show: false }, background: 'transparent', foreColor: colors.fore, fontFamily: 'Manrope, sans-serif' }, dataLabels: { enabled: false }, grid: { borderColor: colors.grid, strokeDashArray: 4 }, legend: { labels: { colors: colors.fore } }, tooltip: { theme: colors.tooltip } };
    };
    const usageChart = document.querySelector('#p6-usage-chart');
    if (usageChart) { const chart = new ApexCharts(usageChart, { ...common(), chart: { ...common().chart, type: 'line', height: 300 }, series: [{ name: 'Requests index', data: data.usageTrend.requests }, { name: 'Processed tokens index', data: data.usageTrend.tokens }, { name: 'Referenced users index', data: data.usageTrend.users }], colors: ['#e6a515', '#62afa8', '#7aa2d6'], stroke: { curve: 'smooth', width: [2.6, 2.2, 2.2] }, markers: { size: 0 }, xaxis: { categories: data.usageTrend.categories, axisBorder: { show: false }, axisTicks: { show: false } }, annotations: { yaxis: [{ y: 100, borderColor: '#c7a14a', strokeDashArray: 5, label: { text: 'Aug 21 baseline · 100', style: { fontSize: '12px', fontWeight: 700 } } }] }, yaxis: [{ min: 96, max: 132, tickAmount: 4, labels: { formatter: value => `${Math.round(value)}` } }], tooltip: { ...common().tooltip, y: { formatter: value => `${value.toFixed(0)} index` } } }); chart.render(); analyticsCharts.push(chart); }
    const costChart = document.querySelector('#p6-cost-chart');
    if (costChart) { const chart = new ApexCharts(costChart, { ...common(), chart: { ...common().chart, type: 'area', height: 300 }, series: [{ name: 'Actual', data: data.costTrend.actual }, { name: 'Budget pace', data: data.costTrend.budget }, { name: 'Forecast', data: data.costTrend.forecast }], colors: ['#e6a515', '#62afa8', '#d18473'], stroke: { curve: 'smooth', width: [2.6, 1.8, 1.8], dashArray: [0, 6, 4] }, fill: { type: 'gradient', gradient: { opacityFrom: .17, opacityTo: .01 } }, xaxis: { categories: data.costTrend.categories, axisBorder: { show: false }, axisTicks: { show: false } }, yaxis: { min: 300, max: 420, tickAmount: 4, labels: { formatter: value => `$${Math.round(value)}` } }, tooltip: { ...common().tooltip, y: { formatter: value => `$${Number(value).toFixed(0)} / day` } } }); chart.render(); analyticsCharts.push(chart); }
    document.addEventListener('orvexa:themechange', () => {
      const colors = palette();
      analyticsCharts.forEach(chart => chart.updateOptions({ chart: { foreColor: colors.fore }, grid: { borderColor: colors.grid }, legend: { labels: { colors: colors.fore } }, tooltip: { theme: colors.tooltip } }, false, false));
    });
  }

  window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
})();
