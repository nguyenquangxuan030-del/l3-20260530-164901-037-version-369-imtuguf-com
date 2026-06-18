(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-layer');
    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute('data-hls') || '';
    var ready = false;
    var hlsInstance = null;

    function beginPlayback() {
      shell.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    function loadStream() {
      if (ready || !stream) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (shell.classList.contains('is-playing')) {
            beginPlayback();
          }
        });
      }
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      loadStream();
      beginPlayback();
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove('is-playing');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  document.querySelectorAll('.js-player').forEach(setupPlayer);
})();
