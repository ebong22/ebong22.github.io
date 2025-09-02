// Tintly header include script
(function(){
  var placeholder = document.getElementById('header-placeholder');
  if(!placeholder) return;
  var headerPath = 'header.html';
  // fetch 방식: 서버 환경에서만 동작
  fetch(headerPath).then(r=>r.text()).then(function(html){
    placeholder.innerHTML = html;
  }).catch(function(){
    // Fallback: 파일 환경에서는 안내 메시지
    placeholder.innerHTML = '<header class="site-header" style="background:#111;color:#fff;padding:18px;text-align:center;font-size:1.2rem;font-weight:700;">Tintly 헤더는 로컬 서버에서만 정상 표시됩니다.</header>';
  });
})();
