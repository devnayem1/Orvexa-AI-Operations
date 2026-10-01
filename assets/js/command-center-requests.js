(() => {
  'use strict';

  const body = document.querySelector('[data-live-request-body]');
  const pagination = document.querySelector('[data-live-pagination]');
  if (!body || !pagination) return;

  const rows = [
    ['10:42:31','Support AI','headphones','Astra Reasoner X','user_92831','2,154','392 ms','good'],
    ['10:42:29','Document Intelligence','file-search','Meridian Core X','user_77123','1,842','612 ms','warn'],
    ['10:42:27','AI Contact Center','phone-call','Astra Reasoner X','user_55621','3,112','452 ms','good'],
    ['10:42:25','Growth Assistant','chart-no-axes-combined','Orbit Pro X','user_33456','1,256','298 ms','good'],
    ['10:42:23','Research Agent','shield-check','Meridian Core X','user_11293','952','187 ms','good'],
    ['10:42:21','Support AI','headphones','Astra Reasoner X','user_48120','2,406','418 ms','good'],
    ['10:42:19','AI Contact Center','phone-call','Orbit Pro X','user_66541','2,988','536 ms','good'],
    ['10:42:17','Document Intelligence','file-search','Meridian Core X','user_20488','1,614','584 ms','warn'],
    ['10:42:15','Research Agent','shield-check','Astra Reasoner X','user_84713','1,104','244 ms','good'],
    ['10:42:13','Growth Assistant','chart-no-axes-combined','Orbit Pro X','user_51804','1,428','326 ms','good'],
    ['10:42:11','Document Intelligence','file-search','Meridian Core X','user_73026','2,082','472 ms','good'],
    ['10:42:09','Support AI','headphones','Astra Reasoner X','user_39210','2,744','405 ms','good'],
    ['10:42:07','Growth Assistant','chart-no-axes-combined','Orbit Pro X','user_10475','1,337','315 ms','good'],
    ['10:42:05','AI Contact Center','phone-call','Astra Reasoner X','user_61942','3,284','648 ms','warn'],
    ['10:42:03','Research Agent','shield-check','Meridian Core X','user_25118','1,018','206 ms','good']
  ];

  const pageSize = 5;
  const totalPages = Math.ceil(rows.length / pageSize);
  let currentPage = 1;

  const summary = pagination.querySelector('[data-live-page-summary]');
  const prev = pagination.querySelector('[data-live-page-prev]');
  const next = pagination.querySelector('[data-live-page-next]');
  const pageButtons = [...pagination.querySelectorAll('[data-live-page]')];

  const render = () => {
    const start = (currentPage - 1) * pageSize;
    const pageRows = rows.slice(start, start + pageSize);
    body.innerHTML = pageRows.map(([time, app, icon, model, user, tokens, latency, latencyTone]) => `
      <tr>
        <td class="cc25-time">${time}</td>
        <td><span class="cc25-app-cell"><i><svg data-lucide="${icon}"></svg></i>${app}</span></td>
        <td>${model}</td>
        <td>${user}</td>
        <td>${tokens}</td>
        <td class="cc25-latency ${latencyTone}">${latency}</td>
        <td><span class="cc25-status success">Success</span></td>
      </tr>`).join('');

    const end = Math.min(start + pageSize, rows.length);
    if (summary) summary.textContent = `${start + 1}–${end} of ${rows.length}`;
    prev.disabled = currentPage === 1;
    next.disabled = currentPage === totalPages;
    pageButtons.forEach((button) => {
      const active = Number(button.dataset.livePage) === currentPage;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });

    if (window.lucide?.createIcons) window.lucide.createIcons();
  };

  pageButtons.forEach((button) => button.addEventListener('click', () => {
    currentPage = Number(button.dataset.livePage) || 1;
    render();
  }));
  prev.addEventListener('click', () => {
    if (currentPage > 1) { currentPage -= 1; render(); }
  });
  next.addEventListener('click', () => {
    if (currentPage < totalPages) { currentPage += 1; render(); }
  });

  render();
})();
