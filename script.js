// ===== Helpers
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => (t.style.display = "none"), 3800);
}

// ===== Preloader
window.addEventListener("load", () => {
  setTimeout(() => $(".preloader").classList.add("hide"), 500);
});

// ===== Mobile menu
const nav = $(".nav");
const burger = $(".nav__burger");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", String(open));
});
$$(".nav__links a").forEach(a => {
  a.addEventListener("click", () => nav.classList.remove("open"));
});

// ===== Reveal on scroll
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("in");
  }
}, { threshold: 0.12 });

$$(".reveal").forEach(el => io.observe(el));

// ===== Parallax hero background
const heroBg = $(".hero__bg");
window.addEventListener("scroll", () => {
  const y = window.scrollY || 0;
  heroBg.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.08)`;
}, { passive: true });

// ===== Countdown
// Поменяй дату на свою:
const WEDDING_DATE = new Date("2026-08-24T16:00:00"); // local time
const ids = { d: $("#d"), h: $("#h"), m: $("#m"), s: $("#s") };

function pad(n){ return String(n).padStart(2, "0"); }

function tick() {
  const now = new Date();
  const diff = WEDDING_DATE - now;

  if (diff <= 0) {
    ids.d.textContent = "0";
    ids.h.textContent = "00";
    ids.m.textContent = "00";
    ids.s.textContent = "00";
    return;
  }

  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;

  ids.d.textContent = String(days);
  ids.h.textContent = pad(hours);
  ids.m.textContent = pad(mins);
  ids.s.textContent = pad(secs);
}
tick();
setInterval(tick, 1000);

// ===== Calendar (.ics) download
function downloadICS() {
  // Настрой:
  const title = "Свадьба: Аня и Дима";
  const location = "Ресторан “Лето”, ул. Примерная, 10, ВашГород";
  const description = "Ждём вас на нашей свадьбе! Сбор гостей 15:30, церемония 16:00.";
  const start = new Date("2026-08-24T16:00:00");
  const end   = new Date("2026-08-24T23:00:00");

  const toICSDate = (d) => {
    // UTC формат YYYYMMDDTHHMMSSZ
    const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().replace(/[-:]/g, "").replace(".000", "");
  };

  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invite//RU//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${crypto.randomUUID()}
DTSTAMP:${toICSDate(new Date())}
DTSTART:${toICSDate(start)}
DTEND:${toICSDate(end)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "wedding-invite.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

$("#addToCalendar").addEventListener("click", () => {
  downloadICS();
  toast("Файл календаря скачан (.ics).");
});

// ===== Copy address
$("#copyAddress").addEventListener("click", async () => {
  const addr = "Ресторан “Лето”, ул. Примерная, 10, ВашГород";
  try{
    await navigator.clipboard.writeText(addr);
    toast("Адрес скопирован!");
  }catch{
    toast("Не удалось скопировать. Выделите и скопируйте вручную.");
  }
});

// ===== RSVP (local storage demo)
const STORAGE_KEY = "wedding_rsvp_entries";

function loadEntries(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch{ return []; }
}
function saveEntries(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

$("#rsvpForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const entry = Object.fromEntries(fd.entries());
  entry.guests = Number(entry.guests || 1);
  entry.createdAt = new Date().toISOString();

  const all = loadEntries();
  all.push(entry);
  saveEntries(all);

  e.currentTarget.reset();
  toast("Спасибо! Ответ сохранён (локально).");
});

$("#downloadRSVP").addEventListener("click", () => {
  const data = loadEntries();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "rsvp-answers.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);

  toast("Скачал JSON с ответами.");
});

// ===== Particles (simple)
const canvas = $("#particles");
const ctx = canvas.getContext("2d");
let W=0,H=0,particles=[];
function resize(){
  W = canvas.width = window.innerWidth * devicePixelRatio;
  H = canvas.height = window.innerHeight * devicePixelRatio;
}
window.addEventListener("resize", resize);
resize();

function initParticles(){
  const count = Math.min(90, Math.floor(window.innerWidth/10));
  particles = Array.from({length: count}, () => ({
    x: Math.random()*W,
    y: Math.random()*H,
    r: (Math.random()*1.8+0.6) * devicePixelRatio,
    vx: (Math.random()*0.25+0.05) * devicePixelRatio,
    vy: (Math.random()*0.18+0.03) * devicePixelRatio,
    a: Math.random()*0.35+0.08
  }));
}
initParticles();

function loop(){
  ctx.clearRect(0,0,W,H);
  // мягкая “дымка”
  ctx.fillStyle = "rgba(233,199,167,0.04)";
  ctx.fillRect(0,0,W,H);

  for (const p of particles){
    p.x += p.vx;
    p.y += p.vy;
    if (p.x > W+20) p.x = -20;
    if (p.y > H+20) p.y = -20;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(233,199,167,${p.a})`;
    ctx.fill();
  }
  requestAnimationFrame(loop);
}
loop();
