(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');
  if (navButton && navLinks) {
    navButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-to]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-to')) || 0);
      });
    });

    showSlide(0);
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function uniqueOptions(scope, selectorName, items) {
    var select = scope.querySelector(selectorName);
    if (!select) {
      return;
    }
    var values = [];
    items.forEach(function (item) {
      var value = item.getAttribute('data-' + selectorName.replace('[data-filter-', '').replace(']', ''));
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort().forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var filterScope = document.querySelector('[data-filter-scope]');
  if (filterForm && filterScope) {
    var items = Array.prototype.slice.call(filterScope.querySelectorAll('.filter-item'));
    var input = filterForm.querySelector('[data-filter-input]');
    var region = filterForm.querySelector('[data-filter-region]');
    var type = filterForm.querySelector('[data-filter-type]');
    var category = filterForm.querySelector('[data-filter-category]');
    var year = filterForm.querySelector('[data-filter-year]');

    uniqueOptions(filterForm, '[data-filter-region]', items);
    uniqueOptions(filterForm, '[data-filter-type]', items);

    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');
    if (preset && input) {
      input.value = preset;
    }

    function matchText(item, query) {
      if (!query) {
        return true;
      }
      var text = [
        item.getAttribute('data-title') || '',
        item.getAttribute('data-region') || '',
        item.getAttribute('data-type') || '',
        item.getAttribute('data-year') || '',
        item.getAttribute('data-genre') || '',
        item.textContent || ''
      ].join(' ').toLowerCase();
      return text.indexOf(query) !== -1;
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var categoryValue = category ? category.value : '';
      var yearValue = year ? year.value : '';

      items.forEach(function (item) {
        var visible = matchText(item, query);
        if (visible && regionValue) {
          visible = item.getAttribute('data-region') === regionValue;
        }
        if (visible && typeValue) {
          visible = item.getAttribute('data-type') === typeValue;
        }
        if (visible && categoryValue) {
          visible = item.getAttribute('data-category') === categoryValue;
        }
        if (visible && yearValue) {
          visible = item.getAttribute('data-year') === yearValue;
        }
        item.classList.toggle('is-hidden', !visible);
      });
    }

    filterForm.addEventListener('input', applyFilter);
    filterForm.addEventListener('change', applyFilter);
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
    applyFilter();
  }

  var scrollPlayer = document.querySelector('[data-scroll-player]');
  if (scrollPlayer) {
    scrollPlayer.addEventListener('click', function (event) {
      event.preventDefault();
      var target = document.querySelector('.player-panel');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
})();
