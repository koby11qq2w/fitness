/* Зашифрованное хранилище: vault.json в публичном репозитории, пароль у владельца. */
(function () {
  const VAULT_URL = "vault.json";
  const API = "https://api.github.com/repos/koby11qq2w/fitness/contents/vault.json";
  const LS_PW = "fit-vault-pw";
  const realFetch = window.fetch.bind(window);
  const EMPTY = {
    profiles: { tim: { name: "Тимофей", color: "#5ec8f2" }, kristina: { name: "Кристина", color: "#f7a8d8" } },
    log: { tim: {}, kristina: {} },
    custom: { tim: [], kristina: [] },
    measurements: { tim: [], kristina: [] },
    weights: { tim: [], kristina: [] },
    workouts: { tim: [], kristina: [] },
    updated: 0,
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = (buf) => {
    const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const unb64 = (s) => {
    const bin = atob(String(s).replace(/\s/g, ""));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };
  async function derive(pw, salt) {
    const base = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 300000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function encryptObj(key, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(obj)));
    return { iv: b64(iv), data: b64(ct) };
  }
  async function decryptObj(key, iv, data) {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(data));
    return JSON.parse(dec.decode(pt));
  }

  let data = null, vault = null, key = null, ghToken = "", sha = null, timer = null, syncing = false, unlocked = false;
  let resolveReady;
  const ready = new Promise((r) => { resolveReady = r; });

  function norm(d) {
    d = d || {};
    d.profiles = d.profiles || clone(EMPTY.profiles);
    d.log = d.log || { tim: {}, kristina: {} };
    d.log.tim = d.log.tim || {}; d.log.kristina = d.log.kristina || {};
    d.custom = d.custom || { tim: [], kristina: [] };
    d.measurements = d.measurements || { tim: [], kristina: [] };
    d.weights = d.weights || { tim: [], kristina: [] };
    d.workouts = d.workouts || { tim: [], kristina: [] };
    d.workouts.tim = d.workouts.tim || []; d.workouts.kristina = d.workouts.kristina || [];
    d.updated = d.updated || 0;
    return d;
  }

  async function getVault() {
    const r = await realFetch(VAULT_URL + "?t=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error("vault.json не найден");
    return r.json();
  }
  async function getSha() {
    if (!ghToken) return;
    try {
      const r = await realFetch(API + "?ref=main", { headers: { Authorization: "Bearer " + ghToken, Accept: "application/vnd.github+json" }, cache: "no-store" });
      if (r.ok) sha = (await r.json()).sha;
    } catch (e) { /* offline */ }
  }
  async function unlock(pw) {
    if (unlocked) return;
    const v = await getVault();
    const salt = unb64(v.salt);
    const k = await derive(pw, salt);
    const d = await decryptObj(k, v.dataIv, v.data);
    let tok = dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(v.tokenIv) }, k, unb64(v.token)));
    try { tok = JSON.parse(tok); } catch (e) {}
    data = norm(d); vault = v; key = k; ghToken = tok;
    unlocked = true;
    resolveReady();
    getSha();
  }
  async function saveVault() {
    if (!key || !ghToken) throw new Error("нет доступа");
    const e = await encryptObj(key, data);
    const out = Object.assign({}, vault, { dataIv: e.iv, data: e.data, updated: Math.floor(Date.now() / 1000) });
    const body = { message: "vault " + new Date().toISOString(), content: b64(enc.encode(JSON.stringify(out))), branch: "main" };
    if (sha) body.sha = sha;
    let r = await realFetch(API, { method: "PUT", headers: { Authorization: "Bearer " + ghToken, Accept: "application/vnd.github+json", "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.status === 409) { await getSha(); body.sha = sha; r = await realFetch(API, { method: "PUT", headers: { Authorization: "Bearer " + ghToken, Accept: "application/vnd.github+json", "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
    if (!r.ok) throw new Error("GitHub " + r.status);
    const j = await r.json();
    sha = j.content && j.content.sha ? j.content.sha : sha;
    vault = out;
  }
  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (!unlocked || syncing) return;
      syncing = true;
      try { await saveVault(); } catch (e) { console.warn("Не сохранилось в GitHub", e); } finally { syncing = false; }
    }, 800);
  }

  function today() { return new Date().toISOString().slice(0, 10); }
  const uid = () => Math.random().toString(16).slice(2, 10);
  const dateOf = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? v : today();

  function cleanEntry(raw) {
    const ex = String(raw.ex || "").trim().slice(0, 40);
    if (!ex) throw new Error("не указано упражнение");
    const d = dateOf(raw.d);
    let entry;
    if (Array.isArray(raw.sets) && raw.sets.length) {
      const sets = [];
      for (const x of raw.sets.slice(0, 40)) {
        if (!x) continue;
        const w = Math.round((+x.w || 0) * 10) / 10, r = Math.round(+x.r || 0);
        if (w <= 0 && r <= 0) continue;
        if (w < 0 || w > 500 || r < 0 || r > 200) throw new Error("значение вне диапазона");
        const dw = x.dw != null && x.dw !== "" ? Math.round((+x.dw) * 10) / 10 : null;
        const dr = x.dr != null && x.dr !== "" ? Math.round(+x.dr) : null;
        sets.push({ w, r, dw, dr });
      }
      if (!sets.length) throw new Error("нет подходов");
      const best = sets.reduce((m, x) => (x.w > m.w || (x.w === m.w && x.r > m.r) ? x : m), sets[0]);
      entry = { id: uid(), d, w: best.w, r: best.r, s: sets.length, note: "", sets, raw: sets.map((x) => `${x.w}/${x.r}` + (x.dw && x.dr ? `+${x.dw}/${x.dr}` : "")).join(" / ") };
    } else {
      const w = Math.round((+raw.w || 0) * 10) / 10, r = Math.round(+raw.r || 0), s = Math.max(1, Math.round(+raw.s || 1));
      if (w < 0 || w > 500 || r < 0 || r > 200 || s < 1 || s > 20) throw new Error("значение вне диапазона");
      entry = { id: uid(), d, w, r, s, note: "", raw: String(raw.raw || "").slice(0, 400) };
      if (!entry.raw) entry.raw = Array.from({ length: s }, () => `${w}/${r}`).join(" / ");
    }
    return { ex, entry };
  }
  const mediaPath = (v) => {
    const s = String(v || "").trim().slice(0, 200);
    return /^lib\/[A-Za-z0-9_./-]+$/.test(s) && !s.includes("..") ? s : "";
  };
  const text = (v, n) => String(v || "").trim().slice(0, n);
  const textList = (v, n = 20, item = 400) => Array.isArray(v)
    ? v.slice(0, n).map((x) => String(x || "").trim().slice(0, item)).filter(Boolean) : [];

  function sortLog(log) { for (const ex of Object.keys(log)) log[ex].sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0)); }

  function mutate(path, b) {
    const p = b.profile;
    if (p !== "tim" && p !== "kristina") throw new Error("неизвестный профиль");
    if (path === "/api/entry") {
      const { ex, entry } = cleanEntry(b);
      (data.log[p][ex] = data.log[p][ex] || []).push(entry); sortLog(data.log[p]); data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, entry, updated: data.updated };
    }
    if (path === "/api/entry/update") {
      const { ex, entry } = cleanEntry(b);
      const list = data.log[p][ex] || []; const i = list.findIndex((x) => x.id === b.id);
      if (i < 0) throw new Error("запись не найдена");
      entry.id = b.id; list[i] = entry; sortLog(data.log[p]); data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, entry, updated: data.updated };
    }
    if (path === "/api/entry/delete") {
      const ex = String(b.ex || ""); const list = data.log[p][ex] || []; const next = list.filter((x) => x.id !== b.id);
      if (next.length === list.length) throw new Error("запись не найдена");
      if (next.length) data.log[p][ex] = next; else delete data.log[p][ex];
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, updated: data.updated };
    }
    if (path === "/api/exercise") {
      const name = String(b.name || "").trim().slice(0, 80);
      if (!name) throw new Error("введи название");
      const extra = {
        libId: text(b.libId, 40), libTitleEn: text(b.libTitleEn, 120),
        video: mediaPath(b.video), poster: mediaPath(b.poster), img: mediaPath(b.img),
        desc: text(b.desc, 4000), howto: textList(b.howto), tips: textList(b.tips), mistakes: textList(b.mistakes),
      };
      const ex = { id: "custom-" + uid(), name, group: String(b.group || "Другое").slice(0, 20), eq: String(b.eq || "своё").slice(0, 30), kind: ["weight", "reps", "time"].includes(b.kind) ? b.kind : "weight", p: Array.isArray(b.p) ? b.p.slice(0, 8) : [], s: Array.isArray(b.s) ? b.s.slice(0, 8) : [], custom: true, cue: text(b.cue, 300) || "Своё упражнение." };
      for (const k in extra) if (extra[k] && (!Array.isArray(extra[k]) || extra[k].length)) ex[k] = extra[k];
      data.custom[p].push(ex); data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, exercise: ex, updated: data.updated };
    }
    if (path === "/api/workout") {
      const d = String(b.d || "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error("неверная дата");
      const [yy, mm, dd] = d.split("-").map(Number);
      const dt = new Date(yy, mm - 1, dd);
      if (dt.getFullYear() !== yy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) throw new Error("неверная дата");
      const ex = [];
      for (const x of (Array.isArray(b.ex) ? b.ex : [])) {
        const eid = String(x || "").trim().slice(0, 40);
        if (/^[A-Za-z0-9_-]{1,40}$/.test(eid) && !ex.includes(eid)) ex.push(eid);
      }
      if (ex.length > 40) ex.length = 40;
      const arr = data.workouts[p];
      let w = arr.find((x) => x.d === d);
      if (w) w.ex = ex;
      else { w = { id: "w-" + d, d, ex, created: Math.floor(Date.now() / 1000) }; arr.push(w); arr.sort((a, c) => (a.d < c.d ? -1 : 1)); }
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, workout: w, updated: data.updated };
    }
    if (path === "/api/workout/delete") {
      const wid = String(b.id || "");
      const arr = data.workouts[p]; const next = arr.filter((x) => x.id !== wid);
      if (next.length === arr.length) throw new Error("тренировка не найдена");
      data.workouts[p] = next; data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, updated: data.updated };
    }
    if (path === "/api/weight") {
      const d = dateOf(b.d), kg = Math.round((+b.kg) * 10) / 10;
      if (!(kg > 0 && kg <= 400)) throw new Error("вес вне диапазона");
      data.weights[p] = data.weights[p].filter((x) => x.d !== d).concat([{ d, kg }]).sort((a, c) => (a.d < c.d ? -1 : 1));
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, weight: { d, kg }, updated: data.updated };
    }
    if (path === "/api/weight/delete") {
      const d = String(b.d || ""); const before = data.weights[p].length;
      data.weights[p] = data.weights[p].filter((x) => x.d !== d);
      if (before === data.weights[p].length) throw new Error("запись не найдена");
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, updated: data.updated };
    }
    if (path === "/api/measure") {
      const d = dateOf(b.d), fields = ["chest", "abdomen", "glutes", "thigh", "biceps", "calf"], vals = { d };
      for (const f of fields) vals[f] = b[f] == null || b[f] === "" ? null : Math.round((+b[f]) * 10) / 10;
      if (b.merge) {
        const old = data.measurements[p].find((x) => x.d === d);
        if (old) { for (const f of fields) if (vals[f] != null) old[f] = vals[f]; data.updated = Math.floor(Date.now() / 1000); return { ok: true, measure: old, updated: data.updated }; }
      }
      data.measurements[p] = data.measurements[p].filter((x) => x.d !== d).concat([vals]).sort((a, c) => (a.d < c.d ? -1 : 1));
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, measure: vals, updated: data.updated };
    }
    if (path === "/api/measure/delete") {
      const d = String(b.d || ""); const before = data.measurements[p].length;
      data.measurements[p] = data.measurements[p].filter((x) => x.d !== d);
      if (before === data.measurements[p].length) throw new Error("замер не найден");
      data.updated = Math.floor(Date.now() / 1000);
      return { ok: true, updated: data.updated };
    }
    throw new Error("нет такого действия");
  }

  const response = (obj, status = 200) => ({ ok: status < 400, status, json: async () => obj });

  async function api(url, init) {
    await ready;
    const path = String(url).split("?")[0];
    if (path === "/api/data") return response(data);
    if (path === "/api/health") return response({ ok: true });
    if (!init || init.method !== "POST") return response({ error: "метод" }, 405);
    try {
      const out = mutate(path, init.body ? JSON.parse(init.body) : {});
      schedule();
      return response(out);
    } catch (e) { return response({ error: e.message }, 400); }
  }
  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : input && input.url;
    if (url && url.indexOf("/api/") === 0) return api(url, init);
    return realFetch(input, init);
  };

  function gate() {
    const st = document.createElement("style");
    st.textContent = `#vault-gate{position:fixed;inset:0;z-index:9999;background:#141518;color:#e8e8ea;display:flex;align-items:center;justify-content:center;font:14px/1.4 -apple-system,"Segoe UI",Roboto,Arial,sans-serif}#vault-gate .b{background:#1e2024;border:1px solid #2c2f34;border-radius:12px;padding:20px;width:min(92vw,360px)}#vault-gate h2{margin:0 0 4px;font-size:17px}#vault-gate p{margin:0 0 14px;color:#9aa0a6;font-size:12px}#vault-gate input{width:100%;box-sizing:border-box;background:#141518;border:1px solid #2c2f34;border-radius:6px;padding:10px;color:#e8e8ea;font:inherit;margin-bottom:10px}#vault-gate button{width:100%;background:#3b82f6;color:#fff;border:0;border-radius:6px;padding:10px;font:600 14px inherit;cursor:pointer}#vault-gate .e{color:#e5484d;font-size:12px;min-height:16px;margin-top:8px}`;
    document.head.appendChild(st);
    const d = document.createElement("div");
    d.id = "vault-gate";
    d.innerHTML = `<div class="b"><h2>Тренировки</h2><p>Введите пароль. Он один для всех устройств.</p><input id="vault-pw" type="password" autocomplete="current-password" placeholder="пароль"><button id="vault-go">Открыть</button><div class="e" id="vault-err"></div></div>`;
    document.body.appendChild(d);
    const go = async () => {
      const pw = document.getElementById("vault-pw").value;
      if (!pw) return;
      document.getElementById("vault-err").textContent = "";
      try {
        await unlock(pw);
        localStorage.setItem(LS_PW, pw);
        d.remove();
        settings();
      } catch (e) { document.getElementById("vault-err").textContent = "Неверный пароль или нет vault.json"; }
    };
    document.getElementById("vault-go").onclick = go;
    document.getElementById("vault-pw").onkeydown = (e) => { if (e.key === "Enter") go(); };
    document.getElementById("vault-pw").focus();
  }

  function settings() {
    if (document.getElementById("vault-btn")) return;
    const st = document.createElement("style");
    st.textContent = `#vault-btn{position:fixed;right:14px;bottom:14px;z-index:1000;width:34px;height:34px;border-radius:50%;border:1px solid #2b6b38;background:#17351d;color:#fff;font-size:17px;cursor:pointer}#vault-modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:1001}#vault-modal[hidden]{display:none}.vault-box{background:#1e2024;color:#e8e8ea;border:1px solid #2c2f34;border-radius:10px;padding:14px;width:min(92vw,340px);display:flex;flex-direction:column;gap:8px;font:13px/1.35 -apple-system,"Segoe UI",Roboto,sans-serif}.vault-box h3{margin:0;font-size:14px}.vault-box p{margin:0;color:#9aa0a6;font-size:11px}.vault-box button{background:#23262b;border:1px solid #2c2f34;color:#e8e8ea;border-radius:5px;padding:7px 9px;font-size:12px;cursor:pointer;text-align:left}`;
    document.head.appendChild(st);
    const w = document.createElement("div");
    w.innerHTML = `<button id="vault-btn" title="Данные зашифрованы">⚙</button><div id="vault-modal" hidden><div class="vault-box"><h3>Данные зашифрованы</h3><p>Пароль хранится в этом браузере. На новом устройстве введите его один раз.</p><button id="vault-pwchange">Сменить пароль</button><button id="vault-dl">Скачать data.json</button><button id="vault-out">Выйти</button><button id="vault-close">Закрыть</button></div></div>`;
    document.body.appendChild(w);
    const modal = document.getElementById("vault-modal");
    document.getElementById("vault-btn").onclick = () => { modal.hidden = false; };
    document.getElementById("vault-close").onclick = () => { modal.hidden = true; };
    document.getElementById("vault-out").onclick = () => { localStorage.removeItem(LS_PW); location.reload(); };
    document.getElementById("vault-dl").onclick = () => {
      const blob = new Blob([JSON.stringify(data, null, 1)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "data.json"; a.click();
    };
    document.getElementById("vault-pwchange").onclick = async () => {
      const np = prompt("Новый пароль (минимум 8 символов)");
      if (!np || np.length < 8) return;
      if (np !== prompt("Повтори пароль")) { alert("Пароли не совпали"); return; }
      try {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const k = await derive(np, salt);
        const d = await encryptObj(k, data);
        const t = await encryptObj(k, ghToken);
        const out = { v: 1, salt: b64(salt), dataIv: d.iv, data: d.data, tokenIv: t.iv, token: t.data, updated: Math.floor(Date.now() / 1000) };
        const body = { message: "vault password", content: b64(enc.encode(JSON.stringify(out))), branch: "main" };
        if (sha) body.sha = sha;
        const r = await realFetch(API, { method: "PUT", headers: { Authorization: "Bearer " + ghToken, Accept: "application/vnd.github+json", "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!r.ok) throw new Error("GitHub " + r.status);
        const j = await r.json(); sha = j.content.sha; vault = out; key = k;
        localStorage.setItem(LS_PW, np);
        alert("Пароль изменён");
      } catch (e) { alert("Не получилось: " + e.message); }
    };
  }

  (async () => {
    const saved = localStorage.getItem(LS_PW);
    if (saved) {
      try { await unlock(saved); settings(); return; } catch (e) { localStorage.removeItem(LS_PW); }
    }
    gate();
  })();
})();
