export const photos = [
  {
    file: "agosto-setembro-2026.webp",
    date: "August–September 2026",
    year: "2026",
    alt: "An In-N-Out Burger restaurant with red awnings beneath a blue, cloud-streaked sky.",
  },
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
  { id: "projects", label: "Projects" },
  { id: "gallery", label: "Gallery" },
  { id: "reading", label: "News / Books" },
  { id: "changelog", label: "Changelog" },
];
export const projects = [
  {
    id: "louisiana911",
    title: "Louisiana911",
    category: "Public information",
    url: "https://louisiana911.com",
    domain: "louisiana911.com",
    image: "/images/projects/louisiana911-card.webp",
    alt: "The Louisiana911 map of Shreveport with recent 911 calls listed beside it.",
    description:
      "A public incident monitor that puts 911 calls and traffic incidents from across Louisiana on one map.",
    highlights: [
      "Live Caddo Parish 911 calls, with Baton Rouge and Lafayette traffic incidents",
      "Daily New Orleans records and Lake Charles closed calls",
      "Map and list views, history by date, and monthly summaries",
    ],
    tags: ["Public safety", "Live data", "Maps"],
  },
  {
    id: "ladf",
    title: "Louisiana Data & Defense Foundation",
    category: "Civic information",
    url: "https://ladf.us",
    domain: "ladf.us",
    image: "/images/projects/ladf-card.webp",
    alt: "The ladf.us home page, with an election notice and an address search.",
    description:
      "A plain-language directory of Louisiana local government: parish offices, who to call about services where you live, and who represents you.",
    highlights: [
      "Pages for all 64 parishes, with their offices, boards, and towns",
      "An address lookup for water, trash, permits, power, gas, and voting districts",
      "A guide to how Louisiana government works, with every official and party majority",
    ],
    tags: ["Government", "Civic data", "Maps"],
  },
  {
    id: "archive",
    title: "Royal Archive",
    category: "Reference archive",
    url: "https://archive.vincentlarkin.com",
    domain: "archive.vincentlarkin.com",
    image: "/images/projects/archive-card.webp",
    alt: "The Royal Archive home page, with its table of collections.",
    featured: true,
    description:
      "A self-hosted reference archive of flags, seals, insignia, laws, and artifacts, with every record stored locally.",
    highlights: [
      "Flags, seals, and coats of arms from around the world",
      "Readers for federal regulations, founding documents, and state law",
      "License plates, military manuals, and paintings",
    ],
    tags: ["Archive", "Self-hosted"],
  },
  {
    id: "lcb",
    title: "Larkin Computing Bureau",
    category: "Software",
    url: "https://larkincomputingbureau.com",
    domain: "larkincomputingbureau.com",
    image: "/images/projects/lcb-card.webp",
    alt: "The Larkin Computing Bureau home page, introducing lcb-ai with the headline AI. At home.",
    description:
      "Small personal software, made with care. Its main app, lcb-ai, runs AI models on your own computer.",
    highlights: [
      "lcb-ai: local models, saved conversations, and your own workspace",
      "Available for Windows and native Linux",
      "Also home to lcb-hermes and Neptune",
    ],
    tags: ["Software", "Local AI", "Desktop"],
  },
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
