(function () {
  function startPlayer() {
    var video = document.querySelector("[data-player-video]");
    if (!video) return;
    var sourceNode = video.querySelector("source");
    var source = sourceNode ? sourceNode.getAttribute("src") : video.getAttribute("src");
    var cover = document.querySelector("[data-play-cover]");
    var hlsInstance = null;

    function attach() {
      if (!source) return;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (!video.src) {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (cover) cover.classList.add("hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (cover) cover.classList.add("hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  if (document.readyState !== "loading") {
    startPlayer();
  } else {
    document.addEventListener("DOMContentLoaded", startPlayer);
  }
})();
