(() => {
  'use strict';
  window.Orvexa = window.Orvexa || {};
  window.Orvexa.chat = {
    conversations: [
      { id: 'voice-billing', title: 'Contact Center · Billing dispute', model: 'ROUTE-VOICE-07', meta: 'Policy + RAG + CRM', time: '2m', folder: 'APP-CONTACT-002', active: true },
      { id: 'support-refund', title: 'Support AI · Refund escalation', model: 'ROUTE-QUAL-01', meta: 'Human handoff', time: '18m', folder: 'APP-SUPPORT-001' },
      { id: 'doc-invoice', title: 'Document AI · Invoice extraction', model: 'ROUTE-DOC-03', meta: 'Schema validation', time: '1h', folder: 'APP-DOC-003' },
      { id: 'growth-copy', title: 'Growth Assistant · Policy fallback', model: 'ROUTE-CREATIVE-04', meta: 'Fallback test', time: '3h', folder: 'APP-GROWTH-004' },
      { id: 'voice-latency', title: 'Voice · P95 latency stress', model: 'ROUTE-VOICE-07', meta: 'STT + model + TTS', time: 'Yesterday', folder: 'Performance' },
      { id: 'rag-policy', title: 'RAG · Billing source freshness', model: 'Retrieval test', meta: '42 test cases', time: 'Yesterday', folder: 'Quality' },
    ],
    route: [
      { id: 'request', icon: 'radio', label: 'Request', detail: 'Synthetic request · APP-CONTACT-002', state: 'complete' },
      { id: 'route-model', icon: 'route', label: 'Route', detail: 'ROUTE-VOICE-07 · Orbit Pro', state: 'complete' },
      { id: 'knowledge', icon: 'database-zap', label: 'Knowledge', detail: '3 approved sources', state: 'complete' },
      { id: 'tools', icon: 'wrench', label: 'CRM', detail: 'Read-only fixture', state: 'complete' },
      { id: 'guardrail', icon: 'shield-check', label: 'Policy', detail: 'POL-VOICE-04', state: 'complete' },
      { id: 'answer', icon: 'badge-check', label: 'Score', detail: '96.8', state: 'active' },
    ],
    sources: [
      { id: 1, title: 'Billing Authorization Holds Policy', domain: 'KB-BILLING-01', score: '98%', icon: 'book-open-check' },
      { id: 2, title: 'Refund & Credit Human Approval Policy', domain: 'POL-PAY-07', score: '97%', icon: 'shield-check' },
      { id: 3, title: 'Voice Conversation Compliance Guide', domain: 'POL-VOICE-04', score: '95%', icon: 'audio-lines' },
      { id: 4, title: 'CRM Synthetic Account Fixture', domain: 'TEST-DATA-018', score: '100%', icon: 'database' },
    ],
    trace: [
      { id: 't1', title: 'Synthetic request accepted', detail: 'APP-CONTACT-002 · ext_test_18422', metric: '8ms', icon: 'radio', state: 'done' },
      { id: 't2', title: 'Route selected', detail: 'ROUTE-VOICE-07 · shadow mode', metric: '21ms', icon: 'route', state: 'done' },
      { id: 't3', title: 'Knowledge retrieved', detail: '3 sources · relevance 96.1%', metric: '94ms', icon: 'database-zap', state: 'done' },
      { id: 't4', title: 'CRM fixture read', detail: 'Read-only synthetic billing profile', metric: '164ms', icon: 'wrench', state: 'done' },
      { id: 't5', title: 'Policy evaluated', detail: 'PII passed · write action disabled', metric: '31ms', icon: 'shield-check', state: 'done' },
      { id: 't6', title: 'Test output scored', detail: 'Grounded · handoff boundary correct', metric: '96.8', icon: 'badge-check', state: 'active' },
    ],
    models: [
      { id: 'gemini', name: 'Orbit Pro', provider: 'Orbit AI', quality: 96.8, latency: '544ms', cost: '$0.64', status: 'Current route', response: 'Correctly identifies the authorization hold, preserves the no-write boundary, and recommends human escalation only if the pending charge persists.', sample: 'The authorization hold is valid. Do not capture or void. Explain that this is not a settled charge and escalate only if it remains after the expected release window.', policy: 'No policy violations', evidence: '3 citations' },
      { id: 'gpt', name: 'Astra Reasoner', provider: 'Astra AI', quality: 96.1, latency: '612ms', cost: '$0.82', status: 'Quality candidate', response: 'Produces a slightly more detailed billing explanation with the same approved source set and no restricted action.', sample: 'This is an authorization hold, not a completed charge. No write action is required. Explain the release window and escalate only if the hold persists beyond policy.', policy: 'No policy violations', evidence: '4 citations' },
      { id: 'claude', name: 'Meridian Core', provider: 'Meridian AI', quality: 95.4, latency: '728ms', cost: '$0.91', status: 'Long-context candidate', response: 'Best narrative clarity but higher latency and cost; policy behavior remains compliant.', sample: 'The pending transaction is an authorization hold only. Do not capture or void. Tell the customer when it should release and escalate if it persists beyond that window.', policy: 'No policy violations', evidence: '3 citations' },
    ],
    tools: [
      { id: 'crm', name: 'CRM synthetic read', icon: 'database', enabled: true, risk: 'Read-only' },
      { id: 'knowledge', name: 'Billing knowledge', icon: 'book-open-check', enabled: true, risk: 'Read-only' },
      { id: 'refund', name: 'Issue refund', icon: 'badge-dollar-sign', enabled: false, risk: 'Approval' },
      { id: 'account', name: 'Change account', icon: 'user-cog', enabled: false, risk: 'Approval' },
    ],
    attachments: [
      { id: 'a1', name: 'billing-policy-v12.pdf', type: 'PDF', size: '824 KB', icon: 'file-text' },
      { id: 'a2', name: 'synthetic-call-fixture.json', type: 'JSON', size: '18 KB', icon: 'braces' },
    ],
  };
})();
