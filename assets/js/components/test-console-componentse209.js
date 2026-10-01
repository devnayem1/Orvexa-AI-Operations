(() => {
  'use strict';
  window.Orvexa = window.Orvexa || {};
  window.Orvexa.chatComponents = window.Orvexa.chatComponents || {};

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));

  function renderConversations(host, conversations) {
    if (!host) return;
    host.innerHTML = conversations.map((item) => `
      <button class="conversation-item ${item.active ? 'active' : ''}" type="button" data-conversation="${item.id}">
        <span class="conversation-main">
          <span class="conversation-title">${escapeHtml(item.title)}</span>
          <span class="conversation-meta">${escapeHtml(item.model)} · ${escapeHtml(item.meta)}</span>
        </span>
        <span class="conversation-side"><small>${escapeHtml(item.time)}</small><span>${escapeHtml(item.folder)}</span></span>
      </button>
    `).join('');
  }

  function renderRoute(host, route) {
    if (!host) return;
    host.innerHTML = route.map((item, index) => `
      <div class="route-step ${item.state}" data-route-step="${item.id}" title="${escapeHtml(item.label)} — ${escapeHtml(item.detail)}" style="--route-delay:${index * 90}ms">
        <span class="route-step-icon"><i data-lucide="${item.icon}"></i></span>
        <span class="route-step-copy"><b>${escapeHtml(item.label)}</b><small${item.id === 'route-model' ? ' id="route-model-detail"' : ''}>${escapeHtml(item.detail)}</small></span>
        ${index < route.length - 1 ? '<span class="route-connector"><i></i></span>' : ''}
      </div>
    `).join('');
  }

  function renderSources(host, sources) {
    if (!host) return;
    host.innerHTML = sources.map((source) => `
      <button class="source-card" type="button">
        <span class="source-icon"><i data-lucide="${source.icon}"></i></span>
        <span class="source-copy"><b>${escapeHtml(source.title)}</b><small>${escapeHtml(source.domain)}</small></span>
        <span class="source-score">${escapeHtml(source.score)}</span>
      </button>
    `).join('');
  }

  function renderTrace(host, trace) {
    if (!host) return;
    host.innerHTML = trace.map((item) => `
      <div class="trace-item ${item.state}" data-trace-item="${item.id}">
        <span class="trace-icon"><i data-lucide="${item.icon}"></i></span>
        <span class="trace-copy"><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.detail)}</small></span>
        <span class="trace-metric">${escapeHtml(item.metric)}</span>
      </div>
    `).join('');
  }

  function renderTools(host, tools) {
    if (!host) return;
    host.innerHTML = tools.map((tool) => `
      <button class="tool-permission ${tool.enabled ? 'enabled' : ''}" type="button" data-tool="${tool.id}" aria-pressed="${tool.enabled}">
        <span class="tool-icon"><i data-lucide="${tool.icon}"></i></span>
        <span class="tool-copy"><b>${escapeHtml(tool.name)}</b><small>${escapeHtml(tool.risk)}</small></span>
        <span class="tool-switch"><i></i></span>
      </button>
    `).join('');
  }

  function renderAttachments(host, attachments) {
    if (!host) return;
    host.innerHTML = attachments.map((item) => `
      <div class="composer-file">
        <span><i data-lucide="${item.icon}"></i></span>
        <div><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.type)} · ${escapeHtml(item.size)}</small></div>
        <button type="button" aria-label="Remove ${escapeHtml(item.name)}"><i data-lucide="x"></i></button>
      </div>
    `).join('');
  }

  function renderModelCompare(host, models) {
    if (!host) return;
    host.innerHTML = models.map((model, index) => `
      <article class="compare-column ${index === 0 ? 'recommended' : ''}" data-compare-model="${model.id}">
        <div class="compare-head">
          <div><span class="compare-provider">${escapeHtml(model.provider)}</span><h3>${escapeHtml(model.name)}</h3></div>
          <div class="compare-head-tags">${index === 0 ? '<span class="compare-recommendation">Recommended</span>' : ''}<span class="compare-status">${escapeHtml(model.status)}</span></div>
        </div>
        <div class="compare-metrics">
          <span><small>Quality</small><b>${model.quality}</b></span>
          <span><small>Latency</small><b>${escapeHtml(model.latency)}</b></span>
          <span><small>Est. cost</small><b>${escapeHtml(model.cost)}</b></span>
        </div>
        <div class="compare-answer">
          <p>${escapeHtml(model.response)}</p>
          <div class="compare-response-evidence">
            <div class="compare-response-head"><i data-lucide="circle-check"></i><span>Sample model response</span></div>
            <blockquote>${escapeHtml(model.sample || model.response)}</blockquote>
            <div class="compare-response-meta"><span>${escapeHtml(model.policy || 'No policy violations')}</span><span>${escapeHtml(model.evidence || 'Approved evidence')}</span></div>
          </div>
        </div>
        <div class="compare-score"><span>Fit for this task</span><div><i style="width:${model.quality}%"></i></div><b>${model.quality}%</b></div>
        <button class="compare-use" type="button" data-use-model="${model.id}">${index === 0 ? 'Keep recommended route' : `Use ${escapeHtml(model.name)}`}</button>
      </article>
    `).join('');
  }

  Object.assign(window.Orvexa.chatComponents, { renderConversations, renderRoute, renderSources, renderTrace, renderTools, renderAttachments, renderModelCompare });
})();
