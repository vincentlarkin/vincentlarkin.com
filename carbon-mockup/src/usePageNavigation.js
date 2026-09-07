import { useEffect } from "react";
import { flushSync } from "react-dom";

// Keep the Carbon shell mounted. Documents outside these routes retain their
// normal links, as do downloads, fragment links, and modified/new-tab clicks.
export function usePageNavigation({ route, paths, setPage, closeMenus, main }) {
  useEffect(() => {
    const originalTitle = document.title;
    const originalRoute = route();
    const titles = {
      home: "vincentlarkin.com",
      about: "About — vincentlarkin.com",
      gallery: "Gallery — vincentlarkin.com",
      reading: "News / Books — vincentlarkin.com",
      changelog: "Changelog — vincentlarkin.com",
    };
    const production = !!window.sitePreferences;
    const positions = new Map();
    let key = history.state?.carbonNavigationKey || crypto.randomUUID();
    history.replaceState({ ...history.state, carbonNavigationKey: key }, "");
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    let sequence = 0;
    let transition;
    let animation;
    const rememberScroll = () => positions.set(key, [scrollX, scrollY]);
    rememberScroll();

    async function navigate(url, nextPage, pop = false) {
      const request = ++sequence;
      transition?.skipTransition();
      animation?.cancel();
      const destinationKey = pop
        ? history.state?.carbonNavigationKey || crypto.randomUUID()
        : crypto.randomUUID();
      const position = pop ? positions.get(destinationKey) || [0, 0] : [0, 0];
      const commit = () => {
        if (request !== sequence) return;
        document.title =
          titles[nextPage] ||
          (nextPage === originalRoute ? originalTitle : document.title);
        if (!pop)
          history.pushState({ carbonNavigationKey: destinationKey }, "", url);
        key = destinationKey;
        document
          .querySelector('link[rel="canonical"]')
          ?.setAttribute(
            "href",
            `https://vincentlarkin.com${location.pathname}`,
          );
        document
          .querySelector('meta[property="og:url"]')
          ?.setAttribute(
            "content",
            `https://vincentlarkin.com${location.pathname}`,
          );
        flushSync(() => {
          setPage(nextPage);
          closeMenus();
        });
        window.scrollTo({
          left: position[0],
          top: position[1],
          behavior: "instant",
        });
        main.current?.focus({ preventScroll: true });
      };
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        commit();
      } else if (document.startViewTransition) {
        transition = document.startViewTransition(commit);
        // Skipping an interrupted transition is expected during quick clicks.
        transition.ready.catch(() => {});
      } else {
        animation = main.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 110,
          fill: "forwards",
          easing: "cubic-bezier(0.2, 0, 1, 0.9)",
        });
        await animation?.finished.catch(() => {});
        if (request !== sequence) return;
        animation?.cancel();
        commit();
        animation = main.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 150,
          easing: "cubic-bezier(0, 0, 0.38, 0.9)",
        });
      }
    }

    function onClick(event) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target.closest("a[href]");
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      )
        return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      const nextPage = production
        ? Object.keys(titles).find(
            (id) =>
              paths[id] === url.pathname ||
              (id === "home" && url.pathname === "/index.html"),
          )
        : Object.keys(titles).find((id) => url.hash === `#/${id}`);
      if (!nextPage || (production && (url.hash || url.search))) return;
      event.preventDefault();
      if (nextPage === route()) {
        ++sequence;
        transition?.skipTransition();
        animation?.cancel();
        closeMenus();
        return;
      }
      navigate(url.href, nextPage);
    }
    const onPop = () => navigate(location.href, route(), true);
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPop);
    window.addEventListener("scroll", rememberScroll, { passive: true });
    return () => {
      ++sequence;
      transition?.skipTransition();
      animation?.cancel();
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("scroll", rememberScroll);
      history.scrollRestoration = previousRestoration;
    };
  }, []);
}
