(function(){
  const $ = (id)=>document.getElementById(id);
  const baseColor=$('baseColor');
  const pickBase=$('pickBase');
  const harmony=$('harmony');
  const stepsEl=$('steps');
  const generateBtn=$('generate');
  const harmonyWrap=$('harmonySwatches');
  const scaleWrap=$('scale');
  const copyCss=$('copyCss');
  const copyJson=$('copyJson');
  const downloadSvg=$('downloadSvg');

  function mod(n,m){ return ((n % m) + m) % m; }

  function rotateHue(rgb, delta){
    const hsl = ColorUtils.rgbToHsl(rgb);
    hsl.h = mod(hsl.h + delta, 360);
    return ColorUtils.hslToRgb(hsl);
  }

  function harmonyColors(rgb, type){
    // returns array of rgb objects including base
    if(type==='complementary') return [rgb, rotateHue(rgb,180)];
    if(type==='analogous') return [rotateHue(rgb,-30), rgb, rotateHue(rgb,30)];
    if(type==='triadic') return [rgb, rotateHue(rgb,120), rotateHue(rgb,240)];
    if(type==='tetradic') return [rgb, rotateHue(rgb,90), rotateHue(rgb,180), rotateHue(rgb,270)];
    return [rgb];
  }

  function lighten(rgb, amount){
    const hsl = ColorUtils.rgbToHsl(rgb);
    hsl.l = Math.max(0, Math.min(100, hsl.l + amount));
    return ColorUtils.hslToRgb(hsl);
  }

  function scaleFromBase(rgb, steps){
    // produces light to dark scale around base
    // find base lightness
    const baseHsl = ColorUtils.rgbToHsl(rgb);
    const minL = 8, maxL = 96; // boundaries
    const indices = Array.from({length:steps}, (_,i)=>i);
    return indices.map(i=>{
      const t = i/(steps-1);
      const l = Math.round(maxL + (minL - maxL) * t);
      const hsl = { h: baseHsl.h, s: baseHsl.s, l };
      return ColorUtils.hslToRgb(hsl);
    });
  }

  function renderSwatches(list, target, large=false, labels){
    target.innerHTML='';
    list.forEach((rgb, idx)=>{
      const hex = ColorUtils.formatHex(rgb);
      if(large){
        const d=document.createElement('div');
        d.className='swatch-large';
        d.style.background=hex;
        d.style.color=ColorUtils.textColorForBackground(rgb);
        d.innerHTML = `<span>${labels?labels[idx]:''}</span><span>${hex}</span>`;
        target.appendChild(d);
      } else {
        const d=document.createElement('div');
        d.className='scale-cell';
        d.style.background=hex;
        d.style.color=ColorUtils.textColorForBackground(rgb);
        const weight = labels? labels[idx] : '';
        d.innerHTML = `<span>${weight}</span><span>${hex}</span>`;
        target.appendChild(d);
      }
    });
  }

  function weightsForSteps(n){
    // Tailwind-like weights from 50 to 900
    const base=[50,100,200,300,400,500,600,700,800,900];
    if(n===10) return base;
    const step=Math.round(900/(n));
    return Array.from({length:n},(_,i)=> (i===0?50: Math.min(900, (i+1)*step)));
  }

  function generate(){
    const baseRgb = ColorUtils.parseHex(baseColor.value) || ColorUtils.parseRgb(baseColor.value);
    if(!baseRgb){ CT.showToast('기본색을 확인해주세요'); return; }
    const hType = harmony.value;
    const steps = Math.max(5, Math.min(12, parseInt(stepsEl.value||'10',10)));

    const hColors = harmonyColors(baseRgb, hType);
    const labels = hColors.map((_,i)=>({complementary:['Base','Comp'], analogous:['A-','Base','A+'], triadic:['T1','T2','T3'], tetradic:['T1','T2','T3','T4']})[hType][i] || '');
    renderSwatches(hColors, harmonyWrap, true, labels);

    const scale = scaleFromBase(baseRgb, steps);
    renderSwatches(scale, scaleWrap, false, weightsForSteps(steps));

    stateToUrl(baseRgb, hType, steps);
  }

  function stateToUrl(rgb, type, steps){
    const url=new URL(location.href);
    url.searchParams.set('c', ColorUtils.formatHex(rgb).slice(1));
    url.searchParams.set('h', type);
    url.searchParams.set('n', String(steps));
    history.replaceState(null,'',url);
  }

  function initFromUrl(){
    const url=new URL(location.href);
    const c=url.searchParams.get('c') || '4f46e5';
    const type=url.searchParams.get('h') || 'analogous';
    const n=parseInt(url.searchParams.get('n')||'10',10);
    baseColor.value = '#'+c;
    harmony.value = type;
    stepsEl.value = String(n);
  }

  generateBtn.addEventListener('click', generate);
  copyCss.addEventListener('click',()=>{
    const url=new URL(location.href);
    const rgb = ColorUtils.parseHex(url.searchParams.get('c'));
    const steps = Math.max(5, Math.min(12, parseInt(url.searchParams.get('n')||'10',10)));
    if(!rgb) return;
    const scale=scaleFromBase(rgb, steps);
    const weights=weightsForSteps(steps);
    const lines = scale.map((rgb,i)=> `  --color-${weights[i]}: ${ColorUtils.formatHex(rgb)};`).join('\n');
    const css = `:root{\n${lines}\n}`;
    navigator.clipboard.writeText(css).then(()=>CT.showToast('CSS 변수를 복사했습니다'));
  });
  copyJson.addEventListener('click',()=>{
    const url=new URL(location.href);
    const rgb = ColorUtils.parseHex(url.searchParams.get('c'));
    const steps = Math.max(5, Math.min(12, parseInt(url.searchParams.get('n')||'10',10)));
    if(!rgb) return;
    const scale=scaleFromBase(rgb, steps).map(c=>ColorUtils.formatHex(c));
    const weights=weightsForSteps(steps);
    const obj={}; weights.forEach((w,i)=> obj[w]=scale[i]);
    navigator.clipboard.writeText(JSON.stringify(obj,null,2)).then(()=>CT.showToast('JSON을 복사했습니다'));
  });
  downloadSvg.addEventListener('click',()=>{
    const url=new URL(location.href);
    const rgb = ColorUtils.parseHex(url.searchParams.get('c'));
    const steps = Math.max(5, Math.min(12, parseInt(url.searchParams.get('n')||'10',10)));
    if(!rgb) return;
    const scale=scaleFromBase(rgb, steps).map(c=>ColorUtils.formatHex(c));
    const width=steps*64, height=64;
    let rects='';
    scale.forEach((hex,i)=>{ rects += `<rect x="${i*64}" y="0" width="64" height="64" fill="${hex}"/>`; });
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${rects}</svg>`;
    const blob = new Blob([svg], {type:'image/svg+xml'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='palette.svg';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  if(pickBase){
    pickBase.addEventListener('click',()=>{
      const input=document.createElement('input');
      input.type='color';
      input.value= baseColor.value && ColorUtils.parseHex(baseColor.value) ? baseColor.value : '#4f46e5';
      input.addEventListener('input',()=>{ baseColor.value=input.value; });
      input.addEventListener('change',()=> generate());
      input.click();
    });
  }

  initFromUrl();
  generate();
})();

