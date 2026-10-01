(() => {
  'use strict';

  const product = window.Orvexa?.product;
  const data = product?.intelligence;
  const page = document.body.dataset.intelligencePage || document.body.dataset.activePage;
  const main = document.querySelector('main');
  if (!product || !data || !main) return;

  const icon = (name) => `<i data-lucide="${name}"></i>`;
  const tone = (value = '') => /healthy|active|complete|resolved|verified|automatic|running|live/i.test(value)
    ? 'good'
    : /watch|review|stale|partial|weak|required/i.test(value)
      ? 'warn'
      : /failed|missing|high|blocked/i.test(value)
        ? 'bad'
        : 'info';
  const status = (label, custom) => `<span class="p3-status ${custom || tone(label)}">${label}</span>`;
  const button = (label, glyph = 'sliders-horizontal', primary = false, attrs = '') => `<button class="p3-btn ${primary ? 'primary' : ''}" type="button" ${attrs}>${icon(glyph)}${label}</button>`;
  const panelHead = (title, copy, extra = '') => `<header class="p3-panel-head"><div><h2>${title}</h2><p>${copy}</p></div>${extra}</header>`;
  const head = (title, copy, action, glyph = 'plus') => `<section class="p3-head"><div class="p3-title"><h1>${title}</h1></div><div class="p3-context"><button class="p3-select" type="button" data-p3-action="Workspace selector">${icon('building-2')}Nova Intelligence${icon('chevron-down')}</button><button class="p3-select" type="button" data-p3-action="Environment selector">${icon('radio')}Production${icon('chevron-down')}</button>${action ? button(action, glyph, true, `data-p3-action="${action}"`) : ''}</div></section>`;
  const metrics = (items) => `<section class="p3-metrics ${items.length > 4 ? 'six' : ''}">${items.map(item => `<article class="p3-metric"><span class="p3-metric-icon">${icon(item[3] || 'activity')}</span><small>${item[0]}</small><strong>${item[1]}</strong><em class="${item[4] || ''}">${item[2]}</em></article>`).join('')}</section>`;

  const providerRows = () => product.gateway.providers.map(provider => `<button class="p3-row p3-provider-row ${provider.state === 'Watch' ? 'is-watch' : ''}" data-p3-inspect data-title="${provider.name}" data-id="${provider.id}"><span><b>${provider.name}</b><small>${provider.id}</small></span><span>${provider.availability}</span><span>${provider.p95}</span><span>${provider.errors}</span><span>${provider.share}</span><span>${status(provider.state)}</span></button>`).join('');

  const modelCards = () => data.models.map(model => {
    const providerLabel = model.hostedVia ? `Hosted via ${model.hostedVia}` : model.vendor ? `${model.provider} · ${model.vendor}` : model.provider;
    return `<button class="p3-model tone-${model.brand || model.providerKey || 'default'}" data-p3-model="${`${providerLabel} ${model.name} ${model.capabilities} ${model.lifecycle || ''}`.toLowerCase()}" data-p3-provider="${model.providerKey || model.provider.toLowerCase()}" data-p3-capabilities="${model.capabilities.toLowerCase()}" data-p3-health="${model.state.toLowerCase()}" data-p3-inspect data-title="${model.name}" data-id="${model.id}"><div class="p3-model-top"><span class="p3-model-mark">${icon('cpu')}</span>${status(model.state)}</div><div class="p3-model-heading"><h3>${model.name}</h3><span class="p3-lifecycle ${String(model.lifecycle || '').toLowerCase()}">${model.lifecycle || 'Current'}</span></div><p class="p3-model-id">${providerLabel}<span>${model.id}</span></p><p class="p3-capabilities">${model.capabilities}</p><div class="p3-facts"><span><b>${model.quality}</b><small>Quality</small></span><span><b>${model.p95}</b><small>P95</small></span><span><b>${model.ttft}</b><small>TTFT</small></span><span><b>${model.cost}</b><small>Cost / request</small></span></div><div class="p3-feature-line"><span>${model.context} context</span><span>${model.input}</span><span>Streaming</span><span>Tools</span></div></button>`;
  }).join('');

  const modelMoreCard = () => `<button class="p3-model-more" id="p3-model-more" type="button" data-p3-action="View full model catalog"><span class="p3-model-more-icon">${icon('layers-3')}</span><strong>13 more production models</strong><p>Text · vision · reasoning · embeddings</p><span class="p3-model-more-link">View full catalog ${icon('arrow-right')}</span></button>`;

  const modelsPage = () => `${head('Models & Providers', 'Catalog approved models, capabilities, performance and provider connectivity.', 'Compare models', 'git-compare-arrows')}${metrics([
    ['Production models', '18', '4 providers', 'cpu'],
    ['Traffic-weighted quality', '96.8%', '+0.7% in 30 days', 'badge-check'],
    ['Provider availability', '99.95%', 'Within target', 'activity'],
    ['Effective blended cost', '$0.0098', '-8.1% from routing & cache', 'circle-dollar-sign'],
  ])}<section class="p3-panel"><div class="p3-panel-head p3-model-catalog-head"><div><h2>Featured production models</h2><p><b>5 shown · 18 available</b> · approved models, capabilities and operational health.</p></div><div class="p3-model-toolbar"><input class="p3-input" id="p3-model-search" aria-label="Search models" placeholder="Search models..."><select class="p3-filter-select" id="p3-model-provider" aria-label="Filter by provider"><option value="all">Provider</option><option value="openai">Astra AI</option><option value="anthropic">Meridian AI</option><option value="google">Orbit AI</option><option value="bedrock">Nimbus AI</option></select><select class="p3-filter-select" id="p3-model-capability" aria-label="Filter by capability"><option value="all">Capability</option><option value="reasoning">Reasoning</option><option value="vision">Vision</option><option value="tools">Tools</option></select><select class="p3-filter-select" id="p3-model-health" aria-label="Filter by health"><option value="all">Health</option><option value="healthy">Healthy</option><option value="watch">Watch</option></select><button class="p3-btn" id="p3-test-connection" type="button">${icon('plug-zap')}Test connection</button><button class="p3-btn" id="p3-add-provider" type="button">${icon('plus')}Add provider</button></div></div><div class="p3-model-grid" id="p3-model-grid">${modelCards()}${modelMoreCard()}</div><div class="p3-empty" id="p3-model-empty" hidden><i>${icon('search-x')}</i><h3>No matching models</h3><p>Try a provider, capability, health state, or model name.</p></div></section><section class="p3-grid equal p3-section"><article class="p3-panel">${panelHead('Model efficiency', 'Quality score relative to effective request cost.', status('Live sample', 'live'))}<div class="p3-chart" id="p3-model-scatter"></div></article><article class="p3-panel">${panelHead('Provider health', 'Availability, latency, errors, and current traffic share.', button('Open gateway', 'route', false, 'data-p3-link="ai-gateway.html"'))}<div class="p3-table p3-provider-table"><div class="p3-table-head"><span>Provider</span><span>Availability</span><span>P95</span><span>Errors</span><span>Traffic</span><span>Status</span></div>${providerRows()}</div></article></section>`;

  const evidenceFabric = () => `<div class="p3-evidence-fabric" aria-label="Evidence pipeline">${[
    ['Sources', '42 sources', 'Connected', 'database', 'sources', 'KS-SOURCES-42'],
    ['Index', '1.84M chunks', 'Healthy', 'binary', 'index', 'IDX-PROD-01'],
    ['Retrieval', '183ms P95', 'On target', 'search-check', 'retrieval', 'RET-PROD-01'],
    ['Citation', '97.1% coverage', 'Healthy', 'quote', 'citation', 'CIT-PROD-01'],
    ['Response', 'Grounded output', 'Live', 'message-square', 'response', 'RSP-GROUNDED'],
  ].map((item, index) => `<button class="p3-evidence-node stage-${item[4]} ${index === 2 ? 'core' : ''}" type="button" data-p3-inspect data-title="${item[0]} stage" data-id="${item[5]}"><span class="p3-evidence-icon">${icon(item[3])}</span><span class="p3-evidence-copy"><b>${item[0]}</b><strong>${item[1]}</strong><small>${item[2]}</small></span>${index < 4 ? `<span class="p3-evidence-arrow">${icon('arrow-right')}</span>` : ''}</button>`).join('')}</div>`;

  const knowledgeSpaces = () => data.knowledgeSpaces.map(space => {
    const appTone = space.app === 'APP-SUPPORT-001' ? 'app-support' : space.app === 'APP-CONTACT-002' ? 'app-contact' : space.app === 'APP-DOC-003' ? 'app-document' : space.app === 'APP-GROWTH-004' ? 'app-growth' : '';
    return `<button class="p3-space ${appTone}" data-p3-inspect data-title="${space.name}" data-id="${space.id}"><span><h3>${space.name}</h3><p>${space.id} / ${space.app}</p></span><span class="p3-space-stats"><span><small>Documents</small><b>${space.documents}</b></span><span><small>Source relevance</small><b>${space.relevance}</b></span>${status(space.state)}</span></button>`;
  }).join('');

  const operationalExceptions = () => [
    ['Stale source', '1 / 42', 'Watch', 'database-zap', 'warn'],
    ['Parse failures', '14 docs', 'Needs review', 'file-warning', 'warn'],
    ['Weak citations', '0.7%', 'Within target', 'quote', 'good'],
    ['ACL blocks', '284 today', 'Expected', 'shield-check', 'info'],
    ['Malware quarantined', '3 files', 'Contained', 'shield-alert', 'good'],
    ['Human review', '18 answers', 'Open', 'user-check', 'warn'],
  ].map(item => `<div class="p3-exception-row"><span class="p3-exception-icon ${item[4]}">${icon(item[3])}</span><span class="p3-exception-copy"><b>${item[0]}</b><small>${item[1]}</small></span>${status(item[2], item[4])}</div>`).join('');

  const knowledgePage = () => `${head('Knowledge Overview', 'Measure the health, freshness and quality of enterprise knowledge.', 'Open retrieval control', 'search-check')}${metrics([
    ['Documents', '70.7K', '+2.8K this week', 'files'],
    ['Indexed chunks', '1.84M', 'Index throughput · 18.4K chunks/min', 'binary'],
    ['Freshness', '98.6%', '1 source outside SLA', 'refresh-cw', 'warn'],
    ['Knowledge relevance', '96.4%', '+1.2% this month', 'target'],
    ['Citation coverage', '97.1%', 'Claims with evidence', 'quote'],
    ['Retrieval P95', '183ms', '37ms under target', 'timer'],
  ])}<section class="p3-panel p3-evidence-panel">${panelHead('Evidence Fabric', 'Connected evidence pipeline from trusted sources to grounded production responses.', status('Production', 'live'))}${evidenceFabric()}</section><section class="p3-grid two p3-section"><article class="p3-panel">${panelHead('Knowledge spaces', 'Application-scoped evidence with freshness and source relevance.', button('Manage sources', 'cloud-download', false, 'data-p3-link="sources-ingestion.html"'))}<div class="p3-space-list">${knowledgeSpaces()}</div></article><aside class="p3-panel">${panelHead('Source watch', 'Freshness, ingestion, and grounding exceptions needing action.', status('3 signals', 'warn'))}${[
    ['Employee Policy source is stale', 'SRC-POLICY-022 missed freshness SLA by 18 hours.', 'database-zap', 'sources-ingestion.html?source=SRC-POLICY-022'],
    ['14 documents failed parsing', 'JOB-ING-8404 stopped after protection and format errors.', 'file-warning', 'sources-ingestion.html?job=JOB-ING-8404'],
    ['Grounding score below release gate', 'REL-2026-08-27-A requires 96.0% before promotion.', 'shield-alert', 'evaluations.html?release=REL-2026-08-27-A'],
  ].map(item => `<a class="p3-watch" href="./${item[3]}"><i>${icon(item[2])}</i><span><b>${item[0]}</b><small>${item[1]}</small></span>${icon('chevron-right')}</a>`).join('')}</aside></section><section class="p3-grid equal p3-section"><article class="p3-panel">${panelHead('Grounding quality', '7-day retrieval relevance and citation coverage.', status('96.4%', 'good'))}<div class="p3-chart p3-grounding-chart" id="p3-grounding-chart"></div></article><article class="p3-panel p3-exceptions-panel">${panelHead('Operational exceptions', 'Current evidence-fabric boundaries and review states.')}<div class="p3-exception-list">${operationalExceptions()}</div></article></section>`;

  const pipeline = () => `<div class="p3-ingestion-pipeline" aria-label="Ingestion pipeline"><span class="p3-ingest-track" aria-hidden="true"></span><span class="p3-ingest-pulse" aria-hidden="true"></span>${[
    ['Fetch', '42 sources', 'Connected', 'cloud-download', 'fetch', 'ING-FETCH-42'],
    ['Parse', '70.7K docs', 'Healthy', 'scan-text', 'parse', 'ING-PARSE-70700'],
    ['Protect', 'PII · malware · ACL', '99.9% pass', 'shield-check', 'protect', 'ING-PROTECT-999'],
    ['Chunk', '1.84M chunks', 'Healthy', 'split', 'chunk', 'ING-CHUNK-1840K'],
    ['Embed', '18.4K/min', 'JOB-ING-8412 · Active', 'binary', 'embed', 'JOB-ING-8412'],
    ['Index', '4 spaces', 'Production', 'database', 'index', 'IDX-PROD-04'],
  ].map((step,index) => `<button class="p3-ingest-node stage-${step[4]} ${step[4] === 'embed' ? 'is-active' : ''}" type="button" data-p3-inspect data-title="${step[0]} stage" data-id="${step[5]}"><span class="p3-ingest-icon">${icon(step[3])}</span><span class="p3-ingest-copy"><b>${step[0]}</b><strong>${step[1]}</strong><small>${step[2]}</small></span>${index < 5 ? `<span class="p3-ingest-arrow">${icon('arrow-right')}</span>` : ''}</button>`).join('')}</div>`;

  const sourceTone = connector => connector === 'Cloud storage' ? 'source-cloud' : connector === 'Website' ? 'source-web' : connector === 'CRM' ? 'source-crm' : connector === 'Database' ? 'source-database' : connector === 'Files' ? 'source-files' : 'source-neutral';
  const sourceRows = () => data.sources.map(source => {
    const failedJob = source.id === 'SRC-POLICY-022' ? 'JOB-ING-8404' : '';
    return `<div class="p3-row p3-source-row ${sourceTone(source.connector)}" tabindex="0" role="button" data-p3-source="${`${source.name} ${source.connector} ${source.space} ${source.state}`.toLowerCase()}" data-p3-connector="${source.connector.toLowerCase()}" data-p3-status="${source.state.toLowerCase()}" data-p3-inspect data-title="${source.name}" data-id="${source.id}"><span><b>${source.name}</b><small>${source.id}</small></span><span>${source.space}</span><span>${source.connector}</span><span class="p3-num">${source.documents}</span><span>${source.lastSync}<small>${source.freshness} fresh</small></span><span class="p3-source-errors p3-num"><b>${source.errors}</b>${failedJob ? `<a class="p3-source-job-link" href="./sources-ingestion.html?job=${failedJob}" title="Open failed ingestion job ${failedJob}">Open failed job</a>` : ''}</span><span class="p3-state-cell">${status(source.state)}</span></div>`;
  }).join('');

  const jobRows = () => data.ingestionJobs.map(job => {
    const running = job.state === 'Running';
    const progress = Number(job.progress || 0);
    const processed = running ? `<span class="p3-job-progress"><b>${job.processed} / ${job.target}</b><span class="p3-progress-track"><i style="width:${progress}%"></i></span><small>${progress}%</small></span>` : `<span class="p3-num">${job.processed}</span>`;
    return `<button class="p3-row p3-job-row ${running ? 'is-running' : ''}" data-p3-inspect data-title="${job.id}" data-id="${job.id}" data-source-id="${job.source}"><span><b>${job.id}</b><small>Ingestion job</small></span><span class="p3-mono">${job.source}</span>${processed}<span class="p3-num">${job.failed}</span><span class="p3-num">${job.duration}</span><span class="p3-num">${job.started}</span><span class="p3-state-cell">${status(job.state)}</span></button>`;
  }).join('');

  const sourcesPage = () => `${head('Sources & Ingestion', 'Operate connectors, sync jobs and protected knowledge ingestion pipelines.', 'Register source', 'plus')}${metrics([
    ['Connected sources', '42', '7 connector types', 'plug'],
    ['Freshness SLA', '98.6%', '1 source outside target', 'activity', 'warn'],
    ['Embedding throughput', '18.4K/min', '1.84M indexed chunks', 'binary'],
    ['Protection pass', '99.9%', 'PII · malware · ACL checks', 'shield-check'],
  ])}<section class="p3-panel p3-ingestion-panel">${panelHead('Ingestion pipeline', 'Protected stages from source acquisition to production index.', status('JOB-ING-8412 · Embedding', 'live'))}${pipeline()}</section><section class="p3-panel p3-section p3-source-panel"><div class="p3-panel-head p3-source-head"><div><h2>Source registry</h2><p><b>5 featured sources · 42 connected</b> · files, websites, cloud storage, databases, CRM, helpdesk and APIs.</p></div><div class="p3-source-toolbar"><input class="p3-input" id="p3-source-search" aria-label="Search sources" placeholder="Search sources…"><select class="p3-filter-select" id="p3-source-connector" aria-label="Filter by connector"><option value="all">Connector</option><option value="cloud storage">Cloud storage</option><option value="website">Website</option><option value="crm">CRM</option><option value="database">Database</option><option value="files">Files</option></select><select class="p3-filter-select" id="p3-source-status" aria-label="Filter by source status"><option value="all">Status</option><option value="healthy">Healthy</option><option value="stale">Stale</option></select>${button('Recheck freshness', 'refresh-cw', false, 'data-p3-action="Recheck freshness"')}</div></div><div class="p3-table p3-source-table" id="p3-source-table"><div class="p3-table-head"><span>Source</span><span>Knowledge space</span><span>Connector</span><span>Documents</span><span>Last successful sync</span><span>Errors</span><span>Status</span></div>${sourceRows()}</div><div class="p3-empty" id="p3-source-empty" hidden><i>${icon('database-zap')}</i><h3>No matching sources</h3><p>Try a source ID, connector type, knowledge space or status.</p></div><footer class="p3-source-footer">Showing 5 featured sources from 42 connected sources</footer></section><section class="p3-panel p3-section p3-jobs-panel">${panelHead('Ingestion jobs', 'Recent processing jobs with document counts, failures and duration.', button('View logs', 'scroll-text', false, 'data-p3-action="Ingestion logs"'))}<div class="p3-table p3-jobs-table"><div class="p3-table-head"><span>Job</span><span>Source</span><span>Processed</span><span>Failed</span><span>Duration</span><span>Started</span><span>Status</span></div>${jobRows()}</div></section>`;

  const retrievalPolicyTone = app => app === 'APP-SUPPORT-001' ? 'app-support' : app === 'APP-CONTACT-002' ? 'app-contact' : app === 'APP-DOC-003' ? 'app-document' : '';
  const policyCards = () => data.retrievalPolicies.map(policy => `<button class="p3-policy ${retrievalPolicyTone(policy.app)}" data-p3-inspect data-title="${policy.name}" data-id="${policy.id}"><div class="p3-policy-top"><span class="p3-policy-icon">${icon('search-check')}</span>${status(policy.state)}</div><h3>${policy.name}</h3><small>${policy.id} / ${policy.app}</small><div class="p3-facts"><span><small>Top-K</small><b>${policy.topK}</b></span><span><small>Search</small><b>${policy.search}</b></span><span><small>Reranker</small><b>${policy.reranker}</b></span><span><small>Threshold</small><b>${policy.threshold}</b></span></div><div class="p3-feature-line"><span>${policy.filters}</span></div></button>`).join('');

  const retrievalEvidence = () => [
    ['1','0.92','Billing Policy 8.4','Exception authority','Supervisors may approve a late-fee waiver when the account meets enterprise exception criteria and the reason is recorded.','Billing policy · Updated 4d ago · ACL passed',92],
    ['2','0.87','Enterprise Service Guide','Billing adjustments','Fee adjustments above $500 require manager approval and an auditable case note.','Service guide · Updated 9d ago · ACL passed',87],
    ['3','0.81','Support Playbook','Escalation matrix','Route uncertain billing-policy interpretations to Human Review before any write action.','Support playbook · Updated 12d ago · ACL passed',81],
  ].map(item => `<article class="retrieval-result" data-score="${item[1]}"><span class="retrieval-rank">${item[0]}</span><span class="retrieval-result-copy"><span class="retrieval-result-title"><b>${item[2]}</b><small>${item[3]}</small></span><p>${item[4]}</p><em>${item[5]}</em><span class="retrieval-score-bar" aria-hidden="true"><i style="width:${item[6]}%"></i></span></span><strong>${item[1]}</strong></article>`).join('');

  const groundingRows = () => data.groundingExceptions.map(item => {
    const resolved = item.state === 'Resolved';
    return `<button class="p3-row p3-grounding-row ${resolved ? 'is-resolved' : 'is-review'}" style="grid-template-columns:minmax(250px,1.55fr) minmax(185px,1fr) repeat(4,minmax(80px,.55fr))" data-p3-inspect data-title="Grounding exception" data-id="${item.id}"><span><b>${item.query}</b><small>${item.run || item.id}</small>${item.note ? `<em>${item.note}</em>` : ''}</span><span>${item.document}</span><span class="p3-num">${item.score}</span><span>${item.grounded}</span><span>${item.citation}</span><span class="p3-state-cell">${status(item.state)}</span></button>`;
  }).join('');

  const retrievalTraceFlow = () => `<div class="p3-retrieval-trace" aria-label="Retrieval trace flow">${[
    ['Request','REQ-RAG-8217A','message-square'],
    ['Query','Late-fee waiver','search'],
    ['Chunks','12 retrieved','layers-3'],
    ['Reranker','8 passed','list-filter'],
    ['Citations','3 verified','quote'],
  ].map((item,index) => `<div class="p3-retrieval-trace-step"><span>${icon(item[2])}</span><b>${item[0]}</b><small>${item[1]}</small>${index < 4 ? `<i class="p3-trace-arrow">${icon('arrow-right')}</i>` : ''}</div>`).join('')}</div>`;

  const retrievalPage = () => `${head('Retrieval & Grounding', 'Tune retrieval strategies and verify evidence behind AI answers.', 'New policy version', 'git-compare')}${metrics([
    ['Production retrieval relevance', '94.8%', 'Production weighted · Last 24h', 'target'],
    ['Citation coverage', '97.1%', 'Approved evidence', 'quote'],
    ['Grounding failures', '0.8%', '18 reviews · Last 24h', 'shield-alert', 'warn'],
    ['Retrieval P95', '183ms', 'Includes reranking', 'timer'],
  ])}<section class="p3-panel p3-retrieval-policy-panel">${panelHead('Retrieval policies', 'Top-K, hybrid search, reranking, score thresholds, and filters.', button('Test retrieval', 'square-terminal', false, 'data-p3-link="test-console.html"'))}<div class="p3-policy-grid">${policyCards()}</div></section><section class="p3-panel p3-section p3-retrieval-lab">${panelHead('Retrieval Lab','Ask a question, retrieve evidence, rerank candidates and verify a grounded answer before changing policy.',status('Interactive','live'))}<div class="retrieval-playground"><div class="retrieval-query"><div class="retrieval-query-kicker">${icon('search-check')} Query</div><label class="route-field retrieval-question"><span>Question</span><textarea id="retrieval-query-input">Can a supervisor waive the late fee for an enterprise customer?</textarea></label><div class="retrieval-query-primary"><label class="retrieval-policy-field"><span>Policy</span><select class="p3-select" id="retrieval-policy-select"><option value="RET-HYBRID-04:v17">Support Hybrid · v17</option><option value="RET-VOICE-07:v9">Contact Fast Grounding · v9</option><option value="RET-DOC-03:v12">Document Deep Evidence · v12</option></select></label>${button('Run retrieval','play',true,'id="retrieval-query-run"')}<button class="p3-btn retrieval-advanced-toggle" type="button" id="retrieval-advanced-toggle" aria-expanded="false">${icon('sliders-horizontal')}Advanced settings</button></div><div class="retrieval-query-context"><span>${icon('git-branch')} Current policy · RET-HYBRID-04:v17</span><span>${icon('fingerprint')} REQ-RAG-8217A</span></div><div class="retrieval-advanced" id="retrieval-advanced" hidden><div class="retrieval-advanced-grid"><label>Top-K<select id="intel-top-k"><option>8</option><option selected>12</option><option>20</option></select></label><label>Threshold<input id="intel-threshold" type="number" min="0.5" max="0.99" step="0.01" value="0.78"></label><label>Hybrid weights<select id="intel-search-mode"><option selected>Vector 70 / Keyword 30</option><option>Vector 80 / Keyword 20</option><option>Vector 60 / Keyword 40</option></select></label><label>Reranker<select id="intel-reranker"><option selected>Cohere v3</option><option>BGE Reranker</option><option>MiniLM</option></select></label><label class="retrieval-check"><input id="intel-acl" type="checkbox" checked><span>ACL enabled</span></label></div></div></div><div class="retrieval-evidence"><header class="retrieval-evidence-head"><div><span class="retrieval-query-kicker">${icon('database-zap')} Evidence</span><h3>Ranked evidence</h3><p>Current run · RET-HYBRID-04:v17 · 3 cited sources</p></div>${status('Fixed', 'good')}</header><div class="retrieval-results" id="retrieval-query-results">${retrievalEvidence()}</div><section class="retrieval-grounded-answer" id="retrieval-grounded-answer"><header><span>${icon('badge-check')}</span><div><small>Grounded answer</small><b>Yes, conditionally.</b></div>${status('Verified','good')}</header><p>A supervisor may waive the fee for an eligible enterprise account when the exception criteria are met and the reason is recorded. Adjustments above $500 require manager approval.</p><div class="retrieval-citations"><button type="button" data-p3-action="Citation 1">[1] Billing Policy 8.4</button><button type="button" data-p3-action="Citation 2">[2] Enterprise Service Guide</button></div></section></div></div></section><section class="p3-grid two p3-section p3-retrieval-bottom"><article class="p3-panel">${panelHead('Grounding exceptions', 'Historical and current runs with weak evidence, missing citations, or partial grounding.', status('2 open', 'warn'))}<div class="p3-table p3-grounding-table"><div class="p3-table-head" style="grid-template-columns:minmax(250px,1.55fr) minmax(185px,1fr) repeat(4,minmax(80px,.55fr))"><span>Query</span><span>Retrieved document</span><span>Score</span><span>Grounded</span><span>Citation</span><span>Status</span></div>${groundingRows()}</div></article><aside class="p3-panel">${panelHead('Trace drill-down', 'TRC-RAG-8217A · current retrieval run.', button('Open trace', 'git-branch', false, 'data-p3-link="traces.html?trace=TRC-RAG-8217A"'))}${retrievalTraceFlow()}<div class="p3-panel-body"><div class="p3-privacy p3-grounded-summary"><i>${icon('badge-check')}</i><span><b>Grounded response · Verified</b><p>Three approved sources support the answer. One low-score chunk was excluded before generation.</p></span></div></div></aside></section>`;

  const contextComposition = () => {
    const cap = 128;
    const used = data.contextComposition.reduce((sum, part) => sum + Number.parseFloat(part.tokens), 0);
    const headroom = Math.max(0, cap - used);
    const color = part => part.tone === 'primary' ? 'var(--primary)' : part.tone === 'cyan' ? 'var(--cyan)' : part.tone === 'mint' ? 'var(--mint)' : part.tone === 'amber' ? 'var(--amber)' : part.tone === 'violet' ? '#8d7cc7' : '#7d8a96';
    const parts = data.contextComposition.map(part => ({...part, budgetPct:(Number.parseFloat(part.tokens) / cap) * 100}));
    return `<div class="p3-context-budget-summary"><span><b>${used.toFixed(1)}K used</b><small>48.3% of 128K context cap</small></span><span class="headroom"><b>${headroom.toFixed(1)}K headroom</b><small>51.7% available</small></span></div><div class="p3-token-bar p3-context-budget-bar" aria-label="Context Budget Map: ${used.toFixed(1)}K used of ${cap}K">${parts.map(part => `<span class="${part.tone}" style="width:${part.budgetPct.toFixed(3)}%" title="${part.label}: ${part.tokens}"></span>`).join('')}<span class="headroom" style="width:${((headroom / cap) * 100).toFixed(3)}%" title="Headroom: ${headroom.toFixed(1)}K"></span></div><div class="p3-token-legend p3-context-token-legend">${parts.map(part => `<div><i class="${part.tone}" style="background:${color(part)}"></i><span>${part.label}</span><b>${part.tokens}</b></div>`).join('')}<div class="is-headroom"><i></i><span>Headroom</span><b>${headroom.toFixed(1)}K</b></div></div><div class="p3-context-mobile-budget">${parts.map(part => `<div><span><b>${part.label}</b><small>${part.tokens}</small></span><i><em class="${part.tone}" style="width:${part.budgetPct.toFixed(3)}%;background:${color(part)}"></em></i></div>`).join('')}<div class="is-headroom"><span><b>Headroom</b><small>${headroom.toFixed(1)}K</small></span><i><em style="width:${((headroom/cap)*100).toFixed(3)}%"></em></i></div></div>`;
  };

  const contextProfileRows = () => data.contextProfiles.map(profile => {
    const appTone = profile.app === 'APP-SUPPORT-001' ? 'app-support' : profile.app === 'APP-CONTACT-002' ? 'app-contact' : profile.app === 'APP-DOC-003' ? 'app-document' : profile.app === 'APP-GROWTH-004' ? 'app-growth' : '';
    const utilization = Number.parseFloat(profile.utilization);
    return `<button class="p3-row p3-context-profile-row ${appTone}" data-p3-inspect data-title="${profile.name}" data-id="${profile.id}"><span><b>${profile.name}</b><small>${profile.id}</small></span><span class="p3-mono">${profile.app}</span><span class="p3-num">${profile.window}</span><span class="p3-context-utilization"><b>${profile.utilization}</b><i aria-hidden="true"><em style="width:${Math.min(100,utilization)}%"></em></i></span><span class="p3-num">${profile.cache}</span><span>${profile.memory}</span><span class="p3-state-cell">${status(profile.state)}</span></button>`;
  }).join('');

  const contextPage = () => `${head('Context & Memory', 'Control context windows, caching, memory and conversation retention.', 'New context profile', 'plus')}${metrics([
    ['Context utilization', '48.3%', '61.8K used · 66.2K headroom', 'layers-3'],
    ['Prefix cache reuse', '68.4%', '41.2K of eligible prefix tokens', 'database'],
    ['Evidence retention', '99.2%', 'After context compaction', 'scan-line'],
    ['Persistent memory writes', '1.7%', 'Of sessions · Last 24h', 'shield-check'],
  ])}<section class="p3-grid two p3-context-overview"><article class="p3-panel p3-context-budget-panel">${panelHead('Context Budget Map', 'Example production request shows where the 128K context cap is spent and what remains available.', status('Within budget'))}<div class="p3-panel-body">${contextComposition()}</div></article><aside class="p3-panel p3-memory-boundary-panel">${panelHead('Memory policy boundary', 'Retention is explicit, scoped, and auditable.', status('Privacy enforced', 'warn'))}<div class="p3-panel-body"><div class="p3-privacy p3-memory-policy-intro"><i>${icon('shield-check')}</i><span><b>Minimized memory by default</b><p>Session context stays transient. Persistent memory requires explicit consent or an approved policy, with redaction and tenant ACL enforcement.</p></span></div><div class="p3-memory-modes"><span class="mode-session"><small>Session only</small><b>Volatile context</b></span><span class="mode-short"><small>Short term</small><b>Time-bound summary</b></span><span class="mode-saved"><small>Saved summary</small><b>Policy approved</b></span><span class="mode-disabled"><small>Disabled</small><b>No retention</b></span></div></div></aside></section><section class="p3-panel p3-section p3-context-profiles-panel">${panelHead('Context profiles', 'Application-level context caps, cache reuse and memory policy.', button('Retention audit', 'history', false, 'data-p3-action="Retention audit"'))}<div class="p3-table p3-context-table"><div class="p3-table-head"><span>Profile</span><span>Application</span><span>Context cap</span><span>Utilization</span><span>Cache reuse</span><span>Memory</span><span>Status</span></div>${contextProfileRows()}</div></section>`;

  const promptAppTone = app => app === 'APP-SUPPORT-001' ? 'app-support' : app === 'APP-CONTACT-002' ? 'app-contact' : app === 'APP-DOC-003' ? 'app-document' : app === 'APP-GROWTH-004' ? 'app-growth' : app === 'APP-RESEARCH-005' ? 'app-research' : app === 'APP-SALES-006' ? 'app-sales' : app === 'APP-COMPLY-007' ? 'app-compliance' : app === 'APP-RAG-008' ? 'app-rag' : '';
  const promptLifecycle = {
    'PROMPT-SUPPORT-17': { previous:'v17', label:'candidate / review', quality:['96.1%','97.3%'], grounding:['95.8%','97.1%'], p95:['684ms','642ms'], cost:['$0.013','$0.012'], removed:['Cite a source when policy information is used.','Escalate low-confidence requests.'], added:['Cite every policy claim with an approved source ID.','Escalate when grounding confidence is below 0.78.'] },
    'PROMPT-VOICE-09': { previous:'v5', label:'production', quality:['95.9%','96.7%'], grounding:['96.0%','96.8%'], p95:['648ms','618ms'], cost:['$0.015','$0.014'], removed:['Confirm identity before sensitive account details.','Escalate when the caller requests an account write.'], added:['Bind identity evidence to every sensitive answer.','Require verified identity before any account mutation.'] },
    'PROMPT-DOC-12': { previous:'v11', label:'production', quality:['97.4%','98.1%'], grounding:['97.3%','98.2%'], p95:['1.31s','1.24s'], cost:['$0.027','$0.026'], removed:['Use the latest contract when available.','Return clause references.'], added:['Resolve contract revision before analysis.','Return clause, page and approved source identifier.'] },
    'PROMPT-GROWTH-08': { previous:'v17', label:'review candidate', quality:['94.1%','94.8%'], grounding:['93.9%','94.7%'], p95:['916ms','884ms'], cost:['$0.119','$0.112'], removed:['Prepare campaign changes within the assigned budget.','Request review for material changes.'], added:['Treat budget increases as approval-gated actions.','Route changes above policy authority to REV-7741.'] },
    'PROMPT-RESEARCH-14': { previous:'v10', label:'production', quality:['96.4%','97.0%'], grounding:['96.6%','97.4%'], p95:['1.14s','1.08s'], cost:['$0.089','$0.084'], removed:['Summarize the highest-ranking sources.','Call out uncertainty.'], added:['Compare evidence before synthesis.','Attach source IDs to disputed claims and uncertainty.'] },
    'PROMPT-SALES-09': { previous:'v8', label:'production', quality:['95.8%','96.4%'], grounding:['95.9%','96.6%'], p95:['731ms','702ms'], cost:['$0.019','$0.018'], removed:['Use CRM context to suggest next steps.','Do not send messages automatically.'], added:['Keep CRM reads tenant-scoped and auditable.','Require approval before any external communication.'] },
    'PROMPT-COMPLY-07': { previous:'v6', label:'production', quality:['97.7%','98.3%'], grounding:['97.8%','98.5%'], p95:['982ms','936ms'], cost:['$0.021','$0.020'], removed:['Cite the governing policy.','Escalate unclear exceptions.'], added:['Cite policy, jurisdiction and revision for every conclusion.','Never infer an exception outside approved policy text.'] },
    'PROMPT-RAG-14': { previous:'v13', label:'review candidate', quality:['96.2%','96.9%'], grounding:['96.3%','97.1%'], p95:['846ms','812ms'], cost:['$0.016','$0.015'], removed:['Answer from retrieved evidence.','Abstain when evidence is weak.'], added:['Require citation coverage for every material claim.','Abstain below grounding threshold and preserve retrieval evidence.'] },
  };
  const promptEditorSets = {
    'PROMPT-SUPPORT-17': {
      system:[`<span class="comment"># Production support resolution contract</span>`,`<span class="rule">You are the Support AI for <span class="variable var-org">{{organization_name}}</span>.</span>`,``,`Use only evidence returned by <span class="variable var-knowledge">{{knowledge_space}}</span>.`,`Cite every policy claim using <span class="variable var-source">{{approved_source_identifier}}</span>.`,`Ask for confirmation before any write or financial tool call.`,`Escalate when grounding confidence is below <span class="variable var-threshold">{{grounding_threshold}}</span>.`,``,`Return a concise response and a structured decision record.`],
      developer:[`<span class="comment"># Developer instructions</span>`,`Prioritize the newest approved policy revision.`,`Never expose internal account identifiers.`,`Preserve citations when summarizing retrieved evidence.`,`Route refund writes through <span class="variable var-source">TOOL-CRM-REFUND-04</span>.`],
      variables:[`<span class="variable var-org">organization_name</span>: string, required`,`<span class="variable var-knowledge">knowledge_space</span>: enum, required`,`<span class="variable var-source">approved_source_identifier</span>: string, required`,`<span class="variable var-threshold">grounding_threshold</span>: number, default 0.78`,`customer_locale: string, default en-US`],
      schema:[`{`,`  "response": "string",`,`  "citations": ["source_id"],`,`  "confidence": 0.0,`,`  "action": "answer | clarify | escalate",`,`  "tool_approval_required": false`,`}`],
    },
    'PROMPT-VOICE-09': { system:[`<span class="comment"># Realtime contact response</span>`,`Serve the verified caller for <span class="variable var-org">{{organization_name}}</span>.`,`Use approved voice policy from <span class="variable var-knowledge">{{knowledge_space}}</span>.`,`Bind sensitive answers to verified identity evidence.`,`Never execute an account write without confirmation and policy authority.`,`Escalate when confidence is below <span class="variable var-threshold">{{grounding_threshold}}</span>.`]},
    'PROMPT-DOC-12': { system:[`<span class="comment"># Contract evidence analyst</span>`,`Analyze only the approved contract revision in <span class="variable var-knowledge">{{knowledge_space}}</span>.`,`Return clause, page and <span class="variable var-source">{{approved_source_identifier}}</span> for each conclusion.`,`Do not infer missing terms.`,`Escalate conflicts between active and superseded documents.`]},
    'PROMPT-GROWTH-08': { system:[`<span class="comment"># Campaign planning instructions · review candidate</span>`,`Build plans from approved growth evidence and current budget policy.`,`Treat budget increases as approval-gated actions.`,`Route authority exceptions to <span class="variable var-source">REV-7741</span>.`,`Do not publish or spend without explicit authorization.`]},
    'PROMPT-RESEARCH-14': { system:[`<span class="comment"># Research evidence synthesis</span>`,`Compare evidence before synthesis.`,`Attach approved source IDs to disputed claims.`,`Separate fact, inference and uncertainty.`,`Do not conceal conflicting evidence from the final brief.`]},
    'PROMPT-SALES-09': { system:[`<span class="comment"># Sales opportunity guidance</span>`,`Use tenant-scoped CRM reads only.`,`Explain the evidence behind every recommended next step.`,`Require approval before external communication or CRM writes.`,`Do not invent customer commitments or commercial terms.`]},
    'PROMPT-COMPLY-07': { system:[`<span class="comment"># Compliance answer policy</span>`,`Cite policy, jurisdiction and revision for every conclusion.`,`Never infer an exception outside approved policy text.`,`Escalate ambiguous or conflicting requirements.`,`Preserve the evidence chain in the structured output.`]},
    'PROMPT-RAG-14': { system:[`<span class="comment"># Grounded answer contract · review candidate</span>`,`Answer only from retrieved evidence.`,`Require citation coverage for every material claim.`,`Abstain below <span class="variable var-threshold">{{grounding_threshold}}</span>.`,`Preserve retrieval evidence and source identifiers in the output.`]},
  };
  const defaultEditorTabs = {
    developer:[`<span class="comment"># Developer instructions</span>`,`Preserve tenant, policy and approval boundaries.`,`Prefer approved evidence over model prior knowledge.`,`Keep output concise, auditable and structured.`],
    variables:[`<span class="variable var-org">organization_name</span>: string, required`,`<span class="variable var-knowledge">knowledge_space</span>: enum, required`,`<span class="variable var-threshold">grounding_threshold</span>: number, default 0.78`],
    schema:[`{`,`  "response": "string",`,`  "citations": ["source_id"],`,`  "confidence": 0.0,`,`  "action": "answer | clarify | escalate"`,`}`],
  };
  let selectedPromptId = data.prompts[0]?.id || 'PROMPT-SUPPORT-17';
  let activePromptEditorTab = 'system';
  const editorLines = (promptId, tab='system') => (promptEditorSets[promptId]?.[tab] || defaultEditorTabs[tab] || promptEditorSets['PROMPT-SUPPORT-17'][tab] || []).map((line,index)=>`<span class="p3-editor-line"><span class="p3-line-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><span class="p3-line-code">${line || '&nbsp;'}</span></span>`).join('');
  const promptList = () => data.prompts.map((prompt, index) => `<button class="p3-prompt-item ${promptAppTone(prompt.app)} ${index === 0 ? 'active' : ''}" data-p3-prompt data-prompt-id="${prompt.id}" data-title="${prompt.name}" data-id="${prompt.id}"><span><b>${prompt.name}</b><small>${prompt.id} / ${prompt.app} / ${prompt.version}</small></span>${status(prompt.state)}</button>`).join('');
  const promptComparisonMetrics = prompt => { const lifecycle=promptLifecycle[prompt.id]||promptLifecycle['PROMPT-SUPPORT-17']; return `<div class="p3-version-metrics" id="p3-version-metrics">${[['Quality',...lifecycle.quality],['Grounding',...lifecycle.grounding],['P95',...lifecycle.p95],['Cost / request',...lifecycle.cost]].map(item=>`<div><small>${item[0]}</small><span>${item[1]}</span><i>${icon('arrow-right')}</i><b>${item[2]}</b></div>`).join('')}</div>`; };
  const promptDiff = prompt => { const lifecycle=promptLifecycle[prompt.id]||promptLifecycle['PROMPT-SUPPORT-17']; return `<div class="p3-diff" id="p3-prompt-diff"><div class="p3-diff-column"><h3>${lifecycle.previous} / previous</h3>${lifecycle.removed.map(line=>`<span class="p3-diff-line removed">- ${line}</span>`).join('')}</div><div class="p3-diff-column"><h3>${prompt.version} / ${lifecycle.label}</h3>${lifecycle.added.map(line=>`<span class="p3-diff-line added">+ ${line}</span>`).join('')}</div></div>`; };
  const promptsPage = () => { const prompt=data.prompts[0], lifecycle=promptLifecycle[prompt.id]; return `${head('Prompts & Instructions', 'Version, test, compare and safely deploy production prompt contracts.', 'Create version', 'git-branch-plus')}${metrics([
    ['Registered prompts', '84', '16 production active', 'pilcrow'],
    ['Average quality', '96.7%', 'Production prompts · 30D', 'badge-check'],
    ['Pending reviews', '3', '1 release blocking', 'user-check', 'warn'],
    ['Rollback readiness', '100%', '16/16 production versions', 'history'],
  ])}<section class="p3-prompt-layout"><aside class="p3-panel p3-prompt-registry-panel">${panelHead('Prompt registry', '<b>8 shown · 84 registered</b> · application, version and deployment state.', button('Filter', 'filter', false, 'data-p3-action="Prompt filters"'))}<div class="p3-prompt-filterbar" id="p3-prompt-filterbar" hidden><input class="p3-input" id="p3-prompt-search" type="search" placeholder="Search prompts..." aria-label="Search prompts"><select class="p3-filter-select" id="p3-prompt-state" aria-label="Filter prompt state"><option value="all">All states</option><option value="active">Active</option><option value="review">Review</option></select></div><div class="p3-prompt-list">${promptList()}</div></aside><article class="p3-panel p3-prompt-editor-panel">${panelHead(prompt.name, `${prompt.id} / ${prompt.environment} / ${prompt.version}`, `<div class="p3-actions">${button('Test', 'flask-conical', false, 'data-p3-action="Test prompt"')}<a class="p3-btn primary" data-prompt-eval-link href="./evaluations.html?prompt=${encodeURIComponent(prompt.id)}&version=${encodeURIComponent(prompt.version)}&release=${encodeURIComponent(prompt.release || '')}">${icon('chart-no-axes-combined')}Open evaluation</a>${button('Create candidate', 'git-branch-plus', true, 'data-p3-action="Create candidate" style="display:none"')}</div>`)}<div class="p3-editor-tabs"><button class="p3-editor-tab active" data-p3-editor-tab="system">System</button><button class="p3-editor-tab" data-p3-editor-tab="developer">Developer instructions</button><button class="p3-editor-tab" data-p3-editor-tab="variables">Variables</button><button class="p3-editor-tab" data-p3-editor-tab="schema">Output schema</button></div><div class="p3-editor" id="p3-prompt-editor"><code>${editorLines(prompt.id,'system')}</code></div><footer class="p3-prompt-meta-footer"><span><small>Owner</small><b id="p3-prompt-owner">${prompt.owner}</b></span><span><small>Deployment</small><b id="p3-prompt-deployed">${prompt.deployed}</b></span><span><small>Quality</small><b id="p3-prompt-quality">${prompt.quality}</b></span><span><small>Schema</small><b id="p3-prompt-schema">${prompt.schema}</b></span></footer><div class="intel-prompt-state" id="intel-prompt-state">v17 remains Production. v18 is the Review candidate inside REL-2026-08-27-A and is blocked by the grounding release gate.</div></article></section><section class="p3-panel p3-section p3-version-panel">${panelHead('Version comparison', 'Compare production v17 with candidate v18 before release.', `<div class="p3-actions">${button('Compare evaluations', 'chart-no-axes-combined', false, 'data-p3-action="Compare evaluations"')}${button(`Rollback to ${lifecycle.previous}`, 'undo-2', false, 'data-p3-action="Rollback prompt" style="display:none"')}<button class="p3-btn is-blocked" type="button" data-prompt-promotion-blocked disabled title="Release grounding must reach 96.0% before promotion.">${icon('lock-keyhole')}Promotion blocked</button></div>`)}${promptComparisonMetrics(prompt)}${promptDiff(prompt)}</section>`; };

  const mcpMap = () => {
    const stages = [
      ['Agents', '4 production fleets', 'bot', 'agents'],
      ['Policy boundary', 'Scope · risk · approval', 'shield-check', 'policy'],
      ['MCP Gateway', 'GW-MCP-001', 'network', 'gateway'],
      ['Servers', '12 registered', 'server', 'servers'],
      ['Tools', '52 unique', 'wrench', 'tools'],
    ];
    return `<div class="p3-mcp-topology" aria-label="Governed MCP call path"><div class="p3-mcp-route"><span class="p3-mcp-traffic-dot" aria-hidden="true"></span>${stages.map((item,index)=>`<div class="p3-mcp-stage stage-${item[3]} ${item[3] === 'gateway' ? 'core' : ''}"><span class="p3-mcp-stage-icon">${icon(item[2])}</span><span><b>${item[0]}</b><small>${item[1]}</small></span>${index < stages.length - 1 ? `<i class="p3-mcp-route-arrow" aria-hidden="true">${icon('arrow-right')}</i>` : ''}</div>`).join('')}</div><div class="p3-mcp-approval-branch"><span class="p3-mcp-branch-line" aria-hidden="true"></span><span class="p3-mcp-branch-label">High-risk write</span><div class="p3-mcp-approval-node"><span>${icon('user-check')}</span><div><b>Human approval</b><small>7 governed tools · accountable review</small></div>${status('Required','warn')}</div></div></div>`;
  };

  const mcpServerTone = server => server.id === 'MCP-CRM-01' ? 'server-crm' : server.id === 'MCP-BILLING-02' ? 'server-billing' : server.id === 'MCP-KNOWLEDGE-03' ? 'server-knowledge' : 'server-campaign';
  const toolTone = tool => tool.scope === 'Read' ? 'tool-read' : tool.scope === 'Financial' ? 'tool-financial' : tool.scope === 'External communication' ? 'tool-external' : 'tool-write';
  const serverRows = () => data.mcpServers.map(server => `<button class="p3-row p3-mcp-server-row ${mcpServerTone(server)}" data-p3-inspect data-title="${server.name}" data-id="${server.id}"><span><b>${server.name}</b><small>${server.id}</small></span><span>${server.owner}</span><span>${server.auth}</span><span>${server.environment}</span><span class="p3-num">${server.tools}</span><span class="p3-num">${server.health}</span><span class="p3-state-cell">${status(server.state)}</span></button>`).join('');
  const toolRows = () => data.tools.map(tool => `<button class="p3-row p3-tool-row ${toolTone(tool)} ${tool.risk === 'High' ? 'is-high-risk' : ''}" type="button" data-p3-tool-detail="${tool.id}" aria-haspopup="dialog"><span><b>${tool.name}</b><small>${tool.id} / ${tool.server}</small></span><span>${tool.scope}<small>${tool.risk} risk</small></span><span class="p3-num">${tool.apps}</span><span class="p3-num">${tool.calls}</span><span class="p3-num">${tool.p95}</span><span class="p3-num">${tool.failure}</span><span class="p3-state-cell">${status(tool.approval)}</span></button>`).join('');
  const governanceStrip = () => `<div class="p3-governance-strip">${[
    ['Read','Automatic','Tenant ACL','book-open','read'],
    ['Write','Confirmation / approval','Policy gated','file-pen-line','write'],
    ['Financial','Human review','Accountable action','circle-dollar-sign','financial'],
    ['Identity','Step-up verification','Verified authority','fingerprint','identity'],
    ['External','Policy + review gate','Outbound control','send','external'],
  ].map(item=>`<div class="p3-governance-item tone-${item[4]}"><span>${icon(item[3])}</span><div><b>${item[0]}</b><strong>${item[1]}</strong><small>${item[2]}</small></div></div>`).join('')}</div>`;

  const toolsPage = () => `${head('Tools & MCP', 'Govern every tool and MCP connection agents are allowed to use.', 'Register MCP server', 'server-cog')}${metrics([
    ['MCP servers', '12', '4 active in Production', 'server'],
    ['Registered tools', '52', '53 server bindings', 'wrench'],
    ['Calls today', '1.49M', '+8.4% day over day', 'activity'],
    ['Failure rate', '0.18%', 'Across production tool calls', 'triangle-alert'],
    ['Approval required', '7 tools', '284 reviews · Last 24h', 'user-check', 'warn'],
  ])}<section class="p3-panel p3-mcp-topology-panel">${panelHead('MCP topology', 'Governed request path from agents to tools, with high-risk writes branching to accountable approval.', status('Production', 'live'))}${mcpMap()}</section><section class="p3-panel p3-section p3-server-registry-panel">${panelHead('Server registry', '<b>4 production servers shown · 12 registered</b> · authentication, environment, tool bindings and health.', button('Health checks', 'activity', false, 'data-p3-action="Server health checks"'))}<div class="p3-table p3-mcp-server-table"><div class="p3-table-head"><span>Server</span><span>Owner</span><span>Authentication</span><span>Environment</span><span>Tool bindings</span><span>Health</span><span>Status</span></div>${serverRows()}</div></section><section class="p3-panel p3-section p3-tool-registry-panel">${panelHead('Tool registry', '<b>6 featured tools · 52 registered</b> · scope, risk, application reach and production call behavior.')}<div class="p3-tool-toolbar"><input class="p3-input" type="search" id="intel-tool-search" placeholder="Search tools..." aria-label="Search tools"><select class="p3-filter-select" id="intel-tool-risk" aria-label="Filter by risk"><option value="all">Risk</option><option value="high">High risk</option><option value="medium">Medium risk</option><option value="low">Low risk</option></select><select class="p3-filter-select" id="intel-tool-approval" aria-label="Filter by approval"><option value="all">Approval</option><option value="required">Required</option><option value="automatic">Automatic</option></select><select class="p3-filter-select" id="intel-tool-server" aria-label="Filter by server"><option value="all">Server</option>${data.mcpServers.map(server=>`<option value="${server.id.toLowerCase()}">${server.name}</option>`).join('')}</select><span class="p3-tool-visible-count" id="intel-tool-count">6 visible</span></div><div class="p3-table p3-tool-table"><div class="p3-table-head"><span>Tool</span><span>Scope / risk</span><span>Applications</span><span>Calls</span><span>P95</span><span>Failure</span><span>Approval</span></div>${toolRows()}</div><div class="p3-tool-demo-note">Showing 6 featured tools from a registry of 52 unique tools. Server totals represent 53 environment bindings, so one tool may be bound more than once.</div></section><section class="p3-panel p3-section p3-governance-panel">${panelHead('Governance boundaries', 'Policy enforced across all MCP calls; high-risk writes move to human review before execution.', status('Policy enforced'))}${governanceStrip()}</section>`;

  const renderers = {
    'models-routing': modelsPage,
    'knowledge-rag': knowledgePage,
    'sources-ingestion': sourcesPage,
    'retrieval-grounding': retrievalPage,
    'context-memory': contextPage,
    prompts: promptsPage,
    'tools-mcp': toolsPage,
  };

  const render = renderers[page];
  if (!render) return;
  main.className = 'p3-page';
  if (page === 'knowledge-rag') main.classList.add('p3-knowledge-page');
  if (page === 'sources-ingestion') main.classList.add('p3-sources-page');
  if (page === 'retrieval-grounding') main.classList.add('p3-retrieval-page');
  if (page === 'context-memory') main.classList.add('p3-context-page');
  if (page === 'tools-mcp') main.classList.add('p3-tools-page');
  main.id = 'main-content';
  main.innerHTML = render();
  document.title = `Orvexa - ${main.querySelector('h1')?.textContent || 'Intelligence'}`;

  const drawer = document.createElement('aside');
  drawer.className = 'p3-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-label', 'Intelligence object inspector');
  drawer.innerHTML = `<header class="p3-drawer-head"><div><b id="p3-drawer-title">Inspector</b><small id="p3-drawer-id" style="display:block;margin-top:2px;color:var(--muted);font-size:12px"></small></div><button class="p3-btn" type="button" data-p3-close aria-label="Close inspector">${icon('x')}</button></header><div class="p3-drawer-body"><div class="p3-inspector-facts"><div><small>Organization</small><b>${product.context.organization}</b></div><div><small>Workspace</small><b>${product.context.workspace}</b></div><div><small>Environment</small><b>${product.context.environment}</b></div><div><small>Gateway</small><b>${product.context.gateway}</b></div></div><section class="p3-panel" style="margin-top:16px">${panelHead('Connected evidence', 'Canonical production references for this object.')}<div class="p3-panel-body"><p style="color:var(--muted);font-size:13px;line-height:1.6">The Intelligence inspector keeps models, sources, retrieval, context, prompts, MCP servers, tools, applications, traces, releases, and incidents connected.</p><div class="p3-actions" style="margin-top:14px">${button('Open trace', 'git-branch', true, 'data-p3-link="traces.html"')}${button('Copy ID', 'copy', false, 'data-p3-copy')}</div></div></section></div>`;
  const backdrop = document.createElement('div');
  backdrop.className = 'p3-drawer-backdrop';
  document.body.append(backdrop, drawer);

  let returnFocus = null;
  const closeDrawer = () => {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    returnFocus?.focus?.();
  };
  const openDrawer = (element) => {
    returnFocus = element;
    drawer.querySelector('#p3-drawer-title').textContent = element.dataset.title || 'Inspector';
    drawer.querySelector('#p3-drawer-id').textContent = element.dataset.id || '';
    drawer.classList.add('open');
    backdrop.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.querySelector('[data-p3-close]').focus();
  };

  document.querySelectorAll('[data-p3-inspect]').forEach(element => {
    element.addEventListener('click', event => {
      const nestedControl = event.target.closest('a,button,input,select,textarea');
      if (nestedControl && nestedControl !== element) return;
      openDrawer(element);
    });
    if (element.getAttribute('role') === 'button') element.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('a')) { event.preventDefault(); openDrawer(element); }
    });
  });
  drawer.querySelector('[data-p3-close]').addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    if (event.key === 'Tab' && drawer.classList.contains('open')) {
      const focusable = [...drawer.querySelectorAll('button,a,input,[tabindex]:not([tabindex="-1"])')].filter(element => !element.disabled);
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === focusable.at(-1)) {
        event.preventDefault();
        focusable[0].focus();
      }
    }
  });

  document.querySelectorAll('[data-p3-action]').forEach(element => element.addEventListener('click', () => {
    if (element.dataset.p3Handled === 'true') return;
    if (element.dataset.p3Action === 'Open retrieval control') { window.location.href = './retrieval-grounding.html'; return; }
    window.showToast?.(`${element.dataset.p3Action} opened`, 'sparkles');
  }));
  document.querySelectorAll('[data-p3-link]').forEach(element => element.addEventListener('click', () => {
    window.location.href = `./${element.dataset.p3Link}`;
  }));

  const contextParams = new URLSearchParams(window.location.search);
  const retrievalTraceContext = contextParams.get('trace');
  if (retrievalTraceContext && page === 'retrieval-grounding') {
    const tracePanel = [...document.querySelectorAll('.p3-panel')].find(element => element.textContent.includes(retrievalTraceContext));
    if (tracePanel) {
      tracePanel.classList.add('p3-context-target');
      requestAnimationFrame(() => tracePanel.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      window.showToast?.(`${retrievalTraceContext} retrieval evidence opened`, 'git-branch');
    }
  }
  const contextId = contextParams.get('source') || contextParams.get('job');
  if (contextId) {
    const target = [...document.querySelectorAll('[data-p3-inspect]')].find(element => element.dataset.id === contextId);
    if (target) {
      target.classList.add('p3-context-target');
      requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      window.showToast?.(`${contextId} context opened`, 'locate-fixed');
    }
  }

  const bindSearch = (inputId, selector, emptyId, dataKey) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const update = () => {
      let visible = 0;
      document.querySelectorAll(selector).forEach(element => {
        const haystack = (element.dataset[dataKey] || element.textContent).toLowerCase();
        const match = haystack.includes(input.value.trim().toLowerCase());
        element.hidden = !match;
        if (match) visible += 1;
      });
      const empty = document.getElementById(emptyId);
      if (empty) empty.hidden = visible > 0;
    };
    input.addEventListener('input', update);
  };
  const sourceSearch = document.getElementById('p3-source-search');
  const sourceConnector = document.getElementById('p3-source-connector');
  const sourceStatus = document.getElementById('p3-source-status');
  const applySourceFilters = () => {
    if (!sourceSearch) return;
    const query = sourceSearch.value.trim().toLowerCase();
    const connector = sourceConnector?.value || 'all';
    const state = sourceStatus?.value || 'all';
    let visible = 0;
    document.querySelectorAll('#p3-source-table [data-p3-source]').forEach(row => {
      const match = (!query || row.dataset.p3Source.includes(query))
        && (connector === 'all' || row.dataset.p3Connector === connector)
        && (state === 'all' || row.dataset.p3Status === state);
      row.hidden = !match;
      if (match) visible += 1;
    });
    const empty = document.getElementById('p3-source-empty');
    if (empty) empty.hidden = visible > 0;
  };
  sourceSearch?.addEventListener('input', applySourceFilters);
  sourceConnector?.addEventListener('change', applySourceFilters);
  sourceStatus?.addEventListener('change', applySourceFilters);

  const modelSearch = document.getElementById('p3-model-search');
  const modelProvider = document.getElementById('p3-model-provider');
  const modelCapability = document.getElementById('p3-model-capability');
  const modelHealth = document.getElementById('p3-model-health');
  const applyModelFilters = () => {
    if (!modelSearch) return;
    const query = modelSearch.value.trim().toLowerCase();
    const provider = modelProvider?.value || 'all';
    const capability = modelCapability?.value || 'all';
    const health = modelHealth?.value || 'all';
    let visible = 0;
    document.querySelectorAll('[data-p3-model]').forEach(card => {
      const match = (!query || card.dataset.p3Model.includes(query))
        && (provider === 'all' || card.dataset.p3Provider === provider)
        && (capability === 'all' || card.dataset.p3Capabilities.includes(capability))
        && (health === 'all' || card.dataset.p3Health === health);
      card.hidden = !match;
      if (match) visible += 1;
    });
    const summary = document.getElementById('p3-model-more');
    if (summary) summary.hidden = Boolean(query || provider !== 'all' || capability !== 'all' || health !== 'all');
    const empty = document.getElementById('p3-model-empty');
    if (empty) empty.hidden = visible > 0;
  };
  modelSearch?.addEventListener('input', applyModelFilters);
  [modelProvider, modelCapability, modelHealth].forEach(control => control?.addEventListener('change', applyModelFilters));

  const renderSelectedPrompt = prompt => {
    selectedPromptId = prompt.id;
    activePromptEditorTab = 'system';
    document.querySelectorAll('[data-p3-editor-tab]').forEach(tab => tab.classList.toggle('active', tab.dataset.p3EditorTab === 'system'));
    const editor = document.querySelector('#p3-prompt-editor code'); if (editor) editor.innerHTML = editorLines(prompt.id, 'system');
    const editorPanel = document.querySelector('.p3-prompt-editor-panel');
    const title = editorPanel?.querySelector('.p3-panel-head h2'); if (title) title.textContent = prompt.name;
    const subtitle = editorPanel?.querySelector('.p3-panel-head p'); if (subtitle) subtitle.textContent = `${prompt.id} / ${prompt.environment} / ${prompt.version}`;
    const owner=document.getElementById('p3-prompt-owner'); if(owner) owner.textContent=prompt.owner;
    const deployed=document.getElementById('p3-prompt-deployed'); if(deployed) deployed.textContent=prompt.deployed;
    const quality=document.getElementById('p3-prompt-quality'); if(quality) quality.textContent=prompt.quality;
    const schema=document.getElementById('p3-prompt-schema'); if(schema) schema.textContent=prompt.schema || 'structured_output.v1';
    const lifecycle=promptLifecycle[prompt.id]||promptLifecycle['PROMPT-SUPPORT-17'];
    const comparison=document.querySelector('.p3-version-panel');
    const isProduction=prompt.environment==='Production';
    const copy=comparison?.querySelector('.p3-panel-head p'); if(copy) copy.textContent=isProduction ? 'Compare the current production prompt with its previous rollback version.' : prompt.id==='PROMPT-SUPPORT-17' ? 'Compare production v17 with candidate v18 before release.' : `Compare ${prompt.version} ${lifecycle.label} with ${lifecycle.previous} before release.`;
    const rollback=comparison?.querySelector('[data-p3-action="Rollback prompt"]'); if(rollback){ rollback.innerHTML=`${icon('undo-2')}Rollback to ${lifecycle.previous}`; rollback.style.display=isProduction?'':'none'; }
    const blocked=comparison?.querySelector('[data-prompt-promotion-blocked]'); if(blocked){ blocked.style.display=isProduction?'none':''; blocked.innerHTML=`${icon('lock-keyhole')}${prompt.id==='PROMPT-SUPPORT-17'?'Promotion blocked':'Awaiting release gate'}`; }
    const editorActions=editorPanel?.querySelector('.p3-actions'); const createCandidate=editorActions?.querySelector('[data-p3-action="Create candidate"]'); const evalLink=editorActions?.querySelector('[data-prompt-eval-link]'); if(createCandidate) createCandidate.style.display=isProduction?'':'none'; if(evalLink){ evalLink.style.display=isProduction?'none':''; evalLink.href=`./evaluations.html?prompt=${encodeURIComponent(prompt.id)}&version=${encodeURIComponent(prompt.version)}&release=${encodeURIComponent(prompt.release||'')}`; }
    const metricsNode=document.getElementById('p3-version-metrics'); if(metricsNode){ const temp=document.createElement('div'); temp.innerHTML=promptComparisonMetrics(prompt); metricsNode.replaceWith(temp.firstElementChild); }
    const diffNode=document.getElementById('p3-prompt-diff'); if(diffNode){ const temp=document.createElement('div'); temp.innerHTML=promptDiff(prompt); diffNode.replaceWith(temp.firstElementChild); }
    const stateNode=document.getElementById('intel-prompt-state'); if(stateNode) stateNode.textContent=prompt.environment==='Production' ? `${prompt.version} is Production and linked to evaluation evidence and rollback history.` : prompt.id==='PROMPT-SUPPORT-17' ? `${prompt.productionVersion || lifecycle.previous} remains Production. ${prompt.version} is a Review candidate in ${prompt.release || 'the release gate'} and is not deployed until grounding passes.` : `${prompt.version} is a ${lifecycle.label}; production is unchanged until the release gate passes.`;
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  };
  document.querySelectorAll('[data-p3-editor-tab]').forEach(tab => tab.addEventListener('click', () => {
    activePromptEditorTab = tab.dataset.p3EditorTab;
    document.querySelectorAll('[data-p3-editor-tab]').forEach(item => item.classList.toggle('active', item === tab));
    const editor = document.querySelector('#p3-prompt-editor code');
    if (editor) editor.innerHTML = editorLines(selectedPromptId, activePromptEditorTab);
  }));
  document.querySelectorAll('[data-p3-prompt]').forEach(item => item.addEventListener('click', () => {
    document.querySelectorAll('[data-p3-prompt]').forEach(prompt => prompt.classList.remove('active'));
    item.classList.add('active');
    const prompt=data.prompts.find(entry=>entry.id===item.dataset.promptId) || data.prompts[0];
    renderSelectedPrompt(prompt);
    window.showToast?.(`${item.dataset.promptId} selected`, 'pilcrow');
  }));



  drawer.querySelector('[data-p3-copy]').addEventListener('click', async () => {
    const value = drawer.querySelector('#p3-drawer-id').textContent;
    try {
      await navigator.clipboard.writeText(value);
      window.showToast?.(`${value} copied`, 'copy');
    } catch (_) {
      window.showToast?.('Copy unavailable', 'circle-alert');
    }
  });

  if (window.ApexCharts) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dark = document.documentElement.classList.contains('dark');
    const common = {
      chart: { toolbar: { show: false }, background: 'transparent', fontFamily: 'Manrope, sans-serif', animations: { enabled: !reduced } },
      dataLabels: { enabled: false },
      theme: { mode: dark ? 'dark' : 'light' },
      grid: { borderColor: 'rgba(174,187,199,.10)', strokeDashArray: 4 },
      legend: { labels: { colors: 'var(--muted)' } },
      tooltip: { theme: dark ? 'dark' : 'light' },
    };
    const scatter = document.getElementById('p3-model-scatter');
    if (scatter) new ApexCharts(scatter, {
      ...common,
      chart: { ...common.chart, type: 'scatter', height: 300, zoom: { enabled: false } },
      series: data.models.map(model => ({ name: model.name, data: [[Number(model.cost.replace('$', '')) * 1000, Number(model.quality.replace('%', ''))]] })),
      colors: ['#d7a21d', '#b99a78', '#78a9db', '#9277d4', '#d9916d'],
      markers: { size: 9, strokeWidth: 2, strokeColors: 'var(--surface-solid)', hover: { sizeOffset: 2 } },
      xaxis: { min: 4, max: 14, tickAmount: 5, decimalsInFloat: 0, forceNiceScale: false, title: { text: 'Effective cost / request', style: { color: 'var(--muted)' } }, labels: { style: { colors: 'var(--muted)' }, formatter: value => `$${(Number(value) / 1000).toFixed(3)}` } },
      yaxis: { min: 92, max: 99, tickAmount: 4, title: { text: 'Quality score', style: { color: 'var(--muted)' } }, labels: { style: { colors: 'var(--muted)' }, formatter: value => `${Number(value).toFixed(0)}%` } },
      tooltip: { ...common.tooltip, custom: ({ seriesIndex }) => { const model = data.models[seriesIndex]; return `<div class="p3-chart-tooltip"><b>${model.name}</b><span>${model.quality} quality</span><span>${model.cost} / request</span><span>${model.p95} P95</span></div>`; } },
    }).render();
    const grounding = document.getElementById('p3-grounding-chart');
    if (grounding) new ApexCharts(grounding, {
      ...common,
      chart: { ...common.chart, type: 'area', height: 300 },
      series: [{ name: 'Relevance', data: [94.8, 95.1, 95.6, 95.9, 96.1, 96.0, 96.4] }, { name: 'Citation coverage', data: [96.2, 96.5, 96.6, 96.8, 96.7, 97.0, 97.1] }],
      colors: ['#62afa8', '#e6a515'],
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 3.5, strokeWidth: 2, strokeColors: 'var(--surface-solid)', hover: { sizeOffset: 2 } },
      fill: { type: 'gradient', gradient: { opacityFrom: .14, opacityTo: .015 } },
      xaxis: { categories: ['Aug 21', '22', '23', '24', '25', '26', '27'], labels: { style: { colors: 'var(--muted)' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { min: 92, max: 100, tickAmount: 4, labels: { style: { colors: 'var(--muted)' }, formatter: value => `${Number(value).toFixed(0)}%` } },
      tooltip: { ...common.tooltip, shared: true, intersect: false, y: { formatter: value => `${Number(value).toFixed(1)}%` } },
    }).render();
  }

  window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
})();
