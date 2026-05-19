'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const getScrollTop = (target) => {
    const navHeight = document.getElementById('navbar')?.offsetHeight || 0;
    return target.getBoundingClientRect().top + window.scrollY - navHeight - 10;
  };

  const scrollToHash = (hash, replaceUrl = false) => {
    if (!hash || hash === '#') return false;
    const target = document.querySelector(hash);
    if (!target) return false;

    window.scrollTo({ top: getScrollTop(target), behavior: 'smooth' });
    if (replaceUrl) history.replaceState(null, '', hash);
    return true;
  };

  document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const url = new URL(anchor.getAttribute('href'), window.location.href);
      const isSamePage = url.origin === window.location.origin && url.pathname === window.location.pathname;
      if (!isSamePage || !url.hash) return;

      event.preventDefault();
      scrollToHash(url.hash, true);
    });
  });

  if (window.location.hash) {
    history.scrollRestoration = 'manual';
    setTimeout(() => scrollToHash(window.location.hash), 80);
  }
});
