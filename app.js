(function(){
  "use strict";

  const catalogList = document.getElementById("catalogList");
  const reader = document.getElementById("reader");
  const catalogEl = document.getElementById("catalog");
  const catalogToggle = document.getElementById("catalogToggle");
  const catalogOverlay = document.getElementById("catalogOverlay");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const settingsClose = document.getElementById("settingsClose");
  const viewportSelect = document.getElementById("viewportSelect");
  const fontSizeSelect = document.getElementById("fontSizeSelect");
  const themeSelect = document.getElementById("themeSelect");
  const viewportInfo = document.getElementById("viewportInfo");

  // ---- flat index for quick lookup + prev/next ----
  const flat = [];
  DATA.forEach((cat, ci) => {
    cat.ideologies.forEach((ideo, ii) => {
      flat.push({ ci, ii, cat, ideo });
    });
  });

  function findByIdeoId(id){
    return flat.find(f => f.ideo.id === id) || null;
  }

  // ---------------- Настройки ----------------
  // Загрузка сохранённых настроек
  function loadSettings() {
    const saved = localStorage.getItem('ideological-compass-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        if (settings.viewport) viewportSelect.value = settings.viewport;
        if (settings.fontSize) fontSizeSelect.value = settings.fontSize;
        if (settings.theme) themeSelect.value = settings.theme;
        applyViewport(settings.viewport || 'auto');
        applyFontSize(settings.fontSize || 'medium');
        applyTheme(settings.theme || 'light');
      } catch (e) {
        // ignore
      }
    }
  }

  function saveSettings() {
    const settings = {
      viewport: viewportSelect.value,
      fontSize: fontSizeSelect.value,
      theme: themeSelect.value
    };
    localStorage.setItem('ideological-compass-settings', JSON.stringify(settings));
  }

  function applyViewport(value) {
    const frame = document.querySelector('.frame');
    const catalog = document.getElementById('catalog');
    const reader = document.getElementById('reader');
    
    // Сброс классов
    frame.classList.remove('viewport-phone', 'viewport-tablet', 'viewport-desktop', 'viewport-tv');
    catalog.classList.remove('viewport-phone', 'viewport-tablet', 'viewport-desktop', 'viewport-tv');
    
    if (value === 'phone') {
      frame.classList.add('viewport-phone');
      catalog.classList.add('viewport-phone');
      viewportInfo.textContent = '📱 Телефон (до 480px)';
    } else if (value === 'tablet') {
      frame.classList.add('viewport-tablet');
      catalog.classList.add('viewport-tablet');
      viewportInfo.textContent = '📱 Планшет (481-880px)';
    } else if (value === 'desktop') {
      frame.classList.add('viewport-desktop');
      catalog.classList.add('viewport-desktop');
      viewportInfo.textContent = '💻 Компьютер (881-1200px)';
    } else if (value === 'tv') {
      frame.classList.add('viewport-tv');
      catalog.classList.add('viewport-tv');
      viewportInfo.textContent = '🖥 Телевизор (1200px+)';
    } else {
      viewportInfo.textContent = '🔄 Авто (адаптивно)';
    }
    saveSettings();
  }

  function applyFontSize(value) {
    document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    document.body.classList.add('font-' + value);
    saveSettings();
  }

  function applyTheme(value) {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
    document.body.classList.add('theme-' + value);
    saveSettings();
  }

  // ---- Настройки UI ----
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('open');
  });

  settingsClose.addEventListener('click', () => {
    settingsPanel.classList.remove('open');
  });

  // Закрытие настроек при клике вне
  document.addEventListener('click', (e) => {
    if (settingsPanel.classList.contains('open')) {
      if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
        settingsPanel.classList.remove('open');
      }
    }
  });

  viewportSelect.addEventListener('change', (e) => {
    applyViewport(e.target.value);
  });

  fontSizeSelect.addEventListener('change', (e) => {
    applyFontSize(e.target.value);
  });

  themeSelect.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });

  // ---- flat index for quick lookup + prev/next ----
  // (уже объявлен выше)

  function findByIdeoId(id){
    return flat.find(f => f.ideo.id === id) || null;
  }

  // ---------------- Sidebar (catalog) ----------------
  function renderCatalog(activeIdeoId){
    catalogList.innerHTML = "";
    DATA.forEach((cat, catIndex) => {
      const group = document.createElement("div");
      group.className = "cat-group";
      const isOpen = cat.ideologies.some(i => i.id === activeIdeoId);
      if (isOpen) group.classList.add("open");

      const head = document.createElement("button");
      head.className = "cat-head";
      head.innerHTML = `<span class="cat-eyebrow">${cat.eyebrow}</span><span class="cat-name">${cat.name}</span><span class="cat-chevron">›</span>`;
      head.addEventListener("click", (e) => {
        e.stopPropagation();
        group.classList.toggle("open");
      });
      group.appendChild(head);

      const coreIdeo = cat.ideologies[0];
      const catBtn = document.createElement("button");
      catBtn.className = "cat-btn";
      catBtn.innerHTML = `<span class="cat-btn-icon">⌘</span> <span>${cat.name}</span> <span class="cat-btn-count">${cat.ideologies.length}</span>`;
      catBtn.addEventListener("click", () => {
        location.hash = "#/" + coreIdeo.id;
        closeMobileCatalog();
      });
      group.appendChild(catBtn);

      const tagline = document.createElement("p");
      tagline.className = "cat-tagline";
      tagline.textContent = cat.tagline;
      group.appendChild(tagline);

      const ul = document.createElement("ul");
      ul.className = "ideo-list";
      cat.ideologies.forEach((ideo) => {
        const li = document.createElement("li");
        li.className = "ideo-item";
        const btn = document.createElement("button");
        btn.className = "ideo-btn" + (ideo.id.endsWith("-core") ? " core" : "");
        if (ideo.id === activeIdeoId) btn.classList.add("active");
        
        let label = ideo.name;
        if (ideo.isExtremist) {
          label = '⚠ ' + ideo.name;
        } else if (ideo.isRadical) {
          label = '⚡ ' + ideo.name;
        }
        btn.textContent = label;
        
        btn.addEventListener("click", () => {
          location.hash = "#/" + ideo.id;
          closeMobileCatalog();
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      group.appendChild(ul);
      catalogList.appendChild(group);
    });
  }

  function closeMobileCatalog(){
    catalogEl.classList.remove("open");
    if (catalogOverlay) {
      catalogOverlay.style.display = "none";
      document.body.style.overflow = "";
    }
  }

  // Обработка оверлея
  if (catalogOverlay) {
    catalogOverlay.addEventListener("click", closeMobileCatalog);
  }

  // Отслеживание открытия/закрытия каталога
  const observer = new MutationObserver(function() {
    if (catalogOverlay) {
      if (catalogEl.classList.contains("open")) {
        catalogOverlay.style.display = "block";
        document.body.style.overflow = "hidden";
      } else {
        catalogOverlay.style.display = "none";
        document.body.style.overflow = "";
      }
    }
  });
  observer.observe(catalogEl, { attributes: true, attributeFilter: ['class'] });

  // Закрытие каталога по клику вне его
  document.addEventListener("click", function(e) {
    const isMobile = window.innerWidth <= 880;
    if (!isMobile) return;
    const isCatalog = catalogEl.contains(e.target);
    const isToggle = catalogToggle.contains(e.target);
    if (!isCatalog && !isToggle && catalogEl.classList.contains("open")) {
      closeMobileCatalog();
    }
  });

  catalogToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    catalogEl.classList.toggle("open");
  });

  // ---------------- Cover (welcome) screen ----------------
  function renderCover(){
    const cells = DATA.map(cat => {
      const core = cat.ideologies[0];
      const hasRadical = cat.ideologies.some(i => i.isRadical || i.isExtremist);
      return `<div class="cover-cell" data-id="${core.id}">
        <div class="n">${cat.eyebrow}</div>
        <div class="t">${cat.name}</div>
        <div class="cover-cell-count">${cat.ideologies.length}${hasRadical ? ' ⚡' : ''}</div>
      </div>`;
    }).join("");

    const totalIdeologies = flat.length;
    const radicalCount = flat.filter(i => i.ideo.isRadical).length;
    const extremistCount = flat.filter(i => i.ideo.isExtremist).length;

    reader.innerHTML = `
      <div class="mobile-bar">
        <button id="mbToggle" aria-label="Открыть каталог">☰</button>
        <span>Идеологический Компас</span>
        <button id="settingsBtn" class="settings-toggle" aria-label="Настройки">⚙</button>
        <span class="version-badge">v7.0</span>
      </div>
      <div class="cover">
        <div class="cover-eyebrow">Справочник · ${DATA.length} категорий · ${totalIdeologies} идеологий</div>
        <h1>Идеологический Компас</h1>
        <div class="version-badge-page">Версия 7.0</div>

        <!-- ДИСКЛЕЙМЕР -->
        <div class="disclaimer">
          <div class="disclaimer-icon">⚠</div>
          <div class="disclaimer-content">
            <strong>Важное предупреждение</strong>
            <p>Данный сайт является <strong>справочно-информационным</strong> ресурсом. 
            Он <strong>НЕ пропагандирует</strong>, не одобряет и не поддерживает ни одну из представленных идеологий. 
            Все описания носят <strong>академический, нейтрально-информационный</strong> характер.</p>
            <p>Некоторые идеологии, представленные здесь, могут быть <strong>опасными, дискриминационными</strong> или противоречащими общечеловеческим ценностям. 
            Сайт <strong>не рекомендует</strong> их к принятию или реализации.</p>
            <p><strong>Цель проекта</strong> — образовательная: дать объективное представление о многообразии политических учений.</p>
            <div class="legend">
              <span class="legend-item"><span class="legend-dot radical"></span> Радикальные (${radicalCount})</span>
              <span class="legend-item"><span class="legend-dot extremist"></span> Экстремистские (${extremistCount})</span>
            </div>
          </div>
        </div>

        <h2>Карта политических учений — от общей собственности до абсолютной власти одного человека.</h2>
        <p class="lede">Выберите категорию слева, чтобы открыть её разновидности, или начните с одной из ${DATA.length} основных категорий ниже. ⚡ — радикальные, ⚠ — экстремистские идеологии.</p>
        <div class="cover-grid">${cells}</div>
      </div>
    `;
    reader.querySelectorAll(".cover-cell").forEach(cell => {
      cell.addEventListener("click", () => { location.hash = "#/" + cell.dataset.id; });
    });
    
    // Настройки в мобильной панели
    const mbToggle = document.getElementById("mbToggle");
    if (mbToggle) {
      mbToggle.addEventListener("click", () => {
        catalogEl.classList.toggle("open");
      });
    }
    
    // Кнопка настроек в мобильной панели
    const mbSettings = document.getElementById("settingsBtn");
    if (mbSettings) {
      mbSettings.addEventListener("click", () => {
        settingsPanel.classList.toggle("open");
      });
    }
  }

  // ---------------- Entry (ideology) screen ----------------
  function axisPercent(v){ return ((v + 100) / 200) * 100; }

  function renderEntry(found, chapterIndex){
    const { cat, ideo } = found;
    chapterIndex = Math.min(Math.max(chapterIndex, 0), ideo.chapters.length - 1);

    const tabs = ideo.chapters.map((ch, i) => `
      <button class="chapter-tab${i===chapterIndex ? " active":""}" data-i="${i}">
        <span class="idx">${String(i+1).padStart(2,"0")}</span>${ch.title}
      </button>
    `).join("");

    const ch = ideo.chapters[chapterIndex];

    const flatIdx = flat.indexOf(found);
    const prev = flat[flatIdx - 1] || flat[flat.length - 1];
    const next = flat[flatIdx + 1] || flat[0];

    const coreIdeo = cat.ideologies[0];
    const isCore = ideo.id === coreIdeo.id;

    let disclaimerType = 'standard';
    let disclaimerText = 'Сайт не пропагандирует данную идеологию';
    let disclaimerClass = 'mini-disclaimer';
    
    if (ideo.isExtremist) {
      disclaimerType = 'extremist';
      disclaimerText = '⚠ ЭКСТРЕМИСТСКАЯ ИДЕОЛОГИЯ — сайт не пропагандирует и осуждает';
      disclaimerClass = 'mini-disclaimer extremist-disclaimer';
    } else if (ideo.isRadical) {
      disclaimerType = 'radical';
      disclaimerText = '⚡ РАДИКАЛЬНАЯ ИДЕОЛОГИЯ — сайт не пропагандирует';
      disclaimerClass = 'mini-disclaimer radical-disclaimer';
    }

    reader.innerHTML = `
      <div class="mobile-bar">
        <button id="mbToggle" aria-label="Открыть каталог">☰</button>
        <span>${isCore ? 'Категория' : ''} ${cat.name}</span>
        <button id="settingsBtn" class="settings-toggle" aria-label="Настройки">⚙</button>
        <span class="version-badge">v7.0</span>
      </div>
      <div class="entry">
        <div class="${disclaimerClass}">
          <span>${disclaimerType === 'extremist' ? '⚠' : '⚡'}</span> ${disclaimerText}
        </div>
        <div class="entry-breadcrumb">
          <button id="toCover">Идеологический Компас</button> &nbsp;/&nbsp; 
          <button class="cat-breadcrumb" id="toCategory">${cat.eyebrow} ${cat.name}</button>
          ${isCore ? '' : `&nbsp;/&nbsp; ${ideo.name}`}
        </div>
        <h2>${ideo.name}</h2>
        <p class="tagline">${ideo.tagline}</p>

        <div class="compass">
          <div class="gauge-row">
            <span class="gauge-label">Экономика</span>
            <div>
              <div class="gauge-track"><div class="gauge-marker" style="left:${axisPercent(ideo.axis.econ)}%"></div></div>
              <div class="gauge-ends"><span>план / общее</span><span>рынок / частное</span></div>
            </div>
          </div>
          <div class="gauge-row">
            <span class="gauge-label">Власть</span>
            <div>
              <div class="gauge-track"><div class="gauge-marker" style="left:${axisPercent(ideo.axis.auth)}%"></div></div>
              <div class="gauge-ends"><span>автономия личности</span><span>тотальный контроль</span></div>
            </div>
          </div>
        </div>

        <div class="chapter-tabs">${tabs}</div>
        <div class="chapter-body">
          <h3>${ch.title}</h3>
          <p>${ch.body}</p>
        </div>

        <div class="entry-nav">
          <button class="prev" id="navPrev"><span class="dir">← Предыдущая</span>${prev.ideo.name}</button>
          <button class="next" id="navNext"><span class="dir">Следующая →</span>${next.ideo.name}</button>
        </div>
      </div>
    `;

    reader.querySelectorAll(".chapter-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        location.hash = "#/" + ideo.id + "/" + btn.dataset.i;
      });
    });
    document.getElementById("toCover").addEventListener("click", () => { location.hash = "#/"; });
    const catBreadcrumb = document.getElementById("toCategory");
    if (catBreadcrumb) {
      catBreadcrumb.addEventListener("click", () => {
        location.hash = "#/" + coreIdeo.id;
      });
    }
    document.getElementById("navPrev").addEventListener("click", () => { location.hash = "#/" + prev.ideo.id; });
    document.getElementById("navNext").addEventListener("click", () => { location.hash = "#/" + next.ideo.id; });
    
    // Настройки в мобильной панели
    const mbToggle = document.getElementById("mbToggle");
    if (mbToggle) {
      mbToggle.addEventListener("click", () => {
        catalogEl.classList.toggle("open");
      });
    }
    
    const mbSettings = document.getElementById("settingsBtn");
    if (mbSettings) {
      mbSettings.addEventListener("click", () => {
        settingsPanel.classList.toggle("open");
      });
    }
    
    reader.scrollTo({top:0});
  }

  // ---------------- Router ----------------
  function route(){
    const hash = location.hash.replace(/^#\/?/, "");
    if (!hash){
      renderCover();
      renderCatalog(null);
      return;
    }
    const parts = hash.split("/");
    const ideoId = parts[0];
    const chapterIndex = parts[1] ? parseInt(parts[1], 10) : 0;
    const found = findByIdeoId(ideoId);
    if (!found){
      renderCover();
      renderCatalog(null);
      return;
    }
    renderEntry(found, chapterIndex);
    renderCatalog(found.ideo.id);
  }

  // ---- Загрузка настроек при старте ----
  loadSettings();

  window.addEventListener("hashchange", route);
  route();
})();
