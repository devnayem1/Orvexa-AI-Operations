(() => {
  'use strict';
  window.Orvexa = window.Orvexa || {};

  window.Orvexa.controlPlane = {
    workspace: {
      id: 'TEN-001',
      name: 'Nova Intelligence',
      plan: 'Enterprise',
      environment: 'Production',
      region: 'Global',
    },
    applications: [
      {
        id: 'APP-SUPPORT-001', name: 'Support AI', type: 'Customer support assistant', environment: 'Production',
        status: 'Healthy', statusTone: 'good', requests30d: '612K', activeSessions: 184, p95: '742ms', errorRate: '0.32%', cost30d: '$3.18K',
        primaryRoute: 'ROUTE-QUAL-01', model: 'Astra Reasoner', guardrail: 'POL-SUPPORT-07', owner: 'Customer Experience',
        channels: ['Web', 'Mobile'], externalUsers: '38.4K', lastDeploy: 'v7.8 · 3h ago'
      },
      {
        id: 'APP-CONTACT-002', name: 'AI Contact Center', type: 'Voice + messaging operations', environment: 'Production',
        status: 'Healthy', statusTone: 'good', requests30d: '428K', activeSessions: 96, p95: '618ms', errorRate: '0.41%', cost30d: '$4.92K',
        primaryRoute: 'ROUTE-VOICE-07', model: 'Orbit Pro', guardrail: 'POL-VOICE-04', owner: 'Contact Operations',
        channels: ['Voice', 'Chat', 'Messaging'], externalUsers: '22.1K', lastDeploy: 'v4.2 · 1d ago'
      },
      {
        id: 'APP-DOC-003', name: 'Document Intelligence', type: 'Document extraction + Q&A', environment: 'Production',
        status: 'Healthy', statusTone: 'good', requests30d: '184K', activeSessions: 42, p95: '1.24s', errorRate: '0.28%', cost30d: '$1.46K',
        primaryRoute: 'ROUTE-DOC-03', model: 'Meridian Core', guardrail: 'POL-DOC-05', owner: 'Operations',
        channels: ['API', 'Back office'], externalUsers: '8.7K', lastDeploy: 'v3.6 · 2d ago'
      },
      {
        id: 'APP-GROWTH-004', name: 'Growth Assistant', type: 'Marketing content + analysis', environment: 'Production',
        status: 'Watch', statusTone: 'warn', requests30d: '96K', activeSessions: 21, p95: '884ms', errorRate: '1.12%', cost30d: '$1.08K',
        primaryRoute: 'ROUTE-CREATIVE-04', model: 'Astra Reasoner', guardrail: 'POL-MKT-03', owner: 'Growth',
        channels: ['Web', 'Internal'], externalUsers: '4.9K', lastDeploy: 'v2.9 · 5h ago'
      },
    ],
    liveRequests: [
      { requestId: 'REQ-8A42F1', traceId: 'TRC-8A42F1', appId: 'APP-CONTACT-002', app: 'AI Contact Center', externalUserId: 'ext_usr_18422', sessionId: 'SES-CALL-10482', channel: 'Voice', route: 'ROUTE-VOICE-07', model: 'Orbit Pro', path: 'STT → Intent → RAG → CRM → TTS', latency: '814ms', cost: '$0.0084', status: 'Streaming', statusTone: 'live', intent: 'Billing dispute' },
      { requestId: 'REQ-8A42E9', traceId: 'TRC-8A42E9', appId: 'APP-SUPPORT-001', app: 'Support AI', externalUserId: 'ext_usr_99318', sessionId: 'SES-WEB-77215', channel: 'Web', route: 'ROUTE-QUAL-01', model: 'Astra Reasoner', path: 'RAG → Account tool → Guardrail', latency: '622ms', cost: '$0.0128', status: 'Completed', statusTone: 'good', intent: 'Subscription change' },
      { requestId: 'REQ-8A42D4', traceId: 'TRC-8A42D4', appId: 'APP-DOC-003', app: 'Document Intelligence', externalUserId: 'ext_usr_51087', sessionId: 'SES-DOC-33902', channel: 'API', route: 'ROUTE-DOC-03', model: 'Meridian Core', path: 'OCR → Extract → RAG → JSON schema', latency: '1.42s', cost: '$0.0341', status: 'Completed', statusTone: 'good', intent: 'Invoice extraction' },
      { requestId: 'REQ-8A42C7', traceId: 'TRC-8A42C7', appId: 'APP-GROWTH-004', app: 'Growth Assistant', externalUserId: 'ext_usr_20411', sessionId: 'SES-WEB-77211', channel: 'Web', route: 'ROUTE-CREATIVE-04', model: 'Astra Reasoner', path: 'Prompt → Brand RAG → Policy → Provider fallback', latency: '1.18s', cost: '$0.0192', status: 'Fallback', statusTone: 'warn', intent: 'Campaign copy' },
      { requestId: 'REQ-8A42B3', traceId: 'TRC-8A42B3', appId: 'APP-CONTACT-002', app: 'AI Contact Center', externalUserId: 'ext_usr_77401', sessionId: 'SES-CHAT-10479', channel: 'Chat', route: 'ROUTE-SUPPORT-02', model: 'Astra Reasoner', path: 'Intent → RAG → Case tool', latency: '588ms', cost: '$0.0069', status: 'Human handoff', statusTone: 'warn', intent: 'Refund escalation' },
      { requestId: 'REQ-8A429C', traceId: 'TRC-8A429C', appId: 'APP-SUPPORT-001', app: 'Support AI', externalUserId: 'ext_usr_11804', sessionId: 'SES-MOB-77198', channel: 'Mobile', route: 'ROUTE-FAST-02', model: 'Orbit Pro', path: 'RAG → Response', latency: '436ms', cost: '$0.0041', status: 'Completed', statusTone: 'good', intent: 'Product question' },
      { requestId: 'REQ-8A4312', traceId: 'TRC-8A4312', appId: 'APP-SUPPORT-001', app: 'Support AI', externalUserId: 'ext_usr_99318', sessionId: 'SES-WEB-77228', channel: 'Web', route: 'ROUTE-QUAL-01', model: 'Astra Reasoner', path: 'RAG → Refund tool → Human review', latency: '703ms', cost: '$0.0146', status: 'Human review', statusTone: 'warn', intent: 'Refund override' },
      { requestId: 'REQ-8A4301', traceId: 'TRC-8A4301', appId: 'APP-SUPPORT-001', app: 'Support AI', externalUserId: 'ext_usr_11804', sessionId: 'SES-MOB-77221', channel: 'Mobile', route: 'ROUTE-QUAL-01', model: 'Astra Reasoner', path: 'RAG → Injection guard → Clean rerun', latency: '554ms', cost: '$0.0072', status: 'Guardrail retry', statusTone: 'warn', intent: 'Knowledge lookup' },
      { requestId: 'REQ-8A42F8', traceId: 'TRC-8A42F8', appId: 'APP-CONTACT-002', app: 'AI Contact Center', externalUserId: 'ext_usr_18422', sessionId: 'SES-CALL-10489', channel: 'Voice', route: 'ROUTE-VOICE-07', model: 'Orbit Pro', path: 'STT → PII redact → Intent → RAG → TTS', latency: '836ms', cost: '$0.0088', status: 'Completed', statusTone: 'good', intent: 'Payment support' },
      { requestId: 'REQ-8A42B1', traceId: 'TRC-8A42B1', appId: 'APP-DOC-003', app: 'Document Intelligence', externalUserId: 'ext_usr_51087', sessionId: 'SES-DOC-33896', channel: 'API', route: 'ROUTE-DOC-03', model: 'Meridian Core', path: 'ACL → Export tool → Human review', latency: '1.36s', cost: '$0.0287', status: 'Human review', statusTone: 'warn', intent: 'Restricted export' },
    ],
    requestAnalytics: {
      demoRecordLimit: 100,
      outcomes: [
        { label:'Completed', value:98.6, tone:'good' },
        { label:'Fallback', value:0.7, tone:'warn' },
        { label:'Human intervention', value:0.5, tone:'review' },
        { label:'Blocked / failed', value:0.2, tone:'danger' },
      ],
      routes: [
        { id:'ROUTE-VOICE-07', appId:'APP-CONTACT-002', label:'Contact center voice · multimodal', icon:'headphones', cost30d:38400, requests30d:4570000 },
        { id:'ROUTE-DOC-03', appId:'APP-DOC-003', label:'Document extraction · Meridian Core', icon:'file-scan', cost30d:31600, requests30d:927000 },
        { id:'ROUTE-QUAL-01', appId:'APP-SUPPORT-001', label:'Quality-first support reasoning', icon:'brain-circuit', cost30d:18200, requests30d:1420000 },
      ],
    },
    externalUsers: [
      { externalUserId: 'ext_usr_18422', tenantId: 'TEN-001', application: 'AI Contact Center', sessions30d: 18, requests30d: 86, tokens: '184K', cost: '$4.82', feedback: '4.8/5', lastActive: 'Now', risk: 'Normal' },
      { externalUserId: 'ext_usr_99318', tenantId: 'TEN-001', application: 'Support AI', sessions30d: 11, requests30d: 54, tokens: '112K', cost: '$2.94', feedback: '4.6/5', lastActive: '1m', risk: 'Normal' },
      { externalUserId: 'ext_usr_51087', tenantId: 'TEN-001', application: 'Document Intelligence', sessions30d: 7, requests30d: 31, tokens: '420K', cost: '$7.61', feedback: '4.9/5', lastActive: '3m', risk: 'Normal' },
      { externalUserId: 'ext_usr_77401', tenantId: 'TEN-001', application: 'AI Contact Center', sessions30d: 22, requests30d: 113, tokens: '226K', cost: '$6.12', feedback: '3.4/5', lastActive: '4m', risk: 'Review' },
      { externalUserId: 'ext_usr_20411', tenantId: 'TEN-001', application: 'Growth Assistant', sessions30d: 9, requests30d: 62, tokens: '176K', cost: '$3.88', feedback: '4.1/5', lastActive: '7m', risk: 'Normal' },
    ],
    contactCenter: {
      metrics: [
        { label: 'Live conversations', value: '96', detail: '54 AI-only · 42 assisted', tone: 'primary', icon: 'headphones' },
        { label: 'AI containment', value: '71.8%', detail: '+4.6% vs prior 30d', tone: 'mint', icon: 'bot' },
        { label: 'Human handoff', value: '18.4%', detail: '7.2% urgent escalation', tone: 'amber', icon: 'arrow-right-left' },
        { label: 'P50 voice turn', value: '384ms', detail: 'STT → model → TTS', tone: 'cyan', icon: 'audio-waveform' },
        { label: 'Summary coverage', value: '98.7%', detail: 'Post-contact summaries', tone: 'mint', icon: 'file-check-2' },
        { label: 'PII redaction', value: '99.4%', detail: 'Voice + chat transcripts', tone: 'primary', icon: 'shield-check' },
      ],
      channels: [
        { name: 'Voice', status: 'Healthy', live: 48, queued: 7, service: '92%', p50: '384ms', aiShare: '76%', icon: 'phone-call' },
        { name: 'Chat', status: 'Healthy', live: 31, queued: 4, service: '96%', p50: '612ms', aiShare: '82%', icon: 'messages-square' },
        { name: 'Messaging', status: 'Healthy', live: 14, queued: 2, service: '94%', p50: '744ms', aiShare: '68%', icon: 'message-circle-more' },
        { name: 'Email', status: 'Watch', live: 3, queued: 18, service: '88%', p50: '18s', aiShare: '54%', icon: 'mail' },
      ],
      liveContacts: [
        { id: 'CALL-10482', channel: 'Voice', queue: 'Billing', externalUser: 'ext_usr_18422', mode: 'AI Agent', intent: 'Billing dispute', sentiment: 'Frustrated', sentimentTone: 'danger', duration: '04:18', action: 'CRM lookup', state: 'Live' },
        { id: 'CHAT-10479', channel: 'Chat', queue: 'Returns', externalUser: 'ext_usr_77401', mode: 'AI → Human', intent: 'Refund escalation', sentiment: 'Negative', sentimentTone: 'warning', duration: '08:42', action: 'Handoff', state: 'Escalated' },
        { id: 'CALL-10476', channel: 'Voice', queue: 'Sales', externalUser: 'ext_usr_90118', mode: 'Human + Assist', intent: 'Plan comparison', sentiment: 'Positive', sentimentTone: 'good', duration: '06:11', action: 'Next-best action', state: 'Live' },
        { id: 'MSG-10474', channel: 'Messaging', queue: 'Support', externalUser: 'ext_usr_44271', mode: 'AI Agent', intent: 'Password recovery', sentiment: 'Neutral', sentimentTone: 'neutral', duration: '02:56', action: 'Identity check', state: 'Live' },
        { id: 'CALL-10471', channel: 'Voice', queue: 'Retention', externalUser: 'ext_usr_33718', mode: 'Human + Assist', intent: 'Cancel account', sentiment: 'At risk', sentimentTone: 'danger', duration: '09:04', action: 'Supervisor alert', state: 'Monitor' },
      ],
      pipeline: [
        { id: 'stt', label: 'Speech / message input', detail: 'Streaming transcription + language detect', metric: '126ms', state: 'Healthy', icon: 'audio-lines' },
        { id: 'intent', label: 'Intent & sentiment', detail: 'Routing, urgency and churn signal', metric: '42ms', state: 'Healthy', icon: 'scan-search' },
        { id: 'agent', label: 'AI agent runtime', detail: 'Conversation policy + response plan', metric: '188ms', state: 'Healthy', icon: 'bot' },
        { id: 'knowledge', label: 'Knowledge retrieval', detail: 'RAG + reranking + citations', metric: '94ms', state: 'Healthy', icon: 'database-zap' },
        { id: 'tools', label: 'Business tools', detail: 'CRM, orders, cases, scheduling', metric: '164ms', state: 'Healthy', icon: 'wrench' },
        { id: 'policy', label: 'Safety & compliance', detail: 'PII, payment, consent, escalation', metric: '31ms', state: 'Healthy', icon: 'shield-check' },
        { id: 'tts', label: 'Response delivery', detail: 'TTS / message response / handoff', metric: '121ms', state: 'Healthy', icon: 'radio-tower' },
      ],
      alerts: [
        { title: 'Cancellation intent spike', detail: 'Retention queue · +28% in the last 30 minutes', time: '2m', severity: 'High' },
        { title: 'Negative sentiment threshold', detail: 'CALL-10482 · supervisor review recommended', time: 'Now', severity: 'High' },
        { title: 'Email backlog above target', detail: '18 contacts waiting · AI draft assist active', time: '4m', severity: 'Medium' },
      ],
      intents: [
        { label: 'Billing & payment', value: 28, change: '+6.2%' },
        { label: 'Order / delivery', value: 21, change: '-1.4%' },
        { label: 'Account access', value: 17, change: '+2.8%' },
        { label: 'Returns / refunds', value: 14, change: '+4.1%' },
        { label: 'Plan / product questions', value: 12, change: '-0.7%' },
        { label: 'Other', value: 8, change: '-2.1%' },
      ],
      quality: [
        { label: 'Resolution quality', value: 96.1, detail: 'AI + human evaluated contacts' },
        { label: 'Policy compliance', value: 98.8, detail: 'Required phrases, consent and process' },
        { label: 'Grounded response rate', value: 97.3, detail: 'Claims backed by approved knowledge' },
        { label: 'Summary acceptance', value: 94.6, detail: 'Agent accepted without manual rewrite' },
      ]
    },
    traceExample: {
      requestId: 'REQ-8A42F1', traceId: 'TRC-8A42F1', application: 'AI Contact Center', externalUserId: 'ext_usr_18422', sessionId: 'SES-CALL-10482', intent: 'Billing dispute', total: '814ms', cost: '$0.0084',
      steps: [
        { label: 'Request accepted', detail: 'Voice stream · tenant TEN-001 · APP-CONTACT-002', duration: '8ms', status: 'done', icon: 'radio' },
        { label: 'Streaming STT', detail: 'English detected · confidence 98.4%', duration: '126ms', status: 'done', icon: 'audio-lines' },
        { label: 'Intent + sentiment', detail: 'Billing dispute · frustrated · urgency medium', duration: '42ms', status: 'done', icon: 'scan-search' },
        { label: 'Policy route', detail: 'ROUTE-VOICE-07 → Orbit Pro', duration: '21ms', status: 'done', icon: 'route' },
        { label: 'Knowledge retrieval', detail: '6 chunks · 3 sources · relevance 94.8%', duration: '94ms', status: 'done', icon: 'database-zap' },
        { label: 'CRM tool call', detail: 'Read-only billing profile lookup · customer tokenized', duration: '164ms', status: 'done', icon: 'wrench' },
        { label: 'Model response', detail: 'Grounded resolution plan generated', duration: '207ms', status: 'done', icon: 'brain-circuit' },
        { label: 'Safety + compliance', detail: 'PII redaction passed · no restricted write action', duration: '31ms', status: 'done', icon: 'shield-check' },
        { label: 'TTS delivery', detail: 'Voice response streaming to frontend', duration: '121ms', status: 'active', icon: 'audio-waveform' },
      ]
    }
  };
})();
