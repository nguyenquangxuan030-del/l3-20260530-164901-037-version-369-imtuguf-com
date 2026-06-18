(function () {
  function initPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");
    var source = shell.dataset.videoUrl;
    var hlsInstance = null;

    if (!video || !button || !source) {
      return;
    }

    function start() {
      shell.classList.add("is-playing");

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            lowLatencyMode: true,
            enableWorker: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        }
        video.play().catch(function () {});
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.src !== source) {
          video.src = source;
        }
        video.play().catch(function () {});
        return;
      }

      if (video.src !== source) {
        video.src = source;
      }
      video.play().catch(function () {});
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  if (document.readyState !== "loading") {
    document.querySelectorAll("[data-video-url]").forEach(initPlayer);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll("[data-video-url]").forEach(initPlayer);
    });
  }
})();
