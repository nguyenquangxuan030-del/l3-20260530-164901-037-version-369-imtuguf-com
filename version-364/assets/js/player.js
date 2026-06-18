(function () {
  function boot(options) {
    var video = document.getElementById(options.video);
    var button = document.getElementById(options.button);
    var cover = document.getElementById(options.cover);
    var hls = null;
    var ready = false;

    if (!video || !button || !cover || !options.stream) {
      return;
    }

    function load() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.stream);
        hls.attachMedia(video);
      } else {
        video.src = options.stream;
      }
    }

    function play() {
      load();
      cover.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    boot: boot
  };
})();
