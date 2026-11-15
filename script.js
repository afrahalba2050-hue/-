const $ = (id) => document.getElementById(id);

const seedPosts = [
  {id:"sample-1",name:"نورة",role:"طالبة",grade:"الخامس",kind:"كلمة تسامح",message:"أتسامح مع صديقتي إذا أخطأت في حقي، لأن الصداقة أغلى من الزعل.",likes:62,avatar:"👧🏻",sample:true,date:"١٦ نوفمبر"},
  {id:"sample-2",name:"أم دانة",role:"ولي أمر",grade:"—",kind:"رسالة شكر",message:"أغرس في ابنتي قيمة التسامح لأكون لها قدوة في العفو والمحبة.",likes:48,avatar:"👩🏻",sample:true,date:"١٦ نوفمبر"},
  {id:"sample-3",name:"أ. سارة",role:"معلمة",grade:"—",kind:"كلمة تسامح",message:"التسامح قوة بل هو جمال الروح ورقة القلب.",likes:34,avatar:"👩🏻‍🏫",sample:true,date:"١٦ نوفمبر"},
  {id:"sample-4",name:"سارة",role:"طالبة",grade:"الرابع",kind:"موقف إيجابي",message:"التسامح يجعل مدرستنا مليئة بالمحبة والاحترام.",likes:51,avatar:"👧🏼",sample:true,date:"١٦ نوفمبر"},
  {id:"sample-5",name:"رهف",role:"طالبة",grade:"السادس",kind:"رسالة اعتذار",message:"سامحت صديقتي بعد أن اعتذرت لي، وأصبحت علاقتنا أجمل من قبل.",likes:67,avatar:"👧🏻",sample:true,date:"١٦ نوفمبر"},
  {id:"sample-6",name:"أم لينا",role:"ولي أمر",grade:"—",kind:"دعوة للمحبة",message:"التسامح يعزز الروابط الأسرية ويعلم أبناءنا الرحمة وحسن التعامل مع الآخرين.",likes:40,avatar:"👩🏼",sample:true,date:"١٦ نوفمبر"}
];

let posts = loadPosts();
let adminMode = false;

function loadPosts(){
  try{
    const saved = JSON.parse(localStorage.getItem("tolerancePostsArabic") || "null");
    return Array.isArray(saved) ? saved : [...seedPosts];
  }catch(_){ return [...seedPosts]; }
}
function savePosts(){
  try{ localStorage.setItem("tolerancePostsArabic", JSON.stringify(posts)); }
  catch(_){ showToast("تعذر حفظ المشاركة في هذا المتصفح"); }
}
function safeText(value){
  return String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}
function renderPosts(){
  const query = $("searchPosts").value.trim().toLocaleLowerCase("ar");
  const grade = $("gradeFilter").value;
  const filtered = posts.filter(post => {
    const matchesGrade = grade === "الكل" || post.grade === grade;
    const haystack = `${post.name} ${post.role} ${post.kind} ${post.message}`.toLocaleLowerCase("ar");
    return matchesGrade && (!query || haystack.includes(query));
  });
  const grid = $("postsGrid");
  if(!filtered.length){
    grid.innerHTML = '<div class="empty-state">لا توجد مشاركات مطابقة، كوني أول من يشارك بكلمة جميلة 💗</div>';
    return;
  }
  grid.innerHTML = filtered.slice().reverse().map(post => `
    <article class="post-card">
      <div class="post-top">
        <div class="post-person">
          <span class="avatar" aria-hidden="true">${safeText(post.avatar || "🌷")}</span>
          <div><div class="post-name">${safeText(post.role)} · ${safeText(post.name)}</div>
          <div class="post-role">${safeText(post.grade === "—" ? "مجتمع المدرسة" : `الصف ${post.grade}`)}</div></div>
        </div>
        <span class="post-type">${safeText(post.kind)}</span>
      </div>
      <p class="post-message">${safeText(post.message)}</p>
      <div class="post-bottom">
        <button class="like-button" type="button" data-like="${safeText(post.id)}">♡ ${Number(post.likes)||0}</button>
        <span class="post-date">${safeText(post.date || "اليوم")}</span>
        ${adminMode ? `<button class="delete-button" type="button" data-delete="${safeText(post.id)}">حذف</button>` : ""}
      </div>
    </article>
  `).join("");
}
function showToast(message){
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}
function celebrate(){
  const layer = $("celebrationLayer");
  const decorations = ["🌸","🌷","🌼","🦋","💗","✿","🌺"];
  for(let i=0;i<46;i++){
    const item = document.createElement("span");
    item.className = "falling-flower";
    item.textContent = decorations[Math.floor(Math.random()*decorations.length)];
    item.style.left = `${Math.random()*100}%`;
    item.style.fontSize = `${18+Math.random()*23}px`;
    item.style.setProperty("--duration", `${3+Math.random()*2.3}s`);
    item.style.setProperty("--drift", `${-70+Math.random()*140}px`);
    item.style.animationDelay = `${Math.random()*1.1}s`;
    layer.appendChild(item);
    window.setTimeout(() => item.remove(), 6000);
  }
}
$("participationForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("participantName").value.trim();
  const message = $("message").value.trim();
  const kind = $("kind").value;
  if(!name || !message || !kind){ showToast("فضلاً أكَملي الحقول المطلوبة"); return; }
  const role = document.querySelector('input[name="role"]:checked')?.value || "طالبة";
  const grade = role === "طالبة" ? $("grade").value : "—";
  posts.push({
    id:`post-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,role,grade,kind,message,likes:0,
    avatar:role === "طالبة" ? "👧🏻" : role === "معلمة" ? "👩🏻‍🏫" : "👩🏻",
    date:new Intl.DateTimeFormat("ar-SA",{day:"numeric",month:"long"}).format(new Date()),
    sample:false
  });
  savePosts();
  renderPosts();
  event.target.reset();
  $("grade").value = "الرابع";
  celebrate();
  $("thankYou").scrollIntoView({behavior:"smooth",block:"center"});
  showToast("شكرًا لك! أضيفت مشاركتك إلى حائط التسامح 💗");
});
$("searchPosts").addEventListener("input", renderPosts);
$("gradeFilter").addEventListener("change", renderPosts);
$("postsGrid").addEventListener("click", event => {
  const likeId = event.target.closest("[data-like]")?.dataset.like;
  const deleteId = event.target.closest("[data-delete]")?.dataset.delete;
  if(likeId){
    const post = posts.find(item => item.id === likeId);
    if(post){ post.likes = (Number(post.likes)||0)+1; savePosts(); renderPosts(); }
  }
  if(deleteId && adminMode){
    const post = posts.find(item => item.id === deleteId);
    if(post && confirm("هل تريدين حذف هذه المشاركة؟")){
      posts = posts.filter(item => item.id !== deleteId);
      savePosts(); renderPosts(); showToast("تم حذف المشاركة");
    }
  }
});
$("adminButton").addEventListener("click", () => {
  const password = prompt("أدخلي كلمة مرور الإدارة التجريبية");
  if(password === "2468"){
    adminMode = true;
    $("adminBar").hidden = false;
    $("adminButton").textContent = "👑 وضع الإدارة";
    renderPosts();
    showToast("تم تفعيل وضع الإدارة التجريبي");
  }else if(password !== null){
    showToast("كلمة المرور غير صحيحة");
  }
});
$("logoutButton").addEventListener("click", () => {
  adminMode = false;
  $("adminBar").hidden = true;
  $("adminButton").textContent = "🔐 الإدارة";
  renderPosts();
});
document.querySelectorAll(".discover-card").forEach(button => {
  button.addEventListener("click", () => {
    $("dialogTitle").textContent = button.dataset.topic;
    $("dialogAnswer").textContent = button.dataset.answer;
    $("topicDialog").showModal();
  });
});
$("closeDialog").addEventListener("click", () => $("topicDialog").close());
$("topicDialog").addEventListener("click", event => {
  if(event.target === $("topicDialog")) $("topicDialog").close();
});
renderPosts();

// Seamless looping ticker: duplicate its messages so it never ends abruptly.
const tickerTrack = document.querySelector(".ticker-track");
if(tickerTrack){
  tickerTrack.innerHTML += tickerTrack.innerHTML;
  tickerTrack.setAttribute("aria-label","رسائل متحركة من مجتمع المدرسة");
}
