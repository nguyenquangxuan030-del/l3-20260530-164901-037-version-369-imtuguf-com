function setupSiteInteractions() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

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

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
        startHero();
      });
    });

    startHero();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterInput && filterList) {
    var filterCards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card]'));

    function applyFilter() {
      var keyword = filterInput.value.trim().toLowerCase();
      var year = filterSelect ? filterSelect.value.trim().toLowerCase() : '';
      var visible = 0;

      filterCards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || text.indexOf(year) !== -1;
        var matched = matchedKeyword && matchedYear;
        card.classList.toggle('is-filter-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      var empty = filterList.querySelector('[data-empty-state]');

      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.setAttribute('data-empty-state', '');
        empty.textContent = '没有匹配的影片';
        filterList.appendChild(empty);
      }

      empty.style.display = visible ? 'none' : 'block';
    }

    filterInput.addEventListener('input', applyFilter);

    if (filterSelect) {
      filterSelect.addEventListener('change', applyFilter);
    }
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');

  if (searchForm && searchInput && searchResults && window.SEARCH_DATA) {
    function cardTemplate(item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '' +
        '<article class="movie-card">' +
        '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>' +
        '<p class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</p>' +
        '<p class="card-text">' + escapeHtml(item.line) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[char];
      });
    }

    function runSearch() {
      var params = new URLSearchParams(window.location.search);
      var query = (searchInput.value || params.get('q') || '').trim().toLowerCase();
      searchInput.value = query;

      var results = window.SEARCH_DATA.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(' '), item.line].join(' ').toLowerCase();
        return !query || text.indexOf(query) !== -1;
      }).slice(0, 80);

      if (!results.length) {
        searchResults.innerHTML = '<div class="empty-state">没有匹配的影片</div>';
        return;
      }

      searchResults.innerHTML = results.map(cardTemplate).join('');
    }

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', url);
      runSearch();
    });

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupSiteInteractions);
} else {
  setupSiteInteractions();
}

function initMoviePlayer(streamUrl) {
  var video = document.querySelector('.movie-video');
  var cover = document.querySelector('.player-cover');
  var trigger = document.querySelector('.player-trigger');
  var loaded = false;
  var hlsInstance = null;

  if (!video || !cover || !trigger || !streamUrl) {
    return;
  }

  function loadStream() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayback() {
    loadStream();
    cover.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  trigger.addEventListener('click', startPlayback);
  cover.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (!loaded) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
