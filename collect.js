(async function () {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(10,10,12,.94);color:#fff;font:13px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;padding:24px;overflow:auto";
  overlay.innerHTML = '<h2 style="margin:0 0 8px">Сбор библиотеки SmartWorkout</h2><div id="swlog" style="white-space:pre-wrap;color:#9aa0a6"></div>';
  document.body.appendChild(overlay);
  const log = (m) => { const el = overlay.querySelector("#swlog"); el.textContent += m + "\n"; };

  let buildId = "";
  try {
    const nd = document.querySelector("#__NEXT_DATA__");
    buildId = JSON.parse(nd.textContent).buildId;
  } catch (e) {}
  if (!buildId) { log("Не нашёл buildId. Открой любую страницу упражнения и запусти снова."); return; }
  log("buildId " + buildId);

  async function data(path) {
    const r = await fetch("/_next/data/" + buildId + path + ".json", { credentials: "include" });
    if (!r.ok) throw new Error(r.status + " " + path);
    const j = await r.json();
    return j.pageProps || {};
  }

  const CATS = ["grud", "spina", "nogi", "plechi", "press", "yagodicy", "ruki", "biceps", "triceps", "trapeciya"];
  const paths = new Map();
  for (const cat of CATS) {
    try {
      const pp = await data("/ru/biblioteka-uprazhneniy/" + cat);
      const list = pp.exercises || [];
      list.forEach((x) => { if (x.path) paths.set(x.path, x.translations && x.translations.ru || x.path); });
      log("раздел " + cat + ": " + list.length + " (всего " + paths.size + ")");
    } catch (e) { log("раздел " + cat + ": " + e.message); }
  }

  const out = [];
  let n = 0;
  for (const [path, title0] of paths) {
    n++;
    try {
      const pp = await data(path);
      const ex = pp.exercise || {};
      const ru = (ex.translations && ex.translations.ru) || title0;
      const desc = ex.descriptions && (ex.descriptions.ru || Object.values(ex.descriptions)[0]) || "";
      const tips = ex.tips && (ex.tips.ru || Object.values(ex.tips)[0]) || "";
      const mistakes = ex.commonMistakes && (ex.commonMistakes.ru || Object.values(ex.commonMistakes)[0]) || "";
      const instr = ex.instructions && (ex.instructions.ru || Object.values(ex.instructions)[0]) || "";
      out.push({
        title: ru,
        titleEn: ex.translations && ex.translations.en || "",
        path,
        description: desc,
        instructions: instr,
        tips,
        mistakes,
        video: ex.videoDarkUrl || "",
        image: (ex.thumbnail1 && ex.thumbnail1.uri) || (ex.image && ex.image.uri) || "",
        muscles: ex.muscles || [],
        bodyPart: ex.bodyPart || "",
        tags: ex.tags || [],
      });
      if (n % 25 === 0) log("обработано " + n + " из " + paths.size);
    } catch (e) { log("ошибка " + path.split("/").pop() + ": " + e.message); }
    await new Promise((res) => setTimeout(res, 80));
  }
  const blob = new Blob([JSON.stringify(out, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "smartworkout-library.json"; a.click();
  log("Готово: " + out.length + " упражнений. Файл smartworkout-library.json скачан.");
})();
