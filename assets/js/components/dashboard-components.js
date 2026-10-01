(() => {
  'use strict';

  const data = window.Orvexa?.dashboard;
  if (!data) return;

  const toneColor = (tone) => ({
    primary: 'var(--primary)', violet: 'var(--primary-2)', cyan: 'var(--cyan)', mint: 'var(--mint)', amber: 'var(--amber)', rose: 'var(--danger)', danger: 'var(--danger)'
  }[tone] || 'var(--primary)');

  const renderMetrics = () => {
    const host = document.getElementById('primary-metrics');
    if (!host) return;
    host.innerHTML = data.metrics.map((metric) => `
      <article class="metric-card metric-card-premium" data-metric="${metric.id}" style="--metric-color:${toneColor(metric.tone)}">
        <div class="flex items-start justify-between gap-3">
          <span class="metric-icon" style="--metric-color:${toneColor(metric.tone)}"><i data-lucide="${metric.icon}" class="size-[18px]"></i></span>
          <span class="metric-trend ${metric.trendTone === 'good' ? 'is-good' : ''}">${metric.trend}</span>
        </div>
        <div class="mt-4 flex items-end justify-between gap-3">
          <div class="min-w-0">
            <p class="metric-label">${metric.label}</p>
            <p class="metric-value">${metric.prefix || ''}<span>${metric.value}</span>${metric.suffix || ''}</p>
          </div>
          <div class="h-9 w-20 shrink-0" data-metric-sparkline="${metric.id}"></div>
        </div>
        <p class="mt-2 truncate text-[12px] font-medium" style="color:var(--muted)">${metric.detail}</p>
      </article>
    `).join('');
  };

  const renderModels = () => {
    const host = document.getElementById('model-fleet-list');
    if (!host) return;
    host.innerHTML = data.models.map((model) => `
      <div class="vi-model-row" style="--route-color:${toneColor(model.tone)}">
        <span class="vi-model-avatar">${model.name.slice(0, 1)}</span>
        <div class="vi-model-main">
          <div class="vi-model-head"><b>${model.name}</b><span class="vi-model-status">${model.status}</span></div>
          <small>${model.role}</small>
          <div class="vi-model-lane"><span style="width:${model.quality}%"></span></div>
        </div>
        <div class="vi-model-meta"><b>${model.latency}ms</b><small>${model.quality}% quality · $${model.cost}</small></div>
        <i class="vi-model-dot" aria-hidden="true"></i>
      </div>
    `).join('');
  };

  const renderAgents = () => {
    const host = document.getElementById('agent-runtime-list');
    if (!host) return;
    host.innerHTML = data.agents.map((agent) => `
      <div class="agent-run-row" style="--agent-color:${toneColor(agent.tone)}">
        <span class="agent-run-icon" style="--agent-color:${toneColor(agent.tone)}"><i data-lucide="${agent.icon}" class="size-4"></i></span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-3"><p class="truncate text-[14px] font-extrabold">${agent.name}</p><span class="agent-status" data-status="${agent.status.toLowerCase()}">${agent.status}</span></div>
          <div class="mt-1 flex items-center justify-between gap-2 text-[12px]" style="color:var(--muted)"><span class="truncate">${agent.task}</span><span class="shrink-0 agent-step">Step ${agent.step}</span></div>
          <div class="agent-progress-meta"><span>${agent.progress}% complete</span><span>${agent.status === 'Approval' ? 'Human checkpoint' : 'Execution healthy'}</span></div>
          <div class="mini-bar agent-progress"><span style="width:${agent.progress}%;background:linear-gradient(90deg,${toneColor(agent.tone)},var(--cyan))"></span></div>
        </div>
      </div>
    `).join('');
  };

  const renderApprovals = () => {
    const host = document.getElementById('approval-list');
    if (!host) return;
    host.innerHTML = data.approvals.map((item) => `
      <button class="approval-row group w-full text-left">
        <div class="flex items-start gap-3">
          <span class="approval-risk" data-risk="${item.risk.toLowerCase()}"></span>
          <div class="min-w-0 flex-1"><p class="truncate text-[14px] font-extrabold">${item.title}</p><p class="mt-1 text-[12px]" style="color:var(--muted)">${item.agent} · ${item.impact}</p></div>
          <span class="text-[12px]" style="color:var(--muted)">${item.age}</span>
        </div>
        <div class="mt-3 flex items-center justify-between"><span class="pill !px-2 !py-0.5">${item.risk} risk</span><span class="text-[12px] font-bold opacity-0 transition group-hover:opacity-100" style="color:var(--primary-text)">Review →</span></div>
      </button>
    `).join('');
  };

  const renderMedia = () => {
    const host = document.getElementById('media-stats');
    if (!host) return;
    const items = [
      ['image', 'Image generations', data.media.images.count.toLocaleString(), data.media.images.change, `${data.media.images.queue} queued`, 'primary'],
      ['clapperboard', 'Video renders', data.media.video.count.toLocaleString(), data.media.video.change, `${data.media.video.queue} rendering`, 'cyan'],
      ['audio-lines', 'Voice jobs', data.media.voice.count.toLocaleString(), data.media.voice.change, `${data.media.voice.queue} live`, 'mint'],
    ];
    host.innerHTML = items.map(([icon, label, count, change, queue, tone]) => `
      <div class="media-stat">
        <span class="media-stat-icon" style="--media-color:${toneColor(tone)}"><i data-lucide="${icon}" class="size-4"></i></span>
        <div class="min-w-0 flex-1"><p class="truncate text-[12px] font-semibold" style="color:var(--muted)">${label}</p><div class="mt-1 flex items-baseline gap-2"><b class="text-xl tracking-tight">${count}</b><span class="text-[12px] font-bold" style="color:var(--mint-text)">${change}</span></div><p class="mt-1 text-[12px]" style="color:var(--muted)">${queue}</p></div>
      </div>
    `).join('');
  };

  const renderKnowledge = () => {
    const host = document.getElementById('knowledge-stats');
    if (!host) return;
    const k = data.knowledge;
    host.innerHTML = `
      <div class="grounding-summary">
        <div><b>${k.freshness}%</b><span>Freshness</span></div>
        <div><b>${k.retrieval}%</b><span>Relevance</span></div>
        <div><b>${k.citationCoverage}%</b><span>Citations</span></div>
      </div>
      <div class="grounding-bars">
        <div><div><span>Knowledge freshness</span><b>${k.freshness}%</b></div><div class="mini-bar"><span style="width:${k.freshness}%;background:linear-gradient(90deg,var(--mint),var(--cyan))"></span></div></div>
        <div><div><span>Retrieval relevance</span><b>${k.retrieval}%</b></div><div class="mini-bar"><span style="width:${k.retrieval}%;background:linear-gradient(90deg,var(--primary),var(--cyan))"></span></div></div>
      </div>
      <div class="grounding-foot"><span><i data-lucide="timer"></i>${k.retrievalP95}ms P95</span><span><i data-lucide="layers-3"></i>${k.staleChunks} stale</span><span class="is-good"><i data-lucide="circle-check-big"></i>Ingestion healthy</span></div>
    `;
  };

  const renderWaveform = () => {
    const host = document.getElementById('voice-waveform');
    if (!host) return;
    host.innerHTML = data.realtime.waveform.map((height, index) => `<span class="wave-bar" style="height:${height}%;animation-delay:-${(index % 8) * 0.09}s"></span>`).join('');
  };

  const renderQuality = () => {
    const host = document.getElementById('quality-grid');
    if (!host) return;
    host.innerHTML = data.quality.map((item) => `
      <div class="quality-tile">
        <div class="flex items-center justify-between gap-2"><span class="text-[12px] font-semibold" style="color:var(--muted)">${item.label}</span><b class="text-[12px]">${item.value}%</b></div>
        <div class="mini-bar mt-3"><span style="width:${Math.min(100, item.label.includes('Human') ? item.value * 10 : item.label.includes('regression') ? item.value * 20 : item.value)}%;background:${toneColor(item.tone)}"></span></div>
      </div>
    `).join('');
  };

  const renderDeployments = () => {
    const host = document.getElementById('deployment-list');
    if (!host) return;
    host.innerHTML = data.deployments.map((item) => `
      <div class="deployment-row" data-state="${item.state.toLowerCase()}"><div class="deployment-dot"></div><div class="min-w-0 flex-1"><p class="truncate text-[14px] font-extrabold">${item.name}</p><p class="mt-1 text-[12px]" style="color:var(--muted)">${item.stage} · ${item.traffic}% traffic</p><div class="deployment-traffic"><span style="width:${Math.max(4,item.traffic)}%"></span></div></div><span class="deployment-state">${item.state}</span></div>
    `).join('');
  };


  const renderCommandApplications = () => {
    const host = document.getElementById('command-applications');
    const cp = window.Orvexa?.controlPlane;
    if (!host || !cp) return;
    const iconFor = (id) => id.includes('CONTACT') ? 'headphones' : id.includes('DOC') ? 'files' : id.includes('GROWTH') ? 'megaphone' : 'messages-square';
    const displayName = (app) => ({ 'APP-SUPPORT-001':'Support AI', 'APP-CONTACT-002':'AI Contact Center', 'APP-DOC-003':'Document AI', 'APP-GROWTH-004':'Marketing AI' }[app.id] || app.name);
    const statusClass = (status) => String(status).toLowerCase() === 'healthy' ? 'is-good' : 'is-warn';
    host.innerHTML = cp.applications.map((app) => `
      <article class="app-health-compact" data-app-id="${app.id}">
        <span class="app-health-icon"><i data-lucide="${iconFor(app.id)}"></i></span>
        <div class="app-health-copy">
          <h3>${displayName(app)}</h3>
          <span class="app-health-model">${app.model}</span>
          <div class="app-health-meta"><span>${app.requests30d} traffic</span><span>${app.p95} P95</span></div>
        </div>
        <div class="app-health-state"><span class="cp-status ${statusClass(app.status)}"><span></span>${app.status}</span></div>
      </article>
    `).join('');
  };

  const renderCommandRequests = () => {
    const host = document.getElementById('command-request-list');
    const cp = window.Orvexa?.controlPlane;
    if (!host || !cp) return;
    const displayApp = (req) => ({ 'APP-SUPPORT-001':'Support AI', 'APP-CONTACT-002':'AI Contact Center', 'APP-DOC-003':'Document AI', 'APP-GROWTH-004':'Marketing AI' }[req.appId] || req.app);
    const statusClass = (status) => ['completed','streaming'].includes(String(status).toLowerCase()) ? 'is-good' : 'is-warn';
    host.innerHTML = cp.liveRequests.slice(0,3).map((req) => `
      <article class="request-mini-row">
        <div class="request-mini-copy">
          <div class="request-mini-title"><b>${displayApp(req)}</b><span>${req.requestId}</span></div>
          <span class="request-mini-meta">${req.model}</span>
          <span class="request-mini-route-label">${req.route}</span>
        </div>
        <div class="request-mini-tail"><b>${req.latency}</b><span class="cp-status ${statusClass(req.status)}"><span></span>${req.status}</span></div>
      </article>
    `).join('');
  };

  renderMetrics();
  renderModels();
  renderAgents();
  renderApprovals();
  renderMedia();
  renderKnowledge();
  renderWaveform();
  renderQuality();
  renderDeployments();
  renderCommandApplications();
  renderCommandRequests();
})();
