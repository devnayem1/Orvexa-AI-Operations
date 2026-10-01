(() => {
  'use strict';

  const product = window.Orvexa?.product;
  const data = product?.monetize;
  const page = document.body.dataset.monetizePage || document.body.dataset.activePage;
  if (!data || !page) return;

  const icon = (name) => `<i data-lucide="${name}"></i>`;
  const showToast = (message, glyph='circle-check') => window.showToast?.(message, glyph);
  const qs = (selector, root=document) => root.querySelector(selector);
  const qsa = (selector, root=document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const customerById = (id) => data.customers.find((item) => item.id === id);
  const usageByCustomer = (id) => data.usageCredits.find((item) => item.customer === id);
  const subscriptionByCustomer = (id) => data.subscriptions.find((item) => item.customer === id);
  const planById = (id) => data.plans.find((item) => item.id === id);
  const entitlementByKey = (key) => data.entitlements.find((item) => item.key === key);
  const subscriptionById = (id) => data.subscriptions.find((item) => item.id === id);
  const invoiceById = (id) => data.invoices.find((item) => item.id === id);
  const paymentById = (id) => data.payments.find((item) => item.id === id);
  const trialById = (id) => data.trials.find((item) => item.id === id);
  const creditById = (id) => data.credits.find((item) => item.id === id);
  const meterUnitById = (id) => (data.billableUnits || []).find((item) => item.id === id);
  const meterEventById = (id) => (data.meterEvents || []).find((item) => item.id === id);

  function filterRows(rows, predicate, empty) {
    let visible = 0;
    rows.forEach((row) => {
      const show = predicate(row);
      row.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  }

  function makeModal() {
    if (qs('#m10-modal')) return qs('#m10-modal');
    const modal = document.createElement('div');
    modal.id = 'm10-modal';
    modal.className = 'm10-modal';
    modal.hidden = true;
    modal.innerHTML = `<div class="m10-modal-backdrop" data-m10-close></div><section class="m10-modal-card" role="dialog" aria-modal="true" aria-labelledby="m10-modal-title"><header><div><small id="m10-modal-kicker">Monetize</small><h2 id="m10-modal-title">Action</h2></div><button class="m10-icon-btn" type="button" data-m10-close aria-label="Close">${icon('x')}</button></header><div id="m10-modal-body"></div></section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (event) => { if (event.target.closest('[data-m10-close]')) closeModal(); });
    return modal;
  }
  function openModal(title, body, kicker='Monetize') {
    const modal = makeModal();
    qs('#m10-modal-title', modal).textContent = title;
    qs('#m10-modal-kicker', modal).textContent = kicker;
    qs('#m10-modal-body', modal).innerHTML = body;
    modal.hidden = false;
    document.body.classList.add('overflow-hidden');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    window.lucide?.createIcons({ attrs: { 'stroke-width': 1.8 } });
  }
  function closeModal() {
    const modal = qs('#m10-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    if (!qs('#m10-drawer')?.classList.contains('is-open')) document.body.classList.remove('overflow-hidden');
    setTimeout(() => { modal.hidden = true; }, 180);
  }

  function makeDrawer() {
    if (qs('#m10-drawer')) return qs('#m10-drawer');
    const drawer = document.createElement('div');
    drawer.id = 'm10-drawer';
    drawer.className = 'm10-drawer';
    drawer.hidden = true;
    drawer.innerHTML = `<div class="m10-drawer-backdrop" data-m10-drawer-close></div><aside class="m10-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="m10-drawer-title"><header><div><small id="m10-drawer-kicker">Customer lifecycle</small><h2 id="m10-drawer-title">Action</h2><p id="m10-drawer-copy"></p></div><button class="m10-icon-btn" type="button" data-m10-drawer-close aria-label="Close">${icon('x')}</button></header><div class="m10-drawer-body" id="m10-drawer-body"></div></aside>`;
    document.body.appendChild(drawer);
    drawer.addEventListener('click', (event) => { if (event.target.closest('[data-m10-drawer-close]')) closeDrawer(); });
    return drawer;
  }
  function openDrawer(title, copy, body, kicker='Customer lifecycle') {
    const drawer = makeDrawer();
    qs('#m10-drawer-title', drawer).textContent = title;
    qs('#m10-drawer-copy', drawer).textContent = copy || '';
    qs('#m10-drawer-kicker', drawer).textContent = kicker;
    qs('#m10-drawer-body', drawer).innerHTML = body;
    drawer.hidden = false;
    document.body.classList.add('overflow-hidden');
    requestAnimationFrame(() => drawer.classList.add('is-open'));
    window.lucide?.createIcons({ attrs: { 'stroke-width': 1.8 } });
  }
  function closeDrawer() {
    const drawer = qs('#m10-drawer');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    if (!qs('#m10-modal')?.classList.contains('is-open')) document.body.classList.remove('overflow-hidden');
    setTimeout(() => { drawer.hidden = true; }, 200);
  }

  const plansOptions = (selected='Business') => data.plans.map((plan) => `<option ${plan.name===selected?'selected':''}>${esc(plan.name)}</option>`).join('');
  const renewalIso = (value='') => { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0,10); };
  function customerForm(customer=null) {
    const edit = Boolean(customer);
    return `<form class="m10-form m10-customer-form" data-m10-customer-form>
      <div class="m10-form-grid two"><label>Customer name<input name="name" required value="${edit?esc(customer.name):''}" placeholder="Example AI Company"></label><label>Commercial owner<input name="owner" required value="${edit?esc(customer.owner):''}" placeholder="Account owner"></label></div>
      <div class="m10-form-grid two"><label>Organization / tenant ID<input name="organization" required value="${edit?esc(customer.organization):''}" placeholder="TEN-000"></label><label>Workspace ID<input name="workspace" required value="${edit?esc(customer.workspace):''}" placeholder="WS-CUSTOMER-PROD"></label></div>
      <div class="m10-form-grid two"><label>Plan<select name="plan">${plansOptions(edit?customer.plan:'Business')}</select></label><label>Region<select name="region"><option ${edit&&customer.region==='US'?'selected':''}>US</option><option ${edit&&customer.region==='EU'?'selected':''}>EU</option><option ${edit&&customer.region==='US / EU'?'selected':''}>US / EU</option><option ${edit&&customer.region==='Global'?'selected':''}>Global</option></select></label></div>
      <div class="m10-form-grid two"><label>Renewal date<input name="renewal" type="date" value="${edit?renewalIso(customer.renewal):''}"></label><label>Account health<select name="health"><option ${edit&&customer.health==='Healthy'?'selected':''}>Healthy</option><option ${edit&&customer.health==='Watch'?'selected':''}>Watch</option><option ${edit&&customer.health==='Review'?'selected':''}>Review</option></select></label></div>
      <label>Operator note<textarea name="note" rows="3" placeholder="Why this account is being created or changed"></textarea></label>
      <div class="m10-review-note">${icon('shield-check')}<span><b>Commercial boundary</b><small>This demo records customer lifecycle configuration only; it does not provision a real tenant or charge a payment method.</small></span></div>
      <div class="m10-form-actions"><button class="m10-btn" type="button" data-m10-drawer-close>Cancel</button><button class="m10-btn" type="submit" data-save-mode="draft">Save draft</button><button class="m10-btn is-primary" type="submit" data-save-mode="${edit?'apply':'create'}">${icon(edit?'save':'user-plus')}<span>${edit?'Apply changes':'Create customer'}</span></button></div>
    </form>`;
  }

  function bindCustomerForm(customer=null) {
    const form = qs('[data-m10-customer-form]');
    if (!form) return;
    qsa('button[type="submit"]', form).forEach((button) => button.addEventListener('click', () => { form.dataset.submitMode = button.dataset.saveMode || 'draft'; }));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const mode = form.dataset.submitMode || 'draft';
      const label = customer?.name || qs('[name="name"]', form)?.value || 'Customer';
      showToast(mode === 'draft' ? `${label} customer draft saved` : customer ? `${label} customer changes applied` : `${label} customer demo created`, mode === 'draft' ? 'save' : 'circle-check');
      closeDrawer();
    });
  }

  function planForm(plan=null) {
    const edit = Boolean(plan);
    const value = (key, fallback='') => edit ? esc(plan[key] ?? fallback) : fallback;
    return `<form class="m10-form m10-plan-form" data-m10-plan-form>
      <div class="m10-workflow-steps"><span class="active">Basics</span><span>Pricing</span><span>Usage</span><span>Features</span><span>Overage</span><span>Review</span></div>
      <section class="m10-form-section"><div class="m10-form-section-head"><b>Basics</b><small>Commercial package identity and lifecycle.</small></div><div class="m10-form-grid two"><label>Plan name<input name="name" required value="${value('name')}" placeholder="Growth"></label><label>Plan code<input name="id" required value="${value('id','PLAN-GROWTH')}" placeholder="PLAN-GROWTH"></label></div><div class="m10-form-grid two"><label>Lifecycle<select name="state"><option ${edit&&plan.state==='Public'?'selected':''}>Public</option><option ${edit&&plan.state==='Popular'?'selected':''}>Popular</option><option ${edit&&plan.state==='Contract'?'selected':''}>Contract</option><option>Draft</option></select></label><label>Support tier<input name="support" value="${value('support','Priority')}" placeholder="Priority"></label></div></section>
      <section class="m10-form-section"><div class="m10-form-section-head"><b>Pricing</b><small>List or negotiated recurring price.</small></div><div class="m10-form-grid two"><label>Monthly price<input name="monthly" value="${value('monthly','$1,499')}" placeholder="$1,499"></label><label>Annual price<input name="yearly" value="${value('yearly','$14,990')}" placeholder="$14,990"></label></div></section>
      <section class="m10-form-section"><div class="m10-form-section-head"><b>Included monthly usage</b><small>Commercial allowances reset on the billing cycle unless contract terms override them.</small></div><div class="m10-form-grid two"><label>AI credits<input name="credits" value="${value('credits','6M')}"></label><label>Requests<input name="requests" value="${value('requests','750K')}"></label><label>Agent runs<input name="agentRuns" value="${value('agentRuns','30K')}"></label><label>Voice minutes<input name="voice" value="${value('voice','5K min')}"></label></div></section>
      <section class="m10-form-section"><div class="m10-form-section-head"><b>Workspace & features</b><small>Capacity and baseline access packaged with the plan.</small></div><div class="m10-form-grid two"><label>Team members<input name="members" value="${value('members','50')}"></label><label>Knowledge storage<input name="storage" value="${value('storage','50 GB')}"></label><label>Production environments<input name="environments" value="${value('environments','2')}"></label><label>API access<input name="api" value="${value('api','Full')}"></label></div></section>
      <section class="m10-form-section"><div class="m10-form-section-head"><b>Overage</b><small>Customer billable usage above included commercial allowance.</small></div><label>Overage policy<input name="overage" value="${value('overage','$0.00027 / credit')}"></label></section>
      <div class="m10-review-note">${icon('shield-check')}<span><b>Review boundary</b><small>Plan changes are demo configuration only. Runtime RPM/TPM protection remains owned by Rate Limits & Quotas.</small></span></div>
      <div class="m10-form-actions"><button class="m10-btn" type="button" data-m10-drawer-close>Cancel</button><button class="m10-btn" type="submit" data-plan-save="draft">Save draft</button><button class="m10-btn is-primary" type="submit" data-plan-save="${edit?'apply':'create'}">${icon(edit?'save':'layers-3')}<span>${edit?'Apply plan changes':'Create plan'}</span></button></div>
    </form>`;
  }
  function bindPlanForm(plan=null) {
    const form = qs('[data-m10-plan-form]'); if (!form) return;
    qsa('button[type="submit"]', form).forEach((button) => button.addEventListener('click', () => { form.dataset.submitMode = button.dataset.planSave || 'draft'; }));
    form.addEventListener('submit', (event) => { event.preventDefault(); const mode=form.dataset.submitMode||'draft'; const label=plan?.name||qs('[name="name"]',form)?.value||'Plan'; showToast(mode==='draft'?`${label} plan draft saved`:plan?`${label} plan changes applied`:`${label} demo plan created`,mode==='draft'?'save':'circle-check'); closeDrawer(); });
  }
  function entitlementForm(item=null, planName='Business') {
    const plans = ['Starter','Professional','Business','Enterprise'];
    const affected = data.customers.filter((customer) => customer.plan === planName).length;
    return `<form class="m10-form" data-m10-entitlement-form><div class="m10-form-grid two"><label>Capability name<input name="feature" required value="${esc(item?.feature||'')}" placeholder="Capability name"></label><label>Code<input name="key" required value="${esc(item?.key||'FEATURE-CODE')}" placeholder="FEATURE-CODE"></label></div><div class="m10-form-grid two"><label>Category<select name="category">${['Model','Agents','MCP','Review','Environment','Identity','Region','Support'].map((x)=>`<option ${item?.category===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Value type<select name="valueType">${['Boolean','Numeric limit','Selection','Add-on'].map((x)=>`<option ${item?.valueType===x?'selected':''}>${x}</option>`).join('')}</select></label></div><label>Description<textarea name="description" rows="3" placeholder="What commercial access does this entitlement govern?">${esc(item?.description||'')}</textarea></label><label>Runtime mapping<input name="runtimeMapping" value="${esc(item?.runtimeMapping||'')}" placeholder="Tools & MCP / Human Review / Data & Privacy"></label><div class="m10-entitlement-plan-grid">${plans.map((plan)=>`<label><span>${plan}</span><input name="${plan}" value="${esc(item?.[plan]||(plan===planName?'Included':'No'))}"></label>`).join('')}</div>${item?`<div class="m10-review-note">${icon('users')}<span><b>${affected} affected ${planName} customer${affected===1?'':'s'}</b><small>Editing a published entitlement should be versioned before customer migration.</small></span></div>`:''}<div class="m10-form-actions"><button class="m10-btn" type="button" data-m10-drawer-close>Cancel</button><button class="m10-btn" type="submit">Save entitlement</button><button class="m10-btn is-primary" type="submit">${icon('shield-check')}<span>${item?'Apply demo change':'Create entitlement'}</span></button></div></form>`;
  }
  function bindEntitlementForm(item=null) { const form=qs('[data-m10-entitlement-form]'); if(!form)return; form.addEventListener('submit',(event)=>{event.preventDefault();showToast(`${item?.feature||'Entitlement'} demo configuration saved`,'shield-check');closeDrawer();}); }
  function openEntitlementDetail(key, planName='Business') {
    const item=entitlementByKey(key); if(!item)return; const plan=data.plans.find((x)=>x.name===planName)||data.plans[0]; const affected=data.customers.filter((customer)=>customer.plan===planName).length;
    openDrawer(`${item.feature} entitlement`,'Inspect one commercial feature gate without confusing it with runtime inventory or capacity.',`<div class="m10-inspector m10-drawer-facts"><div><small>Plan</small><b>${esc(planName)}</b></div><div><small>Current entitlement</small><b>${esc(item[planName]||'Custom')}</b></div><div><small>Capability</small><b>${esc(item.key)}</b></div><div><small>Value type</small><b>${esc(item.valueType||'Selection')}</b></div><div><small>Runtime mapping</small><b>${esc(item.runtimeMapping||'—')}</b></div><div><small>Customers affected</small><b>${affected}</b></div></div><div class="m10-review-note">${icon('info')}<span><b>${esc(item.category||'Capability')} boundary</b><small>${esc(item.description||'Commercial entitlement for this plan.')}</small></span></div><div class="m10-form-actions"><a class="m10-btn" href="plan-detail.html?plan=${encodeURIComponent(plan.id)}&tab=customers">View affected customers</a><button class="m10-btn is-primary" type="button" data-m10-edit-entitlement="${esc(item.key)}" data-plan-name="${esc(planName)}">${icon('square-pen')}Edit entitlement</button></div>`,`${planName} / ${item.key}`);
    qs('[data-m10-edit-entitlement]')?.addEventListener('click',()=>{openDrawer(`Edit ${item.feature}`,`Update the ${planName} entitlement value and review affected customers.`,entitlementForm(item,planName),'Commercial entitlement');bindEntitlementForm(item);});
  }
  function openPlanAction(action, planId) {
    const plan=planById(planId); if(!plan)return;
    if(action==='edit-plan'){openDrawer(`Edit ${plan.name}`,'Update pricing, monthly allowances, workspace limits, support, and overage in one governed plan workflow.',planForm(plan),`${plan.id} / Edit plan`);bindPlanForm(plan);return;}
    if(action==='edit-limits') openDrawer(`${plan.name} usage limits`,'Edit included monthly commercial allowances; runtime protection remains a separate control.',`<form class="m10-form" data-m10-plan-mini-form><div class="m10-form-grid two"><label>AI credits<input value="${esc(plan.credits)}"></label><label>Requests<input value="${esc(plan.requests)}"></label><label>Agent runs<input value="${esc(plan.agentRuns)}"></label><label>Voice minutes<input value="${esc(plan.voice)}"></label><label>Team members<input value="${esc(plan.members)}"></label><label>Knowledge<input value="${esc(plan.storage)}"></label></div><label>Change reason<textarea rows="3" placeholder="Why the included allowance is changing"></textarea></label><div class="m10-review-note">${icon('gauge')}<span><b>Runtime quotas are separate</b><small>Changing commercial allowance does not automatically change RPM, TPM, burst, throttle, or hard-stop policy.</small></span></div><div class="m10-form-actions"><a class="m10-btn" href="rate-limits-quotas.html">Open runtime quotas</a><button class="m10-btn is-primary" type="submit">${icon('save')}Save limit draft</button></div></form>`,`${plan.id} / Usage Limits`);
    else if(action==='edit-entitlement') openDrawer(`${plan.name} entitlement`,'Choose a capability and prepare a plan-scoped entitlement change.',`<form class="m10-form" data-m10-plan-mini-form><label>Capability<select>${data.entitlements.map((item)=>`<option>${esc(item.feature)} · ${esc(item[plan.name]||'Custom')}</option>`).join('')}</select></label><label>New value<input placeholder="Enter plan entitlement value"></label><label>Change reason<textarea rows="3" placeholder="Why access is changing"></textarea></label><div class="m10-form-actions"><button class="m10-btn is-primary" type="submit">${icon('shield-check')}Save entitlement draft</button></div></form>`,`${plan.id} / Entitlements`);
    else if(action==='edit-pricing') openDrawer(`${plan.name} pricing`,'Change commercial list or negotiated pricing without changing internal AI provider cost.',`<form class="m10-form" data-m10-plan-mini-form><div class="m10-form-grid two"><label>Monthly price<input value="${esc(plan.monthly)}"></label><label>Annual price<input value="${esc(plan.yearly)}"></label></div><label>Overage policy<input value="${esc(plan.overage)}"></label><label>Pricing reason<textarea rows="3" placeholder="Commercial pricing decision"></textarea></label><div class="m10-form-actions"><a class="m10-btn" href="subscriptions-billing.html">Open Billing</a><button class="m10-btn is-primary" type="submit">${icon('save')}Save pricing draft</button></div></form>`,`${plan.id} / Pricing`);
    else if(action==='new-version') openDrawer(`Create ${plan.name} version`,'Stage a governed commercial package version with an effective date and migration intent.',`<form class="m10-form" data-m10-plan-mini-form><div class="m10-form-grid two"><label>Version<input value="Next version"></label><label>Effective date<input type="date"></label></div><label>Migration<select><option>New customers only</option><option>At renewal</option><option>Selected customers</option><option>All customers after review</option></select></label><label>Change summary<textarea rows="4" placeholder="Pricing, limit or entitlement changes in this version"></textarea></label><div class="m10-review-note">${icon('history')}<span><b>Published history remains intact</b><small>Existing customer evidence is not silently rewritten by a new plan version.</small></span></div><div class="m10-form-actions"><a class="m10-btn" href="roles-audit.html">Open Roles & Audit</a><button class="m10-btn is-primary" type="submit">${icon('git-branch-plus')}Create version draft</button></div></form>`,`${plan.id} / Versioning`);
    const form=qs('[data-m10-plan-mini-form]'); form?.addEventListener('submit',(event)=>{event.preventDefault();showToast(`${plan.name} ${action.replace(/-/g,' ')} draft saved`,'circle-check');closeDrawer();});
  }

  function customerFacts(customer) {
    return `<div class="m10-inspector m10-drawer-facts"><div><small>Customer ID</small><b>${esc(customer.id)}</b></div><div><small>Workspace</small><b>${esc(customer.workspace)}</b></div><div><small>Plan / MRR</small><b>${esc(customer.plan)} · ${esc(customer.mrr)}</b></div><div><small>Renewal</small><b>${esc(customer.renewal)}</b></div></div>`;
  }

  function openCustomerAction(action, customerId) {
    const customer = customerById(customerId);
    if (!customer) return;
    const usage = usageByCustomer(customer.id);
    const sub = subscriptionByCustomer(customer.id);
    if (action === 'edit') {
      openDrawer(`Edit ${customer.name}`, 'Update customer hierarchy, plan context, owner, renewal, and account health.', customerForm(customer), customer.id);
      bindCustomerForm(customer);
      return;
    }
    if (action === 'payment') {
      const invoice = data.invoices.find((item) => item.customer === customer.name && item.state === 'Past Due') || data.invoices.find((item) => item.customer === customer.name);
      const payment = data.payments.find((item) => item.customer === customer.name && item.state === 'Failed') || data.payments.find((item) => item.customer === customer.name);
      openDrawer(`${customer.name} payment follow-up`, 'Review collection evidence before retrying or opening the billing ledger.', `${customerFacts(customer)}<div class="m10-decision-card is-danger">${icon('credit-card')}<span><b>${esc(invoice?.id || 'No past-due invoice')}</b><small>${esc(invoice?.amount || sub?.amount || customer.mrr)} · ${esc(invoice?.state || customer.payment)} · ${esc(payment?.id || 'No failed attempt')}</small></span></div><div class="m10-inspector"><div><small>Subscription</small><b>${esc(sub?.id || '—')}</b></div><div><small>Payment attempt</small><b>${esc(payment?.state || customer.payment)}</b></div><div><small>Retry evidence</small><b>${esc(payment?.time || 'Scheduled')}</b></div><div><small>Account health</small><b>${esc(customer.health)}</b></div></div><label class="m10-drawer-label">Collection note<textarea id="m10-payment-note" rows="3" placeholder="Reason or follow-up note"></textarea></label><div class="m10-form-actions"><a class="m10-btn" href="customer-detail.html?customer=${encodeURIComponent(customer.id)}&tab=billing">Customer billing</a><a class="m10-btn" href="subscriptions-billing.html">Open Billing</a><button class="m10-btn is-primary" type="button" data-m10-drawer-confirm="payment">${icon('refresh-cw')}Record retry</button></div>`, customer.id);
      return;
    }
    if (action === 'credit' || action === 'add-credits') {
      openDrawer(`${customer.name} · Add / adjust credits`, 'Review current usage, then prepare a deliberate audited credit adjustment. No one-click balance change is performed.', `${customerFacts(customer)}<div class="m10-credit-summary"><div><small>Included</small><strong>${esc(usage?.included || '—')}</strong></div><div><small>Used</small><strong>${esc(usage?.used || customer.credits)}</strong></div><div><small>Forecast</small><strong>${esc(usage?.forecast || '—')}</strong></div><div><small>Overage</small><strong>${esc(usage?.overage || '—')}</strong></div></div><div class="m10-credit-bar"><span><i style="width:${usage?.usedValue || customer.creditsUsed}%"></i></span><b>${usage?.usedValue || customer.creditsUsed}% consumed</b></div><form class="m10-form" data-m10-credit-adjust-form><div class="m10-form-grid two"><label>Adjustment type<select name="type"><option>Purchased credits</option><option>Promotional grant</option><option>Manual correction</option><option>Rollover</option><option>Refund adjustment</option></select></label><label>Amount<input name="amount" required placeholder="250K credits"></label></div><div class="m10-form-grid two"><label>Expiration<input name="expiration" type="date"></label><label>Related record<select name="related"><option>${esc(sub?.id || 'No subscription')}</option><option>Current invoice / forecast</option><option>None</option></select></label></div><label>Reason<select name="reason"><option>Customer purchase</option><option>Service recovery</option><option>Promotional campaign</option><option>Contract commitment</option><option>Operator correction</option></select></label><label>Approval / audit note<textarea name="note" rows="3" required placeholder="Why this adjustment is appropriate and who approved it"></textarea></label><label class="m10-confirm-check"><input type="checkbox" required><span>I reviewed the customer, amount, expiry, related record and audit reason.</span></label><div class="m10-review-note">${icon('shield-check')}<span><b>Audited commercial adjustment</b><small>This static demo simulates an approval-ready adjustment; it does not change a real billing balance.</small></span></div><div class="m10-form-actions"><a class="m10-btn" href="customer-detail.html?customer=${encodeURIComponent(customer.id)}&tab=usage">Customer usage</a><button class="m10-btn" type="button" data-m10-drawer-close>Cancel</button><button class="m10-btn is-primary" type="submit">${icon('coins')}Apply adjustment</button></div></form>`, customer.id);
      qs('[data-m10-credit-adjust-form]')?.addEventListener('submit',(event)=>{event.preventDefault();showToast('Credit adjustment reviewed and recorded as demo state','circle-check');closeDrawer();});
      return;
    }
    if (action === 'renewal') {
      openDrawer(`${customer.name} renewal review`, 'Prepare the commercial renewal decision without changing runtime access automatically.', `${customerFacts(customer)}<div class="m10-decision-card is-info">${icon('calendar-clock')}<span><b>${esc(customer.renewal)}</b><small>${esc(customer.plan)} · ${esc(customer.mrr)} MRR · ${esc(sub?.renewal || 'Manual review')}</small></span></div><div class="m10-form-grid two"><label class="m10-drawer-label">Renewal path<select><option>Renew current plan</option><option>Review plan change</option><option>Escalate to account owner</option><option>Do not renew</option></select></label><label class="m10-drawer-label">Commercial owner<input value="${esc(customer.owner)}"></label></div><label class="m10-drawer-label">Renewal note<textarea rows="3" placeholder="Renewal decision context"></textarea></label><div class="m10-form-actions"><a class="m10-btn" href="customer-detail.html?customer=${encodeURIComponent(customer.id)}&tab=subscription">Subscription & Entitlements</a><button class="m10-btn is-primary" type="button" data-m10-drawer-confirm="renewal">${icon('calendar-check')}Save renewal review</button></div>`, customer.id);
      return;
    }
  }

  function invoiceDetail(id) {
    const invoice=invoiceById(id); if(!invoice) return;
    const customer=customerById(invoice.customerId); const payment=data.payments.find(x=>x.invoice===invoice.id);
    openDrawer(`${invoice.id} · ${invoice.customer}`, 'Invoice line items, balance, payment attempts, and collection actions stay connected to the subscription record.', `<div class="m10-decision-card ${invoice.state==='Past Due'?'is-danger':'is-info'}">${icon('file-text')}<span><b>${esc(invoice.state)} · ${esc(invoice.balance)} balance</b><small>${esc(invoice.issueDate)} issued · due ${esc(invoice.due)}</small></span></div><div class="m10-invoice-lines"><div><span>Base subscription</span><b>${esc(invoice.base)}</b></div><div><span>Usage overage</span><b>${esc(invoice.overage)}</b></div><div><span>Credit / coupon</span><b>${esc(invoice.credit)}</b></div><div><span>Tax</span><b>${esc(invoice.tax)}</b></div><div class="is-total"><span>Total</span><b>${esc(invoice.amount)}</b></div><div class="is-total"><span>Balance due</span><b>${esc(invoice.balance)}</b></div></div><div class="m10-inspector"><div><small>Subscription</small><b>${esc(invoice.subscription)}</b></div><div><small>Customer</small><b>${esc(invoice.customer)}</b></div><div><small>Payment attempt</small><b>${esc(payment?.id||'—')}</b></div><div><small>Method</small><b>${esc(payment?.method||'Not attempted')}</b></div></div><div class="m10-form-actions"><a class="m10-btn" href="subscription-detail.html?subscription=${encodeURIComponent(invoice.subscription)}&tab=billing">Subscription detail</a><a class="m10-btn" href="customer-detail.html?customer=${encodeURIComponent(invoice.customerId)}&tab=billing">Customer billing</a><button class="m10-btn" type="button" data-m10-invoice-download="${esc(invoice.id)}">${icon('download')}Download invoice</button>${invoice.state==='Past Due'?`<button class="m10-btn is-primary" type="button" data-m10-drawer-confirm="payment">${icon('refresh-cw')}Retry payment</button>`:`<button class="m10-btn is-primary" type="button" data-m10-drawer-confirm="invoice">${icon('circle-check')}Mark resolved</button>`}</div>`, 'Invoice detail');
    qs(`[data-m10-invoice-download="${CSS.escape(invoice.id)}"]`)?.addEventListener('click',()=>showToast(`${invoice.id} demo invoice prepared`,'download'));
  }

  function paymentDetail(id) {
    const payment=paymentById(id); if(!payment) return;
    const customer=customerById(payment.customerId); const invoice=invoiceById(payment.invoice);
    openDrawer(`${payment.id} · ${payment.customer}`, 'Masked payment evidence with adapter, retry, webhook, invoice, and customer linkage.', `<div class="m10-decision-card ${payment.state==='Failed'?'is-danger':'is-good'}">${icon('credit-card')}<span><b>${esc(payment.state)} · ${esc(payment.amount)}</b><small>${esc(payment.method)} · ${esc(payment.time)}</small></span></div><div class="m10-inspector"><div><small>Invoice</small><b>${esc(payment.invoice)}</b></div><div><small>Adapter</small><b>${esc(payment.adapter)}</b></div><div><small>Retry count</small><b>${esc(payment.retries)}</b></div><div><small>Webhook / event</small><b>${esc(payment.event)}</b></div></div><div class="m10-review-note">${icon('shield-check')}<span><b>No payment secrets in demo</b><small>Only masked methods and operational event references are displayed.</small></span></div><div class="m10-form-actions">${invoice?`<button class="m10-btn" type="button" data-open-invoice-from-payment="${esc(invoice.id)}">View invoice</button>`:''}<a class="m10-btn" href="customer-detail.html?customer=${encodeURIComponent(payment.customerId)}&tab=billing">View customer</a><button class="m10-btn is-primary" type="button" data-copy-payment-event="${esc(payment.event)}">Copy event ID</button></div>`, 'Payment detail');
    qs('[data-open-invoice-from-payment]')?.addEventListener('click',(e)=>invoiceDetail(e.currentTarget.dataset.openInvoiceFromPayment));
    qs('[data-copy-payment-event]')?.addEventListener('click',(e)=>{navigator.clipboard?.writeText(e.currentTarget.dataset.copyPaymentEvent);showToast('Payment event ID copied','copy')});
  }

  function trialDetail(id) {
    const trial=trialById(id); if(!trial) return;
    openDrawer(`${trial.customer} trial`, 'Trial usage and conversion evidence with safe demo lifecycle actions.', `<div class="m10-decision-card is-info">${icon('sparkles')}<span><b>${esc(trial.plan)} · ${esc(trial.daysRemaining)} days remaining</b><small>${esc(trial.started)} → ${esc(trial.ends)} · ${esc(trial.conversion)}</small></span></div><div class="m10-inspector"><div><small>Credits</small><b>${esc(trial.credits)}</b></div><div><small>Requests</small><b>${esc(trial.requests)}</b></div><div><small>Feature adoption</small><b>${esc(trial.adoption)}</b></div><div><small>Usage</small><b>${esc(trial.usage)}</b></div></div><div class="m10-form-actions"><a class="m10-btn" href="subscription-detail.html?subscription=${encodeURIComponent(trial.subscription)}">Subscription detail</a><button class="m10-btn" type="button" data-m10-drawer-confirm="trial-extend">Extend trial</button><button class="m10-btn" type="button" data-m10-drawer-confirm="trial-cancel">Cancel trial</button><button class="m10-btn is-primary" type="button" data-m10-drawer-confirm="trial-convert">Convert to paid</button></div>`, 'Trial detail');
  }

  function creditDetail(id) {
    const credit=creditById(id); if(!credit) return;
    openDrawer(`${credit.id} · ${credit.customer}`, 'Commercial credit/coupon evidence and remaining balance.', `<div class="m10-decision-card is-info">${icon('coins')}<span><b>${esc(credit.type)} · ${esc(credit.amount)}</b><small>${esc(credit.remaining)} remaining · expires ${esc(credit.expires)}</small></span></div><div class="m10-inspector"><div><small>Applies to</small><b>${esc(credit.scope)}</b></div><div><small>Subscription</small><b>${esc(credit.subscription)}</b></div><div><small>Reason</small><b>${esc(credit.reason)}</b></div><div><small>Status</small><b>${esc(credit.state)}</b></div></div><div class="m10-form-actions"><a class="m10-btn" href="subscription-detail.html?subscription=${encodeURIComponent(credit.subscription)}&tab=billing">Subscription detail</a><a class="m10-btn is-primary" href="customer-detail.html?customer=${encodeURIComponent(credit.customerId)}&tab=usage">Customer usage</a></div>`, 'Credit detail');
  }

  function meterUnitDetail(id) {
    const unit=meterUnitById(id); if(!unit) return;
    openDrawer(unit.label, 'Commercial meter definition and conversion policy. Values on this page are normalized billing inputs and are not raw operational telemetry.', `<div class="m10-decision-card is-info">${icon(unit.icon)}<span><b>${esc(unit.value)} current billed units</b><small>${esc(unit.id)} · ${esc(unit.version)}</small></span></div><div class="m10-inspector"><div><small>Conversion</small><b>${esc(unit.conversion)}</b></div><div><small>Rounding</small><b>${esc(unit.rounding)}</b></div><div><small>Scope</small><b>${esc(unit.scope)}</b></div><div><small>Effective version</small><b>${esc(unit.version)}</b></div></div><div class="m10-review-note">${icon('split')}<span><b>Telemetry boundary</b><small>Usage Analytics reports raw operational consumption. Usage & Credits applies commercial meter rules, plan weighting, exclusions and rounding before credit ledgering.</small></span></div><div class="m10-form-actions"><a class="m10-btn" href="usage-analytics.html">Open raw Usage Analytics</a><button class="m10-btn is-primary" type="button" data-m10-drawer-close>Done</button></div>`, 'Billable unit model');
  }

  function overageDetail(customerId) {
    const usage=usageByCustomer(customerId); const customer=customerById(customerId); if(!usage||!customer) return;
    const plan=data.plans.find((item)=>item.name===customer.plan); const sub=subscriptionByCustomer(customerId);
    const excess=Math.max(0, Number(usage.forecastValueM||0)-Number(usage.includedValueM||0));
    const projected=Number(usage.overageValue||0);
    openDrawer(`${customer.name} · Overage forecast`, 'Plan allowance, expected excess and projected commercial charge in one auditable calculation.', `<div class="m10-decision-card ${projected?'is-danger':'is-good'}">${icon('gauge')}<span><b>${esc(usage.forecast)} forecast vs ${esc(usage.included)} included</b><small>${projected?`$${projected} projected charge`:'No projected billable overage'}</small></span></div><div class="m10-inspector"><div><small>Included</small><b>${esc(usage.included)}</b></div><div><small>Forecast</small><b>${esc(usage.forecast)}</b></div><div><small>Projected excess</small><b>${excess ? `${excess.toFixed(excess<1?1:1)}M` : '0'}</b></div><div><small>Overage rate</small><b>${esc(plan?.overage || 'Contract policy')}</b></div><div><small>Projected charge</small><b>${projected?`$${projected}`:esc(usage.overage)}</b></div><div><small>Subscription</small><b>${esc(sub?.id || '—')}</b></div></div><div class="m10-form-actions"><a class="m10-btn" href="plan-detail.html?plan=${encodeURIComponent(plan?.id||'PLAN-BUSINESS')}&tab=pricing">Open plan</a>${sub?`<a class="m10-btn" href="subscription-detail.html?subscription=${encodeURIComponent(sub.id)}&tab=usage">Open subscription</a>`:''}<a class="m10-btn is-primary" href="customer-detail.html?customer=${encodeURIComponent(customer.id)}&tab=usage">Customer usage</a></div>`, 'Overage detail');
  }

  function meterEventDetail(id) {
    const event=meterEventById(id); if(!event) return;
    openDrawer(`${event.id} · Meter event`, 'Commercial usage evidence from raw quantity through billable quantity and credit delta.', `<div class="m10-decision-card is-info">${icon('scan-search')}<span><b>${esc(event.applicationName)} · ${esc(event.meterName)}</b><small>${esc(event.timestamp)}</small></span></div><div class="m10-inspector"><div><small>Customer</small><b>${esc(event.customer)}</b></div><div><small>Application</small><b>${esc(event.application)}</b></div><div><small>Raw quantity</small><b>${esc(event.raw)}</b></div><div><small>Billable quantity</small><b>${esc(event.billable)}</b></div><div><small>Credit delta</small><b>${esc(event.creditDelta)}</b></div><div><small>Conversion rule</small><b>${esc(event.rule)}</b></div><div><small>Request</small><b>${esc(event.request)}</b></div><div><small>Trace</small><b>${esc(event.trace)}</b></div></div><div class="m10-form-actions"><a class="m10-btn" href="application-detail.html?app=${encodeURIComponent(event.application)}">Open application</a><a class="m10-btn" href="requests-runs.html?request=${encodeURIComponent(event.request)}">Open request</a><a class="m10-btn" href="traces.html?trace=${encodeURIComponent(event.trace)}">Open trace</a><button class="m10-btn is-primary" type="button" data-copy-meter-event="${esc(event.id)}">Copy event</button></div>`, 'Meter event');
    qs('[data-copy-meter-event]')?.addEventListener('click',(e)=>{navigator.clipboard?.writeText(e.currentTarget.dataset.copyMeterEvent);showToast('Meter event ID copied','copy');});
  }

  function subscriptionForm() {
    return `<form class="m10-form" data-m10-subscription-form><div class="m10-workflow-steps"><span class="active">Customer</span><span>Plan</span><span>Billing</span><span>Trial</span><span>Credits</span><span>Review</span></div><div class="m10-form-grid two"><label>Customer<select name="customer">${data.customers.map(c=>`<option value="${esc(c.id)}">${esc(c.name)} · ${esc(c.id)}</option>`).join('')}</select></label><label>Plan<select name="plan">${data.plans.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} · ${esc(p.monthly)}</option>`).join('')}</select></label></div><div class="m10-form-grid two"><label>Billing cycle<select><option>Monthly</option><option>Annual</option><option>Contract</option></select></label><label>Start date<input type="date" value="2026-08-30"></label></div><div class="m10-form-grid two"><label>Trial<select><option>No trial</option><option>7 days</option><option>14 days</option><option>30 days</option></select></label><label>Credits / discount<select><option>None</option><option>Promotional credits</option><option>Service recovery</option><option>Contract adjustment</option></select></label></div><div class="m10-form-grid two"><label>Renewal<select><option>Auto</option><option>Manual</option><option>Contract</option></select></label><label>Commercial owner<input value="Amelia Grant"></label></div><label>Review note<textarea rows="3" placeholder="Reason and customer context"></textarea></label><div class="m10-review-note">${icon('shield-check')}<span><b>Gateway-agnostic demo</b><small>Creating this record does not charge a payment method or provision external billing.</small></span></div><div class="m10-form-actions"><button class="m10-btn" type="button" data-m10-drawer-close>Cancel</button><button class="m10-btn" type="button" data-m10-drawer-confirm="subscription-draft">Save draft</button><button class="m10-btn is-primary" type="submit">${icon('receipt-text')}Create subscription</button></div></form>`;
  }

  function openSubscriptionAction(action,id) {
    const sub=subscriptionById(id); if(!sub) return;
    const customer=customerById(sub.customer);
    const title={edit:'Manage subscription','change-plan':'Change plan',renewal:'Renewal review',cancel:'Cancel subscription'}[action]||'Subscription action';
    openDrawer(`${title} · ${sub.id}`, 'Prepare an auditable commercial lifecycle change without executing a real payment.', `<div class="m10-decision-card is-info">${icon('receipt-text')}<span><b>${esc(customer?.name||sub.customerName)} · ${esc(sub.plan)}</b><small>${esc(sub.amount)} · ${esc(sub.cycle)} · next billing ${esc(sub.nextBilling)}</small></span></div><div class="m10-form-grid two"><label>Plan<select>${data.plans.map(p=>`<option ${p.name===sub.plan?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><label>Renewal mode<select><option ${sub.renewal==='Auto'?'selected':''}>Auto</option><option ${sub.renewal==='Manual'?'selected':''}>Manual</option><option ${sub.renewal==='Contract'?'selected':''}>Contract</option></select></label></div><div class="m10-form-grid two"><label>Effective date<input type="date" value="2026-09-01"></label><label>Action<select><option>${esc(title)}</option><option>Keep current subscription</option><option>Escalate review</option></select></label></div><label>Reason<textarea rows="3" placeholder="Why this subscription is changing"></textarea></label><div class="m10-form-actions"><a class="m10-btn" href="customer-detail.html?customer=${encodeURIComponent(sub.customer)}&tab=billing">Open customer</a><button class="m10-btn" type="button" data-m10-drawer-close>Cancel</button><button class="m10-btn is-primary" type="button" data-m10-drawer-confirm="subscription-action">Record ${esc(title.toLowerCase())}</button></div>`, 'Subscription lifecycle');
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (qs('#m10-drawer')?.classList.contains('is-open')) closeDrawer();
    else closeModal();
  });

  document.addEventListener('click', (event) => {
    const close = event.target.closest('[data-m10-drawer-close]');
    if (close) { closeDrawer(); return; }
    const confirm = event.target.closest('[data-m10-drawer-confirm]');
    if (confirm) {
      const labels = { payment:'Payment retry recorded', credit:'Credit adjustment recorded', renewal:'Renewal review saved', invoice:'Invoice resolution recorded', 'trial-extend':'Trial extension recorded', 'trial-cancel':'Trial cancellation recorded', 'trial-convert':'Trial conversion prepared', 'subscription-draft':'Subscription draft saved', 'subscription-action':'Subscription lifecycle change recorded' };
      showToast(labels[confirm.dataset.m10DrawerConfirm] || 'Customer workflow recorded', 'circle-check');
      closeDrawer();
    }
  });

  qsa('[data-m10-link]').forEach((button) => button.addEventListener('click', () => { location.href = button.dataset.m10Link; }));
  qsa('[data-m10-action]').forEach((button) => button.addEventListener('click', () => showToast(`${button.dataset.m10Action} recorded`, 'circle-check')));
  qsa('[data-m10-export]').forEach((button) => button.addEventListener('click', () => {
    const kind = button.dataset.m10Export;
    let rows = kind === 'customers' ? data.customers : kind === 'credits' ? data.usageCredits : data.subscriptions;
    if (kind === 'billing') {
      const activeTab = qs('[data-m10-billing-tab].active')?.dataset.m10BillingTab || 'subscriptions';
      rows = activeTab === 'invoices' ? data.invoices : activeTab === 'payments' ? data.payments : activeTab === 'trials' ? data.trials : activeTab === 'credits' ? data.credits : data.subscriptions;
    }
    if (kind === 'customers') {
      const visible = new Set(qsa('[data-m10-customer-row]').filter((row) => !row.hidden).map((row) => row.dataset.customerId));
      if (visible.size) rows = rows.filter((row) => visible.has(row.id));
    }
    const csv = [Object.keys(rows[0]).filter(k=>!Array.isArray(rows[0][k])).join(','), ...rows.map((row) => Object.entries(row).filter(([,v])=>!Array.isArray(v)).map(([,v])=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' })); a.download = `orvexa-${kind}.csv`; a.click(); URL.revokeObjectURL(a.href); showToast(`${kind} CSV exported`, 'download');
  }));

  if (page === 'customers') {
    const rows = qsa('[data-m10-customer-row]');
    const search = qs('#m10-customer-search');
    const plan = qs('#m10-plan-filter');
    const health = qs('#m10-health-filter');
    const apply = () => filterRows(rows, (row) => {
      const q = (search?.value || '').trim().toLowerCase();
      return (!q || row.dataset.search.includes(q)) && (!plan?.value || row.dataset.plan === plan.value) && (!health?.value || row.dataset.health === health.value);
    }, qs('[data-m10-empty]'));
    [search, plan, health].forEach((control) => control?.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', apply));

    qsa('[data-m10-customer-menu]').forEach((button)=>button.addEventListener('click',()=>{
      const customer = customerById(button.dataset.m10CustomerMenu); if(!customer) return;
      openModal(customer.name, `<div class="m10-action-grid"><a href="customer-detail.html?customer=${customer.id}&tab=overview">${icon('scan-search')}<b>Open customer detail</b><small>Full lifecycle workspace with connected commercial evidence</small></a><button data-modal-customer-action="edit">${icon('square-pen')}<b>Edit customer</b><small>Hierarchy, plan context, owner, renewal and health</small></button><a href="customer-detail.html?customer=${customer.id}&tab=usage">${icon('coins')}<b>Usage & credits</b><small>Consumption, forecast, pressure and adjustments</small></a><a href="customer-detail.html?customer=${customer.id}&tab=billing">${icon('receipt-text')}<b>Billing & payments</b><small>Subscription, invoices and collection evidence</small></a><button data-modal-customer-action="renewal">${icon('calendar-clock')}<b>Renewal review</b><small>Prepare the next commercial decision</small></button><button data-modal-customer-action="add-credits">${icon('badge-plus')}<b>Add credits</b><small>Post an auditable demo credit adjustment</small></button></div>`, customer.id);
      qsa('[data-modal-customer-action]').forEach((item)=>item.addEventListener('click',()=>{const action=item.dataset.modalCustomerAction;closeModal();setTimeout(()=>openCustomerAction(action,customer.id),120);}));
    }));

    qsa('[data-m10-customer-action]').forEach((button) => button.addEventListener('click', () => openCustomerAction(button.dataset.m10CustomerAction, button.dataset.customerId)));
  }

  if (page === 'customer-detail') {
    qsa('[data-m10-overage-detail]').forEach((button)=>button.addEventListener('click',()=>overageDetail(button.dataset.m10OverageDetail)));
    qsa('[data-m10-meter-event]').forEach((button)=>button.addEventListener('click',()=>meterEventDetail(button.dataset.m10MeterEvent)));
    qsa('[data-m10-customer-action]').forEach((button) => button.addEventListener('click', () => openCustomerAction(button.dataset.m10CustomerAction, button.dataset.customerId)));
    qsa('[data-m10-invoice]').forEach((button)=>button.addEventListener('click',()=>invoiceDetail(button.dataset.m10Invoice)));
    qsa('[data-m10-payment]').forEach((button)=>button.addEventListener('click',()=>paymentDetail(button.dataset.m10Payment)));
    qsa('[data-m10-credit]').forEach((button)=>button.addEventListener('click',()=>creditDetail(button.dataset.m10Credit)));
  }

  if (page === 'plans-entitlements') {
    qsa('[data-m10-edit-plan]').forEach((button)=>button.addEventListener('click',()=>{ location.href = `plan-detail.html?plan=${encodeURIComponent(button.dataset.m10EditPlan)}&mode=edit`; }));
    qsa('[data-m10-entitlement-cell]').forEach((button)=>button.addEventListener('click',()=>openEntitlementDetail(button.dataset.m10EntitlementCell, button.dataset.plan)));
  }
  if (page === 'plan-detail') {
    qsa('[data-m10-plan-action]').forEach((button)=>button.addEventListener('click',()=>openPlanAction(button.dataset.m10PlanAction, button.dataset.planId)));
    qsa('[data-m10-entitlement-cell]').forEach((button)=>button.addEventListener('click',()=>openEntitlementDetail(button.dataset.m10EntitlementCell, button.dataset.plan)));
    const query = new URLSearchParams(location.search);
    if (query.get('mode') === 'edit') setTimeout(() => openPlanAction('edit-plan', query.get('plan')), 80);
  }

  if (page === 'subscriptions-billing') {
    const tabs = qsa('[data-m10-billing-tab]');
    const rows = qsa('[data-m10-billing-row]');
    const search = qs('#m10-billing-search');
    const heads = {
      subscriptions:['Subscription / Customer','Plan','Cycle','Amount','Next billing','Payment state','Renewal mode','Status',''],
      invoices:['Invoice / Customer','Period','Amount / Balance','Due','Line item','Status',''],
      payments:['Payment / Customer','Amount','Method','Processed','Status',''],
      trials:['Trial / Customer','Plan','Started','Ends','Usage','Conversion','Status',''],
      credits:['Credit / Customer','Type','Amount','Remaining','Expires','Status',''],
    };
    let active='subscriptions';
    const apply = () => {
      const q=(search?.value||'').trim().toLowerCase();
      filterRows(rows,(row)=>row.dataset.billingTab===active && (!q || (row.dataset.search||row.textContent.toLowerCase()).includes(q)),qs('[data-m10-empty]'));
      qs('#m10-billing-head').innerHTML=`<tr>${heads[active].map(x=>`<th>${x}</th>`).join('')}</tr>`;
    };
    tabs.forEach((button)=>button.addEventListener('click',()=>{active=button.dataset.m10BillingTab;tabs.forEach(x=>x.classList.toggle('active',x===button));apply();}));
    search?.addEventListener('input',apply);
    qsa('[data-m10-invoice]').forEach((button)=>button.addEventListener('click',()=>invoiceDetail(button.dataset.m10Invoice)));
    qsa('[data-m10-payment]').forEach((button)=>button.addEventListener('click',()=>paymentDetail(button.dataset.m10Payment)));
    qsa('[data-m10-trial]').forEach((button)=>button.addEventListener('click',()=>trialDetail(button.dataset.m10Trial)));
    qsa('[data-m10-credit]').forEach((button)=>button.addEventListener('click',()=>creditDetail(button.dataset.m10Credit)));
    qsa('[data-m10-overage-customer]').forEach((button)=>button.addEventListener('click',()=>{location.href=`customer-detail.html?customer=${encodeURIComponent(button.dataset.m10OverageCustomer)}&tab=usage`;}));
  }

  if (page === 'subscription-detail') {
    qsa('[data-m10-subscription-action]').forEach((button)=>button.addEventListener('click',()=>openSubscriptionAction(button.dataset.m10SubscriptionAction,button.dataset.subscriptionId)));
    qsa('[data-m10-invoice]').forEach((button)=>button.addEventListener('click',()=>invoiceDetail(button.dataset.m10Invoice)));
    qsa('[data-m10-payment]').forEach((button)=>button.addEventListener('click',()=>paymentDetail(button.dataset.m10Payment)));
    qsa('[data-m10-credit]').forEach((button)=>button.addEventListener('click',()=>creditDetail(button.dataset.m10Credit)));
  }

  if (page === 'usage-credits') {
    const rows=qsa('[data-m10-usage-row]'), search=qs('#m10-usage-search'), state=qs('#m10-usage-state');
    const apply=()=>filterRows(rows,(row)=>{const q=(search?.value||'').trim().toLowerCase();return(!q||row.dataset.search.includes(q))&&(!state?.value||row.dataset.state===state.value)},qs('[data-m10-empty]'));
    search?.addEventListener('input',apply); state?.addEventListener('change',apply);
    qsa('[data-m10-meter-unit]').forEach((button)=>button.addEventListener('click',()=>meterUnitDetail(button.dataset.m10MeterUnit)));
    qsa('[data-m10-overage-detail]').forEach((button)=>button.addEventListener('click',()=>overageDetail(button.dataset.m10OverageDetail)));


    if (window.ApexCharts && qs('#m10-credit-chart')) {
      const chart = new ApexCharts(qs('#m10-credit-chart'), {
        chart:{type:'bar',height:286,toolbar:{show:false},fontFamily:'Manrope, sans-serif',background:'transparent'},
        series:[{name:'Used %',data:data.usageCredits.map(x=>x.usedValue)}],
        xaxis:{categories:data.usageCredits.map(x=>x.customerName.split(' ')[0]),labels:{style:{colors:'var(--muted)',fontSize:'12px'}}},
        yaxis:{max:100,labels:{formatter:v=>`${Math.round(v)}%`,style:{colors:'var(--muted)',fontSize:'12px'}}},
        plotOptions:{bar:{borderRadius:7,columnWidth:'48%',distributed:true}},
        colors:data.usageCredits.map(x=>x.usedValue>90?'#d66f63':x.usedValue>=75?'#d6a62d':'#62b48a'),dataLabels:{enabled:false},legend:{show:false},grid:{borderColor:'rgba(128,128,128,.13)'},tooltip:{y:{formatter:v=>`${v}% of included credits`}},theme:{mode:document.documentElement.classList.contains('dark')?'dark':'light'}
      }); chart.render();
      document.addEventListener('orvexa:themechange',()=>{chart.updateOptions({theme:{mode:document.documentElement.classList.contains('dark')?'dark':'light'}})});
    }
  }

  qsa('[data-m10-open]').forEach((button)=>button.addEventListener('click',()=>{
    const kind=button.dataset.m10Open;
    if (kind === 'customer-create') {
      openDrawer('Add customer','Create a customer account and connect its commercial hierarchy without provisioning a real external system.',customerForm(), 'Customer lifecycle');
      bindCustomerForm();
      return;
    }
    if (kind === 'plan-create') {
      openDrawer('New plan','Create a commercial package across basics, pricing, included monthly usage, features, overage, and review.',planForm(), 'Product packaging');
      bindPlanForm();
      return;
    }
    if (kind === 'entitlement-create') {
      openDrawer('New entitlement','Define one commercial capability gate, value type, applicable plan values, description, and runtime mapping.',entitlementForm(), 'Product packaging');
      bindEntitlementForm();
      return;
    }
    if (kind === 'subscription-create') {
      openDrawer('New subscription','Customer → plan → billing cycle → trial/credits → renewal → review.',subscriptionForm(),'Subscription lifecycle');
      qs('[data-m10-subscription-form]')?.addEventListener('submit',(event)=>{event.preventDefault();showToast('Subscription demo created','circle-check');closeDrawer();});
      return;
    }
    if (kind === 'credits-add') {
      const customer = customerById('CUS-NOVA-001') || data.customers[0];
      openCustomerAction('add-credits', customer.id);
      return;
    }
    const configs={};
    const [title,copy]=configs[kind]||['Monetize action','Configure this commercial workflow.'];
    openModal(title,`<form class="m10-form" data-m10-generic-form><p>${copy}</p><label>Name / reference<input required placeholder="Enter name or ID"></label><label>Scope<select><option>Nova Intelligence</option><option>Selected customer</option><option>Selected plan</option></select></label><label>Reason<textarea rows="3" placeholder="Operational reason"></textarea></label><div class="m10-form-actions"><button class="m10-btn" data-m10-close type="button">Cancel</button><button class="m10-btn is-primary" type="submit">${icon('circle-check')}Save</button></div></form>`);
    qs('[data-m10-generic-form]')?.addEventListener('submit',(event)=>{event.preventDefault();showToast(`${title} saved as demo state`,'circle-check');closeModal();});
  }));

  window.OrvexaMonetize = { openCustomerAction, openPlanAction, openEntitlementDetail, invoiceDetail, paymentDetail, trialDetail, creditDetail, meterUnitDetail, overageDetail, meterEventDetail, openSubscriptionAction, openCustomerDrawer: openDrawer, closeCustomerDrawer: closeDrawer };
  window.lucide?.createIcons({ attrs: { 'stroke-width': 1.8 } });
})();
