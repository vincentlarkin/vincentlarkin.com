function hideAdNote() {
  var note = document.getElementById('ad-note');
  var wrapper = document.getElementById('ad-note-content-wrapper');
  if (note) note.id = 'ad-note-hidden';
  if (wrapper) wrapper.innerHTML = '';
  try { localStorage.setItem('ad_note_dismissed', 'true'); } catch (e) {}
  try { document.cookie = 'ad_note_dismissed=true;path=/;max-age=31536000'; } catch (e) {}
}

function getCurrentLanguage() {
  try {
    var lang = localStorage.getItem('lang');
    if (lang) return lang;
  } catch (e) {}
  var docLang = (document.documentElement && document.documentElement.lang) || 'en';
  return (docLang === 'pt' || docLang === 'en') ? docLang : 'en';
}

function renderAdNoteContent() {
  var wrapper = document.getElementById('ad-note-content-wrapper');
  if (!wrapper) return;

  var lang = getCurrentLanguage();
  var text = {
    en: {
      message: 'No adblocker detected. Consider using <a href="https://ublockorigin.com/" rel="noopener noreferrer" target="_blank">uBlock Origin</a>.',
      dismiss: 'Dismiss'
    },
    pt: {
      message: 'Nenhum bloqueador de anúncios detetado. Considere usar o <a href="https://ublockorigin.com/" rel="noopener noreferrer" target="_blank">uBlock Origin</a>.',
      dismiss: 'Fechar'
    }
  };
  var t = text[lang] || text.en;

  wrapper.innerHTML = t.message + ' <button type="button" id="ad-note-close" aria-label="' + t.dismiss + '">' + t.dismiss + '</button>';
  var closeBtn = document.getElementById('ad-note-close');
  if (closeBtn) closeBtn.addEventListener('click', hideAdNote);
}

(function initAdNote(){
  // Only show once per browser
  try {
    if (localStorage.getItem('ad_note_dismissed') === 'true') return;
  } catch (e) {}
  if (document.cookie && document.cookie.indexOf('ad_note_dismissed=') !== -1) return;

  // If the placeholder div is missing, do nothing
  var hidden = document.getElementById('ad-note-hidden');
  if (!hidden) return;

  hidden.id = 'ad-note';
  renderAdNoteContent();

  // Re-render on language changes
  try {
    document.addEventListener('languageChanged', function(){
      if (document.getElementById('ad-note')) {
        renderAdNoteContent();
      }
    });
  } catch (e) {}
})();
