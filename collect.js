(async function () {
  const CATS = ["grud", "spina", "nogi", "plechi", "ruki", "press", "yagodicy", "trapeciya"];
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(10,10,12,.94);color:#fff;font:13px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;padding:24px;overflow:auto";
  overlay.innerHTML = '<h2 style="margin:0 0 8px">Сбор библиотеки SmartWorkout</h2><div id="swlog" style="white-space:pre-wrap;color:#9aa0a6"></div>';
  document.body.appendChild(overlay);
  const log = (m) => { const el = overlay.querySelector("#swlog"); el.textContent += m + "\n"; };

  const links = new Map();
  for (const cat of CATS) {
    try {
      const r = await fetch("/ru/biblioteka-uprazhneniy/" + cat, { credentials: "include" });
      if (!r.ok) { log("раздел " + cat + ": " + r.status); continue; }
      const doc = new DOMParser().parseFromString(await r.text(), "text/html");
      doc.querySelectorAll('a[href*="/biblioteka-uprazhneniy/"]').forEach((a) => {
        const href = a.getAttribute("href");
        const title = (a.textContent || "").replace(/\s+/g, " ").trim();
        if (href && title.length > 2 && href.split("/").length > 5) links.set(href, title);
      });
      log("раздел " + cat + ": всего ссылок " + links.size);
    } catch (e) { log("раздел " + cat + ": ошибка " + e.message); }
  }

  const out = [];
  let n = 0;
  for (const [href, title] of links) {
    n++;
    try {
      const r = await fetch(href, { credentials: "include" });
      const html = await r.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      let ld = null;
      doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
        try { const j = JSON.parse(s.textContent); if (j && (j.name || j.description)) ld = Array.isArray(j) ? j[0] : j; } catch (e) {}
      });
      const vm = html.match(/"videoDarkUrl":"([^"]+)"/) || html.match(/"contentUrl":"([^"]+)"/);
      const im = html.match(/"thumbnail1":\{"uri":"([^"]+)"/) || html.match(/"image":\{"uri":"([^"]+)"/);
      const mm = html.match(/"muscles":\[([^\]]*)\]/);
      out.push({
        title: (ld && ld.name) || title,
        url: href,
        description: (ld && ld.description) || "",
        video: vm ? vm[1] : "",
        image: im ? im[1] : "",
        muscles: mm ? mm[1].replace(/"/g, "").split(",").map((x) => x.trim()) : [],
        bodyPart: (html.match(/"bodyPart":"([^"]+)"/) || [])[1] || "",
        page: location.origin + href,
      });
      if (n % 10 === 0) log("обработано " + n + " из " + links.size);
    } catch (e) { log("ошибка: " + href.slice(0, 60) + " — " + e.message); }
    await new Promise((res) => setTimeout(res, 120));
  }
  const blob = new Blob([JSON.stringify(out, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "smartworkout-library.json"; a.click();
  log("Готово: " + out.length + " упражнений. Файл smartworkout-library.json скачан.");
})();
