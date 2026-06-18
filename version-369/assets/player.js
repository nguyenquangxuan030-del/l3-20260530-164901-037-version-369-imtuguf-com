(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var wrap = document.querySelector('[data-player]');
        if (!wrap) {
            return;
        }
        var video = wrap.querySelector('video');
        var button = wrap.querySelector('[data-play-button]');
        var status = wrap.querySelector('[data-player-status]');
        if (!video) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var hls = null;
        var initialized = false;

        function setStatus(text) {
            if (status) {
                status.textContent = text || '';
            }
        }

        function initialize() {
            if (initialized || !stream) {
                return;
            }
            initialized = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('');
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('视频加载失败，请稍后再试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                setStatus('视频加载失败，请稍后再试');
            }
        }

        function playVideo() {
            initialize();
            var attempt = video.play();
            if (attempt && typeof attempt.then === 'function') {
                attempt.then(function () {
                    wrap.classList.add('is-playing');
                    setStatus('');
                }).catch(function () {
                    setStatus('点击视频区域继续播放');
                });
            } else {
                wrap.classList.add('is-playing');
            }
        }

        initialize();

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            wrap.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                wrap.classList.remove('is-playing');
            }
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
