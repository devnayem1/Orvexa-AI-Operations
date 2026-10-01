(() => {
  'use strict';
  const data = window.Orvexa?.chat;
  const components = window.Orvexa?.chatComponents;
  if (!data || !components) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const refreshIcons = () => window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });

  components.renderConversations($('#conversation-list'), data.conversations);
  components.renderRoute($('#route-flow'), data.route);
  components.renderTrace($('#trace-list'), data.trace);
  components.renderSources($('#retrieved-sources'), data.sources);
  components.renderTools($('#tool-permissions'), data.tools);
  components.renderAttachments($('#composer-files'), data.attachments);
  components.renderModelCompare($('#compare-grid'), data.models);
  refreshIcons();

  const compareModal = $('#compare-modal');
  const openCompare = () => { compareModal?.classList.add('open'); compareModal?.setAttribute('aria-hidden','false'); document.body.classList.add('overflow-hidden'); };
  const closeCompare = () => { compareModal?.classList.remove('open'); compareModal?.setAttribute('aria-hidden','true'); document.body.classList.remove('overflow-hidden'); };
  $$('[data-open-compare]').forEach(button => button.addEventListener('click', openCompare));
  $$('[data-close-compare]').forEach(button => button.addEventListener('click', closeCompare));
  compareModal?.addEventListener('click', event => { if (event.target === compareModal) closeCompare(); });

  const history = $('#conversation-history');
  const inspector = $('#workspace-inspector');
  $('#toggle-history')?.addEventListener('click', () => history?.classList.toggle('mobile-open'));
  $('#close-history')?.addEventListener('click', () => history?.classList.remove('mobile-open'));
  $('#toggle-inspector')?.addEventListener('click', () => inspector?.classList.toggle('mobile-open'));
  $('#close-inspector')?.addEventListener('click', () => inspector?.classList.remove('mobile-open'));

  const modelMenu = $('#model-menu');
  $('#model-selector')?.addEventListener('click', event => { event.stopPropagation(); modelMenu?.classList.toggle('open'); });
  document.addEventListener('click', () => modelMenu?.classList.remove('open'));
  modelMenu?.addEventListener('click', event => event.stopPropagation());
  $$('[data-model-choice]').forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.modelChoice;
    $('#selected-model-name').textContent = name;
    const routeModelDetail = $('#route-model-detail');
    if (routeModelDetail) routeModelDetail.textContent = `ROUTE-VOICE-07 · ${name === 'Auto Router' ? 'Orbit Pro' : name}`;
    modelMenu?.classList.remove('open');
    window.showToast?.(`Model route changed to ${name}`, 'route');
  }));

  const contextControls = ['test-application','test-environment','test-prompt-version','test-dataset-case','test-knowledge','test-tool-policy','test-guardrails'].map(id => document.getElementById(id)).filter(Boolean);
  const launchContext = new URLSearchParams(window.location.search);
  const requestedApp = launchContext.get('app');
  const requestedPrompt = launchContext.get('prompt');
  const requestedVersion = launchContext.get('version');
  const applyLaunchValue = (select, value, label) => { if (!select || !value) return; let option=[...select.options].find(item=>item.value===value); if(!option){ option=new Option(label || value, value); select.add(option); } select.value=value; };
  applyLaunchValue($('#test-application'), requestedApp, requestedApp);
  if (requestedPrompt) { const promptValue=requestedVersion && !requestedPrompt.includes(':') ? `${requestedPrompt}:${requestedVersion}` : requestedPrompt; applyLaunchValue($('#test-prompt-version'), promptValue, `${requestedPrompt.replace(/^PROMPT-|-/g,' ')} ${requestedVersion||''}`.trim()); }
  const syncTestContext = () => {
    const app = $('#test-application')?.value || 'APP-CONTACT-002';
    const env = $('#test-environment')?.value || 'Production shadow';
    const prompt = $('#test-prompt-version')?.value || 'PROMPT-CONTACT-09:v21';
    const datasetCase = $('#test-dataset-case')?.value || 'CASE-VOICE-118 · Billing dispute';
    const appId = $('#test-application-id'); if (appId) appId.textContent = app;
    const promptId = $('#test-prompt-id'); if (promptId) promptId.textContent = prompt;
    const subtitle = $('.session-subtitle');
    if (subtitle) subtitle.textContent = `${app} · ${env} · ${prompt} · ${datasetCase.split(' · ')[0]}`;
    const canvasMeta = $('.tc-canvas-meta');
    if (canvasMeta) canvasMeta.textContent = `${app} · ${env.toLowerCase()} · read-only`;
    const appChip = $('#context-app-chip'); if (appChip) appChip.textContent = app;
    const envChip = $('#context-env-chip'); if (envChip) envChip.textContent = env;
    const promptChip = $('#context-prompt-chip'); if (promptChip) promptChip.textContent = prompt.includes(':') ? prompt.split(':').at(-1) : prompt;
  };
  contextControls.forEach(control => control.addEventListener('change', () => { syncTestContext(); window.showToast?.(`${control.previousElementSibling?.textContent || 'Test context'} updated`, 'settings-2'); }));
  syncTestContext();

  $('#save-test-case')?.addEventListener('click', () => {
    const payload = { app:$('#test-application')?.value, environment:$('#test-environment')?.value, prompt:$('#test-prompt-version')?.value, datasetCase:$('#test-dataset-case')?.value, model:$('#selected-model-name')?.textContent, knowledge:$('#test-knowledge')?.value, toolPolicy:$('#test-tool-policy')?.value, guardrails:$('#test-guardrails')?.value, savedAt:new Date().toISOString() };
    try { localStorage.setItem('orvexa-last-test-case', JSON.stringify(payload)); } catch (_) {}
    window.showToast?.('Test case saved to this browser', 'bookmark-check');
  });

  $('#conversation-search')?.addEventListener('input', event => {
    const q = event.target.value.toLowerCase().trim();
    $$('.conversation-item', $('#conversation-list')).forEach(item => item.classList.toggle('hidden', q && !item.textContent.toLowerCase().includes(q)));
  });
  $('#conversation-list')?.addEventListener('click', event => {
    const item = event.target.closest('.conversation-item'); if (!item) return;
    $$('.conversation-item', $('#conversation-list')).forEach(node => node.classList.remove('active'));
    item.classList.add('active'); history?.classList.remove('mobile-open');
    window.showToast?.('Test run loaded in Admin Test Console', 'message-square-text');
  });
  $$('[data-run-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-run-filter]').forEach(node => node.classList.remove('active')); button.classList.add('active');
    const mode = button.dataset.runFilter;
    $$('.conversation-item', $('#conversation-list')).forEach((item,index) => {
      const show = mode === 'recent' || (mode === 'passed' && index % 3 !== 1) || (mode === 'review' && index % 3 === 1) || mode === 'archived';
      item.classList.toggle('hidden', !show || mode === 'archived');
    });
  }));
  $('#new-conversation')?.addEventListener('click', () => { $('#workspace-prompt')?.focus(); window.showToast?.('New isolated test run ready', 'plus'); });

  const modeButtons = $$('[data-workspace-mode]');
  modeButtons.forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.workspaceMode;
    modeButtons.forEach(node => node.classList.remove('active')); button.classList.add('active');
    $('#workspace-mode-label').textContent = mode;
    if (mode === 'Compare Models') openCompare();
    if (mode === 'Deep RAG') $('#research-panel')?.classList.add('open');
    window.showToast?.(`${mode} mode selected`, mode === 'Deep RAG' ? 'search-check' : mode === 'Compare Models' ? 'columns-3' : mode === 'Agent Test' ? 'bot' : 'flask-conical');
  }));

  $$('.composer-tool').forEach(button => {
    if (button.id === 'voice-input' || button.id === 'attach-file') return;
    button.addEventListener('click', () => { button.classList.toggle('active'); window.showToast?.(`${button.textContent.trim()} ${button.classList.contains('active') ? 'enabled' : 'disabled'} for next test`, button.classList.contains('active') ? 'check' : 'x'); });
  });
  $('#voice-input')?.addEventListener('click', () => {
    const button = $('#voice-input'); const active = button.classList.toggle('active'); button.setAttribute('aria-pressed',String(active)); $('#voice-status').textContent = active ? 'Voice on' : 'Voice';
  });
  $('#attach-file')?.addEventListener('click', () => window.showToast?.('Synthetic fixture picker opened', 'paperclip'));
  $('#composer-files')?.addEventListener('click', event => event.target.closest('button')?.closest('.composer-file')?.remove());

  $$('[data-inspector-tab]').forEach(button => button.addEventListener('click', () => {
    const tab = button.dataset.inspectorTab;
    $$('[data-inspector-tab]').forEach(node => node.classList.toggle('active', node === button));
    $$('[data-inspector-panel]').forEach(panel => { const active = panel.dataset.inspectorPanel === tab; panel.classList.toggle('active', active); panel.hidden = !active; });
  }));
  $('#tool-permissions')?.addEventListener('click', event => {
    const button = event.target.closest('.tool-permission'); if (!button) return;
    const enabled = !button.classList.contains('enabled'); button.classList.toggle('enabled',enabled); button.setAttribute('aria-pressed',String(enabled));
    window.showToast?.(`${button.querySelector('b')?.textContent} ${enabled ? 'enabled' : 'disabled'}`, enabled ? 'check' : 'x');
  });

  let routeTimer;
  const animateRoute = () => {
    if (reduceMotion) return;
    clearInterval(routeTimer);
    const steps = $$('[data-route-step]'); steps.forEach(step => step.classList.remove('running'));
    let index = 0;
    routeTimer = setInterval(() => {
      steps.forEach(step => step.classList.remove('running')); steps[index]?.classList.add('running'); index += 1;
      if (index >= steps.length) { clearInterval(routeTimer); setTimeout(() => steps.at(-1)?.classList.remove('running'),700); }
    },230);
  };

  const runTest = () => {
    const prompt = $('#workspace-prompt')?.value.trim(); if (!prompt) { window.showToast?.('Enter a synthetic test scenario first', 'circle-alert'); return; }
    const button = $('#send-workspace'); button?.classList.add('running'); if (button) button.innerHTML = '<span>Running…</span><i data-lucide="loader-circle"></i>'; refreshIcons(); animateRoute();
    $('#test-state-badge').innerHTML = '<i data-lucide="loader-circle"></i>Running';
    $('#test-result-title').textContent = 'Running validation';
    $('#test-result-copy').textContent = 'Routing the synthetic case through knowledge, read-only tools and policy checks. No production write action will execute.';
    refreshIcons();
    window.setTimeout(() => {
      button?.classList.remove('running'); if (button) button.innerHTML = '<span>Run test</span><i data-lucide="play"></i>';
      $('#test-state-badge').innerHTML = '<i data-lucide="circle-check"></i>Passed';
      $('#test-result-title').textContent = 'Validation result';
      $('#test-result-copy').textContent = 'The route stayed grounded in approved billing guidance, preserved read-only CRM access, and retained the human-handoff boundary.';
      const variance = Math.floor(Math.random()*24)-12;
      $('#result-latency').textContent = `${318+variance}ms`;
      window.showToast?.('Synthetic case completed · policy passed', 'circle-check');
      refreshIcons();
    }, reduceMotion ? 40 : 1350);
  };
  $('#send-workspace')?.addEventListener('click', runTest);
  $('#workspace-prompt')?.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); runTest(); } });
  $('#result-add-dataset')?.addEventListener('click', () => { try { localStorage.setItem('orvexa-last-dataset-capture',JSON.stringify({case:'CASE-VOICE-118',source:'Admin Test Console',savedAt:new Date().toISOString()})); } catch (_) {} window.showToast?.('Result added to the local demo dataset', 'database-zap'); });
  $('#promote-prompt')?.addEventListener('click', () => window.showToast?.('Prompt promotion opened with evaluation evidence attached', 'rocket'));

  $('#compare-grid')?.addEventListener('click', event => {
    const button = event.target.closest('[data-use-model]'); if (!button) return;
    const model = data.models.find(item => item.id === button.dataset.useModel); if (!model) return;
    $('#selected-model-name').textContent = model.name; const routeModelDetail = $('#route-model-detail'); if (routeModelDetail) routeModelDetail.textContent = `ROUTE-VOICE-07 · ${model.name}`; closeCompare(); window.showToast?.(`${model.name} selected for this test`, 'check-circle-2');
  });

  $('#open-research')?.addEventListener('click', () => $('#research-panel')?.classList.toggle('open'));
  $('#close-research')?.addEventListener('click', () => $('#research-panel')?.classList.remove('open'));
  $('#start-research')?.addEventListener('click', () => { $('#research-panel')?.classList.remove('open'); window.showToast?.('Retrieval stress test queued with source provenance', 'search-check'); });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeCompare(); modelMenu?.classList.remove('open'); inspector?.classList.remove('mobile-open'); history?.classList.remove('mobile-open'); $('#research-panel')?.classList.remove('open'); }
  });

  // Preserve the rerun message used by the test-console interaction.
  const rerunMessage = 'Synthetic case rerun started';
  window.Orvexa.testConsole = { syncTestContext, runTest, rerunMessage };
})();
