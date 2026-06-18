(function () {
    const header = document.querySelector('[data-header]');
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (header) {
        const updateHeader = () => {
            header.classList.toggle('is-scrolled', window.scrollY > 16);
        };
        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });
    }

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('.site-search-form').forEach((form) => {
        form.addEventListener('submit', (event) => {
            const input = form.querySelector('input[name="q"]');
            if (!input || input.value.trim()) {
                return;
            }
            event.preventDefault();
            input && input.focus();
        });
    });

    initHero();
    initFiltering();
    initSearchPage();
    initPlayers();
    initPlayerScroll();

    function initHero() {
        const hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const thumbs = Array.from(hero.querySelectorAll('[data-hero-thumb]'));
        let current = 0;
        let timer = null;

        const show = (next) => {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach((slide, index) => slide.classList.toggle('is-active', index === current));
            dots.forEach((dot, index) => dot.classList.toggle('is-active', index === current));
            thumbs.forEach((thumb, index) => thumb.classList.toggle('is-active', index === current));
        };

        const play = () => {
            stop();
            timer = window.setInterval(() => show(current + 1), 5200);
        };

        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                show(index);
                play();
            });
        });

        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('mouseenter', () => {
                show(index);
                stop();
            });
            thumb.addEventListener('mouseleave', play);
        });

        show(0);
        play();
    }

    function initFiltering() {
        document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
            const section = panel.closest('section') || document;
            const grid = section.querySelector('[data-filter-grid]');
            if (!grid) {
                return;
            }

            const keywordInput = panel.querySelector('[data-filter-keyword]');
            const typeSelect = panel.querySelector('[data-filter-type]');
            const yearSelect = panel.querySelector('[data-filter-year]');
            const regionSelect = panel.querySelector('[data-filter-region]');
            const resetButton = panel.querySelector('[data-filter-reset]');
            const resultCount = section.querySelector('[data-result-count]');
            const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));

            const apply = () => {
                const keyword = normalize(keywordInput ? keywordInput.value : '');
                const type = typeSelect ? typeSelect.value : '';
                const year = yearSelect ? yearSelect.value : '';
                const region = regionSelect ? regionSelect.value : '';
                let visible = 0;

                cards.forEach((card) => {
                    const text = normalize(card.dataset.search || '');
                    const matchesKeyword = !keyword || text.includes(keyword);
                    const matchesType = !type || card.dataset.type === type;
                    const matchesYear = !year || card.dataset.year === year;
                    const matchesRegion = !region || card.dataset.region === region;
                    const shouldShow = matchesKeyword && matchesType && matchesYear && matchesRegion;
                    card.classList.toggle('is-hidden', !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (resultCount) {
                    resultCount.textContent = `共 ${visible} 部影片`;
                }
            };

            [keywordInput, typeSelect, yearSelect, regionSelect].forEach((control) => {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    if (keywordInput) keywordInput.value = '';
                    if (typeSelect) typeSelect.value = '';
                    if (yearSelect) yearSelect.value = '';
                    if (regionSelect) regionSelect.value = '';
                    apply();
                });
            }

            apply();
        });
    }

    function initSearchPage() {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';
        const pageInput = document.querySelector('[data-search-page-input]');
        const searchGrid = document.querySelector('[data-search-page-grid]');
        const filterKeyword = document.querySelector('[data-filter-keyword]');

        if (pageInput) {
            pageInput.value = query;
        }

        if (searchGrid && filterKeyword && query) {
            filterKeyword.value = query;
            filterKeyword.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function initPlayers() {
        document.querySelectorAll('[data-video-player]').forEach((player) => {
            const video = player.querySelector('video');
            const button = player.querySelector('[data-player-start]');
            const message = player.querySelector('[data-player-message]');
            const source = player.dataset.videoUrl;
            let hlsInstance = null;
            let initialized = false;

            if (!video || !source) {
                if (message) {
                    message.textContent = '播放源暂不可用。';
                }
                return;
            }

            const setMessage = (text) => {
                if (message) {
                    message.textContent = text || '';
                }
            };

            const setupSource = () => {
                if (initialized) {
                    return;
                }
                initialized = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            setMessage('当前网络无法加载 HLS 播放源，请刷新页面或稍后再试。');
                            try {
                                hlsInstance.destroy();
                            } catch (error) {
                                console.warn(error);
                            }
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                    setMessage('浏览器不支持 HLS.js 时将尝试直接播放。');
                }
            };

            const play = () => {
                setupSource();
                player.classList.add('is-playing');
                const request = video.play();
                if (request && typeof request.catch === 'function') {
                    request.catch(() => {
                        player.classList.remove('is-playing');
                        setMessage('浏览器阻止了自动播放，请再次点击播放器。');
                    });
                }
            };

            if (button) {
                button.addEventListener('click', play);
            }

            video.addEventListener('play', () => player.classList.add('is-playing'));
            video.addEventListener('pause', () => {
                if (!video.ended) {
                    player.classList.remove('is-playing');
                }
            });
        });
    }

    function initPlayerScroll() {
        document.querySelectorAll('[data-scroll-to-player]').forEach((link) => {
            link.addEventListener('click', (event) => {
                const player = document.querySelector('[data-video-player]');
                if (!player) {
                    return;
                }
                event.preventDefault();
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }
}());
