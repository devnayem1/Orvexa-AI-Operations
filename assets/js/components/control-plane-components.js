(() => {
  'use strict';
  window.Orvexa = window.Orvexa || {};

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  const tone = (value) => ({ good: 'var(--mint)', live: 'var(--cyan)', warn: 'var(--amber)', warning: 'var(--amber)', danger: 'var(--danger)', neutral: 'var(--muted)', primary: 'var(--primary-2)', mint: 'var(--mint)', cyan: 'var(--cyan)', amber: 'var(--amber)' }[value] || 'var(--muted)');
  const statusClass = (value) => ['good','healthy','completed','live','streaming'].includes(String(value).toLowerCase()) ? 'is-good' : ['watch','fallback','approval','escalated','monitor','review'].includes(String(value).toLowerCase()) ? 'is-warn' : ['failed','blocked','high','incident'].includes(String(value).toLowerCase()) ? 'is-danger' : '';

  function applicationCard(app) {
    return `<article class="cp-app-card" data-app-id="${escapeHtml(app.id)}">
      <div class="cp-app-top"><div class="cp-app-icon"><i data-lucide="${app.id.includes('CONTACT') ? 'headphones' : app.id.includes('DOC') ? 'files' : app.id.includes('GROWTH') ? 'megaphone' : 'messages-square'}"></i></div><span class="cp-status ${statusClass(app.status)}"><span></span>${escapeHtml(app.status)}</span></div>
      <div class="cp-app-copy"><div class="cp-kicker">${escapeHtml(app.id)} · ${escapeHtml(app.environment)}</div><h3>${escapeHtml(app.name)}</h3><p>${escapeHtml(app.type)}</p></div>
      <div class="cp-app-metrics"><div><span>30D requests</span><b>${escapeHtml(app.requests30d)}</b></div><div><span>P95</span><b>${escapeHtml(app.p95)}</b></div><div><span>Error</span><b>${escapeHtml(app.errorRate)}</b></div><div><span>30D cost</span><b>${escapeHtml(app.cost30d)}</b></div></div>
      <div class="cp-app-route"><span><i data-lucide="route"></i>${escapeHtml(app.primaryRoute)}</span><b>${escapeHtml(app.model)}</b></div>
      <div class="cp-app-foot"><span>${escapeHtml(app.owner)}</span><span>${escapeHtml(app.lastDeploy)}</span></div>
    </article>`;
  }

  function requestRow(req) {
    const value = String(req.status || '').toLowerCase();
    const requestStatusClass = value === 'streaming' ? 'is-live' : value === 'completed' ? 'is-good' : value === 'fallback' ? 'is-warn' : value === 'human handoff' ? 'is-handoff' : value === 'human review' ? 'is-review' : value === 'guardrail retry' ? 'is-guardrail' : ['failed','safety blocked','blocked'].includes(value) ? 'is-danger' : statusClass(req.status);
    return `<tr tabindex="0" data-request-id="${escapeHtml(req.requestId)}" data-request-app="${escapeHtml(req.appId)}" data-request-channel="${escapeHtml(req.channel)}" data-request-status="${escapeHtml(req.status)}">
      <td data-label="Request / Trace"><div class="cp-request-id"><b>${escapeHtml(req.requestId)}</b><span>${escapeHtml(req.traceId)}</span></div></td>
      <td data-label="Application"><div class="cp-table-primary">${escapeHtml(req.app)}</div><div class="cp-table-secondary">${escapeHtml(req.appId)}</div></td>
      <td data-label="User / Session"><div class="cp-table-primary">${escapeHtml(req.externalUserId)}</div><div class="cp-table-secondary">${escapeHtml(req.sessionId)}</div></td>
      <td data-label="Channel"><span class="cp-channel"><i data-lucide="${req.channel === 'Voice' ? 'phone-call' : req.channel === 'Chat' ? 'messages-square' : req.channel === 'API' ? 'braces' : 'monitor-smartphone'}"></i>${escapeHtml(req.channel)}</span></td>
      <td data-label="Route / Model"><div class="cp-table-primary">${escapeHtml(req.model)}</div><div class="cp-table-secondary">${escapeHtml(req.route)}</div></td>
      <td data-label="Execution path"><div class="cp-path" title="${escapeHtml(req.path)}">${escapeHtml(req.path)}</div></td>
      <td data-label="Latency / Cost"><div class="cp-table-primary">${escapeHtml(req.latency)}</div><div class="cp-table-secondary">${escapeHtml(req.cost)}</div></td>
      <td data-label="Status"><span class="cp-status ${requestStatusClass}"><span></span>${escapeHtml(req.status)}</span></td>
    </tr>`;
  }

  function contactMetric(item) {
    const c = tone(item.tone);
    return `<article class="cp-metric" style="--cp-accent:${c}"><div class="cp-metric-head"><span class="cp-metric-icon"><i data-lucide="${item.icon}"></i></span><span class="cp-metric-pulse"></span></div><p>${escapeHtml(item.label)}</p><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.detail)}</small></article>`;
  }

  function traceStep(step, index, total) {
    return `<div class="cp-trace-step ${step.status === 'active' ? 'is-active' : ''}"><div class="cp-trace-rail"><span class="cp-trace-icon"><i data-lucide="${step.icon}"></i></span>${index < total - 1 ? '<i></i>' : ''}</div><div class="cp-trace-copy"><div><b>${escapeHtml(step.label)}</b><span>${escapeHtml(step.duration)}</span></div><p>${escapeHtml(step.detail)}</p></div></div>`;
  }

  window.Orvexa.controlComponents = { applicationCard, requestRow, contactMetric, traceStep, escapeHtml, statusClass, tone };
})();
