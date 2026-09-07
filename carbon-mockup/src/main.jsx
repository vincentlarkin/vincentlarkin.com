import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Theme,
  OverflowMenu,
  OverflowMenuItem,
  FeatureFlags,
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenuButton,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavLink,
  Button,
  ClickableTile,
  Tag,
  Modal,
  Search,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Accordion,
  AccordionItem,
  Breadcrumb,
  BreadcrumbItem,
} from "@carbon/react";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  ArrowLeft,
  Search as SearchIcon,
  Moon,
  Sun,
  UserAvatar,
  Image as ImageIcon,
  Book,
  Code,
  Launch,
  Email,
  LogoGithub,
  LogoLinkedin,
  Location,
  View,
  Copy,
  Checkmark,
  ChevronDown,
} from "@carbon/react/icons";
import "@fontsource/ibm-plex-sans/latin-300.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import { photos, photoSrc, navigation, changes, articles } from "./data";
import "./styles.scss";
import { t, language } from "./translations";
import { HolidayBanner, useHolidays } from "./HolidayBanner";
import { usePageNavigation } from "./usePageNavigation";

const external = { target: "_blank", rel: "noopener noreferrer" };
const paths = {
  home: "/",
  about: "/about.html",
  gallery: "/gallery.html",
  reading: "/news.html",
  changelog: "/changelog.html",
  privacy: "/privacy.html",
};
const hrefFor = (id) => (window.sitePreferences ? paths[id] || "/" : "#/" + id);
const route = () =>
  window.sitePreferences
    ? Object.keys(paths).find(
        (key) =>
          paths[key] === location.pathname ||
          (key === "home" && location.pathname === "/index.html"),
      ) || "document"
    : window.location.hash.replace("#/", "").split("?")[0] || "home";
const dateLabel = (value) =>
  new Date(`${value}T12:00:00`).toLocaleDateString(
    { en: "en-US", pt: "pt-PT", ja: "ja-JP" }[language],
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    },
  );

function SectionIntro({ number, title, children, href, link }) {
  return (
    <div className="section-intro">
      <span className="eyebrow">{number}</span>
      <h2>{children || t(title)}</h2>
      {href && (
        <a className="text-link" href={href}>
          {link}
          <ArrowRight size={20} />
        </a>
      )}
    </div>
  );
}

function PhotoButton({ photo, onOpen, featured = false }) {
  return (
    <button
      className={`photo-button ${featured ? "featured-photo" : ""}`}
      onClick={(event) => onOpen(photos.indexOf(photo), event.currentTarget)}
      aria-label={`View photograph: ${photo.date}`}
    >
      <span className="photo-crop">
        <img
          src={photoSrc(photo)}
          alt={photo.alt}
          loading={featured ? "eager" : "lazy"}
          fetchPriority={featured ? "high" : "auto"}
        />
        <span className="photo-expand">
          <View size={20} />
        </span>
      </span>
      <span className="photo-caption">
        <span>
          {featured && (
            <span className="eyebrow">{t("Image of the month")}</span>
          )}
          <span>{photo.date}</span>
        </span>
        <span className="photo-count">
          {featured ? "01 / 09" : <ArrowUpRight size={20} />}
        </span>
      </span>
    </button>
  );
}

function Home({ onPhoto }) {
  const { commits } = useCommits();
  const cards = [
    {
      title: "About",
      text: "Background and contact details.",
      icon: UserAvatar,
      href: hrefFor("about"),
      meta: "01",
    },
    {
      title: "Gallery",
      text: "Monthly photographs, 2025–2026.",
      icon: ImageIcon,
      href: hrefFor("gallery"),
      meta: "02",
    },
    {
      title: "News / Books",
      text: "Saved articles and books.",
      icon: Book,
      href: hrefFor("reading"),
      meta: "03",
    },
    {
      title: "Changelog",
      text: "Website updates and history.",
      icon: Code,
      href: hrefFor("changelog"),
      meta: "04",
    },
  ];
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <h1>
            Vincent
            <br />
            Larkin<span className="blue-period">.</span>
          </h1>
          <p className="hero-description">
            {t("Projects, photographs,")}
            <br /> {t("notes, and links.")}
          </p>
          <div className="hero-actions">
            <Button href={hrefFor("about")} renderIcon={ArrowRight}>
              {t("About Vincent")}
            </Button>
            <Button
              href={hrefFor("gallery")}
              kind="ghost"
              renderIcon={ArrowRight}
            >
              {t("View gallery")}
            </Button>
          </div>
          <span className="hero-location">
            <Location size={16} />
            Shreveport–Bossier City, Louisiana
          </span>
        </div>
        <PhotoButton photo={photos[0]} onOpen={onPhoto} featured />
      </section>
      <section className="index-section wrap" aria-labelledby="index-title">
        <div className="section-line">
          <h2 id="index-title">{t("Site pages")}</h2>
        </div>
        <div className="index-grid">
          {cards.map((c) => (
            <ClickableTile key={c.title} href={c.href} className="index-tile">
              <div className="tile-top">
                <c.icon size={24} />
                <span className="mono">{c.meta}</span>
              </div>
              <h3>{t(c.title)}</h3>
              <p>{t(c.text)}</p>
              <ArrowRight className="tile-arrow" size={24} />
            </ClickableTile>
          ))}
        </div>
      </section>
      <section className="projects-band">
        <div className="wrap section-grid">
          <SectionIntro number="01" title={t("Projects")} />
          <ClickableTile
            className="project-tile"
            href="https://louisiana911.com"
            {...external}
          >
            <div className="project-art louisiana-art">
              <img
                src="/images/louisiana911-icon-192.png"
                alt=""
                loading="lazy"
              />
            </div>
            <div className="project-body">
              <span className="eyebrow">{t("Public information")}</span>
              <h3>Louisiana911</h3>
              <p>
                {t(
                  "911 incident information for one parish and three Louisiana cities.",
                )}
              </p>
              <span className="project-domain">
                louisiana911.com
                <ArrowUpRight size={24} />
              </span>
            </div>
          </ClickableTile>
          <ClickableTile
            className="project-tile"
            href="https://archive.vincentlarkin.com"
            {...external}
          >
            <div className="project-art archive-image">
              <img src="/images/archive-gold-crest.png" alt="" loading="lazy" />
            </div>
            <div className="project-body">
              <span className="eyebrow">{t("Personal archive")}</span>
              <h3>{t("The archive")}</h3>
              <p>{t("Paintings and other collections.")}</p>
              <span className="project-domain">
                archive.vincentlarkin.com
                <ArrowUpRight size={24} />
              </span>
            </div>
          </ClickableTile>
        </div>
      </section>
      <section className="wrap section-grid photo-section">
        <SectionIntro
          number="02"
          title={t("Recent photographs")}
          href={hrefFor("gallery")}
          link="View all photographs"
        />
        <div className="recent-photos">
          {photos.slice(1, 4).map((p) => (
            <PhotoButton key={p.file} photo={p} onOpen={onPhoto} />
          ))}
        </div>
      </section>
      <section className="wrap section-grid recent-changes">
        <SectionIntro
          number="03"
          title={t("Recent updates")}
          href={hrefFor("changelog")}
          link="View the changelog"
        />
        <div className="change-list">
          {commits.slice(0, 3).map((c) => (
            <a
              className="change-row"
              key={c.hash}
              href={`https://github.com/vincentlarkin/vincentlarkin.com/commit/${c.hash}`}
              {...external}
            >
              <time dateTime={c.date}>{dateLabel(c.date)}</time>
              <span>{c.title}</span>
              <ArrowUpRight size={20} />
            </a>
          ))}
        </div>
      </section>
      <ContactBanner />
    </>
  );
}

function PageLead({ label, title, children, side }) {
  return (
    <section className="wrap page-lead">
      <Breadcrumb noTrailingSlash>
        <BreadcrumbItem href={hrefFor("home")}>{t("Home")}</BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>{t(label)}</BreadcrumbItem>
      </Breadcrumb>
      <div className="lead-grid">
        <div>
          <h1>{t(title)}</h1>
          {children && <p>{children}</p>}
        </div>
        {side && <div className="lead-side">{side}</div>}
      </div>
    </section>
  );
}

function Gallery({ onPhoto }) {
  const [year, setYear] = useState(0);
  const selections = [
    photos,
    photos.filter((p) => p.year === "2026"),
    photos.filter((p) => p.year === "2025"),
  ];
  return (
    <>
      <PageLead label={t("Gallery")} title={t("Gallery")}>
        {t("Monthly photographs.")}
        <span className="lead-note">
          August 2025 — July 2026 · {photos.length} photographs
        </span>
      </PageLead>
      <section
        className="wrap gallery-content"
        aria-label={t("Photograph archive")}
      >
        <Tabs
          selectedIndex={year}
          onChange={({ selectedIndex }) => setYear(selectedIndex)}
        >
          <TabList aria-label={t("Filter photographs by year")}>
            <Tab>
              {t("All photographs")}
              <span className="tab-count">09</span>
            </Tab>
            <Tab>
              2026 <span className="tab-count">05</span>
            </Tab>
            <Tab>
              2025 <span className="tab-count">04</span>
            </Tab>
          </TabList>
          <TabPanels>
            {selections.map((group, i) => (
              <TabPanel key={i}>
                <div className="gallery-grid">
                  {group.map((p) => (
                    <PhotoButton key={p.file} photo={p} onOpen={onPhoto} />
                  ))}
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </section>
      <section className="wrap paintings">
        <div>
          <h2>{t("Paintings")}</h2>
          <p>From the personal archive.</p>
          <Button
            href="https://archive.vincentlarkin.com"
            {...external}
            kind="tertiary"
            renderIcon={Launch}
          >
            Visit the archive
          </Button>
        </div>
        <div className="painting-images">
          {[
            "pair-at-toledo-bend",
            "red-roses-still-life",
            "shepherdess-with-her-flock",
          ].map((p, i) => (
            <img
              key={p}
              src={`/images/paintings/${p}-card.webp`}
              alt={
                [
                  "Pair at Toledo Bend",
                  "Red roses still life",
                  "Shepherdess with her flock",
                ][i]
              }
              loading="lazy"
            />
          ))}
        </div>
      </section>
    </>
  );
}

function About() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText("vincent@vincentlarkin.com");
      setCopied(true);
      setCopyError(false);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <>
      <PageLead label={t("About")} title={t("About")} />
      <section className="wrap about-layout">
        <div className="portrait">
          <img src="/images/profile.jpg" alt="Vincent Larkin" />
        </div>
        <div className="about-body">
          <h2>Vincent Larkin</h2>
          <p>{t("Director of Operations")}</p>
          <p>{t("Shreveport–Bossier City Area")}</p>
          <div className="skills">
            <span className="eyebrow">{t("Skills")}</span>
            <div>
              {[
                "Project management",
                "Operations",
                "International shipping",
                "Software",
                "Japanese · JLPT N5",
              ].map((s) => (
                <Tag key={t(s)} type="gray">
                  {t(s)}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="wrap contact-details section-grid">
        <SectionIntro number="01" title={t("Contact")} />
        <div className="contact-table">
          <div className="email-row">
            <a href="mailto:vincent@vincentlarkin.com">
              <Email size={24} />
              <span>
                <small>{t("Email")}</small>vincent@vincentlarkin.com
              </span>
              <ArrowUpRight size={20} />
            </a>
            <Button
              hasIconOnly
              kind="ghost"
              renderIcon={copied ? Checkmark : Copy}
              iconDescription={copied ? "Email copied" : "Copy email address"}
              onClick={copyEmail}
            />
          </div>
          <span className="sr-only" role="status">
            {copied
              ? "Email address copied."
              : copyError
                ? "Could not copy. Please select the email address above."
                : ""}
          </span>
          <a href="https://github.com/vincentlarkin" {...external}>
            <LogoGithub size={24} />
            <span>
              <small>GitHub</small>vincentlarkin
            </span>
            <ArrowUpRight size={20} />
          </a>
          <a href="https://www.linkedin.com/in/vincentwlarkin/" {...external}>
            <LogoLinkedin size={24} />
            <span>
              <small>LinkedIn</small>vincentwlarkin
            </span>
            <ArrowUpRight size={20} />
          </a>
        </div>
      </section>
    </>
  );
}

function Reading() {
  return (
    <>
      <PageLead label={t("News / Books")} title={t("News / Books")}>
        {t("Saved articles and books.")}
      </PageLead>
      <section className="wrap reading-layout">
        <div className="reading-aside">
          <span className="mono">11 ARTICLES / 4 TOPICS</span>
        </div>
        <div>
          <Accordion align="start">
            {[...new Set(articles.map((a) => a.category))].map(
              (category, i) => (
                <AccordionItem
                  key={t(category)}
                  title={
                    <span className="accordion-title">
                      {t(category)}
                      <span className="mono">
                        0
                        {articles.filter((a) => a.category === category).length}
                      </span>
                    </span>
                  }
                  open={i === 0}
                >
                  {articles
                    .filter((a) => a.category === category)
                    .map((a) => (
                      <a
                        className="article-row"
                        key={a.file}
                        href={`/articles/${a.file}`}
                        {...external}
                      >
                        <span className="eyebrow">{a.date}</span>
                        <span>{a.title}</span>
                        <ArrowUpRight size={20} />
                      </a>
                    ))}
                </AccordionItem>
              ),
            )}
          </Accordion>
          <div className="bookshelf">
            <Book size={40} />
            <div>
              <div className="bookshelf-title">
                <h2>{t("Bookshelf")}</h2>
                <Tag type="gray">{t("Work in progress")}</Tag>
              </div>
              <p>{t("Books I’m reading or have recently read.")}</p>
              <span className="empty-note">{t("No books added yet.")}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Changelog() {
  const { commits, status } = useCommits();
  return (
    <>
      <PageLead label={t("Changelog")} title={t("Changelog")}>
        {t("Website updates from GitHub.")}
        <span className="lead-note">
          {status === "live"
            ? t("Latest repository history")
            : status === "loading"
              ? t("Loading recent updates…")
              : t("GitHub is unavailable. Showing saved updates.")}
        </span>
      </PageLead>
      <section className="wrap changelog-layout">
        <div className="reading-aside">
          <a
            className="text-link"
            href="https://github.com/vincentlarkin/vincentlarkin.com/commits/main/"
            {...external}
          >
            {t("Full history on GitHub")}
            <Launch size={16} />
          </a>
        </div>
        <div>
          {commits.map((c) => (
            <a
              className="commit-card"
              key={c.hash}
              href={`https://github.com/vincentlarkin/vincentlarkin.com/commit/${c.hash}`}
              {...external}
            >
              <div>
                <time dateTime={c.date}>{dateLabel(c.date)}</time>
                <Tag type="gray">{t(c.category)}</Tag>
              </div>
              <h2>{c.title}</h2>
              <span className="mono">
                {c.hash}
                <ArrowUpRight size={24} />
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

function DocumentPage() {
  return (
    <div
      className="wrap document-page"
      dangerouslySetInnerHTML={{
        __html: window.carbonPage?.content || '<h1>{t("Page not found")}</h1>',
      }}
    />
  );
}

function Privacy() {
  return <DocumentPage />;
}

function useCommits() {
  const [state, setState] = useState({ commits: changes, status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    fetch(
      "https://api.github.com/repos/vincentlarkin/vincentlarkin.com/commits?per_page=20",
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) throw new Error("GitHub unavailable");
        return response.json();
      })
      .then((data) => {
        const commits = data
          .filter(
            (c) =>
              /^[a-f0-9]{40}$/.test(c.sha) &&
              c.commit?.message &&
              c.commit?.author?.date,
          )
          .map((c) => ({
            hash: c.sha.slice(0, 7),
            date: c.commit.author.date.slice(0, 10),
            title: c.commit.message.split("\n")[0],
            category: "Site update",
          }));
        if (!commits.length) throw new Error("No updates");
        setState({ commits, status: "live" });
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setState({ commits: changes, status: "fallback" });
      });
    return () => controller.abort();
  }, []);
  return state;
}

function ContactBanner() {
  return (
    <section className="contact-banner">
      <div className="wrap">
        <div>
          <h2>{t("Contact")}</h2>
        </div>
        <Button
          href="mailto:vincent@vincentlarkin.com"
          kind="ghost"
          renderIcon={ArrowUpRight}
        >
          {t("Email")}
        </Button>
      </div>
    </section>
  );
}

function ThemeMenuLabel() {
  return (
    <span className="theme-button-label">
      {t("Theme")}
      <ChevronDown size={16} />
    </span>
  );
}
function LanguageMenuLabel() {
  return (
    <span className="theme-button-label">
      {language.toUpperCase()}
      <ChevronDown size={16} />
    </span>
  );
}

function App() {
  const holidays = useHolidays();
  const [page, setPage] = useState(route);
  const [theme, setTheme] = useState(() => {
    try {
      return (window.sitePreferences?.mode ||
        localStorage.getItem("vl-carbon-theme")) === "g100"
        ? "g100"
        : "white";
    } catch {
      return "white";
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [preferenceMenu, setPreferenceMenu] = useState(null);
  const mobileMenuLauncher = useRef(null);
  const languageNames = { en: "English", pt: "Português", ja: "日本語" };
  const headerMenuOffset = (menu, direction, trigger) => ({
    left: -(menu.offsetWidth - trigger.offsetWidth) / 2,
    top: holidays.length ? 32 : 0,
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [photoIndex, setPhotoIndex] = useState(null);
  const main = useRef(null);
  const photoLauncher = useRef(null);
  const searchLauncher = useRef(null);
  function openPhoto(index, launcher) {
    photoLauncher.current = launcher || searchLauncher.current;
    setPhotoIndex(index);
    window.siteAnalytics?.track("gallery_image_open", {
      image_name: photos[index].file,
    });
  }
  usePageNavigation({
    route,
    paths,
    setPage,
    main,
    closeMenus: () => {
      setMenuOpen(false);
      setSearchOpen(false);
      setPreferenceMenu(null);
      setPhotoIndex(null);
    },
  });
  useEffect(() => {
    document.documentElement.dataset.carbonTheme = theme;
    document.documentElement.style.colorScheme =
      theme === "g100" ? "dark" : "light";
    try {
      localStorage.setItem("vl-carbon-theme", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    if (!window.sitePreferences)
      document.title = `${navigation.find((n) => n.id === page)?.label || "Privacy"} — Vincent Larkin`;
  }, [page]);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (photoIndex !== null) {
          setPhotoIndex(null);
          setSearchOpen(true);
        } else {
          setSearchOpen((v) => !v);
        }
      }
      if (e.key === "Escape") {
        setMenuOpen(false);
        setPhotoIndex(null);
        setSearchOpen(false);
      }
      if (
        photoIndex !== null &&
        (e.key === "ArrowRight" || e.key === "ArrowLeft")
      ) {
        e.preventDefault();
        setPhotoIndex(
          (i) =>
            (i + (e.key === "ArrowRight" ? 1 : photos.length - 1)) %
            photos.length,
        );
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [photoIndex]);
  const searchable = [
    ...navigation.map((n) => ({
      title: n.label,
      category: "Page",
      href: hrefFor(n.id),
    })),
    ...articles.map((a) => ({
      title: a.title,
      category: a.category,
      href: `/articles/${a.file}`,
    })),
    ...photos.map((p, i) => ({
      title: p.date,
      category: "Photograph",
      index: i,
    })),
    {
      title: "Louisiana911",
      category: "Project",
      href: "https://louisiana911.com",
    },
    {
      title: "Personal archive",
      category: "Project",
      href: "https://archive.vincentlarkin.com",
    },
  ];
  const results = query.trim()
    ? searchable.filter((r) =>
        `${r.title} ${r.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : searchable.filter((r) => r.category === "Page");
  const photo = photoIndex !== null ? photos[photoIndex] : null;
  return (
    <Theme
      theme={theme}
      className={`app-theme${holidays.length ? " has-holiday" : ""}`}
    >
      <Theme theme="g100">
        <Header aria-label="Vincent Larkin">
          <SkipToContent
            href="#main-content"
            onClick={(e) => {
              e.preventDefault();
              main.current?.focus();
              window.scrollTo(0, 0);
            }}
          />
          <HeaderMenuButton
            ref={mobileMenuLauncher}
            aria-label={menuOpen ? t("Close navigation") : t("Open navigation")}
            isActive={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          />
          <HeaderName href={hrefFor("home")} prefix="">
            <span className="brand-lockup">
              <img
                className="brand-emblem"
                src="/images/pelican-carbon.png"
                alt=""
              />
              <span>
                vincent<span className="brand-weight">larkin</span>
                <span className="brand-dot">.com</span>
              </span>
            </span>
          </HeaderName>
          <HeaderNavigation aria-label={t("Main navigation")}>
            {navigation.map((n) => (
              <HeaderMenuItem
                key={n.id}
                href={hrefFor(n.id)}
                isCurrentPage={page === n.id}
              >
                {t(n.label)}
              </HeaderMenuItem>
            ))}
          </HeaderNavigation>
          <HeaderGlobalBar>
            <HeaderGlobalAction
              className="header-search"
              aria-label={t("Search the site")}
              ref={searchLauncher}
              tooltipAlignment="end"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              className="header-mode-toggle"
              aria-label={
                theme === "white"
                  ? t("Switch to dark theme")
                  : t("Switch to light theme")
              }
              tooltipAlignment="end"
              onClick={() => (
                window.sitePreferences?.selectTheme(
                  "theme-light",
                  theme === "white" ? "g100" : "white",
                ),
                setTheme(theme === "white" ? "g100" : "white")
              )}
            >
              {theme === "white" ? <Moon size={20} /> : <Sun size={20} />}
            </HeaderGlobalAction>
            <HeaderGlobalAction
              className="header-github"
              aria-label={t("GitHub profile")}
              tooltipAlignment="end"
              as="a"
              href="https://github.com/vincentlarkin"
              {...external}
            >
              <LogoGithub size={20} />
            </HeaderGlobalAction>
            <OverflowMenu
              id="header-theme-menu"
              className="header-theme-trigger"
              menuOptionsClass="header-preference-options header-theme-options cds--g100"
              menuOffsetFlip={headerMenuOffset}
              open={preferenceMenu === "theme"}
              onOpen={() => setPreferenceMenu("theme")}
              onClose={() =>
                setPreferenceMenu((value) => (value === "theme" ? null : value))
              }
              aria-label={t("Theme")}
              iconDescription={t("Theme")}
              flipped
              renderIcon={ThemeMenuLabel}
            >
              {[
                ["carbon-light", "Carbon light"],
                ["carbon-dark", "Carbon dark"],
                ["theme-retro", "Retro"],
                ["theme-vin", "Life of a VIN"],
              ].map(([value, label]) => (
                <OverflowMenuItem
                  key={value}
                  itemText={
                    <span className="theme-option-label">
                      {t(label)}
                      {value ===
                        (theme === "g100" ? "carbon-dark" : "carbon-light") && (
                        <Checkmark size={16} aria-label="Selected" />
                      )}
                    </span>
                  }
                  onClick={() => {
                    setPreferenceMenu(null);
                    if (value.startsWith("carbon-")) {
                      const next = value === "carbon-dark" ? "g100" : "white";
                      window.sitePreferences?.selectTheme("theme-light", next);
                      setTheme(next);
                    } else window.sitePreferences?.selectTheme(value);
                  }}
                />
              ))}
            </OverflowMenu>
            <OverflowMenu
              id="header-language-menu"
              className="header-language-trigger"
              menuOptionsClass="header-preference-options header-language-options cds--g100"
              aria-label={`${t("Language")}: ${languageNames[language]}`}
              iconDescription={`${t("Language")}: ${languageNames[language]}`}
              flipped
              menuOffsetFlip={headerMenuOffset}
              open={preferenceMenu === "language"}
              onOpen={() => setPreferenceMenu("language")}
              onClose={() =>
                setPreferenceMenu((value) =>
                  value === "language" ? null : value,
                )
              }
              renderIcon={LanguageMenuLabel}
            >
              {Object.entries(languageNames).map(([code, name]) => (
                <OverflowMenuItem
                  key={code}
                  itemText={
                    <span className="theme-option-label">
                      <span lang={code}>{name}</span>
                      <span className="language-option-meta">
                        <span>{code.toUpperCase()}</span>
                        {code === language && (
                          <Checkmark size={16} aria-label="Selected" />
                        )}
                      </span>
                    </span>
                  }
                  onClick={() => {
                    setPreferenceMenu(null);
                    if (code === language) return;
                    window.sitePreferences?.selectLanguage(code);
                    setTimeout(() => location.reload(), 150);
                  }}
                />
              ))}
            </OverflowMenu>
          </HeaderGlobalBar>
          <SideNav
            aria-label={t("Mobile navigation")}
            expanded={menuOpen}
            isPersistent={false}
            onOverlayClick={() => setMenuOpen(false)}
          >
            <SideNavItems>
              <SideNavLink
                href="#search"
                onClick={(event) => {
                  event.preventDefault();
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
              >
                {t("Search the site")}
              </SideNavLink>
              {navigation.map((n) => (
                <SideNavLink
                  key={n.id}
                  href={hrefFor(n.id)}
                  isActive={page === n.id}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(n.label)}
                </SideNavLink>
              ))}
            </SideNavItems>
          </SideNav>
        </Header>
        <HolidayBanner holidays={holidays} />
      </Theme>
      <main id="main-content" ref={main} tabIndex={-1} key={page}>
        {page === "home" ? (
          <Home onPhoto={openPhoto} />
        ) : page === "gallery" ? (
          <Gallery onPhoto={openPhoto} />
        ) : page === "about" ? (
          <About />
        ) : page === "reading" ? (
          <Reading />
        ) : page === "changelog" ? (
          <Changelog />
        ) : page === "document" ? (
          <DocumentPage />
        ) : page === "privacy" ? (
          <Privacy />
        ) : (
          <>
            <PageLead label={t("Page not found")} title={t("Page not found")}>
              {t("This page does not exist.")}
            </PageLead>
            <div className="wrap not-found">
              <Button href={hrefFor("home")} renderIcon={ArrowRight}>
                {t("Back to home")}
              </Button>
            </div>
          </>
        )}
      </main>
      <footer className="site-footer">
        <div className="wrap footer-top">
          <a className="footer-name" href={hrefFor("home")}>
            Vincent Larkin<span>.</span>
          </a>
          <p>
            {t("Projects, photographs,")}
            <br /> {t("notes, and links.")}
          </p>
          <div>
            <a href="https://github.com/vincentlarkin" {...external}>
              GitHub
              <ArrowUpRight size={16} />
            </a>
            <a href="https://www.linkedin.com/in/vincentwlarkin/" {...external}>
              LinkedIn
              <ArrowUpRight size={16} />
            </a>
            <a href="mailto:vincent@vincentlarkin.com">
              {t("Email")}
              <ArrowUpRight size={16} />
            </a>
          </div>
          <Button
            kind="ghost"
            renderIcon={ArrowUp}
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              });
              main.current?.focus({ preventScroll: true });
            }}
          >
            {t("Back to top")}
          </Button>
        </div>

        <div className="wrap footer-bottom">
          <span>© {new Date().getFullYear()} Vincent Larkin</span>
          <div>
            <a href={hrefFor("privacy")}>{t("Privacy")}</a>
            <a href="https://status.vincentlarkin.com" {...external}>
              {t("Site status")}
              <ArrowUpRight size={14} />
            </a>
            <a href="https://carbondesignsystem.com/" {...external}>
              {t("Built with Carbon")}
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </footer>
      <Modal
        open={searchOpen}
        onRequestClose={() => setSearchOpen(false)}
        passiveModal
        modalHeading={t("Search the site")}
        modalLabel="Vincent Larkin"
        size="sm"
        selectorPrimaryFocus="#site-search"
        launcherButtonRef={
          window.matchMedia("(max-width: 480px)").matches
            ? mobileMenuLauncher
            : searchLauncher
        }
        className="search-modal"
      >
        <Search
          id="site-search"
          size="lg"
          labelText="Search pages, photographs, and articles"
          placeholder="Search pages, photographs, articles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
        />
        <div className="search-heading" aria-live="polite">
          {query
            ? `${results.length} result${results.length === 1 ? "" : "s"}`
            : "Explore the site"}
        </div>
        <div className="search-results">
          {results.map((r, i) =>
            r.index !== undefined ? (
              <button
                key={i}
                onClick={() => {
                  setSearchOpen(false);
                  openPhoto(r.index);
                }}
              >
                <span>
                  <small>{r.category}</small>
                  {r.title}
                </span>
                <ImageIcon size={20} />
              </button>
            ) : (
              <a
                key={i}
                href={r.href}
                {...(r.href.startsWith("https:") ? external : {})}
                onClick={() => setSearchOpen(false)}
              >
                <span>
                  <small>{r.category}</small>
                  {r.title}
                </span>
                <ArrowRight size={20} />
              </a>
            ),
          )}
          {results.length === 0 && (
            <div className="search-empty">
              <SearchIcon size={32} />
              <p>No matches for “{query}”.</p>
              <span>Try a topic, year, or page name.</span>
            </div>
          )}
        </div>
        <p className="search-tip">Ctrl / ⌘ K to search · Esc to close</p>
      </Modal>
      <Modal
        open={photo !== null}
        launcherButtonRef={photoLauncher}
        onRequestClose={() => setPhotoIndex(null)}
        passiveModal
        modalHeading={photo?.date || "Photograph"}
        modalLabel="The monthly collection"
        size="lg"
        className="photo-modal"
      >
        {photo && (
          <>
            <img
              className="lightbox-image"
              src={photoSrc(photo, "")}
              alt={photo.alt}
            />
            <div className="lightbox-controls">
              <Button
                kind="ghost"
                renderIcon={ArrowLeft}
                onClick={() =>
                  setPhotoIndex((i) => (i + photos.length - 1) % photos.length)
                }
              >
                Previous
              </Button>
              <span className="mono" aria-live="polite">
                {String(photoIndex + 1).padStart(2, "0")} / 09
              </span>
              <Button
                kind="ghost"
                renderIcon={ArrowRight}
                onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
              >
                Next
              </Button>
            </div>
            <p className="lightbox-tip">
              Use the left and right arrow keys to explore.
            </p>
          </>
        )}
      </Modal>
    </Theme>
  );
}

export function mount(element) {
  createRoot(element).render(
    <FeatureFlags enableFocusWrapWithoutSentinels>
      <App />
    </FeatureFlags>,
  );
}
if (!window.sitePreferences) mount(document.getElementById("root"));
