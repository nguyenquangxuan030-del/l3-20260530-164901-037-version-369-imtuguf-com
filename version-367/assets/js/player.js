(function () {
  window.initMoviePlayer = function (streamUrl) {
    const player = document.querySelector(".movie-player");
    const Hls = window.Hls;

    if (!player) {
      return;
    }

    const video = player.querySelector("video");
    const overlay = player.querySelector(".player-overlay");
    let hls = null;
    let ready = false;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function start() {
      attach();
      player.classList.add("is-playing");
      video.controls = true;

      const action = video.play();

      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    overlay.addEventListener("click", start);

    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
