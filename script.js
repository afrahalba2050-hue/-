
/* ==========================================
   التسامح يجمعنا 🌸
   الربط مع Supabase
========================================== */

const $ = (id) => document.getElementById(id);

/* إعداد Supabase */
const SUPABASE_URL = "https://yotclzdzubehrvwhomvp.supabase.co";
const SUPABASE_KEY = "sb_publishable_-G7SyGcyADAAots5Y-_Mhg_WTVCxaW6";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* المشاركات النموذجية */
const seedPosts = [
  {id:"sample-1",name:"نورة",role:"طالبة",grade:"الخامس",kind:"كلمة تسامح",message:"أتسامح مع صديقتي إذا أخطأت في حقي، لأن الصداقة أغلى من الزعل.",likes:62,avatar:"👧🏻",sample:true,date:"١٦ نوفمبر"},
  {id:"sample-2",name:"أم دانة",role:"ولي أمر",grade:"—",kind:"رسالة شكر",message:"أغرس في ابنتي قيمة التسامح لأكون لها قدوة في العفو والمحبة.",likes:48,avatar:"👩🏻",sample:true,date:"١٦ نوفمبر"},
  {id:"sample-3",name:"أ. سارة",role:"معلمة",grade:"—",kind:"كلمة تسامح",message:"التسامح قوة بل هو جمال الروح ورقة القلب.",likes:34,avatar:"👩🏻‍🏫",sample:true,date:"١٦ نوفمبر"},
  {id:"sample-4",name:"سارة",role:"طالبة",grade:"الرابع",kind:"موقف إيجابي",message:"التسامح يجعل مدرستنا مليئة بالمحبة والاحترام.",likes:51,avatar:"👧🏼",sample:true,date:"١٦ نوفمبر"},
  {id:"sample-5",name:"رهف",role:"طالبة",grade:"السادس",kind:"رسالة اعتذار",message:"سامحت صديقتي بعد أن اعتذرت لي، وأصبحت علاقتنا أجمل من قبل.",likes:67,avatar:"👧🏻",sample:true,date:"١٦ نوفمبر"},
  {id:"sample-6",name:"أم لينا",role:"ولي أمر",grade:"—",kind:"دعوة للمحبة",message:"التسامح يعزز الروابط الأسرية ويعلم أبناءنا الرحمة وحسن التعامل مع الآخرين.",likes:40,avatar:"👩🏼",sample:true,date:"١٦ نوفمبر"}
];

let posts = [...seedPosts];
let adminMode = false;

/* حماية النصوص */
function safeText(value){
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}

/* رسالة التنبيه */
function showToast(message){
  const toast = $("toast");
  if(!toast){
    alert(message);
    return;
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"),2600);
}

/* شكل الصورة الرمزية */
function getAvatar(role){
  if(role === "طالبة") return "👧🏻";
  if(role === "معلمة") return "👩🏻‍🏫";
  return "👩🏻";
}

/* تنسيق التاريخ */
function formatDate(date){
  if(!date) return "اليوم";
  return new Intl.DateTimeFormat("ar-SA",{
    day:"numeric",
    month:"long"
  }).format(new Date(date));
}

/* تحويل مشاركات قاعدة البيانات */
function convertPost(row){
  return {
    id:String(row.id),
    name:row.name,
    role:row.role,
    grade:row.grade || "—",
    kind:row.message_type || "كلمة تسامح",
    message:row.message,
    likes:0,
    avatar:getAvatar(row.role),
    sample:false,
    date:formatDate(row.created_at)
  };
}

/* تحميل المشاركات */
async function loadPosts(){
  const {data,error} = await db
    .from("tolerance_posts")
    .select("*")
    .order("created_at",{ascending:true});

  if(error){
    console.error(error);
    showToast("تعذر تحميل المشاركات");
    return;
  }

  posts = [...seedPosts,...(data || []).map(convertPost)];
  renderPosts();
}

/* عرض المشاركات */
function renderPosts(){
  const grid = $("postsGrid");
  if(!grid) return;

  const query = ($("searchPosts")?.value || "")
    .trim()
    .toLocaleLowerCase("ar");

  const grade = $("gradeFilter")?.value || "الكل";

  const filtered = posts.filter(post => {
    const matchesGrade =
      grade === "الكل" || post.grade === grade;

    const haystack =
      `${post.name} ${post.role} ${post.kind} ${post.message}`
      .toLocaleLowerCase("ar");

    return matchesGrade &&
      (!query || haystack.includes(query));
  });

  if(!filtered.length){
    grid.innerHTML =
      '<div class="empty-state">لا توجد مشاركات مطابقة، كوني أول من يشارك بكلمة جميلة 💗</div>';
    return;
  }

  grid.innerHTML = filtered.slice().reverse().map(post => `
    <article class="post-card">
      <div class="post-top">
        <div class="post-person">
          <span class="avatar">${safeText(post.avatar)}</span>
          <div>
            <div class="post-name">
              ${safeText(post.role)} · ${safeText(post.name)}
            </div>
            <div class="post-role">
              ${safeText(post.grade === "—"
                ? "مجتمع المدرسة"
                : `الصف ${post.grade}`)}
            </div>
          </div>
        </div>
        <span class="post-type">${safeText(post.kind)}</span>
      </div>

      <p class="post-message">${safeText(post.message)}</p>

      <div class="post-bottom">
        <span class="like-button">♡ ${Number(post.likes)||0}</span>
        <span class="post-date">${safeText(post.date)}</span>
        ${
          adminMode && !post.sample
          ? `<button class="delete-button"
              data-delete="${safeText(post.id)}">حذف</button>`
          : ""
        }
      </div>
    </article>
  `).join("");
}

/* تأثير الزهور */
function celebrate(){
  const layer = $("celebrationLayer");
  if(!layer) return;

  const decorations = ["🌸","🌷","🌼","🦋","💗","✿","🌺"];

  for(let i=0;i<46;i++){
    const item = document.createElement("span");
    item.className = "falling-flower";
    item.textContent =
      decorations[Math.floor(Math.random()*decorations.length)];

    item.style.left = `${Math.random()*100}%`;
    item.style.fontSize = `${18+Math.random()*23}px`;
    item.style.setProperty("--duration",`${3+Math.random()*2.3}s`);
    item.style.setProperty("--drift",`${-70+Math.random()*140}px`);
    item.style.animationDelay = `${Math.random()*1.1}s`;

    layer.appendChild(item);
    setTimeout(()=>item.remove(),6000);
  }
}

/* إرسال المشاركة */
$("participationForm")?.addEventListener("submit",async event=>{
  event.preventDefault();

  const name = $("participantName").value.trim();
  const message = $("message").value.trim();
  const kind = $("kind").value;

  if(!name || !message || !kind){
    showToast("فضلاً أكَملي الحقول المطلوبة");
    return;
  }

  const role =
    document.querySelector('input[name="role"]:checked')?.value
    || "طالبة";

  const grade =
    role === "طالبة" ? $("grade").value : null;

  const button = event.submitter;
  if(button) button.disabled = true;

  try{
    const {error} = await db
      .from("tolerance_posts")
      .insert([{
        name,
        role,
        grade,
        message_type:kind,
        message
      }]);

    if(error) throw error;

    await loadPosts();

    event.target.reset();
    $("grade").value = "الرابع";

    celebrate();
    $("thankYou")?.scrollIntoView({
      behavior:"smooth",
      block:"center"
    });

    showToast("شكرًا لك! وصلت مشاركتك إلى حائط التسامح 💗");

  }catch(error){
    console.error(error);
    showToast("تعذر إرسال المشاركة، تأكدي من إعدادات قاعدة البيانات");
  }finally{
    if(button) button.disabled = false;
  }
});

/* البحث */
$("searchPosts")?.addEventListener("input",renderPosts);

/* التصفية */
$("gradeFilter")?.addEventListener("change",renderPosts);

/* الإدارة التجريبية */
$("adminButton")?.addEventListener("click",()=>{
  const password = prompt("أدخلي كلمة مرور الإدارة");

  if(password === "2468"){
    adminMode = true;
    $("adminBar").hidden = false;
    $("adminButton").textContent = "👑 وضع الإدارة";
    renderPosts();
    showToast("تم فتح وضع الإدارة");
  }else if(password !== null){
    showToast("كلمة المرور غير صحيحة");
  }
});

$("logoutButton")?.addEventListener("click",()=>{
  adminMode = false;
  $("adminBar").hidden = true;
  $("adminButton").textContent = "🔐 الإدارة";
  renderPosts();
});

/* حذف المشاركات من قاعدة البيانات */
$("postsGrid")?.addEventListener("click",async event=>{
  const id = event.target.closest("[data-delete]")?.dataset.delete;

  if(!id || !adminMode) return;
  if(!confirm("هل تريدين حذف هذه المشاركة؟")) return;

  const {error} = await db
    .from("tolerance_posts")
    .delete()
    .eq("id",Number(id));

  if(error){
    console.error(error);
    showToast("الحذف يحتاج صلاحية الإدارة في Supabase");
    return;
  }

  await loadPosts();
  showToast("تم حذف المشاركة");
});

/* بطاقات اكتشف التسامح */
document.querySelectorAll(".discover-card").forEach(button=>{
  button.addEventListener("click",()=>{
    $("dialogTitle").textContent = button.dataset.topic;
    $("dialogAnswer").textContent = button.dataset.answer;
    $("topicDialog").showModal();
  });
});

$("closeDialog")?.addEventListener("click",()=>{
  $("topicDialog").close();
});

$("topicDialog")?.addEventListener("click",event=>{
  if(event.target === $("topicDialog")){
    $("topicDialog").close();
  }
});

/* شريط الرسائل */
const tickerTrack = document.querySelector(".ticker-track");

if(tickerTrack && !tickerTrack.dataset.looped){
  tickerTrack.innerHTML += tickerTrack.innerHTML;
  tickerTrack.setAttribute(
    "aria-label",
    "رسائل متحركة من مجتمع المدرسة"
  );
  tickerTrack.dataset.looped = "true";
}

/* تشغيل الموقع */
renderPosts();
loadPosts();
