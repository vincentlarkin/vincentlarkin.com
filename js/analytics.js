// Google Analytics 4 for vincentlarkin.com.
(function() {
  'use strict';

  const GA_MEASUREMENT_ID = 'G-9D6Q6F0NB5';
  const ENGAGEMENT_SECONDS = [30, 60, 120];
  const SCROLL_DEPTHS = [25, 50, 75, 90];
  const DOWNLOAD_EXTENSIONS = /\.(7z|avi|csv|docx?|exe|gz|m4a|mov|mp3|mp4|mpeg|pdf|png|pptx?|rar|rtf|tar|txt|wav|wma|wmv|xlsx?|zip)$/i;

  let activePageKey = getPageKey();
  let activeSeconds = 0;
  let engagementTimer = null;
  let sentEngagement = new Set();
  let sentScrollDepths = new Set();
  const videoStates = new WeakMap();

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() {
    window.dataLayer.push(arguments);
  };

  // Load GA4 immediately on every page. Advertising and personalization
  // features remain disabled; this installation is for site measurement.
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_flags: 'SameSite=Lax;Secure',
    transport_type: 'beacon'
  });

  const googleTag = document.createElement('script');
  googleTag.async = true;
  googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(googleTag);

  function getPageKey() {
    return `${window.location.pathname}${window.location.search}`;
  }

  function getTheme() {
    return ['theme-light', 'theme-retro', 'theme-vin'].find(theme => document.body && document.body.classList.contains(theme))
      || localStorage.getItem('theme')
      || 'theme-light';
  }

  function getLanguage() {
    return localStorage.getItem('lang') || document.documentElement.lang || 'en';
  }

  function cleanText(value, fallback = '') {
    const text = String(value || fallback).replace(/\s+/g, ' ').trim();
    if (!text || /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) return fallback;
    return text.slice(0, 100);
  }

  function safePath(url) {
    return `${url.origin}${url.pathname}`.slice(0, 300);
  }

  function track(eventName, parameters = {}) {
    window.gtag('event', eventName, Object.assign({
      site_theme: getTheme(),
      site_language: getLanguage()
    }, parameters));
  }

  function resetPageEngagement() {
    const nextPageKey = getPageKey();
    if (nextPageKey === activePageKey) return;
    activePageKey = nextPageKey;
    activeSeconds = 0;
    sentEngagement = new Set();
    sentScrollDepths = new Set();
  }

  function startEngagementTimer() {
    if (engagementTimer) return;
    engagementTimer = window.setInterval(() => {
      if (document.visibilityState !== 'visible' || !document.hasFocus()) return;
      activeSeconds += 1;
      ENGAGEMENT_SECONDS.forEach(seconds => {
        if (activeSeconds >= seconds && !sentEngagement.has(seconds)) {
          sentEngagement.add(seconds);
          track('content_engagement', { engagement_seconds: seconds });
        }
      });
    }, 1000);
  }

  function handleScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    SCROLL_DEPTHS.forEach(depth => {
      if (percent >= depth && !sentScrollDepths.has(depth)) {
        sentScrollDepths.add(depth);
        track('scroll_depth', { percent_scrolled: depth });
      }
    });
  }

  function linkPlacement(link) {
    if (link.closest('header, #site-header')) return 'header';
    if (link.closest('footer, #site-footer')) return 'footer';
    if (link.closest('nav')) return 'navigation';
    return 'content';
  }

  function trackDownload(link, url, placement) {
    const fileName = decodeURIComponent(url.pathname.split('/').pop() || 'download').slice(0, 100);
    const extension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : 'unknown';
    track('file_download_click', {
      file_name: fileName,
      file_extension: extension,
      link_placement: placement
    });
  }

  function handleTrackedClick(event) {
    const selectOption = event.target.closest('.cs-option[data-value]');
    if (selectOption) {
      const select = selectOption.closest('.custom-select');
      const setting = select && select.dataset.name;
      if (setting === 'theme') {
        track('theme_change', { theme_name: cleanText(selectOption.dataset.value) });
      } else if (setting === 'lang') {
        track('language_change', { language_code: cleanText(selectOption.dataset.value) });
      }
    }

    const link = event.target.closest('a[href]');
    if (!link) return;
    const rawHref = link.getAttribute('href') || '';
    const placement = linkPlacement(link);

    if (rawHref.toLowerCase().startsWith('mailto:')) {
      track('contact_click', { contact_method: 'email', link_placement: placement });
      return;
    }
    if (rawHref.toLowerCase().startsWith('tel:')) {
      track('contact_click', { contact_method: 'telephone', link_placement: placement });
      return;
    }

    let url;
    try {
      url = new URL(link.href, window.location.origin);
    } catch (error) {
      return;
    }

    if (link.hasAttribute('download') || DOWNLOAD_EXTENSIONS.test(url.pathname)) {
      trackDownload(link, url, placement);
    }

    const linkLabel = cleanText(link.getAttribute('aria-label') || link.textContent, 'unlabeled');
    if (url.origin === window.location.origin) {
      track('navigation_click', {
        link_path: url.pathname,
        link_placement: placement,
        link_label: linkLabel
      });
      return;
    }

    const socialNetwork = url.hostname.includes('linkedin')
      ? 'linkedin'
      : url.hostname === 'github.com' || url.hostname.endsWith('.github.com')
        ? 'github'
        : 'other';
    track('outbound_click', {
      link_domain: url.hostname,
      link_url: safePath(url),
      link_placement: placement,
      link_label: linkLabel,
      outbound_type: socialNetwork === 'other' ? 'website' : 'social',
      social_network: socialNetwork
    });
  }

  function getVideoName(video) {
    const source = video.currentSrc || (video.querySelector('source') && video.querySelector('source').src) || '';
    try {
      return decodeURIComponent(new URL(source, window.location.origin).pathname.split('/').pop() || 'video');
    } catch (error) {
      return 'video';
    }
  }

  function handleVideoEvent(event) {
    const video = event.target.closest && event.target.closest('video');
    if (!video) return;
    const base = { video_title: cleanText(getVideoName(video), 'video') };
    const state = videoStates.get(video) || { started: false, milestones: new Set() };
    if (event.type === 'play') {
      track(state.started ? 'video_resume' : 'video_start', base);
      state.started = true;
    }
    if (event.type === 'ended') track('video_complete', base);
    if (event.type === 'pause' && !video.ended) {
      track('video_pause', Object.assign(base, { video_percent: Math.round((video.currentTime / video.duration) * 100) || 0 }));
    }
    if (event.type === 'timeupdate' && Number.isFinite(video.duration) && video.duration > 0) {
      const progress = (video.currentTime / video.duration) * 100;
      [25, 50, 75].forEach(percent => {
        if (progress >= percent && !state.milestones.has(percent)) {
          state.milestones.add(percent);
          track('video_progress', Object.assign(base, { video_percent: percent }));
        }
      });
    }
    videoStates.set(video, state);
  }

  function instrumentHistory() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    const handleChange = () => window.setTimeout(resetPageEngagement, 0);
    history.pushState = function() {
      const result = originalPushState.apply(this, arguments);
      handleChange();
      return result;
    };
    history.replaceState = function() {
      const result = originalReplaceState.apply(this, arguments);
      handleChange();
      return result;
    };
    window.addEventListener('popstate', handleChange);
  }

  function trackErrorPage() {
    const match = document.title.match(/\b(400|403|404|50\d)\b/i);
    if (match) track('site_error_view', { error_code: match[1].toLowerCase() });
  }

  function init() {
    instrumentHistory();
    document.addEventListener('click', handleTrackedClick);
    document.addEventListener('play', handleVideoEvent, true);
    document.addEventListener('pause', handleVideoEvent, true);
    document.addEventListener('ended', handleVideoEvent, true);
    document.addEventListener('timeupdate', handleVideoEvent, true);
    window.addEventListener('scroll', handleScroll, { passive: true });
    startEngagementTimer();
    trackErrorPage();
  }

  window.siteAnalytics = {
    configured: true,
    measurementId: GA_MEASUREMENT_ID,
    track
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
