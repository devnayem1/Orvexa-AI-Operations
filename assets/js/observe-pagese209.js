(() => {
  'use strict';

  const product = window.Orvexa?.product;
  const data = product?.observability;
  const page = document.body.dataset.observePage || document.body.dataset.activePage;
  const main = document.querySelector('main');
  if (!product || !data || !main) return;

  const icon = name => `<i data-lucide="${name}"></i>`;
  const tone = (value = '') => /healthy|recovered|resolved|complete|available|within|active|expected|enforced/i.test(value) ? 'good' : /watch|investigating|mitigating|acknowledged|review|high|medium/i.test(value) ? 'warn' : /critical|paging|at risk|open|error|failed/i.test(value) ? 'bad' : /live|now/i.test(value) ? 'live' : 'info';
  const status = (label, custom) => `<span class="p5-status ${custom || tone(label)} severity-${String(label).toLowerCase().replace(/[^a-z0-9]+/g,'-')}">${label}</span>`;
  const button = (label, glyph = 'sliders-horizontal', primary = false, attrs = '') => `<button class="p5-btn ${primary ? 'primary' : ''}" type="button" ${attrs}>${icon(glyph)}${label}</button>`;
  const panelHead = (title, copy, extra = '') => `<header class="p5-panel-head"><div><h2>${title}</h2><p>${copy}</p></div>${extra}</header>`;
  const head = (title, copy, action, glyph = 'plus') => `<section class="p5-head"><div class="p5-title"><h1>${title}</h1></div><div class="p5-context"><button class="p5-select" type="button" data-p5-action="Workspace selector">${icon('building-2')}Nova Intelligence${icon('chevron-down')}</button><button class="p5-select" type="button" data-p5-action="Environment selector">${icon('radio')}Production${icon('chevron-down')}</button>${action ? button(action, glyph, true, `data-p5-action="${action}"`) : ''}</div></section>`;
  const metrics = items => `<section class="p5-metrics ${items.length === 5 ? 'five' : ''}">${items.map(item => `<article class="p5-metric"><span class="p5-metric-icon">${icon(item[3] || 'activity')}</span><small>${item[0]}</small><strong>${item[1]}</strong><em class="${item[4] || ''}">${item[2]}</em></article>`).join('')}</section>`;

  const issueCards = () => data.issues.map((issue, index) => `<button class="p5-issue ${index === 0 ? 'active' : ''}" type="button" data-p5-issue="${issue.id}" data-p5-age="${issue.ageMinutes ?? 0}" data-p5-impact="${Number(String(issue.cost).replace(/[^0-9.]/g,'')) || 0}" data-p5-traces="${Number(String(issue.traces).replace(/,/g,'')) || 0}" data-p5-severity-rank="${({Critical:4,High:3,Medium:2,Low:1}[issue.severity] || 0)}" data-p5-search="${`${issue.id} ${issue.title} ${issue.app} ${issue.component} ${issue.severity} ${issue.state} ${issue.trace} ${issue.owner}`.toLowerCase()}"><div class="p5-issue-top"><span><h3>${issue.title}</h3><small class="p5-id">${issue.id} / ${issue.app}</small></span>${status(issue.severity)}</div><p>${issue.component} is the leading correlated component across this cluster.</p><div class="p5-issue-meta"><span>${icon('user-round')} ${issue.owner}</span><span>${icon('timer')} SLA ${issue.sla}</span></div><div class="p5-facts"><span><small>Affected traces</small><b>${issue.traces}</b></span><span><small>Affected users</small><b>${issue.users}</b></span><span><small>First seen</small><b>${issue.firstSeen}</b></span><span><small>Last seen</small><b>${issue.lastSeen}</b></span></div></button>`).join('');
  const issueInspector = issue => `<div class="p5-panel-head"><div><h2>Representative trace</h2><p>${issue.id} / evidence for the selected issue cluster.</p></div>${status(issue.state)}</div><div class="p5-panel-body p5-insight"><div class="p5-insight-hero"><b>${issue.title}</b><p>${issue.trace} is the highest-confidence representative trace. ${issue.evidenceSummary}</p></div><div class="p5-inspector-facts"><div><small>Trace</small><b>${issue.trace}</b></div><div><small>Component</small><b>${issue.component}</b></div><div><small>Regression candidate</small><b>${issue.regression}</b></div><div><small>Avoidable AI cost</small><b>${issue.cost}</b></div><div><small>Owner</small><b>${issue.owner}</b></div><div><small>SLA</small><b>${issue.sla}</b></div></div><div class="p5-trace-strip">${issue.traceSpans.map(span => `<span class="${tone(span.state)}"><small>${span.duration}ms</small><b>${span.name}</b><em>${span.component}</em></span>`).join('')}</div><div class="p5-insight-actions">${button('Open trace', 'external-link', true, `data-p5-link="traces.html?trace=${issue.trace}"`)}${button('Add to dataset', 'database', false, `data-p5-link="datasets.html?issue=${issue.id}&trace=${issue.trace}"`)}${button('Create evaluation', 'flask-conical', false, `data-p5-link="evaluations.html?issue=${issue.id}&trace=${issue.trace}"`)}${button('Assign owner', 'user-check', false, `data-p5-issue-owner="${issue.id}"`)}${button('Resolve issue', 'check', false, `data-p5-issue-resolve="${issue.id}"`)}</div></div>`;
  const issuesPage = () => `${head('AI Issues &amp; Insights', 'Prioritize AI-specific quality, cost, routing and grounding problems.')}${metrics([
    ['Active issues', '4', '2 high, 1 critical', 'circle-alert', 'bad'], ['Affected traces', '2,526', '+18.4% in the last hour', 'git-branch', 'warn'], ['Unique affected users', '1,327', 'Across 4 applications', 'users'], ['Avoidable AI cost today', '$859.58', 'Retries, fallback and remediation', 'circle-dollar-sign', 'warn'],
  ])}<section class="p5-issue-layout"><article class="p5-panel p5-issue-clusters">${panelHead('Clustered issues', 'Correlated by trace pattern, component, application, and regression candidate.', `<div class="p5-issue-tools"><input class="p5-input" id="p5-issue-search" aria-label="Search issues" placeholder="Search issue or component"><select class="p5-select" id="p5-issue-sort" aria-label="Sort issues"><option value="severity">Sort: Severity</option><option value="impact">Impact</option><option value="last-seen">Last seen</option><option value="traces">Affected traces</option></select></div>`)}<div class="p5-issue-list" id="p5-issue-list">${issueCards()}</div><div class="p5-empty" id="p5-issue-empty" hidden><i>${icon('search-x')}</i><h3>No matching issues</h3><p>Try an issue ID, application, component, severity, owner, trace, or state.</p></div><footer class="p5-issue-footer"><span id="p5-issue-count">Showing 4 active clusters</span><span>Updated 12s ago</span></footer></article><aside class="p5-panel p5-sticky" id="p5-issue-inspector">${issueInspector(data.issues[0])}</aside></section>`;

  const ensureIssueModal = () => {
    let modal = document.getElementById('p5-issue-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'p5-issue-modal';
    modal.className = 'p5-issue-modal';
    modal.hidden = true;
    modal.innerHTML = `<div class="p5-issue-modal-backdrop" data-p5-issue-modal-close></div><section class="p5-issue-modal-card" role="dialog" aria-modal="true" aria-labelledby="p5-issue-modal-title"><header><div><small id="p5-issue-modal-kicker">Issue workflow</small><h2 id="p5-issue-modal-title">Update issue</h2></div><button class="p5-btn" type="button" data-p5-issue-modal-close aria-label="Close">${icon('x')}</button></header><form id="p5-issue-modal-form"><div class="p5-issue-modal-body" id="p5-issue-modal-body"></div><footer><button class="p5-btn" type="button" data-p5-issue-modal-close>Cancel</button><button class="p5-btn primary" type="submit" id="p5-issue-modal-submit">Save</button></footer></form></section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', event => { if (event.target.closest('[data-p5-issue-modal-close]')) closeIssueModal(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeIssueModal(); });
    return modal;
  };
  const closeIssueModal = () => { const modal = document.getElementById('p5-issue-modal'); if (!modal) return; modal.classList.remove('open'); document.body.classList.remove('p5-modal-open'); setTimeout(() => { modal.hidden = true; }, 140); };
  const openIssueOwner = issue => {
    const modal = ensureIssueModal();
    modal.querySelector('#p5-issue-modal-kicker').textContent = issue.id;
    modal.querySelector('#p5-issue-modal-title').textContent = 'Assign issue owner';
    modal.querySelector('#p5-issue-modal-body').innerHTML = `<label class="p5-issue-field"><span>Owner</span><select name="owner" required><option ${issue.owner==='Maya Chen'?'selected':''}>Maya Chen</option><option ${issue.owner==='Noah Williams'?'selected':''}>Noah Williams</option><option ${issue.owner==='Voice Platform'?'selected':''}>Voice Platform</option><option ${issue.owner==='Growth Operations'?'selected':''}>Growth Operations</option><option>Knowledge Systems</option><option>Unassigned</option></select></label><div class="p5-issue-modal-evidence"><small>Evidence</small><b>${issue.trace}</b><p>Assignment changes ownership only; issue evidence, severity and SLA remain intact.</p></div>`;
    const form = modal.querySelector('#p5-issue-modal-form');
    form.dataset.mode = 'owner'; form.dataset.issue = issue.id;
    modal.querySelector('#p5-issue-modal-submit').textContent = 'Assign owner';
    modal.hidden = false; document.body.classList.add('p5-modal-open'); requestAnimationFrame(() => modal.classList.add('open')); modal.querySelector('select')?.focus(); window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  };
  const openIssueResolve = issue => {
    const modal = ensureIssueModal();
    modal.querySelector('#p5-issue-modal-kicker').textContent = `${issue.id} · ${issue.severity}`;
    modal.querySelector('#p5-issue-modal-title').textContent = 'Resolve issue';
    modal.querySelector('#p5-issue-modal-body').innerHTML = `<div class="p5-issue-resolution-grid"><label class="p5-issue-field"><span>Resolution</span><select name="resolution" required><option value="">Select resolution</option><option>Fixed</option><option>Mitigated</option><option>False positive</option><option>Accepted risk</option></select></label><label class="p5-issue-field"><span>Fixed by version</span><input name="version" placeholder="e.g. RET-DOC-03:v5" required></label><label class="p5-issue-field"><span>Owner</span><input name="owner" value="${issue.owner}" required></label><label class="p5-issue-field"><span>Evidence / trace</span><input name="trace" value="${issue.trace}" readonly></label><label class="p5-issue-field full"><span>Resolution note</span><textarea name="note" rows="4" placeholder="What changed, how it was validated, and any follow-up work."></textarea></label></div>${issue.severity==='Critical'?`<label class="p5-issue-confirm"><input type="checkbox" name="confirm" required><span>I confirm the critical issue has validation evidence and the affected workflow is safe to close.</span></label>`:''}`;
    const form = modal.querySelector('#p5-issue-modal-form');
    form.dataset.mode = 'resolve'; form.dataset.issue = issue.id;
    modal.querySelector('#p5-issue-modal-submit').textContent = 'Resolve issue';
    modal.hidden = false; document.body.classList.add('p5-modal-open'); requestAnimationFrame(() => modal.classList.add('open')); modal.querySelector('select,input')?.focus(); window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  };

  const sessionAppClass = app => ({'APP-SUPPORT-001':'app-support','APP-CONTACT-002':'app-contact','APP-DOC-003':'app-doc','APP-GROWTH-004':'app-growth'})[app] || '';
  const sessionEventClass = type => `event-${String(type || 'ai').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
  const clockSeconds = value => { const [m='0',sec='0'] = String(value || '0:00').split(':'); return (Number(m)||0)*60+(Number(sec)||0); };
  const durationSeconds = value => { const match=String(value||'').match(/(?:(\d+)m)?\s*(?:(\d+)s)?/i); return match ? (Number(match[1])||0)*60+(Number(match[2])||0) : 0; };
  const sessionMoments = session => data.sessionTimelines?.[session.id] || [];
  const sessionList = () => data.sessions.slice(0,4).map((session, index) => `<button class="p5-session-item ${sessionAppClass(session.app)} ${index === 0 ? 'active' : ''}" type="button" data-p5-session="${session.id}" data-session-channel="${session.channel}" data-session-state="${session.state}" data-session-outcome="${session.outcome}" data-session-search="${`${session.id} ${session.user} ${session.app} ${session.appName||''} ${session.channel} ${session.outcome} ${session.state}`.toLowerCase()}"><span><b>${session.id}</b><small>${session.appName || session.app} · ${session.channel} · ${session.user}</small></span><span>${status(session.state)}</span></button>`).join('');
  const sessionReplay = session => {
    const moments=sessionMoments(session); const total=Math.max(durationSeconds(session.duration),1);
    const markers=moments.map((item,index)=>`<button class="observe-replay-marker ${sessionEventClass(item.eventType)}" type="button" style="--marker:${Math.min((clockSeconds(item.time)/total)*100,100)}%" data-observe-replay-jump="${index}" aria-label="Jump to ${item.kind}: ${item.title}" title="${item.time} · ${item.kind} · ${item.title}"></button>`).join('');
    return `<section class="observe-session-replay" data-observe-session-replay data-session-id="${session.id}" data-session-duration="${total}"><div class="observe-replay-copy"><div><small>Conversation replay</small><b>${moments.length} key moments across a ${session.duration} conversation</b></div><div class="observe-replay-controls"><button class="p5-btn" type="button" data-observe-replay-toggle>${icon('play')}<span>Play</span></button><button class="p5-btn" type="button" data-observe-replay-next>${icon('skip-forward')}<span>Next</span></button><button class="p5-btn observe-replay-speed" type="button" data-observe-replay-speed>1×</button></div></div><div class="observe-replay-scale"><span>00:00</span><div class="observe-replay-track"><i data-observe-replay-progress></i>${markers}</div><span>${session.duration}</span></div><div class="observe-replay-legend"><span class="event-customer">${icon('message-square')}User</span><span class="event-tool">${icon('wrench')}Tool</span><span class="event-ai">${icon('sparkles')}AI</span><span class="event-memory">${icon('brain-circuit')}Memory</span><span class="event-human">${icon('user-check')}Human</span><span class="event-resolved">${icon('check')}Resolved</span></div></section>`;
  };
  const sessionDetail = session => {
    const moments=sessionMoments(session); const replay=sessionReplay(session);
    const timeline=moments.map((item,index)=>`<a class="p5-timeline-item ${sessionEventClass(item.eventType)}" href="./${item.href || `traces.html?trace=${encodeURIComponent(item.rootTrace || item.trace)}`}" data-observe-session-moment="${index}" data-replay-position="${Math.min((clockSeconds(item.time)/Math.max(durationSeconds(session.duration),1))*100,100).toFixed(2)}"><i class="p5-timeline-icon">${icon(item.icon)}</i><span><b>${item.kind} / ${item.title}</b><small>${item.detail}</small><small class="p5-id">${item.trace}</small></span><time>${item.time}</time></a>`).join('');
    return `${panelHead(session.id, `${session.user} · ${session.appName || session.app} · ${session.channel}`, `<div class="observe-session-head-state">${status(session.outcome)}<button class="p5-btn observe-session-close" type="button" data-observe-session-close aria-label="Close session replay">${icon('x')}</button></div>`)}<div class="p5-session-stats"><div><small>Cost</small><b>${session.cost}</b></div><div><small>Session quality</small><b>${session.quality}</b><em>${session.qualityDelta || ''}</em></div><div><small>Context used</small><b>${session.tokens}</b></div><div><small>Correlated issues</small><b>${session.state === 'Healthy' ? 'None' : '1'}</b></div></div>${replay}<div class="observe-session-moments-head"><div><h3>Key moments</h3><p>Operational milestones only; the full transcript remains privacy-minimized.</p></div><span>${moments.length} moments</span></div><div class="p5-timeline">${timeline}</div>`;
  };
  const sessionRows = () => data.sessions.map(session => `<button class="p5-row observe-session-row ${sessionAppClass(session.app)}" type="button" data-p5-session-row="${session.id}" data-session-channel="${session.channel}" data-session-state="${session.state}" data-session-outcome="${session.outcome}" data-session-search="${`${session.id} ${session.user} ${session.app} ${session.appName||''} ${session.channel} ${session.outcome} ${session.state}`.toLowerCase()}"><span><b>${session.id}</b><small>${session.channel}</small></span><span class="p5-mono">${session.user}</span><span><b>${session.appName || session.app}</b><small class="p5-mono">${session.app}</small></span><span>${session.turns}</span><span>${session.duration}</span><span>${session.tokens}</span><span>${session.cost}</span><span><b>${session.quality}</b><small>${session.outcome}</small></span></button>`).join('');
  const sessionsPage = () => `${head('Sessions &amp; Threads', 'Replay complete conversations and multi-step user journeys with trace links, tool activity, feedback, quality, cost, and human handoff.', 'Export sessions', 'download')}${metrics([
    ['Active sessions', '343', 'Across all production channels', 'messages-square'], ['Median turns', '8.2', '+0.4 week over week', 'list-ordered'], ['Median duration', '7m 18s', '-28s this week', 'timer'], ['Quality', '96.2%', '1.8% above baseline', 'badge-check'],
  ])}<section class="observe-session-toolbar" aria-label="Session filters"><input class="p5-input" id="observe-session-search" aria-label="Search sessions" placeholder="Search session or user"><select class="p5-input" id="observe-session-channel" aria-label="Filter channel"><option value="">All channels</option>${[...new Set(data.sessions.map(s=>s.channel))].map(value=>`<option>${value}</option>`).join('')}</select><select class="p5-input" id="observe-session-state" aria-label="Filter state"><option value="">All states</option>${[...new Set(data.sessions.map(s=>s.state))].map(value=>`<option>${value}</option>`).join('')}</select><select class="p5-input" id="observe-session-outcome" aria-label="Filter outcome"><option value="">All outcomes</option>${[...new Set(data.sessions.map(s=>s.outcome))].map(value=>`<option>${value}</option>`).join('')}</select></section><section class="p5-session-layout"><aside class="p5-panel observe-session-list-panel">${panelHead('Recent sessions', '4 priority sessions · selected for quality risk and operational outcome.')}<div class="p5-session-list">${sessionList()}</div><div class="p5-empty" id="observe-session-list-empty" hidden><i>${icon('search-x')}</i><h3>No priority sessions match</h3><p>Adjust search, channel, state, or outcome.</p></div></aside><article class="p5-panel observe-session-detail-panel" id="p5-session-detail">${sessionDetail(data.sessions[0])}</article><div class="observe-session-backdrop" data-observe-session-close></div></section><section class="p5-panel p5-section">${panelHead('Session registry', '5 featured sessions · canonical application, user, channel, quality and outcome evidence.')}<div class="p5-table sessions" id="p5-session-table"><div class="p5-table-head"><span>Session</span><span>User</span><span>Application</span><span>Turns</span><span>Duration</span><span>Tokens</span><span>Cost</span><span>Quality / outcome</span></div>${sessionRows()}</div><div class="p5-empty" id="p5-session-empty" hidden><i>${icon('search-x')}</i><h3>No matching sessions</h3><p>Try a session ID, user, application, channel, outcome, or state.</p></div></section>`;

  const appName = appId => ({'APP-SUPPORT-001':'Support AI','APP-CONTACT-002':'AI Contact Center','APP-DOC-003':'Document Intelligence','APP-GROWTH-004':'Growth Assistant'})[appId] || appId;
  const signalClass = state => /critical/i.test(state) ? 'critical' : /high/i.test(state) ? 'high' : /watch/i.test(state) ? 'watch' : /expected|enforced/i.test(state) ? 'expected' : 'neutral';
  const errorGroups = () => data.errorGroups.map(group => `<button class="p5-error observe-signal-card signal-${signalClass(group.state)}" type="button" data-observe-error-group="${group.id}" data-observe-group-component="${group.component}" data-observe-group-app="${group.affected}" data-observe-group-severity="${group.filterSeverity || ''}"><div class="p5-error-top"><span><h3>${group.name}</h3><small class="p5-id">${group.id}</small></span>${status(group.state)}</div><small>${group.component} · ${group.affected}</small><strong class="p5-error-count">${group.count}</strong><div class="p5-error-foot"><span>${group.rate}</span><span>${group.firstSeen} → ${group.lastSeen}</span></div></button>`).join('');
  const logRows = () => data.logs.map(log => `<button class="p5-row observe-log-row log-${String(log.severity).toLowerCase()}" type="button" data-observe-log-event="${log.id}" data-observe-severity="${log.severity}" data-observe-app="${log.app}" data-observe-group="${log.group || ''}" data-p5-log-search="${`${log.id} ${log.timestamp} ${log.severity} ${log.component} ${log.app} ${appName(log.app)} ${log.request} ${log.trace || ''} ${log.group || ''} ${log.message} ${log.environment}`.toLowerCase()}"><span><b>${log.timestamp}</b><small>${log.id}</small></span><span>${status(log.severity)}</span><span class="p5-mono">${log.component}</span><span><b>${appName(log.app)}</b><small class="p5-mono">${log.app}</small></span><span class="p5-mono">${log.request}</span><span class="p5-log-message">${log.message}</span><span>${log.environment}</span></button>`).join('');
  const logAppOptions = () => [...new Set(data.logs.map(log => log.app))].map(app => `<option value="${app}">${appName(app)}</option>`).join('');
  const logsPage = () => `${head('Logs &amp; Errors', 'Investigate live logs and correlated production signals, then move from service events to request-level evidence.', 'Live tail', 'radio')}${metrics([
    ['Events today', '18.4M', '1.2M in the last hour', 'scroll-text'], ['Errors', '2,544', '0.014% of events', 'circle-x', 'bad'], ['Warnings', '8,218', '-6.8% day over day', 'triangle-alert', 'warn'], ['Recovery rate', '96.4%', 'Of recoverable failures', 'refresh-cw'],
  ])}<section class="p5-panel observe-signal-panel">${panelHead('Correlated event groups', 'Repeated logs grouped into meaningful operational patterns across errors, warnings, limits, retrieval and expected policy enforcement.', status('5 groups', 'live'))}<div class="p5-error-grid">${errorGroups()}</div></section><section class="p5-panel p5-section observe-log-panel">${panelHead('Structured event stream', 'Timestamp, severity, component, application, request, message, and environment.', `<div class="observe-log-head-tools"><span class="observe-live-state" id="observe-live-state">${icon('radio')}<b>Live tail active</b></span><div class="observe-log-toolbar"><input class="p5-input" id="p5-log-search" aria-label="Search logs" placeholder="Search logs or requests"><select class="p5-input" id="observe-log-app" aria-label="Filter application"><option value="">All applications</option>${logAppOptions()}</select><select class="p5-input" id="observe-log-severity" aria-label="Filter severity"><option value="">All severity</option><option>Error</option><option>Warn</option><option>Info</option></select>${button('Reset','rotate-ccw',false,'data-observe-log-reset')}${button('Download JSON','download',false,'data-observe-log-export')}</div></div>`) }<div class="p5-table logs" id="p5-log-table"><div class="p5-table-head"><span>Timestamp</span><span>Severity</span><span>Component</span><span>Application</span><span>Request</span><span>Message</span><span>Environment</span></div>${logRows()}</div><div class="p5-empty" id="p5-log-empty" hidden><i>${icon('file-search')}</i><h3>No matching log events</h3><p>Try a log ID, request, component, application, message, or severity.</p></div></section>`;

  const sloRows = () => data.slos.map(slo => `<button class="p5-row observe-slo-row" type="button" data-observe-slo="${slo.id}"><span><b>${slo.name}</b><small class="p5-id">${slo.id}</small></span><span><b>${slo.target}</b><small>${slo.sli}</small></span><span>${slo.displayCurrent || slo.current}</span><span>${slo.window}</span><span>${slo.budget}</span><span>${slo.burn}</span><span>${status(slo.state)}</span></button>`).join('');
  const sloPage = () => `${head('Performance &amp; SLO', 'Track latency, availability, success rate, and error-budget burn against production service-level objectives.', 'New SLO', 'plus')}${metrics([
    ['Availability', '99.99%', 'Target 99.95% · 30D', 'shield-check'], ['P50 latency', '408ms', 'Production · Last 24h', 'gauge'], ['P95 latency', '742ms', '108ms below 850ms SLO · 24h', 'activity'], ['TTFT', '218ms', 'Within interactive target · 24h', 'zap'], ['Interactive budget remaining', '69%', '31% consumed · 30D', 'circle-gauge', 'warn'],
  ])}<section class="p5-grid two"><article class="p5-panel observe-latency-panel">${panelHead('Interactive AI latency', 'P50, P95, and time to first token across production workloads.', status('Within SLO'))}<div class="p5-chart" id="p5-latency-chart"></div><div class="observe-chart-foot"><span>Demo snapshot · ${product.demoClock?.label || 'Aug 27, 2026 · 14:45 UTC'}</span><span>Error budget uses requests breaching the objective, not aggregate P95 alone.</span></div></article><aside class="p5-panel observe-budget-policy">${panelHead('Error-budget policy', 'Release automation responds to sustained multi-window burn, not one noisy datapoint.')}<div class="p5-burn-policy"><div class="p5-burn fast"><i>${icon('siren')}</i><span><b>Fast burn</b><small>&gt;14x / 1h or &gt;6x / 6h exhausts budget quickly.</small></span><strong>PAGE</strong></div><div class="p5-burn slow"><i>${icon('shield-alert')}</i><span><b>Slow burn</b><small>&gt;1x sustained burn gates risky release rollout.</small></span><strong>GATE</strong></div><div class="p5-burn healthy"><i>${icon('check')}</i><span><b>Healthy burn</b><small>&lt;1x keeps guarded release automation enabled.</small></span><strong>AUTO</strong></div></div></aside></section><section class="p5-panel p5-section observe-slo-registry-panel">${panelHead('Service-level objectives', 'Canonical SLO registry: target, current SLI, rolling window, error-budget use, burn rate, and operating status.', button('Export SLO report', 'download', false, 'data-p5-action="Export SLO report"'))}<div class="p5-table observe-slo-table"><div class="p5-table-head"><span>SLO</span><span>Target / SLI</span><span>Current</span><span>Window</span><span>Budget</span><span>Burn</span><span>Status</span></div>${sloRows()}</div></section>`;

  const incidentClass = incident => incident.id === 'INC-2047' ? 'incident-provider' : incident.id === 'INC-2048' ? 'incident-tool' : 'incident-generic';
  const incidentCards = () => data.incidents.map((incident, index) => `<button class="p5-incident ${incidentClass(incident)} ${index===0?'selected':''}" type="button" data-observe-incident="${incident.id}" aria-pressed="${index===0?'true':'false'}"><div class="p5-incident-top"><span><div class="observe-incident-titleline"><span class="observe-sev-badge">${incident.severity}</span><small class="p5-id">${incident.id}</small></div><h3>${incident.title}</h3></span>${status(incident.stage)}</div><p>${incident.impact}</p><div class="observe-incident-impact"><strong>${incident.impactValue || ''}</strong><span>${incident.impactLabel || 'affected'}</span></div><div class="p5-incident-meta"><span>${incident.apps} · ${incident.provider}</span><span>${incident.owner} · ${incident.started}</span></div></button>`).join('');
  const alertAction = alert => alert.state === 'Paging' ? `<button class="p5-mini" type="button" data-observe-alert-action="ack" data-alert-id="${alert.id}">Acknowledge</button>` : alert.state === 'Acknowledged' && alert.incident !== 'None' ? `<button class="p5-mini" type="button" data-observe-alert-action="incident" data-alert-id="${alert.id}" data-incident-id="${alert.incident}">Open incident</button>` : alert.state === 'Investigating' ? `<button class="p5-mini" type="button" data-observe-alert-action="investigation" data-alert-id="${alert.id}">View investigation</button>` : alert.state === 'Open' ? `<button class="p5-mini" type="button" data-observe-alert-action="ack" data-alert-id="${alert.id}">Acknowledge</button>` : '';
  const alertRows = () => data.alerts.map(alert => `<div class="p5-row" data-p5-alert-row="${alert.id}" data-alert-id="${alert.id}"><span><b>${alert.rule}</b><small>${alert.id}</small></span><span>${status(alert.severity)}</span><span class="p5-mono">${alert.source}</span><span>${alert.started}</span><span>${alert.current}</span><span class="p5-mono">${alert.incident === 'None' ? '—' : alert.incident}</span><span class="p5-alert-state">${status(alert.state)}${alertAction(alert)}</span></div>`).join('');
  const workflowMarkup = () => `<div class="observe-incident-context" id="observe-workflow-context"><span class="observe-context-kicker">Selected incident</span><b>INC-2047 · Orbit AI provider latency</b><small>Current stage · Mitigating</small></div><div class="p5-workflow observe-response-stepper" id="observe-response-workflow">${[
    ['Detected','Automatic signal','radio','complete'],['Acknowledged','Owner engaged','user-check','complete'],['Mitigating','Fallback active','shield-alert','current'],['Monitoring','SLO recovery pending','activity','future'],['Resolved','Evidence required','check','future']
  ].map(item => `<div class="p5-workflow-step ${item[3]}"><i>${icon(item[2])}</i><b>${item[0]}</b><small>${item[1]}</small></div>`).join('')}</div>`;
  const automationMarkup = () => `<div class="observe-incident-context" id="observe-automation-context"><span class="observe-context-kicker">Selected incident</span><b>INC-2047 · Provider latency response</b><small>Automation is guarded by incident policy and owner accountability.</small></div><div class="p5-automation" id="observe-response-automation"><div class="p5-auto"><i>${icon('route')}</i><span><b>Provider fallback</b><small>Shift eligible traffic while Orbit AI P95 remains above the approved objective.</small></span>${status('Active')}</div><div class="p5-auto"><i>${icon('pause')}</i><span><b>Release freeze</b><small>Available if incident burn expands into a release-risk condition.</small></span>${status('Standby')}</div><div class="p5-auto"><i>${icon('file-check')}</i><span><b>Resolution evidence</b><small>Trace, owner timeline and validation evidence required before closure.</small></span>${status('Required')}</div></div>`;
  const incidentsPage = () => `${head('Alerts &amp; Incidents', 'Detect, coordinate and resolve production AI reliability events.', 'Declare incident', 'siren')}${metrics([
    ['Paging alerts', '1', 'Provider latency', 'bell-ring', 'bad'], ['Active incidents', '2', 'Both SEV-2', 'siren', 'bad'], ['Acknowledged', '1', 'Median response 4m 12s', 'user-check', 'warn'], ['MTTR', '34m', '-6m versus 30-day baseline', 'timer'],
  ])}<section class="p5-panel">${panelHead('Alert queue', 'Rule, severity, source, start time, current value, linked incident, and state.', button('Alert rules', 'settings-2', false, 'data-p5-action="Alert rules"'))}<div class="p5-table alerts"><div class="p5-table-head"><span>Rule</span><span>Severity</span><span>Source</span><span>Started</span><span>Current</span><span>Incident</span><span>Status</span></div>${alertRows()}</div></section><section class="p5-panel p5-section observe-active-incidents">${panelHead('Active incidents', 'Select an incident to bind workflow, automation, owner and response evidence below.', `<span id="observe-active-count">${status('2 active', 'bad')}</span>`)}<div class="p5-incident-grid">${incidentCards()}</div></section><section class="p5-grid equal p5-section observe-incident-workspace"><article class="p5-panel">${panelHead('Response workflow', 'Selected-incident lifecycle from signal detection to validated resolution.')} ${workflowMarkup()}</article><aside class="p5-panel">${panelHead('Response automation', 'Guarded incident actions that shorten recovery without hiding accountability.')} ${automationMarkup()}</aside></section>`;

  const providerRows = () => data.providers.map(provider => `<button class="p5-row provider-${String(provider.state).toLowerCase()}" type="button" data-provider-state="${provider.state}" data-p5-inspect data-p5-kind="Provider fleet" data-p5-record="${provider.id}" data-p5-title="${provider.name}"><span><b>${provider.name}</b><small>${provider.id}</small></span><span>${status(provider.state)}</span><span><b>${provider.quota}</b><small>${provider.headroom} headroom</small></span><span>${provider.usage}</span><span>${provider.errors}</span><span>${provider.p95}</span><span class="observe-routing-role">${provider.routingRole}</span><span>${provider.share}</span></button>`).join('');
  const reliabilityPage = () => { const capacity = data.capacitySummary || {}; return `${head('Reliability &amp; Capacity', 'Plan AI capacity and maintain fallback readiness under load.', 'Capacity plan', 'calendar-range')}${metrics([
    ['Effective headroom', capacity.effectiveHeadroom || '32%', `${capacity.constrainedHeadroom || '18%'} at constrained provider`, 'gauge', 'warn'], ['Provider availability', '99.95%', 'Traffic-weighted fleet', 'server'], ['Affected-route fallback', capacity.fallbackTraffic || '8.4%', `${capacity.fallbackDelta || '+3.1pp'} · INC-2047 mitigation`, 'route', 'warn'], ['Peak coverage', capacity.peakCoverage || '1.42×', `Reserved ÷ projected peak · ${capacity.projectedPeak || '14:00 UTC'}`, 'cloud'],
  ])}<section class="p5-grid two"><article class="p5-panel observe-capacity-demand">${panelHead('Capacity demand', `Normalized demand index · ${capacity.demandBaseline || 'trailing 7-day baseline = 100'}.`, status('Live', 'live'))}<div class="p5-chart" id="p5-capacity-chart"></div><div class="p5-capacity-band"><div><small>Requests</small><b>${capacity.requests24h || '1.32M'} / 24h</b></div><div><small>Tokens</small><b>${capacity.tokens24h || '8.2B'} / 24h</b></div><div><small>Tool calls</small><b>${capacity.toolCalls24h || '1.49M'} / 24h</b></div><div><small>Peak window</small><b>${capacity.peakWindow || '13:00–16:00 UTC'}</b></div></div></article><aside class="p5-panel">${panelHead('Capacity safeguards', 'Automated boundaries that preserve quality during uneven provider demand.')}<div class="p5-automation"><div class="p5-auto"><i>${icon('route')}</i><span><b>Weighted provider routing</b><small>Availability, P95, error rate, quota, and cost affect every route.</small></span>${status('Active')}</div><div class="p5-auto"><i>${icon('shield-check')}</i><span><b>Fallback quality gate</b><small>Only compatible models and approved regions receive traffic.</small></span>${status('Enforced')}</div><div class="p5-auto"><i>${icon('bell-ring')}</i><span><b>Headroom watch</b><small>Page at 15% provider headroom or 1.2× projected peak coverage.</small></span>${status('Ready')}</div><div class="p5-auto"><i>${icon('calendar-range')}</i><span><b>Peak reservation</b><small>Reserved capacity protects the ${capacity.peakWindow || '13:00–16:00 UTC'} window.</small></span>${status('Covered')}</div></div></aside></section><section class="p5-panel p5-section">${panelHead('Provider fleet', 'Availability, quota, usage, errors, tail latency, routing role, and traffic share.', button('Provider policies', 'settings-2', false, 'data-p5-action="Provider policies"'))}<div class="p5-table providers"><div class="p5-table-head"><span>Provider</span><span>Status</span><span>Quota</span><span>Current usage</span><span>Error rate</span><span>P95</span><span>Routing role</span><span>Traffic</span></div>${providerRows()}</div></section>`; };

  const renderers = { 'ai-issues': issuesPage, sessions: sessionsPage, 'logs-errors': logsPage, 'performance-slo': sloPage, 'alerts-incidents': incidentsPage, 'reliability-capacity': reliabilityPage };
  const render = renderers[page];
  if (!render) return;

  main.className = 'p5-page';
  main.innerHTML = render();

  const backdrop = document.createElement('div');
  backdrop.className = 'p5-drawer-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  const drawer = document.createElement('aside');
  drawer.className = 'p5-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-label', 'Record inspector');
  drawer.innerHTML = `<div class="p5-drawer-head"><div><small id="p5-drawer-kind">Operational evidence</small><h2 id="p5-drawer-title">Inspector</h2></div><button class="p5-btn" type="button" aria-label="Close inspector" data-p5-close>${icon('x')}</button></div><div class="p5-drawer-body" id="p5-drawer-body"></div>`;
  document.body.append(backdrop, drawer);

  let returnFocus = null;
  const findRecord = id => [...data.issues, ...data.sessions, ...data.errorGroups, ...data.logs, ...data.slos, ...data.alerts, ...data.incidents, ...data.providers, ...data.sessionTimeline].find(item => item.id === id || item.trace === id);
  const recordBody = (record, kind) => {
    if (!record) return `<div class="p5-insight-hero"><b>Evidence retained</b><p>This operational record remains linked to its source trace and production context.</p></div>`;
    const excluded = new Set(['title', 'name', 'message', 'detail', 'icon']);
    const facts = Object.entries(record).filter(([key]) => !excluded.has(key)).slice(0, 10);
    const summary = record.message || record.detail || record.impact || `${kind} evidence is linked to the production control plane.`;
    return `<div class="p5-insight"><div class="p5-insight-hero"><b>${record.title || record.name || kind}</b><p>${summary}</p></div><div class="p5-inspector-facts">${facts.map(([key, value]) => `<div><small>${key.replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase())}</small><b>${value}</b></div>`).join('')}</div><div class="p5-insight-actions">${button('Open trace', 'external-link', true, 'data-p5-link="traces.html"')}${button('Copy ID', 'copy', false, `data-p5-copy="${record.id || record.trace || ''}"`)}${button('Assign owner', 'user-check', false, 'data-p5-action="Assign owner"')}${button('Add note', 'message-square-plus', false, 'data-p5-action="Add operational note"')}</div></div>`;
  };
  const closeDrawer = () => { drawer.classList.remove('open'); backdrop.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; returnFocus?.focus?.(); };
  const openDrawer = trigger => {
    const record = findRecord(trigger.dataset.p5Record);
    returnFocus = trigger;
    drawer.querySelector('#p5-drawer-kind').textContent = trigger.dataset.p5Kind || 'Operational evidence';
    drawer.querySelector('#p5-drawer-title').textContent = trigger.dataset.p5Title || record?.title || record?.name || trigger.dataset.p5Record || 'Inspector';
    drawer.querySelector('#p5-drawer-body').innerHTML = recordBody(record, trigger.dataset.p5Kind || 'Record');
    drawer.classList.add('open');
    backdrop.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    drawer.querySelector('[data-p5-close]').focus();
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  };
  const toast = (message, glyph = 'sparkles') => window.showToast?.(message, glyph);

  main.addEventListener('click', event => {
    const issueTrigger = event.target.closest('[data-p5-issue]');
    if (issueTrigger) {
      const issue = data.issues.find(item => item.id === issueTrigger.dataset.p5Issue);
      main.querySelectorAll('[data-p5-issue]').forEach(item => item.classList.toggle('active', item === issueTrigger));
      main.querySelector('#p5-issue-inspector').innerHTML = issueInspector(issue);
      window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
      return;
    }
    const sessionTrigger = event.target.closest('[data-p5-session], [data-p5-session-row]');
    if (sessionTrigger) {
      const id = sessionTrigger.dataset.p5Session || sessionTrigger.dataset.p5SessionRow;
      const session = data.sessions.find(item => item.id === id);
      main.querySelectorAll('[data-p5-session]').forEach(item => item.classList.toggle('active', item.dataset.p5Session === id));
      main.querySelector('#p5-session-detail').innerHTML = sessionDetail(session);
      if (window.matchMedia('(max-width:1240px)').matches) { main.querySelector('.p5-session-layout')?.classList.add('detail-open'); document.body.classList.add('observe-session-detail-open'); }
      else main.querySelector('#p5-session-detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      main.dispatchEvent(new CustomEvent('observe:session-selected', { detail:{ id } }));
      window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
      return;
    }
    const ownerTrigger = event.target.closest('[data-p5-issue-owner]');
    if (ownerTrigger) { const issue = data.issues.find(item => item.id === ownerTrigger.dataset.p5IssueOwner); if (issue) openIssueOwner(issue); return; }
    const resolveTrigger = event.target.closest('[data-p5-issue-resolve]');
    if (resolveTrigger) { const issue = data.issues.find(item => item.id === resolveTrigger.dataset.p5IssueResolve); if (issue) openIssueResolve(issue); return; }
    const inspectTrigger = event.target.closest('[data-p5-inspect]');
    if (inspectTrigger) { openDrawer(inspectTrigger); return; }
    const linkTrigger = event.target.closest('[data-p5-link]');
    if (linkTrigger) { window.location.href = `./${linkTrigger.dataset.p5Link}`; return; }
    const copyTrigger = event.target.closest('[data-p5-copy]');
    if (copyTrigger) { navigator.clipboard?.writeText(copyTrigger.dataset.p5Copy); toast(`${copyTrigger.dataset.p5Copy} copied`, 'copy'); return; }
    const ackTrigger = event.target.closest('[data-p5-ack]');
    if (ackTrigger) {
      const state = ackTrigger.closest('.p5-alert-state');
      state.innerHTML = status('Acknowledged');
      window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
      toast(`${ackTrigger.dataset.p5Ack} acknowledged`, 'user-check');
      return;
    }
    const actionTrigger = event.target.closest('[data-p5-action]');
    if (actionTrigger) toast(`${actionTrigger.dataset.p5Action} opened`);
  });
  drawer.addEventListener('click', event => {
    if (event.target.closest('[data-p5-close]')) closeDrawer();
    const link = event.target.closest('[data-p5-link]');
    if (link) window.location.href = `./${link.dataset.p5Link}`;
    const copy = event.target.closest('[data-p5-copy]');
    if (copy) { navigator.clipboard?.writeText(copy.dataset.p5Copy); toast(`${copy.dataset.p5Copy} copied`, 'copy'); }
    const action = event.target.closest('[data-p5-action]');
    if (action) toast(`${action.dataset.p5Action} opened`);
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

  const bindFilter = (inputId, rowSelector, emptyId) => {
    const input = document.querySelector(inputId);
    if (!input) return;
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      document.querySelectorAll(rowSelector).forEach(row => {
        const matches = (row.dataset.p5Search || row.dataset.p5SessionSearch || row.dataset.p5LogSearch || '').includes(query);
        row.hidden = !matches;
        if (matches) visible += 1;
      });
      const empty = document.querySelector(emptyId);
      if (empty) empty.hidden = visible > 0;
    });
  };
  bindFilter('#p5-log-search', '[data-p5-log-search]', '#p5-log-empty');

  document.addEventListener('submit', event => {
    const form = event.target.closest('#p5-issue-modal-form');
    if (!form) return;
    event.preventDefault();
    const issue = data.issues.find(item => item.id === form.dataset.issue);
    if (!issue) return;
    const payload = new FormData(form);
    if (form.dataset.mode === 'owner') {
      issue.owner = String(payload.get('owner') || issue.owner);
      toast(`${issue.id} assigned to ${issue.owner}`, 'user-check');
    } else if (form.dataset.mode === 'resolve') {
      issue.owner = String(payload.get('owner') || issue.owner);
      issue.state = 'Resolved';
      issue.resolution = String(payload.get('resolution') || 'Resolved');
      issue.fixedBy = String(payload.get('version') || 'Recorded');
      toast(`${issue.id} resolved with evidence`, 'check');
    }
    const activeCard = main.querySelector(`[data-p5-issue="${issue.id}"]`);
    if (activeCard) {
      const ownerMeta = activeCard.querySelector('.p5-issue-meta span:first-child');
      if (ownerMeta) ownerMeta.innerHTML = `${icon('user-round')} ${issue.owner}`;
    }
    if (main.querySelector('[data-p5-issue].active')?.dataset.p5Issue === issue.id) main.querySelector('#p5-issue-inspector').innerHTML = issueInspector(issue);
    closeIssueModal();
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  });

  const renderLatencyFallback = root => {
    if (!root) return;
    const labels = product.demoClock?.last7Days || ['Aug 21','Aug 22','Aug 23','Aug 24','Aug 25','Aug 26','Aug 27'];
    const series = [
      { name: 'P95', values: [768,744,812,784,756,731,742], color: '#e6a515' },
      { name: 'P50', values: [438,421,446,432,417,402,408], color: '#62afa8' },
      { name: 'TTFT', values: [238,226,249,232,224,214,218], color: '#7aa2d6' },
    ];
    const W=920,H=300,L=58,R=18,T=24,B=50,min=180,max=900;
    const x=i=>L+((W-L-R)*i/(labels.length-1));
    const y=v=>T+((H-T-B)*(max-v)/(max-min));
    const ticks=[200,300,400,500,600,700,800,900];
    const paths=series.map(item=>{
      const pts=item.values.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
      const dots=item.values.map((v,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.2" fill="${item.color}"><title>${item.name} · ${labels[i]} · ${v}ms</title></circle>`).join('');
      return `<polyline points="${pts}" fill="none" stroke="${item.color}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>${dots}`;
    }).join('');
    root.innerHTML=`<div class="observe-latency-fallback" role="img" aria-label="Interactive AI latency chart showing P95, P50 and TTFT from Aug 21 to Aug 27 with an 850 millisecond SLO target"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      ${ticks.map(t=>`<line x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}" class="observe-chart-grid"/><text x="${L-12}" y="${y(t)+4}" text-anchor="end" class="observe-chart-axis">${t}ms</text>`).join('')}
      <line x1="${L}" x2="${W-R}" y1="${y(850)}" y2="${y(850)}" class="observe-chart-slo"/><text x="${W-R-4}" y="${y(850)-7}" text-anchor="end" class="observe-chart-slo-label">P95 SLO 850ms</text>
      ${paths}
      ${labels.map((label,i)=>`<text x="${x(i)}" y="${H-24}" text-anchor="middle" class="observe-chart-axis">${i===0?label:String(label).replace('Aug ','')}</text>`).join('')}
    </svg><div class="observe-chart-legend">${series.map(item=>`<span><i style="background:${item.color}"></i>${item.name}</span>`).join('')}</div></div>`;
  };

  if (window.ApexCharts) {
    const chartInstances = [];
    const isDark = document.documentElement.classList.contains('dark');
    const common = { chart: { toolbar: { show: false }, background: 'transparent', foreColor: isDark ? '#9aa6b2' : '#68727e', fontFamily: 'Manrope, sans-serif' }, dataLabels: { enabled: false }, grid: { borderColor: isDark ? 'rgba(255,255,255,.08)' : 'rgba(20,27,34,.1)', strokeDashArray: 4 }, legend: { labels: { colors: isDark ? '#9aa6b2' : '#68727e' } }, tooltip: { theme: isDark ? 'dark' : 'light' } };
    const latency = document.querySelector('#p5-latency-chart');
    if (latency) { try { const chart = new ApexCharts(latency, { ...common, chart: { ...common.chart, type: 'area', height: 300 }, series: [{ name: 'P95', data: [768, 744, 812, 784, 756, 731, 742] }, { name: 'P50', data: [438, 421, 446, 432, 417, 402, 408] }, { name: 'TTFT', data: [238, 226, 249, 232, 224, 214, 218] }], colors: ['#e6a515', '#62afa8', '#7aa2d6'], stroke: { curve: 'smooth', width: [2.8, 2.2, 2.2] }, markers: { size: 2.6, strokeWidth: 0, hover: { size: 5 } }, fill: { type: 'gradient', gradient: { opacityFrom: .14, opacityTo: .01 } }, annotations: { yaxis: [{ y: 850, borderColor: '#d59a19', strokeDashArray: 5, label: { borderColor: 'transparent', offsetX: -6, style: { background: 'transparent', color: isDark ? '#d6b56f' : '#9a6810', fontSize: '12px', fontWeight: 700 }, text: 'P95 SLO 850ms' } }] }, xaxis: { categories: product.demoClock?.last7Days || ['Aug 21','Aug 22','Aug 23','Aug 24','Aug 25','Aug 26','Aug 27'], axisBorder: { show: false }, axisTicks: { show: false }, labels: { formatter: value => { const label = String(value ?? ''); return label === 'Aug 21' ? label : label.replace('Aug ',''); } } }, yaxis: { min: 180, max: 900, tickAmount: 6, labels: { formatter: value => `${Math.round(value)}ms` } }, tooltip: { ...common.tooltip, y: { formatter: value => `${Math.round(value)}ms` } } }); const rendered = chart.render(); if (rendered?.catch) rendered.catch(() => renderLatencyFallback(latency)); chartInstances.push(chart); } catch (error) { renderLatencyFallback(latency); } }
    const capacity = document.querySelector('#p5-capacity-chart');
    if (capacity) { const chart = new ApexCharts(capacity, { ...common, chart: { ...common.chart, type: 'line', height: 300 }, series: [{ name: 'Requests', data: [68, 72, 79, 84, 91, 88, 96] }, { name: 'Tokens', data: [61, 68, 74, 82, 87, 86, 93] }, { name: 'Tool calls', data: [58, 64, 71, 76, 84, 82, 89] }], colors: ['#e6a515', '#62afa8', '#7aa2d6'], stroke: { curve: 'smooth', width: 2.5 }, markers: { size: 0 }, annotations: { yaxis: [{ y: 100, borderColor: isDark ? 'rgba(216,188,119,.5)' : 'rgba(154,104,16,.42)', strokeDashArray: 5, label: { borderColor:'transparent', offsetX:-5, style:{ background:'transparent', color:isDark?'#cdbb8c':'#826117', fontSize:'12px', fontWeight:700 }, text:'7-day baseline 100' } }] }, xaxis: { categories: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'], axisBorder: { show: false }, axisTicks: { show: false } }, yaxis: { min: 40, max: 110, labels: { formatter: value => `${Math.round(value)}%` } }, tooltip:{ ...common.tooltip, y:{ formatter:value=>`${Math.round(value)} index` } } }); chart.render(); chartInstances.push(chart); }
    if (chartInstances.length) {
      const syncTheme = () => {
        const dark = document.documentElement.classList.contains('dark');
        const label = dark ? '#9aa6b2' : '#68727e';
        const grid = dark ? 'rgba(255,255,255,.08)' : 'rgba(20,27,34,.1)';
        chartInstances.forEach(chart => chart.updateOptions({ chart: { foreColor: label }, grid: { borderColor: grid }, legend: { labels: { colors: label } }, tooltip: { theme: dark ? 'dark' : 'light' } }, false, false));
      };
      new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }
  } else {
    renderLatencyFallback(document.querySelector('#p5-latency-chart'));
  }

  window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
})();
