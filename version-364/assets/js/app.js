(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function showHero(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    window.setInterval(function () {
      showHero(index + 1);
    }, 5200);
  }

  function applyCards(root, term) {
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
    var needle = String(term || "").trim().toLowerCase();

    cards.forEach(function (card) {
      var haystack = card.getAttribute("data-search") || "";
      var visible = !needle || haystack.indexOf(needle) !== -1;
      card.classList.toggle("is-hidden", !visible);
    });
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var localForms = Array.prototype.slice.call(document.querySelectorAll("[data-local-search]"));

  localForms.forEach(function (form) {
    var input = form.querySelector("input[type='search']");
    var grid = document.querySelector("[data-card-grid]");

    if (input && query) {
      input.value = query;
    }

    if (grid && query) {
      applyCards(grid, query);
    }

    form.addEventListener("submit", function (event) {
      if (!grid) {
        return;
      }

      event.preventDefault();
      applyCards(grid, input ? input.value : "");
    });
  });

  var filterBars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));

  filterBars.forEach(function (bar) {
    var buttons = Array.prototype.slice.call(bar.querySelectorAll("[data-filter]"));
    var grid = bar.parentElement.querySelector("[data-card-grid]") || document.querySelector("[data-card-grid]");

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });

        if (!grid) {
          return;
        }

        applyCards(grid, filter === "all" ? "" : filter);
      });
    });
  });
})();
