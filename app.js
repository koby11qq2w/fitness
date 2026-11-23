/* Тренировки — страница-дневник.
   Схемы упражнений и карта мышц рисуются прямо здесь, без внешних картинок. */

/* ---------- справочник мышц ---------- */
const MUS = {
  chest: "грудь", triceps: "трицепс", delts: "дельты", abs: "пресс",
  quads: "квадрицепс", glutes: "ягодицы", hamstrings: "бицепс бедра",
  lower_back: "поясница", traps: "трапеция", lats: "широчайшие",
  biceps: "бицепс", forearms: "предплечья", calves: "голени", obliques: "косые",
  adductors: "приводящие",
};

/* ---------- позы для схем (вид сбоку, поле 200×140) ---------- */
const pt = (h, n, s, e, w, p, k, a, extra) =>
  Object.assign({ h, n, s, e, w, p, k, a }, extra || {});

const POSES = {
  stand: pt([100, 22], [100, 32], [100, 40], [100, 57], [100, 72], [100, 74], [100, 101], [100, 126]),

  benchStart: pt([58, 80], [68, 84], [78, 84], [86, 72], [78, 66], [116, 86], [132, 104], [140, 126]),
  benchEnd: pt([58, 80], [68, 84], [78, 84], [80, 68], [78, 46], [116, 86], [132, 104], [140, 126]),

  dbStart: pt([58, 80], [68, 84], [78, 84], [84, 70], [74, 64], [116, 86], [132, 104], [140, 126]),
  dbEnd: pt([58, 80], [68, 84], [78, 84], [80, 66], [76, 44], [116, 86], [132, 104], [140, 126]),

  pushStart: pt([152, 74], [144, 80], [138, 86], [142, 104], [148, 126], [106, 100], [86, 110], [70, 120], { foot: true }),
  pushEnd: pt([152, 90], [144, 96], [138, 100], [154, 112], [148, 126], [106, 110], [86, 115], [70, 121], { foot: true }),

  squatStart: pt([100, 22], [100, 32], [100, 40], [100, 57], [100, 72], [100, 74], [100, 101], [100, 126]),
  squatEnd: pt([92, 40], [94, 48], [94, 56], [94, 73], [94, 86], [86, 88], [112, 104], [100, 126]),

  deadStart: pt([124, 60], [116, 66], [110, 72], [110, 90], [110, 104], [86, 80], [94, 104], [94, 126]),
  deadEnd: pt([94, 24], [94, 32], [94, 40], [94, 58], [94, 76], [94, 76], [94, 102], [94, 126]),

  rdlStart: pt([94, 24], [94, 32], [94, 40], [94, 58], [94, 76], [94, 76], [94, 102], [94, 126]),
  rdlEnd: pt([122, 58], [114, 64], [108, 70], [108, 88], [108, 100], [86, 80], [92, 104], [92, 126]),

  lungeStart: pt([100, 22], [100, 32], [100, 40], [100, 57], [100, 72], [100, 74], [100, 101], [100, 126]),
  lungeEnd: pt([98, 24], [98, 34], [98, 42], [98, 58], [98, 74], [96, 80], [124, 104], [128, 126], { k2: [78, 104], a2: [64, 124] }),

  calfStart: pt([100, 22], [100, 32], [100, 40], [100, 57], [100, 72], [100, 74], [100, 101], [100, 126]),
  calfEnd: pt([100, 17], [100, 27], [100, 35], [100, 52], [100, 67], [100, 69], [100, 96], [100, 119], { tiptoe: true }),

  rowStart: pt([122, 58], [114, 64], [108, 70], [108, 90], [108, 104], [84, 80], [92, 104], [92, 126]),
  rowEnd: pt([122, 58], [114, 64], [108, 70], [110, 76], [102, 84], [84, 80], [92, 104], [92, 126]),

  pullStart: pt([94, 38], [94, 48], [94, 52], [92, 34], [86, 16], [94, 86], [94, 108], [92, 126]),
  pullEnd: pt([94, 22], [94, 32], [94, 36], [80, 26], [86, 16], [94, 70], [94, 92], [92, 110]),

  ohpStart: pt([100, 22], [100, 32], [100, 40], [108, 52], [100, 44], [100, 74], [100, 101], [100, 126]),
  ohpEnd: pt([100, 22], [100, 32], [100, 40], [100, 28], [100, 14], [100, 74], [100, 101], [100, 126]),

  curlStart: pt([100, 22], [100, 32], [100, 40], [100, 57], [100, 74], [100, 74], [100, 101], [100, 126]),
  curlEnd: pt([100, 22], [100, 32], [100, 40], [100, 57], [84, 52], [100, 74], [100, 101], [100, 126]),

  triStart: pt([58, 80], [68, 84], [78, 84], [80, 64], [66, 62], [116, 86], [132, 104], [140, 126]),
  triEnd: pt([58, 80], [68, 84], [78, 84], [80, 64], [80, 42], [116, 86], [132, 104], [140, 126]),

  plank: pt([152, 76], [144, 82], [138, 88], [144, 116], [160, 120], [104, 102], [82, 112], [66, 120], { foot: true }),

  crunchStart: pt([60, 108], [68, 112], [74, 114], [84, 112], [94, 108], [108, 116], [118, 96], [130, 126]),
  crunchEnd: pt([68, 92], [76, 98], [82, 102], [90, 100], [98, 96], [108, 116], [118, 96], [130, 126]),
};

/* Схемы: какое оборудование и откуда куда идёт движение */
const PICS = {
  bench:    { a: "benchStart", b: "benchEnd", bench: true, plate: "w", arrow: [[78, 64], [78, 48]] },
  dbpress:  { a: "dbStart", b: "dbEnd", bench: true, db: "w", arrow: [[74, 64], [76, 46]] },
  pushups:  { a: "pushStart", b: "pushEnd", arrow: [[106, 96], [106, 112]] },
  squat:    { a: "squatStart", b: "squatEnd", plate: "s", arrow: [[80, 80], [76, 104]] },
  deadlift: { a: "deadStart", b: "deadEnd", plate: "w", arrow: [[118, 102], [118, 82]] },
  rdl:      { a: "rdlStart", b: "rdlEnd", plate: "w", arrow: [[116, 90], [116, 106]] },
  lunges:   { a: "lungeStart", b: "lungeEnd", db: "w", arrow: [[112, 88], [126, 88]] },
  calf:     { a: "calfStart", b: "calfEnd", arrow: [[114, 112], [114, 94]] },
  row:      { a: "rowStart", b: "rowEnd", plate: "w", arrow: [[112, 100], [106, 88]] },
  pullups:  { a: "pullStart", b: "pullEnd", topbar: true, arrow: [[108, 100], [108, 80]] },
  ohp:      { a: "ohpStart", b: "ohpEnd", plate: "w", arrow: [[112, 42], [112, 24]] },
  curl:     { a: "curlStart", b: "curlEnd", db: "w", arrow: [[100, 72], [86, 56]] },
  triceps:  { a: "triStart", b: "triEnd", bench: true, db: "w", arrow: [[68, 60], [78, 46]] },
  plank:    { a: "plank", b: null },
  crunches: { a: "crunchStart", b: "crunchEnd", arrow: [[72, 110], [70, 94]] },
};

/* ---------- каталог упражнений ---------- */
const CATALOG = [
  { id: "bench", img: "img/ex/bench-dark.jpg", name: "Жим штанги лёжа", group: "Грудь", eq: "штанга · скамья", kind: "weight",
    p: ["chest", "triceps"], s: ["delts"],
    cue: "Лопатки сведены, ступни в пол. Гриф опускаем к низу груди за 2 секунды, жмём по дуге. Не отбивать." },
  { id: "dbpress", img: "img/ex/dbpress-dark.jpg", name: "Жим гантелей лёжа", group: "Грудь", eq: "гантели · скамья", kind: "weight",
    p: ["chest", "triceps"], s: ["delts"],
    cue: "Ладони друг к другу, локти под 45°. Внизу — растяжение груди, вверху гантели почти сходятся." },
  { id: "pushups", name: "Отжимания", group: "Грудь", eq: "свой вес", kind: "reps",
    p: ["chest", "triceps"], s: ["delts", "abs"],
    cue: "Корпус одной линией, локти ближе к телу. Грудь опускается к полу, поясница не проваливается." },

  { id: "legpress", img: "img/ex/legpress-dark.jpg", name: "Жим ногами", group: "Ноги", eq: "тренажёр", kind: "weight",
    p: ["quads", "glutes"], s: ["hamstrings", "calves"],
    cue: "Спина и таз прижаты, колени идут по носкам. Не выпрямляйте ноги до щелчка, опускайте плавно." },
  { id: "pecfly", img: "img/ex/pecfly-dark.jpg", name: "Бабочка", group: "Грудь", eq: "тренажёр", kind: "weight",
    p: ["chest"], s: ["delts"],
    cue: "Локти на уровне груди, сводим руки за счёт груди. В крайней точке — короткая пауза, назад медленно." },
  { id: "hammerpress", img: "img/ex/hammerpress-dark.jpg", name: "Жим в Хаммере", group: "Грудь", eq: "тренажёр", kind: "weight",
    p: ["chest", "triceps"], s: ["delts"],
    cue: "Рукоятки на уровне груди, лопатки сведены. Жмём вперёд до выпрямления рук, локти не разводим." },
  { id: "deadlift", img: "img/ex/deadlift-dark.jpg", name: "Становая тяга", group: "Ноги", eq: "штанга", kind: "weight",
    p: ["hamstrings", "glutes", "lower_back"], s: ["traps", "lats", "forearms", "quads"],
    cue: "Гриф у голени, спина прямая. Толкаем пол ногами, штанга скользит по ногам, таз и плечи встают вместе." },
  { id: "squat", img: "img/ex/squat-dark.jpg", name: "Приседания со штангой", group: "Ноги", eq: "штанга · стойки", kind: "weight",
    p: ["quads", "glutes"], s: ["hamstrings", "lower_back", "abs"],
    cue: "Стопы на ширине плеч, колени идут по носкам. Таз уходит назад, спина прямая, взгляд вперёд." },
  { id: "rdl", img: "img/ex/rdl-dark.jpg", name: "Румынская тяга", group: "Ноги", eq: "штанга", kind: "weight",
    p: ["hamstrings", "glutes"], s: ["lower_back", "forearms"],
    cue: "Ноги почти прямые, таз назад, гриф скользит по бёдрам. Опускаемся до натяжения под коленом." },
  { id: "lunges", img: "img/ex/lunges-dark.jpg", name: "Выпады с гантелями", group: "Ноги", eq: "гантели", kind: "weight",
    p: ["quads", "glutes"], s: ["hamstrings", "calves"],
    cue: "Шаг вперёд, колено над стопой. Заднее колено почти касается пола, корпус вертикально." },
  { id: "legcurl", img: "img/ex/legcurl-dark.jpg", name: "Сгибание ног", group: "Ноги", eq: "тренажёр", kind: "weight",
    p: ["hamstrings"], s: ["calves"],
    cue: "Пятка идёт к ягодице, таз не отрывается. Внизу — медленное опускание, без рывка." },
  { id: "legext", img: "img/ex/legext-dark.jpg", name: "Разгибание ног", group: "Ноги", eq: "тренажёр", kind: "weight",
    p: ["quads"], s: [],
    cue: "Колени по оси тренажёра, разгибаем до конца и держим секунду. Вес не бросаем." },
  { id: "adductor", name: "Сведение ног", group: "Ноги", eq: "тренажёр", kind: "weight",
    p: ["adductors"], s: ["quads"],
    cue: "Спина прижата, сводим ноги плавно и держим секунду. Разводим медленно, без удара." },
  { id: "hipthrust", name: "Ягодичный мост", group: "Ноги", eq: "тренажёр", kind: "weight",
    p: ["glutes"], s: ["hamstrings", "lower_back"],
    cue: "Лопатки на скамье, таз вверх до прямой линии. Вверху сжимаем ягодицы, поясницу не прогибаем." },
  { id: "calf", img: "img/ex/calf-dark.jpg", name: "Подъём на носки", group: "Ноги", eq: "свой вес / гантели", kind: "weight",
    p: ["calves"], s: [],
    cue: "Поднимаемся максимально высоко, внизу — полная растяжка. Пауза 1 секунда вверху, без рывков." },

  { id: "row", img: "img/ex/row-dark.jpg", name: "Тяга штанги в наклоне", group: "Спина", eq: "штанга", kind: "weight",
    p: ["lats", "traps"], s: ["biceps", "forearms", "lower_back"],
    cue: "Наклон 45°, спина прямая. Тянем гриф к поясу, локти вдоль тела, лопатки сводим." },
  { id: "machrow", img: "img/ex/machrow-dark.jpg", name: "Рычажная тяга", group: "Спина", eq: "тренажёр", kind: "weight",
    p: ["lats", "traps"], s: ["biceps", "forearms"],
    cue: "Тянем рукоять к поясу, лопатки сводим. Корпус неподвижен, работаем спиной." },
  { id: "lattro", img: "img/ex/lattro-dark.jpg", name: "Тяга верхнего блока", group: "Спина", eq: "блок", kind: "weight",
    p: ["lats"], s: ["biceps", "traps"],
    cue: "Тянем рукоять к груди, локти вниз. Вверх — медленно, без раскачки." },
  { id: "cablerow", img: "img/ex/cablerow-dark.jpg", name: "Горизонтальная тяга", group: "Спина", eq: "блок", kind: "weight",
    p: ["lats", "traps"], s: ["biceps", "forearms"],
    cue: "Спина прямая, тянем к животу. Сводим лопатки, корпус не заваливаем назад." },
  { id: "pullups", img: "img/ex/pullups-dark.jpg", name: "Подтягивания", group: "Спина", eq: "перекладина", kind: "reps",
    p: ["lats", "biceps"], s: ["traps", "forearms", "abs"],
    cue: "Хват чуть шире плеч, тянем грудью к перекладине. Опускаемся медленно, без раскачки." },

  { id: "ohp", img: "img/ex/ohp-dark.jpg", name: "Жим стоя", group: "Плечи", eq: "штанга", kind: "weight",
    p: ["delts", "triceps"], s: ["traps", "abs"],
    cue: "Штанга на груди, пресс собран. Жмём вверх, голову убираем, вверху штанга над серединой стопы." },

  { id: "reardelt", img: "img/ex/reardelt-dark.jpg", name: "Обратная бабочка", group: "Плечи", eq: "тренажёр", kind: "weight",
    p: ["delts"], s: ["traps"],
    cue: "Руки в стороны, лопатки сведены. Тянем задней дельтой, корпус не раскачиваем." },
  { id: "lateral", img: "img/ex/lateral-dark.jpg", name: "Махи в стороны", group: "Плечи", eq: "гантели / тренажёр", kind: "weight",
    p: ["delts"], s: ["traps"],
    cue: "Поднимаем руки до уровня плеч, локти чуть согнуты. Без рывков и без помощи корпусом." },
  { id: "uprightrow", img: "img/ex/uprightrow-dark.jpg", name: "Протяжка к подбородку", group: "Плечи", eq: "штанга / блок", kind: "weight",
    p: ["delts", "traps"], s: ["biceps"],
    cue: "Тянем гриф вдоль тела к подбородку, локти выше кистей. Вверх — выдох, без рывка." },
  { id: "curl", img: "img/ex/curl-dark.jpg", name: "Подъём на бицепс", group: "Руки", eq: "гантели / штанга", kind: "weight",
    p: ["biceps"], s: ["forearms"],
    cue: "Локти прижаты, работаем только предплечьем. Внизу не расслабляем, вверху — пауза." },
  { id: "triceps", img: "img/ex/triceps-dark.jpg", name: "Разгибание на трицепс", group: "Руки", eq: "гантель · скамья", kind: "weight",
    p: ["triceps"], s: ["forearms"],
    cue: "Локти смотрят в потолок и не двигаются. Разгибаем до конца, опускаем за голову медленно." },

  { id: "plank", name: "Планка", group: "Пресс", eq: "свой вес", kind: "time",
    p: ["abs", "obliques"], s: ["lower_back", "glutes", "delts"],
    cue: "Локти под плечами, таз не провисает и не задирается. Дышим ровно, держим до 60 секунд." },
  { id: "crunches", img: "img/ex/crunches-dark.jpg", name: "Скручивания", group: "Пресс", eq: "свой вес", kind: "reps",
    p: ["abs"], s: ["obliques"],
    cue: "Поясница на полу, поднимаем лопатки, а не шею. Вверху выдох, внизу не ложимся полностью." },
];

const GROUPS = ["Все", "Грудь", "Спина", "Ноги", "Плечи", "Руки", "Пресс", "Другое"];

/* ---------- состояние ---------- */
const state = { p: "tim", data: null, group: "Все", ex: null, view: "grid", dlg: null };

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const today = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
function fmtD(iso, full) {
  const [y, m, d] = String(iso).split("-");
  return full ? `${d}.${m}.${y}` : `${d}.${m}`;
}
const num = (n) => (Math.round(n * 10) / 10).toLocaleString("ru-RU");
const kg = (n) => Math.round(n).toLocaleString("ru-RU");


const PIC_ALIAS = { hammerpress: "bench", reardelt: "pecfly", lateral: "pecfly",
  machrow: "row", lattro: "pullups", cablerow: "row", uprightrow: "curl" };

/* ---------- отдельные схемы для тренажёров ---------- */
const CUSTOM_PIC = {
  legpress: `<svg viewBox="0 0 360 170" role="img" aria-label="Жим ногами — схема и мышцы">
    <rect width="360" height="170" fill="#f6f2e8"/>
    <g stroke="#9a958a" stroke-width="2" fill="none" stroke-linecap="round">
      <line x1="18" y1="158" x2="342" y2="158"/>
      <line x1="69" y1="42" x2="250" y2="66"/>
      <line x1="69" y1="132" x2="250" y2="138"/>
      <line x1="300" y1="62" x2="322" y2="58"/>
      <line x1="316" y1="58" x2="322" y2="140"/>
    </g>
    <g fill="#ded8cb" stroke="#8f8a80" stroke-width="1.6">
      <rect x="62" y="38" width="12" height="96" rx="2"/>
      <polygon points="248,62 294,58 302,128 256,132"/>
      <rect x="248" y="130" width="58" height="10" rx="3"/>
      <rect x="300" y="58" width="22" height="82" rx="3"/>
    </g>
    <g stroke="#b9b2a5" stroke-width="1">
      <line x1="66" y1="46" x2="66" y2="128"/><line x1="71" y1="44" x2="71" y2="129"/>
    </g>
    <!-- кожа -->
    <g fill="#efdfcb" stroke="#3d3831" stroke-width="1.7" stroke-linejoin="round">
      <circle cx="250" cy="56" r="11"/>
      <path d="M243,68 C236,78 234,94 240,108 C246,120 258,128 270,132 L282,126 C286,108 280,84 266,70 L260,64 Z"/>
      <path d="M247,74 C234,84 226,98 220,112 L230,116 C238,104 246,92 256,82 Z"/>
      <path d="M266,116 C240,108 206,100 176,96 C168,108 168,120 176,124 C206,132 240,140 264,140 Z"/>
      <path d="M174,104 C150,98 124,92 104,86 C98,94 98,102 104,108 C126,116 152,122 174,124 Z"/>
      <path d="M104,86 L90,78 L84,86 L98,96 Z"/>
    </g>
    <!-- мышцы -->
    <g stroke="#3d3831" stroke-width=".9">
      <ellipse cx="276" cy="126" rx="12" ry="10" fill="#7b4f9e"/>
      <path d="M258,110 C234,102 204,98 178,96 L178,108 C206,112 236,120 258,126 Z" fill="#b83a2e"/>
      <path d="M260,128 C236,132 206,126 180,118 L180,126 C206,134 236,142 258,140 Z" fill="#2f6fb2"/>
      <path d="M170,104 C148,98 124,92 106,86 L106,96 C126,104 150,110 172,118 Z" fill="#3f8f4e"/>
      <path d="M246,70 C240,82 240,96 246,108 L254,112 C250,98 250,82 254,72 Z" fill="#d9a441"/>
      <path d="M266,70 C274,84 276,100 270,116 L278,118 C284,100 282,82 274,68 Z" fill="#c98a2e"/>
      <ellipse cx="256" cy="72" rx="7" ry="5" fill="#b83a2e" opacity=".85"/>
    </g>
    <g fill="none" stroke="#3d3831" stroke-width="1" opacity=".5">
      <path d="M258,110 C234,102 204,98 178,96"/>
      <path d="M260,128 C236,132 206,126 180,118"/>
      <path d="M170,104 C148,98 124,92 106,86"/>
      <path d="M246,70 C240,82 240,96 246,108"/>
      <path d="M266,70 C274,84 276,100 270,116"/>
    </g>
    <g font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="9" fill="#6b6458">
      <text x="12" y="18">ЖИМ НОГАМИ</text>
      <text x="300" y="18" text-anchor="end">вид сбоку</text>
    </g>
  </svg>`,
  pecfly: `<svg viewBox="8 2 184 134" role="img" aria-label="Бабочка">
    <rect x="78" y="84" width="44" height="8" rx="3" fill="#3a4047"/>
    <line x1="86" y1="92" x2="86" y2="126" stroke="#3a4047" stroke-width="4"/>
    <line x1="114" y1="92" x2="114" y2="126" stroke="#3a4047" stroke-width="4"/>
    <line x1="10" y1="130" x2="190" y2="130" stroke="#2a2e33"/>
    <g opacity=".5" stroke="#5f6670" stroke-width="4.5" fill="none" stroke-linecap="round">
      <circle cx="100" cy="32" r="7" fill="#17191d" stroke="#5f6670" stroke-width="4"/>
      <line x1="100" y1="40" x2="100" y2="82" stroke-width="8"/>
      <polyline points="88,52 76,58 66,64"/><polyline points="112,52 124,58 134,64"/>
      <line x1="100" y1="82" x2="88" y2="108" stroke-width="6"/><line x1="100" y1="82" x2="112" y2="108" stroke-width="6"/>
    </g>
    <g stroke="#e8e8ea" stroke-width="4.5" fill="none" stroke-linecap="round">
      <circle cx="100" cy="32" r="7" fill="#17191d" stroke="#e8e8ea" stroke-width="4"/>
      <line x1="100" y1="40" x2="100" y2="82" stroke-width="8"/>
      <polyline points="88,52 70,54 56,56"/><polyline points="112,52 130,54 144,56"/>
      <line x1="56" y1="46" x2="56" y2="66" stroke-width="5"/><line x1="144" y1="46" x2="144" y2="66" stroke-width="5"/>
      <line x1="100" y1="82" x2="88" y2="108" stroke-width="6"/><line x1="100" y1="82" x2="112" y2="108" stroke-width="6"/>
      <line x1="88" y1="108" x2="86" y2="126"/><line x1="112" y1="108" x2="114" y2="126"/>
    </g>
    <path d="M78,72 Q68,66 58,62" stroke="var(--acc)" stroke-width="2" fill="none" stroke-dasharray="4 3"/>
    <polygon points="58,62 65,61 62,67" fill="var(--acc)"/>
    <path d="M122,72 Q132,66 142,62" stroke="var(--acc)" stroke-width="2" fill="none" stroke-dasharray="4 3"/>
    <polygon points="142,62 135,61 138,67" fill="var(--acc)"/>
  </svg>`,
};

/* ---------- рисунок человека ---------- */
function poseSvg(P, color, opts) {
  opts = opts || {};
  const far = "#666d76";
  const off = [5, -2];
  const k2 = P.k2 || [P.k[0] + off[0], P.k[1] + off[1]];
  const a2 = P.a2 || [P.a[0] + off[0], P.a[1] + off[1]];
  const e2 = P.e2 || [P.e[0] + off[0], P.e[1] + off[1]];
  const w2 = P.w2 || [P.w[0] + off[0], P.w[1] + off[1]];
  const line = (pts, w2d, col) =>
    `<polyline points="${pts.map((q) => q.join(",")).join(" ")}" fill="none" stroke="${col}" stroke-width="${w2d}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const foot = (a, dx) => line([a, [a[0] + (dx || 8), a[1] + (P.tiptoe ? 8 : 0)]], 4.5, color);
  return `<g>
    ${line([P.p, k2, a2], 5.5, far)}
    ${line([P.s, e2, w2], 5, far)}
    ${line([P.n, P.p], 8.5, color)}
    ${line([P.s, P.e, P.w], 6, color)}
    ${line([P.p, P.k, P.a], 7, color)}
    <circle cx="${P.h[0]}" cy="${P.h[1]}" r="8" fill="#17191d" stroke="${color}" stroke-width="4.5"/>
    ${foot(P.a)}
  </g>`;
}

function arrow(x1, y1, x2, y2) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h = 5;
  const p1 = [x2 - h * Math.cos(ang - 0.5), y2 - h * Math.sin(ang - 0.5)];
  const p2 = [x2 - h * Math.cos(ang + 0.5), y2 - h * Math.sin(ang + 0.5)];
  return `<g class="arr"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--acc)" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round"/>
    <polygon points="${p1.join(",")} ${p2.join(",")} ${x2},${y2}" fill="var(--acc)"/></g>`;
}

function customPicSvg(EX) {
  return `<svg viewBox="0 0 200 140" role="img" aria-label="${esc(EX.name)}">
    <rect x="30" y="24" width="140" height="92" rx="12" fill="#1b1d21" stroke="#3a3f46" stroke-width="1.5"/>
    <g stroke="#c9d1d9" stroke-width="5" stroke-linecap="round" fill="none">
      <line x1="74" y1="70" x2="126" y2="70"/>
      <line x1="66" y1="54" x2="66" y2="86"/>
      <line x1="58" y1="60" x2="58" y2="80"/>
      <line x1="134" y1="54" x2="134" y2="86"/>
      <line x1="142" y1="60" x2="142" y2="80"/>
    </g>
    <text x="100" y="112" text-anchor="middle" fill="#9aa0a6" font-size="9">${esc(EX.name).slice(0, 28)}</text>
  </svg>`;
}

function pictoSvg(EX, cls) {
  if (EX.custom) return customPicSvg(EX);
  if (CUSTOM_PIC[EX.id]) return CUSTOM_PIC[EX.id].replace("<svg ", '<svg class="' + (cls || "") + '" ');
  const pic = PICS[EX.id] || PICS[PIC_ALIAS[EX.id]];
  if (!pic) return "";
  const A = POSES[pic.a];
  const B = pic.b ? POSES[pic.b] : null;
  const bar = (q) => `<g class="eq">
      <line x1="${q[0] - 17}" y1="${q[1]}" x2="${q[0] + 17}" y2="${q[1]}" stroke="#aeb6bf" stroke-width="2.6"/>
      <circle cx="${q[0] - 17}" cy="${q[1]}" r="4.6" fill="#aeb6bf"/>
      <circle cx="${q[0] + 17}" cy="${q[1]}" r="4.6" fill="#aeb6bf"/></g>`;
  const db = (q) => `<g class="eq" stroke="#aeb6bf" stroke-linecap="round">
      <line x1="${q[0] - 8}" y1="${q[1]}" x2="${q[0] + 8}" y2="${q[1]}" stroke-width="3"/>
      <line x1="${q[0] - 8}" y1="${q[1] - 5}" x2="${q[0] - 8}" y2="${q[1] + 5}" stroke-width="5"/>
      <line x1="${q[0] + 8}" y1="${q[1] - 5}" x2="${q[0] + 8}" y2="${q[1] + 5}" stroke-width="5"/></g>`;
  const bench = pic.bench
    ? `<g class="eq"><rect x="52" y="88" width="104" height="7" rx="3" fill="#3a4047"/>
        <line x1="64" y1="95" x2="64" y2="126" stroke="#3a4047" stroke-width="4"/>
        <line x1="144" y1="95" x2="144" y2="126" stroke="#3a4047" stroke-width="4"/></g>`
    : "";
  const topbar = pic.topbar
    ? `<line x1="56" y1="16" x2="144" y2="16" stroke="#aeb6bf" stroke-width="4" stroke-linecap="round"/>`
    : "";
  /* сдвигаем схему к центру карточки */
  let xs = [], ys = [];
  [A, B].filter(Boolean).forEach((P) => {
    [P.h, P.n, P.s, P.e, P.w, P.p, P.k, P.a].forEach((q) => { xs.push(q[0]); ys.push(q[1]); });
  });
  const dx = 100 - (Math.min(...xs) + Math.max(...xs)) / 2;
  const W = B || A; /* снаряд рисуем в конечном положении, чтобы не было лишних колец */
  const plate = (P) => (pic.plate ? bar(P[pic.plate]) : "");
  const dbs = (P) => (pic.db ? db(P[pic.db]) : "");
  const arr = pic.arrow ? arrow(pic.arrow[0][0] + dx, pic.arrow[0][1], pic.arrow[1][0] + dx, pic.arrow[1][1]) : "";
  return `<svg viewBox="10 2 180 134" class="${cls || ""}" role="img" aria-label="${esc(EX.name)}">
    <line x1="12" y1="130" x2="188" y2="130" stroke="#2a2e33" stroke-width="1"/>
    <g transform="translate(${dx.toFixed(1)},0)">
      ${topbar}${bench}
      ${B ? poseSvg(A, "#5f6670") : poseSvg(A, "#e8e8ea")}
      ${B ? poseSvg(B, "#e8e8ea") : ""}
      ${plate(W)}${dbs(W)}
    </g>
    ${arr}
  </svg>`;
}

/* ---------- карта мышц ---------- */
const SIL = "M60,36 C50,36 45,41 44,48 C38,50 35,56 33,63 C30,71 28,77 27,85 C26,91 25,97 24,103 C23,107 24,110 27,110 C30,110 32,107 33,103 C34,97 36,91 38,85 C40,79 42,74 44,70 C42,78 40,86 40,93 C40,99 42,103 43,107 C45,113 45,121 46,133 C46,145 46,153 46,159 C47,171 47,185 47,196 C47,203 46,207 46,210 L57,210 C57,206 57,201 57,197 C57,185 56,171 56,158 C56,144 57,132 58,124 C59,120 60,118 60,118 C60,118 61,120 62,124 C63,132 64,144 64,158 C64,171 63,185 63,197 C63,201 63,206 63,210 L74,210 C74,207 73,203 73,196 C73,185 73,171 74,159 C74,153 74,145 74,133 C75,121 75,113 77,107 C78,103 80,99 80,93 C80,86 78,78 76,70 C78,74 80,79 82,85 C84,91 86,97 87,103 C88,107 90,110 93,110 C96,110 97,107 96,103 C95,97 94,91 93,85 C92,77 90,71 87,63 C85,56 82,50 76,48 C75,41 70,36 60,36 Z";

const BASE_BODY = `<ellipse cx="60" cy="22" rx="12" ry="14"/>
  <path d="M53,33 L67,33 L67,43 L53,43 Z"/>
  <path d="${SIL}"/>`;

const BODY_FRONT = [
  { base: true, el: BASE_BODY },
  { m: "delts", el: `<ellipse cx="40" cy="50" rx="8" ry="7"/><ellipse cx="80" cy="50" rx="8" ry="7"/>` },
  { m: "chest", el: `<path d="M46,55 C44,60 45,68 51,72 C57,75 59,72 59,66 L59,56 C54,53 49,53 46,55 Z"/>
    <path d="M74,55 C76,60 75,68 69,72 C63,75 61,72 61,66 L61,56 C66,53 71,53 74,55 Z"/>` },
  { m: "abs", el: `<rect x="53.5" y="75" width="5.6" height="5.6" rx="1.4"/><rect x="60.9" y="75" width="5.6" height="5.6" rx="1.4"/>
    <rect x="53.5" y="82" width="5.6" height="5.6" rx="1.4"/><rect x="60.9" y="82" width="5.6" height="5.6" rx="1.4"/>
    <rect x="53.5" y="89" width="5.6" height="5.6" rx="1.4"/><rect x="60.9" y="89" width="5.6" height="5.6" rx="1.4"/>` },
  { m: "obliques", el: `<path d="M45,76 L52,78 L52,96 L47,97 L44,88 Z"/><path d="M75,76 L68,78 L68,96 L73,97 L76,88 Z"/>` },
  { m: "biceps", el: `<ellipse cx="34" cy="64" rx="4.8" ry="8.5" transform="rotate(-11 34 64)"/>
    <ellipse cx="86" cy="64" rx="4.8" ry="8.5" transform="rotate(11 86 64)"/>` },
  { m: "forearms", el: `<ellipse cx="29.5" cy="83" rx="3.8" ry="7.5" transform="rotate(-13 29.5 83)"/>
    <ellipse cx="90.5" cy="83" rx="3.8" ry="7.5" transform="rotate(13 90.5 83)"/>` },
  { m: "adductors", el: `<path d="M55,112 L59,112 L58.5,150 L55.5,150 Z"/><path d="M61,112 L65,112 L64.5,150 L61.5,150 Z"/>` },
  { m: "quads", el: `<path d="M49,112 L57,112 L55.8,152 L50,152 Z"/><path d="M63,112 L71,112 L70,152 L64.2,152 Z"/>` },
  { m: "calves", el: `<path d="M50,163 C48,174 49,188 51,197 L56,197 C58,188 58,174 56,163 Z"/>
    <path d="M64,163 C62,174 63,188 65,197 L70,197 C72,188 72,174 70,163 Z"/>` },
];

const BODY_BACK = [
  { base: true, el: BASE_BODY },
  { m: "delts", el: `<ellipse cx="40" cy="50" rx="8" ry="7"/><ellipse cx="80" cy="50" rx="8" ry="7"/>` },
  { m: "traps", el: `<path d="M60,37 L74,46 L67,63 L60,69 L53,63 L46,46 Z"/>` },
  { m: "lats", el: `<path d="M45,56 C42,66 43,82 49,92 L57,88 L58,62 Z"/><path d="M75,56 C78,66 77,82 71,92 L63,88 L62,62 Z"/>` },
  { m: "lower_back", el: `<path d="M54,87 L66,87 L65,104 L55,104 Z"/>` },
  { m: "triceps", el: `<ellipse cx="34" cy="64" rx="4.8" ry="8.5" transform="rotate(-11 34 64)"/>
    <ellipse cx="86" cy="64" rx="4.8" ry="8.5" transform="rotate(11 86 64)"/>` },
  { m: "forearms", el: `<ellipse cx="29.5" cy="83" rx="3.8" ry="7.5" transform="rotate(-13 29.5 83)"/>
    <ellipse cx="90.5" cy="83" rx="3.8" ry="7.5" transform="rotate(13 90.5 83)"/>` },
  { m: "glutes", el: `<circle cx="52" cy="108" r="8.5"/><circle cx="68" cy="108" r="8.5"/>` },
  { m: "hamstrings", el: `<path d="M49,119 L57,119 L56,154 L50,154 Z"/><path d="M63,119 L71,119 L70,154 L64,154 Z"/>` },
  { m: "calves", el: `<path d="M50,163 C48,174 49,188 51,197 L56,197 C58,188 58,174 56,163 Z"/>
    <path d="M64,163 C62,174 63,188 65,197 L70,197 C72,188 72,174 70,163 Z"/>` },
];

function bodyFigure(shapes, primary, secondary) {
  return shapes.map((it) => {
    if (it.base) return `<g fill="#22262b" stroke="#343941" stroke-width="1">${it.el}</g>`;
    const fill = primary.includes(it.m)
      ? "var(--acc)"
      : secondary.includes(it.m)
        ? "var(--acc)"
        : "#31353b";
    const op = primary.includes(it.m) ? 1 : secondary.includes(it.m) ? 0.38 : 1;
    return `<g fill="${fill}" opacity="${op}">${it.el}</g>`;
  }).join("");
}

function bodyMapSvg(EX) {
  return `<svg viewBox="0 0 250 268" role="img" aria-label="Мышцы: ${esc(EX.p.concat(EX.s).map((m) => MUS[m]).join(", "))}">
    <g transform="translate(0,0)">${bodyFigure(BODY_FRONT, EX.p, EX.s)}</g>
    <g transform="translate(130,0)">${bodyFigure(BODY_BACK, EX.p, EX.s)}</g>
    <text x="60" y="262" text-anchor="middle" fill="#7b828a" font-size="11">спереди</text>
    <text x="190" y="262" text-anchor="middle" fill="#7b828a" font-size="11">сзади</text>
  </svg>`;
}

function legendSvg(EX) {
  return `<div class="bodymap-legend"><span><i style="background:var(--acc)"></i>основные</span>
    <span><i style="background:var(--acc);opacity:.38"></i>помогают</span></div>`;
}

/* ---------- данные ---------- */
function entriesFor(exId) {
  if (!state.data) return [];
  return (state.data.log[state.p] || {})[exId] || [];
}
function metric(e, kind) {
  return kind === "weight" ? e.w : e.r;
}
function lastOf(list) {
  return list.length ? list[list.length - 1] : null;
}
function refDate() {
  const log = (state.data && state.data.log[state.p]) || {};
  let max = "";
  Object.values(log).forEach((a) => a.forEach((e) => { if (e.d > max) max = e.d; }));
  return max || new Date().toISOString().slice(0, 10);
}
function cutoff30() {
  const r = new Date(refDate());
  r.setDate(r.getDate() - 30);
  return r.toISOString().slice(0, 10);
}
function delta30(list, kind) {
  if (!list.length) return null;
  const last = list[list.length - 1];
  const cutoff = cutoff30();
  const within = list.filter((e) => e.d >= cutoff);
  if (!within.length) return null;
  return metric(last, kind) - metric(within[0], kind);
}
function deltaPrev(list, kind) {
  if (list.length < 2) return null;
  return metric(list[list.length - 1], kind) - metric(list[list.length - 2], kind);
}
function bestOf(list, kind) {
  return list.reduce((m, e) => Math.max(m, metric(e, kind)), 0);
}
function mainValue(e, kind) {
  if (!e) return { v: "—", u: "" };
  if (kind === "weight") return { v: kg(e.w), u: "кг" };
  if (kind === "time") return { v: e.r, u: "сек" };
  return { v: e.r, u: "повт." };
}

/* ---------- отрисовка ---------- */
function allExercises() {
  const c = (state.data && state.data.custom && state.data.custom[state.p]) || [];
  return CATALOG.concat(c);
}

function renderCards() {
  const log = state.data.log[state.p] || {};
  const all = Object.values(log).flat();
  const cutoff = cutoff30();
  const recent = all.filter((e) => e.d >= cutoff);
  const ref = refDate();
  const days = new Set(recent.map((e) => e.d)).size;
  const sets = recent.reduce((n, e) => n + (e.s || 0), 0);
  const tonnage = recent.reduce((n, e) => n + (e.w || 0) * (e.r || 0) * (e.s || 0), 0) / 1000;
  let plus = 0, withData = 0;
  allExercises().forEach((ex) => {
    const list = log[ex.id] || [];
    if (!list.length) return;
    withData++;
    const d = delta30(list, ex.kind);
    if (d != null && d > 0) plus++;
  });
  $("cards").innerHTML = `
    <div class="card ok"><div class="label">тренировок · 30 дней</div><div class="value">${days}</div>
      <div class="hint">${days ? "дней с записями" : "пока пусто"}</div></div>
    <div class="card info"><div class="label">подходов · 30 дней</div><div class="value">${sets}</div>
      <div class="hint">${recent.length ? "записей: " + recent.length : "добавь первый"}</div></div>
    <div class="card warn"><div class="label">тоннаж · 30 дней</div><div class="value">${tonnage ? num(tonnage) : 0}<small> т</small></div>
      <div class="hint">по ${fmtD(ref, true)}</div></div>
    <div class="card"><div class="label">в плюсе · 30 дней</div><div class="value">${plus}</div>
      <div class="hint">из ${withData} упражнений с данными</div></div>`;
}

function sparkSvg(list, kind) {
  const pts = list.slice(-8);
  if (pts.length < 2) return `<svg class="spark" viewBox="0 0 66 22"></svg>`;
  const vals = pts.map((e) => metric(e, kind));
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const span = mx - mn || 1;
  const X = (i) => 2 + (i * 62) / (pts.length - 1);
  const Y = (v) => 20 - ((v - mn) / span) * 16 - 1;
  const line = vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return `<svg class="spark" viewBox="0 0 66 22" aria-hidden="true">
    <polyline points="${line}" fill="none" stroke="var(--acc)" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="${X(vals.length - 1).toFixed(1)}" cy="${Y(metric(last, kind)).toFixed(1)}" r="2.2" fill="var(--acc)"/></svg>`;
}

function exerciseCard(EX) {
  const list = entriesFor(EX.id);
  const last = lastOf(list);
  const kind = EX.kind;
  const mv = mainValue(last, kind);
  const d = deltaPrev(list, kind);
  const unit = kind === "weight" ? "кг" : kind === "time" ? "сек" : "повт.";
  const chips = EX.p.map((m) => `<span class="mchip p">${MUS[m]}</span>`)
    .concat(EX.s.slice(0, 1).map((m) => `<span class="mchip">${MUS[m]}</span>`)).join("");
  const deltaTxt = d == null ? (list.length ? "— к прошлому" : "—")
    : (d > 0 ? "+" : "") + kg(d) + " " + unit;
  const dcls = d > 0 ? "up" : d < 0 ? "down" : "";
  return `<article class="ex" data-ex="${EX.id}" tabindex="0" role="button" aria-label="${esc(EX.name)} — подробнее">
    <div class="pic${EX.img ? " plate" : ""}">${EX.img ? `<span class="imgbox"><img class="plate-img" src="${EX.img}" alt="${esc(EX.name)}"></span>` : pictoSvg(EX)}</div>
    <div class="body">
      <div class="ex-top"><h3>${esc(EX.name)}</h3><span class="eq">${esc(EX.eq)}</span></div>
      <div class="mchips">${chips}</div>
      <div class="ex-foot">
        <div>
          <div class="lw">${mv.v}<small>${mv.u}</small></div>
          <div class="meta">${last ? (kind === "weight" ? `×${last.r} · ${last.s} подх · ${fmtD(last.d)}` : `${last.s} подх · ${fmtD(last.d)}`) : "нет записей"}</div>
        </div>
        <div class="dyn">${sparkSvg(list, kind)}<div class="delta ${dcls}">${deltaTxt}</div></div>
      </div>
    </div>
  </article>`;
}

function renderGrid() {
  const GO = { "Грудь": 0, "Спина": 1, "Ноги": 2, "Плечи": 3, "Руки": 4, "Пресс": 5, "Другое": 6 };
  const list = allExercises().map((e, i) => ({ e, i }))
    .filter((x) => state.group === "Все" || x.e.group === state.group)
    .sort((a, b) => GO[a.e.group] - GO[b.e.group] || a.i - b.i)
    .map((x) => x.e);
  const log = state.data ? state.data.log[state.p] || {} : {};
  const total = Object.values(log).reduce((n, a) => n + a.length, 0);
  const hello = total ? "" : `<div class="empty-note">
    Пока пусто. Нажми <b>«+ Записать подход»</b> — укажи вес, повторы и подходы.
    Динамика и график посчитаются сами, для каждого упражнения отдельно.</div>`;
  $("grid").innerHTML = hello + (list.map(exerciseCard).join("") ||
    `<div class="empty-note">В этой группе пока нет упражнений.</div>`);
  $("grid").querySelectorAll(".ex").forEach((el) => {
    const open = () => openEx(el.dataset.ex);
    el.addEventListener("click", open);
    el.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(); } });
  });
}

function renderFilters() {
  $("filters").innerHTML = GROUPS.map((g) => {
    const n = g === "Все" ? allExercises().length : allExercises().filter((e) => e.group === g).length;
    return `<button data-g="${g}" class="${state.group === g ? "on" : ""}">${g}<b>${n}</b></button>`;
  }).join("");
  $("filters").querySelectorAll("button").forEach((b) => {
    b.onclick = () => { state.group = b.dataset.g; renderFilters(); renderGrid(); };
  });
}

function renderWho() {
  document.body.dataset.p = state.p;
  $("who").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.p === state.p));
}

function renderJournal() {
  const box = $("journal");
  if (!state.data) { box.innerHTML = ""; return; }
  const list = (state.data.sessions && state.data.sessions[state.p]) || [];
  if (!list.length) {
    box.innerHTML = `<div class="empty-note">Журнал пока пуст.</div>`;
    return;
  }
  const by = new Map();
  list.forEach((s) => {
    if (!by.has(s.d)) by.set(s.d, []);
    by.get(s.d).push(s);
  });
  const days = [...by.keys()].sort().reverse();
  const html = days.map((d) => {
    const items = by.get(d);
    const rows = items.map((it) => `<div class="jitem"><b>${esc(it.n)}</b><span>${esc(it.s)}</span></div>`).join("");
    return `<div class="jday"><div class="jdate">${fmtD(d, true)}<span>${items.length} запис${items.length === 1 ? "ь" : items.length < 5 ? "и" : "ей"}</span></div>${rows}</div>`;
  }).join("");
  box.innerHTML = `<div class="jnote">Всего дней: ${days.length}, записей: ${list.length}. Записи перенесены из Telegram; даты восстановлены по скриншотам и порядку сообщений, поэтому они примерные (кроме дней, которые видны на скриншотах). Вес указан так, как записан в чате.</div>${html}`;
}

const WEIGHT_M = { k: "weight", label: "вес", unit: "кг", color: "#5ec8f2" };
const MEAS = [
  { k: "chest", label: "грудь", unit: "см", color: "#f2a65e" },
  { k: "abdomen", label: "живот", unit: "см", color: "#f26d6d" },
  { k: "glutes", label: "ягодицы", unit: "см", color: "#b58cf2" },
  { k: "thigh", label: "ляшка", unit: "см", color: "#6dd49a" },
  { k: "biceps", label: "бицепс", unit: "см", color: "#f2d45e" },
  { k: "calf", label: "икра", unit: "см", color: "#5ed4d4" },
];

function weightList() {
  return ((state.data && state.data.weights && state.data.weights[state.p]) || []).slice().sort((a, b) => a.d < b.d ? -1 : 1);
}
function measureList() {
  return ((state.data && state.data.measurements && state.data.measurements[state.p]) || []).slice().sort((a, b) => a.d < b.d ? -1 : 1);
}

function multiChart(series, unit) {
  const dates = [...new Set(series.flatMap((s) => s.pts.map((p) => p.d)))].sort();
  if (!dates.length) return `<div class="hintline">Нет данных.</div>`;
  const W = 520, H = 240, PADL = 40, PADR = 12, PADT = 18, PADB = 28;
  const vals = series.flatMap((s) => s.pts.map((p) => p.v));
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const lo = mn === mx ? mn - 2 : mn - (mx - mn) * 0.12;
  const hi = mn === mx ? mx + 2 : mx + (mx - mn) * 0.15;
  const X = (d) => PADL + (dates.length === 1 ? 0.5 : dates.indexOf(d) / (dates.length - 1)) * (W - PADL - PADR);
  const Y = (v) => PADT + (1 - (v - lo) / (hi - lo)) * (H - PADT - PADB);
  const ticks = [0, 1 / 3, 2 / 3, 1].map((k) => lo + k * (hi - lo));
  const grid = ticks.map((v) => `<line x1="${PADL}" y1="${Y(v)}" x2="${W - PADR}" y2="${Y(v)}" stroke="#2c2f34"/>
    <text x="${PADL - 5}" y="${Y(v) + 3}" text-anchor="end" font-size="8" fill="#7b828a">${Math.round(v * 10) / 10}</text>`).join("");
  const vlines = dates.map((d) => `<line x1="${X(d).toFixed(1)}" y1="${PADT}" x2="${X(d).toFixed(1)}" y2="${H - PADB}" stroke="#25282d"/>`).join("");
  const lines = series.map((s) => {
    if (!s.pts.length) return "";
    const line = s.pts.map((p) => `${X(p.d).toFixed(1)},${Y(p.v).toFixed(1)}`).join(" ");
    const dots = s.pts.map((p) => `<circle cx="${X(p.d).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="2.5" fill="${s.color}"><title>${s.label} · ${fmtD(p.d, true)}: ${p.v} ${unit}</title></circle>`).join("");
    const si = series.indexOf(s);
    const plabels = s.pts.map((p) => {
      const di = dates.indexOf(p.d);
      const anchor = di === 0 ? "start" : di === dates.length - 1 ? "end" : "middle";
      const lx = X(p.d) + (di === 0 ? 2 : di === dates.length - 1 ? -2 : 0);
      const below = s.label === "glutes" || s.label === "calf";
      const ly = Y(p.v) + (below ? 11 : -5);
      return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-size="7.5" fill="${s.color}">${p.v}</text>`;
    }).join("");
    return `<polyline points="${line}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round"/>${dots}${plabels}`;
  }).join("");
  const labels = dates.length <= 6
    ? dates.map((d) => `<text x="${X(d).toFixed(1)}" y="${H - 9}" text-anchor="middle" font-size="8" fill="#7b828a">${fmtD(d)}</text>`).join("")
    : `<text x="${PADL}" y="${H - 9}" font-size="8" fill="#7b828a">${fmtD(dates[0])}</text><text x="${W - PADR}" y="${H - 9}" text-anchor="end" font-size="8" fill="#7b828a">${fmtD(dates[dates.length - 1])}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}">${grid}${vlines}
    <line x1="${PADL}" y1="${H - PADB}" x2="${W - PADR}" y2="${H - PADB}" stroke="#3a3f46"/>
    <line x1="${PADL}" y1="${PADT}" x2="${PADL}" y2="${H - PADB}" stroke="#3a3f46"/>
    ${lines}${labels}</svg>`;
}

function openQuickAdd(kind, metric) {
  const isW = kind === "weight";
  const m = isW ? WEIGHT_M : MEAS.find((x) => x.k === metric);
  const row = isW
    ? weightList().find((x) => x.d === today())
    : measureList().find((x) => x.d === today());
  const cur = row ? (isW ? row.kg : row[metric]) : "";
  $("dlg-in").innerHTML = `<div class="dlg-head"><div><h2 id="dlg-title">${m.label} — быстрый замер</h2>
      <div class="sub2">дата ${fmtD(today(), true)}</div></div>
      <button class="x" id="dlg-x" aria-label="Закрыть">×</button></div>
    <div class="dlg-body">
      <form class="ex-form" id="quick-form">
        <label>${m.label} (${m.unit})<input type="number" step="0.1" min="0" max="400" name="v" value="${cur}" required autofocus></label>
        <div class="new-actions"><button type="submit" class="save-btn">Записать</button></div>
      </form>
    </div>`;
  $("dlg-x").onclick = closeDlg;
  $("quick-form").onsubmit = async (ev) => {
    ev.preventDefault();
    const v = Number(new FormData(ev.target).get("v") || 0);
    if (!(v > 0)) { toast("Введи значение", true); return; }
    const url = isW ? "/api/weight" : "/api/measure";
    const body = isW ? { profile: state.p, d: today(), kg: v } : { profile: state.p, d: today(), [metric]: v, merge: true };
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "не сохранилось");
      state.data = await (await fetch("/api/data", { cache: "no-store" })).json();
      refresh();
      closeDlg();
      toast("Записано");
    } catch (e) { toast("Ошибка: " + e.message, true); }
  };
  openDlg();
}

function renderMeasure() {
  const box = $("measure");
  if (!state.data) { box.innerHTML = ""; return; }
  const wl = weightList(), ml = measureList();
  const lastW = wl[wl.length - 1] || null, prevW = wl[wl.length - 2] || null;
  const lastM = ml[ml.length - 1] || null, prevM = ml[ml.length - 2] || null;
  const wDelta = lastW && prevW ? lastW.kg - prevW.kg : null;

  const wDef = lastW && Math.abs((new Date(today()) - new Date(lastW.d)) / 86400000) <= 3 ? lastW.d : today();
  const mDef = lastM && Math.abs((new Date(today()) - new Date(lastM.d)) / 86400000) <= 3 ? lastM.d : today();

  const weightTile = `<div class="qtile" style="border-top-color:${WEIGHT_M.color}">
    <button class="qadd" data-qw title="Добавить вес">+</button>
    <div class="l">вес</div>
    <div class="v" style="color:${WEIGHT_M.color}">${lastW ? lastW.kg + " <small>кг</small>" : "—"}</div>
    <div class="d">${wDelta == null ? "нет прошлого" : (wDelta > 0 ? "+" : "") + (Math.round(wDelta * 10) / 10) + " кг"}</div></div>`;

  const girthTiles = MEAS.map((m) => {
    const v = lastM && lastM[m.k] != null ? lastM[m.k] : null;
    const pv = prevM && prevM[m.k] != null ? prevM[m.k] : null;
    const d = v != null && pv != null ? v - pv : null;
    return `<div class="qtile" style="border-top-color:${m.color}">
      <button class="qadd" data-qg="${m.k}" title="Добавить ${m.label}">+</button>
      <div class="l">${m.label}</div>
      <div class="v" style="color:${m.color}">${v != null ? v + " <small>см</small>" : "—"}</div>
      <div class="d">${d == null ? "нет прошлого" : (d > 0 ? "+" : "") + (Math.round(d * 10) / 10) + " см"}</div></div>`;
  }).join("");

  const weightRows = wl.slice().reverse().map((x) => `<tr><td>${fmtD(x.d, true)}</td>
      <td class="num">${x.kg} кг</td>
      <td class="num"><button class="edit-m" data-wedit="${x.d}" title="Редактировать">✎</button>
        <button class="del" data-wdel="${x.d}" title="Удалить">×</button></td></tr>`).join("");
  const girthRows = ml.slice().reverse().map((x) => `<tr><td>${fmtD(x.d, true)}</td>
      ${MEAS.map((m) => `<td class="num">${x[m.k] != null ? x[m.k] : "—"}</td>`).join("")}
      <td class="num"><button class="edit-m" data-medit="${x.d}" title="Редактировать">✎</button>
        <button class="del" data-mdel="${x.d}" title="Удалить">×</button></td></tr>`).join("");

  const weightSeries = [{ color: WEIGHT_M.color, label: "вес", pts: wl.map((x) => ({ d: x.d, v: x.kg })) }];
  const girthSeries = MEAS.map((m) => ({ color: m.color, label: m.label, pts: ml.filter((x) => x[m.k] != null).map((x) => ({ d: x.d, v: x[m.k] })) }));
  const legend = MEAS.map((m) => `<span><i style="background:${m.color}"></i>${m.label}</span>`).join("");

  box.innerHTML = `<div class="mwrap">
    <div class="mleft">
      <div class="mpanel-head"><b>Вес</b><span>кг</span></div>
      <div class="mpanel">${multiChart(weightSeries, "кг")}${weightTile}</div>
      <div class="mform"><label class="ns-date">дата <input type="date" id="w-date" value="${wDef}" max="${today()}"></label>
        <div class="mform-row one"><label>вес (кг)<input type="number" step="0.1" min="0" max="300" id="w-kg" value="${lastW ? lastW.kg : ""}"></label></div>
        <div class="new-actions"><button class="save-btn" id="w-save">Записать вес</button></div></div>
      <div class="ls-wrap"><table class="hist mhist"><thead><tr><th>дата</th><th class="num">вес</th><th></th></tr></thead>
        <tbody>${weightRows || `<tr><td colspan="3" class="muted">Нет записей</td></tr>`}</tbody></table></div>
    </div>
    <div class="msep"></div>
    <div class="mright">
      <div class="mpanel-head"><b>Обхваты</b><span>см</span></div>
      <div class="qtiles">${girthTiles}</div>
      <div class="mpanel">${multiChart(girthSeries, "см")}<div class="mlegend">${legend}</div></div>
      <div class="mform"><label class="ns-date">дата <input type="date" id="m-date" value="${mDef}" max="${today()}"></label>
        <div class="mform-row">${MEAS.map((m) => `<label>${m.label} (см)<input type="number" step="0.1" min="0" max="400" name="${m.k}" value="${lastM && lastM[m.k] != null ? lastM[m.k] : ""}"></label>`).join("")}</div>
        <div class="new-actions"><button class="save-btn" id="m-save">Записать обхваты</button></div></div>
      <div class="ls-wrap"><table class="hist mhist"><thead><tr><th>дата</th>${MEAS.map((m) => `<th class="num">${m.label}</th>`).join("")}<th></th></tr></thead>
        <tbody>${girthRows || `<tr><td colspan="8" class="muted">Нет записей</td></tr>`}</tbody></table></div>
    </div>
  </div>`;

  box.querySelectorAll("[data-qw]").forEach((b) => { b.onclick = () => openQuickAdd("weight"); });
  box.querySelectorAll("[data-qg]").forEach((b) => { b.onclick = () => openQuickAdd("girth", b.dataset.qg); });
  $("w-save").onclick = async () => {
    const d = $("w-date").value || today();
    const kg = Number($("w-kg").value || 0);
    if (!(kg > 0)) { toast("Введи вес", true); return; }
    try {
      const r = await fetch("/api/weight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: state.p, d, kg }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "не сохранилось");
      state.data = await (await fetch("/api/data", { cache: "no-store" })).json();
      refresh(); toast("Вес записан");
    } catch (e) { toast("Ошибка: " + e.message, true); }
  };
  $("m-save").onclick = async () => {
    const d = $("m-date").value || today();
    const payload = { profile: state.p, d };
    for (const m of MEAS) {
      const el = document.querySelector(`.mpanel input[name="${m.k}"]`);
      payload[m.k] = el && el.value !== "" ? el.value : null;
    }
    try {
      const r = await fetch("/api/measure", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "не сохранилось");
      state.data = await (await fetch("/api/data", { cache: "no-store" })).json();
      refresh(); toast("Обхваты записаны");
    } catch (e) { toast("Ошибка: " + e.message, true); }
  };
  box.querySelectorAll("[data-wedit]").forEach((b) => {
    b.onclick = () => {
      const x = wl.find((y) => y.d === b.dataset.wedit);
      if (!x) return;
      $("w-date").value = x.d; $("w-kg").value = x.kg;
      $("w-date").scrollIntoView({ behavior: "smooth", block: "center" });
    };
  });
  box.querySelectorAll("[data-medit]").forEach((b) => {
    b.onclick = () => {
      const x = ml.find((y) => y.d === b.dataset.medit);
      if (!x) return;
      $("m-date").value = x.d;
      for (const m of MEAS) {
        const el = box.querySelector(`.mpanel input[name="${m.k}"]`);
        if (el) el.value = x[m.k] != null ? x[m.k] : "";
      }
      $("m-date").scrollIntoView({ behavior: "smooth", block: "center" });
    };
  });
  box.querySelectorAll("[data-wdel]").forEach((b) => {
    b.onclick = async () => {
      const d = b.dataset.wdel;
      try {
        const r = await fetch("/api/weight/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: state.p, d }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "не удалилось");
        state.data = await (await fetch("/api/data", { cache: "no-store" })).json();
        refresh(); toast("Вес удалён");
      } catch (e) { toast("Ошибка: " + e.message, true); }
    };
  });
  box.querySelectorAll("[data-mdel]").forEach((b) => {
    b.onclick = async () => {
      const d = b.dataset.mdel;
      try {
        const r = await fetch("/api/measure/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: state.p, d }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "не удалилось");
        state.data = await (await fetch("/api/data", { cache: "no-store" })).json();
        refresh(); toast("Обхваты удалены");
      } catch (e) { toast("Ошибка: " + e.message, true); }
    };
  });
}

function renderView() {
  const gridView = state.view === "grid";
  $("grid").hidden = !gridView;
  $("cards").hidden = state.view === "measure";
  $("journal").hidden = state.view !== "journal";
  $("measure").hidden = state.view !== "measure";
  document.querySelector(".toolbar").style.display = gridView ? "" : "none";
  $("viewtabs").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.v === state.view));
  if (state.view === "journal") renderJournal();
  if (state.view === "measure") renderMeasure();
}

function refresh() {
  renderWho();
  renderCards();
  renderFilters();
  renderGrid();
  renderView();
}

/* ---------- график ---------- */
function chartSvg(list, kind, unit) {
  const W = 760, H = 190, PADL = 46, PADR = 16, PADT = 22, PADB = 34;
  if (!list.length) return `<div class="hintline">Пока нет данных для графика.</div>`;
  const vals = list.map((e) => (kind === "weight" ? bestTenRM(e) : metric(e, kind)));
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const lo = mn === mx ? Math.max(0, mn - 5) : mn - (mx - mn) * 0.12;
  const hi = mn === mx ? mx + 5 : mx + (mx - mn) * 0.18;
  const X = (i) => PADL + (list.length === 1 ? 0.5 : i / (list.length - 1)) * (W - PADL - PADR);
  const Y = (v) => PADT + (1 - (v - lo) / (hi - lo)) * (H - PADT - PADB);
  const ticks = [0, 1 / 3, 2 / 3, 1].map((k) => lo + k * (hi - lo));
  const grid = ticks.map((v) => {
    const y = Y(v);
    return `<line x1="${PADL}" y1="${y}" x2="${W - PADR}" y2="${y}" stroke="#2c2f34" stroke-width="1"/>
      <text class="axis" x="${PADL - 6}" y="${y + 3}" text-anchor="end">${Math.round(v)}</text>`;
  }).join("");
  const vlines = list.map((e, i) => `<line x1="${X(i).toFixed(1)}" y1="${PADT}" x2="${X(i).toFixed(1)}" y2="${H - PADB}" stroke="#25282d" stroke-width="1"/>`).join("");
  const line = list.map((e, i) => `${X(i).toFixed(1)},${Y(vals[i]).toFixed(1)}`).join(" ");
  const dots = list.map((e, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(vals[i]).toFixed(1)}" r="2.6" fill="var(--acc)"><title>${fmtD(e.d, true)}: ${kg(vals[i])} ${unit}</title></circle>`).join("");
  const plabels = list.map((e, i) => {
    const valley = i > 0 && i < list.length - 1 && vals[i] <= vals[i - 1] && vals[i] <= vals[i + 1];
    let lx = X(i), ly = Y(vals[i]) + (valley ? 13 : -6), anchor = "middle";
    if (i === 0) { lx = X(i) + 5; ly = Y(vals[i]) + 13; anchor = "start"; }
    else if (i === list.length - 1) { lx = X(i) - 5; anchor = "end"; }
    return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="#9aa0a6">${kg(vals[i])}</text>`;
  }).join("");
  const step = Math.max(1, Math.ceil(list.length / 8));
  const xlabels = list.map((e, i) => (i % step === 0 || i === list.length - 1)
    ? `<text x="${X(i).toFixed(1)}" y="${H - 12}" text-anchor="middle" font-size="8" fill="#7b828a">${fmtD(e.d)}</text>` : "").join("");
  const axes = `<line x1="${PADL}" y1="${H - PADB}" x2="${W - PADR}" y2="${H - PADB}" stroke="#3a3f46"/>
    <line x1="${PADL}" y1="${PADT}" x2="${PADL}" y2="${H - PADB}" stroke="#3a3f46"/>`;
  return `<svg viewBox="0 0 ${W} ${H}">${grid}${vlines}${axes}
    <polyline points="${line}" fill="none" stroke="var(--acc)" stroke-width="2" stroke-linejoin="round"/>
    ${dots}${plabels}${xlabels}</svg>`;
}

/* ---------- окно упражнения ---------- */
function statBox(label, value, unit, sub, cls) {
  return `<div class="stat ${cls || ""}"><div class="l">${label}</div>
    <div class="v">${value}${unit ? `<small> ${unit}</small>` : ""}</div>
    <div class="d">${sub || ""}</div></div>`;
}

function setsOf(e) {
  if (e && Array.isArray(e.sets) && e.sets.length) {
    return e.sets.map((x) => ({ w: +x.w || 0, r: +x.r || 0, dw: x.dw != null ? +x.dw : null, dr: x.dr != null ? +x.dr : null }));
  }
  const raw = (e && e.raw) || "";
  const re = /(\d+(?:[.,]\d+)?)\s*\/\s*(\d+)(?:\s*\+\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+))?/g;
  const out = [];
  let m;
  while ((m = re.exec(raw))) out.push({
    w: parseFloat(m[1].replace(",", ".")),
    r: parseInt(m[2], 10),
    dw: m[3] ? parseFloat(m[3].replace(",", ".")) : null,
    dr: m[4] ? parseInt(m[4], 10) : null,
  });
  return out;
}
function tonnageOf(e) {
  return setsOf(e).reduce((n, x) => n + x.w * x.r, 0) / 1000;
}
function tenRM(w, r) {
  return w > 0 && r > 0 ? (w * (1 + r / 30)) / (1 + 10 / 30) : 0;
}
function bestTenRM(e) {
  return setsOf(e).reduce((m, x) => Math.max(m, tenRM(x.w, x.r)), 0);
}
function setsTableHtml(e, dateOnce) {
  const rows = setsOf(e);
  if (!rows.length) return "";
  const top = rows.reduce((m, x) => Math.max(m, x.w * x.r), 0);
  const body = rows.map((x, i) => {
    const best = top > 0 && x.w * x.r === top;
    return `<tr class="${best ? "best" : ""}">
    <td>${(!dateOnce || i === 0) ? fmtD(e.d, true) : ""}</td>
    <td class="num">${i + 1}</td>
    <td class="num">${x.w ? kg(x.w) : "свой"}</td>
    <td class="num">${x.r}</td>
    <td class="num">${x.dw != null ? kg(x.dw) : "—"}</td>
    <td class="num">${x.dr != null ? x.dr : "—"}</td>
  </tr>`;
  }).join("");
  return `<table class="ls-table"><thead><tr><th>дата</th><th class="num">подход</th>
    <th class="num">вес, кг</th><th class="num">повторы</th><th class="num">вес дропа</th>
    <th class="num">повторы дропа</th></tr></thead><tbody>${body}</tbody></table>`;
}
function lastSetsHtml(e) {
  if (!e) return "";
  if (!setsOf(e).length) return "";
  return `<div class="last-set">
    <div class="ls-head"><b>Последняя тренировка</b> · ${fmtD(e.d, true)}<span>тоннаж ${num(tonnageOf(e))} т</span></div>
    <div class="ls-wrap">${setsTableHtml(e, true)}</div>
  </div>`;
}
function historyTable(list, kind) {
  if (!list.length) return `<p class="hintline">Записей пока нет — добавь первый подход выше.</p>`;
  const items = list.slice().reverse().slice(0, 30);
  const rows = items.map((e) => `
    <tr>
      <td><button class="exp" data-x="${e.id}" title="Показать подходы">+</button></td>
      <td>${fmtD(e.d, true)}</td>
      <td class="num">${kind === "weight" ? kg(e.w) + " кг" : "—"}</td>
      <td class="num">${kind === "time" ? e.r + " сек" : e.r}</td>
      <td class="num">${e.s}</td>
      <td class="num">${kind === "weight" && bestTenRM(e) ? kg(bestTenRM(e)) : "—"}</td>
      <td class="num">${num(tonnageOf(e))} т</td>
      <td class="num"><button class="del" data-del="${e.id}" title="Удалить">×</button></td>
    </tr>
    <tr class="hx" data-hx="${e.id}" hidden><td colspan="8"></td></tr>`).join("");
  return `<table class="hist"><thead><tr><th></th><th>дата</th><th class="num">вес</th>
    <th class="num">${kind === "time" ? "время" : "повт."}</th><th class="num">подх.</th>
    <th class="num">10ПМ</th><th class="num">тоннаж</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderSetsBlock(cell, EX, e) {
  cell.innerHTML = `<div class="ls-inline">
    <div class="ls-head"><b>Тренировка</b> · ${fmtD(e.d, true)}<span>тоннаж ${num(tonnageOf(e))} т</span></div>
    <div class="ls-wrap">${setsTableHtml(e, true)}</div>
    <div class="new-actions"><button class="ghost-add edit-entry">Редактировать</button></div>
  </div>`;
  cell.querySelector(".edit-entry").onclick = () => openEditSets(cell, EX, e);
}
function openEditSets(cell, EX, e) {
  const rows = setsOf(e);
  const body = rows.map((x, i) => `<tr><td>—</td><td class="num">${i + 1}</td>
    <td><input class="es-w" type="number" step="0.5" min="0" max="500" value="${x.w || ""}"></td>
    <td><input class="es-r" type="number" step="1" min="0" max="200" value="${x.r || ""}"></td>
    <td><input class="es-dw" type="number" step="0.5" min="0" max="500" value="${x.dw != null ? x.dw : ""}"></td>
    <td><input class="es-dr" type="number" step="1" min="0" max="200" value="${x.dr != null ? x.dr : ""}"></td>
  </tr>`).join("");
  cell.innerHTML = `<div class="ls-inline">
    <div class="ls-head"><b>Редактирование тренировки</b>
      <label class="ns-date">дата <input type="date" id="edit-d" value="${e.d}" max="${today()}"></label></div>
    <div class="ls-wrap"><table class="ls-table"><thead><tr><th>дата</th><th class="num">подход</th>
      <th class="num">вес, кг</th><th class="num">повторы</th><th class="num">вес дропа</th>
      <th class="num">повторы дропа</th></tr></thead><tbody id="edit-body">${body}</tbody></table></div>
    <div class="new-actions"><button class="save-btn" id="edit-save">Сохранить</button>
      <button class="ghost-add" id="edit-cancel">Отмена</button></div>
  </div>`;
  cell.querySelector("#edit-save").onclick = () => saveEdit(cell, EX, e);
  cell.querySelector("#edit-cancel").onclick = () => renderSetsBlock(cell, EX, e);
}
async function saveEdit(cell, EX, e) {
  const d = (cell.querySelector("#edit-d") && cell.querySelector("#edit-d").value) || e.d;
  const sets = Array.from(cell.querySelectorAll("#edit-body tr")).map((tr) => {
    const v = (sel) => tr.querySelector(sel).value;
    return {
      w: Number(v(".es-w") || 0),
      r: Number(v(".es-r") || 0),
      dw: v(".es-dw") ? Number(v(".es-dw")) : null,
      dr: v(".es-dr") ? Number(v(".es-dr")) : null,
    };
  }).filter((x) => x.w > 0 || x.r > 0);
  if (!sets.length) { toast("Оставь хотя бы один подход", true); return; }
  try {
    const r = await fetch("/api/entry/update", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: state.p, ex: EX.id, id: e.id, d, sets }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "не сохранилось");
    state.data = await (await fetch("/api/data", { cache: "no-store" })).json();
    markLive(true);
    refresh();
    openEx(EX.id);
    toast("Тренировка изменена");
  } catch (err) {
    markLive(false);
    toast("Ошибка: " + err.message, true);
  }
}

function newRowHtml() {
  return `<tr><td>—</td><td class="num ns-n"></td>
    <td><input class="ns-w" type="number" step="0.5" min="0" max="500" placeholder="кг"></td>
    <td><input class="ns-r" type="number" step="1" min="0" max="200" placeholder="повт."></td>
    <td><input class="ns-dw" type="number" step="0.5" min="0" max="500" placeholder="кг"></td>
    <td><input class="ns-dr" type="number" step="1" min="0" max="200" placeholder="повт."></td>
  </tr>`;
}

function openEx(id) {
  const EX = allExercises().find((e) => e.id === id);
  if (!EX) return;
  state.ex = EX;
  const list = entriesFor(id);
  const last = lastOf(list);
  const kind = EX.kind;
  const unit = kind === "weight" ? "кг" : kind === "time" ? "сек" : "повт.";
  const d = delta30(list, kind);
  const best = bestOf(list, kind);

  const main = kind === "weight"
    ? statBox("последний вес", last ? kg(last.w) : "—", "кг", last ? `×${last.r} · ${last.s} подх` : "нет записей")
    : kind === "time"
      ? statBox("последнее время", last ? last.r : "—", "сек", last ? `${last.s} подх` : "нет записей")
      : statBox("последний раз", last ? last.r : "—", "повт.", last ? `${last.s} подх` : "нет записей");
  const statBest = statBox("лучший", best ? kg(best) : "—", unit, "в истории");
  const statDelta = statBox("за 30 дней", d == null ? "—" : (d > 0 ? "+" : "") + kg(d), unit,
    d == null ? "нет данных" : d > 0 ? "рост" : d < 0 ? "снижение" : "без изменений",
    d > 0 ? "up" : d < 0 ? "down" : "");
  const statFourth = kind === "weight" ? ""
    : statBox("всего", list.reduce((n, e) => n + (e.r || 0) * (e.s || 0), 0), kind === "time" ? "сек" : "повт.", "за всё время");
  const bestAll = list.reduce((m, e) => Math.max(m, e.w || 0), 0);
  const best10 = list.reduce((m, e) => Math.max(m, bestTenRM(e)), 0);
  const last10 = last ? bestTenRM(last) : 0;
  const statsHtml = kind === "weight"
    ? statBox("лучший вес", bestAll ? kg(bestAll) : "—", "кг", "абсолютный")
      + statBox("лучший 10ПМ", best10 ? kg(best10) : "—", "кг", "лучший подход к 10")
      + statBox("последний 10ПМ", last10 ? kg(last10) : "—", "кг", last ? fmtD(last.d, true) : "нет записей")
    : main + statBest + statDelta + statFourth;

  const chart = chartSvg(list, kind, unit);
  const lastD = last ? last.d : today();
  const defW = kind === "weight" ? (last ? last.w : 20) : (last ? last.w : 0);
  const defR = kind === "time" ? (last ? last.r : 30) : (last ? last.r : 8);
  const defS = last ? last.s : 3;
  const weightLabel = kind === "weight" ? "вес, кг" : "доп. вес, кг";
  const isLP = EX.id === "legpress";
  const hasImg = !!EX.img;
  const lpLegend = `<div class="bodymap-legend lp-legend"><span><i style="background:#b83a2e"></i>квадрицепс</span><span><i style="background:#2f6fb2"></i>задняя поверхность</span><span><i style="background:#7b4f9e"></i>ягодицы</span><span><i style="background:#3f8f4e"></i>голени</span></div>`;

  $("dlg-in").innerHTML = `
    <div class="dlg-head">
      <div><h2 id="dlg-title">${esc(EX.name)}</h2>
        <div class="sub2">${esc(EX.group)} · ${esc(EX.eq)}${EX.kind !== "weight" ? " · без веса штанги" : ""}</div></div>
      <button class="x" id="dlg-x" aria-label="Закрыть">×</button>
    </div>
    <div class="dlg-body">
      <div class="dlg-top${hasImg ? " single" : ""}">
        <div class="pic-lg${hasImg ? " plate full" : ""}">${hasImg ? `<span class="imgbox"><img class="plate-img" src="${EX.img}" alt="${esc(EX.name)}"></span>` : pictoSvg(EX)}</div>
        ${hasImg ? "" : `<div>
          <div class="bodymap">${bodyMapSvg(EX)}</div>
          ${legendSvg(EX)}
        </div>`}
      </div>
      ${isLP ? lpLegend : ""}
      <p class="cue">${esc(EX.cue)}</p>
      ${EX.id === "legpress" ? `
      <button class="more-btn" id="more-btn" aria-expanded="false">Описание и техника</button>
      <div class="descr" id="descr">
        <h3>Зачем</h3>
        <p>Жим ногами — базовое упражнение для ног. Работают квадрицепс, ягодицы и задняя поверхность бедра. Меняя постановку стоп, можно смещать нагрузку: стопы выше — больше задняя поверхность бедра, ниже — больше квадрицепс.</p>
        <h3>Техника</h3>
        <ol>
          <li>Сядь в тренажёр, прижми таз и лопатки к спинке. Стопы на платформе на ширине плеч, всей поверхностью, носки чуть в стороны.</li>
          <li>Сними фиксаторы и выжми платформу до почти прямых ног, без блокировки коленей. Это исходное положение.</li>
          <li>На вдохе плавно опускай платформу, пока угол в коленях не станет прямым или чуть меньше. Пятки и таз не отрывай.</li>
          <li>На выдохе выжми платформу вверх, не выпрямляя колени до щелчка.</li>
        </ol>
        <h3>Советы</h3>
        <ul>
          <li>Не опускай платформу слишком близко к груди: таз уходит вперёд, спина округляется, страдает поясница.</li>
          <li>Колени идут по носкам, не заваливай их внутрь.</li>
          <li>Вес подбирай так, чтобы 8–15 повторов шли чисто, без отрыва таза.</li>
        </ul>
        <h3>Частые ошибки</h3>
        <ul>
          <li>Отрывает таз или пятки от опоры — нагрузка уходит в поясницу и колени.</li>
          <li>Опускает платформу слишком глубоко: таз подкручивается, спина округляется.</li>
          <li>Полностью блокирует колени в верхней точке.</li>
          <li>Сводит колени внутрь под весом.</li>
          <li>Берёт слишком большой вес и работает рывками.</li>
        </ul>
        <h3>Сколько</h3>
        <p>3–4 подхода по 8–15 повторов, в начале тренировки ног. Перед жимом ногами — приседания, после — разгибания и сгибания ног.</p>
        <p class="src">Описание по мотивам статьи powermens.ru «Жим ногами»; картинка оттуда же, для личной страницы.</p>
      </div>` : ""}
      ${EX.id !== "legpress" ? `
      <button class="more-btn" id="more-btn" aria-expanded="false">Описание и техника</button>
      <div class="descr" id="descr">
        <h3>Техника</h3>
        <p>${esc(EX.cue)}</p>
        <h3>Частые ошибки</h3>
        <ul>
          <li>Слишком большой вес и работа рывками.</li>
          <li>Неполная амплитуда: движение делается только в середине.</li>
          <li>Сбитое дыхание и потеря техники к концу подхода.</li>
        </ul>
        <h3>Сколько</h3>
        <p>3–4 подхода по 8–12 повторов. Начинай с разминочного подхода с лёгким весом.</p>
      </div>` : ""}
      <div class="stats${kind === "weight" ? " three" : ""}">${statsHtml}</div>
      <div class="chart-box">
        <div class="chart-head"><span>динамика ${kind === "weight" ? "10ПМ (расчёт)" : kind === "time" ? "времени" : "повторов"}</span>
          <span>${list.length} запис${list.length === 1 ? "ь" : list.length < 5 ? "и" : "ей"}</span></div>
        ${chart}
      </div>
      <div class="new-set">
        <div class="ls-head"><b>Новая тренировка</b>
          <label class="ns-date">дата <input type="date" id="new-d" value="${today()}" max="${today()}"></label></div>
        <div class="ls-wrap"><table class="ls-table"><thead><tr><th>дата</th><th class="num">подход</th>
          <th class="num">вес, кг</th><th class="num">повторы</th><th class="num">вес дропа</th>
          <th class="num">повторы дропа</th></tr></thead><tbody id="new-body">${newRowHtml()}</tbody></table></div>
        <div class="new-actions"><button type="button" class="ghost-add" id="add-row">+ подход</button>
          <button type="button" class="save-btn" id="save-set">Записать тренировку</button></div>
      </div>
      ${lastSetsHtml(last)}
      ${historyTable(list, kind)}
    </div>`;

  $("dlg-x").onclick = closeDlg;
  const mb = $("more-btn");
  if (mb) mb.onclick = () => {
    const d = $("descr");
    const open = d.classList.toggle("open");
    mb.setAttribute("aria-expanded", open ? "true" : "false");
    mb.textContent = open ? "Скрыть описание" : "Описание и техника";
  };
  const nb = $("new-body");
  const renum = () => nb.querySelectorAll(".ns-n").forEach((td, i) => { td.textContent = i + 1; });
  renum();
  $("add-row").onclick = () => {
    nb.insertAdjacentHTML("beforeend", newRowHtml());
    renum();
    const trs = nb.querySelectorAll("tr");
    trs[trs.length - 1].querySelector(".ns-w").focus();
  };
  $("save-set").onclick = () => saveWorkout(EX);
  $("dlg-in").querySelectorAll(".exp").forEach((b) => {
    b.onclick = () => {
      const e = list.find((x) => x.id === b.dataset.x);
      const tr = b.closest("tr");
      const hx = tr && tr.nextElementSibling;
      if (!e || !hx || !hx.classList.contains("hx")) return;
      if (!hx.hidden) { hx.hidden = true; b.textContent = "+"; return; }
      hx.hidden = false;
      b.textContent = "−";
      renderSetsBlock(hx.querySelector("td"), EX, e);
      hx.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
  });
  $("dlg-in").querySelectorAll("[data-del]").forEach((b) => {
    b.onclick = () => deleteEntry(EX, b.dataset.del);
  });
  openDlg();
}

function openDlg() {
  const d = $("dlg");
  if (typeof d.showModal === "function") d.showModal();
  else d.setAttribute("open", "");
}
function closeDlg() {
  const d = $("dlg");
  if (typeof d.close === "function") d.close();
  else d.removeAttribute("open");
  state.ex = null;
}

/* ---------- добавление и удаление ---------- */
async function saveWorkout(EX) {
  const d = ($("new-d") && $("new-d").value) || today();
  const trs = Array.from($("new-body").querySelectorAll("tr"));
  const sets = trs.map((tr) => {
    const v = (sel) => tr.querySelector(sel).value;
    return {
      w: Number(v(".ns-w") || 0),
      r: Number(v(".ns-r") || 0),
      dw: v(".ns-dw") ? Number(v(".ns-dw")) : null,
      dr: v(".ns-dr") ? Number(v(".ns-dr")) : null,
    };
  }).filter((x) => x.w > 0 || x.r > 0);
  if (!sets.length) { toast("Заполни хотя бы один подход", true); return; }
  try {
    const r = await fetch("/api/entry", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: state.p, ex: EX.id, d, sets }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "не сохранилось");
    state.data = await (await fetch("/api/data", { cache: "no-store" })).json();
    markLive(true);
    refresh();
    openEx(EX.id);
    toast("Тренировка записана");
  } catch (e) {
    markLive(false);
    toast("Ошибка: " + e.message, true);
  }
}

async function deleteEntry(EX, id) {
  try {
    const r = await fetch("/api/entry/delete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: state.p, ex: EX.id, id }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "не удалилось");
    state.data = await (await fetch("/api/data", { cache: "no-store" })).json();
    refresh();
    openEx(EX.id);
    toast("Запись удалена");
  } catch (e) {
    toast("Ошибка: " + e.message, true);
  }
}

/* ---------- выбор упражнения ---------- */
function openNewEx() {
  const groups = GROUPS.filter((g) => g !== "Все");
  const chips = (field) => Object.entries(MUS).map(([k, label]) =>
    `<label class="mus"><input type="checkbox" name="${field}" value="${k}"><span>${esc(label)}</span></label>`).join("");
  $("dlg-in").innerHTML = `
    <div class="dlg-head"><div><h2 id="dlg-title">Новое упражнение</h2>
      <div class="sub2">${state.data.profiles[state.p].name} · своё упражнение</div></div>
      <button class="x" id="dlg-x" aria-label="Закрыть">×</button></div>
    <div class="dlg-body">
      <form class="ex-form" id="ex-form">
        <label>название *<input name="name" required maxlength="60" placeholder="например, тяга в наклоне"></label>
        <div class="ex-row">
          <label>группа<select name="group">${groups.map((g) => `<option value="${g}">${g}</option>`).join("")}</select></label>
          <label>снаряд<input name="eq" placeholder="штанга, тренажёр"></label>
          <label>тип<select name="kind"><option value="weight">вес</option><option value="reps">повторы</option><option value="time">время</option></select></label>
        </div>
        <div class="mus-pick"><div class="l">Основные мышцы</div><div class="mus-list">${chips("p")}</div></div>
        <div class="mus-pick"><div class="l">Помогают</div><div class="mus-list">${chips("s")}</div></div>
        <div class="new-actions"><button type="submit" class="save-btn">Создать упражнение</button></div>
      </form>
    </div>`;
  $("dlg-x").onclick = closeDlg;
  $("ex-form").onsubmit = async (ev) => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const payload = {
      profile: state.p,
      name: String(fd.get("name") || "").trim(),
      group: fd.get("group"),
      eq: String(fd.get("eq") || "").trim(),
      kind: fd.get("kind"),
      p: fd.getAll("p"),
      s: fd.getAll("s"),
    };
    if (!payload.name) { toast("Введи название", true); return; }
    try {
      const r = await fetch("/api/exercise", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "не создалось");
      state.data = await (await fetch("/api/data", { cache: "no-store" })).json();
      refresh();
      openEx(j.exercise.id);
      toast("Упражнение создано");
    } catch (err) {
      toast("Ошибка: " + err.message, true);
    }
  };
  openDlg();
}

function openPicker() {
  state.ex = null;
  $("dlg-in").innerHTML = `
    <div class="dlg-head"><div><h2 id="dlg-title">Что записываем?</h2>
      <div class="sub2">${state.data.profiles[state.p].name} · выбери упражнение</div></div>
      <button class="x" id="dlg-x" aria-label="Закрыть">×</button></div>
    <div class="dlg-body">
      <div class="pick-list">${allExercises().map((EX) => `
        <button data-pick="${EX.id}"><span class="mini">${pictoSvg(EX)}</span>
          <span>${esc(EX.name)}</span><span class="g">${esc(EX.group)}</span></button>`).join("")}</div>
    </div>`;
  $("dlg-x").onclick = closeDlg;
  $("dlg-in").querySelectorAll("[data-pick]").forEach((b) => {
    b.onclick = () => openEx(b.dataset.pick);
  });
  openDlg();
}

/* ---------- связь ---------- */
function markLive(ok) {
  const el = $("live");
  el.className = "live " + (ok ? "ok" : "bad");
  el.title = ok ? "данные сохранены" : "нет связи с сервером";
}
let toastT = null;
function toast(msg, err) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show" + (err ? " err" : "");
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.className = "toast"; }, 2400);
}

async function boot() {
  try {
    const saved = localStorage.getItem("fit-profile");
    if (saved === "tim" || saved === "kristina") state.p = saved;
  } catch (e) {}
  renderWho();
  renderFilters();
  try {
    const r = await fetch("/api/data", { cache: "no-store" });
    state.data = await r.json();
    markLive(true);
    $("updated").textContent = "сохранено " + new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    refresh();
  } catch (e) {
    markLive(false);
    $("updated").textContent = "нет связи с сервером";
    $("grid").innerHTML = `<div class="empty-note">Не удалось загрузить данные. Проверь, запущен ли сервер: <code>python3 app/server.py</code></div>`;
  }
  $("who").querySelectorAll("button").forEach((b) => {
    b.onclick = () => {
      state.p = b.dataset.p;
      try { localStorage.setItem("fit-profile", state.p); } catch (e) {}
      refresh();
      if (state.ex) openEx(state.ex.id);
    };
  });
  $("viewtabs").querySelectorAll("button").forEach((b) => {
    b.onclick = () => { state.view = b.dataset.v; renderView(); };
  });
  $("add-btn").onclick = openPicker;
  $("new-ex").onclick = openNewEx;
  $("dlg").addEventListener("click", (ev) => { if (ev.target === $("dlg")) closeDlg(); });
  $("dlg").addEventListener("cancel", () => { state.ex = null; });
  if (location.hash) {
    const id = location.hash.slice(1).replace("!", "");
    if (id === "journal") { state.view = "journal"; renderView(); }
    else if (id === "measure") { state.view = "measure"; renderView(); }
    else if (id === "newex") setTimeout(openNewEx, 120);
    else if (id === "add") setTimeout(openPicker, 120);
    else if (allExercises().some((e) => e.id === id)) setTimeout(() => {
      openEx(id);
      if (location.hash.includes("!")) setTimeout(() => { const b = $("more-btn"); if (b) b.click(); }, 200);
    }, 120);
  }
}

boot();
