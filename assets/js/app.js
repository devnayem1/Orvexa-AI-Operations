(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const commandModal = document.getElementById('command-modal');
  const commandTrigger = document.getElementById('command-trigger');
  const commandInput = document.getElementById('command-input');
  const askAi = document.getElementById('ask-ai');

  const THEME_KEY = 'orvexa-theme-v16';
  const DIR_KEY = 'orvexa-direction-v16';
  const DENSITY_KEY = 'orvexa-density-v16';
  const LANGUAGE_KEY = 'orvexa-language-v14';

  const safeStorage = {
    get(key) {
      try { return localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (_) {}
    },
  };


  const BRANDING_KEY = 'orvexa-branding-v1';
  const BRANDING_DEFAULTS = Object.freeze({
    productName: 'Orvexa',
    subtitle: 'ARTIFICIAL INTELLIGENCE OS',
    altText: 'Orvexa home',
    browserTitle: 'Orvexa — AI Production Fabric & Operations Control Plane',
    expandedLogo: '',
    compactMark: '',
    favicon: '',
    accent: '#d99a00',
    success: '#4bc98b',
    warning: '#d99a00',
    danger: '#e76f61',
    info: '#75a7e3',
    fontPreset: 'Manrope',
    surfacePreset: 'Pearl',
    reducedMotion: false,
  });

  function readBrandingSettings() {
    try {
      const raw = safeStorage.get(BRANDING_KEY);
      return { ...BRANDING_DEFAULTS, ...(raw ? JSON.parse(raw) : {}) };
    } catch (_) { return { ...BRANDING_DEFAULTS }; }
  }

  function parseHexColor(value) {
    const match = String(value || '').trim().match(/^#([0-9a-f]{6})$/i);
    if (!match) return null;
    const hex = match[1];
    return [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  }

  function relativeLuminance(rgb) {
    const [r, g, b] = rgb.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
  }

  function contrastRatio(a, b) {
    const first = relativeLuminance(a);
    const second = relativeLuminance(b);
    const high = Math.max(first, second);
    const low = Math.min(first, second);
    return (high + 0.05) / (low + 0.05);
  }

  function mixRgb(source, target, amount) {
    return source.map((value, index) => Math.round(value + ((target[index] - value) * amount)));
  }

  function rgbToHex(rgb) {
    return `#${rgb.map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0')).join('')}`;
  }

  function accessibleSemanticForeground(value) {
    const source = parseHexColor(value);
    if (!source) return root.classList.contains('dark') ? '#f5f7f9' : '#292b27';
    const dark = root.classList.contains('dark');
    const surfaceValue = getComputedStyle(root).getPropertyValue('--surface-solid').trim();
    const surface = parseHexColor(surfaceValue) || (dark ? [20, 29, 38] : [255, 253, 250]);
    if (contrastRatio(source, surface) >= 4.5) return rgbToHex(source);
    const target = dark ? [255, 255, 255] : [31, 36, 31];
    for (let step = 1; step <= 20; step += 1) {
      const candidate = mixRgb(source, target, step / 20);
      if (contrastRatio(candidate, surface) >= 4.5) return rgbToHex(candidate);
    }
    return dark ? '#f5f7f9' : '#292b27';
  }

  function applySemanticForegrounds(branding) {
    root.style.setProperty('--primary-text', accessibleSemanticForeground(branding.accent || BRANDING_DEFAULTS.accent));
    root.style.setProperty('--mint-text', accessibleSemanticForeground(branding.success || BRANDING_DEFAULTS.success));
    root.style.setProperty('--amber-text', accessibleSemanticForeground(branding.warning || BRANDING_DEFAULTS.warning));
    root.style.setProperty('--danger-text', accessibleSemanticForeground(branding.danger || BRANDING_DEFAULTS.danger));
    root.style.setProperty('--cyan-text', accessibleSemanticForeground(branding.info || BRANDING_DEFAULTS.info));
  }

  function applyBrandingSettings(next = readBrandingSettings()) {
    const branding = { ...BRANDING_DEFAULTS, ...next };
    root.style.setProperty('--primary-2', branding.accent || BRANDING_DEFAULTS.accent);
    root.style.setProperty('--mint', branding.success || BRANDING_DEFAULTS.success);
    root.style.setProperty('--amber', branding.warning || BRANDING_DEFAULTS.warning);
    root.style.setProperty('--danger', branding.danger || BRANDING_DEFAULTS.danger);
    root.style.setProperty('--cyan', branding.info || BRANDING_DEFAULTS.info);
    applySemanticForegrounds(branding);
    root.dataset.surfacePreset = String(branding.surfacePreset || 'Pearl').toLowerCase().replace(/\s+/g,'-');
    root.dataset.motion = branding.reducedMotion ? 'reduced' : 'standard';
    root.style.setProperty('--orvexa-font-family', branding.fontPreset === 'System Sans' ? 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' : 'Manrope, ui-sans-serif, system-ui, sans-serif');
    document.body.style.fontFamily = 'var(--orvexa-font-family)';

    if (branding.browserTitle) document.title = branding.browserTitle;
    let favicon = document.querySelector('link[data-orvexa-runtime-favicon]');
    if (branding.favicon) {
      if (!favicon) { favicon = document.createElement('link'); favicon.rel='icon'; favicon.dataset.orvexaRuntimeFavicon='true'; document.head.appendChild(favicon); }
      favicon.href = branding.favicon;
    } else favicon?.remove();

    const brand = document.getElementById('sidebar-brand');
    const mark = brand?.querySelector('.brand-mark');
    const copy = document.getElementById('sidebar-brand-copy');
    if (mark) {
      if (!mark.dataset.defaultMarkup) mark.dataset.defaultMarkup = mark.innerHTML;
      mark.innerHTML = branding.compactMark ? `<img class="orvexa-compact-brand-image" src="${branding.compactMark}" alt="${escapeHtml(branding.altText || branding.productName)}"/>` : mark.dataset.defaultMarkup;
    }
    if (copy) {
      const name = copy.querySelector('span:first-child');
      const subtitle = copy.querySelector('span:last-child');
      if (name) name.textContent = branding.productName || BRANDING_DEFAULTS.productName;
      if (subtitle) subtitle.textContent = branding.subtitle || BRANDING_DEFAULTS.subtitle;
    }
    if (brand) {
      let expanded = brand.querySelector('[data-orvexa-expanded-logo]');
      if (!expanded) { expanded = document.createElement('img'); expanded.dataset.orvexaExpandedLogo='true'; expanded.className='orvexa-expanded-brand-image'; brand.appendChild(expanded); }
      if (branding.expandedLogo) { expanded.src=branding.expandedLogo; expanded.alt=branding.altText || `${branding.productName} home`; brand.classList.add('has-expanded-brand-image'); }
      else { expanded.removeAttribute('src'); expanded.alt=''; brand.classList.remove('has-expanded-brand-image'); }
      brand.setAttribute('aria-label', branding.altText || `${branding.productName} home`);
    }
    document.dispatchEvent(new CustomEvent('orvexa:brandingchange', { detail: branding }));
    return branding;
  }

  function saveBrandingSettings(next) {
    const merged = { ...BRANDING_DEFAULTS, ...next };
    safeStorage.set(BRANDING_KEY, JSON.stringify(merged));
    return applyBrandingSettings(merged);
  }

  window.Orvexa = window.Orvexa || {};
  window.Orvexa.branding = { key: BRANDING_KEY, defaults: BRANDING_DEFAULTS, read: readBrandingSettings, apply: applyBrandingSettings, save: saveBrandingSettings };
  applyBrandingSettings();

  function refreshIcons() {
    if (window.lucide?.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
  }

  function syncThemeControls() {
    const isDark = root.classList.contains('dark');
    document.querySelectorAll('[data-theme-icon]').forEach((icon) => icon.setAttribute('data-lucide', isDark ? 'moon' : 'sun'));
    document.getElementById('theme-toggle')?.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    refreshIcons();
  }

  function setTheme(theme) {
    root.classList.toggle('dark', theme === 'dark');
    safeStorage.set(THEME_KEY, theme);
    applySemanticForegrounds(readBrandingSettings());
    syncThemeControls();
    document.dispatchEvent(new CustomEvent('orvexa:themechange', { detail: { theme } }));
  }

  function setDirection(direction) {
    const next = direction === 'rtl' ? 'rtl' : 'ltr';
    root.dir = next;
    safeStorage.set(DIR_KEY, next);
    document.dispatchEvent(new CustomEvent('orvexa:directionchange', { detail: { direction: next } }));
  }

  function setDensity(density) {
    const next = density === 'compact' ? 'compact' : 'comfortable';
    root.dataset.density = next;
    safeStorage.set(DENSITY_KEY, next);
    document.querySelectorAll('[data-density-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(next === 'compact'));
      const label = button.querySelector('[data-density-label]');
      if (label) label.textContent = next === 'compact' ? 'Compact' : 'Comfortable';
    });
    document.dispatchEvent(new CustomEvent('orvexa:densitychange', { detail: { density: next } }));
  }

  setDensity(safeStorage.get(DENSITY_KEY) || root.dataset.density || 'comfortable');
  syncThemeControls();

  const assetBase = (body.dataset.basePath || body.dataset.base || '.').replace(/\/$/, '');
  const languages = {
    en: { flag: `${assetBase}/assets/images/flags/us.svg`, dir: 'ltr', label: 'English' },
    fr: { flag: `${assetBase}/assets/images/flags/fr.svg`, dir: 'ltr', label: 'Français' },
    de: { flag: `${assetBase}/assets/images/flags/de.svg`, dir: 'ltr', label: 'Deutsch' },
    it: { flag: `${assetBase}/assets/images/flags/it.svg`, dir: 'ltr', label: 'Italiano' },
    ar: { flag: `${assetBase}/assets/images/flags/sa.svg`, dir: 'rtl', label: 'العربية' },
  };
  function setLanguage(language) {
    const next = languages[language] ? language : 'en';
    const config = languages[next];
    safeStorage.set(LANGUAGE_KEY, next);
    root.lang = next;
    setDirection(config.dir);
    const flag = document.querySelector('#language-flag img');
    if (flag) {
      flag.src = config.flag;
      flag.alt = `${config.label} flag`;
    }
    document.querySelectorAll('[data-language-option]').forEach((button) => {
      const active = button.dataset.languageOption === next;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-active', active);
    });
  }
  setLanguage(safeStorage.get(LANGUAGE_KEY) || root.lang || 'en');

  document.querySelectorAll('[data-density-toggle]').forEach((button) => {
    button.addEventListener('click', () => setDensity(root.dataset.density === 'compact' ? 'comfortable' : 'compact'));
  });
  document.querySelectorAll('[data-language-option]').forEach((button) => {
    button.addEventListener('click', () => {
      setLanguage(button.dataset.languageOption);
      const selected = languages[button.dataset.languageOption] || languages.en;
      showToast(`${selected.label} selected · ${selected.dir.toUpperCase()}`, 'languages');
      closeDropdowns();
    });
  });

  document.querySelector('[data-mark-notifications-read]')?.addEventListener('click', () => {
    document.querySelectorAll('.notification-unread').forEach((dot) => dot.remove());
    document.getElementById('notification-dot')?.classList.add('hidden');
    const count = document.getElementById('notification-count');
    if (count) count.textContent = '0';
    showToast('Notifications marked as read', 'check-check');
  });

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    setTheme(root.classList.contains('dark') ? 'light' : 'dark');
    showToast(root.classList.contains('dark') ? 'Dark intelligence mode enabled' : 'Light intelligence mode enabled', 'theme');
  });

  const SIDEBAR_MODE_KEY = 'orvexa-sidebar-mode';
  const SIDEBAR_TONE_KEY = 'orvexa-sidebar-tone';
  const sidebarSettingsTrigger = document.getElementById('layout-settings-trigger');
  const sidebarSettingsPanel = document.getElementById('layout-settings-panel');
  const sidebarSettingsBackdrop = document.getElementById('layout-settings-backdrop');
  const sidebarSettingsClose = document.getElementById('layout-settings-close');

  function syncSidebarControls() {
    const mode = root.dataset.sidebarMode === 'full' ? 'full' : 'icon';
    const tone = ['pearl', 'warm', 'dark'].includes(root.dataset.sidebarTone) ? root.dataset.sidebarTone : 'pearl';
    document.querySelectorAll('[data-sidebar-mode-option]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.sidebarModeOption === mode));
    });
    document.querySelectorAll('[data-sidebar-tone-option]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.sidebarToneOption === tone));
    });
    if (sidebarToggle) {
      const icon = sidebarToggle.querySelector('[data-lucide]');
      if (icon) icon.setAttribute('data-lucide', mode === 'full' ? 'panel-left-close' : 'panel-left-open');
      sidebarToggle.setAttribute('aria-label', mode === 'full' ? 'Use icon sidebar' : 'Use full sidebar');
      sidebarToggle.setAttribute('title', mode === 'full' ? 'Use icon sidebar' : 'Use full sidebar');
    }
    refreshIcons();
  }

  function setSidebarMode(mode, { notify = false } = {}) {
    const next = mode === 'full' ? 'full' : 'icon';
    root.dataset.sidebarMode = next;
    safeStorage.set(SIDEBAR_MODE_KEY, next);
    syncSidebarControls();
    document.dispatchEvent(new CustomEvent('orvexa:sidebarmodechange', { detail: { mode: next } }));
    if (notify) showToast(next === 'full' ? 'Full sidebar enabled' : 'Icon hover sidebar enabled', 'panel-left');
  }

  function setSidebarTone(tone, { notify = false } = {}) {
    const next = ['pearl', 'warm', 'dark'].includes(tone) ? tone : 'pearl';
    root.dataset.sidebarTone = next;
    safeStorage.set(SIDEBAR_TONE_KEY, next);
    syncSidebarControls();
    document.dispatchEvent(new CustomEvent('orvexa:sidebartonechange', { detail: { tone: next } }));
    if (notify) showToast(`${next.charAt(0).toUpperCase() + next.slice(1)} sidebar applied`, 'palette');
  }

  function setLayoutSettingsOpen(open) {
    if (!sidebarSettingsPanel || !sidebarSettingsBackdrop) return;
    sidebarSettingsPanel.classList.toggle('is-open', open);
    sidebarSettingsBackdrop.classList.toggle('is-open', open);
    sidebarSettingsPanel.setAttribute('aria-hidden', String(!open));
    sidebarSettingsTrigger?.setAttribute('aria-expanded', String(open));
    body.classList.toggle('overflow-hidden', open);
    if (open) requestAnimationFrame(() => sidebarSettingsClose?.focus());
  }

  setSidebarMode(safeStorage.get(SIDEBAR_MODE_KEY) || root.dataset.sidebarMode || 'icon');
  setSidebarTone(safeStorage.get(SIDEBAR_TONE_KEY) || root.dataset.sidebarTone || 'pearl');

  sidebarToggle?.addEventListener('click', () => {
    setSidebarMode(root.dataset.sidebarMode === 'full' ? 'icon' : 'full', { notify: true });
  });
  sidebarSettingsTrigger?.addEventListener('click', (event) => {
    event.stopPropagation();
    closeDropdowns();
    setLayoutSettingsOpen(true);
  });
  sidebarSettingsClose?.addEventListener('click', () => setLayoutSettingsOpen(false));
  sidebarSettingsBackdrop?.addEventListener('click', () => setLayoutSettingsOpen(false));
  document.querySelectorAll('[data-sidebar-mode-option]').forEach((button) => {
    button.addEventListener('click', () => setSidebarMode(button.dataset.sidebarModeOption, { notify: true }));
  });
  document.querySelectorAll('[data-sidebar-tone-option]').forEach((button) => {
    button.addEventListener('click', () => setSidebarTone(button.dataset.sidebarToneOption, { notify: true }));
  });
  document.querySelector('[data-reset-layout-settings]')?.addEventListener('click', () => {
    setSidebarMode('icon');
    setSidebarTone('pearl');
    showToast('Sidebar settings reset', 'rotate-ccw');
  });

  function setMobileSidebar(open) {
    if (open) {
      // The global mobile navigation owns the top overlay layer. Close any
      // page-local mobile rail before exposing the primary navigation.
      document.querySelectorAll('.mobile-open').forEach((panel) => {
        if (panel !== sidebar) panel.classList.remove('mobile-open');
      });
    }
    sidebar?.classList.toggle('mobile-open', open);
    mobileBackdrop?.classList.toggle('hidden', !open);
    root.classList.toggle('mobile-sidebar-open', open);
    body.classList.toggle('overflow-hidden', open);
    mobileMenu?.setAttribute('aria-expanded', String(open));
    mobileBackdrop?.setAttribute('aria-hidden', String(!open));
  }

  mobileMenu?.addEventListener('click', () => setMobileSidebar(true));
  mobileClose?.addEventListener('click', () => setMobileSidebar(false));
  mobileBackdrop?.addEventListener('click', () => setMobileSidebar(false));
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && sidebar?.classList.contains('mobile-open')) setMobileSidebar(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar?.classList.contains('mobile-open')) setMobileSidebar(false);
  });

  document.querySelectorAll('.dropdown-trigger').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const dropdown = trigger.closest('.dropdown');
      const willOpen = !dropdown.classList.contains('is-open');
      closeDropdowns();
      dropdown.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
  });

  function closeDropdowns() {
    document.querySelectorAll('.dropdown.is-open').forEach((dropdown) => {
      dropdown.classList.remove('is-open');
      dropdown.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    });
  }

  document.addEventListener('click', closeDropdowns);
  document.querySelectorAll('.dropdown-panel').forEach((panel) => panel.addEventListener('click', (event) => event.stopPropagation()));

  function openCommand() {
    if (!commandModal) return;
    closeDropdowns();
    commandModal.classList.remove('hidden');
    commandModal.classList.add('flex');
    body.classList.add('overflow-hidden');
    requestAnimationFrame(() => commandInput?.focus());
  }

  function closeCommand() {
    if (!commandModal) return;
    commandModal.classList.add('hidden');
    commandModal.classList.remove('flex');
    body.classList.remove('overflow-hidden');
    if (commandInput) {
      commandInput.value = '';
      filterCommands('');
    }
  }

  commandTrigger?.addEventListener('click', openCommand);
  askAi?.addEventListener('click', () => {
    openCommand();
    if (commandInput) commandInput.placeholder = 'Ask AI about this workspace...';
  });
  commandModal?.addEventListener('click', (event) => { if (event.target === commandModal) closeCommand(); });

  function ensureMonetizeCommands() {
    if (!commandModal || commandModal.querySelector('[data-monetize-command]')) return;
    const empty = commandModal.querySelector('#command-empty');
    if (!empty) return;
    const base = window.location.pathname.includes('/pages/') ? './' : './pages/';
    const destinations = [
      ['Customers', 'customers.html', 'building-2', 'customers tenants workspaces billing'],
      ['Plans & Entitlements', 'plans-entitlements.html', 'layers-3', 'plans entitlements pricing limits features'],
      ['Subscriptions & Billing', 'subscriptions-billing.html', 'receipt-text', 'subscriptions invoices payments trials billing'],
      ['Usage & Credits', 'usage-credits.html', 'coins', 'usage credits tokens requests overage'],
    ];
    destinations.forEach(([label, href, glyph, search]) => {
      const link = document.createElement('a');
      link.className = 'command-item flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-black/5 dark:hover:bg-white/5';
      link.dataset.monetizeCommand = 'true';
      link.dataset.search = search;
      link.href = `${base}${href}`;
      link.innerHTML = `<i class="size-4" data-lucide="${glyph}" style="color:var(--muted)"></i><span class="text-xs font-bold">${label}</span><span class="ml-auto text-[12px]" style="color:var(--muted)">Open</span>`;
      empty.before(link);
    });
    refreshIcons();
  }

  ensureMonetizeCommands();

  function filterCommands(value) {
    const query = value.trim().toLowerCase();
    const items = [...document.querySelectorAll('.command-item')];
    let visible = 0;
    items.forEach((item) => {
      const haystack = `${item.dataset.search || ''} ${item.textContent || ''}`.toLowerCase();
      const show = !query || haystack.includes(query);
      item.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });
    document.getElementById('command-empty')?.classList.toggle('hidden', visible !== 0);
  }

  const commandDestinations = {
    'Knowledge & RAG': 'knowledge-rag.html',
    'Models & Providers': 'models-routing.html',
    'Usage Analytics': 'usage-analytics.html',
  };
  document.querySelectorAll('.command-item').forEach((item) => {
    if (item.tagName === 'A') return;
    const label = item.textContent?.trim();
    const target = commandDestinations[label];
    if (!target) return;
    item.addEventListener('click', () => {
      window.location.href = window.location.pathname.includes('/pages/') ? `./${target}` : `./pages/${target}`;
    });
  });

  commandInput?.addEventListener('input', (event) => filterCommands(event.target.value));
  commandInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && commandInput.value.trim()) {
      showToast(`AI query queued: “${commandInput.value.trim().slice(0, 64)}”`, 'sparkles');
      closeCommand();
    }
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (event.key === 'Escape' && sidebarSettingsPanel?.classList.contains('is-open')) {
      setLayoutSettingsOpen(false);
      sidebarSettingsTrigger?.focus();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === 'k') {
      event.preventDefault();
      commandModal?.classList.contains('hidden') ? openCommand() : closeCommand();
    }
    if ((event.ctrlKey || event.metaKey) && key === 'j') {
      event.preventDefault();
      window.location.href = window.location.pathname.includes('/pages/') ? './test-console.html' : './pages/test-console.html';
    }
    if (event.key === 'Escape') {
      closeCommand();
      closeDropdowns();
      setMobileSidebar(false);
    }
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((node) => node.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.07 });
    reveals.forEach((node) => observer.observe(node));
  }

  function animateCount(el) {
    const target = Number(el.dataset.count || 0);
    if (!Number.isFinite(target)) return;
    const decimals = String(target).includes('.') ? String(target).split('.')[1].length : 0;
    if (reduceMotion) {
      el.textContent = target.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      return;
    }
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));

  window.showToast = showToast;
  function showToast(message, icon = 'sparkles') {
    const region = document.getElementById('toast-region');
    if (!region) return;
    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto glass-panel flex translate-y-2 items-center gap-3 rounded-2xl px-4 py-3 opacity-0 transition duration-300';
    toast.innerHTML = `<span class="flex size-8 shrink-0 items-center justify-center rounded-xl" style="background:color-mix(in srgb,var(--primary) 14%,transparent);color:var(--primary-text)"><i data-lucide="${icon}" class="size-4"></i></span><div class="min-w-0 flex-1"><p class="text-xs font-bold">${escapeHtml(message)}</p><p class="mt-0.5 text-[12px]" style="color:var(--muted)">Orvexa demo interaction</p></div><button class="icon-button !size-7" aria-label="Dismiss"><i data-lucide="x" class="size-3.5"></i></button>`;
    region.appendChild(toast);
    refreshIcons();
    requestAnimationFrame(() => toast.classList.remove('translate-y-2', 'opacity-0'));
    const dismiss = () => {
      toast.classList.add('translate-y-2', 'opacity-0');
      window.setTimeout(() => toast.remove(), 250);
    };
    toast.querySelector('button')?.addEventListener('click', dismiss);
    window.setTimeout(dismiss, 3600);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  }

  // Application identity registry: one application keeps the same visual family across relevant product tables.
  const applicationIdentity = [
    { tone: 'mint', keys: ['app-support-001', 'support ai', 'support copilot', 'customer support ai'] },
    { tone: 'lavender', keys: ['app-contact-002', 'ai contact center'] },
    { tone: 'sky', keys: ['app-doc-003', 'document intelligence', 'document ai'] },
    { tone: 'peach', keys: ['app-growth-004', 'growth assistant'] },
    { tone: 'violet', keys: ['app-research', 'research agent'] },
    { tone: 'blue', keys: ['app-sales', 'sales copilot'] },
    { tone: 'coral', keys: ['app-compliance', 'compliance ai'] },
    { tone: 'aqua', keys: ['app-rag', 'enterprise rag'] },
  ];
  window.Orvexa = window.Orvexa || {};
  window.Orvexa.applicationIdentity = Object.freeze(applicationIdentity.map(item => ({ tone: item.tone, keys: [...item.keys] })));

  const applicationColorPages = new Set([
    'command-center',
    'live-operations',
    'requests-runs',
    'ai-issues',
    'applications',
    'usage-analytics',
    'end-user-usage',
  ]);
  const applicationRowSelectors = {
    'command-center': '[data-live-request-body] > tr',
    'live-operations': '#live-request-table > tr',
    'requests-runs': '#request-ledger > tr',
    'ai-issues': '#p5-issue-list > .p5-issue',
    'applications': '.p2-app, .application-portfolio-row',
    'usage-analytics': '#p6-usage-table .p6-row',
    'end-user-usage': '.p6-table.users .p6-row',
  };
  const detectApplicationTone = (node) => {
    const text = `${node.dataset.appId || ''} ${node.dataset.requestApp || ''} ${node.textContent || ''}`.toLowerCase();
    return applicationIdentity.find(item => item.keys.some(key => text.includes(key)))?.tone || '';
  };
  const applyApplicationRowIdentity = (root = document) => {
    const page = document.body?.dataset.activePage || '';
    if (!applicationColorPages.has(page)) return;
    const selector = applicationRowSelectors[page];
    if (!selector) return;
    const rows = root.matches?.(selector) ? [root] : [...root.querySelectorAll?.(selector) || []];
    rows.forEach(row => {
      const tone = detectApplicationTone(row);
      if (!tone) return;
      row.classList.add('orvexa-app-row');
      row.dataset.orvexaAppTone = tone;
    });
  };
  applyApplicationRowIdentity();
  if (applicationColorPages.has(document.body?.dataset.activePage || '')) {
    const applicationColorObserver = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === 1) applyApplicationRowIdentity(node);
    })));
    applicationColorObserver.observe(document.getElementById('main-content') || document.querySelector('main') || document.body, { childList: true, subtree: true });
  }

  document.querySelectorAll('button').forEach((button) => {
    if (button.closest('.dropdown-panel') || button.id || button.classList.contains('usage-range')) return;
    if (button.hasAttribute('data-density-toggle') || button.hasAttribute('data-channel-toggle') || button.hasAttribute('data-form-toggle') || button.hasAttribute('data-table-action') || button.hasAttribute('data-profile-action') || button.hasAttribute('data-security-action') || button.hasAttribute('data-mark-read') || button.hasAttribute('data-notification-filter') || button.hasAttribute('data-copy-token')) return;
    if (button.type === 'submit') return;
    const text = button.textContent.trim();
    if (!text || text.length > 50) return;
    button.addEventListener('click', () => {
      if (button.closest('article') && !button.closest('.dropdown')) showToast(`${text} opened`, 'arrow-up-right');
    });
  });

  refreshIcons();
})();
