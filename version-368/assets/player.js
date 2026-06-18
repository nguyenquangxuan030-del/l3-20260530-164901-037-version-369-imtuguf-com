(function () {
  function setStatus(message) {
    var status = document.querySelector('[data-player-status]');

    if (status) {
      status.textContent = message;
    }
  }

  function initPlayer() {
    var video = document.querySelector('[data-hls-player]');
    var primaryButton = document.querySelector('[data-play-button]');
    var secondaryButton = document.querySelector('[data-play-button-secondary]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var initialized = false;

    function hideButtons() {
      if (primaryButton) {
        primaryButton.classList.add('hidden');
      }
    }

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('视频源已加载，请点击播放器控件继续播放');
        });
      }
    }

    function attachSource() {
      if (!source) {
        setStatus('当前影片暂无可用播放源');
        return;
      }

      if (initialized) {
        hideButtons();
        playVideo();
        return;
      }

      initialized = true;
      setStatus('正在加载播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源已就绪');
          playVideo();
        }, { once: true });
        hideButtons();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪');
          hideButtons();
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，请刷新页面或稍后重试');
          }
        });
        return;
      }

      video.src = source;
      hideButtons();
      setStatus('浏览器不支持 HLS 自动初始化，已尝试使用原生播放器加载');
      playVideo();
    }

    if (primaryButton) {
      primaryButton.addEventListener('click', attachSource);
    }

    if (secondaryButton) {
      secondaryButton.addEventListener('click', attachSource);
    }

    video.addEventListener('play', hideButtons);
  }

  document.addEventListener('DOMContentLoaded', initPlayer);
})();
