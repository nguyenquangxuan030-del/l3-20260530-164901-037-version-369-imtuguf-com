(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHTML(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatHot(value) {
    var num = Number(value || 0);
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "万";
    }
    return String(num);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function initFilterableGrid() {
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
    grids.forEach(function (grid) {
      var scope = grid.closest("[data-filter-scope]") || document;
      var search = scope.querySelector("[data-card-search]");
      var sort = scope.querySelector("[data-card-sort]");
      var type = scope.querySelector("[data-card-type]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-title]"));

      function apply() {
        var q = text(search && search.value);
        var selectedType = text(type && type.value);
        var visible = [];

        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].map(text).join(" ");
          var matchesSearch = !q || haystack.indexOf(q) !== -1;
          var matchesType = !selectedType || text(card.dataset.type) === selectedType;
          var isVisible = matchesSearch && matchesType;
          card.style.display = isVisible ? "" : "none";
          if (isVisible) {
            visible.push(card);
          }
        });

        if (sort) {
          var mode = sort.value;
          visible.sort(function (a, b) {
            if (mode === "year") {
              return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }
            if (mode === "hot") {
              return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
            }
            return text(a.dataset.title).localeCompare(text(b.dataset.title), "zh-CN");
          });
          visible.forEach(function (card) {
            grid.appendChild(card);
          });
        }
      }

      [search, sort, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHTML(tag) + "</span>";
    }).join("");

    return [
      '<article class="movie-card" data-title="' + escapeHTML(movie.title) + '">',
      '  <a href="' + escapeHTML(movie.url) + '" class="card-link" aria-label="' + escapeHTML(movie.title) + '">',
      '    <div class="poster">',
      '      <img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">',
      '      <div class="poster-hover">▶</div>',
      '      <span class="year-badge">' + escapeHTML(movie.year) + "</span>",
      '      <span class="region-badge">' + escapeHTML(movie.region) + "</span>",
      "    </div>",
      '    <div class="card-body">',
      "      <h3>" + escapeHTML(movie.title) + "</h3>",
      "      <p>" + escapeHTML(movie.oneLine) + "</p>",
      '      <div class="tag-row">' + tags + "</div>",
      '      <div class="card-meta">',
      "        <span>" + escapeHTML(movie.type) + "</span>",
      "        <span>" + formatHot(movie.hot) + "热度</span>",
      "      </div>",
      "    </div>",
      "  </a>",
      "</article>"
    ].join("");
  }

  function initSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var input = root.querySelector("[data-search-input]");
    var region = root.querySelector("[data-search-region]");
    var type = root.querySelector("[data-search-type]");
    var sort = root.querySelector("[data-search-sort]");
    var results = root.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function render() {
      var q = text(input && input.value);
      var selectedRegion = text(region && region.value);
      var selectedType = text(type && type.value);
      var mode = sort ? sort.value : "hot";
      var data = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.oneLine,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(" ")
        ].map(text).join(" ");
        var okQuery = !q || haystack.indexOf(q) !== -1;
        var okRegion = !selectedRegion || text(movie.region) === selectedRegion;
        var okType = !selectedType || text(movie.type) === selectedType;
        return okQuery && okRegion && okType;
      });

      data.sort(function (a, b) {
        if (mode === "year") {
          return Number(b.year || 0) - Number(a.year || 0);
        }
        if (mode === "title") {
          return text(a.title).localeCompare(text(b.title), "zh-CN");
        }
        return Number(b.hot || 0) - Number(a.hot || 0);
      });

      var limited = data.slice(0, 120);
      if (!limited.length) {
        results.innerHTML = '<div class="empty-state">没有匹配到内容，可以换一个片名、题材或地区继续搜索。</div>';
        return;
      }
      results.innerHTML = limited.map(createSearchCard).join("");
    }

    [input, region, type, sort].forEach(function (el) {
      if (el) {
        el.addEventListener("input", render);
        el.addEventListener("change", render);
      }
    });
    render();
  }

  ready(function () {
    initMenu();
    initHeroSlider();
    initFilterableGrid();
    initSearchPage();
  });
})();
