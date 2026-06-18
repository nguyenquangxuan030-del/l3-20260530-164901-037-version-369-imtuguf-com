(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function() {
        var toggle = document.querySelector(".mobile-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function() {
                var open = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var active = 0;
        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }
        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                showSlide(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function() {
                showSlide(active + 1);
            }, 5200);
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var filterButton = document.querySelector("[data-filter-button]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-state");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (filterInput && query) {
            filterInput.value = query;
        }
        function filterCards() {
            if (!filterInput || !cards.length) {
                return;
            }
            var value = normalize(filterInput.value);
            var visible = 0;
            cards.forEach(function(card) {
                var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta") + " " + card.textContent);
                var match = !value || haystack.indexOf(value) !== -1;
                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        if (filterInput) {
            filterInput.addEventListener("input", filterCards);
            filterCards();
        }
        if (filterButton) {
            filterButton.addEventListener("click", filterCards);
        }
    });
}());
