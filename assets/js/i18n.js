(function(){
  const MESSAGES={
    ko:{
      app_title:'Color Tools',
      nav_picker:'Color Picker', nav_palette:'Palette', nav_contrast:'Contrast', nav_gradient:'Gradient',
      hero_title:'색상 도구 세트', hero_sub:'컬러 피커, 팔레트 생성, 대비 체크, 그라디언트를 간편하게.',
      picker_input:'입력', picker_preview:'미리보기', picker_recent:'최근 사용 색', picker_system:'시스템 피커', picker_eyedrop:'스포이드', picker_copy_hex:'HEX 복사', picker_copy_rgb:'RGB 복사', picker_copy_hsl:'HSL 복사',
      palette_input:'입력', palette_palette:'팔레트', palette_scale:'스케일', palette_generate:'생성', palette_copy_css:'CSS 변수 복사', palette_copy_json:'JSON 복사', palette_download_svg:'SVG 다운로드',
      contrast_input:'입력', contrast_result:'결과', contrast_ratio:'대비비율', contrast_grade:'등급', contrast_calc:'계산', contrast_swap:'색 교체',
      gradient_input:'입력', gradient_preview:'미리보기', gradient_add_stop:'스탑 추가', gradient_copy_css:'CSS 복사', gradient_download_png:'PNG 다운로드', gradient_download_svg:'SVG 다운로드'
    },
    en:{
      app_title:'Color Tools',
      nav_picker:'Color Picker', nav_palette:'Palette', nav_contrast:'Contrast', nav_gradient:'Gradient',
      hero_title:'Color Tools Suite', hero_sub:'Color picker, palette, contrast checker, and gradient generator.',
      picker_input:'Input', picker_preview:'Preview', picker_recent:'Recent Colors', picker_system:'System Picker', picker_eyedrop:'Eyedropper', picker_copy_hex:'Copy HEX', picker_copy_rgb:'Copy RGB', picker_copy_hsl:'Copy HSL',
      palette_input:'Input', palette_palette:'Palette', palette_scale:'Scale', palette_generate:'Generate', palette_copy_css:'Copy CSS Vars', palette_copy_json:'Copy JSON', palette_download_svg:'Download SVG',
      contrast_input:'Input', contrast_result:'Result', contrast_ratio:'Contrast Ratio', contrast_grade:'Grade', contrast_calc:'Calculate', contrast_swap:'Swap',
      gradient_input:'Input', gradient_preview:'Preview', gradient_add_stop:'Add Stop', gradient_copy_css:'Copy CSS', gradient_download_png:'Download PNG', gradient_download_svg:'Download SVG'
    }
  };

  function applyI18n(lang){
    const dict = MESSAGES[lang] || MESSAGES.ko;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key=el.getAttribute('data-i18n');
      if(dict[key]) el.textContent = dict[key];
    });
    const html=document.documentElement;
    html.lang = lang==='en'?'en':'ko';
    localStorage.setItem('ct-lang', html.lang);
  }

  function initI18n(){
    const stored = localStorage.getItem('ct-lang');
    const lang = stored || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'ko');
    const select = document.getElementById('langSelect');
    if(select){ select.value=lang; select.addEventListener('change',()=> applyI18n(select.value)); }
    applyI18n(lang);
  }

  window.CT_I18N = { initI18n, applyI18n };
})();

