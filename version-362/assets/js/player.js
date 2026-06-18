function initVideoPlayer(videoId, buttonId, m3u8Url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !m3u8Url) {
        return;
    }
    var started = false;
    function start() {
        if (started) {
            video.play();
            return;
        }
        started = true;
        button.classList.add("is-hidden");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = m3u8Url;
            video.play();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(m3u8Url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                video.play();
            });
            return;
        }
        video.src = m3u8Url;
        video.play();
    }
    button.addEventListener("click", start);
    video.addEventListener("click", function() {
        if (!started) {
            start();
        }
    });
}
