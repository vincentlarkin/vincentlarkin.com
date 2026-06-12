// Language System - Centralized translations
const supportedLangs = ['en', 'pt', 'ja'];
function normalizeLang(value) {
  return supportedLangs.includes(value) ? value : 'en';
}

let currentLang = normalizeLang(localStorage.getItem('lang'));
let translations = {};
let translationsLoaded = false;
let currentPage = null;
let langCallback = null;

// Fallback month names in case translations fail to load
const fallbackMonths = {
  janeiro:   { pt: 'Janeiro',   en: 'January',   ja: '1\u6708'  },
  fevereiro: { pt: 'Fevereiro', en: 'February',  ja: '2\u6708'  },
  'março':   { pt: 'Mar\u00E7o', en: 'March',    ja: '3\u6708'  },
  abril:     { pt: 'Abril',     en: 'April',     ja: '4\u6708'  },
  maio:      { pt: 'Maio',      en: 'May',       ja: '5\u6708'  },
  junho:     { pt: 'Junho',     en: 'June',      ja: '6\u6708'  },
  julho:     { pt: 'Julho',     en: 'July',      ja: '7\u6708'  },
  agosto:    { pt: 'Agosto',    en: 'August',    ja: '8\u6708'  },
  setembro:  { pt: 'Setembro',  en: 'September', ja: '9\u6708'  },
  outubro:   { pt: 'Outubro',   en: 'October',   ja: '10\u6708' },
  novembro:  { pt: 'Novembro',  en: 'November',  ja: '11\u6708' },
  dezembro:  { pt: 'Dezembro',  en: 'December',  ja: '12\u6708' }
};

const embeddedTranslations = {
  nav: {
    'nav-home':      { en: 'Home',                       pt: 'In\u00EDcio',                       ja: '\u30DB\u30FC\u30E0' },
    'nav-about':     { en: 'About',                      pt: 'Sobre',                             ja: '\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB' },
    'nav-news':      { en: 'News / Books',               pt: 'Not\u00EDcias / Livros',            ja: '\u30CB\u30E5\u30FC\u30B9 / \u672C' },
    'nav-gallery':   { en: 'Gallery',                    pt: 'Galeria',                           ja: '\u30AE\u30E3\u30E9\u30EA\u30FC' },
    'nav-changelog': { en: 'Changelog',                  pt: 'Changelog',                         ja: '\u66F4\u65B0\u5C65\u6B74' },
    'nav-caddo':     { en: 'Caddo911 Monitor',           pt: 'Caddo911 Monitor',                  ja: 'Caddo911 \u30E2\u30CB\u30BF\u30FC' },
    'nav-archive':   { en: 'archive.vincentlarkin.com',  pt: 'archive.vincentlarkin.com',         ja: 'archive.vincentlarkin.com' }
  },
  global: {
    'footer-github': { en: 'GitHub', pt: 'GitHub', ja: 'GitHub' }
  },
  index: {
    'welcome-title': { en: 'Welcome', pt: 'Bem-vindo', ja: '\u3088\u3046\u3053\u305D' },
    'intro-text': {
      en: 'Hello. This is my personal website. Use the menu above to navigate.',
      pt: 'Ol\u00E1. Este \u00E9 meu site pessoal. Navegue pelo menu acima para explorar.',
      ja: '\u3053\u3093\u306B\u3061\u306F\u3002\u3053\u3053\u306F\u79C1\u306E\u500B\u4EBA\u30A6\u30A7\u30D6\u30B5\u30A4\u30C8\u3067\u3059\u3002\u4E0A\u306E\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u3054\u5229\u7528\u304F\u3060\u3055\u3044\u3002'
    },
    'status-text':      { en: 'site online',      pt: 'site online',      ja: '\u30B5\u30A4\u30C8\u7A3C\u50CD\u4E2D' },
    'monthly-label':    { en: 'Image of the Month', pt: 'Imagem do M\u00EAs', ja: '\u4ECA\u6708\u306E\u753B\u50CF' },
    'monthly-caption':  { en: 'June-July 2026',    pt: 'Junho-Julho de 2026', ja: '2026\u5E746\u6708\u301C7\u6708' },
    'links-label':      { en: 'Quick Links',       pt: 'Links R\u00E1pidos', ja: '\u30AF\u30A4\u30C3\u30AF\u30EA\u30F3\u30AF' },
    'link-about':       { en: 'About',             pt: 'Sobre',            ja: '\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB' },
    'link-gallery':     { en: 'Gallery',           pt: 'Galeria',          ja: '\u30AE\u30E3\u30E9\u30EA\u30FC' },
    'recent-notes-label':   { en: 'Recent Notes',                 pt: 'Notas Recentes',                       ja: '\u6700\u8FD1\u306E\u30E1\u30E2' },
    'recent-notes-loading': { en: 'Loading recent commits...',    pt: 'Carregando commits recentes...',       ja: '\u6700\u8FD1\u306E\u30B3\u30DF\u30C3\u30C8\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D...' },
    'recent-notes-empty':   { en: 'No recent commits found.',     pt: 'Nenhum commit recente encontrado.',    ja: '\u6700\u8FD1\u306E\u30B3\u30DF\u30C3\u30C8\u306F\u3042\u308A\u307E\u305B\u3093\u3002' },
    'recent-notes-error':   { en: 'Could not load recent commits.', pt: 'N\u00E3o foi poss\u00EDvel carregar commits recentes.', ja: '\u6700\u8FD1\u306E\u30B3\u30DF\u30C3\u30C8\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002' },
    'view-changelog':       { en: 'View Changelog',               pt: 'Ver Changelog',                        ja: '\u66F4\u65B0\u5C65\u6B74\u3092\u898B\u308B' },
    'quick-about-description':     { en: 'Learn more about me',                                pt: 'Saiba mais sobre mim',                                                  ja: '\u79C1\u306B\u3064\u3044\u3066' },
    'quick-news-description':      { en: 'Reading',                                            pt: 'Leituras',                                                              ja: '\u8AAD\u66F8' },
    'quick-gallery-description':   { en: 'Historical monthly featured photos',                 pt: 'Fotos mensais em destaque do arquivo',                                  ja: '\u904E\u53BB\u306E\u6708\u9593\u6CE8\u76EE\u5199\u771F' },
    'quick-changelog-description': { en: 'Site updates and history',                           pt: 'Atualiza\u00E7\u00F5es e hist\u00F3rico do site',                       ja: '\u30B5\u30A4\u30C8\u306E\u66F4\u65B0\u3068\u5C65\u6B74' },
    'quick-caddo-description':     { en: '911 Incident Tracker. Now includes 1 parish and 2 cities.', pt: 'Monitor de incidentes 911. Agora inclui 1 par\u00F3quia e 2 cidades.', ja: '911\u901A\u5831\u8FFD\u8DE1\u30B7\u30B9\u30C6\u30E0\u30021\u90E1\u30682\u5E02\u306B\u5BFE\u5FDC\u3002' },
    'quick-archive-description':   { en: 'The Royal Archive Project',                          pt: 'The Royal Archive Project',                                             ja: '\u30ED\u30A4\u30E4\u30EB\u30FB\u30A2\u30FC\u30AB\u30A4\u30D6\u30FB\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8' },
    'contact-status-label': { en: 'Contact & Status',          pt: 'Contato e Status',           ja: '\u9023\u7D61\u5148 \u30FB \u30B9\u30C6\u30FC\u30BF\u30B9' },
    'view-profile':         { en: 'View Full Profile',         pt: 'Ver Perfil Completo',        ja: '\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u3092\u898B\u308B' },
    'status-operational':   { en: 'All systems operational.',  pt: 'Todos os sistemas operacionais.', ja: '\u3059\u3079\u3066\u6B63\u5E38\u306B\u7A3C\u50CD\u4E2D\u3067\u3059\u3002' }
  },
  about: {
    'about-title':         { en: 'About',                   pt: 'Sobre',                          ja: '\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB' },
    'personal-info-title': { en: 'Personal Information',    pt: 'Informa\u00E7\u00F5es Pessoais', ja: '\u500B\u4EBA\u60C5\u5831' },
    'label-occupation':    { en: 'Occupation',              pt: 'Ocupa\u00E7\u00E3o',             ja: '\u8077\u696D' },
    'value-occupation':    { en: 'Director of Operations',  pt: 'Diretor de Opera\u00E7\u00F5es', ja: '\u696D\u52D9\u7BA1\u7406\u30C7\u30A3\u30EC\u30AF\u30BF\u30FC' },
    'label-employer':      { en: 'Employer',                pt: 'Empregador',                     ja: '\u52E4\u52D9\u5148' },
    'contact-title':       { en: 'Contact',                 pt: 'Contato',                        ja: '\u9023\u7D61\u5148' },
    'label-github':        { en: 'Github',                  pt: 'Github',                         ja: 'Github' },
    'label-email':         { en: 'Email',                   pt: 'Email',                          ja: '\u30E1\u30FC\u30EB' },
    'label-linkedin':      { en: 'LinkedIn',                pt: 'LinkedIn',                       ja: 'LinkedIn' },

    'bio-tagline':         { en: 'Director of Operations',
                             pt: 'Diretor de Opera\u00E7\u00F5es',
                             ja: '\u696D\u52D9\u7BA1\u7406\u30C7\u30A3\u30EC\u30AF\u30BF\u30FC' },
    'bio-location':        { en: 'Shreveport-Bossier City Area',
                             pt: '\u00C1rea de Shreveport-Bossier City',
                             ja: '\u30B7\u30E5\u30EA\u30FC\u30D6\u30DD\u30FC\u30C8\uFF0F\u30DC\u30B7\u30A8\u5E02\u5468\u8FBA' },
    'bio-bullet-1':        { en: 'Strong work ethic.',
                             pt: '\u00C9tica de trabalho s\u00F3lida.',
                             ja: '\u52E4\u52B3\u3092\u3044\u3068\u308F\u306A\u3044\u59FF\u52E2\u3002' },
    'bio-bullet-2':        { en: 'Dedicated to completing the task at hand.',
                             pt: 'Dedicado a concluir a tarefa em andamento.',
                             ja: '\u76EE\u306E\u524D\u306E\u4ED5\u4E8B\u3092\u3084\u308A\u9042\u3052\u308B\u3053\u3068\u306B\u5C02\u5FF5\u3002' },
    'bio-bullet-3':        { en: 'JLPT N5',
                             pt: 'JLPT N5',
                             ja: '\u65E5\u672C\u8A9E\u80FD\u529B\u8A66\u9A13 N5' },
    'bio-quote':           { en: '\u201CMore is lost by indecision than a wrong decision.\u201D',
                             pt: '\u201CMais se perde pela indecis\u00E3o do que por uma decis\u00E3o errada.\u201D',
                             ja: '\u300C\u9593\u9055\u3063\u305F\u6C7A\u65AD\u3088\u308A\u3082\u3001\u4F55\u3082\u6C7A\u3081\u306A\u3044\u3053\u3068\u306E\u65B9\u304C\u591A\u304F\u3092\u5931\u3046\u3002\u300D' },
    'bio-skills-label':    { en: 'Top skills',
                             pt: 'Principais habilidades',
                             ja: '\u4E3B\u306A\u30B9\u30AD\u30EB' },
    'bio-tag-pm':          { en: 'Project Management', pt: 'Gest\u00E3o de Projetos', ja: '\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u7BA1\u7406' },
    'bio-tag-ops':         { en: 'Operations',         pt: 'Opera\u00E7\u00F5es',     ja: '\u696D\u52D9' },
    'bio-tag-shipping':    { en: 'International Shipping', pt: 'Transporte Internacional', ja: '\u56FD\u969B\u8F38\u9001' },
    'bio-tag-software':    { en: 'Software',           pt: 'Software',                ja: '\u30BD\u30D5\u30C8\u30A6\u30A7\u30A2' },
    'bio-tag-japanese':    { en: 'Japanese (N5)',      pt: 'Japon\u00EAs (N5)',       ja: '\u65E5\u672C\u8A9E\uFF08N5\uFF09' },
    'bio-tag-painting':    { en: 'Painting',           pt: 'Pintura',                 ja: '\u7D75\u753B' },
    'bio-tag-reading':     { en: 'Reading',            pt: 'Leitura',                 ja: '\u8AAD\u66F8' }
  },
  news: {
    'news-title': { en: 'News / Books', pt: 'Not\u00EDcias / Livros', ja: '\u30CB\u30E5\u30FC\u30B9 / \u672C' },
    'news-description': {
      en: 'Interesting articles from the internet and my bookshelf.',
      pt: 'Artigos interessantes da internet e minha estante de livros.',
      ja: '\u30A4\u30F3\u30BF\u30FC\u30CD\u30C3\u30C8\u306E\u8208\u5473\u6DF1\u3044\u8A18\u4E8B\u3068\u79C1\u306E\u672C\u68DA\u3002'
    },
    'news-section-society':  { en: 'Society & Culture',                  pt: 'Sociedade e Cultura',                              ja: '\u793E\u4F1A\u3068\u6587\u5316' },
    'news-section-health':   { en: 'Health & Medicine',                  pt: 'Sa\u00FAde e Medicina',                            ja: '\u5065\u5EB7\u3068\u533B\u5B66' },
    'news-section-politics': { en: 'Politics & International Relations', pt: 'Pol\u00EDtica e Rela\u00E7\u00F5es Internacionais', ja: '\u653F\u6CBB\u3068\u56FD\u969B\u95A2\u4FC2' },
    'news-section-business': { en: 'Business & Technology',              pt: 'Neg\u00F3cios e Tecnologia',                        ja: '\u30D3\u30B8\u30CD\u30B9\u3068\u30C6\u30AF\u30CE\u30ED\u30B8\u30FC' },
    'bookshelf-title': { en: 'Bookshelf', pt: 'Estante de Livros', ja: '\u672C\u68DA' },
    'bookshelf-subtitle': {
      en: 'Books I find insightful or good to have on hand.',
      pt: 'Livros que encontro interessantes ou bons para ter em m\u00E3os.',
      ja: '\u8208\u5473\u6DF1\u3044\u672C\u3084\u624B\u5143\u306B\u7F6E\u3044\u3066\u304A\u304D\u305F\u3044\u672C\u3002'
    },
    'bookshelf-empty-text': { en: 'No books added yet.',  pt: 'Nenhum livro adicionado ainda.', ja: '\u307E\u3060\u672C\u306F\u8FFD\u52A0\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002' },
    'wip-badge':            { en: 'Work in Progress',     pt: 'Em Progresso',                   ja: '\u5236\u4F5C\u4E2D' }
  },
  gallery: {
    'gallery-title': { en: 'Gallery', pt: 'Galeria', ja: '\u30AE\u30E3\u30E9\u30EA\u30FC' },
    'gallery-description': {
      en: 'Monthly images and my painting collection.',
      pt: 'Imagens mensais e minha cole\u00E7\u00E3o de pinturas.',
      ja: '\u6708\u9593\u753B\u50CF\u3068\u7D75\u753B\u30B3\u30EC\u30AF\u30B7\u30E7\u30F3\u3002'
    },
    'monthly-label':   { en: 'Monthly Gallery', pt: 'Galeria Mensal', ja: '\u6708\u9593\u30AE\u30E3\u30E9\u30EA\u30FC' },
    'paintings-label': { en: 'Paintings',       pt: 'Pinturas',       ja: '\u7D75\u753B' },
    'paintings-description': {
      en: 'A collection of paintings and images I like.',
      pt: 'Uma cole\u00E7\u00E3o de pinturas e imagens que gosto.',
      ja: '\u79C1\u304C\u597D\u304D\u306A\u7D75\u753B\u3068\u753B\u50CF\u306E\u30B3\u30EC\u30AF\u30B7\u30E7\u30F3\u3002'
    },
    'paintings-archive-prefix': { en: 'Moved to', pt: 'Movido para', ja: '\u79FB\u52D5\u5148\uFF1A' },
    'paintings-empty':          { en: 'No paintings yet.', pt: 'Nenhuma pintura ainda.', ja: '\u307E\u3060\u7D75\u753B\u306F\u3042\u308A\u307E\u305B\u3093\u3002' }
  },
  changelog: {
    'changelog-title': { en: 'Changelog', pt: 'Changelog', ja: '\u66F4\u65B0\u5C65\u6B74' },
    'changelog-subtitle': {
      en: 'Recent site updates',
      pt: 'Atualiza\u00E7\u00F5es recentes do site',
      ja: '\u30B5\u30A4\u30C8\u306E\u6700\u8FD1\u306E\u66F4\u65B0'
    },
    'changelog-source-label':  { en: 'Source:',           pt: 'Fonte:',                ja: '\u30BD\u30FC\u30B9\uFF1A' },
    'changelog-source-link':   { en: 'GitHub Repository', pt: 'Reposit\u00F3rio GitHub', ja: 'GitHub \u30EA\u30DD\u30B8\u30C8\u30EA' },
    'changelog-loading':       { en: 'Loading commits...', pt: 'Carregando commits...', ja: '\u30B3\u30DF\u30C3\u30C8\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D...' },
    'changelog-no-commits':    { en: 'No commits found',  pt: 'Nenhum commit encontrado', ja: '\u30B3\u30DF\u30C3\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093' },
    'changelog-error':         { en: 'Could not load commits from GitHub.', pt: 'N\u00E3o foi poss\u00EDvel carregar commits do GitHub.', ja: 'GitHub \u304B\u3089\u30B3\u30DF\u30C3\u30C8\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002' },
    'see-more-btn':            { en: 'See More',          pt: 'Ver Mais',              ja: '\u3082\u3063\u3068\u898B\u308B' },
    'see-more-remaining':      { en: 'remaining',         pt: 'restantes',             ja: '\u6B8B\u308A' }
  },
  holiday: {
    'title':    { en: "Today's holiday", pt: 'Feriado de hoje', ja: '\u4ECA\u65E5\u306E\u795D\u65E5' },
    'label-us': { en: 'United States',   pt: 'Estados Unidos',  ja: '\u30A2\u30E1\u30EA\u30AB\u5408\u8846\u56FD' },
    'label-pt': { en: 'Portugal',        pt: 'Portugal',        ja: '\u30DD\u30EB\u30C8\u30AC\u30EB' },
    'name-new-years-day':       { en: "New Year's Day",       pt: 'Ano Novo',                                   ja: '\u5143\u65E5' },
    'message-new-years-day':    { en: 'Happy New Year',       pt: 'Feliz Ano Novo',                             ja: '\u660E\u3051\u307E\u3057\u3066\u304A\u3081\u3067\u3068\u3046\u3054\u3056\u3044\u307E\u3059' },
    'name-presidents-day':      { en: "Presidents' Day",      pt: 'Dia dos Presidentes',                        ja: '\u5927\u7D71\u9818\u306E\u65E5' },
    'message-presidents-day':   { en: "Presidents' Day",      pt: 'Dia dos Presidentes',                        ja: '\u5927\u7D71\u9818\u306E\u65E5' },
    'name-easter':              { en: 'Easter',               pt: 'P\u00E1scoa',                                ja: '\u30A4\u30FC\u30B9\u30BF\u30FC' },
    'message-easter':           { en: 'Happy Easter',         pt: 'Feliz P\u00E1scoa',           ja: '\u30CF\u30C3\u30D4\u30FC\u30A4\u30FC\u30B9\u30BF\u30FC' },
    'name-memorial-day':        { en: 'Memorial Day',         pt: 'Dia da Mem\u00F3ria',         ja: '\u6226\u6CA1\u5C06\u5175\u8FFD\u60BC\u8A18\u5FF5\u65E5' },
    'message-memorial-day':     { en: 'Memorial Day',         pt: 'Dia da Mem\u00F3ria',         ja: '\u6226\u6CA1\u5C06\u5175\u8FFD\u60BC\u8A18\u5FF5\u65E5' },
    'name-independence-day':    { en: 'Independence Day',     pt: 'Dia da Independ\u00EAncia',   ja: '\u72EC\u7ACB\u8A18\u5FF5\u65E5' },
    'message-independence-day': { en: 'Happy Independence Day', pt: 'Feliz Dia da Independ\u00EAncia', ja: '\u72EC\u7ACB\u8A18\u5FF5\u65E5\u304A\u3081\u3067\u3068\u3046' },
    'name-labor-day':           { en: 'Labor Day',            pt: 'Dia do Trabalho',             ja: '\u30EC\u30A4\u30D0\u30FC\u30FB\u30C7\u30FC' },
    'message-labor-day':        { en: 'Labor Day',            pt: 'Dia do Trabalho',             ja: '\u30EC\u30A4\u30D0\u30FC\u30FB\u30C7\u30FC' },
    'name-columbus-day':        { en: 'Columbus Day',         pt: 'Dia de Colombo',              ja: '\u30B3\u30ED\u30F3\u30D6\u30B9\u30FB\u30C7\u30FC' },
    'message-columbus-day':     { en: 'Columbus Day',         pt: 'Dia de Colombo',              ja: '\u30B3\u30ED\u30F3\u30D6\u30B9\u30FB\u30C7\u30FC' },
    'name-veterans-day':        { en: 'Veterans Day',         pt: 'Dia dos Veteranos',           ja: '\u9000\u5F79\u8ECD\u4EBA\u306E\u65E5' },
    'message-veterans-day':     { en: 'Veterans Day',         pt: 'Dia dos Veteranos',           ja: '\u9000\u5F79\u8ECD\u4EBA\u306E\u65E5' },
    'name-thanksgiving':        { en: 'Thanksgiving',         pt: 'A\u00E7\u00E3o de Gra\u00E7as', ja: '\u611F\u8B1D\u796D' },
    'message-thanksgiving':     { en: 'Happy Thanksgiving',   pt: 'Feliz Dia de A\u00E7\u00E3o de Gra\u00E7as', ja: '\u611F\u8B1D\u796D\u304A\u3081\u3067\u3068\u3046' },
    'name-christmas':           { en: 'Christmas',            pt: 'Natal',                       ja: '\u30AF\u30EA\u30B9\u30DE\u30B9' },
    'message-christmas':        { en: 'Merry Christmas',      pt: 'Feliz Natal',                 ja: '\u30E1\u30EA\u30FC\u30AF\u30EA\u30B9\u30DE\u30B9' },
    'name-portugal-day':        { en: 'Portugal Day',         pt: 'Dia de Portugal',             ja: '\u30DD\u30EB\u30C8\u30AC\u30EB\u306E\u65E5' },
    'message-portugal-day':     { en: 'Portugal Day',         pt: 'Dia de Portugal',             ja: '\u30DD\u30EB\u30C8\u30AC\u30EB\u306E\u65E5' },
    'name-restoration-day':     { en: 'Restoration of Independence', pt: 'Restaura\u00E7\u00E3o da Independ\u00EAncia', ja: '\u72EC\u7ACB\u56DE\u5FA9\u306E\u65E5' },
    'message-restoration-day':  { en: 'Restoration of Independence', pt: 'Restaura\u00E7\u00E3o da Independ\u00EAncia', ja: '\u72EC\u7ACB\u56DE\u5FA9\u306E\u65E5' }
  },
  months: fallbackMonths
};

// Load translations from embedded object only
async function loadTranslations() {
  translations = embeddedTranslations;
  translationsLoaded = true;
  return true;
}

// Get current language
function getCurrentLang() {
  return currentLang;
}

function getTranslationEntry(page, key) {
  if (translations[page] && translations[page][key]) {
    return translations[page][key];
  }
  return null;
}

// Get translation for a key
function t(page, key) {
  const text = getTranslationEntry(page, key);
  return text ? (text[currentLang] || '') : '';
}

// Get month name (with fallback support)
function getMonthName(monthKey) {
  // Try translations first, then fallback
  if (translations.months && translations.months[monthKey]) {
    return translations.months[monthKey][currentLang] || monthKey;
  }
  if (fallbackMonths[monthKey]) {
    return fallbackMonths[monthKey][currentLang] || monthKey;
  }
  return monthKey;
}

// Apply nav translations
function applyNavTranslations() {
  const navTexts = translations.nav || {};
  for (const [id, text] of Object.entries(navTexts)) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text[currentLang] || '';
    }
  }
}

// Apply global translations (shared UI outside nav/page)
function applyGlobalTranslations() {
  const globalTexts = translations.global || {};
  for (const [id, text] of Object.entries(globalTexts)) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text[currentLang] || '';
    }
  }
}

// Apply page translations
function applyPageTranslations(page) {
  const pageTexts = translations[page] || {};

  function applyTranslatedContent(el, content) {
    if (el.tagName === 'A' && el.querySelector('span')) {
      el.querySelector('span').textContent = content;
    } else {
      el.textContent = content;
    }
  }

  for (const [id, text] of Object.entries(pageTexts)) {
    const el = document.getElementById(id);
    if (el) {
      const content = text[currentLang] || '';
      applyTranslatedContent(el, content);
    }
  }

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const sourcePage = el.dataset.i18nPage || page;
    const text = sourcePage === page ? pageTexts[key] : getTranslationEntry(sourcePage, key);
    if (text) {
      const content = text[currentLang] || '';
      applyTranslatedContent(el, content);
    }
  });
}

// Update language picker to reflect the current language.
// The picker is a custom <div class="custom-select" id="lang-select">
// managed by initCustomSelect() in site.js. We just call its
// setter so the trigger displays the right flag + label.
function updateLangButton() {
  const langSelect = document.getElementById('lang-select');
  if (langSelect && typeof window.setCustomSelectValue === 'function') {
    window.setCustomSelectValue(langSelect, currentLang);
  }
}

function setLanguage(lang) {
  currentLang = normalizeLang(lang);
  localStorage.setItem('lang', currentLang);
  document.documentElement.lang = currentLang;
  updateLangButton();
  applyNavTranslations();
  applyGlobalTranslations();
  if (currentPage) {
    applyPageTranslations(currentPage);
  }
  
  // Dispatch event for page-specific handling
  document.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { lang: currentLang } 
  }));
}

// Switch language - rotate through all supported langs
function switchLanguage() {
  const idx = supportedLangs.indexOf(currentLang);
  const next = supportedLangs[(idx + 1) % supportedLangs.length];
  setLanguage(next);
}

// Initialize language system
async function initLanguageSystem(page, callback) {
  currentPage = page || document.body.dataset.page || null;
  langCallback = typeof callback === 'function' ? callback : null;
  await loadTranslations();
  
  // Apply translations
  applyNavTranslations();
  applyGlobalTranslations();
  if (currentPage) {
    applyPageTranslations(currentPage);
  }
  document.documentElement.lang = currentLang;
  updateLangButton();
  
  // Bind the custom-select language picker.
  // The component is implemented in site.js and exposes
  // initCustomSelect() / setCustomSelectValue() on window.
  const langSelect = document.getElementById('lang-select');
  if (langSelect && typeof window.initCustomSelect === 'function') {
    window.initCustomSelect(langSelect, {
      value: currentLang,
      onSelect: nextLang => {
        setLanguage(nextLang);
        if (langCallback) langCallback(currentLang);
      }
    });
  }
  
  // Run callback with initial language
  if (langCallback) {
    langCallback(currentLang);
  }
}

// Export for use
window.langSystem = {
  init: initLanguageSystem,
  getCurrentLang,
  t,
  getMonthName,
  setLanguage,
  switchLanguage,
  applyPageTranslations,
  applyNavTranslations
};
