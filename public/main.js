const $ = (s)=>document.querySelector(s);
const loginBtn = $('#loginBtn');
const logoutBtn = $('#logoutBtn');
const loginCard = $('#login-card');
const shortenCard = $('#shorten-card');
const myUrls = $('#my-urls');
const list = $('#list');
const result = $('#result');
const yearEl = $('#year');
yearEl.textContent = new Date().getFullYear();

async function getMe(){
  const res = await fetch('/api/me');
  if(res.ok){
    const data = await res.json();
    return data.user;
  }
  return null;
}

function setAuthUI(isAuthed){
  if(isAuthed){
    loginBtn.style.display='none';
    logoutBtn.style.display='inline-flex';
    loginCard.style.display='none';
    shortenCard.style.display='block';
    myUrls.style.display='block';
    loadMyUrls();
  }else{
    loginBtn.style.display='inline-flex';
    logoutBtn.style.display='none';
    loginCard.style.display='none';
    shortenCard.style.display='none';
    myUrls.style.display='none';
  }
}

loginBtn.addEventListener('click',()=>{
  loginCard.style.display = loginCard.style.display==='none'?'block':'none';
});

logoutBtn.addEventListener('click',async()=>{
  await fetch('/api/logout',{method:'POST'});
  setAuthUI(false);
});

$('#loginForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const form = e.target;
  const username = form.username.value.trim();
  const password = form.password.value;
  const res = await fetch('/api/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username,password})
  });
  if(res.ok){
    setAuthUI(true);
    loginCard.style.display='none';
  }else{
    alert('Sai tài khoản hoặc mật khẩu');
  }
});

$('#shortenForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const form = e.target;
  const url = form.url.value.trim();
  const customCode = form.customCode.value.trim();
  const res = await fetch('/api/shorten',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({url, customCode: customCode || undefined})
  });
  const data = await res.json();
  if(res.ok){
    result.style.display='block';
    result.innerHTML = `Link rút gọn: <a href="${data.shortUrl}" target="_blank" rel="noopener" class="mono">${data.shortUrl}</a>`;
    form.reset();
    loadMyUrls();
  }else{
    alert(data.error || 'Có lỗi xảy ra');
  }
});

async function loadMyUrls(){
  const res = await fetch('/api/my-urls');
  if(!res.ok){
    list.innerHTML = '';
    return;
  }
  const data = await res.json();
  list.innerHTML = '';
  data.urls.forEach(item=>{
    const el = document.createElement('div');
    el.className='item';
    el.innerHTML = `
      <div class="meta">
        <span>Ngắn: <a class="mono" href="${item.shortUrl}" target="_blank">${item.shortUrl}</a></span>
        <span>Gốc: <span class="mono">${item.url}</span></span>
      </div>
      <button class="btn" data-copy="${item.shortUrl}">Copy</button>
    `;
    el.querySelector('button').addEventListener('click',()=>{
      navigator.clipboard.writeText(item.shortUrl);
      el.querySelector('button').textContent='Đã copy';
      setTimeout(()=>{ el.querySelector('button').textContent='Copy'; },1200);
    });
    list.appendChild(el);
  });
}

(async function init(){
  const me = await getMe();
  setAuthUI(!!me);
})();


