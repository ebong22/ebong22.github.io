// Color utilities: parse/format and convert between HEX, RGB, HSL, HSV

function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }

function parseHex(input){
  if(!input) return null;
  let s = String(input).trim().toLowerCase();
  if(s.startsWith('#')) s = s.slice(1);
  if(s.length === 3){ s = s.split('').map(c=>c+c).join(''); }
  if(!/^([0-9a-f]{6})$/.test(s)) return null;
  const r = parseInt(s.slice(0,2),16);
  const g = parseInt(s.slice(2,4),16);
  const b = parseInt(s.slice(4,6),16);
  return { r, g, b };
}

function formatHex({r,g,b}){
  const h = (n)=> n.toString(16).padStart(2,'0');
  return '#' + h(r) + h(g) + h(b);
}

function parseRgb(input){
  if(!input) return null;
  const s = String(input).trim().toLowerCase();
  const m = s.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
  if(!m) return null;
  const r = clamp(parseInt(m[1],10),0,255);
  const g = clamp(parseInt(m[2],10),0,255);
  const b = clamp(parseInt(m[3],10),0,255);
  return { r, g, b };
}

function formatRgb({r,g,b}){ return `rgb(${r}, ${g}, ${b})`; }

function rgbToHsl({r,g,b}){
  let r1=r/255,g1=g/255,b1=b/255;
  const max=Math.max(r1,g1,b1), min=Math.min(r1,g1,b1);
  let h,s,l=(max+min)/2;
  if(max===min){ h=s=0; }
  else{
    const d=max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r1: h=(g1-b1)/d+(g1<b1?6:0); break;
      case g1: h=(b1-r1)/d+2; break;
      case b1: h=(r1-g1)/d+4; break;
    }
    h*=60;
  }
  return { h: Math.round(h||0), s: Math.round(s*100), l: Math.round(l*100) };
}

function hslToRgb({h,s,l}){
  let H=(h%360+360)%360, S=s/100, L=l/100;
  if(S===0){
    const v=Math.round(L*255); return {r:v,g:v,b:v};
  }
  const q=L<0.5? L*(1+S): L+S-L*S;
  const p=2*L-q;
  const hk=H/360;
  const t=[hk+1/3,hk,hk-1/3];
  const rgb=t.map(tt=>{
    if(tt<0) tt+=1; if(tt>1) tt-=1;
    if(tt<1/6) return p+(q-p)*6*tt;
    if(tt<1/2) return q;
    if(tt<2/3) return p+(q-p)*(2/3-tt)*6;
    return p;
  }).map(v=>Math.round(v*255));
  return { r: rgb[0], g: rgb[1], b: rgb[2] };
}

function rgbToHsv({r,g,b}){
  let r1=r/255,g1=g/255,b1=b/255;
  const max=Math.max(r1,g1,b1), min=Math.min(r1,g1,b1);
  const d=max-min;
  const v=max;
  const s=max===0?0:d/max;
  let h=0;
  if(max!==min){
    switch(max){
      case r1: h=(g1-b1)/d+(g1<b1?6:0); break;
      case g1: h=(b1-r1)/d+2; break;
      case b1: h=(r1-g1)/d+4; break;
    }
    h*=60;
  }
  return { h: Math.round(h), s: Math.round(s*100), v: Math.round(v*100) };
}

function hsvToRgb({h,s,v}){
  let H=(h%360+360)%360, S=s/100, V=v/100;
  const c=V*S;
  const x=c*(1-Math.abs((H/60)%2-1));
  const m=V-c;
  let r1=0,g1=0,b1=0;
  if(H<60){r1=c;g1=x;b1=0}
  else if(H<120){r1=x;g1=c;b1=0}
  else if(H<180){r1=0;g1=c;b1=x}
  else if(H<240){r1=0;g1=x;b1=c}
  else if(H<300){r1=x;g1=0;b1=c}
  else{r1=c;g1=0;b1=x}
  return { r: Math.round((r1+m)*255), g: Math.round((g1+m)*255), b: Math.round((b1+m)*255) };
}

function parseHsl(input){
  if(!input) return null;
  const m = String(input).trim().toLowerCase().match(/hsl\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)/);
  if(!m) return null;
  return { h: parseFloat(m[1]), s: clamp(parseFloat(m[2]),0,100), l: clamp(parseFloat(m[3]),0,100) };
}

function parseHsv(input){
  if(!input) return null;
  const m = String(input).trim().toLowerCase().match(/hsv\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)/);
  if(!m) return null;
  return { h: parseFloat(m[1]), s: clamp(parseFloat(m[2]),0,100), v: clamp(parseFloat(m[3]),0,100) };
}

function toAllSpacesFromRgb(rgb){
  const hex=formatHex(rgb);
  const hsl=rgbToHsl(rgb);
  const hsv=rgbToHsv(rgb);
  return { hex, rgb: formatRgb(rgb), hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` };
}

function textColorForBackground(rgb){
  // relative luminance and contrast with white/black; pick better
  const lum = (c)=>{
    const srgb=[c.r,c.g,c.b].map(v=>v/255).map(v=> v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4));
    return srgb[0]*0.2126 + srgb[1]*0.7152 + srgb[2]*0.0722;
  };
  const L = lum(rgb);
  const contrastWithWhite = (1.0 + 0.05) / (L + 0.05);
  const contrastWithBlack = (L + 0.05) / (0.0 + 0.05);
  return contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000';
}

window.ColorUtils = { parseHex, parseRgb, parseHsl, parseHsv, formatHex, formatRgb, rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb, toAllSpacesFromRgb, textColorForBackground };

