(function(){
  const $=(id)=>document.getElementById(id);
  const gType=$('gType');
  const angle=$('angle');
  const addStop=$('addStop');
  const stops=$('stops');
  const preview=$('gPreview');
  const cssOut=$('cssOut');
  const copyCss=$('copyCss');
  const downloadPng=$('downloadPng');
  const downloadSvg=$('downloadSvg');

  function createStopRow(color='#1e90ff', pos=0){
    const row=document.createElement('div');
    row.className='stop-item';
    const colorInput=document.createElement('input');
    colorInput.type='text';
    colorInput.value=color;
    const pick=document.createElement('button');
    pick.textContent='색';
    pick.addEventListener('click',()=>{
      const input=document.createElement('input');
      input.type='color';
      input.value = ColorUtils.parseHex(colorInput.value) ? colorInput.value : '#1e90ff';
      input.addEventListener('input',()=>{ colorInput.value = input.value; render(); });
      input.click();
    });
    const range=document.createElement('input');
    range.type='number';
    range.min='0'; range.max='100'; range.value=String(pos);
    const del=document.createElement('button');
    del.textContent='삭제';
    del.addEventListener('click',()=>{ row.remove(); render(); });
    colorInput.addEventListener('change',render);
    range.addEventListener('change',render);
    row.append(colorInput,pick,range,del);
    return row;
  }

  function getStops(){
    const rows=[...stops.querySelectorAll('.stop-item')];
    return rows.map(r=>{
      const [colorEl, , posEl] = r.querySelectorAll('input');
      const hex = ColorUtils.parseHex(colorEl.value) ? colorEl.value : '#000000';
      let pos = parseFloat(posEl.value||'0');
      pos = Math.max(0, Math.min(100, pos));
      return { hex, pos };
    }).sort((a,b)=>a.pos-b.pos);
  }

  function cssString(){
    const type=gType.value;
    const a=parseFloat(angle.value||'0');
    const s=getStops();
    if(s.length<2) return '';
    const stopsStr=s.map(x=>`${x.hex} ${x.pos}%`).join(', ');
    if(type==='radial') return `radial-gradient(circle, ${stopsStr})`;
    return `linear-gradient(${a}deg, ${stopsStr})`;
  }

  function render(){
    const css = cssString();
    if(!css){ preview.style.background='transparent'; cssOut.textContent=''; return; }
    preview.style.background = css;
    cssOut.textContent = `background: ${css};`;
    syncUrl();
  }

  function syncUrl(){
    const url=new URL(location.href);
    url.searchParams.set('t', gType.value==='radial'?'r':'l');
    url.searchParams.set('a', String(parseFloat(angle.value||'0')));
    const s=getStops();
    // compact: hex (no #) and pos joined by . and ; between stops
    const enc = s.map(x=>`${x.hex.replace('#','')}.${x.pos}`).join(';');
    url.searchParams.set('s', enc);
    history.replaceState(null,'',url);
  }

  function initFromUrl(){
    const url=new URL(location.href);
    const t=url.searchParams.get('t')||'l';
    const a=url.searchParams.get('a')||'45';
    const s=url.searchParams.get('s')||'';
    gType.value = t==='r'?'radial':'linear';
    angle.value = a;
    stops.innerHTML='';
    const parts = s.split(';').filter(Boolean);
    if(parts.length>=2){
      parts.forEach(p=>{
        const [hex,pos]=p.split('.');
        stops.appendChild(createStopRow('#'+hex, parseFloat(pos||'0')));
      });
    } else {
      stops.appendChild(createStopRow('#1e90ff', 0));
      stops.appendChild(createStopRow('#ff6b6b', 100));
    }
  }

  addStop.addEventListener('click',()=>{ stops.appendChild(createStopRow('#cccccc', 50)); render(); });
  gType.addEventListener('change',()=>{ render(); });
  angle.addEventListener('change',()=>{ render(); });
  copyCss.addEventListener('click',()=>{ const css = cssString(); if(css){ navigator.clipboard.writeText(`background: ${css};`).then(()=>CT.showToast('CSS를 복사했습니다')); }});

  downloadSvg.addEventListener('click',()=>{
    const css = cssString(); if(!css) return;
    const w=800,h=260;
    // rasterize via foreignObject
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;background:${css}"></div></foreignObject></svg>`;
    const blob=new Blob([svg],{type:'image/svg+xml'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download='gradient.svg'; a.click(); URL.revokeObjectURL(a.href);
  });

  downloadPng.addEventListener('click',()=>{
    const css = cssString(); if(!css) return;
    const w=800,h=260;
    const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext('2d');
    // approximate: create linear or radial gradient in canvas
    const s=getStops();
    if(gType.value==='radial'){
      const grd=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)/2);
      s.forEach(st=>{ grd.addColorStop(st.pos/100, st.hex); });
      ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
    } else {
      const rad = (parseFloat(angle.value||'0')-90) * Math.PI/180;
      const x1=w/2 + Math.cos(rad)*w, y1=h/2 + Math.sin(rad)*h;
      const x0=w - x1, y0=h - y1;
      const grd=ctx.createLinearGradient(x0,y0,x1,y1);
      s.forEach(st=>{ grd.addColorStop(st.pos/100, st.hex); });
      ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
    }
    canvas.toBlob((blob)=>{
      if(!blob) return;
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob); a.download='gradient.png'; a.click(); URL.revokeObjectURL(a.href);
    });
  });

  initFromUrl();
  render();
})();

