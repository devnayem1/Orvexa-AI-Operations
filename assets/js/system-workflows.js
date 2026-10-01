(() => {
  'use strict';
  const page=document.body.dataset.systemPage;if(!page)return;
  if(page==='settings'){document.addEventListener('keydown',(event)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){const save=document.querySelector('[data-save-settings]');if(save){event.preventDefault();save.click();}}});window.addEventListener('hashchange',()=>{const key=location.hash.replace('#','');document.querySelector(`[data-settings-tab="${CSS.escape(key)}"]`)?.click();});}
  if(page==='notification-center'){document.addEventListener('keydown',(event)=>{if(event.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')){const search=document.querySelector('[data-notification-search]');if(search){event.preventDefault();search.focus();}}});}
})();
