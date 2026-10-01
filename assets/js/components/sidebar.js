(() => {
  'use strict';

  const navHost = document.getElementById('primary-navigation');
  const sidebar = document.getElementById('sidebar');
  if (!navHost || !sidebar || !window.Orvexa?.navigation) return;

  const base = document.body.dataset.basePath || '.';
  const activePage = document.body.dataset.activePage || 'command-center';
  const effectiveActivePage = window.Orvexa.secondaryPages?.[activePage] || activePage;

  const resolveHref = (item) => {
    if (!item?.href) return '#';
    if (item.href.startsWith('#')) return item.href;
    return `${base}/${item.href}`.replace('/./', '/');
  };

  const containsActive = (item) => {
    if (!item || item.secondary) return false;
    if (item.id === effectiveActivePage) return true;
    return Boolean(item.children?.some(containsActive) || item.items?.some(containsActive));
  };

  const pageLink = (item, nested = false) => {
    if (!item || item.secondary) return '';
    const active = item.id === effectiveActivePage;
    return `
      <a class="sidebar-domain-link ${nested ? 'is-nested' : ''} ${active ? 'active' : ''}"
         href="${resolveHref(item)}" ${active ? 'aria-current="page"' : ''}>
        <i data-lucide="${item.icon || 'circle'}"></i>
        <span class="sidebar-domain-link-label">${item.label}</span>
      </a>`;
  };

  const renderItems = (items = []) => items.map((item) => {
    if (!item || item.secondary) return '';
    if (item.children?.length) {
      const childActive = item.children.some(containsActive);
      return `
        <div class="sidebar-subgroup ${childActive ? 'is-active' : ''}">
          <div class="sidebar-subgroup-label"><i data-lucide="${item.icon || 'folder-tree'}"></i><span>${item.label}</span></div>
          <div class="sidebar-subgroup-links">${item.children.map((child) => pageLink(child, true)).join('')}</div>
        </div>`;
    }
    return pageLink(item);
  }).join('');

  navHost.innerHTML = window.Orvexa.navigation.map((section) => {
    const active = containsActive(section);
    if (section.href) {
      return `
        <section class="sidebar-domain sidebar-domain-standalone ${active ? 'is-active' : ''}" data-sidebar-domain="${section.id}">
          <a class="sidebar-domain-toggle sidebar-domain-standalone-link" href="${resolveHref(section)}" ${active ? 'aria-current="page"' : ''}>
            <span class="sidebar-domain-icon"><i data-lucide="${section.icon || 'layout-dashboard'}"></i></span>
            <span class="sidebar-domain-label">${section.label}</span>
            <span class="sidebar-domain-chevron sidebar-domain-placeholder" aria-hidden="true"></span>
          </a>
        </section>`;
    }
    return `
      <section class="sidebar-domain ${active ? 'is-active' : ''}" data-sidebar-domain="${section.id}">
        <button class="sidebar-domain-toggle" type="button" aria-label="${section.label}" aria-expanded="false">
          <span class="sidebar-domain-icon"><i data-lucide="${section.icon || 'circle'}"></i></span>
          <span class="sidebar-domain-label">${section.label}</span>
          <i class="sidebar-domain-chevron" data-lucide="chevron-down"></i>
        </button>
        <div class="sidebar-domain-panel" hidden>${renderItems(section.items)}</div>
      </section>`;
  }).join('');

  const domains = [...navHost.querySelectorAll('.sidebar-domain')];

  const openDomain = (domain, { exclusive = true } = {}) => {
    if (!domain) return;
    if (exclusive) {
      domains.forEach((other) => {
        if (other === domain) return;
        other.classList.remove('is-open');
        other.querySelector('.sidebar-domain-toggle')?.setAttribute('aria-expanded', 'false');
        const otherPanel = other.querySelector('.sidebar-domain-panel');
        if (otherPanel) otherPanel.hidden = true;
      });
    }
    domain.classList.add('is-open');
    domain.querySelector('.sidebar-domain-toggle')?.setAttribute('aria-expanded', 'true');
    const panel = domain.querySelector('.sidebar-domain-panel');
    if (panel) panel.hidden = false;
  };

  domains.forEach((domain) => {
    const toggle = domain.querySelector('.sidebar-domain-toggle');
    const panel = domain.querySelector('.sidebar-domain-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => {
      const isOpen = domain.classList.contains('is-open');
      if (isOpen) {
        domain.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
        return;
      }
      openDomain(domain);
    });
  });

  // Preserve the current branch across navigation and both sidebar modes.
  const activeDomain = domains.find((domain) => domain.classList.contains('is-active') && domain.querySelector('.sidebar-domain-panel'));
  if (activeDomain) openDomain(activeDomain);

  if (window.lucide?.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
})();
