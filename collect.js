(async function () {
  const CATS = ["grud", "spina", "nogi", "plechi", "ruki", "press", "yagodicy", "trapeciya"];
  const TARGETS = [
    { id: "bench", q: ["жим штанги лежа"], bad: ["наклон", "тренажер", "обратн", "полу", "шеи", "пауз", "цеп", "резин", "широк", "узк", "ларсен", "спото", "планше", "смит"] },
    { id: "dbpress", q: ["жим гантелей лежа"], bad: ["наклон", "полу", "узк", "нейтрал", "одной", "смит"] },
    { id: "pecfly", q: ["pec deck", "разведение рук на тренажере"], bad: ["наклон", "кроссовер"] },
    { id: "hammerpress", q: ["жим лёжа в тренажёре хаммер", "жим на тренажере для грудных"], bad: ["наклон"] },
    { id: "pushups", q: ["отжимание push-up"], bad: ["наклон", "брусь", "кольц", "кулак", "хлоп", "одной", "колен", "стен", "скамь", "дополнит", "плиометр", "супермен", "джек", "пальц", "планше", "лучник", "обратн"] },
    { id: "squat", q: ["приседания со штангой"], bad: ["смит", "фронт", "гак", "на груди", "плие"] },
    { id: "legpress", q: ["жим ногами"], bad: ["одной", "носк"] },
    { id: "rdl", q: ["румынская тяга", "становая тяга на прямых ногах"], bad: [] },
    { id: "deadlift", q: ["становая тяга"], bad: ["румын", "прямых", "одной", "трап", "сумо", "на прямых"] },
    { id: "lunges", q: ["выпады со штангой", "выпады"], bad: ["назад", "платформ"] },
    { id: "legcurl", q: ["сгибание ног лежа"], bad: ["стоя", "сидя", "одной"] },
    { id: "legext", q: ["разгибание ног"], bad: ["одной"] },
    { id: "calf", q: ["подъемы на носки стоя", "подъем на носки"], bad: ["сидя", "ослик"] },
    { id: "adductor", q: ["сведение ног", "приведение бедра"], bad: [] },
    { id: "hipthrust", q: ["ягодичный мост", "hip thrust"], bad: ["одной", "болгар"] },
    { id: "row", q: ["тяга штанги в наклоне"], bad: ["обратн", "т-штанг", "одной"] },
    { id: "machrow", q: ["тяга в тренажере", "рычажная тяга"], bad: ["верхн", "нижн", "горизонт"] },
    { id: "lattro", q: ["тяга верхнего блока"], bad: ["обратн", "одной"] },
    { id: "cablerow", q: ["горизонтальная тяга", "тяга нижнего блока"], bad: [] },
    { id: "pullups", q: ["подтягивания"], bad: ["гравитрон", "обратн", "австрал", "одной"] },
    { id: "ohp", q: ["жим штанги стоя"], bad: ["сидя", "арнольд", "гантел", "из-за головы"] },
    { id: "reardelt", q: ["обратные разведения", "разведение гантелей в наклоне"], bad: ["кроссовер"] },
    { id: "lateral", q: ["разведение гантелей стоя", "махи гантелями в стороны"], bad: ["наклон", "перед"] },
    { id: "uprightrow", q: ["тяга штанги к подбородку"], bad: [] },
    { id: "curl", q: ["подъем штанги на бицепс стоя"], bad: ["обратн", "ez", "молот", "скамье", "концентр", "гантел"] },
    { id: "triceps", q: ["разгибание на трицепс", "жим книзу"], bad: ["гантел", "из-за головы", "француз"] },
    { id: "plank", q: ["планка"], bad: ["боков", "обратн", "одной", "динамич"] },
    { id: "crunches", q: ["скручивания"], bad: ["обратн", "косые", "велосипед", "блоч", "римск", "наклонн"] }
  ];
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(10,10,12,.92);color:#fff;font:13px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;padding:24px;overflow:auto";
  overlay.innerHTML = '<h2 style="margin:0 0 8px">Сбор видео SmartWorkout</h2><div id="swlog" style="white-space:pre-wrap;color:#9aa0a6"></div>';
  document.body.appendChild(overlay);
  const log = (m) => { const el = overlay.querySelector("#swlog"); el.textContent += m + "\n"; };
  log("Собираю каталог...");
  const byHref = new Map();
  for (const cat of CATS) {
    try {
      const r = await fetch("/ru/biblioteka-uprazhneniy/" + cat, { credentials: "include" });
      if (!r.ok) { log("категория " + cat + ": " + r.status); continue; }
      const html = await r.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      doc.querySelectorAll('a[href*="/biblioteka-uprazhneniy/"]').forEach((a) => {
        const href = a.getAttribute("href");
        const title = (a.textContent || "").replace(/\s+/g, " ").trim();
        if (href && title.length > 2) byHref.set(href, title);
      });
      log("категория " + cat + ": ссылок " + byHref.size);
    } catch (e) { log("категория " + cat + ": ошибка " + e.message); }
  }
  const items = [...byHref.entries()].map(([href, title]) => ({ href, title }));
  const out = [];
  for (const t of TARGETS) {
    const cands = items.filter((x) => {
      const s = x.title.toLowerCase();
      return t.q.some((q) => s.includes(q)) && !t.bad.some((b) => s.includes(b));
    });
    if (!cands.length) { log("НЕ НАЙДЕНО: " + t.id); out.push({ id: t.id, missing: true }); continue; }
    const pick = cands[0];
    try {
      const r = await fetch(pick.href, { credentials: "include" });
      const html = await r.text();
      const m = html.match(/"videoDarkUrl":"([^"]+)"/) || html.match(/"contentUrl":"([^"]+)"/);
      if (!m) { log("нет видео: " + t.id + " — " + pick.title.slice(0, 40)); out.push({ id: t.id, title: pick.title, missing: true }); continue; }
      out.push({ id: t.id, title: pick.title, page: pick.href, video: m[1] });
      log("OK " + t.id + " — " + pick.title.slice(0, 50));
    } catch (e) { log("ошибка " + t.id + ": " + e.message); out.push({ id: t.id, title: pick.title, missing: true }); }
    await new Promise((res) => setTimeout(res, 250));
  }
  const blob = new Blob([JSON.stringify(out, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "smartworkout-videos.json";
  a.click();
  log("Готово. Файл smartworkout-videos.json скачан. Пропущено: " + out.filter((x) => x.missing).length);
})();
