"use strict";

/* ---------- 저장 ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
const params = new URLSearchParams(location.search);
if (params.get("db")) store.set("rs.db", params.get("db"));
const dbUrl = (store.get("rs.db", "") || FIREBASE_DB_URL).replace(/\/+$/, "");
const room = ROOM;
const baseUrl = location.href.split(/[?#]/)[0];

const newGroup = () => ({ criteria: ["", ""], cart: [], removed: [], forgoReason: "", goodsNone: false, drinkNone: false, activityNone: false, reason: "", advice: "", members: "", fit: false, updatedAt: 0 });
function normGroup(g) {
  const n = Object.assign(newGroup(), g || {});
  const arr = (v) => Array.isArray(v) ? v.filter((x) => x != null) : v && typeof v === "object" ? Object.values(v) : [];
  n.criteria = [0, 1].map((i) => { const value = String(arr(g && g.criteria)[i] || ""); return /^(amount|fun)$/i.test(value.trim()) ? "" : value; });
  n.cart = arr(n.cart).filter((id) => ITEMS.some((it) => it.id === id));
  n.removed = arr(n.removed).filter((r) => r && ITEMS.some((it) => it.id === r.id)).map((r) => ({ id: r.id, note: r.note || "" }));
  n.forgoReason = String(n.forgoReason || n.removed.map((r) => `${ITEMS.find((it) => it.id === r.id)?.name || ""}${r.note ? ": " + r.note : ""}`).filter(Boolean).join(" / "));
  for (const cat of ["goods", "drink", "activity"]) { n[cat + "None"] = !!n[cat + "None"]; if (n[cat + "None"]) n.cart = n.cart.filter((id) => ITEMS.find((it) => it.id === id)?.cat !== cat); }
  return n;
}

// 모둠 기기 잠금: 한 번 모둠을 고르면(또는 ?g=번호 링크로 열면) 그 모둠 화면만 보여요.
const pg = +params.get("g");
if (pg >= 1 && pg <= GROUPS) store.set("rs.lock", pg);
let lockGroup = store.get("rs.lock", null);
let teacherOk = store.get("rs.teacher", false);
let votes = store.get("rs.votes", {});
let who = null;
let G = null;
let tab = null;
let shopCat = "food";
let wishShown = false;
let groupsLive = {};
let pinCb = null;

/* ---------- 도우미 ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const won = (n) => n.toLocaleString("ko-KR") + "원";
const item = (id) => ITEMS.find((i) => i.id === id);
const totalOf = (g) => g.cart.reduce((s, id) => s + (item(id)?.price || 0), 0);
const countIn = (g, cat) => g.cart.filter((id) => item(id)?.cat === cat).length;
const CAT_ORDER = Object.keys(CATS);
const sortByCat = (list) => list.slice().sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat));
const missingCats = (g) => REQUIRED_CATS.filter((c) => countIn(g, c) === 0 && !g[c + "None"]);
const goodsDecided = (g) => g.goodsNone || countIn(g, "goods") > 0;
const catLabel = (c) => CATS[c].replace(/^\S+\s/, "");
// 분류마다 담았는지 보여 주는 칩 (먹거리·음료·활동은 필수, 기념품은 선택)
function catStatus(g) {
  const req = REQUIRED_CATS.map((c) => {
    const n = countIn(g, c), none = g[c + "None"];
    return `<span class="chip ${n || none ? "" : "need"}">${n || none ? "✓" : "!"} ${CATS[c]} ${n ? n + "개" : none ? "선택 안 함" : c === "food" ? "필수" : "선택"}</span>`;
  }).join("");
  const n = countIn(g, "goods");
  const goods = `<span class="chip ${goodsDecided(g) ? "" : "pending"}">${goodsDecided(g) ? "✓" : "…"} ${CATS.goods} ${n ? n + "개" : g.goodsNone ? "선택 안 함" : "선택"}</span>`;
  return `<div class="chips cat-status">${req}${goods}</div>`;
}
const photo = (it, cls) => `<div class="ph ${cls || ""}" style="background-image:url('img/${it.id}.${it.id === 'movie' ? 'svg' : 'jpg'}')" role="img" aria-label="${esc(it.name)}"></div>`;
function ago(t) {
  if (!t) return "";
  const s = Math.round((Date.now() - t) / 1000);
  return s < 10 ? "방금" : s < 60 ? s + "초 전" : Math.round(s / 60) + "분 전";
}
function beep() {
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    const a = new C(), o = a.createOscillator(), g = a.createGain();
    o.type = "square"; o.frequency.value = 520; g.gain.value = 0.06;
    o.connect(g); g.connect(a.destination); o.start();
    o.frequency.setValueAtTime(360, a.currentTime + 0.18);
    o.stop(a.currentTime + 0.4);
  } catch (e) {}
}
function modal(html, left) { $("#modalBox").className = "box" + (left ? " left" : ""); $("#modalBox").innerHTML = html; $("#modal").classList.add("show"); }
const closeModal = () => $("#modal").classList.remove("show");
function setSync(state, text) { const el = $("#sync"); el.className = "sync " + state; el.textContent = text; }
function askPin(title, cb) {
  pinCb = cb;
  modal(`<div class="emo">🔒</div><p><b>${title}</b><br>선생님 번호를 넣어 주세요.</p>
    <input class="pin-input" id="pin" type="password" inputmode="numeric" autocomplete="off">
    <div class="pin-err" id="pinErr"></div>
    <div class="row" style="justify-content:center"><button class="btn ghost" data-act="closeModal">취소</button><button class="btn" data-act="pinOk">확인</button></div>`);
  setTimeout(() => $("#pin") && $("#pin").focus(), 50);
}

/* ---------- 실시간 연동 (Firebase Realtime Database REST) ---------- */
const groupPath = (n) => `${dbUrl}/rooms/${encodeURIComponent(room)}/groups/${n}.json`;
let pushTimer = null;
function saveG() {
  G.updatedAt = Date.now();
  store.set("rs.g" + who, G);
  if (!dbUrl) return;
  clearTimeout(pushTimer);
  setSync("on", "☁️ 저장 중…");
  pushTimer = setTimeout(pushG, 350);
}
async function pushG() {
  const n = who;
  if (typeof n !== "number") return;
  try {
    const r = await fetch(groupPath(n), { method: "PUT", body: JSON.stringify(G) });
    if (!r.ok) throw new Error(r.status);
    if (who === n) setSync("on", "☁️ 실시간 저장됨");
  } catch (e) {
    setSync("off", "⚠️ 연결 안 됨 · 이 기기에 저장 중");
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushG, 4000);
  }
}
async function pullG(n) {
  if (!dbUrl) { setSync("local", "📱 이 기기에만 저장"); return; }
  try {
    const r = await fetch(groupPath(n));
    if (!r.ok) throw new Error(r.status);
    const data = await r.json();
    if (who !== n) return;
    if (data && (data.updatedAt || 0) > (G.updatedAt || 0)) { G = normGroup(data); store.set("rs.g" + n, G); render(); }
    else if (!data && G.updatedAt) pushG();
    setSync("on", "☁️ 실시간 연결됨");
  } catch (e) { setSync("off", "⚠️ 연결 안 됨 · 이 기기에 저장 중"); }
}

let es = null;
function applyEvent(root, path, data, patch) {
  const keys = path.split("/").filter(Boolean);
  if (!keys.length) return patch ? Object.assign(root || {}, data) : (data || {});
  root = root || {};
  let cur = root;
  for (let i = 0; i < keys.length - 1; i++) { if (typeof cur[keys[i]] !== "object" || cur[keys[i]] === null) cur[keys[i]] = {}; cur = cur[keys[i]]; }
  const last = keys[keys.length - 1];
  if (patch) cur[last] = Object.assign(cur[last] || {}, data);
  else if (data === null) delete cur[last];
  else cur[last] = data;
  return root;
}
function startStream() {
  stopStream();
  if (!dbUrl) { setSync("local", "📱 연동 꺼짐"); return; }
  setSync("off", "⏳ 연결 중…");
  es = new EventSource(`${dbUrl}/rooms/${encodeURIComponent(room)}/groups.json`);
  const onData = (patch) => (ev) => {
    try {
      const m = JSON.parse(ev.data);
      groupsLive = applyEvent(groupsLive, m.path, m.data, patch);
      setSync("on", "🟢 실시간 연결됨");
      if (tab === "live") renderLive();
    } catch (e) {}
  };
  es.addEventListener("put", onData(false));
  es.addEventListener("patch", onData(true));
  es.addEventListener("cancel", () => setSync("off", "⚠️ 읽기 권한 없음"));
  es.onerror = () => setSync("off", "⚠️ 다시 연결 중…");
}
function stopStream() { if (es) { es.close(); es = null; } }
setInterval(() => { if (tab === "live") renderLive(); }, 15000);

/* ---------- 화면 ---------- */
const GROUP_TABS = [["shop", "비교하고 담기"], ["plan", "기획서"]];
const TEACHER_TABS = [["wish", "위시리스트 투표"], ["live", "모둠 현황"], ["settings", "설정·링크"]];

function render() {
  const isT = who === "teacher";
  const inApp = who !== null;
  $("#who").hidden = $("#homeBtn").hidden = $("#tabs").hidden = $("#sync").hidden = !inApp;
  if (inApp) {
    $("#who").textContent = isT ? "교사 화면" : "🔒 " + who + "모둠";
    $("#homeBtn").textContent = isT ? "처음 화면" : "모둠 바꾸기";
    $("#homeBtn").dataset.act = isT ? "home" : "unlock";
    const tabs = isT ? TEACHER_TABS : GROUP_TABS;
    $("#tabs").innerHTML = tabs.map(([k, l], i) => `<button data-act="tab" data-v="${k}" class="${tab === k ? "on" : ""}">${isT ? "" : `<span class="num">${i + 1}</span>`}${l}</button>`).join("");
  }
  $("#view").innerHTML = !inApp ? viewStart() : ({ wish: viewWish, live: viewLive, settings: viewSettings, shop: viewShop, plan: viewPlan }[tab])();
}

function viewStart() {
  let g = "";
  for (let i = 1; i <= GROUPS; i++) g += `<button data-act="pick" data-v="${i}">${i}모둠<small>우리 모둠 크롬북</small></button>`;
  return `<div class="start">
    <div><h2>우리 모둠을 골라요</h2><p class="lead">한 번 고르면 이 크롬북은 그 모둠 화면만 보여요. 바꾸려면 선생님께 말해요.<br>우리 반 ${STUDENTS}명을 위한 학급 보상을 예산 ${won(BUDGET)} 안에서 계획해요.</p></div>
    <div class="start-grid">${g}<button class="teacher" data-act="pick" data-v="teacher">👩‍🏫 교사 화면<small>전자칠판 · 위시리스트 투표 · 모둠 현황 · 설정 (선생님 번호 필요)</small></button></div>
  </div>`;
}

function budgetBar(total, big, chipsHtml) {
  const over = total > BUDGET;
  const pct = Math.min(total / BUDGET, 1) * 100;
  const status = over ? `⚠ ${won(total - BUDGET)} 초과!` : `남은 돈 ${won(BUDGET - total)}`;
  return `<div class="${big ? "card big-gauge" : "budget"} ${over ? "over" : ""}" id="bar">
    <div class="nums"><span>사용 ${won(total)} / ${won(BUDGET)}</span><span class="left">${status}</span></div>
    <div class="track"><div class="fill" style="width:${pct}%"></div></div>
    ${chipsHtml || ""}
  </div>`;
}
function cartChips(g) {
  if (!g.cart.length) return `<div class="hint">아직 담은 것이 없어요.</div>`;
  return `<div class="chips">${g.cart.map((id) => { const it = item(id); return it ? `<span class="chip">${esc(it.name)} <button data-act="remove" data-id="${id}" aria-label="빼기">×</button></span>` : ""; }).join("")}</div>`;
}
function critChips(g) {
  const c = g.criteria.map((x, i) => x.trim() ? `<span class="chip rank">${i + 1}순위 ${esc(x)}</span>` : "").join("");
  return c ? `<div class="chips">${c}</div>` : `<span class="hint">기준을 아직 적지 않았어요.</span>`;
}

function viewWish() {
  const total = ITEMS.filter((it) => (votes[it.id] || 0) > 0).reduce((s, it) => s + it.price, 0);
  const cards = ITEMS.map((it) => `<div class="wish ${wishShown && votes[it.id] > 0 ? "picked" : ""}">
      ${photo(it)}<div class="nm">${esc(it.name)}</div><div class="pr">${won(it.price)}</div>
      <div class="cnt">${votes[it.id] || 0}</div>
      <div class="row"><button data-act="vote" data-id="${it.id}" data-d="-1" aria-label="빼기">−</button><button data-act="vote" data-id="${it.id}" data-d="1" aria-label="더하기">+</button></div>
    </div>`).join("");
  let gauge = "";
  if (wishShown) {
    gauge = budgetBar(total, true) + (total > BUDGET
      ? `<div class="alert">🚨 원하는 것을 모두 담았더니 ${won(total - BUDGET)}이 넘었어요! 어떻게 해야 할까요?</div>`
      : `<div class="callout">예산 안에 들어왔어요. 그래도 더 만족스러운 조합은 없을까요?</div>`);
  }
  return `<h2>우리 반 위시리스트 투표</h2>
    <p class="lead">학급 보상으로 하고 싶은 것에 손을 든 학생 수를 기록하세요. 표를 받은 것을 모두 담아 봅니다.</p>
    <div class="row" style="margin-bottom:12px">
      <button class="btn warn" data-act="wishFill">🛒 표를 받은 것 모두 담아 보기</button>
      <button class="btn ghost" data-act="wishReset">투표 초기화</button>
    </div>
    ${gauge}
    <div class="wish-grid">${cards}</div>`;
}

function liveCards() {
  let out = "";
  for (let n = 1; n <= GROUPS; n++) {
    const raw = groupsLive && groupsLive[n];
    const g = normGroup(raw);
    const total = totalOf(g), over = total > BUDGET;
    const pct = Math.min(total / BUDGET, 1) * 100;
    out += `<div class="gcard ${over ? "over" : ""} ${raw ? "" : "empty-g"}">
      <div class="gt"><b>${n}모둠</b>${over ? `<span class="chip" style="background:var(--danger-soft);color:var(--danger)">${won(total - BUDGET)} 초과</span>` : ""}${raw ? missingCats(g).map((c) => `<span class="chip need">${catLabel(c)} 없음</span>`).join("") : ""}<span class="time">${raw ? ago(g.updatedAt) : "아직 시작 전"}</span></div>
      ${critChips(g)}
      <div class="nums"><span>${won(total)}</span><span class="left">${over ? "" : "남은 돈 " + won(BUDGET - total)}</span></div>
      <div class="track ${over ? "over" : ""}"><div class="fill" style="width:${pct}%"></div></div>
      <div class="thumbs">${sortByCat(g.cart.map(item).filter(Boolean)).map((it) => `<div class="thumb">${photo(it)}${esc(it.name)}</div>`).join("") || `<span class="hint">담은 것 없음</span>`}${["drink", "activity", "goods"].filter((c) => g[c + "None"]).map((c) => `<div class="thumb">${catLabel(c)} 선택 안 함</div>`).join("")}</div>
      <div class="forgo">🧾 포기: ${g.removed.map((r) => esc(item(r.id)?.name || "")).join(", ") || "없음"}</div>
      <button class="btn ghost small" data-act="presentGroup" data-v="${n}" ${raw ? "" : "disabled style='opacity:.4'"}>📺 기획서 크게 보기</button>
    </div>`;
  }
  return out;
}
function viewLive() {
  return `<h2>모둠 현황 <span class="hint">(실시간)</span></h2>
    <p class="lead">모둠 크롬북에서 담고 빼는 내용이 바로 나타나요. 일반화 단계에서 모둠마다 기준과 선택을 비교해 보세요.</p>
    ${dbUrl ? "" : `<div class="callout" style="margin-bottom:12px">실시간 연동이 꺼져 있어요. config.js에 Firebase 주소를 넣어 주세요.</div>`}
    <div class="dash-grid" id="liveGrid">${liveCards()}</div>`;
}
function renderLive() { const el = $("#liveGrid"); if (el) el.innerHTML = liveCards(); }

function viewSettings() {
  let links = "";
  for (let n = 1; n <= GROUPS; n++) links += `<div class="row"><b style="width:56px">${n}모둠</b><code>${esc(baseUrl)}?g=${n}</code><button class="btn ghost small" data-act="copy" data-v="${esc(baseUrl)}?g=${n}">복사</button></div>`;
  return `<h2>설정 · 모둠 링크</h2>
    <p class="lead">학생 ${STUDENTS}명 · ${GROUPS}모둠 · 예산 ${won(BUDGET)} · 실시간 연동 ${dbUrl ? "켜짐" : "꺼짐"}</p>
    <div class="card" style="display:grid;gap:10px;margin-bottom:12px">
      <h3 style="margin:0">🔗 모둠별 링크</h3>
      <p class="hint" style="margin:0">모둠마다 자기 링크를 클래스룸 등으로 나눠 주세요. 링크로 열면 그 모둠 화면으로 바로 들어가고 다른 모둠으로 바꿀 수 없어요.</p>
      <div class="links">${links}<div class="row"><b style="width:56px">교사</b><code>${esc(baseUrl)}?t</code><button class="btn ghost small" data-act="copy" data-v="${esc(baseUrl)}?t">복사</button></div></div>
    </div>
    <div class="card" style="display:grid;gap:10px">
      <h3 style="margin:0">🧹 정리</h3>
      <div class="row">
        <button class="btn ghost" data-act="testDb">연결 시험</button>
        <button class="btn ghost" data-act="teacherOut">이 기기 교사 로그인 해제</button>
        <span class="grow"></span>
        <button class="btn danger" data-act="clearAll">모든 모둠 기록 지우기</button>
      </div>
    </div>`;
}

function itemCard(it) {
    const inCart = G.cart.includes(it.id);
    return `<div class="item ${inCart ? "in" : ""}">
      ${photo(it)}
      <div class="body">
        <div class="nm">${esc(it.name)}</div><div class="unit">${esc(it.unit)}</div>
        <div class="price">${won(it.price)}</div><div class="calc">${esc(it.calc)}</div>
        <dl class="facts">
          <dt>배분</dt><dd>${esc(it.share)}</dd>
          <dt>장점</dt><dd>${esc(it.pros)}</dd>
          <dt>단점</dt><dd>${esc(it.cons)}</dd>
        </dl>
        <button class="btn" data-act="${inCart ? "remove" : "add"}" data-id="${it.id}">${inCart ? "빼기" : "담기"}</button>
      </div>
    </div>`;
}
function noneRows(g) { return ["drink", "activity", "goods"].filter((c) => g[c + "None"]).map((c) => `<li><span>${catLabel(c)} 선택 안 함</span><b>0원</b></li>`).join(""); }
function noGoodsCard(cat) {
  return `<div class="item none-card ${G[cat + "None"] ? "in" : ""}">
      <div class="ph none-ph" aria-hidden="true"><span class="none-symbol">−</span></div>
      <div class="body">
        <div class="nm">선택 안 함</div>
        <div class="price">0원</div>
        <button class="btn" data-act="noGoods" data-v="${cat}">${G[cat + "None"] ? "선택 취소" : "선택 안 함"}</button>
      </div>
    </div>`;
}
function viewShop() {
  const cats = Object.entries(CATS).map(([k, l]) => `<button data-act="cat" data-v="${k}" class="${shopCat === k ? "on" : ""}">${l}</button>`).join("");
  const sections = Object.keys(CATS).filter((c) => shopCat === c).map((c) => {
    const rule = c === "food" ? `<span class="rule need">1개 이상 필수</span>` : `<span class="rule">선택 사항</span>`;
    const cards = (c !== "food" ? noGoodsCard(c) : "") + ITEMS.filter((it) => it.cat === c).map(itemCard).join("");
    return `<section class="cat-sec"><h3 class="cat-h">${CATS[c]} ${rule}</h3><div class="items">${cards}</div></section>`;
  }).join("");
  return `<div class="shop-layout"><div class="shop-main">
    <div class="card" style="margin-bottom:12px">
      <b>피라미드 토의 · 선택 기준</b>
      <div class="crit-in">${[0, 1].map((i) => `<label>${i + 1}순위<input data-field="crit" data-i="${i}" lang="ko" spellcheck="false" autocomplete="off" value="${esc(G.criteria[i])}"></label>`).join("")}</div>
    </div>
    <h2>1. 비교하고 담기</h2>
    <p class="lead">6모둠 · 21명 기준</p>
    <div class="cats">${cats}</div>
    ${sections}</div>
    <aside class="shop-summary card" aria-label="선택한 것과 예산">
      <h3>🛒 선택한 것</h3>
      <ul class="list">${sortByCat(G.cart.map(item).filter(Boolean)).map((it) => `<li><span>${esc(it.name)} <button class="summary-remove" data-act="remove" data-id="${it.id}" aria-label="${esc(it.name)} 빼기">×</button></span><b>${won(it.price)}</b></li>`).join("") || '<li class="hint">아직 담은 것이 없어요.</li>'}${noneRows(G)}</ul>
      ${budgetBar(totalOf(G), false)}
      ${catStatus(G)}
    </aside></div>`;
}

function checksHtml() {
  const total = totalOf(G);
  const c1 = G.cart.length > 0 && total <= BUDGET;
  const c3 = G.forgoReason.trim().length > 0;
  const c4 = G.advice.trim().length > 0;
  const miss = missingCats(G);
  const c0 = miss.length === 0 && goodsDecided(G);
  const m = (ok) => `<span class="mark ${ok ? "yes" : "no"}">${ok ? "✓" : "!"}</span>`;
  const why = c0 ? "" : ` <span class="hint">(${[...miss.map((c) => catLabel(c) + " 없음"), ...(goodsDecided(G) ? [] : ["기념품을 고르거나 '선택 안 함'을 눌러요"])].join(", ")})</span>`;
  return `<li>${m(c0)} 1. 먹거리를 담고, 음료·활동·기념품의 선택 여부를 정했는가?${why}</li>
    <li>${m(c1)} 2. 총금액이 ${won(BUDGET)} 이내인가?</li>
    <li><input type="checkbox" data-field="fit" ${G.fit ? "checked" : ""} aria-label="기준 부합 확인"> 3. 모둠의 2가지 기준에 맞는가?</li>
    <li>${m(c3)} 4. 포기한 것과 그 까닭을 간단히 적었는가?</li>
    <li>${m(c4)} 5. 부모님 자문을 듣고 기획서를 다시 점검했는가?</li>`;
}
function viewPlan() {
  const total = totalOf(G);
  const chosen = sortByCat(G.cart.map(item).filter(Boolean));
  return `${budgetBar(total, false, catStatus(G) + cartChips(G))}
    <div class="plan">
      <div class="row"><h2 class="grow">2. ${who}모둠 학급 보상 기획서</h2>
        <button class="btn warn no-print" data-act="present">📺 발표 화면</button>
        <button class="btn ghost no-print" data-act="print">🖨 인쇄</button></div>
      <div class="plan-grid">
        <div class="card"><h3>💬 우리 모둠의 2가지 기준</h3>${critChips(G)}</div>
        <div class="card"><h3>✍️ 모둠원</h3><input data-field="members" value="${esc(G.members)}" placeholder="이름 대신 번호로 적어요 (예: 3, 8, 12, 19)"></div>
        <div class="card"><h3>🛒 최종 선택</h3><ul class="list">
          ${chosen.map((it) => `<li><span><span class="hint">${catLabel(it.cat)}</span> ${esc(it.name)} <span class="hint">${esc(it.share)}</span></span><b>${won(it.price)}</b></li>`).join("") || `<li class="hint">아직 고르지 않았어요.</li>`}
          ${noneRows(G)}
          <li class="total"><span>합계</span><span style="color:${total > BUDGET ? "var(--danger)" : "inherit"}">${won(total)}</span></li></ul></div>
        <div class="card"><h3>✍️ 포기한 것과 까닭</h3><textarea data-field="forgoReason" rows="3" placeholder="예: 치킨을 포기했어요. 보드게임도 구입하려면 예산이 부족해서예요.">${esc(G.forgoReason)}</textarea></div>
      </div>
      <div class="card"><h3>💬 이렇게 고른 까닭</h3><textarea data-field="reason" rows="3" placeholder="우리 모둠의 기준에 비추어 왜 이 조합이 가장 만족스러운지 써요.">${esc(G.reason)}</textarea></div>
      <div class="card"><h3>👪 학부모 자문 한 줄</h3><input data-field="advice" value="${esc(G.advice)}" placeholder="부모님께 들은 조언을 한 줄로 적어요."></div>
      <div class="card"><h3>✅ 기획서 점검</h3><ul class="list checks" id="checks">${checksHtml()}</ul></div>
    </div>`;
}

function presentHtml(g, n) {
  const total = totalOf(g);
  const chosen = sortByCat(g.cart.map(item).filter(Boolean));
  const crit = g.criteria.filter((x) => x.trim());
  return `<button class="btn close" data-act="closePresent">닫기 ✕</button>
    <h2>${n}모둠 학급 보상 기획서</h2>
    <div class="pg">
      <div class="card"><h3>💬 우리 기준</h3><ol style="margin:0;padding-left:28px">${crit.map((x) => `<li>${esc(x)}</li>`).join("") || "<li>-</li>"}</ol></div>
      <div class="card"><h3>🛒 최종 선택 · <span style="color:${total > BUDGET ? "var(--danger)" : "var(--brand)"}">${won(total)}</span></h3><ul class="list">${chosen.map((it) => `<li><span>${photo(it, "pthumb")}${esc(it.name)}</span><b>${won(it.price)}</b></li>`).join("")}${noneRows(g)}</ul></div>
      <div class="card"><h3>✍️ 포기한 것과 까닭</h3><p style="margin:0;white-space:pre-wrap">${esc(g.forgoReason || "아직 적지 않았어요.")}</p></div>
      <div class="card"><h3>💬 고른 까닭</h3><p style="margin:0">${esc(g.reason)}</p>${g.advice ? `<h3 style="margin-top:16px">👪 학부모 자문</h3><p style="margin:0">${esc(g.advice)}</p>` : ""}</div>
    </div>`;
}
function openPresent(g, n) { $("#present").innerHTML = presentHtml(g, n); $("#present").classList.add("show"); }

/* ---------- 들어가기 ---------- */
function enterGroup(n) {
  stopStream();
  lockGroup = n; store.set("rs.lock", n);
  who = n; G = normGroup(store.get("rs.g" + n, null)); tab = "shop";
  render(); pullG(n);
}
function enterTeacher() {
  if (!teacherOk) { askPin("교사 화면", () => { teacherOk = true; store.set("rs.teacher", true); enterTeacher(); }); return; }
  who = "teacher"; G = null; tab = "live";
  render(); startStream();
}

document.addEventListener("click", (e) => {
  if (e.target.matches("input, textarea, select")) return;
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled) return;
  const { act, id, v } = el.dataset;
  switch (act) {
    case "pick": if (v === "teacher") enterTeacher(); else enterGroup(+v); return;
    case "home": stopStream(); who = null; break;
    case "unlock":
      askPin("모둠 바꾸기", () => { lockGroup = null; store.del("rs.lock"); who = null; G = null; render(); });
      return;
    case "pinOk": {
      if ($("#pin").value === String(TEACHER_PIN)) { closeModal(); const cb = pinCb; pinCb = null; if (cb) cb(); }
      else { $("#pinErr").textContent = "번호가 맞지 않아요."; $("#pin").value = ""; $("#pin").focus(); }
      return;
    }
    case "tab": tab = v; window.scrollTo(0, 0); break;
    case "vote": votes[id] = Math.max(0, (votes[id] || 0) + +el.dataset.d); store.set("rs.votes", votes); break;
    case "wishFill": {
      wishShown = true;
      const total = ITEMS.filter((it) => votes[it.id] > 0).reduce((s, it) => s + it.price, 0);
      render();
      if (total > BUDGET) { beep(); $("#bar").classList.add("shake"); }
      return;
    }
    case "wishReset": votes = {}; wishShown = false; store.set("rs.votes", votes); break;
    case "cat": shopCat = v; break;
    case "noGoods": {
      if (!["drink", "activity", "goods"].includes(v)) return;
      G[v + "None"] = !G[v + "None"];
      if (G[v + "None"]) G.cart = G.cart.filter((x) => item(x)?.cat !== v);
      saveG();
      break;
    }
    case "add": {
      if (!G.cart.includes(id)) G.cart.push(id);
      if (item(id)) G[item(id).cat + "None"] = false;
      saveG();
      const after = totalOf(G);
      render();
      if (after > BUDGET) {
        beep(); $("#bar").classList.add("shake");
        modal(`<div class="emo">🚨</div><p><b>예산 초과!</b><br>${won(BUDGET)}을 <b>${won(after - BUDGET)}</b> 넘었어요.<br>무엇을 빼면 우리 기준에 더 잘 맞을까요?</p><button class="btn" data-act="closeModal">알겠어요</button>`);
      }
      return;
    }
    case "remove":
      G.cart = G.cart.filter((x) => x !== id);
      saveG();
      break;
    case "present": openPresent(G, who); return;
    case "presentGroup": openPresent(normGroup(groupsLive[v]), v); return;
    case "closePresent": $("#present").classList.remove("show"); return;
    case "print": window.print(); return;
    case "closeModal": pinCb = null; closeModal(); return;
    case "credits":
      modal(`<h3>가격 출처 (2026년 10월 검색)</h3><ul>${PRICE_SOURCES.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><h3>사진 출처</h3><ul>${PHOTO_CREDITS.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p class="hint">CC BY · CC BY-SA 사진은 저작자 표시 조건으로 쓸 수 있어요. CC0은 조건 없이 쓸 수 있어요.</p><button class="btn" data-act="closeModal">닫기</button>`, true);
      return;
    case "copy":
      try { navigator.clipboard.writeText(v); el.textContent = "복사됨"; } catch (err) { el.textContent = "직접 복사해요"; }
      setTimeout(() => { el.textContent = "복사"; }, 1500);
      return;
    case "testDb":
      fetch(`${dbUrl}/rooms/${encodeURIComponent(room)}/ping.json`, { method: "PUT", body: JSON.stringify(Date.now()) })
        .then((r) => modal(r.ok ? `<div class="emo">🟢</div><p>연결 성공! 읽고 쓸 수 있어요.</p><button class="btn" data-act="closeModal">확인</button>` : `<div class="emo">🔒</div><p>연결은 됐지만 쓰기가 막혀 있어요 (${r.status}).<br>Firebase 규칙을 확인하세요.</p><button class="btn" data-act="closeModal">확인</button>`))
        .catch(() => modal(`<div class="emo">⚠️</div><p>연결하지 못했어요. 주소와 인터넷 연결을 확인하세요.</p><button class="btn" data-act="closeModal">확인</button>`));
      return;
    case "teacherOut": teacherOk = false; store.del("rs.teacher"); stopStream(); who = null; break;
    case "clearAll":
      if (!confirm("모든 모둠의 장바구니와 기획서를 지울까요? 되돌릴 수 없어요.")) return;
      for (let i = 1; i <= 10; i++) store.del("rs.g" + i);
      store.del("rs.votes"); votes = {}; wishShown = false;
      if (dbUrl) fetch(`${dbUrl}/rooms/${encodeURIComponent(room)}/groups.json`, { method: "DELETE" }).catch(() => {});
      break;
  }
  render();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.id === "pin") document.querySelector('[data-act="pinOk"]').click();
});
document.addEventListener("input", (e) => {
  const f = e.target.dataset.field;
  if (!f || !G) return;
  if (f === "crit") G.criteria[+e.target.dataset.i] = e.target.value;
  else if (f === "fit") G.fit = e.target.checked;
  else G[f] = e.target.value;
  saveG();
  if (tab === "plan" && $("#checks") && f !== "fit") $("#checks").innerHTML = checksHtml();

});
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") { pinCb = null; closeModal(); } });

if (params.has("t")) enterTeacher();
else if (lockGroup) enterGroup(lockGroup);
else render();
