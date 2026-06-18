(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var opened = nav.classList.toggle('open');
            button.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function setupSearchForms() {
        selectAll('.site-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var base = form.getAttribute('data-search-base') || 'search.html';
                var url = query ? base + '?q=' + encodeURIComponent(query) : base;
                window.location.href = url;
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        show(0);
        restart();
    }

    function setupFilters() {
        var grids = selectAll('[data-filter-grid]');
        if (!grids.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var searchInput = document.querySelector('[data-filter-search]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var empty = document.querySelector('[data-empty-result]');

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function apply() {
            var keyword = normalize(searchInput && searchInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var visible = 0;

            grids.forEach(function (grid) {
                selectAll('.movie-card', grid).forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-text')
                    ].join(' '));
                    var ok = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (year && normalize(card.getAttribute('data-year')) !== year) {
                        ok = false;
                    }
                    if (type && normalize(card.getAttribute('data-type')) !== type) {
                        ok = false;
                    }
                    if (region && normalize(card.getAttribute('data-region')) !== region) {
                        ok = false;
                    }
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (item) {
            if (!item) {
                return;
            }
            item.addEventListener('input', apply);
            item.addEventListener('change', apply);
        });

        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
    });
})();
