(function(){
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const stored = localStorage.getItem('ct-theme');
  const initial = stored || (prefersLight ? 'light' : 'dark');
  if(initial==='light') document.documentElement.classList.add('light');

  const btn=document.getElementById('themeToggle');
  if(btn){
    btn.addEventListener('click',()=>{
      const isLight = document.documentElement.classList.toggle('light');
      localStorage.setItem('ct-theme', isLight ? 'light' : 'dark');
    });
  }
  // i18n init if present
  if(window.CT_I18N){ window.CT_I18N.initI18n(); }
})();

function showToast(msg){
  const el=document.getElementById('toast');
  if(!el) return;
  el.textContent=msg;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),1400);
}

window.CT = { showToast };

