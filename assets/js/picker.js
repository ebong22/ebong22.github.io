(function(){
  const $ = (id)=>document.getElementById(id);
  const hexInput = $('hexInput');
  const rgbInput = $('rgbInput');
  const hslInput = $('hslInput');
  const hsvInput = $('hsvInput');
  const preview = $('preview');
  const recent = $('recent');
  const pickBtn = $('pickColor');
  const eyeBtn = $('eyeDrop');

  const RECENT_KEY = 'ct-recent-colors';

  function setPreview(rgb){
    preview.style.background = ColorUtils.formatHex(rgb);
    const text = ColorUtils.textColorForBackground(rgb);
    preview.style.color = text;
    preview.textContent = ColorUtils.formatHex(rgb);
  }

  function applyAll(rgb, pushHistory=true){
    const {hex, rgb:rgbStr, hsl, hsv} = ColorUtils.toAllSpacesFromRgb(rgb);
    hexInput.value = hex;
    rgbInput.value = rgbStr;
    hslInput.value = hsl;
    hsvInput.value = hsv;
    setPreview(rgb);
    if(pushHistory){
      const url = new URL(location.href);
      url.searchParams.set('c', hex.replace('#',''));
      history.replaceState(null,'',url);
    }
  }

  function addRecent(hex){
    const arr = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    const v = hex.toLowerCase();
    const next = [v, ...arr.filter(x=>x!==v)].slice(0,20);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    renderRecent();
  }

  function renderRecent(){
    const arr = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    recent.innerHTML = '';
    arr.forEach(hex=>{
      const rgb = ColorUtils.parseHex(hex);
      if(!rgb) return;
      const d = document.createElement('button');
      d.className='swatch';
      d.style.background=hex;
      d.title=hex;
      d.addEventListener('click',()=>{
        applyAll(rgb);
      });
      recent.appendChild(d);
    });
  }

  function fromHexInput(){
    const rgb = ColorUtils.parseHex(hexInput.value);
    if(rgb){ applyAll(rgb); addRecent(ColorUtils.formatHex(rgb)); }
  }

  function fromRgbInput(){
    const rgb = ColorUtils.parseRgb(rgbInput.value);
    if(rgb){ applyAll(rgb); addRecent(ColorUtils.formatHex(rgb)); }
  }

  function fromHslInput(){
    const hsl = ColorUtils.parseHsl(hslInput.value);
    if(hsl){ const rgb = ColorUtils.hslToRgb(hsl); applyAll(rgb); addRecent(ColorUtils.formatHex(rgb)); }
  }

  function fromHsvInput(){
    const hsv = ColorUtils.parseHsv(hsvInput.value);
    if(hsv){ const rgb = ColorUtils.hsvToRgb(hsv); applyAll(rgb); addRecent(ColorUtils.formatHex(rgb)); }
  }

  hexInput.addEventListener('change', fromHexInput);
  rgbInput.addEventListener('change', fromRgbInput);
  hslInput.addEventListener('change', fromHslInput);
  hsvInput.addEventListener('change', fromHsvInput);

  document.querySelectorAll('[data-copy]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const type=btn.getAttribute('data-copy');
      const map={hex:hexInput.value, rgb:rgbInput.value, hsl:hslInput.value};
      const text=map[type]||'';
      navigator.clipboard.writeText(text).then(()=>CT.showToast('복사되었습니다'));
    });
  });

  if(pickBtn && window.showOpenFilePicker===undefined && window.EyeDropper===undefined){
    // Nothing special to do; feature detection below
  }

  if(pickBtn){
    pickBtn.addEventListener('click', async ()=>{
      try{
        const input = document.createElement('input');
        input.type='color';
        input.value = hexInput.value && ColorUtils.parseHex(hexInput.value) ? hexInput.value : '#1e90ff';
        input.addEventListener('input',()=>{
          const rgb = ColorUtils.parseHex(input.value);
          if(rgb){ applyAll(rgb); addRecent(ColorUtils.formatHex(rgb)); }
        });
        input.click();
      }catch(e){
        CT.showToast('브라우저에서 지원되지 않습니다');
      }
    });
  }

  if(eyeBtn){
    eyeBtn.addEventListener('click', async ()=>{
      if(!('EyeDropper' in window)){
        CT.showToast('스포이드 미지원 브라우저');
        return;
      }
      try{
        const ed = new window.EyeDropper();
        const res = await ed.open();
        const rgb = ColorUtils.parseHex(res.sRGBHex);
        if(rgb){ applyAll(rgb); addRecent(ColorUtils.formatHex(rgb)); }
      }catch(e){ /* user cancelled */ }
    });
  }

  function initFromQuery(){
    const url = new URL(location.href);
    const c = url.searchParams.get('c');
    const rgb = ColorUtils.parseHex(c);
    if(rgb){ applyAll(rgb, false); }
    else{ applyAll({r:30,g:144,b:255}, false); }
  }

  renderRecent();
  initFromQuery();
})();

