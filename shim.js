/* Статическая версия: данные в GitHub (приватный репозиторий) или в localStorage. */
(function () {
  const LS_DATA = "fit-data";
  const LS_TOKEN = "fit-gh-token";
  const LS_CFG = "fit-gh-cfg";
  const DEFAULT_CFG = { owner: "koby11qq2w", repo: "fitness-data", branch: "main", path: "data.json" };
  const realFetch = window.fetch.bind(window);

  const EMPTY = {
    profiles: {
      tim: { name: "Тимофей", color: "#5ec8f2" },
      kristina: { name: "Кристина", color: "#f7a8d8" },
    },
    log: { tim: {}, kristina: {} },
    custom: { tim: [], kristina: [] },
    measurements: { tim: [], kristina: [] },
    weights: { tim: [], kristina: [] },
    updated: 0,
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function cfg() {
    try { return Object.assign({}, DEFAULT_CFG, JSON.parse(localStorage.getItem(LS_CFG) || "{}")); }
    catch (e) { return Object.assign({}, DEFAULT_CFG); }
  }
  function token() { return localStorage.getItem(LS_TOKEN) || ""; }
  function norm(d) {
    d = d || {};
    d.profiles = d.profiles || clone(EMPTY.profiles);
    d.log = d.log || { tim: {}, kristina: {} };
    d.log.tim = d.log.tim || {}; d.log.kristina = d.log.kristina || {};
    d.custom = d.custom || { tim: [], kristina: [] };
    d.measurements = d.measurements || { tim: [], kristina: [] };
    d.weights = d.weights || { tim: [], kristina: [] };
    d.updated = d.updated || 0;
    return d;
  }
  function loadLocal() {
    try { return localStorage.getItem(LS_DATA) ? norm(JSON.parse(localStorage.getItem(LS_DATA))) : null; }
    catch (e) { return null; }
  }
  function saveLocal() { localStorage.setItem(LS_DATA, JSON.stringify(data)); }

  let data = null, sha = null, ready = null, syncing = false, timer = null;

  function b64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function unb64(s) {
    const bin = atob(String(s).replace(/\s/g, ""));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function ghHeaders(t) {
    return { Authorization: "Bearer " + t, Accept: "application/vnd.github+json", "Content-Type": "application/json" };
  }
  function ghUrl(c) {
    return `https://api.github.com/repos/${c.owner}/${c.repo}/contents/${c.path}`;
  }
  async function ghGet() {
    const c = cfg(), t = token();
    if (!t || !c.owner || !c.repo) return null;
    const r = await realFetch(`${ghUrl(c)}?ref=${encodeURIComponent(c.branch)}`, { headers: ghHeaders(t), cache: "no-store" });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error("GitHub " + r.status);
    const j = await r.json();
    sha = j.sha;
    return norm(JSON.parse(unb64(j.content)));
  }
  async function ghPush() {
    const c = cfg(), t = token();
    if (!t || !c.owner || !c.repo) return;
    const body = { message: "fitness sync " + new Date().toISOString(), content: b64(JSON.stringify(data)), branch: c.branch };
    if (sha) body.sha = sha;
    let r = await realFetch(ghUrl(c), { method: "PUT", headers: ghHeaders(t), body: JSON.stringify(body) });
    if (r.status === 409) {
      const g = await ghGet();
      if (g) { sha = sha; body.sha = sha; r = await realFetch(ghUrl(c), { method: "PUT", headers: ghHeaders(t), body: JSON.stringify(body) }); }
    }
    if (!r.ok) throw new Error("GitHub " + r.status);
    const j = await r.json();
    sha = j.content && j.content.sha ? j.content.sha : sha;
    setBadge(true);
  }
  function scheduleSync() {
    saveLocal();
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (!token() || !cfg().owner) return;
      if (syncing) { scheduleSync(); return; }
      syncing = true;
      try { await ghPush(); } catch (e) { setBadge(false); console.warn(e); } finally { syncing = false; }
    }, 900);
  }
  function setBadge(ok) {
    const b = document.getElementById("gh-btn");
    if (!b) return;
    b.style.background = ok ? "#17351d" : (token() ? "#3a1414" : "#3a3009");
    b.style.borderColor = ok ? "#2b6b38" : (token() ? "#6f2323" : "#6f5b14");
    b.textContent = ok ? "⚙" : (token() ? "⚙!" : "⚙·");
  }

  function today() { return new Date().toISOString().slice(0, 10); }
  function uid() { return Math.random().toString(16).slice(2, 10); }
  function dateOf(v) { return /^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? v : today(); }

  function cleanEntry(raw) {
    const ex = String(raw.ex || "").trim().slice(0, 40);
    if (!ex) throw new Error("не указано упражнение");
    const d = dateOf(raw.d);
    let entry;
    if (Array.isArray(raw.sets) && raw.sets.length) {
      const sets = [];
      for (const x of raw.sets.slice(0, 40)) {
        if (!x) continue;
        const w = Math.round((+x.w || 0) * 10) / 10;
        const r = Math.round(+x.r || 0);
        if (w <= 0 && r <= 0) continue;
        if (w < 0 || w > 500 || r < 0 || r > 200) throw new Error("значение вне диапазона");
        const dw = x.dw != null && x.dw !== "" ? Math.round((+x.dw) * 10) / 10 : null;
        const dr = x.dr != null && x.dr !== "" ? Math.round(+x.dr) : null;
        sets.push({ w, r, dw, dr });
      }
      if (!sets.length) throw new Error("нет подходов");
      const best = sets.reduce((m, x) => (x.w > m.w || (x.w === m.w && x.r > m.r) ? x : m), sets[0]);
      entry = {
        id: uid(), d, w: best.w, r: best.r, s: sets.length, note: "", sets,
        raw: sets.map((x) => `${x.w}/${x.r}` + (x.dw && x.dr ? `+${x.dw}/${x.dr}` : "")).join(" / "),
      };
    } else {
      const w = Math.round((+raw.w || 0) * 10) / 10, r = Math.round(+raw.r || 0), s = Math.max(1, Math.round(+raw.s || 1));
      if (w < 0 || w > 500 || r < 0 || r > 200 || s < 1 || s > 20) throw new Error("значение вне диапазона");
      entry = { id: uid(), d, w, r, s, note: "", raw: String(raw.raw || "").slice(0, 400) };
      if (!entry.raw) entry.raw = Array.from({ length: s }, () => `${w}/${r}`).join(" / ");
    }
    return { ex, entry };
  }

  function sortLog(log) {
    for (const ex of Object.keys(log)) log[ex].sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
  }

  function handleMutation(path, b) {
    const p = b.profile;
    if (p !== "tim" && p !== "kristina") throw new Error("неизвестный профиль");
    if (path === "/api/entry") {
      const { ex, entry } = cleanEntry(b);
      (data.log[p][ex] = data.log[p][ex] || []).push(entry);
      sortLog(data.log[p]);
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, entry, updated: data.updated };
    }
    if (path === "/api/entry/update") {
      const { ex, entry } = cleanEntry(b);
      const list = data.log[p][ex] || [];
      const i = list.findIndex((x) => x.id === b.id);
      if (i < 0) throw new Error("запись не найдена");
      entry.id = b.id;
      list[i] = entry;
      sortLog(data.log[p]);
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, entry, updated: data.updated };
    }
    if (path === "/api/entry/delete") {
      const ex = String(b.ex || "");
      const list = data.log[p][ex] || [];
      const next = list.filter((x) => x.id !== b.id);
      if (next.length === list.length) throw new Error("запись не найдена");
      if (next.length) data.log[p][ex] = next; else delete data.log[p][ex];
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, updated: data.updated };
    }
    if (path === "/api/exercise") {
      const name = String(b.name || "").trim().slice(0, 60);
      if (!name) throw new Error("введи название");
      const ex = {
        id: "custom-" + uid(), name, group: String(b.group || "Другое").slice(0, 20),
        eq: String(b.eq || "своё").slice(0, 30), kind: ["weight", "reps", "time"].includes(b.kind) ? b.kind : "weight",
        p: Array.isArray(b.p) ? b.p.slice(0, 8) : [], s: Array.isArray(b.s) ? b.s.slice(0, 8) : [],
        custom: true, cue: "Своё упражнение.",
      };
      data.custom[p].push(ex);
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, exercise: ex, updated: data.updated };
    }
    if (path === "/api/weight") {
      const d = dateOf(b.d), kg = Math.round((+b.kg) * 10) / 10;
      if (!(kg > 0 && kg <= 400)) throw new Error("вес вне диапазона");
      data.weights[p] = data.weights[p].filter((x) => x.d !== d).concat([{ d, kg }]).sort((a, c) => (a.d < c.d ? -1 : 1));
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, weight: { d, kg }, updated: data.updated };
    }
    if (path === "/api/weight/delete") {
      const d = String(b.d || "");
      const before = data.weights[p].length;
      data.weights[p] = data.weights[p].filter((x) => x.d !== d);
      if (before === data.weights[p].length) throw new Error("запись не найдена");
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, updated: data.updated };
    }
    if (path === "/api/measure") {
      const d = dateOf(b.d);
      const fields = ["chest", "abdomen", "glutes", "thigh", "biceps", "calf"];
      const vals = { d };
      for (const f of fields) {
        const v = b[f];
        vals[f] = v == null || v === "" ? null : Math.round((+v) * 10) / 10;
      }
      if (b.merge) {
        const old = data.measurements[p].find((x) => x.d === d);
        if (old) {
          for (const f of fields) if (vals[f] != null) old[f] = vals[f];
          data.updated = Math.floor(Date.now() / 1000);
          return { ok: true, measure: old, updated: data.updated };
        }
      }
      data.measurements[p] = data.measurements[p].filter((x) => x.d !== d).concat([vals]).sort((a, c) => (a.d < c.d ? -1 : 1));
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, measure: vals, updated: data.updated };
    }
    if (path === "/api/measure/delete") {
      const d = String(b.d || "");
      const before = data.measurements[p].length;
      data.measurements[p] = data.measurements[p].filter((x) => x.d !== d);
      if (before === data.measurements[p].length) throw new Error("замер не найден");
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, updated: data.updated };
    }
    throw new Error("нет такого действия");
  }

  function response(obj, status) {
    status = status || 200;
    return { ok: status < 400, status, json: async () => obj };
  }

  async function api(url, init) {
    await ready;
    const path = String(url).split("?")[0];
    if (path === "/api/data") return response(data);
    if (path === "/api/health") return response({ ok: true });
    if (!init || init.method !== "POST") return response({ error: "метод" }, 405);
    try {
      const body = init.body ? JSON.parse(init.body) : {};
      const out = handleMutation(path, body);
      scheduleSync();
      return response(out);
    } catch (e) {
      return response({ error: e.message }, 400);
    }
  }

  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : input && input.url;
    if (url && url.indexOf("/api/") === 0) return api(url, init);
    return realFetch(input, init);
  };

  ready = (async () => {
    try {
      const remote = await ghGet();
      if (remote) data = remote;
      else data = loadLocal() || clone(EMPTY);
    } catch (e) {
      console.warn("GitHub недоступен, локальные данные", e);
      data = loadLocal() || clone(EMPTY);
    }
    saveLocal();
    return data;
  })();

  function settings() {
    const st = document.createElement("style");
    st.textContent = `#gh-btn{position:fixed;right:14px;bottom:14px;z-index:1000;width:34px;height:34px;border-radius:50%;border:1px solid #6f5b14;background:#3a3009;color:#fff;font-size:17px;cursor:pointer}#gh-modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:1001}#gh-modal[hidden]{display:none}.gh-box{background:#1e2024;color:#e8e8ea;border:1px solid #2c2f34;border-radius:10px;padding:14px;width:min(92vw,360px);display:flex;flex-direction:column;gap:8px;font:13px/1.35 -apple-system,"Segoe UI",Roboto,sans-serif}.gh-box h3{margin:0;font-size:14px}.gh-hint{margin:0;color:#9aa0a6;font-size:11px}.gh-box label{display:flex;flex-direction:column;gap:3px;font-size:10.5px;color:#9aa0a6}.gh-box input{background:#141518;border:1px solid #2c2f34;border-radius:5px;padding:6px 7px;color:#e8e8ea;font:inherit}.gh-actions{display:flex;gap:6px;flex-wrap:wrap}.gh-actions button{background:#23262b;border:1px solid #2c2f34;color:#e8e8ea;border-radius:5px;padding:5px 8px;font-size:11.5px;cursor:pointer}.gh-status{font-size:11px;color:#9aa0a6}.gh-import{font-size:11px;color:#9aa0a6}`;
    document.head.appendChild(st);
    const c = cfg();
    const wrap = document.createElement("div");
    wrap.id = "gh-wrap";
    wrap.innerHTML = `
      <button id="gh-btn" title="Данные: GitHub / локально">⚙</button>
      <div id="gh-modal" hidden>
        <div class="gh-box">
          <h3>Данные страницы</h3>
          <p class="gh-hint">Приватный репозиторий с <code>data.json</code>. Токен хранится только в этом браузере.</p>
          <label>владелец<input id="gh-owner" value="${c.owner}"></label>
          <label>репозиторий<input id="gh-repo" value="${c.repo}"></label>
          <label>ветка<input id="gh-branch" value="${c.branch}"></label>
          <label>токен GitHub<input id="gh-token" type="password" value="${token()}"></label>
          <div id="gh-status" class="gh-status"></div>
          <div class="gh-actions">
            <button id="gh-save">Сохранить</button>
            <button id="gh-push">Загрузить на GitHub</button>
            <button id="gh-close">Закрыть</button>
          </div>
          <div class="gh-actions">
            <button id="gh-dl">Скачать data.json</button>
            <label class="gh-import">Импорт data.json<input id="gh-file" type="file" accept=".json"></label>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    const modal = wrap.querySelector("#gh-modal");
    wrap.querySelector("#gh-btn").onclick = () => { modal.hidden = false; showStatus(); };
    wrap.querySelector("#gh-close").onclick = () => { modal.hidden = true; };
    wrap.querySelector("#gh-save").onclick = () => {
      const cfg2 = {
        owner: wrap.querySelector("#gh-owner").value.trim(),
        repo: wrap.querySelector("#gh-repo").value.trim(),
        branch: wrap.querySelector("#gh-branch").value.trim() || "main",
        path: "data.json",
      };
      localStorage.setItem(LS_CFG, JSON.stringify(cfg2));
      localStorage.setItem(LS_TOKEN, wrap.querySelector("#gh-token").value.trim());
      location.reload();
    };
    wrap.querySelector("#gh-push").onclick = async () => {
      try { await ghPush(); showStatus("Загружено"); } catch (e) { showStatus("Ошибка: " + e.message); }
    };
    wrap.querySelector("#gh-dl").onclick = () => {
      const blob = new Blob([JSON.stringify(data, null, 1)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "data.json"; a.click();
    };
    wrap.querySelector("#gh-file").onchange = (ev) => {
      const f = ev.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        try { data = norm(JSON.parse(rd.result)); saveLocal(); scheduleSync(); showStatus("Импортировано"); setTimeout(() => location.reload(), 400); }
        catch (e) { showStatus("Не JSON"); }
      };
      rd.readAsText(f);
    };
    function showStatus(msg) {
      const el = wrap.querySelector("#gh-status");
      const cfg2 = cfg();
      el.textContent = msg || (token() ? `GitHub: ${cfg2.owner}/${cfg2.repo}` : "Локальный режим (без GitHub)");
    }
    setBadge(Boolean(sha));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", settings);
  else settings();
})();
