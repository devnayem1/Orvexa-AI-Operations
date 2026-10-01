(() => {
  'use strict';

  window.Orvexa = window.Orvexa || {};
  window.Orvexa.dashboard = {
    metrics: [
      { id: 'requests', label: 'AI Requests · 24H', value: '1.32', suffix: 'M', trend: '+12.4%', trendTone: 'good', detail: '2,842 RPM current peak', icon: 'activity', tone: 'primary', sparkline: [42,48,46,55,53,61,66,64,73,79,82,88] },
      { id: 'sessions', label: 'Concurrent AI Requests', value: '343', suffix: '', trend: '+8.1%', trendTone: 'good', detail: '96 voice · 184 support · 63 other', icon: 'radio-tower', tone: 'cyan', sparkline: [28,31,33,37,35,42,46,48,55,58,63,68] },
      { id: 'cost', label: 'AI Spend · MTD', prefix: '$', value: '10.64', suffix: 'K', trend: '-6.6%', trendTone: 'good', detail: '$1.36K under budget', icon: 'circle-dollar-sign', tone: 'amber', sparkline: [65,64,68,61,63,59,58,56,57,54,53,51] },
      { id: 'quality', label: 'Quality Score', value: '97.1', suffix: '%', trend: '+0.8%', trendTone: 'good', detail: 'Release gate healthy', icon: 'shield-check', tone: 'mint', sparkline: [91,92,93,92,94,95,95,96,96,97,97,98] },
    ],
    models: [
      { name: 'Astra Reasoner X', role: 'Primary reasoning', quality: 96.8, latency: 612, cost: 0.82, status: 'Optimal', tone: 'primary' },
      { name: 'Meridian Core X', role: 'Long-context route', quality: 95.3, latency: 728, cost: 0.91, status: 'Healthy', tone: 'cyan' },
      { name: 'Orbit Pro X', role: 'Multimodal route', quality: 92.9, latency: 544, cost: 0.64, status: 'Watch', tone: 'mint' },
      { name: 'VectorMind Reasoner V1', role: 'Cost-efficient reasoning', quality: 91.7, latency: 803, cost: 0.29, status: 'Healthy', tone: 'amber' },
    ],
    agents: [
      { name: 'Research Analyst', task: 'Market landscape synthesis', step: '7 / 10', status: 'Running', progress: 71, icon: 'search', tone: 'primary' },
      { name: 'Code Reviewer', task: 'Repository security pass', step: '3 / 8', status: 'Running', progress: 38, icon: 'code-2', tone: 'cyan' },
      { name: 'Growth Planner', task: 'Campaign budget adjustment', step: '7 / 9', status: 'Approval', progress: 78, icon: 'megaphone', tone: 'amber' },
    ],
    approvals: [
      { title: 'External campaign budget', agent: 'Growth Planner', impact: '$12,500', age: '2m', risk: 'Medium' },
      { title: 'Customer data export', agent: 'Support Agent', impact: '824 records', age: '6m', risk: 'High' },
      { title: 'Production prompt release', agent: 'Release Assistant', impact: 'v7.8', age: '11m', risk: 'Low' },
    ],
    media: {
      images: { count: 2940, change: '+18%', queue: 12 },
      video: { count: 738, change: '+9%', queue: 4 },
      voice: { count: 642, change: '+13%', queue: 3 },
    },
    knowledge: {
      documents: 2482,
      collections: 42,
      embeddings: '84.2K',
      freshness: 96.4,
      retrieval: 94.8,
      ingestionQueue: 18,
      citationCoverage: 97.1,
      retrievalP95: 183,
      staleChunks: 82,
    },
    realtime: {
      activeSessions: 18,
      p50Latency: 214,
      minutes: 12840,
      transcriptionAccuracy: 98.1,
      waveform: [18, 42, 31, 68, 54, 88, 42, 73, 59, 91, 66, 38, 82, 52, 74, 44, 63, 34, 79, 49, 86, 55, 69, 41],
    },
    quality: [
      { label: 'Grounded answers', value: 97.4, tone: 'mint' },
      { label: 'Safety pass rate', value: 99.86, tone: 'primary' },
      { label: 'Human escalation', value: 2.8, tone: 'amber' },
      { label: 'Eval regression', value: 0.3, tone: 'danger' },
    ],
    deployments: [
      { name: 'Support AI v7.8', stage: 'Production', state: 'Healthy', traffic: 100 },
      { name: 'Research Agent v4.2', stage: 'Canary', state: 'Watching', traffic: 15 },
      { name: 'Router Policy 18', stage: 'Shadow', state: 'Evaluating', traffic: 0 },
    ],
  };
})();
