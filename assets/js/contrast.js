(function(){
  const $ = (id)=>document.getElementById(id);
  const fgInput=$('fgInput');
  const bgInput=$('bgInput');
  const fontSize=$('fontSize');
  const isBold=$('isBold');
  const ratioEl=$('ratio');
  const gradeEl=$('grade');
  const preview=$('contrastPreview');
  const applyBtn=$('applyContrast');
  const swapBtn=$('swapColors');

  function srgbToLin(v){
    const s=v/255;
    return s<=0.03928? s/12.92 : Math.pow((s+0.055)/1.055,2.4);
  }

  function relativeLuminance(rgb){
    return 0.2126*srgbToLin(rgb.r) + 0.7152*srgbToLin(rgb.g) + 0.0722*srgbToLin(rgb.b);
  }

  function contrastRatio(a,b){
    const L1 = Math.max(relativeLuminance(a), relativeLuminance(b));
    const L2 = Math.min(relativeLuminance(a), relativeLuminance(b));
    return (L1+0.05)/(L2+0.05);
  }

  function isLargeText(px, bold){
    // WCAG: large if >= 18pt normal (~24px) or >= 14pt bold (~18.67px)
    const threshold = bold ? 18.67 : 24.0;
    return px >= threshold;
  }

  function gradeForRatio(ratio, large){
    if(large){
      if(ratio >= 4.5) return {label:'AAA (Large)', pass:true};
      if(ratio >= 3.0) return {label:'AA (Large)', pass:true};
      return {label:'Fail', pass:false};
    } else {
      if(ratio >= 7.0) return {label:'AAA', pass:true};
      if(ratio >= 4.5) return {label:'AA', pass:true};
      return {label:'Fail', pass:false};
    }
  }

  function apply(){
    const fg = ColorUtils.parseHex(fgInput.value) || ColorUtils.parseRgb(fgInput.value);
    const bg = ColorUtils.parseHex(bgInput.value) || ColorUtils.parseRgb(bgInput.value);
    if(!fg || !bg){ CT.showToast('색 입력을 확인해주세요'); return; }
    const r = contrastRatio(fg,bg);
    const large = isLargeText(parseFloat(fontSize.value||'16'), !!isBold.checked);
    const g = gradeForRatio(r, large);
    ratioEl.textContent = r.toFixed(2)+':1';
    gradeEl.textContent = g.label;
    gradeEl.classList.remove('pass','fail');
    gradeEl.classList.add(g.pass?'pass':'fail');
    preview.style.background = ColorUtils.formatHex(bg);
    preview.style.color = ColorUtils.formatHex(fg);
    preview.style.fontWeight = isBold.checked? '700':'400';
    preview.style.fontSize = (fontSize.value||'16')+'px';
  }

  applyBtn.addEventListener('click', apply);
  swapBtn.addEventListener('click', ()=>{
    const f=fgInput.value; fgInput.value=bgInput.value; bgInput.value=f; apply();
  });

  function init(){
    const url = new URL(location.href);
    const f = url.searchParams.get('fg') || '#111111';
    const b = url.searchParams.get('bg') || '#ffffff';
    const size = url.searchParams.get('fs') || '16';
    const bold = url.searchParams.get('b') === '1';
    fgInput.value=f; bgInput.value=b; fontSize.value=size; isBold.checked=bold;
    apply();
  }

  init();
})();

