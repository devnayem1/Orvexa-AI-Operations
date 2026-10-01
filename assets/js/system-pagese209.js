(() => {
  'use strict';

  const main = document.querySelector('main');
  const data = window.Orvexa?.product?.system;
  const page = document.body.dataset.systemPage;
  if (!main) return;
  if (!data || !page) {
    main.dataset.pageRenderError = !data ? 'system-data-unavailable' : 'page-id-unavailable';
    return;
  }

  const storage = {
    read(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; } },
    write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} },
  };
  const persistedNotifications = storage.read('orvexa-system-notifications-v36', {});
  const persistedChannels = storage.read('orvexa-system-channels-v36', {});
  let persistedSettings = storage.read('orvexa-system-settings-v40', storage.read('orvexa-system-settings-v35', {}));
  const settingsDrafts = JSON.parse(JSON.stringify(persistedSettings || {}));
  const settingsHistory = storage.read('orvexa-system-settings-history-v40', storage.read('orvexa-system-settings-history-v35', []));
  const hashTab = location.hash.replace('#','');
  const state = {
    notifications: data.notifications.map((item) => ({ ...item, ...(persistedNotifications[item.id] || {}) })),
    channels: data.channels.map((item) => ({ ...item, ...(persistedChannels[item.id] || {}) })),
    filter: 'all', category: 'All', search: '',
    settingsTab: ['general','workspace','appearance','localization','operational','notifications','privacy'].includes(hashTab) ? hashTab : 'general', dirty: false, dirtyTabs:new Set(),
  };
  const persistNotifications = () => storage.write('orvexa-system-notifications-v36', Object.fromEntries(state.notifications.map(({ id, unread, snoozedUntil, muted }) => [id, { unread, snoozedUntil: snoozedUntil || '', muted: Boolean(muted) }])));
  const persistChannels = () => storage.write('orvexa-system-channels-v36', Object.fromEntries(state.channels.map(({ id, enabled, delivery }) => [id, { enabled, delivery }])));
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const icon = (name, cls = '') => `<i class="${cls}" data-lucide="${name}"></i>`;
  const tone = (value) => /healthy|verified|enabled|low|info|configured|active|complete/i.test(value) ? 'good' : /medium|review|pending|high|watch/i.test(value) ? 'warn' : /critical|failed|error|blocked/i.test(value) ? 'bad' : 'neutral';
  const badge = (value) => `<span class="p8-badge is-${tone(value)}">${esc(value)}</span>`;
  const button = (label, ico, kind = 'secondary', attrs = '') => `<button class="p8-btn is-${kind}" ${attrs}>${icon(ico)}<span>${esc(label)}</span></button>`;
  const head = (eyebrow, title, copy, actions = '') => `<section class="p8-head"><div><span class="p8-eyebrow">${esc(eyebrow)}</span><h1>${esc(title)}</h1></div>${actions ? `<div class="p8-actions">${actions}</div>` : ''}</section>`;
  const metric = (label, value, note, ico, accent = 'gold') => `<article class="p8-metric is-${accent}"><span>${icon(ico)}</span><div><small>${esc(label)}</small><strong>${esc(value)}</strong><p>${esc(note)}</p></div></article>`;
  const field = (label, name, value, type = 'text', helper = '', attrs = '') => `<label class="p8-field"><span>${esc(label)}</span><input name="${esc(name)}" type="${esc(type)}" value="${esc(value)}" ${attrs}/>${helper ? `<small>${esc(helper)}</small>` : ''}<em data-error-for="${esc(name)}" hidden></em></label>`;
  const select = (label, name, value, options, helper = '', attrs = '') => `<label class="p8-field"><span>${esc(label)}</span><select name="${esc(name)}" ${attrs}>${options.map((option) => `<option ${option === value ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select>${helper ? `<small>${esc(helper)}</small>` : ''}</label>`;
  const switchControl = (label, detail, enabled, id) => `<div class="p8-switch-row"><div><b>${esc(label)}</b><small>${esc(detail)}</small></div><button aria-label="Toggle ${esc(label)}" aria-pressed="${enabled}" class="p8-switch ${enabled ? 'is-on' : ''}" data-switch="${esc(id)}"><span></span></button></div>`;
  const panelHead = (title, copy, aside = '') => `<div class="p8-panel-head"><div><h2>${esc(title)}</h2><p>${esc(copy)}</p></div>${aside}</div>`;

  function renderNotifications() {
    const unread = state.notifications.filter((item) => item.unread).length;
    const assigned = state.notifications.filter((item) => item.assigned).length;
    const critical = state.notifications.filter((item) => item.severity === 'Critical').length;
    const decisionUnread = state.notifications.filter((item) => item.unread && item.decisionRequired).length;
    const assignedCategories = new Set(state.notifications.filter((item) => item.assigned).map((item) => item.category)).size;
    const enabledChannels = state.channels.filter((item) => item.enabled).length;
    return `${head('Operations inbox', 'Notifications', 'Operational events from Orvexa modules routed to the current human administrator.', button('Mark all read','check-check','secondary','data-mark-all') + button('Routing & delivery','sliders-horizontal','primary','data-open-routing'))}
      <section class="p8-metrics">${metric('Unread',String(unread),`${decisionUnread} require a decision`,'mail-warning','coral')}${metric('Assigned to me',String(assigned),`Across ${assignedCategories} event categories`,'user-check','gold')}${metric('Critical',String(critical),'Both have accountable owners','siren','coral')}${metric('Delivery channels',String(state.channels.length),`${enabledChannels} enabled / ${state.channels.length-enabledChannels} optional`,'send','mint')}</section>
      <section class="p8-notification-layout">
        <aside class="p8-panel p8-notification-rail">
          ${panelHead('Inbox views','Filter by action state.')}
          <nav aria-label="Notification filters">${[['all','inbox','All events'],['unread','mail','Unread'],['critical','shield-alert','Critical'],['assigned','user-round-check','Assigned to me']].map(([key,ico,label]) => `<button class="${state.filter === key ? 'is-active' : ''}" data-notification-filter="${key}">${icon(ico)}<span>${label}</span><b data-filter-count="${key}">${notificationCount(key)}</b></button>`).join('')}</nav>
          <div class="p8-category-list"><span>Categories</span>${['All','Incident','Approval','Cost','Quality','Security','Release','Knowledge'].map((category) => `<button class="${state.category === category ? 'is-active' : ''}" data-notification-category="${category}"><span>${category}</span><b>${category === 'All' ? state.notifications.length : state.notifications.filter((item) => item.category === category).length}</b></button>`).join('')}</div>
        </aside>
        <article class="p8-panel p8-feed-panel">
          <div class="p8-feed-toolbar"><div><h2>Operational feed</h2><p>Source event → routing → operator inbox → read state → authoritative workflow.</p></div><div class="p8-feed-tools"><button class="p8-btn is-secondary p8-mobile-delivery" data-open-delivery-panel>${icon('send')}<span>Delivery</span></button><label class="p8-search">${icon('search')}<input aria-label="Search notifications" data-notification-search placeholder="Search title, assignee, owner, reference" value="${esc(state.search)}"/></label></div></div>
          <div class="p8-notification-feed" id="p8-notification-feed"></div>
        </article>
        <aside class="p8-panel p8-channel-panel">
          ${panelHead('Delivery channels','How operational notifications reach Alex Rivera.')}
          <div class="p8-channel-list">${state.channels.map((item) => `<article data-channel-detail="${item.id}" tabindex="0" role="button" aria-label="Open ${esc(item.name)} delivery preferences"><span>${icon(item.icon)}</span><div><b>${esc(item.name)}</b><p>${esc(item.detail)}</p><small>${esc(item.delivery)}</small>${item.configureHref ? `<a href="./${item.configureHref}" data-channel-configure>Configure endpoint ${icon('arrow-up-right')}</a>` : ''}</div><button aria-label="Toggle ${esc(item.name)}" aria-pressed="${item.enabled}" class="p8-switch ${item.enabled ? 'is-on' : ''}" data-channel-toggle="${item.id}"><span></span></button></article>`).join('')}</div>
          <div class="p8-noise-note">${icon('audio-lines')}<div><b>Noise control</b><p><strong>Low-risk repeats grouped.</strong> Critical incidents and approval-required actions are never delayed.</p></div></div>
        </aside>
      </section>`;
  }

  function notificationCount(filter) {
    if (filter === 'all') return state.notifications.length;
    if (filter === 'unread') return state.notifications.filter((item) => item.unread).length;
    if (filter === 'critical') return state.notifications.filter((item) => item.severity === 'Critical').length;
    return state.notifications.filter((item) => item.assigned).length;
  }

  function notificationMatches(item) {
    const snoozed = item.snoozedUntil && Date.parse(item.snoozedUntil) > Date.now();
    const hiddenByRule = item.muted && item.severity !== 'Critical';
    const byFilter = !snoozed && !hiddenByRule && (state.filter === 'all' || (state.filter === 'unread' && item.unread) || (state.filter === 'critical' && item.severity === 'Critical') || (state.filter === 'assigned' && item.assigned));
    const byCategory = state.category === 'All' || item.category === state.category;
    const query = state.search.trim().toLowerCase();
    const bySearch = !query || [item.title,item.body,item.assignedTo,item.sourceOwner,item.ref,item.id,item.category,item.application,item.route,item.tool].join(' ').toLowerCase().includes(query);
    return byFilter && byCategory && bySearch;
  }

  function drawNotificationFeed() {
    const host = document.getElementById('p8-notification-feed');
    if (!host) return;
    const visible = state.notifications.filter(notificationMatches);
    host.innerHTML = visible.length ? visible.map((item) => `<article class="p8-notification ${item.unread ? 'is-unread' : ''}" data-notification-id="${item.id}"><button class="p8-notification-main" data-open-notification="${item.id}"><span class="p8-notification-icon is-${tone(item.severity)}">${icon(item.icon)}</span><div><header><span>${esc(item.category)}</span>${item.assigned ? `<b>Assigned: ${esc(item.assignedTo || 'Alex Rivera')}</b>` : ''}</header><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><footer><span class="p8-mono">${esc(item.id)}</span><span>${esc(item.ref)}</span>${item.application ? `<span>${esc(item.application)}</span>` : ''}<span>Source owner: ${esc(item.sourceOwner || 'Orvexa')}</span></footer></div></button><aside><time>${esc(item.time)}</time>${badge(item.severity)}${item.unread ? `<button data-mark-notification="${item.id}">Mark read</button>` : `<a href="./${sourceHref(item)}">Open source ${icon('arrow-up-right')}</a>`}</aside></article>`).join('') : `<div class="p8-empty">${icon('inbox')}<b>No notifications found</b><p>Change the filter or search to view more events.</p><button data-clear-notification-filters>Clear filters</button></div>`;
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
    bindNotificationFeed();
  }

  function renderProfile() {
    const p = data.profile;
    return `${head('Personal account', 'Profile & Account', 'Edit your administrative identity, review account evidence, and set personal interface preferences.', button('View access audit','shield-check','secondary','data-action="Access audit opened"') + button('Save changes','save','primary','form="profile-form" type="submit"'))}
      <section class="p8-profile-layout">
        <aside class="p8-profile-summary">
          <div class="p8-avatar-wrap"><span class="p8-profile-avatar" data-profile-avatar>${esc(p.firstName[0] + p.lastName[0])}</span><button aria-label="Upload profile photo" data-avatar-upload>${icon('camera')}</button></div>
          <h2 data-profile-name>${esc(p.firstName)} ${esc(p.lastName)}</h2><p>${esc(p.jobTitle)}</p><span class="p8-profile-email">${esc(p.email)}</span>
          <div class="p8-profile-tags">${badge(p.role)}${badge(p.verified)}<span>${esc(p.tenant)}</span></div>
          <dl><div><dt>Member since</dt><dd>${esc(p.memberSince)}</dd></div><div><dt>Team</dt><dd>${esc(p.team)}</dd></div><div><dt>Default tenant</dt><dd>${esc(p.tenant)}</dd></div></dl>
          <button class="p8-btn is-secondary" data-avatar-upload>${icon('image-plus')}<span>Change photo</span></button>
        </aside>
        <div class="p8-profile-main">
          <form class="p8-panel p8-profile-form" id="profile-form" novalidate>
            ${panelHead('Personal information','Used for ownership, approvals, and audit attribution.', '<span class="p8-save-state" data-save-state>Saved</span>')}
            <div class="p8-form-grid">${field('First name','firstName',p.firstName,'text','Required for human attribution.','required')}${field('Last name','lastName',p.lastName,'text','Required for human attribution.','required')}${field('Email','email',p.email,'email','Verification is required after an address change.','required')}${field('Job title','jobTitle',p.jobTitle)}${select('Team','team',p.team,['AI Platform','Security','Knowledge Systems','Service Operations','Growth Operations'])}${select('Timezone','timezone',p.timezone,['Europe/London','Asia/Dhaka','America/New_York','America/Los_Angeles','UTC'])}${select('Language','language',p.language,['English (UK)','English (US)','Bengali','Spanish','French'])}<label class="p8-field is-wide"><span>Bio</span><textarea name="bio" rows="4">${esc(p.bio)}</textarea><small>Visible to administrators reviewing ownership and decisions.</small></label></div>
          </form>
          <section class="p8-account-grid">
            <article class="p8-panel p8-account-evidence">${panelHead('Account evidence','Security state for this human administrator.')}<div><span>${icon('fingerprint')}</span><dl><dt>Multi-factor authentication</dt><dd>${esc(p.mfa)}</dd></dl>${badge('Enabled')}</div><div><span>${icon('badge-check')}</span><dl><dt>Primary email</dt><dd>${esc(p.email)}</dd></dl>${badge(p.verified)}</div><div><span>${icon('key-square')}</span><dl><dt>Last password change</dt><dd>${esc(p.passwordChanged)}</dd></dl><button data-action="Password workflow opened">Change</button></div><a href="./security-sessions.html">Open account security ${icon('arrow-up-right')}</a></article>
            <article class="p8-panel p8-preferences">${panelHead('Personal preferences','Stored for this administrator only.')}<div class="p8-preference-list">${select('Theme','prefTheme',currentTheme(),['System','Light','Dark'],'Applied immediately.','data-preference="theme"')}${select('Direction','prefDirection',document.documentElement.dir === 'rtl' ? 'Right to left' : 'Left to right',['Left to right','Right to left'],'Preview bidirectional layouts.','data-preference="direction"')}${select('Density','prefDensity',document.documentElement.dataset.density === 'compact' ? 'Compact' : 'Comfortable',['Comfortable','Compact'],'Controls data spacing.','data-preference="density"')}${switchControl('Personal notifications','Show in-app alerts assigned to you.',true,'profile-notifications')}</div></article>
          </section>
        </div>
      </section>
      <div class="p8-unsaved" data-unsaved-bar hidden><span>${icon('circle-dot')} Unsaved profile changes</span>${button('Discard','rotate-ccw','secondary','data-discard-profile')}${button('Save','save','primary','form="profile-form" type="submit"')}</div>`;
  }

  function currentTheme() {
    try {
      const saved = localStorage.getItem('orvexa-theme-v16');
      return saved ? saved[0].toUpperCase() + saved.slice(1) : 'System';
    } catch (_) { return 'System'; }
  }

  const settingsMeta = {
    general:{ label:'General', icon:'building-2', copy:'Admin-shell branding, browser identity and organization identity.' },
    workspace:{ label:'Workspace Defaults', icon:'panels-top-left', copy:'Initial workspace, environment, application and explorer context.' },
    appearance:{ label:'Appearance', icon:'palette', copy:'Guardrailed brand tokens, density, sidebar and motion preferences.' },
    localization:{ label:'Localization', icon:'languages', copy:'Timezone and display-format preferences without translation claims.' },
    operational:{ label:'Operational Defaults', icon:'sliders-horizontal', copy:'Global UI and observability defaults; domain policies stay in their owning modules.' },
    notifications:{ label:'Notifications', icon:'bell-ring', copy:'Workspace delivery defaults that personal notification preferences may inherit.' },
    privacy:{ label:'Privacy', icon:'shield-check', copy:'Administrator UI privacy preferences; governance policies remain in Data & Privacy.' },
  };

  const brandDefaults = window.Orvexa?.branding?.defaults || {
    productName:'Orvexa', subtitle:'ARTIFICIAL INTELLIGENCE OS', altText:'Orvexa home',
    browserTitle:'Orvexa — AI Production Fabric & Operations Control Plane', expandedLogo:'', compactMark:'', favicon:'',
    accent:'#d99a00', success:'#4bc98b', warning:'#d99a00', danger:'#e76f61', info:'#75a7e3', fontPreset:'Manrope', surfacePreset:'Pearl', reducedMotion:false,
  };
  const currentBrand = () => window.Orvexa?.branding?.read?.() || { ...brandDefaults };
  const settingsDefaults = () => ({
    general:{
      productName:currentBrand().productName, subtitle:currentBrand().subtitle, altText:currentBrand().altText,
      browserTitle:currentBrand().browserTitle, expandedLogo:currentBrand().expandedLogo, compactMark:currentBrand().compactMark, favicon:currentBrand().favicon,
      organization:'Nova Intelligence', workspaceDisplay:'Nova Intelligence', workspaceId:'WS-NOVA-PROD'
    },
    workspace:{ workspace:'Nova Intelligence', environment:'Production', application:'All applications', landingPage:'Dashboard', dateRange:'Last 30 days', pageSize:'25', region:'US' },
    appearance:{ accent:currentBrand().accent, success:currentBrand().success, warning:currentBrand().warning, danger:currentBrand().danger, info:currentBrand().info, surfacePreset:currentBrand().surfacePreset, fontPreset:currentBrand().fontPreset, density:document.documentElement.dataset.density==='compact'?'Compact':'Comfortable', sidebarMode:document.documentElement.dataset.sidebarMode==='full'?'Full sidebar':'Icon + hover', sidebarTone:(document.documentElement.dataset.sidebarTone||'pearl').replace(/^./,(m)=>m.toUpperCase()), 'switch:reduced-motion':Boolean(currentBrand().reducedMotion) },
    localization:{ timezone:data.settings.general.timezone || 'UTC', locale:'English (US) formatting', dateFormat:'Aug 30, 2026', timeFormat:'24 hour', numbers:'1,234.56', currency:'USD · $', weekStart:data.settings.general.weekStart || 'Monday' },
    operational:{ observabilityRange:'Last 24 hours', refreshInterval:'30 seconds', 'switch:live-streaming':true, 'switch:saved-filters':true },
    notifications:{ minimumSeverity:'Medium+', digestCadence:'Every 2 hours', quietHours:'22:00–07:00', 'switch:critical-bypass':true, 'switch:user-overrides':true, incident:'Immediate', approval:'Immediate', security:'Immediate', cost:'15 minutes', quality:'30 minutes' },
    privacy:{ 'switch:sensitive-mask':true, 'switch:local-storage':true, 'switch:diagnostics':false },
  });

  function renderSettings() {
    const allDirty=state.dirtyTabs.size>0;
    return `${head('Workspace configuration', 'Settings', 'Manage admin identity, workspace defaults, appearance, localization and operational preferences.', button('Change history','history','secondary','data-settings-history') + button('Save changes','save','primary',`data-save-settings ${allDirty?'':'disabled'}`))}
      <section class="p8-settings-hero"><div><span class="p8-mono">CFG-PLATFORM-18.0</span><h2>Production defaults with accountable inheritance.</h2><p>Branding, workspace and administrator preferences remain visible in audit evidence.</p></div><dl><div><dt>Managed defaults</dt><dd>31</dd></div><div><dt>Workspace overrides</dt><dd>7</dd></div><div><dt>Unreviewed drift</dt><dd>0</dd></div></dl></section>
      <section class="p8-settings-layout">
        <aside class="p8-settings-nav"><span>Configuration</span>${Object.entries(settingsMeta).map(([key,item]) => `<button class="${state.settingsTab === key ? 'is-active' : ''}" data-settings-tab="${key}">${icon(item.icon)}<div><b>${esc(item.label)}</b><small>${esc(item.copy)}</small></div>${icon('chevron-right')}</button>`).join('')}<div class="p8-settings-note">${icon('shield-check')}<p>Production-impacting changes create audit evidence. Runtime, billing, privacy-policy and approval controls stay in their authoritative modules.</p></div></aside>
        <article class="p8-panel p8-settings-panel" id="p8-settings-panel"></article>
      </section>
      <div class="p8-unsaved" data-settings-unsaved ${allDirty?'':'hidden'}><span>${icon('circle-dot')} <b data-settings-dirty-count>${state.dirtyTabs.size}</b> section${state.dirtyTabs.size===1?'':'s'} with unsaved changes</span>${button('Discard all','rotate-ccw','secondary','data-discard-settings')}${button('Save all','save','primary','data-save-settings')}</div>`;
  }

  function currentLanguageLabel() {
    try { const code=localStorage.getItem('orvexa-language-v14')||document.documentElement.lang||'en'; return ({en:'English',fr:'Français',de:'Deutsch',it:'Italiano',ar:'العربية'})[code]||'English'; } catch (_) { return 'English'; }
  }
  function sourceHref(item) {
    if (item.category === 'Incident') return `alerts-incidents.html?incident=${encodeURIComponent(item.ref)}`;
    if (item.category === 'Approval') return `approval-center.html?review=${encodeURIComponent(item.ref)}`;
    if (item.category === 'Release') return `experiments-releases.html?release=${encodeURIComponent(item.ref)}`;
    if (item.category === 'Cost') return `cost-budgets.html?anomaly=${encodeURIComponent(item.ref)}`;
    if (item.category === 'Knowledge') return `sources-ingestion.html?source=${encodeURIComponent(item.ref)}`;
    if (item.ref === 'SEC-CRM-04') return `secrets-credentials.html?secret=${encodeURIComponent(item.ref)}`;
    if (item.category === 'Security') return `safety-redteam.html?campaign=${encodeURIComponent(item.ref)}`;
    if (item.category === 'Quality') return `retrieval-grounding.html?policy=${encodeURIComponent(item.ref)}`;
    return 'notification-center.html';
  }
  function sourceActionLabel(item) {
    if (item.category === 'Incident') return 'Open incident';
    if (item.category === 'Approval') return 'Open Approval Center';
    if (item.category === 'Release') return 'Open release';
    if (item.category === 'Cost') return 'Inspect anomaly';
    if (item.category === 'Knowledge') return 'Open source';
    if (item.ref === 'SEC-CRM-04') return 'Open credential';
    if (item.category === 'Security') return 'Open campaign';
    if (item.category === 'Quality') return 'Open retrieval policy';
    return 'Open source event';
  }

  function assetPreview(kind, value) {
    if (value) return `<img src="${value}" alt=""/>`;
    if (kind==='expandedLogo') return `<div class="p8-brand-lockup-fallback"><span class="p8-brand-mark-fallback">${icon('sparkles')}</span><span><b>Orvexa</b><small>ARTIFICIAL INTELLIGENCE OS</small></span></div>`;
    if (kind==='compactMark') return `<span class="p8-brand-mark-fallback">${icon('sparkles')}</span>`;
    return `<div class="p8-favicon-fallback">${icon('sparkles')}</div>`;
  }
  function assetControl(kind,label,copy,accept,value) {
    const limits=kind==='favicon'?'PNG / SVG / ICO · max 512 KB':'PNG / SVG / WebP · max 1.5 MB';
    return `<article class="p8-brand-asset" data-brand-asset="${kind}"><div class="p8-brand-asset-preview" data-brand-preview="${kind}">${assetPreview(kind,value)}</div><div class="p8-brand-asset-copy"><b>${esc(label)}</b><p>${esc(copy)}</p><small>${limits}</small></div><input type="file" accept="${accept}" data-brand-file="${kind}" hidden/><input type="hidden" name="${kind}" value="${esc(value||'')}" data-brand-value="${kind}"/><div class="p8-brand-asset-actions"><button type="button" class="p8-btn is-secondary" data-brand-choose="${kind}">${icon('image-up')}<span>Replace</span></button><button type="button" class="p8-btn is-secondary" data-brand-remove="${kind}">${icon('trash-2')}<span>Remove</span></button><button type="button" class="p8-btn is-ghost" data-brand-reset="${kind}">${icon('rotate-ccw')}<span>Reset</span></button></div></article>`;
  }
  function brandingPreviewMarkup(brand) {
    const expanded=brand.expandedLogo?`<img data-live-expanded-logo src="${brand.expandedLogo}" alt=""/>`:`<div class="p8-live-default-lockup"><span>${icon('sparkles')}</span><span><b data-live-product-name>${esc(brand.productName)}</b><small data-live-subtitle>${esc(brand.subtitle)}</small></span></div>`;
    const compact=brand.compactMark?`<img data-live-compact-mark src="${brand.compactMark}" alt=""/>`:`<span class="p8-live-compact-default">${icon('sparkles')}</span>`;
    const favicon=brand.favicon?`<img data-live-favicon src="${brand.favicon}" alt=""/>`:`<span data-live-favicon-fallback>${icon('sparkles')}</span>`;
    return `<aside class="p8-brand-live"><div class="p8-settings-subhead"><span>Live branding preview</span><p>Preview only until this section is saved.</p></div><div class="p8-preview-sidebar"><div class="p8-preview-expanded">${expanded}</div><div class="p8-preview-compact">${compact}</div></div><div class="p8-browser-preview"><span class="p8-browser-dot"></span><span class="p8-browser-favicon">${favicon}</span><b data-live-browser-title>${esc(brand.browserTitle)}</b></div><div class="p8-preview-note">${icon('info')}<span>Expanded logo is used when the sidebar is open. Compact mark is used on the icon rail.</span></div></aside>`;
  }
  function settingsSectionHead(title,copy,link='') { return `<div class="p8-settings-subhead"><div><h3>${esc(title)}</h3><p>${esc(copy)}</p></div>${link||''}</div>`; }
  function switchCard(label,detail,enabled,id) { return `<div class="p8-settings-switch-card">${switchControl(label,detail,enabled,id)}</div>`; }

  function settingsPanel(tab) {
    const meta = settingsMeta[tab];
    const defs=settingsDefaults();
    const saved={...defs[tab],...(settingsDrafts[tab]||{})};
    let body = '';
    if (tab === 'general') {
      const brand={...currentBrand(),...saved};
      body = `<div class="p8-settings-section p8-brand-section">${settingsSectionHead('Brand Identity','Customize the Orvexa admin shell without editing source files.')}<div class="p8-brand-layout"><div class="p8-brand-controls"><div class="p8-brand-assets">${assetControl('expandedLogo','Expanded sidebar logo','Full lockup shown when navigation is expanded.','.png,.svg,.webp,image/png,image/svg+xml,image/webp',brand.expandedLogo)}${assetControl('compactMark','Compact brand mark','Square mark used by the collapsed icon rail.','.png,.svg,.webp,image/png,image/svg+xml,image/webp',brand.compactMark)}</div><div class="p8-form-grid p8-form-grid-contained">${field('Product display name','productName',brand.productName,'text','Used in the default text lockup.','maxlength="42" required')}${field('Product subtitle / tagline','subtitle',brand.subtitle,'text','Shown beneath the product name when no custom expanded logo is supplied.','maxlength="72" required')}${field('Logo alt text','altText',brand.altText,'text','Accessible label for the admin brand link.','maxlength="80" required')}</div></div>${brandingPreviewMarkup(brand)}</div></div>
      <div class="p8-settings-section">${settingsSectionHead('Browser Identity','Control the browser tab identity for the static demo.')}<div class="p8-browser-settings"><div class="p8-form-grid p8-form-grid-contained">${field('Browser / page title','browserTitle',brand.browserTitle,'text','Applied through the shared settings bootstrap on every admin page.','maxlength="120" required')}</div>${assetControl('favicon','Favicon','Browser-tab icon with instant preview.','.png,.svg,.ico,image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon',brand.favicon)}</div></div>
      <div class="p8-settings-section">${settingsSectionHead('Organization Identity','Human-readable organization/workspace identity with a stable operational key.')}<div class="p8-form-grid p8-form-grid-contained">${field('Organization display name','organization',saved.organization,'text','Shown across administrative ownership and audit surfaces.','required')}${field('Workspace display name','workspaceDisplay',saved.workspaceDisplay,'text','Human-readable default workspace name.','required')}${field('Workspace identifier','workspaceId',saved.workspaceId,'text','Stable operational reference; edit in Organizations & Workspaces.','readonly')}</div></div>
      <div class="p8-settings-section">${settingsSectionHead('Configuration Scope','General settings provide platform defaults; governed domain controls remain in their owning modules.')}<div class="p8-scope-rail"><span>${icon('layers-3')}<b>Platform default</b><small>Inherited unless a workspace/application preference explicitly overrides it.</small></span><a href="./workspaces-tenants.html">Open workspace governance ${icon('arrow-up-right')}</a></div></div>`;
    }
    if (tab === 'workspace') body = `<div class="p8-settings-section">${settingsSectionHead('Workspace Defaults','Initial admin context only; these values do not change runtime policy.')}<div class="p8-form-grid p8-form-grid-contained">${select('Default workspace','workspace',saved.workspace,['Nova Intelligence','Northstar Services','Helio Commerce','Atlas Support Group'],'Used when an administrator opens Orvexa.')}${select('Default environment','environment',saved.environment,['Production','Staging','Development'],'Initial environment context.')}${select('Default application','application',saved.application,['All applications','Support AI','AI Contact Center','Document Intelligence','Growth Assistant'],'Initial application filter.')}${select('Default landing page','landingPage',saved.landingPage,['Dashboard','Live Operations','Applications','Notifications'],'Where the admin lands after sign-in.')}${select('Default date range','dateRange',saved.dateRange,['Last 24 hours','Last 7 days','Last 30 days','Last 90 days'],'Applied to explorers unless a saved view overrides it.')}${select('Default table page size','pageSize',String(saved.pageSize),['10','25','50','100'],'Used by paginated demo tables.')}${select('Default processing / region context','region',saved.region,['US','EU','APAC','Global'],'Initial region filter only.')}</div></div>`;
    if (tab === 'appearance') body = `<div class="p8-settings-section">${settingsSectionHead('Brand & semantic tokens','Guardrailed tokens keep tables, statuses and application identities readable.')}<div class="p8-color-grid">${[['Brand accent','accent',saved.accent],['Success','success',saved.success],['Warning','warning',saved.warning],['Danger','danger',saved.danger],['Info','info',saved.info]].map(([label,name,value])=>`<label class="p8-color-field"><span>${label}</span><input type="color" name="${name}" value="${value}"/><code>${value}</code></label>`).join('')}</div></div><div class="p8-settings-section">${settingsSectionHead('Interface presentation','Constrained presets preserve the premium visual system.')}<div class="p8-form-grid p8-form-grid-contained">${select('Canvas / surface preset','surfacePreset',saved.surfacePreset,['Pearl','Neutral','Soft contrast'])}${select('Font family preset','fontPreset',saved.fontPreset,['Manrope','System Sans'])}${select('UI density','density',saved.density,['Comfortable','Compact'],'Controls data spacing.','data-setting-preference="density"')}${select('Sidebar default','sidebarMode',saved.sidebarMode,['Icon + hover','Full sidebar'],'Matches the layout control.','data-setting-preference="sidebar"')}${select('Sidebar tone','sidebarTone',saved.sidebarTone,['Pearl','Warm','Dark'],'Changes navigation surface only.','data-setting-preference="sidebarTone"')}<div class="p8-field is-wide">${switchControl('Reduced motion','Minimize transitions and motion while preserving all controls.',Boolean(saved['switch:reduced-motion']),'reduced-motion')}</div></div></div>`;
    if (tab === 'localization') body = `<div class="p8-settings-section">${settingsSectionHead('Display formatting','Formatting preferences only; complete translated page content is not bundled.')}<div class="p8-form-grid p8-form-grid-contained">${select('Platform timezone','timezone',saved.timezone,['UTC','Europe/London','Asia/Dhaka','America/New_York'],'Default evidence timezone.')}${select('Display locale / formatting','locale',saved.locale,['English (US) formatting','English (UK) formatting','German formatting','French formatting','Arabic formatting'],'Changes formatting metadata; it does not claim a bundled language pack.')}${select('Date format','dateFormat',saved.dateFormat,['Aug 30, 2026','30 Aug 2026','2026-08-30'])}${select('Time format','timeFormat',saved.timeFormat,['24 hour','12 hour'])}${select('Number separator','numbers',saved.numbers,['1,234.56','1.234,56','1 234,56'])}${select('Currency display','currency',saved.currency,['USD · $','EUR · €','GBP · £','BDT · ৳','No currency symbol'])}${select('Week starts on','weekStart',saved.weekStart,['Monday','Sunday'])}</div></div>`;
    if (tab === 'operational') body = `<div class="p8-settings-section">${settingsSectionHead('Admin experience defaults','Only global explorer/UI behavior lives here. Gateway, approval, budget and privacy policies remain authoritative elsewhere.')}<div class="p8-form-grid p8-form-grid-contained">${select('Default observability range','observabilityRange',saved.observabilityRange,['Last 15 minutes','Last hour','Last 24 hours','Last 7 days'])}${select('Refresh interval','refreshInterval',saved.refreshInterval,['15 seconds','30 seconds','1 minute','5 minutes','Manual'])}<div class="p8-field is-wide">${switchControl('Live streams auto-start','Start supported operational streams when their page opens.',Boolean(saved['switch:live-streaming']),'live-streaming')}</div><div class="p8-field is-wide">${switchControl('Persist saved filters','Remember local demo filters between page visits.',Boolean(saved['switch:saved-filters']),'saved-filters')}</div></div><div class="p8-authority-links"><a href="./ai-gateway.html">Gateway routing ${icon('arrow-up-right')}</a><a href="./approval-center.html">Approval policies ${icon('arrow-up-right')}</a><a href="./cost-budgets.html">Budget controls ${icon('arrow-up-right')}</a><a href="./data-privacy.html">Data & Privacy ${icon('arrow-up-right')}</a></div></div>`;
    if (tab === 'notifications') body = `<div class="p8-settings-section">${settingsSectionHead('Workspace notification defaults','Inherited defaults for operators; personal delivery remains in Notifications.','<a class="p8-inline-link" href="./notification-center.html">Open personal inbox →</a>')}<div class="p8-form-grid p8-form-grid-contained">${select('Default minimum severity','minimumSeverity',saved.minimumSeverity,['Low+','Medium+','High+','Critical only'])}${select('Digest cadence','digestCadence',saved.digestCadence,['Immediate only','Every 2 hours','Every 6 hours','Daily'])}${field('Quiet hours','quietHours',saved.quietHours,'text','Critical bypass may ignore this window.')}<div class="p8-field is-wide">${switchControl('Critical bypass','Critical incidents and approval-required actions remain immediate.',Boolean(saved['switch:critical-bypass']),'critical-bypass')}</div><div class="p8-field is-wide">${switchControl('Allow personal overrides','Administrators may customize their own delivery preferences.',Boolean(saved['switch:user-overrides']),'user-overrides')}</div></div><div class="p8-settings-routing-table"><div class="p8-settings-routing-head"><span>Event type</span><span>Default cadence</span></div>${[['Incident','incident'],['Approval','approval'],['Security','security'],['Cost','cost'],['Quality','quality']].map(([label,key])=>`<label><b>${label}</b><select name="${key}">${['Immediate','15 minutes','30 minutes','Every 2 hours','Daily digest','Disabled'].map(o=>`<option ${o===saved[key]?'selected':''}>${o}</option>`).join('')}</select></label>`).join('')}</div></div>`;
    if (tab === 'privacy') body = `<div class="p8-settings-section">${settingsSectionHead('Administrator UI privacy','Interface-only privacy preferences. Retention, redaction, residency and consent remain in Data & Privacy.','<a class="p8-inline-link" href="./data-privacy.html">Open Data & Privacy →</a>')}<div class="p8-form-grid p8-form-grid-contained"><div class="p8-field is-wide">${switchControl('Mask sensitive references','Mask sensitive identifiers in UI surfaces where a full value is not required.',Boolean(saved['switch:sensitive-mask']),'sensitive-mask')}</div><div class="p8-field is-wide">${switchControl('Store demo preferences locally','Use localStorage for branding, layout and UI preference persistence.',Boolean(saved['switch:local-storage']),'local-storage')}</div><div class="p8-field is-wide">${switchControl('Anonymous diagnostics telemetry','Allow non-content interface diagnostics in this static demo.',Boolean(saved['switch:diagnostics']),'diagnostics')}</div></div><div class="p8-privacy-boundary">${icon('shield-check')}<div><b>Governance boundary</b><p>Retention, prompt logging, redaction, regional processing and data-rights workflows are intentionally not duplicated here.</p></div></div></div>`;
    return `<form data-settings-form="${tab}" novalidate>${panelHead(meta.label,meta.copy,`<span class="p8-save-state ${state.dirtyTabs.has(tab)?'is-dirty':''}" data-settings-state>${state.dirtyTabs.has(tab)?'Unsaved':'Saved'}</span>`)}<div class="p8-settings-body">${body}</div><footer><div><b>Scope</b><p>${tab==='general'?'Admin shell / organization identity':tab==='notifications'?'Workspace default / personal override allowed':tab==='privacy'?'Administrator UI preference only':'Platform default / workspace preference allowed'}</p></div><div class="p8-settings-footer-actions">${button('Reset section','rotate-ccw','secondary','type="button" data-reset-settings-section')}${button('Save section','save','primary','type="submit"')}</div></footer></form>`;
  }

  function retentionOptions(key, current) {
    const map = { requestMetadata:['30 days','60 days','90 days','180 days'], traces:['7 days','14 days','30 days','60 days'], audit:['180 days','365 days','730 days'], evaluations:['90 days','180 days','365 days'], promptBodies:['Disabled','Sampled 1%','Sampled 5%','Sampled 10%'] };
    return map[key].includes(current) ? map[key] : [current,...map[key]];
  }

  const renderers = { 'notification-center':renderNotifications, 'profile-account':renderProfile, 'settings':renderSettings };

  function ensureDrawer() {
    if (document.getElementById('p8-drawer')) return;
    document.body.insertAdjacentHTML('beforeend', `<div class="p8-drawer-backdrop" id="p8-drawer-backdrop" hidden></div><aside aria-hidden="true" aria-label="Inspector" class="p8-drawer" id="p8-drawer"><header><div><span class="p8-eyebrow">System inspector</span><h2 id="p8-drawer-title">Inspector</h2></div><button aria-label="Close inspector" class="p8-icon-btn" data-close-drawer>${icon('x')}</button></header><div class="p8-drawer-body" id="p8-drawer-body"></div></aside>`);
  }

  function openDrawer(title, body) {
    ensureDrawer();
    const drawer = document.getElementById('p8-drawer');
    document.getElementById('p8-drawer-title').textContent = title;
    document.getElementById('p8-drawer-body').innerHTML = body;
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden','false');
    document.getElementById('p8-drawer-backdrop').hidden = false;
    requestAnimationFrame(() => drawer.querySelector('button, input, select')?.focus());
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  }

  function closeDrawer() {
    const drawer = document.getElementById('p8-drawer');
    if (!drawer) return;
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden','true');
    document.getElementById('p8-drawer-backdrop').hidden = true;
  }

  function toast(message, ico = 'check-circle-2') {
    const region = document.getElementById('toast-region'); if (!region) return;
    const item = document.createElement('div'); item.className = 'p8-toast'; item.innerHTML = `${icon(ico)}<span>${esc(message)}</span>`; region.appendChild(item);
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } }); setTimeout(() => item.remove(), 2800);
  }

  function notificationDetails(item) {
    const facts = [
      ['Notification', item.id], ['Category', item.category], ['Severity', item.severity], ['Received', item.time],
      ['Assigned notification', item.assigned ? (item.assignedTo || 'Alex Rivera') : 'Not assigned'], ['Source type', item.sourceType || item.category],
      ['Source', item.ref], ['Source owner', item.sourceOwner || 'Orvexa'], ['Application', item.application], ['Route', item.route],
      ['Request', item.request], ['Tool', item.tool], ['Amount', item.amount], ['Provider', item.provider],
      ['Delivery', (item.delivery || ['In-app']).join(' · ')], ['Read state', item.unread ? 'Unread' : 'Read'],
    ].filter(([,value]) => value);
    return `<div class="p8-drawer-status">${badge(item.severity)}${item.assigned ? badge(`Assigned: ${item.assignedTo || 'Alex Rivera'}`) : badge('Source-routed')}</div><p class="p8-drawer-copy">${esc(item.body)}</p><dl class="p8-detail-list">${facts.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><div class="p8-drawer-actions is-wrap">${item.unread ? button('Mark read','check','secondary',`data-mark-drawer-notification="${item.id}"`) : ''}${button('Copy reference','copy','secondary',`data-copy="${item.ref}"`)}${button('Snooze 1 hour','clock-3','secondary',`data-snooze-notification="${item.id}"`)}<a class="p8-btn is-primary" href="./${sourceHref(item)}">${icon('arrow-up-right')}<span>${esc(sourceActionLabel(item))}</span></a></div>`;
  }

  const routingRows = [
    ['Incident','Medium+','On','Critical','High+'],['Approval','All','On','High','High'],['Security','Medium+','On','High+','Critical'],
    ['Cost','Watch+','On','Off','Critical'],['Quality','Review+','On','Off','Off'],['Release','Review+','On','Off','Off'],['Knowledge','Watch+','On','Digest','Off'],
  ];
  function routingDeliveryMarkup() {
    return `<div class="p8-routing-account">${icon('user-round')}<div><b>Alex Rivera · personal routing</b><p>Orvexa source modules own the event; this matrix controls delivery to the current administrator.</p></div></div><div class="p8-routing-table-wrap"><table class="p8-routing-table"><thead><tr><th>Event type</th><th>Minimum severity</th><th>In-app</th><th>Email</th><th>Team chat</th></tr></thead><tbody>${routingRows.map((row)=>`<tr>${row.map((value,index)=>`<${index?'td':'th'}>${esc(value)}</${index?'td':'th'}>`).join('')}</tr>`).join('')}</tbody></table></div><div class="p8-routing-foot"><p>Critical incidents and approval-required actions bypass grouping and remain immediate.</p><a class="p8-btn is-primary" href="./settings.html#notifications">${icon('settings-2')}<span>Open notification settings</span></a></div>`;
  }
  function channelPreferenceMarkup(item) {
    const config = item.configureHref ? `<a class="p8-btn is-secondary" href="./${item.configureHref}">${icon('plug-zap')}<span>Configure endpoint</span></a>` : item.id==='CH-EMAIL-02' ? `<a class="p8-btn is-secondary" href="./profile-account.html">${icon('user-round')}<span>Open account email</span></a>` : '';
    return `<div class="p8-channel-preference-hero"><span>${icon(item.icon)}</span><div><small>Alex Rivera · personal delivery</small><h3>${esc(item.name)} delivery</h3><p>${esc(item.detail)}</p></div>${badge(item.enabled?'Enabled':'Optional')}</div><dl class="p8-detail-list"><div><dt>Minimum severity</dt><dd>${esc(item.severity || 'Configured events')}</dd></div><div><dt>Cadence</dt><dd>${esc(item.delivery)}</dd></div><div><dt>Digest</dt><dd>${esc(item.digest || 'None')}</dd></div><div><dt>Quiet hours</dt><dd>${esc(item.quietHours || 'Critical bypass')}</dd></div><div><dt>Ownership</dt><dd>${item.id==='CH-WEBHOOK-04'?'Endpoint configuration stays in Integrations & Webhooks.':'Delivery preference only; source workflow remains authoritative.'}</dd></div></dl><div class="p8-drawer-actions">${config}${button(item.enabled?'Disable channel':'Enable channel',item.enabled?'bell-off':'bell-ring','primary',`data-drawer-channel-toggle="${item.id}"`)}</div>`;
  }

  function bindNotificationFeed() {
    document.querySelectorAll('[data-open-notification]').forEach((el) => el.addEventListener('click', () => { const item = state.notifications.find((n) => n.id === el.dataset.openNotification); openDrawer(item.title,notificationDetails(item)); }));
    document.querySelectorAll('[data-mark-notification]').forEach((el) => el.addEventListener('click', () => {
      const item = state.notifications.find((n) => n.id === el.dataset.markNotification);
      if (item.unread) { item.unread = false; persistNotifications(); toast(`${item.id} marked read`); render(); }
      else openDrawer(item.title,notificationDetails(item));
    }));
    document.querySelector('[data-clear-notification-filters]')?.addEventListener('click', () => { state.filter='all'; state.category='All'; state.search=''; render(); });
  }

  function updateNotificationCounts() {
    document.querySelectorAll('[data-filter-count]').forEach((el) => { el.textContent = notificationCount(el.dataset.filterCount); });
  }

  function bindNotifications() {
    document.querySelectorAll('[data-notification-filter]').forEach((el) => el.addEventListener('click', () => { state.filter=el.dataset.notificationFilter; document.querySelectorAll('[data-notification-filter]').forEach((b)=>b.classList.toggle('is-active',b===el)); drawNotificationFeed(); }));
    document.querySelectorAll('[data-notification-category]').forEach((el) => el.addEventListener('click', () => { state.category=el.dataset.notificationCategory; document.querySelectorAll('[data-notification-category]').forEach((b)=>b.classList.toggle('is-active',b===el)); drawNotificationFeed(); }));
    document.querySelector('[data-notification-search]')?.addEventListener('input',(event)=>{state.search=event.target.value;drawNotificationFeed();});
    document.querySelector('[data-mark-all]')?.addEventListener('click',()=>{state.notifications.forEach((item)=>{item.unread=false;});persistNotifications();toast('All notifications marked read');render();});
    document.querySelector('[data-open-routing]')?.addEventListener('click',()=>openDrawer('Routing & delivery',routingDeliveryMarkup()));
    document.querySelector('[data-open-delivery-panel]')?.addEventListener('click',()=>openDrawer('Delivery channels',`<div class="p8-routing-summary">${state.channels.map((item)=>`<button class="p8-routing-channel" data-open-channel-preference="${item.id}"><span>${icon(item.icon)}</span><div><b>${esc(item.name)}</b><p>${esc(item.detail)}</p></div>${badge(item.enabled?'Enabled':'Optional')}</button>`).join('')}</div>`));
    document.querySelectorAll('[data-channel-toggle]').forEach((el)=>el.addEventListener('click',(event)=>{event.stopPropagation();const item=state.channels.find((channel)=>channel.id===el.dataset.channelToggle);item.enabled=!item.enabled;el.classList.toggle('is-on',item.enabled);el.setAttribute('aria-pressed',String(item.enabled));persistChannels();toast(`${item.name} ${item.enabled?'enabled':'disabled'}`,item.enabled?'bell-ring':'bell-off');}));
    document.querySelectorAll('[data-channel-detail]').forEach((el)=>{const open=()=>{const item=state.channels.find((channel)=>channel.id===el.dataset.channelDetail);if(item)openDrawer(`${item.name} delivery`,channelPreferenceMarkup(item));};el.addEventListener('click',(event)=>{if(event.target.closest('[data-channel-toggle],[data-channel-configure]'))return;open();});el.addEventListener('keydown',(event)=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('button,a')){event.preventDefault();open();}});});
    drawNotificationFeed();
  }

  function markProfileDirty() {
    state.dirty = true; const bar=document.querySelector('[data-unsaved-bar]'); if(bar) bar.hidden=false; const statusEl=document.querySelector('[data-save-state]'); if(statusEl){statusEl.textContent='Unsaved';statusEl.classList.add('is-dirty');}
  }

  function bindProfile() {
    const form=document.getElementById('profile-form');
    form?.querySelectorAll('input, select, textarea').forEach((el)=>el.addEventListener('input',markProfileDirty));
    form?.addEventListener('submit',(event)=>{event.preventDefault();let valid=true;form.querySelectorAll('[required]').forEach((input)=>{const error=form.querySelector(`[data-error-for="${input.name}"]`);const emailInvalid=input.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);const invalid=!input.value.trim()||emailInvalid;input.classList.toggle('is-error',invalid);if(error){error.hidden=!invalid;error.textContent=emailInvalid?'Enter a valid email address.':'This field is required.';}if(invalid)valid=false;});if(!valid){form.querySelector('.is-error')?.focus();return;}const values=new FormData(form);document.querySelector('[data-profile-name]').textContent=`${values.get('firstName')} ${values.get('lastName')}`;state.dirty=false;document.querySelector('[data-unsaved-bar]').hidden=true;const statusEl=document.querySelector('[data-save-state]');statusEl.textContent='Saved';statusEl.classList.remove('is-dirty');toast('Profile changes saved');});
    document.querySelectorAll('[data-avatar-upload]').forEach((el)=>el.addEventListener('click',()=>openDrawer('Profile photo',`<div class="p8-upload-zone" tabindex="0">${icon('image-up')}<b>Choose a profile photo</b><p>JPG or PNG / up to 4 MB / square images work best</p>${button('Choose file','folder-open','primary','data-action="File picker opened"')}</div>`)));
    document.querySelector('[data-discard-profile]')?.addEventListener('click',()=>{render();toast('Profile changes discarded','rotate-ccw');});
    bindPreferences('[data-preference]');
    document.querySelector('[data-switch="profile-notifications"]')?.addEventListener('click',(event)=>{const el=event.currentTarget;el.classList.toggle('is-on');el.setAttribute('aria-pressed',String(el.classList.contains('is-on')));markProfileDirty();});
  }

  function bindPreferences(selector) {
    document.querySelectorAll(selector).forEach((el)=>el.addEventListener('change',()=>{const kind=el.dataset.preference||el.dataset.settingPreference;applyPreference(kind,el.value);markProfileDirty();}));
  }

  function applyPreference(kind,value) {
    try {
      if(kind==='theme'){if(value==='System'){localStorage.removeItem('orvexa-theme-v16');document.documentElement.classList.toggle('dark',window.matchMedia?.('(prefers-color-scheme: dark)').matches);}else{const dark=value==='Dark';document.documentElement.classList.toggle('dark',dark);localStorage.setItem('orvexa-theme-v16',dark?'dark':'light');}document.dispatchEvent(new CustomEvent('orvexa:themechange'));}
      if(kind==='direction'){const rtl=value==='Right to left';document.documentElement.dir=rtl?'rtl':'ltr';localStorage.setItem('orvexa-direction-v16',rtl?'rtl':'ltr');}
      if(kind==='density'){const density=value==='Compact'?'compact':'comfortable';document.documentElement.dataset.density=density;localStorage.setItem('orvexa-density-v16',density);}
      if(kind==='sidebar'){const mode=value==='Full sidebar'?'full':'icon';document.documentElement.dataset.sidebarMode=mode;localStorage.setItem('orvexa-sidebar-mode',mode);}
      if(kind==='sidebarTone'){const tone=value.toLowerCase();document.documentElement.dataset.sidebarTone=tone;localStorage.setItem('orvexa-sidebar-tone',tone);}
      if(kind==='language'){const codes={English:'en','Français':'fr','Deutsch':'de','Italiano':'it','العربية':'ar'};const code=codes[value]||'en';const rtl=code==='ar';document.documentElement.lang=code;document.documentElement.dir=rtl?'rtl':'ltr';localStorage.setItem('orvexa-language-v14',code);localStorage.setItem('orvexa-direction-v16',rtl?'rtl':'ltr');const flag=document.querySelector('#language-flag img');if(flag){const base=(document.body.dataset.basePath||'..').replace(/\/$/,'');flag.src=`${base}/assets/images/flags/${code==='en'?'us':code==='ar'?'sa':code}.svg`;flag.alt=`${value} flag`;}document.querySelectorAll('[data-language-option]').forEach((button)=>{const active=button.dataset.languageOption===code;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});document.dispatchEvent(new CustomEvent('orvexa:directionchange',{detail:{direction:rtl?'rtl':'ltr'}}));}
    } catch (_) {}
  }

  function serializeSettingsForm(form) {
    const values=Object.fromEntries(new FormData(form).entries());
    form.querySelectorAll('[data-switch]').forEach((el)=>{values[`switch:${el.dataset.switch}`]=el.classList.contains('is-on');});
    return values;
  }
  function applySavedSettings(form,tab) {
    const saved={...settingsDefaults()[tab],...(settingsDrafts[tab]||{})};
    Object.entries(saved).forEach(([name,value])=>{if(name.startsWith('switch:')){const el=form.querySelector(`[data-switch="${CSS.escape(name.slice(7))}"]`);if(el){el.classList.toggle('is-on',Boolean(value));el.setAttribute('aria-pressed',String(Boolean(value)));}return;}const el=form.elements.namedItem(name);if(el&&typeof value==='string')el.value=value;});
  }
  function validateSettingsForm(form) {
    let bad=null;
    form.querySelectorAll('[required]').forEach((input)=>{const invalid=!String(input.value||'').trim();input.classList.toggle('is-error',invalid);if(invalid&&!bad)bad=input;});
    form.querySelectorAll('input[type="number"]').forEach((input)=>{const value=Number(input.value),min=Number(input.min),max=Number(input.max);const invalid=!Number.isFinite(value)||(input.min!==''&&value<min)||(input.max!==''&&value>max);input.classList.toggle('is-error',invalid);if(invalid&&!bad)bad=input;});
    bad?.focus();return !bad;
  }
  function captureCurrentSettings() {
    const form=document.querySelector('[data-settings-form]'); if(!form)return null;
    settingsDrafts[state.settingsTab]=serializeSettingsForm(form); return settingsDrafts[state.settingsTab];
  }
  function cleanHistoryValue(key,value){
    if(['expandedLogo','compactMark','favicon'].includes(key)) return value?'Custom asset':'Default asset';
    return String(value ?? '');
  }
  function recordSettingsHistory(tab,before={},after={}) {
    const keys=[...new Set([...Object.keys(before),...Object.keys(after)])];
    const changes=keys.filter((key)=>String(before[key]??'')!==String(after[key]??'')).slice(0,12).map((key)=>({field:key,before:cleanHistoryValue(key,before[key]),after:cleanHistoryValue(key,after[key])}));
    const entry={id:`CFG-${Date.now().toString().slice(-8)}`,version:'CFG-PLATFORM-18.0',label:settingsMeta[tab].label,time:new Date().toLocaleString(),actor:'Alex Rivera',scope:tab==='general'?'Admin shell / organization':tab==='privacy'?'Administrator UI':'Workspace default',changes};
    settingsHistory.unshift(entry);settingsHistory.splice(12);storage.write('orvexa-system-settings-history-v40',settingsHistory);
  }
  function settingsHistoryMarkup() {
    const rows=settingsHistory.length?settingsHistory:[{id:'CFG-781204',version:'CFG-PLATFORM-18.0',label:'Workspace Defaults',time:'30 Aug 2026, 19:04',actor:'Alex Rivera',scope:'Workspace default',changes:[{field:'dateRange',before:'Last 7 days',after:'Last 30 days'}]},{id:'CFG-780991',version:'CFG-PLATFORM-18.0',label:'Appearance',time:'29 Aug 2026, 14:08',actor:'Alex Rivera',scope:'Workspace default',changes:[{field:'density',before:'Compact',after:'Comfortable'}]}];
    return `<div class="p8-history-list">${rows.map((row)=>`<article><span>${icon('history')}</span><div><b>${esc(row.label)}</b><p>${esc(row.scope)} · ${esc(row.actor)} · ${esc(row.version||'CFG-PLATFORM-18.0')}</p>${row.changes?.length?`<div class="p8-history-changes">${row.changes.slice(0,4).map(c=>`<span><code>${esc(c.field)}</code><small>${esc(c.before)} → ${esc(c.after)}</small></span>`).join('')}</div>`:''}</div><div><span class="p8-mono">${esc(row.id)}</span><time>${esc(row.time)}</time></div></article>`).join('')}</div>`;
  }
  function refreshBrandAssetPreview(form,kind) {
    const value=form.elements.namedItem(kind)?.value||'';
    const preview=form.querySelector(`[data-brand-preview="${kind}"]`); if(preview)preview.innerHTML=assetPreview(kind,value);
  }
  function generalBrandDraft(form) {
    const values=serializeSettingsForm(form); return { ...currentBrand(), productName:values.productName, subtitle:values.subtitle, altText:values.altText, browserTitle:values.browserTitle, expandedLogo:values.expandedLogo, compactMark:values.compactMark, favicon:values.favicon };
  }
  function refreshBrandingPreview(form) {
    if(!form||form.dataset.settingsForm!=='general')return;
    const preview=form.querySelector('.p8-brand-live'); if(preview)preview.outerHTML=brandingPreviewMarkup(generalBrandDraft(form));
    window.lucide?.createIcons?.({attrs:{'stroke-width':1.8}});
  }
  function appearanceBrandDraft(values) {
    return { ...currentBrand(), accent:values.accent, success:values.success, warning:values.warning, danger:values.danger, info:values.info, surfacePreset:values.surfacePreset, fontPreset:values.fontPreset, reducedMotion:Boolean(values['switch:reduced-motion']) };
  }
  function applyPersistedBranding() {
    const general={...settingsDefaults().general,...(persistedSettings.general||{})};
    const appearance={...settingsDefaults().appearance,...(persistedSettings.appearance||{})};
    window.Orvexa?.branding?.save?.({ ...currentBrand(), ...general, ...appearance, reducedMotion:Boolean(appearance['switch:reduced-motion']) });
  }
  function updateSettingsDirtyUi(){
    state.dirty=state.dirtyTabs.size>0;
    const bar=document.querySelector('[data-settings-unsaved]');if(bar)bar.hidden=!state.dirty;
    const count=document.querySelector('[data-settings-dirty-count]');if(count)count.textContent=String(state.dirtyTabs.size);
    document.querySelectorAll('[data-save-settings]').forEach((button)=>button.disabled=!state.dirty);
    const label=document.querySelector('[data-settings-state]');if(label){const dirty=state.dirtyTabs.has(state.settingsTab);label.textContent=dirty?'Unsaved':'Saved';label.classList.toggle('is-dirty',dirty);}
  }
  function markSettingsDirty() {
    const form=document.querySelector('[data-settings-form]'); if(form)settingsDrafts[state.settingsTab]=serializeSettingsForm(form);
    state.dirtyTabs.add(state.settingsTab);updateSettingsDirtyUi();
    if(form?.dataset.settingsForm==='general')refreshBrandingPreview(form);
    if(form?.dataset.settingsForm==='appearance')window.Orvexa?.branding?.apply?.(appearanceBrandDraft(settingsDrafts.appearance));
  }
  function saveSettings(mode='section'){
    const form=document.querySelector('[data-settings-form]');if(form&&!validateSettingsForm(form)){toast('Review the highlighted settings before saving','triangle-alert');return;}
    captureCurrentSettings();
    const tabs=mode==='all'?[...state.dirtyTabs]:[state.settingsTab];
    if(!tabs.length){toast('No settings changes to save','check-circle-2');return;}
    tabs.forEach((tab)=>{const before={...settingsDefaults()[tab],...(persistedSettings[tab]||{})};const after={...settingsDefaults()[tab],...(settingsDrafts[tab]||{})};recordSettingsHistory(tab,before,after);persistedSettings[tab]=after;state.dirtyTabs.delete(tab);});
    storage.write('orvexa-system-settings-v40',persistedSettings);
    applyPersistedBranding();
    updateSettingsDirtyUi();
    const label=document.querySelector('[data-settings-state]');if(label){label.textContent='Saved';label.classList.remove('is-dirty');}
    toast(mode==='all'?'All settings changes saved':`${settingsMeta[state.settingsTab].label} settings saved`);
  }
  function resetSettingsSection(){
    const defs=settingsDefaults();
    if(state.settingsTab==='general') settingsDrafts.general={...defs.general,productName:brandDefaults.productName,subtitle:brandDefaults.subtitle,altText:brandDefaults.altText,browserTitle:brandDefaults.browserTitle,expandedLogo:'',compactMark:'',favicon:'',organization:'Nova Intelligence',workspaceDisplay:'Nova Intelligence',workspaceId:'WS-NOVA-PROD'};
    else if(state.settingsTab==='appearance') settingsDrafts.appearance={...defs.appearance,accent:brandDefaults.accent,success:brandDefaults.success,warning:brandDefaults.warning,danger:brandDefaults.danger,info:brandDefaults.info,surfacePreset:brandDefaults.surfacePreset,fontPreset:brandDefaults.fontPreset,'switch:reduced-motion':false};
    else settingsDrafts[state.settingsTab]={...defs[state.settingsTab]};
    state.dirtyTabs.add(state.settingsTab);drawSettingsPanel();updateSettingsDirtyUi();toast(`${settingsMeta[state.settingsTab].label} reset to defaults`,'rotate-ccw');
  }
  function bindBrandAssetControls(form){
    form.querySelectorAll('[data-brand-choose]').forEach((button)=>button.addEventListener('click',()=>form.querySelector(`[data-brand-file="${button.dataset.brandChoose}"]`)?.click()));
    form.querySelectorAll('[data-brand-file]').forEach((input)=>input.addEventListener('change',()=>{
      const file=input.files?.[0];if(!file)return;const kind=input.dataset.brandFile;const isFavicon=kind==='favicon';const allowed=isFavicon?/\.(png|svg|ico)$/i:/\.(png|svg|webp)$/i;const max=isFavicon?524288:1572864;
      if(!allowed.test(file.name)||file.size>max){toast(`${isFavicon?'Favicon':'Brand asset'} must use an approved format and stay under the file-size limit`,'triangle-alert');input.value='';return;}
      const reader=new FileReader();reader.onload=()=>{const hidden=form.elements.namedItem(kind);if(hidden)hidden.value=String(reader.result||'');refreshBrandAssetPreview(form,kind);markSettingsDirty();};reader.readAsDataURL(file);
    }));
    form.querySelectorAll('[data-brand-remove],[data-brand-reset]').forEach((button)=>button.addEventListener('click',()=>{const kind=button.dataset.brandRemove||button.dataset.brandReset;const hidden=form.elements.namedItem(kind);if(hidden)hidden.value='';refreshBrandAssetPreview(form,kind);markSettingsDirty();toast(button.dataset.brandReset?`${kind} reset to Orvexa default`:`${kind} removed; fallback will be used`,'rotate-ccw');}));
  }
  function drawSettingsPanel() {
    const host=document.getElementById('p8-settings-panel'); if(!host)return; host.innerHTML=settingsPanel(state.settingsTab); window.lucide?.createIcons?.({ attrs:{'stroke-width':1.8} });
    const form=host.querySelector('[data-settings-form]'); if(form)applySavedSettings(form,state.settingsTab);
    if(form?.dataset.settingsForm==='general'){['expandedLogo','compactMark','favicon'].forEach(kind=>refreshBrandAssetPreview(form,kind));refreshBrandingPreview(form);bindBrandAssetControls(form);}
    form?.querySelectorAll('input:not([type="file"]), select').forEach((el)=>el.addEventListener('input',()=>{if(el.type==='color'){const code=el.closest('.p8-color-field')?.querySelector('code');if(code)code.textContent=el.value;}markSettingsDirty();}));
    form?.querySelectorAll('[data-switch]').forEach((el)=>el.addEventListener('click',()=>{el.classList.toggle('is-on');el.setAttribute('aria-pressed',String(el.classList.contains('is-on')));markSettingsDirty();}));
    form?.querySelectorAll('[data-setting-preference]').forEach((el)=>el.addEventListener('change',()=>{applyPreference(el.dataset.settingPreference,el.value);markSettingsDirty();}));
    form?.querySelector('[data-reset-settings-section]')?.addEventListener('click',resetSettingsSection);
    form?.addEventListener('submit',(event)=>{event.preventDefault();saveSettings('section');});
    updateSettingsDirtyUi();
  }
  function bindSettings() {
    document.querySelectorAll('[data-settings-tab]').forEach((el)=>el.addEventListener('click',()=>{captureCurrentSettings();state.settingsTab=el.dataset.settingsTab;history.replaceState(null,'',`#${state.settingsTab}`);document.querySelectorAll('[data-settings-tab]').forEach((button)=>button.classList.toggle('is-active',button===el));drawSettingsPanel();}));
    document.querySelectorAll('[data-save-settings]').forEach((el)=>el.addEventListener('click',()=>saveSettings('all')));
    document.querySelector('[data-discard-settings]')?.addEventListener('click',()=>{Object.keys(settingsDrafts).forEach(k=>delete settingsDrafts[k]);Object.assign(settingsDrafts,JSON.parse(JSON.stringify(persistedSettings||{})));state.dirtyTabs.clear();state.dirty=false;window.Orvexa?.branding?.apply?.(window.Orvexa?.branding?.read?.());drawSettingsPanel();updateSettingsDirtyUi();toast('Unsaved settings discarded','rotate-ccw');});
    document.querySelector('[data-settings-history]')?.addEventListener('click',()=>openDrawer('Settings change history',settingsHistoryMarkup()));
    drawSettingsPanel();
  }

  function bindCommon() {
    ensureDrawer();
    if(page==='notification-center')bindNotifications();
    if(page==='profile-account')bindProfile();
    if(page==='settings')bindSettings();
  }

  function render() {main.className='p8-page';main.id='main-content';main.tabIndex=-1;main.innerHTML=renderers[page]?.()||'';bindCommon();window.lucide?.createIcons?.({ attrs:{'stroke-width':1.8} });}

  document.addEventListener('click',(event)=>{
    if(event.target.closest('[data-close-drawer]')||event.target.id==='p8-drawer-backdrop')closeDrawer();
    const copy=event.target.closest('[data-copy]');if(copy){navigator.clipboard?.writeText(copy.dataset.copy);toast(`Copied ${copy.dataset.copy}`);}
    const snooze=event.target.closest('[data-snooze-notification]');if(snooze){const item=state.notifications.find((n)=>n.id===snooze.dataset.snoozeNotification);if(item){item.snoozedUntil=new Date(Date.now()+3600000).toISOString();persistNotifications();closeDrawer();toast(`${item.id} snoozed for 1 hour`,'clock-3');render();}return;}
    const mute=event.target.closest('[data-mute-notification]');if(mute){const item=state.notifications.find((n)=>n.id===mute.dataset.muteNotification);if(item){item.muted=true;persistNotifications();closeDrawer();toast(`Rule muted for ${item.ref}`,'bell-off');render();}return;}
    const markDrawer=event.target.closest('[data-mark-drawer-notification]');if(markDrawer){const item=state.notifications.find((n)=>n.id===markDrawer.dataset.markDrawerNotification);if(item){item.unread=false;persistNotifications();closeDrawer();toast(`${item.id} marked read`);render();}return;}
    const openChannel=event.target.closest('[data-open-channel-preference]');if(openChannel){const item=state.channels.find((channel)=>channel.id===openChannel.dataset.openChannelPreference);if(item)openDrawer(`${item.name} delivery`,channelPreferenceMarkup(item));return;}
    const drawerChannel=event.target.closest('[data-drawer-channel-toggle]');if(drawerChannel){const item=state.channels.find((channel)=>channel.id===drawerChannel.dataset.drawerChannelToggle);if(item){item.enabled=!item.enabled;persistChannels();closeDrawer();toast(`${item.name} ${item.enabled?'enabled':'disabled'}`,item.enabled?'bell-ring':'bell-off');render();}return;}
    const action=event.target.closest('[data-action]');if(action){event.preventDefault();toast(action.dataset.action);}
  });
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape')closeDrawer();if(event.key==='Tab'){const drawer=document.getElementById('p8-drawer');if(!drawer?.classList.contains('is-open'))return;const focusable=[...drawer.querySelectorAll('button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])')];if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
  render();
})();
