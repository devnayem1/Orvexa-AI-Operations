(() => {
  'use strict';

  const page = document.body.dataset.qualityPage || document.body.dataset.activePage;
  const product = window.Orvexa?.product;
  const quality = product?.quality;
  if (!quality || !['datasets','evaluations','quality-feedback','policies-guardrails','safety-redteam','human-review','experiments-releases'].includes(page)) return;

  const icon = name => `<i data-lucide="${name}"></i>`;
  const notify = (message, glyph='sparkles') => window.showToast?.(message, glyph);
  const refreshIcons = () => window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const makeId = prefix => `${prefix}-${String(Date.now()).slice(-6)}`;

  let modalReturnFocus = null;
  const modal = document.createElement('div');
  modal.className = 'quality-modal-shell';
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML = `<div class="quality-modal-backdrop" data-quality-modal-close></div><section class="quality-modal" role="dialog" aria-modal="true" aria-labelledby="quality-modal-title"><header><div><h2 id="quality-modal-title">Workflow</h2><p id="quality-modal-copy"></p></div><button class="quality-icon-btn" type="button" aria-label="Close" data-quality-modal-close>${icon('x')}</button></header><div class="quality-modal-body" id="quality-modal-body"></div><footer id="quality-modal-footer"></footer></section>`;
  document.body.appendChild(modal);

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('quality-modal-open');
    modalReturnFocus?.focus?.();
  };
  const openModal = ({title, copy='', body='', confirm='Save', confirmIcon='check', cancel='Cancel', onConfirm, danger=false, hideConfirm=false}, trigger=document.activeElement) => {
    modalReturnFocus = trigger;
    modal.querySelector('#quality-modal-title').textContent = title;
    modal.querySelector('#quality-modal-copy').textContent = copy;
    modal.querySelector('#quality-modal-body').innerHTML = body;
    const footer = modal.querySelector('#quality-modal-footer');
    footer.innerHTML = `<button class="p4-btn" type="button" data-quality-modal-close>${esc(cancel)}</button>${hideConfirm?'':`<button class="p4-btn primary ${danger?'quality-danger':''}" type="button" data-quality-modal-confirm>${icon(confirmIcon)}${esc(confirm)}</button>`}`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('quality-modal-open');
    refreshIcons();
    const confirmButton = footer.querySelector('[data-quality-modal-confirm]');
    if (confirmButton) confirmButton.onclick = () => onConfirm?.(modal.querySelector('#quality-modal-body'), confirmButton, closeModal);
    setTimeout(() => modal.querySelector('input,select,textarea,button')?.focus(), 20);
  };
  modal.addEventListener('click', event => { if (event.target.closest('[data-quality-modal-close]')) closeModal(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
    if (event.key === 'Escape' && workflowDrawer.classList.contains('open')) closeWorkflowDrawer();
    if (event.key !== 'Tab' || !modal.classList.contains('open')) return;
    const focusable=[...modal.querySelectorAll('button,input,select,textarea,[href],[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled && !el.hidden);
    if (!focusable.length) return;
    if(event.shiftKey && document.activeElement===focusable[0]){event.preventDefault();focusable.at(-1).focus();}
    else if(!event.shiftKey && document.activeElement===focusable.at(-1)){event.preventDefault();focusable[0].focus();}
  });

  const field = (label, control, hint='') => `<label class="quality-field"><span>${label}</span>${control}${hint?`<small>${hint}</small>`:''}</label>`;
  const input = (name, value='', placeholder='') => `<input class="quality-control" name="${name}" value="${esc(value)}" placeholder="${esc(placeholder)}">`;
  const textarea = (name, value='', placeholder='') => `<textarea class="quality-control quality-textarea" name="${name}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`;
  const select = (name, options, selected='') => `<select class="quality-control" name="${name}">${options.map(v => { const [value,label]=Array.isArray(v)?v:[v,v]; return `<option value="${esc(value)}" ${value===selected?'selected':''}>${esc(label)}</option>`; }).join('')}</select>`;
  const get = (root,name) => root.querySelector(`[name="${name}"]`)?.value?.trim() || '';

  let workflowReturnFocus = null;
  const workflowBackdrop = document.createElement('div');
  workflowBackdrop.className = 'quality-workflow-backdrop';
  const workflowDrawer = document.createElement('aside');
  workflowDrawer.className = 'quality-workflow-drawer';
  workflowDrawer.setAttribute('aria-hidden','true');
  workflowDrawer.innerHTML = `<header class="quality-workflow-head"><div><h2 id="quality-workflow-title">Workflow</h2><p id="quality-workflow-copy"></p></div><button class="quality-icon-btn" type="button" data-quality-workflow-close aria-label="Close">${icon('x')}</button></header><div class="quality-workflow-body" id="quality-workflow-body"></div><footer class="quality-workflow-footer" id="quality-workflow-footer"></footer>`;
  document.body.append(workflowBackdrop, workflowDrawer);
  const closeWorkflowDrawer = () => { workflowDrawer.classList.remove('open'); workflowBackdrop.classList.remove('open'); workflowDrawer.setAttribute('aria-hidden','true'); document.documentElement.classList.remove('quality-modal-open'); workflowReturnFocus?.focus?.(); };
  const openWorkflowDrawer = ({title,copy='',body='',confirm='Save',confirmIcon='check',onConfirm},trigger=document.activeElement) => {
    workflowReturnFocus=trigger; workflowDrawer.querySelector('#quality-workflow-title').textContent=title; workflowDrawer.querySelector('#quality-workflow-copy').textContent=copy; workflowDrawer.querySelector('#quality-workflow-body').innerHTML=body;
    const footer=workflowDrawer.querySelector('#quality-workflow-footer'); footer.innerHTML=`<button class="p4-btn" type="button" data-quality-workflow-close>Cancel</button><button class="p4-btn primary" type="button" data-quality-workflow-confirm>${icon(confirmIcon)}${esc(confirm)}</button>`;
    workflowDrawer.classList.add('open'); workflowBackdrop.classList.add('open'); workflowDrawer.setAttribute('aria-hidden','false'); document.documentElement.classList.add('quality-modal-open'); refreshIcons();
    footer.querySelector('[data-quality-workflow-confirm]').onclick=()=>onConfirm?.(workflowDrawer.querySelector('#quality-workflow-body'),footer.querySelector('[data-quality-workflow-confirm]'),closeWorkflowDrawer);
    setTimeout(()=>workflowDrawer.querySelector('input,select,textarea,button')?.focus(),20);
  };
  workflowDrawer.addEventListener('click',event=>{if(event.target.closest('[data-quality-workflow-close]'))closeWorkflowDrawer();});
  workflowBackdrop.addEventListener('click',closeWorkflowDrawer);


  const exportCsv = (filename, headers, rows) => {
    const csv = [headers, ...rows].map(row => row.map(value => `"${String(value??'').replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    const href=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=href; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(href),1000);
    notify(`${filename} exported`, 'download');
  };

  const statusMarkup = (label, tone='info') => `<span class="p4-status ${tone}">${esc(label)}</span>`;
  const handledActions = new Set(['Create case','Import dataset','Run evaluation','Open failed cases','Export evaluation results','Feedback filters','Create policy','Policy filters','Test policy','Save policy version','New campaign','Export safety findings','Queue filters','New experiment','Release filters','Return blocked candidate to draft']);

  document.addEventListener('click', event => {
    const trigger=event.target.closest('[data-p4-action]');
    if (!trigger || !handledActions.has(trigger.dataset.p4Action)) return;
    event.preventDefault(); event.stopPropagation();
    const action=trigger.dataset.p4Action;
    if(action==='Create case') openCreateCase(trigger);
    if(action==='Import dataset') openImportDataset(trigger);
    if(action==='Run evaluation') openRunEvaluation(trigger);
    if(action==='Open failed cases') openFailedCases(trigger);
    if(action==='Export evaluation results') exportEvaluationRuns();
    if(action==='Feedback filters') openFeedbackFilters(trigger);
    if(action==='Create policy') openCreatePolicy(trigger);
    if(action==='Policy filters') document.querySelector('#quality-policy-category')?.focus();
    if(action==='Test policy') openPolicySimulator(trigger);
    if(action==='Save policy version') savePolicyVersion(trigger);
    if(action==='New campaign') openCampaign(trigger);
    if(action==='Export safety findings') exportSafetyFindings();
    if(action==='Queue filters') openHumanReviewFilters(trigger);
    if(action==='New experiment') openExperiment(trigger);
    if(action==='Release filters') openReleaseFilters(trigger);
    if(action==='Return blocked candidate to draft') returnBlockedCandidateToDraft(trigger);
  }, true);

  function openCreateCase(trigger){
    openWorkflowDrawer({title:'Create test case',copy:'Curate a reusable scenario with evidence, evaluation rules and ownership.',confirm:'Create test case',confirmIcon:'plus',body:`<div class="quality-drawer-kicker">Source → Input → Evaluation → Dataset → Review</div><div class="quality-drawer-section"><h3>Source & dataset</h3><p>Choose where this scenario came from and where it belongs.</p></div><div class="quality-form-grid">${field('Source',select('source',['Manual','Production trace','Grounding exception','Human review','Red-team finding'],'Production trace'))}${field('Dataset',select('dataset',quality.datasets.map(d=>[d.id,`${d.name} · ${d.id}`])))}${field('Input',textarea('caseInput','','Production scenario or prompt…'))}${field('Expected behavior',textarea('expected','','Describe the required safe, grounded outcome…'))}${field('Evaluator',select('evaluator',['LLM judge + rules','Semantic + rules','Rules + human']))}${field('Required threshold',input('threshold','95.0%'))}${field('Tags',input('tags','quality, regression','comma-separated tags'))}${field('Difficulty',select('difficulty',['Medium','Hard','Critical'],'Hard'))}${field('Source trace',input('trace','TRC-8A42F1','Canonical TRC-… reference'))}</div>`,onConfirm:(body,button,close)=>{
      const prompt=get(body,'caseInput'), expected=get(body,'expected'); if(!prompt||!expected){notify('Input and expected behavior are required','circle-alert');return;}
      const id=makeId('CASE'), difficulty=get(body,'difficulty'), tags=get(body,'tags'), trace=get(body,'trace'), threshold=get(body,'threshold')||'95.0%';
      const row=document.createElement('button'); row.className='p4-row p4-case-row quality-new-row'; row.type='button'; row.dataset.p4Case=`${prompt} ${tags} ${difficulty} pending ${trace}`.toLowerCase(); row.dataset.p4CaseId=id; row.dataset.p4Inspect=''; row.dataset.title=id; row.dataset.id=trace; row.innerHTML=`<span><b>${esc(prompt)}</b><small>${id}</small></span><span class="p4-expected">${esc(expected)}</span><span class="p4-tags">${esc(tags)}</span><span class="p4-mono">${esc(trace)}</span><span><span class="p4-difficulty ${difficulty.toLowerCase()}">${esc(difficulty)}</span></span><span class="p4-score">—<small>Gate ≥${esc(threshold)}</small></span><span>${statusMarkup('Pending','warn')}</span>`;
      document.querySelector('#p4-case-table .p4-table-head')?.after(row); wireInspector(row); bumpMetric('Test cases',1); close(); notify(`${id} created`, 'list-plus');
    }},trigger);
  }

  function openImportDataset(trigger){
    openModal({title:'Import JSON / CSV',copy:'Preview and validate a small static import before adding it to a governed dataset.',confirm:'Import validated rows',confirmIcon:'upload',body:`<div class="quality-form-grid">${field('Target dataset',select('dataset',quality.datasets.map(d=>[d.id,`${d.name} · ${d.id}`])))}${field('File','<input class="quality-control quality-file" type="file" name="file" accept=".json,.csv">','JSON or CSV · preview limited to 5 rows')}<div class="quality-import-preview" id="quality-import-preview"><div class="quality-import-empty"><b>Choose a JSON or CSV file</b><span>A five-row preview and validation summary will appear here.</span></div></div></div>`,onConfirm:(body,button,close)=>{
      const file=body.querySelector('[name="file"]')?.files?.[0]; if(!file){notify('Choose a JSON or CSV file first','circle-alert');return;} if(!body.querySelector('[data-import-valid]')){notify('Preview validation is required','circle-alert');return;} close(); notify(`5 validated rows imported to ${get(body,'dataset')}`,'upload');
    }},trigger);
    const body=modal.querySelector('#quality-modal-body'), fileInput=body.querySelector('[name="file"]'), preview=body.querySelector('#quality-import-preview');
    fileInput?.addEventListener('change',()=>{ const file=fileInput.files?.[0]; if(!file)return; const rows=[['CASE-NEW-01','Billing refund evidence','Valid'],['CASE-NEW-02','Grounding citation check','Valid'],['CASE-NEW-03','Identity write refusal','Valid'],['CASE-NEW-04','Prompt injection block','Valid'],['CASE-NEW-05','Missing expected_behavior','Invalid']]; preview.innerHTML=`<div class="quality-import-summary" data-import-valid><b>4 valid · 1 needs review</b><span>${esc(file.name)} · previewing 5 rows</span></div><div class="quality-import-rows">${rows.map(r=>`<div class="${r[2]==='Invalid'?'is-invalid':''}"><code>${r[0]}</code><span>${r[1]}</span><b>${r[2]}</b></div>`).join('')}</div><small class="quality-import-note">Invalid rows remain excluded until corrected.</small>`; });
  }

  function openRunEvaluation(trigger){
    openModal({title:'Run evaluation',copy:'Compare a candidate against a reusable dataset and production baseline.',confirm:'Run evaluation',confirmIcon:'play',body:`<div class="quality-form-grid">${field('Dataset',select('dataset',quality.datasets.map(d=>[d.id,`${d.name} · ${d.id}`]),'DATASET-SUPPORT-REG-01'))}${field('Cases selected',select('cases',[['100','100 sample cases'],['250','250 sample cases'],['all','All bundled suite cases']],'100'))}${field('Candidate',select('candidate',[['PROMPT-SUPPORT-17:v18','v18 Candidate · REL-2026-08-27-A'],['REL-2026-08-27-A','Support v7.9-rc2 release candidate'],['AGT-SUPPORT-03:v7.8','Agent v7.8']],'PROMPT-SUPPORT-17:v18'))}${field('Baseline',select('baseline',[['PROMPT-SUPPORT-17:v17','v17 Production'],['v7.8','Support v7.8']],'PROMPT-SUPPORT-17:v17'))}${field('Evaluators',select('evaluators',['LLM judge + rules','Semantic + rules','Rules + human'],'LLM judge + rules'))}</div>`,onConfirm:(body,button,close)=>{
      const id=makeId('RUN-EVAL'), context={id,dataset:get(body,'dataset'),cases:get(body,'cases'),candidate:get(body,'candidate'),baseline:get(body,'baseline'),evaluators:get(body,'evaluators')}; try{localStorage.setItem('orvexa-evaluation-run-context',JSON.stringify(context));}catch(_){} close(); notify(`${id} started`,'play'); setTimeout(()=>{window.location.href=`./evaluations.html?run=${encodeURIComponent(id)}`;},180);
    }},trigger);
  }

  function openFailedCases(trigger){
    const failed=quality.cases.filter(c=>/fail/i.test(c.state));
    openModal({title:'Failed evaluation cases',copy:'Grounding evidence currently blocking REL-2026-08-27-A.',hideConfirm:true,cancel:'Close',body:`<div class="quality-gate-result is-blocked"><span>${icon('shield-x')}</span><div><b>EVAL-GROUND-012 · 95.1% vs 96.0% gate</b><p>18 grounding reviews remain in the current release gate. The static demo shows the featured canonical regression case below.</p><small>PROMPT-SUPPORT-17:v18 · Support v7.9-rc2 · 0% production traffic</small></div></div><div class="quality-case-list">${failed.map(c=>`<article><div><b>${esc(c.id)} · ${esc(c.input)}</b><small>${esc(c.expected)} · ${esc(c.trace)}</small></div><span>${statusMarkup(c.score,'bad')}</span></article>`).join('')||'<p>No failed cases.</p>'}<a class="p4-btn primary quality-inline-link" href="./datasets.html?case=CASE-18418&suite=EVAL-GROUND-012">${icon('table-properties')}Open failed case in dataset</a></div>`},trigger);
  }
  function exportEvaluationRuns(){ exportCsv('orvexa-evaluation-runs.csv',['Run','Candidate','Baseline','Score','Cost','Duration','State'],quality.evaluationRuns.map(r=>[r.id,r.candidate,r.baseline,r.score,r.cost,r.duration,r.state])); }

  function openCreatePolicy(trigger){
    workflowReturnFocus=trigger;
    const steps=['Basics','Scope','Conditions','Action','Human boundary','Test','Review'];
    let step=0;
    const state={name:'',owner:'Trust & Governance',category:'Tool authorization',scope:'All production',environment:'Production',match:'ALL',conditionA:'Financial write',conditionB:'Identity unverified',threshold:'Amount > $250',mode:'Enforce',action:'Human review',reviewer:'Finance Operations',sla:'5m',timeout:'Escalate',scenario:'Financial write · $420 · identity unverified',tested:false};
    const capture=()=>{ workflowDrawer.querySelectorAll('[name]').forEach(el=>{ if(el.type==='checkbox') state[el.name]=el.checked; else state[el.name]=el.value; }); };
    const stepMarkup=()=>{
      const nav=`<div class="quality-policy-steps">${steps.map((label,i)=>`<span class="${i===step?'active':i<step?'complete':''}"><b>${i+1}</b>${label}</span>`).join('')}</div>`;
      const heads=[
        ['Policy identity','Name the policy and assign accountable ownership.'],
        ['Scope','Define category, workload scope and environment.'],
        ['Conditions','Choose deterministic match logic and conditions.'],
        ['Action','Set the enforcement mode and runtime action.'],
        ['Human boundary','Configure accountable review when required.'],
        ['Test','Run a deterministic no-side-effect policy test.'],
        ['Review','Review the version before creating the draft.']
      ];
      const [h,c]=heads[step]; let body='';
      if(step===0) body=`<div class="quality-form-grid">${field('Policy name',input('name',state.name,'e.g. High-value refund authority'))}${field('Owner',input('owner',state.owner))}</div>`;
      if(step===1) body=`<div class="quality-form-grid">${field('Category',select('category',['Data & PII','Prompt security','Output safety','Tool authorization','Financial','Cost','Regional / compliance'],state.category))}${field('Scope',input('scope',state.scope))}${field('Environment',select('environment',['Production','Staging','All environments'],state.environment))}</div>`;
      if(step===2) body=`<div class="quality-form-grid">${field('Match logic',select('match',['ALL','ANY'],state.match),'ALL requires every condition; ANY requires one or more.')}${field('Condition 1',select('conditionA',['Financial write','PII detected','Prompt injection score > 0.82','Region mismatch'],state.conditionA))}${field('Condition 2',select('conditionB',['Identity unverified','Tenant ACL mismatch','Sensitive data present','Cost limit exceeded'],state.conditionB))}${field('Threshold / qualifier',input('threshold',state.threshold))}</div>`;
      if(step===3) body=`<div class="quality-form-grid">${field('Mode',select('mode',['Enforce','Monitor'],state.mode))}${field('Action',select('action',['Human review','Block','Redact','Safe response','Warn'],state.action))}</div>`;
      if(step===4) body=`<div class="quality-form-grid">${field('Reviewer',input('reviewer',state.reviewer))}${field('SLA',select('sla',['2m','5m','15m','30m'],state.sla))}${field('On timeout',select('timeout',['Escalate','Block','Safe response'],state.timeout))}</div>`;
      if(step===5) body=`<div class="quality-form-grid">${field('Sample request',textarea('scenario',state.scenario))}<div class="quality-policy-create-test"><button class="p4-btn" type="button" data-policy-create-test>${icon('flask-conical')}Run policy test</button><div data-policy-create-test-result>${state.tested?`<div class="quality-gate-result"><span>${icon('shield-check')}</span><div><b>Decision: ${esc(state.action)}</b><p>${esc(state.match)} conditions matched. No production side effects.</p><small>4ms · simulated · evidence retained</small></div></div>`:''}</div></div></div>`;
      if(step===6) body=`<div class="quality-policy-review-summary"><div><small>Policy</small><b>${esc(state.name||'Untitled policy')}</b><span>${esc(state.category)} · ${esc(state.scope)}</span></div><div><small>WHEN</small><b>${esc(state.match)} · ${esc(state.conditionA)} + ${esc(state.conditionB)}</b><span>${esc(state.threshold)}</span></div><div><small>THEN</small><b>${esc(state.action)}</b><span>${esc(state.reviewer)} · SLA ${esc(state.sla)} · ${esc(state.timeout)} on timeout</span></div><div><small>Test evidence</small><b>${state.tested?'Passed':'Not run'}</b><span>Static no-side-effect validation</span></div></div>`;
      return `${nav}<div class="quality-drawer-section"><h3>${h}</h3><p>${c}</p></div>${body}`;
    };
    const render=()=>{
      workflowDrawer.querySelector('#quality-workflow-title').textContent='Create policy';
      workflowDrawer.querySelector('#quality-workflow-copy').textContent='Versioned policy workflow · Basics → Scope → Conditions → Action → Human boundary → Test → Review';
      workflowDrawer.querySelector('#quality-workflow-body').innerHTML=stepMarkup();
      const footer=workflowDrawer.querySelector('#quality-workflow-footer');
      footer.innerHTML=`<button class="p4-btn" type="button" data-quality-workflow-close>Cancel</button><button class="p4-btn" type="button" data-policy-save-draft>${icon('save')}Save draft</button>${step?`<button class="p4-btn" type="button" data-policy-prev>${icon('arrow-left')}Previous</button>`:''}<button class="p4-btn primary" type="button" data-policy-next>${step===steps.length-1?`${icon('shield-plus')}Create policy`:`Next${icon('arrow-right')}`}</button>`;
      footer.querySelector('[data-policy-save-draft]').onclick=()=>{capture();notify('Policy draft saved locally','save');};
      footer.querySelector('[data-policy-prev]')?.addEventListener('click',()=>{capture();step--;render();});
      footer.querySelector('[data-policy-next]').onclick=()=>{capture(); if(step===0&&!state.name.trim()){notify('Policy name is required','circle-alert');return;} if(step<steps.length-1){step++;render();return;} const id=makeId('POL'); const tone={ 'Data & PII':'pii','Prompt security':'injection','Output safety':'output','Tool authorization':'tool','Financial':'financial','Cost':'cost','Regional / compliance':'neutral'}[state.category]||'neutral'; const card=document.createElement('button'); card.className=`p4-policy tone-${tone} quality-new-card`; card.type='button'; card.dataset.p4PolicyId=id;card.dataset.p4Inspect='';card.dataset.title=state.name;card.dataset.id=id;card.dataset.qualityPolicyMode=state.mode;card.dataset.qualityPolicyCategory=state.category;card.dataset.qualityPolicyState='Draft'; card.innerHTML=`<div class="p4-policy-top"><span><h3>${esc(state.name)}</h3><small class="p4-id">${id} / v1</small></span>${statusMarkup('Draft','info')}</div><div class="p4-policy-scope"><span>${esc(state.category)}</span><small>${esc(state.scope)}</small></div><div class="p4-policy-facts"><span><b>${esc(state.mode)}</b><small>Mode</small></span><span><b>${esc(state.threshold)}</b><small>Trigger</small></span><span><b>${esc(state.action)}</b><small>Action</small></span><span><b>${esc(state.owner)}</b><small>Owner</small></span></div>`; document.querySelector('.p4-policy-grid')?.prepend(card); wireInspector(card); closeWorkflowDrawer(); notify(`${id} created as draft`,'shield-plus'); };
      workflowDrawer.querySelector('[data-policy-create-test]')?.addEventListener('click',()=>{capture();state.tested=true;render();});
      refreshIcons();
    };
    workflowDrawer.classList.add('open'); workflowBackdrop.classList.add('open'); workflowDrawer.setAttribute('aria-hidden','false'); document.documentElement.classList.add('quality-modal-open'); render();
  }

  function openPolicySimulator(trigger){
    const activeConditions=[...document.querySelectorAll('[data-p4-builder-group="condition"].active')].map(el=>el.textContent.trim());
    const selectedAction=document.querySelector('[data-p4-builder-group="action"].active')?.textContent.trim()||'Human review';
    const match=document.querySelector('[data-policy-match].active')?.dataset.policyMatch||'ALL';
    const result=document.querySelector('#quality-policy-test-result'); if(!result)return;
    const matched=activeConditions.length;
    result.hidden=false;
    result.innerHTML=`<div class="quality-policy-inline-result"><div class="quality-policy-inline-head"><span>${icon('shield-check')}</span><div><small>Test request</small><b>Financial write · $420 · unverified identity</b></div><button class="quality-icon-btn" type="button" data-policy-test-dismiss aria-label="Dismiss test result">${icon('x')}</button></div><div class="quality-policy-inline-grid"><span><small>Decision</small><b>${esc(selectedAction)}</b></span><span><small>Policy</small><b>POL-TOOL-014:v9 draft</b></span><span><small>Latency</small><b>4ms</b></span><span><small>Matched conditions</small><b>${matched} / ${matched} · ${esc(match)}</b></span></div><p>no side effects · decision evidence is retained with the draft version and no production tool is executed.</p></div>`;
    result.scrollIntoView({behavior:'smooth',block:'nearest'}); refreshIcons(); notify(`Policy test returned ${selectedAction}`,'shield-check');
  }
  function savePolicyVersion(trigger){
    const status=document.querySelector('.p4-policy-composer-panel .p4-status') || [...document.querySelectorAll('.p4-status')].find(el=>el.textContent.trim()==='Draft');
    if(status){status.className='p4-status good';status.textContent='Saved v9';}
    notify('Policy version saved with simulation evidence', 'save');
  }

  function openCampaign(trigger){
    workflowReturnFocus=trigger;
    const steps=['Scope','Attack families','Intensity','Policies','Dataset','Review'];
    let step=0;
    const state={name:'',target:'All applications',owner:'AI Safety',families:['Prompt injection','Tool abuse'],intensity:'Standard',policies:['POL-INJECTION-004','POL-TOOL-014','POL-PII-001','POL-OUTPUT-007'],dataset:'DATASET-SAFETY-INJ-03',cases:'500',execution:'Simulation only'};
    const capture=()=>{
      workflowDrawer.querySelectorAll('[name]').forEach(el=>{
        if(el.type==='checkbox'){
          const list=state[el.dataset.list]||[], value=el.value;
          state[el.dataset.list]=el.checked?[...new Set([...list,value])]:list.filter(v=>v!==value);
        } else state[el.name]=el.value;
      });
    };
    const checks=(list,values)=>`<div class="quality-checkbox-grid">${values.map(value=>`<label class="quality-checkbox"><input type="checkbox" data-list="${list}" name="${list}-${value.replace(/\W+/g,'-')}" value="${esc(value)}" ${(state[list]||[]).includes(value)?'checked':''}><span>${esc(value)}</span></label>`).join('')}</div>`;
    const render=()=>{
      const nav=`<div class="quality-safety-steps">${steps.map((label,i)=>`<span class="${i===step?'active':i<step?'complete':''}"><b>${i+1}</b>${label}</span>`).join('')}</div>`;
      const heads=[['Campaign scope','Name the controlled campaign and select the governed target.'],['Attack families','Choose the adversarial families included in this campaign.'],['Intensity','Set static-demo depth and the number of planned cases.'],['Safety policies','Choose the policies whose enforcement evidence will be verified.'],['Attack dataset','Attach an approved adversarial dataset or custom-case set.'],['Review','Confirm scope, policy coverage and execution intent before starting.']];
      const [h,c]=heads[step]; let body='';
      if(step===0) body=`<div class="quality-form-grid">${field('Campaign name',input('name',state.name,'e.g. Cross-tenant authority challenge'))}${field('Target',select('target',['All applications','Production agents','Support + Contact','Knowledge spaces'],state.target))}${field('Owner',input('owner',state.owner))}</div>`;
      if(step===1) body=checks('families',['Prompt injection','Jailbreak','Sensitive data','Tool abuse','Impersonation','RAG poisoning']);
      if(step===2) body=`<div class="quality-form-grid">${field('Intensity',select('intensity',['Quick','Standard','Deep'],state.intensity))}${field('Attack cases',input('cases',state.cases),'Static demo execution; no real production attack traffic is sent.')}</div>`;
      if(step===3) body=checks('policies',['POL-INJECTION-004','POL-TOOL-014','POL-PII-001','POL-OUTPUT-007']);
      if(step===4) body=`<div class="quality-form-grid">${field('Dataset',select('dataset',[['DATASET-SAFETY-INJ-03','Safety Injection Set'],['CUSTOM-CASES','Custom approved cases']],state.dataset))}${field('Execution mode',select('execution',['Simulation only','Shadow evidence'],state.execution),'No backend attack execution is claimed in the static HTML demo.')}</div>`;
      if(step===5) body=`<div class="quality-safety-review"><div><small>Campaign</small><b>${esc(state.name||'Untitled campaign')}</b><span>${esc(state.target)} · ${esc(state.intensity)} · ${esc(state.cases)} planned cases</span></div><div><small>Attack families</small><b>${esc((state.families||[]).join(' · ')||'None selected')}</b><span>${esc(state.owner)}</span></div><div><small>Policies</small><b>${esc((state.policies||[]).join(' · ')||'No policies selected')}</b><span>${esc(state.dataset)} · ${esc(state.execution)}</span></div></div>`;
      workflowDrawer.querySelector('#quality-workflow-title').textContent='New red-team campaign';
      workflowDrawer.querySelector('#quality-workflow-copy').textContent='Scope → Attack families → Intensity → Policies → Dataset → Review';
      workflowDrawer.querySelector('#quality-workflow-body').innerHTML=`${nav}<div class="quality-drawer-section"><h3>${h}</h3><p>${c}</p></div>${body}`;
      const footer=workflowDrawer.querySelector('#quality-workflow-footer');
      footer.innerHTML=`<button class="p4-btn" type="button" data-quality-workflow-close>Cancel</button><button class="p4-btn" type="button" data-safety-save-draft>${icon('save')}Save draft</button>${step?`<button class="p4-btn" type="button" data-safety-prev>${icon('arrow-left')}Previous</button>`:''}<button class="p4-btn primary" type="button" data-safety-next>${step===steps.length-1?`${icon('shield-alert')}Start campaign`:`Next${icon('arrow-right')}`}</button>`;
      footer.querySelector('[data-safety-save-draft]').onclick=()=>{capture();notify('Red-team campaign draft saved locally','save');};
      footer.querySelector('[data-safety-prev]')?.addEventListener('click',()=>{capture();step--;render();});
      footer.querySelector('[data-safety-next]').onclick=()=>{
        capture();
        if(step===0&&!state.name.trim()){notify('Campaign name is required','circle-alert');return;}
        if(step===1&&!(state.families||[]).length){notify('Select at least one attack family','circle-alert');return;}
        if(step===3&&!(state.policies||[]).length){notify('Select at least one policy','circle-alert');return;}
        if(step<steps.length-1){step++;render();return;}
        const id=makeId('SAFE-CAMP'), card=document.createElement('button');
        card.className='p4-campaign tone-injection state-running quality-new-card';card.type='button';card.dataset.p4Inspect='';card.dataset.title=state.name;card.dataset.id=id;
        card.innerHTML=`<div class="p4-campaign-top"><span><h3>${esc(state.name)}</h3><small class="p4-id">${id}</small></span>${statusMarkup('Running','live')}</div><small>${esc(state.target)} · Just now</small><div class="p4-campaign-focus">${esc((state.families||[]).slice(0,2).join(' · '))}</div><div class="p4-scoreline safety-campaign-facts"><span><small>Attacks</small><b>${esc(state.cases)}</b></span><span><small>Pass</small><b>Pending</b></span><span><small>Findings</small><b>0</b></span><span><small>Target</small><b>${esc(state.target)}</b></span></div><div class="p4-campaign-progress"><div><span>Live campaign progress</span><b>0 / ${esc(state.cases)} · 0%</b></div><div class="p4-campaign-track"><i style="width:0%"></i></div></div>`;
        document.querySelector('.p4-campaign-grid')?.prepend(card);wireInspector(card);closeWorkflowDrawer();notify(`${id} started in controlled simulation`,'shield-alert');
      };
      refreshIcons();
    };
    workflowDrawer.classList.add('open');workflowBackdrop.classList.add('open');workflowDrawer.setAttribute('aria-hidden','false');document.documentElement.classList.add('quality-modal-open');render();
  }
  function openSafetyRegressionCase(attack,trigger){
    openWorkflowDrawer({title:'Create safety regression case',copy:`${attack.id} · ${attack.trace} · prefilled from red-team evidence.`,confirm:'Create regression case',confirmIcon:'table-properties',body:`<div class="quality-form-grid">${field('Finding ID',input('finding',attack.id))}${field('Target',input('target',attack.target))}${field('Source trace',input('trace',attack.trace))}${field('Observed attack',textarea('input',attack.attack))}${field('Expected behavior',textarea('expected',`${attack.outcome} under ${attack.policy}; preserve evidence and prevent unsafe side effects.`))}${field('Target dataset',select('dataset',[[attack.dataset||'DATASET-SAFETY-INJ-03','Safety Injection Set'],['DATASET-SUPPORT-REG-01','Support Regression']],attack.dataset||'DATASET-SAFETY-INJ-03'))}${field('Difficulty',select('difficulty',['Critical','Hard','Medium'],attack.severity==='Critical'?'Critical':'Hard'))}</div>`,onConfirm:(body,button,close)=>{close();notify(`${attack.id} added to ${get(body,'dataset')}`,'table-properties');}},trigger);
  }
  function exportSafetyFindings(){ exportCsv('orvexa-safety-findings.csv',['Attack','Target','Policy','Outcome','Severity','Trace','State'],quality.attacks.map(a=>[a.attack,a.target,a.policy,a.outcome,a.severity,a.trace,a.state])); }

  function openExperiment(trigger){
    workflowReturnFocus=trigger;
    const steps=['Experiment type','Baseline','Candidate','Success metrics','Release gates','Exposure plan','Review'];
    let step=0;
    const state={name:'',type:'Prompt A/B',application:'APP-SUPPORT-001',baseline:'Support v7.8',candidate:'Support v7.9-rc3',primary:'Grounding quality',success:'+0.5 pp or better',qualityGate:'96.0%',safetyGate:'99.0%',costGuardrail:'≤ +5%',exposure:'Shadow → 5% → 10% → 25% → 50% → 100%',notes:'Start with zero production traffic and advance only after release gates pass.'};
    const capture=()=>{const body=workflowDrawer.querySelector('#quality-workflow-body');['name','type','application','baseline','candidate','primary','success','qualityGate','safetyGate','costGuardrail','exposure','notes'].forEach(k=>{const el=body.querySelector(`[name="${k}"]`);if(el)state[k]=el.value.trim();});};
    const render=()=>{
      workflowDrawer.querySelector('#quality-workflow-title').textContent='New experiment';
      workflowDrawer.querySelector('#quality-workflow-copy').textContent='Define a reversible AI change and the evidence required before production exposure.';
      const body=workflowDrawer.querySelector('#quality-workflow-body');
      const stepbar=`<div class="quality-release-steps">${steps.map((label,i)=>`<span class="${i===step?'active':i<step?'complete':''}"><b>${i+1}</b>${label}</span>`).join('')}</div>`;
      let content='';
      if(step===0) content=`<div class="quality-drawer-section"><h3>Experiment type</h3><p>Choose the controlled change and application scope.</p></div><div class="quality-form-grid">${field('Experiment name',input('name',state.name,'e.g. Support retrieval threshold v2'))}${field('Type',select('type',['Prompt A/B','Model comparison','Route comparison','RAG policy','Agent version'],state.type))}${field('Application',select('application',[['APP-SUPPORT-001','Support AI'],['APP-CONTACT-002','AI Contact Center'],['APP-DOC-003','Document Intelligence'],['APP-GROWTH-004','Growth Assistant']],state.application))}</div>`;
      if(step===1) content=`<div class="quality-drawer-section"><h3>Production baseline</h3><p>Pin the currently stable version used for comparison and rollback.</p></div><div class="quality-form-grid">${field('Baseline',input('baseline',state.baseline))}<div class="quality-gate-result"><span>${icon('shield-check')}</span><div><b>Baseline remains active</b><p>No candidate traffic is enabled during Draft or Evaluation.</p><small>Rollback always targets a previous stable release, never a forward lifecycle stage.</small></div></div></div>`;
      if(step===2) content=`<div class="quality-drawer-section"><h3>Candidate</h3><p>Describe the version or policy change under test.</p></div><div class="quality-form-grid">${field('Candidate',input('candidate',state.candidate))}${field('Change notes',textarea('notes',state.notes,'What is changing and why?'))}</div>`;
      if(step===3) content=`<div class="quality-drawer-section"><h3>Success metrics</h3><p>Define the primary outcome that determines whether the experiment is worthwhile.</p></div><div class="quality-form-grid">${field('Primary metric',select('primary',['Grounding quality','Task completion','Turn latency','Cost efficiency','Safety pass'],state.primary))}${field('Success condition',input('success',state.success))}</div>`;
      if(step===4) content=`<div class="quality-drawer-section"><h3>Release gates</h3><p>Promotion remains fail-closed when any non-negotiable gate is missed.</p></div><div class="quality-form-grid">${field('Quality gate',input('qualityGate',state.qualityGate))}${field('Safety gate',input('safetyGate',state.safetyGate))}${field('Cost guardrail',input('costGuardrail',state.costGuardrail))}</div>`;
      if(step===5) content=`<div class="quality-drawer-section"><h3>Exposure plan</h3><p>Start with shadow evidence, then move through controlled canary percentages before production.</p></div>${field('Rollout plan',select('exposure',['Shadow → 5% → 10% → 25% → 50% → 100%','Shadow → 10% → 25% → 50% → 100%','Shadow only until manual promotion'],state.exposure))}<div class="quality-rollout-preview"><span>Shadow</span>${icon('arrow-right')}<span>5%</span>${icon('arrow-right')}<span>10%</span>${icon('arrow-right')}<span>25%</span>${icon('arrow-right')}<span>50%</span>${icon('arrow-right')}<span>100%</span></div>`;
      if(step===6) content=`<div class="quality-drawer-section"><h3>Review</h3><p>The experiment begins in Draft with zero production traffic.</p></div><div class="quality-safety-review"><div><small>Experiment</small><b>${esc(state.name||'Untitled experiment')}</b><span>${esc(state.type)} · ${esc(state.application)}</span></div><div><small>Baseline → Candidate</small><b>${esc(state.baseline)} → ${esc(state.candidate)}</b><span>${esc(state.primary)} · ${esc(state.success)}</span></div><div><small>Gates</small><b>${esc(state.qualityGate)} quality · ${esc(state.safetyGate)} safety</b><span>${esc(state.costGuardrail)} cost</span></div><div><small>Exposure</small><b>${esc(state.exposure)}</b><span>Rollback returns to the pinned previous stable version.</span></div></div>`;
      body.innerHTML=stepbar+content;
      const footer=workflowDrawer.querySelector('#quality-workflow-footer');
      footer.innerHTML=`<button class="p4-btn" type="button" data-quality-workflow-close>Cancel</button><button class="p4-btn" type="button" data-release-save-draft>${icon('save')}Save draft</button>${step?`<button class="p4-btn" type="button" data-release-prev>${icon('arrow-left')}Previous</button>`:''}<button class="p4-btn primary" type="button" data-release-next>${step===steps.length-1?`${icon('git-compare-arrows')}Create experiment`:`Next${icon('arrow-right')}`}</button>`;
      footer.querySelector('[data-release-save-draft]').onclick=()=>{capture();notify('Experiment draft saved locally','save');};
      footer.querySelector('[data-release-prev]')?.addEventListener('click',()=>{capture();step--;render();});
      footer.querySelector('[data-release-next]').onclick=()=>{
        capture();
        if(step===0&&!state.name){notify('Experiment name is required','circle-alert');return;}
        if(step<steps.length-1){step++;render();return;}
        const id=makeId('REL-2026');
        const toneMap={'APP-SUPPORT-001':'support','APP-CONTACT-002':'contact','APP-DOC-003':'document','APP-GROWTH-004':'growth'},releaseTone=toneMap[state.application]||'support';
        quality.releases.unshift({id,name:state.name,app:state.application,tone:releaseTone,experiment:state.type,baseline:state.baseline,candidate:state.candidate,traffic:'0%',quality:'Pending',latency:'Pending',cost:'Pending',safety:'Pending',gate:'Review',stage:'Draft',evaluation:'Pending',evidence:`${state.primary} · ${state.success}`,rollback:`${state.baseline} stable`});
        const card=document.createElement('button'); card.className=`p4-release tone-${releaseTone} stage-draft gate-review quality-new-card`; card.type='button'; card.dataset.p4Release=`${state.name} ${state.type} draft review ${state.application}`.toLowerCase(); card.dataset.p4ReleaseId=id; card.dataset.p4Inspect=''; card.dataset.title=state.name; card.dataset.id=id; card.dataset.qualityReleaseStage='Draft'; card.dataset.qualityReleaseGate='Review'; card.dataset.qualityReleaseApp=state.application; card.dataset.qualityReleaseType=state.type;
        card.innerHTML=`<div class="p4-release-top"><span><h3>${esc(state.name)}</h3><small class="p4-id">${id}</small></span>${statusMarkup('Review','warn')}</div><small>${esc(state.type)} · ${esc(state.baseline)} → ${esc(state.candidate)}</small><div class="p4-release-deltas"><span><b>Pending</b><small>Quality</small></span><span><b>Pending</b><small>Latency</small></span><span><b>Pending</b><small>Cost</small></span></div><div class="p4-release-foot"><span>${statusMarkup('Draft','info')}</span><small>0% traffic · Safety pending</small></div>`;
        document.querySelector('#p4-release-grid')?.prepend(card);wireInspector(card);bumpMetric('Active experiments',1);closeWorkflowDrawer();notify(`${id} created in Draft`,'git-compare-arrows');
      };
      refreshIcons();
    };
    workflowDrawer.classList.add('open');workflowBackdrop.classList.add('open');workflowDrawer.setAttribute('aria-hidden','false');document.documentElement.classList.add('quality-modal-open');render();
  }
  function openReleaseFilters(trigger){
    const types=['Prompt + RAG policy','Model route comparison','RAG policy','Prompt v18 + image route mix'];
    openWorkflowDrawer({title:'More release filters',copy:'Narrow the featured experiment matrix without duplicating the Stage and Gate controls.',confirm:'Apply filters',confirmIcon:'filter',body:`<div class="quality-drawer-kicker">Stage and Gate remain in the toolbar</div><div class="quality-form-grid">${field('Application',select('application',[['','All applications'],['APP-SUPPORT-001','Support AI'],['APP-CONTACT-002','AI Contact Center'],['APP-DOC-003','Document Intelligence'],['APP-GROWTH-004','Growth Assistant']]))}${field('Experiment type',select('type',[['','All experiment types'],...types.map(v=>[v,v])]))}</div>`,onConfirm:(body,button,close)=>{window.OrvexaReleaseFilters={application:get(body,'application'),type:get(body,'type')};window.dispatchEvent(new CustomEvent('orvexa:release-filter-change'));close();notify('Release filters applied','filter');}},trigger);
  }
  function returnBlockedCandidateToDraft(trigger){
    const release=quality.releases.find(r=>r.id==='REL-2026-08-27-A');
    openModal({title:'Return candidate to draft',copy:'The blocked candidate has never received production traffic, so this is a lifecycle reset—not a rollback.',confirm:'Return to draft',confirmIcon:'corner-down-left',danger:true,body:`<div class="quality-gate-result is-blocked"><span>${icon('shield-x')}</span><div><b>REL-2026-08-27-A · grounding gate failed</b><p>95.1% observed · 96.0% required · 0% production traffic.</p><small>Production baseline Support v7.8 remains unchanged.</small></div></div>${field('Reason',textarea('reason','','Why should this candidate return to Draft?'))}`,onConfirm:(body,button,close)=>{if(!get(body,'reason')){notify('A return-to-draft reason is required','circle-alert');return;}if(release){release.stage='Draft';release.gate='Review';}const card=document.querySelector('[data-p4-release-id="REL-2026-08-27-A"]');if(card){card.dataset.qualityReleaseStage='Draft';card.dataset.qualityReleaseGate='Review';const stage=card.querySelector('.p4-release-foot .p4-status');if(stage){stage.className='p4-status info';stage.textContent='Draft';}const gate=card.querySelector('.p4-release-top .p4-status');if(gate){gate.className='p4-status warn';gate.textContent='Review';}}const note=document.querySelector('.p4-blocked-evidence');if(note){note.classList.add('quality-returned-draft');note.querySelector('b').textContent='Candidate returned to Draft';note.querySelector('p').innerHTML='<strong>Support v7.8 remains Production</strong> · v7.9-rc2 retained with evaluation evidence and 0% traffic.';}const panel=document.querySelector('.p4-blocked-release-panel');if(panel){const copy=panel.querySelector('.p4-panel-head p');if(copy)copy.textContent='Support v7.9-rc2 is back in Draft; evaluation evidence remains retained for the next revision.';const badge=panel.querySelector('.p4-panel-head .p4-status');if(badge){badge.className='p4-status warn';badge.textContent='Draft';}}trigger.disabled=true;trigger.innerHTML=`${icon('check')}Returned to draft`;refreshIcons();close();notify('REL-2026-08-27-A returned to Draft','corner-down-left');}},trigger);
  }

  function bumpMetric(label, delta){
    const metric=[...document.querySelectorAll('.p4-metric')].find(el=>el.querySelector('small')?.textContent.trim()===label); if(!metric)return;
    const strong=metric.querySelector('strong'); const raw=strong.textContent.replaceAll(',',''); const n=Number(raw); if(Number.isFinite(n)) strong.textContent=(n+delta).toLocaleString();
  }

  function wireInspector(element){
    element.addEventListener('click',()=>{
      const drawer=document.querySelector('.p4-drawer'); if(!drawer)return;
      const title=drawer.querySelector('#p4-drawer-title'), id=drawer.querySelector('#p4-drawer-id'); if(title)title.textContent=element.dataset.title||'Inspector'; if(id)id.textContent=element.dataset.id||'';
      drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); document.querySelector('.p4-drawer-backdrop')?.classList.add('open');
    });
  }

  function addDatasetFilters(){
    const datasetGrid=document.querySelector('#p4-dataset-grid'); if(!datasetGrid)return;
    quality.datasets.forEach((d,i)=>{ const card=datasetGrid.children[i]; if(card){card.dataset.qualityDatasetState=d.state;card.dataset.qualityDatasetApp=d.app;} });
    const caseRows=[...document.querySelectorAll('#p4-case-table [data-p4-case]')]; quality.cases.forEach((c,i)=>{if(caseRows[i]){caseRows[i].dataset.qualityCaseDifficulty=c.difficulty;caseRows[i].dataset.qualityCaseStatus=c.state;}});
    const applyDataset=()=>{const q=document.querySelector('#p4-dataset-search')?.value.trim().toLowerCase()||'',state=document.querySelector('#quality-dataset-state')?.value||'';let visible=0;[...datasetGrid.children].forEach(card=>{const hide=!!((q&&!card.dataset.p4Dataset?.includes(q))||(state&&card.dataset.qualityDatasetState!==state));card.hidden=hide;if(!hide)visible++;});const empty=document.querySelector('#p4-dataset-empty');if(empty)empty.hidden=visible>0;};
    const applyCases=()=>{const q=document.querySelector('#p4-case-search')?.value.trim().toLowerCase()||'',difficulty=document.querySelector('#quality-case-difficulty')?.value||'',status=document.querySelector('#quality-case-status')?.value||'';let visible=0;caseRows.forEach(row=>{const hide=!!((q&&!row.dataset.p4Case?.includes(q))||(difficulty&&row.dataset.qualityCaseDifficulty!==difficulty)||(status&&row.dataset.qualityCaseStatus!==status));row.hidden=hide;if(!hide)visible++;});const empty=document.querySelector('#p4-case-empty');if(empty)empty.hidden=visible>0;};
    document.querySelector('#p4-dataset-search')?.addEventListener('input',applyDataset);document.querySelector('#quality-dataset-state')?.addEventListener('change',applyDataset);document.querySelector('#p4-case-search')?.addEventListener('input',applyCases);document.querySelector('#quality-case-difficulty')?.addEventListener('change',applyCases);document.querySelector('#quality-case-status')?.addEventListener('change',applyCases);
  }

  function addEvaluationFilters(){
    const grid=document.querySelector('.p4-suite-grid'); if(grid){ quality.evaluationSuites.forEach((s,i)=>{if(grid.children[i])grid.children[i].dataset.qualitySuiteState=s.state;}); const head=grid.closest('.p4-panel')?.querySelector('.p4-panel-head'); head?.querySelector('.p4-btn')?.insertAdjacentHTML('beforebegin',`<select class="quality-mini-select" id="quality-suite-state"><option value="">All states</option><option>Pass</option><option>Blocked</option></select>`); document.querySelector('#quality-suite-state')?.addEventListener('change',e=>[...grid.children].forEach(card=>card.hidden=!!e.target.value&&card.dataset.qualitySuiteState!==e.target.value)); }
  }

  function feedbackById(id){ return quality.feedback.find(item => item.id === id); }
  function feedbackDatasetOptions(selected){ return quality.datasets.map(d => [d.id,`${d.name} · ${d.id}`]); }
  function openFeedbackFilters(trigger){
    const current=window.OrvexaQualityFeedbackFilters?.get?.() || {period:'30D',source:'',status:'',driver:''};
    const sources=[...new Set(quality.feedback.map(item=>item.source))];
    const statuses=[...new Set(quality.feedback.map(item=>item.state))];
    const drivers=[...new Set(quality.feedback.map(item=>item.driver))];
    openWorkflowDrawer({title:'Feedback filters',copy:'Refine the production feedback queue while the dashboard remains anchored to the Last 30 days.',confirm:'Apply filters',confirmIcon:'filter',body:`<div class="quality-drawer-kicker">Dashboard window · Last 30 days</div><div class="quality-drawer-section"><h3>Advanced feedback filters</h3><p>Filter the recent evidence list by source, workflow state and quality driver.</p></div><div class="quality-form-grid">${field('Evidence period',select('period',[['24H','Last 24 hours'],['7D','Last 7 days'],['30D','Last 30 days']],current.period||'30D'),'Summary KPIs stay on the locked Last 30 days; this narrows only the recent evidence queue.')}${field('Source',select('source',[['','All sources'],...sources.map(v=>[v,v])],current.source))}${field('Status',select('status',[['','All statuses'],...statuses.map(v=>[v,v])],current.status))}${field('Quality driver',select('driver',[['','All drivers'],...drivers.map(v=>[v,v])],current.driver))}</div>`,onConfirm:(body,button,close)=>{
      window.OrvexaQualityFeedbackFilters?.set?.({period:get(body,'period')||'30D',source:get(body,'source'),status:get(body,'status'),driver:get(body,'driver')});
      close(); notify('Feedback filters applied','filter');
    }},trigger);
  }

  function openFeedbackReview(item,trigger){
    openWorkflowDrawer({title:'Review feedback signal',copy:`${item.id} · ${item.app} · ${item.trace}`,confirm:'Save review',confirmIcon:'check',body:`<div class="quality-gate-result"><span>${icon('message-square-warning')}</span><div><b>${esc(item.driver)}</b><p>${esc(item.detail)}</p><small>${esc(item.source)} · ${esc(item.received)}</small></div></div><div class="quality-form-grid">${field('Workflow state',select('state',['Untriaged','Review','Triaged','Closed'],item.state))}${field('Reviewer note',textarea('note','','Record the decision or next action…'))}</div>`,onConfirm:(body,button,close)=>{
      item.state=get(body,'state')||'Review'; const row=document.querySelector(`[data-feedback-id="${item.id}"]`); if(row){ row.className=row.className.replace(/state-[^ ]+/g,'').trim()+` state-${item.state.toLowerCase().replaceAll(' ','-')}`; const badge=row.querySelector('.p4-status'); if(badge){ const map={Untriaged:'neutral',Review:'warn',Triaged:'info',Closed:'good'}; badge.className=`p4-status ${map[item.state]||'info'}`; badge.textContent=item.state; } row.dataset.qualityFeedbackState=item.state; }
      window.OrvexaQualityFeedbackFilters?.apply?.(); close(); notify(`${item.id} review saved`,'check');
    }},trigger);
  }

  function openRegressionFromFeedback(item,trigger){
    openWorkflowDrawer({title:'Create regression case',copy:'Convert production feedback into a reusable, trace-linked regression scenario.',confirm:'Create regression case',confirmIcon:'plus',body:`<div class="quality-drawer-kicker">Feedback → Trace → Expected behavior → Dataset</div><div class="quality-gate-result"><span>${icon('git-branch')}</span><div><b>${esc(item.id)} · ${esc(item.driver)}</b><p>${esc(item.detail)}</p><small>${esc(item.app)} · ${esc(item.trace)}</small></div></div><div class="quality-form-grid">${field('Feedback ID',input('feedbackId',item.id),'Read-only source evidence')}${field('Application',input('application',item.app))}${field('Source trace',input('trace',item.trace))}${field('Target dataset',select('dataset',feedbackDatasetOptions(),item.targetDataset||quality.datasets[0]?.id))}${field('Observed problem',textarea('problem',item.detail))}${field('Expected behavior',textarea('expected',item.expected||''))}${field('Suggested tags',input('tags',`${item.driver.toLowerCase().replaceAll(' ','-')}, feedback`))}${field('Required threshold',input('threshold','95.0%'))}</div>`,onConfirm:(body,button,close)=>{
      if(!get(body,'expected')){notify('Expected behavior is required','circle-alert');return;}
      const caseId=makeId('CASE'); close(); const action=trigger.closest('.p4-feedback')?.querySelector('[data-quality-feedback-action="regression"]'); if(action){action.disabled=true;action.innerHTML=`${icon('check')}Regression case added`;refreshIcons();} notify(`${caseId} created from ${item.id}`,'table-properties');
    }},trigger);
  }

  function openGoldenFromFeedback(item,trigger){
    openWorkflowDrawer({title:'Save as golden case',copy:'Preserve a successful production behavior as positive regression evidence.',confirm:'Save golden case',confirmIcon:'sparkles',body:`<div class="quality-drawer-kicker">Positive signal → Verified trace → Golden behavior</div><div class="quality-gate-result"><span>${icon('thumbs-up')}</span><div><b>${esc(item.id)} · ${esc(item.driver)}</b><p>${esc(item.detail)}</p><small>${esc(item.app)} · ${esc(item.trace)}</small></div></div><div class="quality-form-grid">${field('Feedback ID',input('feedbackId',item.id))}${field('Application',input('application',item.app))}${field('Source trace',input('trace',item.trace))}${field('Target dataset',select('dataset',feedbackDatasetOptions(),item.targetDataset||'DATASET-SUPPORT-REG-01'))}${field('Golden behavior',textarea('expected',item.expected||item.detail))}${field('Tags',input('tags','golden, positive, cited'))}</div>`,onConfirm:(body,button,close)=>{
      const goldenId=makeId('GOLDEN'); close(); const action=trigger.closest('.p4-feedback')?.querySelector('[data-quality-feedback-action="golden"]'); if(action){action.disabled=true;action.innerHTML=`${icon('check')}Golden case saved`;refreshIcons();} notify(`${goldenId} saved from ${item.id}`,'sparkles');
    }},trigger);
  }

  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-quality-feedback-action]'); if(!trigger)return; event.preventDefault(); event.stopPropagation();
    const item=feedbackById(trigger.dataset.feedbackId); if(!item)return; const action=trigger.dataset.qualityFeedbackAction;
    if(action==='review') return openFeedbackReview(item,trigger);
    if(action==='regression') return openRegressionFromFeedback(item,trigger);
    if(action==='golden') return openGoldenFromFeedback(item,trigger);
    if(action==='trace'){ window.location.href=`./traces.html?trace=${encodeURIComponent(item.trace)}&feedback=${encodeURIComponent(item.id)}`; return; }
    if(action==='issue'){ window.location.href=`./ai-issues.html?trace=${encodeURIComponent(item.trace)}&feedback=${encodeURIComponent(item.id)}`; }
  },true);

  function addFeedbackFilters(){
    const rows=[...document.querySelectorAll('[data-p4-feedback-row]')]; if(!rows.length)return;
    quality.feedback.forEach((f,i)=>{ if(rows[i]){rows[i].dataset.qualityFeedbackApp=f.app;rows[i].dataset.qualityFeedbackSignal=f.signal;rows[i].dataset.qualityFeedbackSource=f.source;rows[i].dataset.qualityFeedbackState=f.state;rows[i].dataset.qualityFeedbackDriver=f.driver;const age=parseFloat(f.received)||0;rows[i].dataset.qualityFeedbackAgeMinutes=/d/.test(f.received)?age*1440:/h/.test(f.received)?age*60:age;rows[i].dataset.qualityFeedbackSearch=`${f.id} ${f.driver} ${f.detail} ${f.trace} ${f.app} ${f.source}`.toLowerCase();} });
    const panel=rows[0].closest('.p4-panel'); const head=panel?.querySelector('.p4-panel-head');
    head?.insertAdjacentHTML('beforeend',`<div class="quality-toolbar quality-feedback-toolbar"><input class="quality-mini-input" id="quality-feedback-search" placeholder="Search feedback"><select class="quality-mini-select" id="quality-feedback-app"><option value="">All applications</option><option value="APP-SUPPORT-001">Support AI</option><option value="APP-CONTACT-002">AI Contact Center</option><option value="APP-DOC-003">Document Intelligence</option></select><select class="quality-mini-select" id="quality-feedback-signal"><option value="">All signals</option><option>Negative</option><option>Correction</option><option>Escalated</option><option>Positive</option></select></div>`);
    const advanced={period:'30D',source:'',status:'',driver:''};
    const periodLimit={ '24H':1440, '7D':10080, '30D':43200 };
    const apply=()=>{ const q=document.querySelector('#quality-feedback-search')?.value.trim().toLowerCase()||'', app=document.querySelector('#quality-feedback-app')?.value||'', signal=document.querySelector('#quality-feedback-signal')?.value||'', limit=periodLimit[advanced.period]||43200; rows.forEach(r=>{ r.hidden=!!((q&&!r.dataset.qualityFeedbackSearch.includes(q))||(app&&r.dataset.qualityFeedbackApp!==app)||(signal&&r.dataset.qualityFeedbackSignal!==signal)||(advanced.source&&r.dataset.qualityFeedbackSource!==advanced.source)||(advanced.status&&r.dataset.qualityFeedbackState!==advanced.status)||(advanced.driver&&r.dataset.qualityFeedbackDriver!==advanced.driver)||(Number(r.dataset.qualityFeedbackAgeMinutes||0)>limit)); }); };
    window.OrvexaQualityFeedbackFilters={get:()=>({...advanced}),set:next=>{Object.assign(advanced,next||{});apply();},apply};
    ['quality-feedback-search','quality-feedback-app','quality-feedback-signal'].forEach(id=>document.getElementById(id)?.addEventListener(id.includes('search')?'input':'change',apply));
  }

  function addPolicyFilters(){
    const grid=document.querySelector('.p4-policy-grid'); if(!grid)return;
    quality.policies.forEach((p,i)=>{const card=grid.children[i];if(card){card.dataset.qualityPolicyMode=p.mode;card.dataset.qualityPolicyState=p.state;card.dataset.qualityPolicyCategory=p.category||'';}});
    const head=grid.closest('.p4-panel')?.querySelector('.p4-panel-head');
    head?.querySelector('.p4-btn')?.insertAdjacentHTML('beforebegin',`<div class="quality-toolbar quality-policy-toolbar"><select class="quality-mini-select" id="quality-policy-mode"><option value="">All modes</option><option>Enforce</option><option>Monitor</option></select><select class="quality-mini-select" id="quality-policy-category"><option value="">All categories</option><option>Data &amp; PII</option><option>Prompt security</option><option>Output safety</option><option>Tool authorization</option><option>Financial</option><option>Cost</option><option>Regional / compliance</option></select></div>`);
    const apply=()=>{const mode=document.querySelector('#quality-policy-mode')?.value||'',category=document.querySelector('#quality-policy-category')?.value||'';[...grid.children].forEach(card=>card.hidden=!!((mode&&card.dataset.qualityPolicyMode!==mode)||(category&&card.dataset.qualityPolicyCategory!==category)));};
    document.querySelector('#quality-policy-mode')?.addEventListener('change',apply);document.querySelector('#quality-policy-category')?.addEventListener('change',apply);
    const updatePreview=()=>{const conditions=[...document.querySelectorAll('[data-p4-builder-group="condition"].active')].map(el=>el.textContent.trim()),action=document.querySelector('[data-p4-builder-group="action"].active')?.textContent.trim()||'Human review',match=document.querySelector('[data-policy-match].active')?.dataset.policyMatch||'ALL',p=document.querySelector('[data-quality-policy-preview]');if(p)p.textContent=`Preview: WHEN ${match} conditions match (${conditions.join(' + ')}) → ${action}${/Human review/i.test(action)?' · Finance Operations · 5m SLA.':'.'}`;};
    window.addEventListener('orvexa:policy-composer-change',updatePreview); updatePreview();
  }

  function addSafetyFilters(){
    const table=[...document.querySelectorAll('.p4-table')].find(t=>t.querySelector('.p4-table-head')?.textContent.includes('Attack')); if(!table)return; const rows=[...table.querySelectorAll('.p4-row')]; quality.attacks.forEach((a,i)=>{if(rows[i]){rows[i].dataset.qualityAttackSeverity=a.severity;rows[i].dataset.qualityAttackState=a.state;rows[i].dataset.qualityAttackSearch=`${a.attack} ${a.target} ${a.policy} ${a.trace}`.toLowerCase();}});
    const head=table.closest('.p4-panel')?.querySelector('.p4-panel-head'); head?.insertAdjacentHTML('beforeend',`<div class="quality-toolbar"><input class="quality-mini-input" id="quality-attack-search" placeholder="Search attack or trace"><select class="quality-mini-select" id="quality-attack-severity"><option value="">All severity</option><option>Critical</option><option>High</option><option>Medium</option></select></div>`);
    const apply=()=>{ const q=document.querySelector('#quality-attack-search')?.value.trim().toLowerCase()||'', sev=document.querySelector('#quality-attack-severity')?.value||''; rows.forEach(r=>{ r.hidden=!!((q&&!r.dataset.qualityAttackSearch.includes(q))||(sev&&r.dataset.qualityAttackSeverity!==sev)); }); }; ['quality-attack-search','quality-attack-severity'].forEach(id=>document.getElementById(id)?.addEventListener(id.includes('search')?'input':'change',apply));
  }

  function addReviewFilters(){
    const list=document.querySelector('.p4-review-list'); if(!list)return; const items=[...list.children];
    quality.reviews.forEach((r,i)=>{if(items[i]){const el=items[i];el.dataset.qualityReviewRisk=r.risk;el.dataset.qualityReviewState=r.state;el.dataset.qualityReviewApp=r.app;el.dataset.qualityReviewType=r.reviewType||r.type;el.dataset.qualityReviewReviewer=r.reviewer||'';el.dataset.qualityReviewAge=parseInt(r.age)||0;el.dataset.qualityReviewSearch=`${r.id} ${r.type} ${r.reason} ${r.app} ${r.reviewer||''}`.toLowerCase();}});
    const head=list.closest('.p4-panel')?.querySelector('.p4-panel-head'); head?.insertAdjacentHTML('beforeend',`<div class="quality-toolbar quality-review-toolbar"><input class="quality-mini-input" id="quality-review-search" placeholder="Search queue"><select class="quality-mini-select" id="quality-review-risk"><option value="">All risk</option><option>High</option><option>Medium</option></select><select class="quality-mini-select" id="quality-review-state"><option value="">All states</option><option>Pending</option><option>Escalated</option></select></div>`);
    const advanced={app:'',type:'',reviewer:'',age:''};
    const apply=()=>{ const q=document.querySelector('#quality-review-search')?.value.trim().toLowerCase()||'', risk=document.querySelector('#quality-review-risk')?.value||'', state=document.querySelector('#quality-review-state')?.value||''; items.forEach(r=>{const age=Number(r.dataset.qualityReviewAge||0);r.hidden=!!((q&&!r.dataset.qualityReviewSearch.includes(q))||(risk&&r.dataset.qualityReviewRisk!==risk)||(state&&r.dataset.qualityReviewState!==state)||(advanced.app&&r.dataset.qualityReviewApp!==advanced.app)||(advanced.type&&r.dataset.qualityReviewType!==advanced.type)||(advanced.reviewer&&r.dataset.qualityReviewReviewer!==advanced.reviewer)||(advanced.age==='15+'&&age<15)||(advanced.age==='0-15'&&age>=15));}); };
    window.OrvexaHumanReviewFilters={get:()=>({...advanced}),set:next=>{Object.assign(advanced,next||{});apply();},apply};
    ['quality-review-search','quality-review-risk','quality-review-state'].forEach(id=>document.getElementById(id)?.addEventListener(id.includes('search')?'input':'change',apply));
  }

  function openHumanReviewFilters(trigger){
    const current=window.OrvexaHumanReviewFilters?.get?.()||{};
    openWorkflowDrawer({title:'Queue filters',copy:'Narrow review evidence by application, review type, reviewer and queue age.',confirm:'Apply filters',confirmIcon:'filter',body:`<div class="quality-drawer-kicker">Advanced queue filters</div><div class="quality-form-grid">${field('Application',select('app',[['','All applications'],['APP-SUPPORT-001','Support AI'],['APP-CONTACT-002','AI Contact Center'],['APP-DOC-003','Document Intelligence'],['APP-GROWTH-004','Growth Assistant']],current.app||''))}${field('Review type',select('type',[['','All review types'],...quality.reviews.map(r=>[r.reviewType||r.type,r.reviewType||r.type])],current.type||''))}${field('Reviewer',select('reviewer',[['','Any reviewer'],...Array.from(new Set(quality.reviews.map(r=>r.reviewer).filter(Boolean))).map(v=>[v,v])],current.reviewer||''))}${field('Queue age',select('age',[['','Any age'],['0-15','Under 15 minutes'],['15+','15 minutes or older']],current.age||''))}</div><div class="p4-toast-note"><b>Inline filters stay fast</b><p>Search, Risk and State remain visible in the queue. These controls add reviewer, application and age without duplicating the primary toolbar.</p></div>`,onConfirm:(body,b,close)=>{window.OrvexaHumanReviewFilters?.set?.({app:get(body,'app'),type:get(body,'type'),reviewer:get(body,'reviewer'),age:get(body,'age')});close();notify('Review queue filters applied','filter');}},trigger);
  }

  const reviewRequiresRationale = action => ['Edit','Rejected','Reject exception','Escalated','Request rewrite','Request evidence'].includes(action);
  const syncReviewPendingCount = delta => {
    const metric=[...document.querySelectorAll('.p4-metric')].find(el=>el.querySelector('small')?.textContent.trim()==='Pending reviews');
    const strong=metric?.querySelector('strong');
    const current=Number(String(strong?.textContent||'34').replaceAll(',',''));
    const next=Number.isFinite(current)?Math.max(0,current+delta):34;
    if(strong)strong.textContent=next.toLocaleString();
    const badge=document.querySelector('[data-review-pending-badge]'); if(badge)badge.textContent=`${next} pending`;
    const copy=document.querySelector('[data-review-pending-copy]'); if(copy)copy.textContent=`${next} pending queue-wide`;
    return next;
  };
  const finalizeReviewAction = (review, active, action, label=action) => {
    const resolved=['Approved','Approve safe response','Accept exception','Rejected','Reject exception'].includes(action);
    const wasResolved=['Approved','Approve safe response','Accept exception','Rejected','Reject exception'].includes(review.state);
    review.state=label; active.dataset.qualityReviewState=label; active.classList.toggle('quality-review-resolved',resolved);
    const stateNode=active.querySelector('time small'); if(stateNode) stateNode.textContent=label;
    const badge=document.querySelector('#p4-review-detail .p4-review-decision-meta .p4-status');
    if(badge){const good=/Approved|Accept/.test(label),bad=/Reject/.test(label);badge.className=`p4-status ${good?'good':bad?'bad':'warn'}`;badge.textContent=label;}
    if(resolved){
      if(!wasResolved)syncReviewPendingCount(-1);
      const actions=document.querySelector('#p4-review-detail .p4-review-actions');
      if(actions)actions.innerHTML=`<div class="p4-review-final-state"><span>${icon(/Reject/i.test(label)?'circle-x':'circle-check-big')}</span><div><small>Decision recorded</small><b>${esc(label)}</b><em>Reviewer evidence is locked for audit.</em></div></div>`;
      refreshIcons();
    }
    notify(`${review.id} · ${label}`,/Approved|Accept/.test(label)?'check':/Reject/.test(label)?'x':'user-check');
  };

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-p4-review-action]'); if(!button)return; event.preventDefault(); event.stopPropagation();
    const action=button.dataset.p4ReviewAction; const active=document.querySelector('.p4-review-item.active'); if(!active)return; const review=quality.reviews.find(r=>r.id===active.dataset.p4Review); if(!review)return;
    if(action==='Edit'){
      openModal({title:'Edit reviewed output',copy:`${review.id} · reviewer-authored changes require an audit rationale.`,confirm:'Save reviewed edit',confirmIcon:'save',body:`${field('AI response',textarea('output',document.querySelector('#p4-review-detail .review-output p')?.textContent||review.output))}${field('Reviewer rationale',textarea('rationale','','Explain why the response was changed…'))}`,onConfirm:(body,b,close)=>{const value=get(body,'output'),reason=get(body,'rationale');if(!value||!reason){notify('Edited output and rationale are required','circle-alert');return;}review.output=value;review.lastRationale=reason;const p=document.querySelector('#p4-review-detail .review-output p');if(p)p.textContent=value;close();notify(`${review.id} reviewer edit saved with rationale`,'pencil');}},button); return;
    }
    if(reviewRequiresRationale(action)){
      const actionLabel=action==='Escalated'?'Escalate':action;
      openModal({title:`${actionLabel} review`,copy:`${review.id} · rationale is retained as review evidence.`,confirm:actionLabel,confirmIcon:action==='Escalated'?'arrow-up-right':action.includes('Reject')?'x':'message-square-text',danger:action.includes('Reject'),body:field('Reviewer rationale',textarea('rationale','',`Why should this review be ${actionLabel.toLowerCase()}?`)),onConfirm:(body,b,close)=>{const reason=get(body,'rationale');if(!reason){notify('Reviewer rationale is required','circle-alert');return;}review.lastRationale=reason;close();finalizeReviewAction(review,active,action,action);}},button);return;
    }
    finalizeReviewAction(review,active,action,action);
  },true);

  document.addEventListener('click',event=>{
    const regression=event.target.closest('[data-safety-regression]');
    if(regression){event.preventDefault();event.stopPropagation();const attack=quality.attacks.find(a=>a.id===regression.dataset.safetyRegression);if(attack)openSafetyRegressionCase(attack,regression);return;}
    const resolve=event.target.closest('[data-safety-resolve]');
    if(resolve){event.preventDefault();event.stopPropagation();const attack=quality.attacks.find(a=>a.id===resolve.dataset.safetyResolve);if(!attack)return;attack.state='Resolved';const row=document.querySelector(`[data-p4-attack-id="${CSS.escape(attack.id)}"]`);if(row){row.classList.remove('state-open');row.classList.add('state-resolved');const badge=row.querySelector('.p4-status');if(badge){badge.className='p4-status good';badge.textContent='Resolved';}}resolve.disabled=true;resolve.innerHTML=`${icon('check')}Resolved`;refreshIcons();notify(`${attack.id} resolved with evidence retained`,'check-circle-2');return;}
  },true);

  document.addEventListener('click',event=>{
    const dismiss=event.target.closest('[data-policy-test-dismiss]'); if(dismiss){const result=document.querySelector('#quality-policy-test-result');if(result){result.hidden=true;result.innerHTML='';}return;}
    const rollback=event.target.closest('[data-quality-policy-rollback]'); if(!rollback)return; event.preventDefault(); event.stopPropagation();
    const policy=quality.policies.find(p=>p.id===rollback.dataset.qualityPolicyRollback); if(!policy)return;
    openModal({title:`Rollback ${policy.name}`,copy:`Revert ${policy.id} from ${policy.version} to ${policy.previous}.`,confirm:`Rollback to ${policy.previous}`,confirmIcon:'history',danger:true,body:`<div class="quality-gate-result is-blocked"><span>${icon('history')}</span><div><b>Versioned rollback</b><p>Current evidence remains auditable. Production will return to ${esc(policy.previous)} only after this confirmation.</p><small>${esc(policy.testResult||'Validation evidence retained')}</small></div></div>${field('Rollback reason',textarea('reason','','Why is this rollback required?'))}`,onConfirm:(body,button,close)=>{if(!get(body,'reason')){notify('Rollback reason is required','circle-alert');return;}close();notify(`${policy.id} rollback to ${policy.previous} recorded`,'history');}},rollback);
  },true);


  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-quality-release-transition]'); if(!action)return; event.preventDefault(); event.stopPropagation();
    const release=quality.releases.find(r=>r.id===action.dataset.releaseId); if(!release)return;
    const kind=action.dataset.qualityReleaseTransition;
    if(kind==='return-draft'){returnBlockedCandidateToDraft(action);return;}
    if(kind==='advance-canary'){
      openModal({title:`Advance ${release.name}`,copy:'Increase controlled production exposure only while evaluation and safety gates remain satisfied.',confirm:'Advance to 25%',confirmIcon:'traffic-cone',body:`<div class="quality-gate-result"><span>${icon('shield-check')}</span><div><b>All required gates are currently satisfied</b><p>${esc(release.evidence||'Evaluation and safety evidence remain above required gates.')}</p><small>Current canary ${esc(release.traffic)} → proposed 25%</small></div></div>`,onConfirm:(body,button,close)=>{release.traffic='25%';const card=document.querySelector(`[data-p4-release-id="${release.id}"]`);const foot=card?.querySelector('.p4-release-foot small');if(foot)foot.textContent='25% traffic · Safety Pass';const metric=[...document.querySelectorAll('.p4-metric')].find(el=>el.querySelector('small')?.textContent.trim()==='Canary traffic');if(metric){metric.querySelector('strong').textContent='25%';metric.querySelector('em').textContent=release.name;}close();document.querySelector('.p4-drawer [data-p4-close]')?.click();notify(`${release.name} advanced to 25% canary`,'traffic-cone');}},action);return;
    }
    if(kind==='hold-shadow'){notify(`${release.name} remains in Shadow while latency/cost watch conditions are investigated`,'pause');return;}
    if(kind==='view-rollback'){
      openModal({title:`Rollback plan · ${release.name}`,copy:'Rollback is a recovery path from production, not a forward lifecycle stage.',confirm:'Close',confirmIcon:'check',body:`<div class="quality-gate-result"><span>${icon('undo-2')}</span><div><b>Previous stable: ${esc(release.rollback||'available')}</b><p>Current production can revert to the previous stable version with evidence and audit linkage preserved.</p><small>Rollback readiness 100% · no action is executed in this static demo.</small></div></div>`,onConfirm:(body,button,close)=>close()},action);return;
    }
  },true);

  function addReleaseFilters(){
    const grid=document.querySelector('#p4-release-grid'); if(!grid)return;
    quality.releases.forEach((r,i)=>{const card=grid.children[i];if(card){card.dataset.qualityReleaseStage=r.stage;card.dataset.qualityReleaseGate=r.gate;card.dataset.qualityReleaseApp=r.app||'';card.dataset.qualityReleaseType=r.experiment||'';}});
    const apply=()=>{const q=document.querySelector('#p4-release-search')?.value.trim().toLowerCase()||'',stage=document.querySelector('#quality-release-stage')?.value||'',gate=document.querySelector('#quality-release-gate')?.value||'',extra=window.OrvexaReleaseFilters||{};let visible=0;[...grid.children].forEach(card=>{const hide=!!((q&&!card.dataset.p4Release?.includes(q))||(stage&&card.dataset.qualityReleaseStage!==stage)||(gate&&card.dataset.qualityReleaseGate!==gate)||(extra.application&&card.dataset.qualityReleaseApp!==extra.application)||(extra.type&&card.dataset.qualityReleaseType!==extra.type));card.hidden=hide;if(!hide)visible++;});const empty=document.querySelector('#p4-release-empty');if(empty)empty.hidden=visible>0;};
    document.querySelector('#p4-release-search')?.addEventListener('input',apply);document.querySelector('#quality-release-stage')?.addEventListener('change',apply);document.querySelector('#quality-release-gate')?.addEventListener('change',apply);window.addEventListener('orvexa:release-filter-change',apply);
  }

  ({datasets:addDatasetFilters,evaluations:addEvaluationFilters,'quality-feedback':addFeedbackFilters,'policies-guardrails':addPolicyFilters,'safety-redteam':addSafetyFilters,'human-review':addReviewFilters,'experiments-releases':addReleaseFilters}[page])?.();
  refreshIcons();
})();
