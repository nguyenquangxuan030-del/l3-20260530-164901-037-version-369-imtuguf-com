(function () {
  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMobileMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;
    let timer = null;

    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function next() {
      if (slides.length <= 1) {
        return;
      }
      activate((current + 1) % slides.length);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        window.clearInterval(timer);
        timer = window.setInterval(next, 5200);
      });
    });

    timer = window.setInterval(next, 5200);
  }

  function initFilters() {
    const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function (scope) {
      const input = scope.querySelector("[data-filter-input]");
      const region = scope.querySelector("[data-filter-region]");
      const type = scope.querySelector("[data-filter-type]");
      const genre = scope.querySelector("[data-filter-genre]");
      const category = scope.querySelector("[data-filter-category]");
      const sort = scope.querySelector("[data-sort-select]");
      const reset = scope.querySelector("[data-filter-reset]");
      const count = scope.querySelector("[data-result-count]");
      const container = scope.querySelector("[data-card-container]");

      if (!container) {
        return;
      }

      const cards = Array.from(container.querySelectorAll("[data-movie-card]"));

      function matches(card) {
        const query = normalize(input && input.value);
        const search = normalize(card.dataset.search);
        const cardRegion = normalize(card.dataset.region);
        const cardType = normalize(card.dataset.type);
        const cardGenre = normalize(card.dataset.genre);
        const cardCategoryLink = card.querySelector(".movie-card-foot a");
        const cardCategory = normalize(cardCategoryLink && cardCategoryLink.textContent);
        const selectedRegion = normalize(region && region.value);
        const selectedType = normalize(type && type.value);
        const selectedGenre = normalize(genre && genre.value);
        const selectedCategory = normalize(category && category.value);

        if (query && !search.includes(query)) {
          return false;
        }
        if (selectedRegion && cardRegion !== selectedRegion) {
          return false;
        }
        if (selectedType && cardType !== selectedType) {
          return false;
        }
        if (selectedGenre && !cardGenre.includes(selectedGenre)) {
          return false;
        }
        if (selectedCategory && cardCategory !== selectedCategory) {
          return false;
        }
        return true;
      }

      function sortCards() {
        const value = sort ? sort.value : "default";
        const sorted = cards.slice();

        if (value === "views") {
          sorted.sort(function (a, b) {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          });
        }

        if (value === "year") {
          sorted.sort(function (a, b) {
            return normalize(b.dataset.year).localeCompare(normalize(a.dataset.year), "zh-Hans-CN");
          });
        }

        if (value === "title") {
          sorted.sort(function (a, b) {
            return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), "zh-Hans-CN");
          });
        }

        sorted.forEach(function (card) {
          container.appendChild(card);
        });
      }

      function update() {
        let visible = 0;

        sortCards();
        cards.forEach(function (card) {
          const show = matches(card);
          card.classList.toggle("hidden-card", !show);
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "当前显示 " + visible + " / " + cards.length + " 部影片";
        }
      }

      [input, region, type, genre, category, sort].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          [input, region, type, genre, category, sort].forEach(function (control) {
            if (!control) {
              return;
            }
            control.value = "";
          });
          if (sort) {
            sort.value = "default";
          }
          update();
        });
      }

      update();
    });
  }

  function initImages() {
    const images = Array.from(document.querySelectorAll("img"));

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      });
    });
  }

  initMobileMenu();
  initHero();
  initFilters();
  initImages();
})();
