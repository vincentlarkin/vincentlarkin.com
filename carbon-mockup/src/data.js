export const photos = [
  {
    file: "junho-julho-2026.webp",
    date: "June–July 2026",
    year: "2026",
    alt: "A Louisiana highway at sunset, with an exit sign for Common Street and Louisiana Avenue.",
  },
  {
    file: "abril-2026.webp",
    date: "April–May 2026",
    year: "2026",
    alt: "The Dolores George LaVigne Wall of Entrepreneurial Achievement.",
  },
  {
    file: "marco-2026.webp",
    date: "March 2026",
    year: "2026",
    alt: "A snow-covered neighborhood intersection under a clouded winter sky.",
  },
  {
    file: "fevereiro-2026.webp",
    date: "February 2026",
    year: "2026",
    alt: "Snowy mountain peaks and evergreen trees under a clear blue sky.",
  },
  {
    file: "janeiro-2026.webp",
    date: "January 2026",
    year: "2026",
    alt: "Looking up through tall tree trunks and leafy branches toward the sky.",
  },
  {
    file: "novembro-2025.webp",
    date: "November 2025",
    year: "2025",
    alt: "An ornate stone arch framed by yellow buildings and a bright blue sky.",
  },
  {
    file: "outubro-2025.webp",
    date: "October 2025",
    year: "2025",
    alt: "A basket of yellow fruit on the grass, with more fruit scattered beside it.",
  },
  {
    file: "setembro2025.webp",
    date: "September 2025",
    year: "2025",
    alt: "Cars parked along a street beside a large multistory building.",
  },
  {
    file: "agostode2025.webp",
    date: "August 2025",
    year: "2025",
    alt: "Dramatic evening clouds over a roadside landscape.",
  },
];
export const photoSrc = (p, size = "thumbs-md") =>
  `/images/mês/${size ? `${size}/` : ""}${p.file}`;
export const navigation = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "reading", label: "News / Books" },
  { id: "changelog", label: "Changelog" },
];
export const changes = [
  {
    hash: "6c4765f",
    date: "2026-08-12",
    title: "Google tag implementation",
    category: "Site update",
  },
  {
    hash: "e512bf4",
    date: "2026-08-04",
    title: "Update robots & sitemap",
    category: "Maintenance",
  },
  {
    hash: "cc8ba91",
    date: "2026-08-03",
    title: "Self-host editorial typography for CSP",
    category: "Typography",
  },
  {
    hash: "dab35d4",
    date: "2026-08-03",
    title: "Launch Olympus-inspired editorial theme",
    category: "Design",
  },
  {
    hash: "a3977a1",
    date: "2026-07-24",
    title: "Home page change",
    category: "Design",
  },
  {
    hash: "ecff72a",
    date: "2026-07-18",
    title: "Update Louisiana911 to include 3 cities",
    category: "Projects",
  },
  {
    hash: "7e84f1f",
    date: "2026-07-18",
    title: "Rebrand Caddo911 to Louisiana911",
    category: "Projects",
  },
];
export const articles = [
  {
    category: "Society & Culture",
    date: "Dec 2, 2018",
    title:
      "George H.W. Bush reflects on aging and the importance of family in letter to his children",
    file: "bush-aging-family.html",
  },
  {
    category: "Society & Culture",
    date: "Oct 7, 2018",
    title: "What Killed Anthony Bourdain?",
    file: "bourdain-love-addiction.html",
  },
  {
    category: "Society & Culture",
    date: "Aug 29, 2018",
    title:
      "Mike Pence dumped his college fiancee for being a ‘sinner’ and narced on his beer-drinking frat bros",
    file: "pence-fiancee.html",
  },
  {
    category: "Society & Culture",
    date: "Jun 15, 2018",
    title: "You’re not alone in the uncomfortable silence of loss",
    file: "youre-not-alone-loss.html",
  },
  {
    category: "Health & Medicine",
    date: "Jun 25, 2025",
    title: "Rethinking ‘end of life’ for aging medical equipment",
    file: "medical-equipment-end-of-life.html",
  },
  {
    category: "Health & Medicine",
    date: "Dec 6, 2017",
    title: "Why are America’s farmers killing themselves in record numbers?",
    file: "farmers-suicides.html",
  },
  {
    category: "Health & Medicine",
    date: "Jun 16, 2017",
    title: "Why a stay in the ICU can leave patients worse off",
    file: "icu-worse-off.html",
  },
  {
    category: "Health & Medicine",
    date: "Feb 29, 2012",
    title: "Killing babies no different from abortion, experts say",
    file: "abortion-babies.html",
  },
  {
    category: "Politics & International Relations",
    date: "Apr 4, 2019",
    title: "We Are Too Weak to Stop Israel",
    file: "weak-to-stop-israel.html",
  },
  {
    category: "Politics & International Relations",
    date: "Oct 10, 2018",
    title:
      "Chinese finance ministry official says ‘optimistic’ on trade war breakthrough",
    file: "trade-war-breakthrough.html",
  },
  {
    category: "Business & Technology",
    date: "Nov 6, 1996",
    title: "T. Vincent Learson, 84, I.B.M. Chief, Dies",
    file: "learson-dies.html",
  },
];
