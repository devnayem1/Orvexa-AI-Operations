(() => {
  'use strict';

  const main = document.querySelector('main');
  const page = document.body.dataset.platformPage;
  const data = window.Orvexa?.product?.platform;
  if (!main || !page || !data) return;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const icon = (name) => `<i data-lucide="${name}"></i>`;
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const refreshIcons = () => window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });

  function toast(message, tone = 'good') {
    const region = document.getElementById('toast-region');
    if (!region) return;
    const item = document.createElement('div');
    item.className = `pf-toast is-${tone}`;
    item.innerHTML = `${icon(tone === 'bad' ? 'circle-alert' : tone === 'warn' ? 'triangle-alert' : 'check-circle-2')}<span>${esc(message)}</span>`;
    region.appendChild(item);
    refreshIcons();
    setTimeout(() => item.remove(), 3000);
  }

  function ensureModal() {
    if (document.getElementById('pf-modal')) return;
    document.body.insertAdjacentHTML('beforeend', `<div class="pf-modal-backdrop" id="pf-modal-backdrop" hidden></div><section aria-hidden="true" aria-labelledby="pf-modal-title" class="pf-modal" id="pf-modal" role="dialog"><header><div><span class="pf-kicker">Platform workflow</span><h2 id="pf-modal-title">Workflow</h2><p id="pf-modal-copy"></p></div><button aria-label="Close" class="pf-icon-button" data-pf-close type="button">${icon('x')}</button></header><div class="pf-modal-body" id="pf-modal-body"></div></section>`);
  }

  function openModal(title, copy, body) {
    ensureModal();
    qs('#pf-modal-title').textContent = title;
    qs('#pf-modal-copy').textContent = copy || '';
    qs('#pf-modal-body').innerHTML = body;
    qs('#pf-modal').classList.add('is-open');
    qs('#pf-modal').setAttribute('aria-hidden','false');
    qs('#pf-modal-backdrop').hidden = false;
    refreshIcons();
    requestAnimationFrame(() => qs('#pf-modal input, #pf-modal select, #pf-modal button')?.focus());
  }

  function closeModal() {
    const modal = qs('#pf-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    qs('#pf-modal-backdrop').hidden = true;
  }

  function formField(label, name, type = 'text', options = [], value = '') {
    if (type === 'select') return `<label>${esc(label)}<select name="${esc(name)}">${options.map((item) => `<option${item === value ? ' selected' : ''}>${esc(item)}</option>`).join('')}</select></label>`;
    return `<label>${esc(label)}<input name="${esc(name)}" type="${esc(type)}" value="${esc(value)}" required/></label>`;
  }

  const submitButton = (label, iconName = 'check') => `<button class="pf-primary" type="submit">${icon(iconName)}<span>${esc(label)}</span></button>`;

  function exportCsv(filename, headers, rows) {
    const quote = (v) => `"${String(v ?? '').replaceAll('"','""')}"`;
    const csv = [headers.map(quote).join(','), ...rows.map((row) => row.map(quote).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function buttonByText(text) {
    return qsa('.p7-head button').find((button) => button.textContent.trim().includes(text));
  }

  function filterRows(scope, predicate) {
    const rows = qsa('[data-search-row]', scope);
    let visible = 0;
    rows.forEach((row) => { const show = predicate(row); row.hidden = !show; if (show) visible += 1; });
    const empty = qs('[data-empty]', scope); if (empty) empty.hidden = visible !== 0;
    return visible;
  }

  function addControlStrip(target, html) {
    if (!target || target.querySelector('.pf-control-strip')) return;
    target.insertAdjacentHTML('afterbegin', `<div class="pf-control-strip">${html}</div>`);
    refreshIcons();
  }

  function setupOrganizations() {
    const grid = qs('.p7-org-grid');
    if (!grid) return;
    const sectionHead = grid.previousElementSibling;
    sectionHead?.insertAdjacentHTML('afterend', `<div class="pf-filterbar" data-pf-org-filters><label>${icon('search')}<input placeholder="Search workspace, owner or region" data-pf-org-search></label><select data-pf-org-plan><option value="">All plans</option><option>Enterprise</option><option>Business</option></select><select data-pf-org-region><option value="">All regions</option><option value="US">US</option><option value="EU">EU</option><option value="Global">Global</option></select></div>`);
    const apply = () => {
      const query = qs('[data-pf-org-search]')?.value.toLowerCase().trim() || '';
      const plan = qs('[data-pf-org-plan]')?.value || '';
      const region = qs('[data-pf-org-region]')?.value || '';
      qsa('.p7-org-card', grid).forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.hidden = Boolean((query && !text.includes(query)) || (plan && !text.includes(plan.toLowerCase())) || (region && !text.includes(region.toLowerCase())));
      });
    };
    qsa('[data-pf-org-filters] input,[data-pf-org-filters] select').forEach((el) => el.addEventListener('input', apply));

    buttonByText('Export posture')?.addEventListener('click', (event) => {
      event.stopImmediatePropagation();
      exportCsv('orvexa-workspace-posture.csv',['Workspace','ID','Plan','Region','Applications','Members','Requests','Spend','Isolation','Owner','Status'],data.organizations.map((x)=>[x.name,x.id,x.plan,x.region,x.apps,x.members,x.requests,x.spend,x.isolation,x.owner,x.status]));
      toast('Workspace posture exported');
    }, true);
    const newWorkspace = buttonByText('New workspace') || qs('[data-open-workspace-create]');
    newWorkspace?.addEventListener('click', (event) => {
      event.stopImmediatePropagation();
      openModal('Create workspace','Create an operational workspace under an existing customer/tenant boundary. Demo state only; no backend provisioning occurs.',`<form class="pf-form" data-pf-workspace>${formField('Customer / organization','customer','select',(window.Orvexa?.product?.monetize?.customers||[]).map((x)=>`${x.name} · ${x.organization}`))}${formField('Workspace name','name')}${formField('Workspace ID','workspace','text',[],'WS-NEW-PROD')}${formField('Processing boundary','region','select',['US','EU','US / EU','Global'])}${formField('Environment profile','environment','select',['Production','Staging','Development'])}${formField('Owner','owner')}${formField('Inherited plan','plan','select',['Starter','Professional','Business','Enterprise'])}${formField('Isolation policy','isolation','select',['Standard tenant isolation','Regional regulated isolation','Enterprise custom isolation'])}${formField('Applications','applications','select',['No applications yet','Support AI','AI Contact Center','Document Intelligence','Growth Assistant'])}<label class="pf-review-check"><input name="review" type="checkbox" required/><span>Review customer, region and isolation policy before creating the demo workspace.</span></label>${submitButton('Create workspace','plus')}</form>`);
    }, true);
    document.addEventListener('submit', (event) => {
      if (!event.target.matches('[data-pf-workspace]')) return;
      event.preventDefault();
      const fd = new FormData(event.target); const name = fd.get('name'); const workspace = fd.get('workspace'); const id = `TEN-${String(90 + qsa('.p7-org-card',grid).length).padStart(3,'0')}`;
      grid.insertAdjacentHTML('afterbegin', `<article class="p7-org-card"><button class="p7-org-card-main" type="button"><div class="p7-card-top"><span class="p7-avatar">${esc(String(name).split(' ').map(x=>x[0]).slice(0,2).join(''))}</span><span class="p7-status is-good"><i></i>Healthy</span></div><span class="p7-id">DEMO · ${id}</span><h3>${esc(name)}</h3><p>${esc(workspace)} · ${esc(fd.get('plan'))} · ${esc(fd.get('region'))}</p><dl><div><dt>Apps</dt><dd>0</dd></div><div><dt>Referenced users</dt><dd>0</dd></div><div><dt>Requests / 30D</dt><dd>0</dd></div><div><dt>AI cost / 30D</dt><dd>$0</dd></div></dl><div class="p7-health-reason"><span>Workspace health</span><b>Newly created demo workspace</b></div></button><footer><span>${esc(fd.get('owner'))}</span><b>100% posture</b></footer></article>`);
      closeModal(); toast(`${name} added to the workspace registry`); refreshIcons();
    });
  }

  function setupMembers() {
    const panel = qs('.p7-table-panel');
    const toolbar = qs('.p7-toolbar', panel);
    if (!panel || !toolbar) return;
    toolbar.insertAdjacentHTML('beforeend', `<div class="pf-inline-filters"><select data-pf-member-role><option value="">All roles</option>${['Platform Owner','AI Engineer','Operator','Security Admin','FinOps','Auditor'].map(x=>`<option>${x}</option>`).join('')}</select><select data-pf-member-scope><option value="">All scopes</option><option>Platform-wide</option><option>Workspace</option><option>Application</option><option>All customer workspaces</option></select><select data-pf-member-status><option value="">All states</option><option>Active</option><option>Pending</option><option>Suspended</option></select></div>`);
    const apply = () => {
      const query = qs('[data-filter]',panel)?.value.toLowerCase().trim() || '';
      const role = qs('[data-pf-member-role]')?.value.toLowerCase() || '';
      const scope = qs('[data-pf-member-scope]')?.value.toLowerCase() || '';
      const status = qs('[data-pf-member-status]')?.value.toLowerCase() || '';
      filterRows(panel,(row)=>{const t=row.textContent.toLowerCase();return(!query||t.includes(query))&&(!role||t.includes(role))&&(!scope||t.includes(scope))&&(!status||t.includes(status));});
    };
    qsa('input,select',toolbar).forEach(el=>el.addEventListener('input',apply));
    buttonByText('Export members')?.addEventListener('click',(event)=>{event.stopImmediatePropagation();exportCsv('orvexa-team-members.csv',['ID','Name','Email','Role','Access scope type','Access scope','Last active','MFA','Status'],data.members.map(x=>[x.id,x.name,x.email,x.role,x.scopeType,x.scopeLabel,x.last,x.mfa,x.status]));toast('Bundled member examples exported');},true);
    document.addEventListener('click',(event)=>{
      const row=event.target.closest('[data-open-member]'); if(!row)return;
      setTimeout(()=>{
        const body=qs('#p7-drawer-body'); if(!body||body.querySelector('[data-pf-member-actions]'))return;
        const member=data.members.find(x=>x.id===row.dataset.openMember); if(!member)return;
        body.insertAdjacentHTML('beforeend',`<div class="pf-action-grid" data-pf-member-actions><button data-pf-change-role="${member.id}">${icon('shield')}Change role</button><button data-pf-resend="${member.id}">${icon('send')}Resend invite</button><button data-pf-revoke-invite="${member.id}">${icon('mail-x')}Revoke invite</button></div>`);refreshIcons();
      },0);
    });
    document.addEventListener('click',(event)=>{
      const change=event.target.closest('[data-pf-change-role]');
      if(change){openModal('Change invitation role','Pending invitation changes remain auditable.',`<form class="pf-form" data-pf-role-change data-id="${change.dataset.pfChangeRole}">${formField('New role','role','select',['AI Engineer','Operator','Security Admin','FinOps','Auditor'])}${formField('Reason','reason')}${submitButton('Update invitation','shield-check')}</form>`);}
      const resend=event.target.closest('[data-pf-resend]'); if(resend)toast(`Invitation resent for ${resend.dataset.pfResend}`);
      const revoke=event.target.closest('[data-pf-revoke-invite]'); if(revoke)toast(`Invitation ${revoke.dataset.pfRevokeInvite} revoked`,'warn');
    });
    document.addEventListener('submit',(event)=>{if(!event.target.matches('[data-pf-role-change]'))return;event.preventDefault();const fd=new FormData(event.target);toast(`${event.target.dataset.id} invitation role changed to ${fd.get('role')}`);closeModal();});
    document.addEventListener('submit',(event)=>{if(!event.target.matches('[data-member-invite-form]'))return;event.preventDefault();const fd=new FormData(event.target);const email=String(fd.get('email')||'operator@example.com');const role=String(fd.get('role')||'Operator');const scope=String(fd.get('scope')||'WS-NOVA-PROD');const initials=email.split('@')[0].split(/[._-]/).map(x=>x[0]).slice(0,2).join('').toUpperCase();const tbody=qs('.p7-member-table tbody',panel);if(tbody)tbody.insertAdjacentHTML('beforeend',`<tr class="is-pending" data-search-row data-search="${esc(`${email} ${role} ${scope} pending`)}"><td><div class="p7-person"><span>${esc(initials)}</span><div><b>${esc(email.split('@')[0])}</b><small>${esc(email)}</small></div></div></td><td><span class="p7-role-chip is-auditor">${esc(role)}</span></td><td><span class="p7-scope-link is-static"><small>${esc(fd.get('scopeType'))}</small><b>${esc(scope)}</b></span></td><td>Invite sent now</td><td><div class="p7-mfa-cell"><b>Pending</b><small>${esc(fd.get('mfa'))}</small></div></td><td><span class="p7-status is-warn"><i></i>Pending</span></td><td><button class="p7-icon-btn" aria-label="Inspect pending invitation">${icon('mail-open')}</button></td></tr>`);qs('[data-close-drawer]')?.click();toast(`Invitation sent to ${email}`);refreshIcons();});
  }

  function setupMemberDetail() {
    document.addEventListener('click',(event)=>{
      const action=event.target.closest('[data-member-action]'); if(!action)return;
      const id=action.dataset.memberId; const member=data.members.find(x=>x.id===id); if(!member)return;
      if(action.dataset.memberAction==='edit-access') openModal('Edit member access','Review the new role and typed scope before applying it.',`<form class="pf-form" data-pf-member-access data-id="${id}">${formField('Role','role','select',['Platform Owner','AI Engineer','Operator','Security Admin','FinOps','Auditor'])}${formField('Scope type','scopeType','select',['Platform','Workspace group','Workspace','Application'])}${formField('Scope target','scope','select',['Platform-wide','All customer workspaces','WS-NOVA-PROD','APP-CONTACT-002','APP-GROWTH-004'])}${formField('Reason','reason')}${submitButton('Apply access change','shield-check')}</form>`);
      if(action.dataset.memberAction==='reset-mfa') openModal('Reset MFA','Resetting authentication factors is a sensitive action and requires explicit confirmation.',`<form class="pf-form" data-pf-member-mfa data-id="${id}"><label class="pf-review-check"><input required type="checkbox"/><span>I confirm the operator must re-enroll an approved MFA method.</span></label>${formField('Reason','reason')}${submitButton('Reset MFA','fingerprint')}</form>`);
      if(action.dataset.memberAction==='signout') openModal('Sign out other sessions','The current session remains active; other member sessions will be revoked in demo state.',`<form class="pf-form" data-pf-member-signout data-id="${id}"><label class="pf-review-check"><input required type="checkbox"/><span>Revoke all other sessions for ${esc(member.name)}.</span></label>${submitButton('Sign out other sessions','monitor-off')}</form>`);
      if(action.dataset.memberAction==='suspend') openModal('Suspend access','Suspension blocks future platform access until an authorized operator restores it.',`<form class="pf-form" data-pf-member-suspend data-id="${id}"><label class="pf-review-check"><input required type="checkbox"/><span>I confirm this access suspension.</span></label>${formField('Reason','reason')}${submitButton('Suspend access','user-x')}</form>`);
    });
    document.addEventListener('submit',(event)=>{if(!event.target.matches('[data-pf-member-access],[data-pf-member-mfa],[data-pf-member-signout],[data-pf-member-suspend]'))return;event.preventDefault();const label=event.target.matches('[data-pf-member-access]')?'Access change recorded':event.target.matches('[data-pf-member-mfa]')?'MFA reset recorded':event.target.matches('[data-pf-member-signout]')?'Other sessions revoked':'Access suspended in demo state';toast(label,event.target.matches('[data-pf-member-suspend]')?'warn':'good');closeModal();});
  }

  function setupEnvironments() {
    // Environment Compare is rendered by platform-pages.js so the configuration lifecycle,
    // review gate, clean Environment Detail route, and promotion state remain one source of truth.
    const compare = qs('[data-environment-compare]');
    if (!compare) return;
    buttonByText('Compare config')?.addEventListener('click',(event)=>{event.stopImmediatePropagation();compare.scrollIntoView({behavior:'smooth',block:'center'});},true);
  }

  function setupEnvironmentDetail() {
    // Environment Detail workflows are bound by the shared Platform renderer/drawer system.
    // Apply the shared workflow behavior to direct detail-page entry points.
  }

  function setupApiAccess() {
    const tablePanel = qs('.p7-table-panel');
    if (!tablePanel) return;
    const serviceGrid = qs('.p7-service-grid');
    serviceGrid?.insertAdjacentHTML('afterend', `<section class="pf-oauth-section"><div class="pf-card-head"><div><span class="pf-kicker">OAuth Clients</span><h2>Delegated application identities</h2><p>Client metadata, scopes and expiry without exposing client secrets.</p></div><button data-pf-oauth-create>${icon('plus')}Register OAuth client</button></div><div class="pf-oauth-grid">${(data.oauthClients||[]).map(x=>`<article data-oauth-client="${esc(x.id)}"><header><span class="p7-id">${esc(x.id)}</span><span class="p7-status is-${x.status==='Rotate'?'warn':'good'}"><i></i>${esc(x.status)}</span></header><h3>${esc(x.name)}</h3><p>${esc(x.owner)} / ${esc(x.environment)}</p><dl><div><dt>Scopes</dt><dd>${esc(x.scopes)}</dd></div><div><dt>Expires</dt><dd>${esc(x.expires)}</dd></div><div><dt>Last used</dt><dd>${esc(x.last)}</dd></div></dl></article>`).join('')}</div></section>`);
    buttonByText('Review dormant access')?.addEventListener('click',(event)=>{event.stopImmediatePropagation();qsa('tbody tr',tablePanel).forEach(row=>row.classList.toggle('pf-dim',!row.textContent.includes('2h ago')));toast('Dormant identity review filter applied');},true);
    buttonByText('Create identity')?.addEventListener('click',(event)=>{event.stopImmediatePropagation();openModal('Create machine identity','Register machine-identity metadata inside the selected workspace. Secret material is never persisted or re-displayed by this template.',`<form class="pf-form" data-pf-identity>${formField('Type','type','select',['API Key','Service Account','OAuth Client'])}${formField('Workspace','workspace','select',['WS-NOVA-PROD'])}${formField('Environment','environment','select',['Production','Staging','Development'])}${formField('Principal / name','name')}${formField('Application scope','application','select',['APP-SUPPORT-001','APP-CONTACT-002','APP-DOC-003','APP-GROWTH-004'])}${formField('Permissions / scopes','scopes')}${formField('Owner','owner')}${formField('Expiry / rotation policy','expires','select',['90 days','180 days','Managed'])}${formField('Approval requirement','approval','select',['Owner approval','1 reviewer','2 reviewers'])}${formField('Review note','review')}${submitButton('Create identity metadata','key-round')}</form>`);},true);
    document.addEventListener('click',(event)=>{if(event.target.closest('[data-pf-oauth-create]'))openModal('Register OAuth client','Define delegated identity metadata and scopes.',`<form class="pf-form" data-pf-oauth>${formField('Client name','name')}${formField('Owner','owner')}${formField('Scopes','scopes')}${formField('Environment','environment','select',['Production','Staging','Development'])}${submitButton('Register client','badge-plus')}</form>`);const row=event.target.closest('[data-open-credential]');if(row)setTimeout(()=>{const body=qs('#p7-drawer-body');if(body&&!body.querySelector('[data-pf-credential-actions]')){body.insertAdjacentHTML('beforeend',`<div class="pf-action-grid" data-pf-credential-actions><a href="identity-detail.html?identity=${encodeURIComponent(row.dataset.openCredential)}&workspace=WS-NOVA-PROD">${icon('scan-search')}Identity detail</a><a href="secrets-credentials.html?identity=${encodeURIComponent(row.dataset.openCredential)}&workspace=WS-NOVA-PROD">${icon('vault')}Secret reference</a><button data-pf-rotate-identity="${row.dataset.openCredential}">${icon('refresh-cw')}Plan rotation</button><button class="is-danger" data-pf-revoke-identity="${row.dataset.openCredential}">${icon('ban')}Disable</button></div>`);refreshIcons();}},0);if(event.target.closest('[data-pf-rotate-identity]'))toast('Rotation workflow opened; current value remains hidden');if(event.target.closest('[data-pf-revoke-identity]'))toast('Identity disabled in demo state','warn');const oauth=event.target.closest('[data-oauth-client]');if(oauth){const id=oauth.dataset.oauthClient;if(id==='OAUTH-MCP-07')location.href='integrations.html?workspace=WS-NOVA-PROD&oauth='+encodeURIComponent(id);else openModal('OAuth client detail','Delegated identity metadata; client secret values remain hidden.',`<div class="pf-detail-stack"><b>${esc(id)}</b><p>Open the connected integration or secret reference to manage lifecycle evidence.</p><div class="pf-action-grid"><a href="integrations.html?workspace=WS-NOVA-PROD&oauth=${encodeURIComponent(id)}">Integrations & Webhooks</a><a href="secrets-credentials.html?workspace=WS-NOVA-PROD&oauth=${encodeURIComponent(id)}">Secret reference</a></div></div>`);}});
    document.addEventListener('submit',(event)=>{if(!event.target.matches('[data-pf-identity],[data-pf-oauth]'))return;event.preventDefault();toast('Identity metadata registered');closeModal();});
  }


  function setupIdentityDetail() {
    document.addEventListener('click',(event)=>{const scope=event.target.closest('[data-open-identity-scope]');if(scope)openModal('Scope detail','Least-privilege capability boundary for this machine identity.',`<div class="pf-detail-stack"><b>Application-scoped capability</b><p>Production · read/write permission evidence · granted through an explicit policy reference.</p><div class="pf-action-grid"><a href="roles-audit.html?identity=${encodeURIComponent(scope.dataset.openIdentityScope)}">Open Roles & Audit</a></div></div>`);const rotate=event.target.closest('[data-identity-rotation]');if(rotate)openModal('Plan credential rotation','Secret values are never displayed. Rotation is scheduled against a managed secret reference.',`<form class="pf-form" data-pf-identity-rotation>${formField('Identity','identity','text',[],rotate.dataset.identityRotation)}${formField('Current secret reference','current')}${formField('New secret reference','next')}${formField('Grace period','grace','select',['15 minutes','1 hour','24 hours'])}${formField('Cutover time','cutover')}${formField('Dependent integrations','dependencies')}${formField('Owner','owner')}${submitButton('Schedule rotation','refresh-cw')}</form>`);});
    document.addEventListener('submit',(event)=>{if(!event.target.matches('[data-pf-identity-rotation]'))return;event.preventDefault();toast('Rotation plan scheduled; secret material remains sealed');closeModal();});
  }

  function setupIntegrations() {
    const panel = qsa('.p7-table-panel').at(-1);
    if (!panel) return;
    panel.insertAdjacentHTML('afterend', `<section class="pf-delivery-log" id="delivery-log"><div class="pf-card-head"><div><span class="pf-kicker">Delivery evidence</span><h2>Webhook attempts</h2><p>Inspect HTTP outcomes, retries, signing and dead-letter evidence without exposing sensitive payloads.</p></div><button data-open-test-delivery="INT-MSG-09">${icon('send')}Test delivery</button></div><div class="pf-delivery-list">${(data.webhookDeliveries||[]).map(x=>`<article data-delivery="${x.id}" data-delivery-detail="${x.id}" tabindex="0"><span class="p7-status is-${x.status==='Retry'?'warn':'good'}"><i></i>${esc(x.status)}</span><div><b>${esc(x.event)}</b><small>${esc(x.id)} → ${esc(x.target)} · ${esc(x.signing)}</small></div><code>${esc(x.http)}</code><span>${esc(x.duration)}</span><span>Attempt ${esc(x.attempt)}</span><time>${esc(x.time)}</time>${x.status==='Retry'?`<button data-pf-retry="${x.id}">${icon('rotate-cw')}Retry</button>`:''}</article>`).join('')}</div></section>`);
    document.addEventListener('click',(event)=>{const retry=event.target.closest('[data-pf-retry]');if(retry){event.stopPropagation();const row=retry.closest('[data-delivery]');row.querySelector('.p7-status').className='p7-status is-good';row.querySelector('.p7-status').innerHTML='<i></i>Delivered';retry.remove();toast(`${retry.dataset.pfRetry} redelivered successfully`);}});
  }

  function setupIntegrationDetail() {
    document.addEventListener('click',(event)=>{const contract=event.target.closest('[data-integration-event]');if(contract)openModal('Event contract','Schema-governed integration event.',`<div class="pf-detail-stack"><b>${esc(contract.dataset.integrationEvent)}</b><p>Direction, schema version and delivery ownership remain attached to the Integration Detail contract.</p><div class="pf-action-grid"><a href="integrations.html?workspace=WS-NOVA-PROD">Webhook delivery</a></div></div>`);});
  }

  function setupPrivacy() {
    const redactions = qs('.p7-redaction-grid')?.parentElement || main;
    redactions.insertAdjacentHTML('beforeend', `<section class="pf-dsr-section"><div class="pf-card-head"><div><span class="pf-kicker">Data subject requests</span><h2>Privacy request queue</h2><p>Track deletion, referenced-user export and data-use restrictions against buyer-configured operational due dates.</p></div><span class="p7-count">${(data.dataRequests||[]).length} open</span></div><div class="pf-dsr-table">${(data.dataRequests||[]).map(x=>`<article class="is-${x.status==='In review'?'review':x.status==='Queued'?'queued':'pending'}" data-dsr="${x.id}"><div><span class="p7-id">${esc(x.id)}</span><b>${esc(x.request)}</b><small>${esc(x.subject)} / ${esc(x.region)} / ${esc(x.scope)}</small></div><span>${esc(x.owner)}</span><strong>Operational due ${esc(x.due)}</strong><span class="p7-status is-warn"><i></i>${esc(x.status)}</span><button data-pf-dsr-review="${x.id}">${icon('arrow-up-right')}Review</button></article>`).join('')}</div></section>`);
    buttonByText('Export policy map')?.addEventListener('click',(event)=>{event.stopImmediatePropagation();exportCsv('orvexa-data-privacy-policy-map.csv',['Policy ID','Name','Value','Scope','Owner','Level','Status'],data.privacyPolicies.map(x=>[x.id,x.name,x.value,x.scope,x.owner,x.level,x.status]));toast('Privacy policy map exported');},true);
    buttonByText('New policy')?.addEventListener('click',(event)=>{event.stopImmediatePropagation();openModal('Create data policy','Configure governance intent; legal obligations remain buyer-defined.',`<form class="pf-form" data-pf-privacy-policy>${formField('Policy type','type','select',['Retention','Logging','Redaction','Residency','Consent','Data use'])}${formField('Policy name','name')}${formField('Scope','scope','select',['Platform defaults','Organization / tenant','Workspace','Application'])}${formField('Data classes','classes','select',['Public + Internal','Internal + Confidential','Confidential + Restricted','All governed classes'])}${formField('Rule / value','value')}${formField('Region / environment','region','select',['All approved regions','US East','EU West','APAC Southeast','Production only'])}${formField('Owner','owner')}${formField('Approval','approval','select',['Owner approval','Security review','2 reviewers'])}${formField('Effective date','effective','date')}<label class="pf-review-check"><input required type="checkbox"/><span>I reviewed policy scope, inheritance and enforcement impact.</span></label>${submitButton('Create policy','shield-plus')}</form>`);},true);
    qs('[data-policy-context]')?.addEventListener('change',(event)=>{const q=new URLSearchParams(location.search);q.set('policyScope',event.target.value);if(event.target.value==='workspace')q.set('workspace','WS-NOVA-PROD');else q.delete('workspace');location.search=q.toString();});
    document.addEventListener('click',(event)=>{const review=event.target.closest('[data-pf-dsr-review]');if(review){location.href=`privacy-request-detail.html?request=${encodeURIComponent(review.dataset.pfDsrReview)}&tab=overview`;return;}});
    document.addEventListener('submit',(event)=>{if(!event.target.matches('[data-pf-privacy-policy]'))return;event.preventDefault();toast('Privacy policy created in demo state');closeModal();});
  }

  function setupPrivacyRequestDetail() {
    document.addEventListener('click',(event)=>{const complete=event.target.closest('[data-pf-dsr-complete]');if(complete){toast(`${complete.dataset.pfDsrComplete} workflow completed in demo state`);return;}const extend=event.target.closest('[data-pf-dsr-extend]');if(extend){toast('Operational extension request recorded','warn');return;}});
  }

  function setupPolicyDetail() {
    document.addEventListener('submit',(event)=>{if(!event.target.matches('[data-policy-version-form]'))return;event.preventDefault();toast('Policy version draft created');closeModal();});
  }

  function setupSecrets() {
    const bindings = qs('.p7-binding-grid');
    bindings?.insertAdjacentHTML('afterend', `<section class="pf-rotation-log"><div class="pf-card-head"><div><span class="pf-kicker">Rotation history</span><h2>Recent credential rotations</h2><p>Human, automation and team actors remain distinguishable without retaining secret values.</p></div></div>${(data.secretRotations||[]).map(x=>`<article><span class="p7-id">${esc(x.id)}</span><b>${esc(x.secret)}</b><span>${esc(x.from)} → ${esc(x.to)}</span><span>${esc(x.actorType||'Actor')} · ${esc(x.actor)}</span><time>${esc(x.time)}</time><span class="p7-status is-good"><i></i>${esc(x.result)}</span></article>`).join('')}</section>`);
    buttonByText('View all rotations')?.addEventListener('click',(event)=>{event.stopImmediatePropagation();qs('.pf-rotation-log')?.scrollIntoView({behavior:'smooth'});},true);
    document.addEventListener('click',(event)=>{const row=event.target.closest('[data-open-secret]');if(row)setTimeout(()=>{const body=qs('#p7-drawer-body');if(body&&!body.querySelector('[data-pf-secret-actions]')){body.insertAdjacentHTML('beforeend',`<div class="pf-action-grid" data-pf-secret-actions><a href="secret-detail.html?secret=${encodeURIComponent(row.dataset.openSecret)}&workspace=WS-NOVA-PROD">${icon('scan-search')}Secret detail</a><a href="secret-detail.html?secret=${encodeURIComponent(row.dataset.openSecret)}&workspace=WS-NOVA-PROD&tab=lifecycle">${icon('refresh-cw')}Lifecycle / rotation</a><a href="roles-audit.html?secret=${encodeURIComponent(row.dataset.openSecret)}">${icon('scroll-text')}Audit evidence</a></div>`);refreshIcons();}},0);});
  }

  function setupSecurity() {
    const hero = qs('.p7-security-hero');
    const memberId = new URLSearchParams(location.search).get('member') || 'USR-001';
    const member = data.members.find((item)=>item.id===memberId) || data.members.find((item)=>item.id==='USR-001');
    const sessions = member.id==='USR-001' ? data.sessions : [];
    hero?.insertAdjacentHTML('afterend', `<section class="pf-security-methods"><article><span>${icon('fingerprint')}</span><div><b>Passkey</b><p>Phishing-resistant primary sign-in</p></div><strong>Active</strong></article><article><span>${icon('shield-check')}</span><div><b>Authenticator MFA</b><p>TOTP backup factor</p></div><strong>Active</strong></article><article><span>${icon('key-square')}</span><div><b>Recovery codes</b><p>8 unused recovery codes</p></div><button data-pf-recovery>Regenerate</button></article><article><span>${icon('monitor-off')}</span><div><b>Session control</b><p>Revoke every non-current session</p></div><button data-pf-signout-others>Sign out others</button></article></section>`);
    const report = qs('[data-security-report]') || buttonByText('Security report');
    report?.addEventListener('click',(event)=>{event.stopImmediatePropagation();openModal('Security report', 'Account-specific security evidence for the selected administrator.', `<div class="pf-detail-stack"><div class="pf-security-report-grid"><div><span>Security posture</span><b>${member.id==='USR-001'?'96 / 100':'94 / 100'}</b></div><div><span>Authentication</span><b>${esc(member.mfa)}</b></div><div><span>Active sessions</span><b>${member.id==='USR-001'?sessions.length:1}</b></div><div><span>Trusted devices</span><b>${member.id==='USR-001'?sessions.filter(x=>/trusted/i.test(x.trust)).length:1}</b></div><div><span>Privileged sessions</span><b>${member.id==='USR-001'?sessions.filter(x=>x.privilege==='Privileged').length:Number(Boolean(member.privileged))}</b></div><div><span>Recent risk</span><b>${member.id==='USR-001'?'1 blocked sign-in':'No recent block'}</b></div></div><div class="pf-action-grid"><button data-pf-export-security>${icon('download')}Export displayed evidence</button><a href="member-detail.html?member=${encodeURIComponent(member.id)}&tab=authentication">Member authentication</a></div></div>`);},true);
    const manage = qs('[data-manage-passkeys]') || buttonByText('Manage passkeys');
    manage?.addEventListener('click',(event)=>{event.stopImmediatePropagation();openModal('Manage passkeys','Registered authentication methods for the selected administrator. Changes are demo-only and confirmation gated.',`<div class="pf-detail-stack"><article class="pf-auth-method"><div><b>Security key</b><small>WebAuthn · registered yesterday · last used today</small></div><span class="p7-status is-good"><i></i>Active</span><div class="pf-action-grid"><button data-pf-passkey-rename>${icon('pencil')}Rename</button><button class="is-danger" data-pf-passkey-remove>${icon('trash-2')}Remove</button></div></article><article class="pf-auth-method"><div><b>Authenticator app</b><small>TOTP backup · recovery factor</small></div><span class="p7-status is-good"><i></i>Active</span></article><button data-pf-add-passkey>${icon('plus')}Add another passkey</button></div>`);},true);
    document.addEventListener('click',(event)=>{
      if(event.target.closest('[data-pf-export-security]')) { exportCsv('orvexa-account-security-report.csv',['Session','Device','Region','Example IP','Last active','Trust','Authentication','Privilege','Risk'],(data.sessions||[]).map(x=>[x.id,x.device,x.region,x.ip,x.last,x.trust,x.auth||'',x.privilege||'',x.risk||''])); toast('Displayed account security evidence exported'); closeModal(); }
      if(event.target.closest('[data-pf-add-passkey]')) openModal('Add another passkey','This demo records enrollment state only; it does not create a real WebAuthn credential.',`<form class="pf-form" data-pf-passkey>${formField('Passkey label','label','text',[],'Security key')}${formField('Verification','verification','select',['User verification required','Preferred'])}${submitButton('Register demo passkey','key-square')}</form>`);
      if(event.target.closest('[data-pf-passkey-rename]')) toast('Passkey label editor opened');
      if(event.target.closest('[data-pf-passkey-remove]')) openModal('Remove passkey','Re-authentication is required before removing a phishing-resistant factor.',`<form class="pf-form" data-pf-passkey-remove-form><label class="pf-review-check"><input required type="checkbox"/><span>I re-authenticated and reviewed the fallback authentication methods.</span></label>${submitButton('Remove passkey','trash-2')}</form>`);
      if(event.target.closest('[data-pf-recovery]')) openModal('Regenerate recovery codes','Previous recovery codes become invalid immediately after regeneration.',`<form class="pf-form" data-pf-recovery-form><label class="pf-review-check"><input required type="checkbox"/><span>I re-authenticated and understand that all previous recovery codes will be invalidated.</span></label>${submitButton('Regenerate masked demo codes','refresh-cw')}</form>`);
      if(event.target.closest('[data-pf-signout-others]')) openModal('Sign out other sessions','3 non-current sessions will be revoked. The current trusted session remains active.',`<div class="pf-detail-stack"><ul class="pf-session-confirm-list"><li><b>macOS 15 / Safari</b><span>New York, US</span></li><li><b>iPhone / Mobile Safari</b><span>London, UK</span></li><li><b>Ubuntu / Firefox</b><span>Amsterdam, NL</span></li></ul><form class="pf-form" data-pf-signout-form><label class="pf-review-check"><input required type="checkbox"/><span>I reviewed these sessions and want to revoke all three.</span></label>${submitButton('Sign out 3 sessions','log-out')}</form></div>`);
      if(event.target.closest('[data-security-score]')) openModal('Security posture 96 / 100','Account-specific posture derived from configured authentication and session evidence.',`<div class="pf-detail-stack"><ul class="pf-score-list"><li>Verified email <b>✓</b></li><li>Passkey <b>✓</b></li><li>Backup MFA <b>✓</b></li><li>Recovery codes <b>✓</b></li><li>Trusted-device hygiene <b>✓</b></li><li>1 device review pending <b>−4</b></li></ul></div>`);
    });
    document.addEventListener('submit',(event)=>{
      if(!event.target.matches('[data-pf-passkey],[data-pf-passkey-remove-form],[data-pf-recovery-form],[data-pf-signout-form]'))return;
      event.preventDefault();
      if(event.target.matches('[data-pf-passkey]')) toast('Demo passkey registration completed');
      if(event.target.matches('[data-pf-passkey-remove-form]')) toast('Passkey removed from demo state','warn');
      if(event.target.matches('[data-pf-recovery-form]')) toast('Recovery codes regenerated; previous codes invalidated','warn');
      if(event.target.matches('[data-pf-signout-form]')) { qsa('[data-revoke]:not([disabled])').forEach(button=>{button.disabled=true;button.textContent='Revoked';}); toast('3 non-current sessions revoked'); }
      closeModal();
    });
  }

  function setupSessionDetail() {
    document.addEventListener('click',(event)=>{
      const review=event.target.closest('[data-session-trust-review]');
      if(review){const id=review.dataset.sessionTrustReview;const session=data.sessions.find(x=>x.id===id);openModal(/review/i.test(session?.trust||'')?'Review device':'Mark device untrusted','Review the selected administrator device before changing trust state.',`<div class="pf-detail-stack"><b>${esc(session?.device||id)}</b><p>${esc(session?.region||'Member scoped')} · ${esc(session?.ip||'Managed example')} · last active ${esc(session?.last||'Unknown')}</p><div class="pf-action-grid">${/review/i.test(session?.trust||'')?`<button data-pf-trust-device="${esc(id)}">${icon('shield-check')}Trust device</button>`:''}<button class="is-danger" data-pf-revoke-session-modal="${esc(id)}">${icon('ban')}Revoke session</button></div></div>`);}
      const revoke=event.target.closest('[data-session-revoke-detail]');
      if(revoke&&!revoke.disabled) openModal('Revoke administrator session','This affects only the selected session and is recorded as security evidence.',`<form class="pf-form" data-pf-session-revoke-form><input type="hidden" name="session" value="${esc(revoke.dataset.sessionRevokeDetail)}"/><label class="pf-review-check"><input required type="checkbox"/><span>I reviewed the device and want to revoke this session.</span></label>${submitButton('Revoke session','ban')}</form>`);
      if(event.target.closest('[data-pf-trust-device]')){toast('Device marked trusted in demo state');closeModal();}
      if(event.target.closest('[data-pf-revoke-session-modal]')){toast('Session revoke confirmation opened','warn');closeModal();}
    });
    document.addEventListener('submit',(event)=>{if(!event.target.matches('[data-pf-session-revoke-form]'))return;event.preventDefault();toast('Administrator session revoked in demo state','warn');closeModal();});
  }

  function setupRolesAudit() {
    const roleGrid = qs('.p7-role-grid');
    const permission = qs('.p7-permission-panel');
    const audit = qs('.p7-audit-layout');
    if (!roleGrid || !permission || !audit) return;
    roleGrid.insertAdjacentHTML('beforebegin', `<div class="pf-tabs" role="tablist"><button class="is-active" data-pf-role-tab="roles">Roles</button><button data-pf-role-tab="permissions">Permissions</button><button data-pf-role-tab="audit">Audit Log</button></div><div class="pf-sod-warning">${icon('triangle-alert')}<div><b>Separation of duties</b><p>Security Admin can approve tool access while Platform Owner can manage billing and production ownership. Review combined assignments before privileged changes.</p></div></div>`);
    roleGrid.dataset.pfSection='roles'; permission.dataset.pfSection='permissions'; audit.dataset.pfSection='audit';
    const show = (key) => { qsa('[data-pf-section]').forEach(section=>section.hidden=section.dataset.pfSection!==key); qsa('[data-pf-role-tab]').forEach(button=>button.classList.toggle('is-active',button.dataset.pfRoleTab===key)); };
    show('roles');
    qsa('[data-pf-role-tab]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.pfRoleTab)));
    buttonByText('Export evidence')?.addEventListener('click',(event)=>{event.stopImmediatePropagation();exportCsv('orvexa-audit-log.csv',['ID','Actor','Action','Target','Before','After','IP','Time','Risk'],data.audit.map(x=>[x.id,x.actor,x.action,x.target,x.before,x.after,x.ip,x.time,x.risk]));toast('Audit evidence exported');},true);
    buttonByText('Assign role')?.addEventListener('click',(event)=>{event.stopImmediatePropagation();openModal('Assign role','Role assignments are demo state and should be authorized by the buyer backend.',`<form class="pf-form" data-pf-role-assign>${formField('Member','member','select',data.members.filter(x=>x.status==='Active').map(x=>x.name))}${formField('Role','role','select',data.roles.map(x=>x.name))}${formField('Scope','scope','select',['Nova Intelligence','All workspaces','Production AI'])}${formField('Reason','reason')}${submitButton('Assign role','user-check')}</form>`);},true);
    roleGrid.insertAdjacentHTML('afterend', `<div class="pf-role-actions"><button data-pf-create-role>${icon('plus')}Create role</button><button data-pf-clone-role>${icon('copy')}Clone selected role</button></div>`);
    document.addEventListener('click',(event)=>{if(event.target.closest('[data-pf-create-role]'))openModal('Create custom role','Build a reusable administrative role from explicit capabilities.',`<form class="pf-form" data-pf-create-role-form>${formField('Role name','name')}${formField('Base role','base','select',data.roles.map(x=>x.name))}${formField('Scope','scope','select',['Workspace','Organization','Environment'])}${submitButton('Create role','shield-plus')}</form>`);if(event.target.closest('[data-pf-clone-role]'))toast('Selected role cloned into a draft');});
    document.addEventListener('submit',(event)=>{if(!event.target.matches('[data-pf-role-assign],[data-pf-create-role-form]'))return;event.preventDefault();toast(event.target.matches('[data-pf-role-assign]')?'Role assignment recorded':'Custom role draft created');closeModal();});
  }

  function applyCommonEnhancements() {
    main.dataset.platformQa = 'phase10';
    const subtitleMap = {
      'workspaces-tenants':'Operate multi-tenant AI deployments with clear isolation and ownership.',
      'team-members':'Manage platform operator identities, scoped access, invitations and strong administrator identity posture.',
      'member-detail':'Inspect one operator identity across access scope, authentication, sessions and audit evidence.',
      'environments':'Compare workspace configuration across development, staging and production without duplicating AI release experiments.',
      'environment-detail':'Inspect one workspace environment across applications, configuration, promotion history, access and audit evidence.',
      'api-access':'Govern API keys, service accounts and OAuth clients without exposing secret material.',
      'integrations':'Operate directional integration contracts and verify webhook delivery, retries, signing and dead-letter posture.',
      'integration-detail':'Inspect one integration contract across connection, events, delivery retries, policies and audit evidence.',
      'data-privacy':'Control classification, policy inheritance, redaction, residency and data-rights workflows.',
      'policy-detail':'Inspect one governance policy across inheritance, rules, enforcement, evidence and version history.',
      'privacy-request-detail':'Inspect one referenced-user privacy request across record scope, workflow, linked evidence and audit history.',
      'secrets-credentials':'Rotate and govern credential references with least-privilege scopes and audit evidence.',
      'security-sessions':'Inspect one administrator account across strong authentication, device trust, sessions and risk evidence.',
      'session-detail':'Inspect one administrator session across device, authentication, privilege, trust, risk and audit evidence.',
      'roles-audit':'Define administrative authority, separation of duties and immutable audit evidence.'
    };
    const subtitle=qs('.p7-head p'); if(subtitle&&subtitleMap[page]) subtitle.textContent=subtitleMap[page];
    const memberParam = new URLSearchParams(location.search).get('member');
    if (memberParam && !['team-members','member-detail'].includes(page)) {
      const member = data.members.find((item)=>item.id===memberParam);
      const headEl = qs('.p7-head');
      if (member && headEl && !qs('[data-member-context]')) headEl.insertAdjacentHTML('afterend', `<aside class="pf-workspace-context" data-member-context><div><span>${icon('user-round-check')}</span><div><small>Member context</small><b>${esc(member.name)} · ${esc(member.id)}</b><p>${esc(member.role)} · ${esc(member.scopeLabel)}</p></div></div><div><a href="member-detail.html?member=${encodeURIComponent(member.id)}">Open member</a><a href="team-members.html">Team & Members</a></div></aside>`);
    }
    const contextParams = new URLSearchParams(location.search);
    const workspaceParam = contextParams.get('workspace');
    const environmentParam = contextParams.get('environment');
    if (workspaceParam && !['workspaces-tenants','workspace-detail','environment-detail'].includes(page)) {
      const org = data.organizations.find((item)=>item.workspace===workspaceParam);
      const env = data.environments.find((item)=>item.id===environmentParam);
      const headEl = qs('.p7-head');
      if (org && headEl && !qs('[data-workspace-context]')) headEl.insertAdjacentHTML('afterend', `<aside class="pf-workspace-context" data-workspace-context><div><span>${icon('layers-3')}</span><div><small>${env?'Workspace / environment context':'Workspace context'}</small><b>${esc(org.workspace)}${env?` · ${esc(env.id)}`:''}</b><p>${esc(org.name)} · ${esc(org.id)} · ${esc(org.region)}${env?` · ${esc(env.name)}`:''}</p></div></div><div><a href="workspace-detail.html?workspace=${encodeURIComponent(org.workspace)}">Open workspace</a>${env?`<a href="environment-detail.html?workspace=${encodeURIComponent(org.workspace)}&environment=${encodeURIComponent(env.id)}">Environment</a>`:`<a href="customer-detail.html?customer=${encodeURIComponent(org.customerId)}">Customer</a>`}</div></aside>`);
    }
    qsa('.p7-table th').forEach((th) => th.setAttribute('scope','col'));
    qsa('.p7-table tbody tr[data-search-row]').forEach((row) => { row.tabIndex = 0; row.setAttribute('role','button'); });
    main.addEventListener('keydown',(event)=>{const row=event.target.closest('tr[role="button"]');if(row&&(event.key==='Enter'||event.key===' ')){event.preventDefault();row.click();}});
  }

  const setups = {
    'workspaces-tenants': setupOrganizations,
    'team-members': setupMembers,
    'member-detail': setupMemberDetail,
    'environments': setupEnvironments,
    'api-access': setupApiAccess,
    'identity-detail': setupIdentityDetail,
    'integrations': setupIntegrations,
    'integration-detail': setupIntegrationDetail,
    'data-privacy': setupPrivacy,
    'policy-detail': setupPolicyDetail,
    'privacy-request-detail': setupPrivacyRequestDetail,
    'secrets-credentials': setupSecrets,
    'security-sessions': setupSecurity,
    'session-detail': setupSessionDetail,
    'roles-audit': setupRolesAudit,
  };

  ensureModal();
  applyCommonEnhancements();
  setups[page]?.();
  refreshIcons();

  document.addEventListener('click',(event)=>{if(event.target.closest('[data-pf-close]')||event.target.id==='pf-modal-backdrop')closeModal();});
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape')closeModal();});
})();
