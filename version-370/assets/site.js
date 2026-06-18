(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var navButton = document.querySelector("[data-nav-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (navButton && mobileMenu) {
      navButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("img[data-fallback]").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-hidden");
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var nextButton = hero.querySelector("[data-hero-next]");
      var prevButton = hero.querySelector("[data-hero-prev]");
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) return;
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
      }

      function restart() {
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5500);
      }

      if (nextButton) {
        nextButton.addEventListener("click", function () {
          show(active + 1);
          restart();
        });
      }

      if (prevButton) {
        prevButton.addEventListener("click", function () {
          show(active - 1);
          restart();
        });
      }

      show(0);
      restart();
    }

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      var scopeSelector = input.getAttribute("data-filter-scope");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) return;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-text]"));
      var counterSelector = input.getAttribute("data-filter-counter");
      var counter = counterSelector ? document.querySelector(counterSelector) : null;

      function applyFilter() {
        var query = text(input.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-search-text"));
          var matched = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle("hidden-by-filter", !matched);
          if (matched) visible += 1;
        });
        if (counter) {
          counter.textContent = visible ? "筛选结果 " + visible : "暂无匹配";
        }
      }

      input.addEventListener("input", applyFilter);
      applyFilter();
    });

    document.querySelectorAll("[data-filter-value]").forEach(function (button) {
      button.addEventListener("click", function () {
        var input = document.querySelector(button.getAttribute("data-target-input"));
        if (!input) return;
        input.value = button.getAttribute("data-filter-value") || "";
        input.dispatchEvent(new Event("input"));
        document.querySelectorAll("[data-filter-value]").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
      });
    });
  });
})();
