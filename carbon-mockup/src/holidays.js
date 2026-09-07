// Civil dates use the visitor's calendar, matching the original holiday monitor.
// Sources and the annual Japan update procedure are in HOLIDAYS.md.
const day = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
const key = (date) => date.toISOString().slice(0, 10);
const shift = (date, amount) => new Date(date.getTime() + amount * 86400000);
const nth = (y, m, weekday, n) =>
  day(y, m, 1 + ((weekday - day(y, m, 1).getUTCDay() + 7) % 7) + 7 * (n - 1));
const lastMonday = (y, m) => {
  const end = day(y, m + 1, 0);
  return shift(end, -(end.getUTCDay() + 6) % 7);
};
function easter(y) {
  const a = y % 19,
    b = Math.floor(y / 100),
    c = y % 100,
    d = Math.floor(b / 4),
    e = b % 4;
  const f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4),
    k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 451);
  return day(
    y,
    Math.floor((h + l - 7 * m + 114) / 31),
    ((h + l - 7 * m + 114) % 31) + 1,
  );
}
const names = {
  newYear: ["New Year's Day", "Ano Novo", "元日"],
  mlk: [
    "Martin Luther King Jr. Day",
    "Dia de Martin Luther King Jr.",
    "キング牧師記念日",
  ],
  washington: [
    "Washington’s Birthday",
    "Aniversário de Washington",
    "ワシントン誕生日",
  ],
  memorial: ["Memorial Day", "Memorial Day", "戦没将兵追悼記念日"],
  juneteenth: ["Juneteenth", "Juneteenth", "ジューンティーンス"],
  independence: [
    "Independence Day",
    "Independência dos EUA",
    "アメリカ独立記念日",
  ],
  labor: ["Labor Day", "Dia do Trabalho", "レイバー・デー"],
  columbus: ["Columbus Day", "Dia de Colombo", "コロンブス・デー"],
  veterans: ["Veterans Day", "Dia dos Veteranos", "退役軍人の日"],
  thanksgiving: ["Thanksgiving", "Dia de Ação de Graças", "感謝祭"],
  christmas: ["Christmas Day", "Natal", "クリスマス"],
  goodFriday: ["Good Friday", "Sexta-feira Santa", "聖金曜日"],
  easter: ["Easter Sunday", "Domingo de Páscoa", "復活祭"],
  freedom: ["Freedom Day", "Dia da Liberdade", "自由の日"],
  workers: ["Workers’ Day", "Dia do Trabalhador", "メーデー"],
  corpus: ["Corpus Christi", "Corpo de Deus", "聖体祭"],
  portugal: ["Portugal Day", "Dia de Portugal", "ポルトガルの日"],
  assumption: [
    "Assumption of Mary",
    "Assunção de Nossa Senhora",
    "聖母被昇天祭",
  ],
  republic: ["Republic Day", "Implantação da República", "共和国記念日"],
  allSaints: ["All Saints’ Day", "Dia de Todos os Santos", "諸聖人の日"],
  restoration: [
    "Restoration of Independence",
    "Restauração da Independência",
    "独立回復記念日",
  ],
  conception: [
    "Immaculate Conception",
    "Imaculada Conceição",
    "無原罪の御宿りの祝日",
  ],
  comingAge: ["Coming of Age Day", "Dia da Maioridade", "成人の日"],
  foundation: ["National Foundation Day", "Fundação Nacional", "建国記念の日"],
  emperor: ["Emperor’s Birthday", "Aniversário do Imperador", "天皇誕生日"],
  vernal: ["Vernal Equinox Day", "Equinócio da Primavera", "春分の日"],
  showa: ["Shōwa Day", "Dia de Shōwa", "昭和の日"],
  constitution: [
    "Constitution Memorial Day",
    "Dia da Constituição",
    "憲法記念日",
  ],
  greenery: ["Greenery Day", "Dia da Natureza", "みどりの日"],
  children: ["Children’s Day", "Dia das Crianças", "こどもの日"],
  marine: ["Marine Day", "Dia do Mar", "海の日"],
  mountain: ["Mountain Day", "Dia da Montanha", "山の日"],
  respect: [
    "Respect for the Aged Day",
    "Dia do Respeito pelos Idosos",
    "敬老の日",
  ],
  autumn: ["Autumnal Equinox Day", "Equinócio do Outono", "秋分の日"],
  sports: ["Sports Day", "Dia do Desporto", "スポーツの日"],
  culture: ["Culture Day", "Dia da Cultura", "文化の日"],
  laborThanks: [
    "Labor Thanksgiving Day",
    "Ação de Graças pelo Trabalho",
    "勤労感謝の日",
  ],
  citizens: ["Citizens’ Holiday", "Feriado Nacional", "国民の休日"],
  mardiGras: ["Mardi Gras", "Mardi Gras", "マルディグラ"],
  newOrleans: [
    "Battle of New Orleans",
    "Batalha de Nova Orleães",
    "ニューオーリンズの戦いの日",
  ],
  hueyLong: [
    "Huey P. Long Day",
    "Dia de Huey P. Long",
    "ヒューイ・P・ロングの日",
  ],
  election: ["Election Day", "Dia das Eleições", "選挙の日"],
};
const equinoxes = { 2026: [20, 23], 2027: [21, 23] };
const cache = new Map();
export function holidaysForYear(year) {
  if (cache.has(year)) return cache.get(year);
  const records = [];
  const add = (date, id, region, observed = false) =>
    records.push({ date: key(date), id, region, observed });
  // Include adjacent years so an observed January 1 can land on December 31.
  for (const y of [year - 1, year, year + 1]) {
    for (const [m, d, id] of [
      [1, 1, "newYear"],
      [6, 19, "juneteenth"],
      [7, 4, "independence"],
      [11, 11, "veterans"],
      [12, 25, "christmas"],
    ]) {
      const date = day(y, m, d);
      add(date, id, "us");
      if ([0, 6].includes(date.getUTCDay()))
        add(shift(date, date.getUTCDay() === 6 ? -1 : 1), id, "us", true);
    }
  }
  for (const [m, n, id] of [
    [1, 3, "mlk"],
    [2, 3, "washington"],
    [9, 1, "labor"],
    [10, 2, "columbus"],
  ])
    add(nth(year, m, 1, n), id, "us");
  add(lastMonday(year, 5), "memorial", "us");
  add(nth(year, 11, 4, 4), "thanksgiving", "us");
  for (const [m, d, id] of [
    [1, 1, "newYear"],
    [4, 25, "freedom"],
    [5, 1, "workers"],
    [6, 10, "portugal"],
    [8, 15, "assumption"],
    [10, 5, "republic"],
    [11, 1, "allSaints"],
    [12, 1, "restoration"],
    [12, 8, "conception"],
    [12, 25, "christmas"],
  ])
    add(day(year, m, d), id, "pt");
  const pascha = easter(year);
  add(shift(pascha, -2), "goodFriday", "pt");
  add(pascha, "easter", "pt");
  add(shift(pascha, 60), "corpus", "pt");
  // Japan's equinox dates are published annually, not guessed from an astronomical approximation.
  for (const [m, d, id] of [
    [1, 1, "newYear"],
    [2, 11, "foundation"],
    [2, 23, "emperor"],
    [4, 29, "showa"],
    [5, 3, "constitution"],
    [5, 4, "greenery"],
    [5, 5, "children"],
    [8, 11, "mountain"],
    [11, 3, "culture"],
    [11, 23, "laborThanks"],
  ])
    add(day(year, m, d), id, "jp");
  for (const [m, n, id] of [
    [1, 2, "comingAge"],
    [7, 3, "marine"],
    [9, 3, "respect"],
    [10, 2, "sports"],
  ])
    add(nth(year, m, 1, n), id, "jp");
  if (equinoxes[year]) {
    add(day(year, 3, equinoxes[year][0]), "vernal", "jp");
    add(day(year, 9, equinoxes[year][1]), "autumn", "jp");
  }
  const japanese = records.filter((r) => r.region === "jp");
  const statutory = new Set(japanese.map((r) => r.date));
  for (const holiday of japanese) {
    const after = shift(new Date(holiday.date + "T00:00:00Z"), 1);
    if (!statutory.has(key(after)) && statutory.has(key(shift(after, 1))))
      add(after, "citizens", "jp");
    if (new Date(holiday.date + "T00:00:00Z").getUTCDay() === 0) {
      let substitute = after;
      while (statutory.has(key(substitute))) substitute = shift(substitute, 1);
      add(substitute, holiday.id, "jp", true);
    }
  }
  // Louisiana-specific legal dates; shared federal dates already carry the U.S. flag.
  add(day(year, 1, 8), "newOrleans", "la");
  add(shift(pascha, -47), "mardiGras", "la");
  add(shift(pascha, -2), "goodFriday", "la");
  add(day(year, 8, 30), "hueyLong", "la");
  add(day(year, 11, 1), "allSaints", "la");
  if (year % 2 === 0) add(shift(nth(year, 11, 1, 1), 1), "election", "la");
  const result = records
    .filter((r) => r.date.startsWith(year + "-"))
    .sort((a, b) => a.date.localeCompare(b.date));
  cache.set(year, result);
  return result;
}
export function holidaysOn(date = new Date(), language = "en") {
  const civilDate =
    typeof date === "string"
      ? date
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const index = { en: 0, pt: 1, ja: 2 }[language] ?? 0;
  const grouped = new Map();
  for (const holiday of holidaysForYear(Number(civilDate.slice(0, 4))).filter(
    (r) => r.date === civilDate,
  )) {
    const id = holiday.id + (holiday.observed ? "-observed" : "");
    if (!grouped.has(id))
      grouped.set(id, {
        ...holiday,
        key: id,
        regions: [],
        name:
          names[holiday.id][index] +
          (holiday.observed
            ? [" (observed)", " (observado)", "（振替休日）"][index]
            : ""),
      });
    grouped.get(id).regions.push(holiday.region);
  }
  return [...grouped.values()];
}
