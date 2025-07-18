!(function (t, e) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = e(require("video.js")))
    : "function" == typeof define && define.amd
    ? define(["video.js"], e)
    : (t.videojsIma = e(t.videojs));
})(this, function (t) {
  "use strict";
  t = t && t.hasOwnProperty("default") ? t.default : t;
  var e = function (t, e, i) {
    (this.vjsPlayer = t),
      (this.controller = i),
      (this.contentTrackingTimer = null),
      (this.contentComplete = !1),
      (this.updateTimeIntervalHandle = null),
      (this.updateTimeInterval = 1e3),
      (this.seekCheckIntervalHandle = null),
      (this.seekCheckInterval = 1e3),
      (this.resizeCheckIntervalHandle = null),
      (this.resizeCheckInterval = 250),
      (this.seekThreshold = 100),
      (this.contentEndedListeners = []),
      (this.contentSource = ""),
      (this.contentSourceType = ""),
      (this.contentPlayheadTracker = {
        currentTime: 0,
        previousTime: 0,
        seeking: !1,
        duration: 0,
      }),
      (this.vjsPlayerDimensions = {
        width: this.getPlayerWidth(),
        height: this.getPlayerHeight(),
      }),
      (this.vjsControls = this.vjsPlayer.getChild("controlBar")),
      (this.h5Player = null),
      this.vjsPlayer.one("play", this.setUpPlayerIntervals.bind(this)),
      (this.boundContentEndedListener =
        this.localContentEndedListener.bind(this)),
      this.vjsPlayer.on("contentended", this.boundContentEndedListener),
      this.vjsPlayer.on("dispose", this.playerDisposedListener.bind(this)),
      this.vjsPlayer.on("readyforpreroll", this.onReadyForPreroll.bind(this)),
      this.vjsPlayer.on("adtimeout", this.onAdTimeout.bind(this)),
      this.vjsPlayer.ready(this.onPlayerReady.bind(this)),
      "onPlay" === this.controller.getSettings().requestMode &&
        this.vjsPlayer.one(
          "play",
          this.controller.requestAds.bind(this.controller)
        ),
      this.vjsPlayer.ads(e);
  };
  (e.prototype.setUpPlayerIntervals = function () {
    (this.updateTimeIntervalHandle = setInterval(
      this.updateCurrentTime.bind(this),
      this.updateTimeInterval
    )),
      (this.seekCheckIntervalHandle = setInterval(
        this.checkForSeeking.bind(this),
        this.seekCheckInterval
      )),
      (this.resizeCheckIntervalHandle = setInterval(
        this.checkForResize.bind(this),
        this.resizeCheckInterval
      ));
  }),
    (e.prototype.updateCurrentTime = function () {
      this.contentPlayheadTracker.seeking ||
        (this.contentPlayheadTracker.currentTime =
          this.vjsPlayer.currentTime());
    }),
    (e.prototype.checkForSeeking = function () {
      var t =
        1e3 *
        (this.vjsPlayer.currentTime() -
          this.contentPlayheadTracker.previousTime);
      Math.abs(t) > this.seekCheckInterval + this.seekThreshold
        ? (this.contentPlayheadTracker.seeking = !0)
        : (this.contentPlayheadTracker.seeking = !1),
        (this.contentPlayheadTracker.previousTime =
          this.vjsPlayer.currentTime());
    }),
    (e.prototype.checkForResize = function () {
      var t = this.getPlayerWidth(),
        e = this.getPlayerHeight();
      (t == this.vjsPlayerDimensions.width &&
        e == this.vjsPlayerDimensions.height) ||
        ((this.vjsPlayerDimensions.width = t),
        (this.vjsPlayerDimensions.height = e),
        this.controller.onPlayerResize(t, e));
    }),
    (e.prototype.localContentEndedListener = function () {
      for (var t in (this.contentComplete ||
        ((this.contentComplete = !0), this.controller.onContentComplete()),
      this.contentEndedListeners))
        "function" == typeof this.contentEndedListeners[t] &&
          this.contentEndedListeners[t]();
      clearInterval(this.updateTimeIntervalHandle),
        clearInterval(this.seekCheckIntervalHandle),
        clearInterval(this.resizeCheckIntervalHandle),
        this.vjsPlayer.el() &&
          this.vjsPlayer.one("play", this.setUpPlayerIntervals.bind(this));
    }),
    (e.prototype.onNoPostroll = function () {
      this.vjsPlayer.trigger("nopostroll");
    }),
    (e.prototype.playerDisposedListener = function () {
      (this.contentEndedListeners = []),
        this.controller.onPlayerDisposed(),
        (this.contentComplete = !0),
        this.vjsPlayer.off("contentended", this.boundContentEndedListener),
        this.vjsPlayer.ads.adTimeoutTimeout &&
          clearTimeout(this.vjsPlayer.ads.adTimeoutTimeout);
      var t = [
        this.updateTimeIntervalHandle,
        this.seekCheckIntervalHandle,
        this.resizeCheckIntervalHandle,
      ];
      for (var e in t) t[e] && clearInterval(t[e]);
    }),
    (e.prototype.onReadyForPreroll = function () {
      this.controller.onPlayerReadyForPreroll();
    }),
    (e.prototype.onAdTimeout = function () {
      this.controller.onAdTimeout();
    }),
    (e.prototype.onPlayerReady = function () {
      (this.h5Player = document
        .getElementById(this.getPlayerId())
        .getElementsByClassName("vjs-tech")[0]),
        this.h5Player.hasAttribute("autoplay") &&
          this.controller.setSetting("adWillAutoPlay", !0),
        this.onVolumeChange(),
        this.vjsPlayer.on(
          "fullscreenchange",
          this.onFullscreenChange.bind(this)
        ),
        this.vjsPlayer.on("volumechange", this.onVolumeChange.bind(this)),
        this.controller.onPlayerReady();
    }),
    (e.prototype.onFullscreenChange = function () {
      this.vjsPlayer.isFullscreen()
        ? this.controller.onPlayerEnterFullscreen()
        : this.controller.onPlayerExitFullscreen();
    }),
    (e.prototype.onVolumeChange = function () {
      var t = this.vjsPlayer.muted() ? 0 : this.vjsPlayer.volume();
      this.controller.onPlayerVolumeChanged(t);
    }),
    (e.prototype.injectAdContainerDiv = function (t) {
      this.vjsControls.el().parentNode.appendChild(t);
    }),
    (e.prototype.getContentPlayer = function () {
      return this.h5Player;
    }),
    (e.prototype.getVolume = function () {
      return this.vjsPlayer.muted() ? 0 : this.vjsPlayer.volume();
    }),
    (e.prototype.setVolume = function (t) {
      this.vjsPlayer.volume(t),
        0 == t ? this.vjsPlayer.muted(!0) : this.vjsPlayer.muted(!1);
    }),
    (e.prototype.unmute = function () {
      this.vjsPlayer.muted(!1);
    }),
    (e.prototype.mute = function () {
      this.vjsPlayer.muted(!0);
    }),
    (e.prototype.play = function () {
      this.vjsPlayer.play();
    }),
    (e.prototype.togglePlayback = function () {
      this.vjsPlayer.paused() ? this.vjsPlayer.play() : this.vjsPlayer.pause();
    }),
    (e.prototype.getPlayerWidth = function () {
      var t = (getComputedStyle(this.vjsPlayer.el()) || {}).width;
      return (
        (t && 0 !== parseFloat(t)) ||
          (t = (this.vjsPlayer.el().getBoundingClientRect() || {}).width),
        parseFloat(t) || this.vjsPlayer.width()
      );
    }),
    (e.prototype.getPlayerHeight = function () {
      var t = (getComputedStyle(this.vjsPlayer.el()) || {}).height;
      return (
        (t && 0 !== parseFloat(t)) ||
          (t = (this.vjsPlayer.el().getBoundingClientRect() || {}).height),
        parseFloat(t) || this.vjsPlayer.height()
      );
    }),
    (e.prototype.getPlayerOptions = function () {
      return this.vjsPlayer.options_;
    }),
    (e.prototype.getPlayerId = function () {
      return this.vjsPlayer.id();
    }),
    (e.prototype.toggleFullscreen = function () {
      this.vjsPlayer.isFullscreen()
        ? this.vjsPlayer.exitFullscreen()
        : this.vjsPlayer.requestFullscreen();
    }),
    (e.prototype.getContentPlayheadTracker = function () {
      return this.contentPlayheadTracker;
    }),
    (e.prototype.onAdError = function (t) {
      this.vjsControls.show();
      var e = void 0 !== t.getError ? t.getError() : t.stack;
      this.vjsPlayer.trigger({
        type: "adserror",
        data: { AdError: e, AdErrorEvent: t },
      });
    }),
    (e.prototype.onAdLog = function (t) {
      var e = t.getAdData(),
        i = void 0 !== e.adError ? e.adError.getMessage() : void 0;
      this.vjsPlayer.trigger({
        type: "adslog",
        data: { AdError: i, AdEvent: t },
      });
    }),
    (e.prototype.onAdBreakStart = function () {
      (this.contentSource = this.vjsPlayer.currentSrc()),
        (this.contentSourceType = this.vjsPlayer.currentType()),
        this.vjsPlayer.off("contentended", this.boundContentEndedListener),
        this.vjsPlayer.ads.startLinearAdMode(),
        this.vjsControls.hide(),
        this.vjsPlayer.pause();
    }),
    (e.prototype.onAdBreakEnd = function () {
      this.vjsPlayer.on("contentended", this.boundContentEndedListener),
        this.vjsPlayer.ads.inAdBreak() && this.vjsPlayer.ads.endLinearAdMode(),
        this.vjsControls.show();
    }),
    (e.prototype.onAdStart = function () {
      this.vjsPlayer.trigger("ads-ad-started");
    }),
    (e.prototype.onAllAdsCompleted = function () {
      1 == this.contentComplete &&
        (this.contentSource &&
          this.vjsPlayer.currentSrc() != this.contentSource &&
          this.vjsPlayer.src({
            src: this.contentSource,
            type: this.contentSourceType,
          }),
        this.controller.onContentAndAdsCompleted());
    }),
    (e.prototype.onAdsReady = function () {
      this.vjsPlayer.trigger("adsready");
    }),
    (e.prototype.changeSource = function (t) {
      this.vjsPlayer.currentSrc() &&
        (this.vjsPlayer.currentTime(0), this.vjsPlayer.pause()),
        t && this.vjsPlayer.src(t),
        this.vjsPlayer.one("loadedmetadata", this.seekContentToZero.bind(this));
    }),
    (e.prototype.seekContentToZero = function () {
      this.vjsPlayer.currentTime(0);
    }),
    (e.prototype.triggerPlayerEvent = function (t, e) {
      this.vjsPlayer.trigger(t, e);
    }),
    (e.prototype.addContentEndedListener = function (t) {
      this.contentEndedListeners.push(t);
    }),
    (e.prototype.reset = function () {
      this.vjsPlayer.off("contentended", this.boundContentEndedListener),
        this.vjsPlayer.on("contentended", this.boundContentEndedListener),
        this.vjsControls.show(),
        this.vjsPlayer.ads.inAdBreak() && this.vjsPlayer.ads.endLinearAdMode(),
        (this.contentPlayheadTracker.currentTime = 0),
        (this.contentComplete = !1);
    });
  var i = function (t) {
    (this.controller = t),
      (this.adContainerDiv = document.createElement("div")),
      (this.controlsDiv = document.createElement("div")),
      (this.countdownDiv = document.createElement("div")),
      (this.seekBarDiv = document.createElement("div")),
      (this.progressDiv = document.createElement("div")),
      (this.playPauseDiv = document.createElement("div")),
      (this.muteDiv = document.createElement("div")),
      (this.sliderDiv = document.createElement("div")),
      (this.sliderLevelDiv = document.createElement("div")),
      (this.fullscreenDiv = document.createElement("div")),
      (this.boundOnMouseUp = this.onMouseUp.bind(this)),
      (this.boundOnMouseMove = this.onMouseMove.bind(this)),
      (this.adPlayheadTracker = {
        currentTime: 0,
        duration: 0,
        isPod: !1,
        adPosition: 0,
        totalAds: 0,
      }),
      (this.controlPrefix = this.controller.getPlayerId() + "_"),
      (this.showCountdown = !0),
      !1 === this.controller.getSettings().showCountdown &&
        (this.showCountdown = !1),
      (this.isAdNonlinear = !1),
      this.createAdContainer();
  };
  (i.prototype.createAdContainer = function () {
    this.assignControlAttributes(this.adContainerDiv, "ima-ad-container"),
      (this.adContainerDiv.style.position = "absolute"),
      (this.adContainerDiv.style.zIndex = 1111),
      this.adContainerDiv.addEventListener(
        "mouseenter",
        this.showAdControls.bind(this),
        !1
      ),
      this.adContainerDiv.addEventListener(
        "mouseleave",
        this.hideAdControls.bind(this),
        !1
      ),
      this.adContainerDiv.addEventListener(
        "click",
        this.onAdContainerClick.bind(this),
        !1
      ),
      this.createControls(),
      this.controller.injectAdContainerDiv(this.adContainerDiv);
  }),
    (i.prototype.createControls = function () {
      this.assignControlAttributes(this.controlsDiv, "ima-controls-div"),
        (this.controlsDiv.style.width = "100%"),
        this.controller.getIsMobile()
          ? (this.countdownDiv.style.display = "none")
          : (this.assignControlAttributes(
              this.countdownDiv,
              "ima-countdown-div"
            ),
            (this.countdownDiv.innerHTML =
              this.controller.getSettings().adLabel),
            (this.countdownDiv.style.display = this.showCountdown
              ? "block"
              : "none")),
        this.assignControlAttributes(this.seekBarDiv, "ima-seek-bar-div"),
        (this.seekBarDiv.style.width = "100%"),
        this.assignControlAttributes(this.progressDiv, "ima-progress-div"),
        this.assignControlAttributes(this.playPauseDiv, "ima-play-pause-div"),
        this.addClass(this.playPauseDiv, "ima-playing"),
        this.playPauseDiv.addEventListener(
          "click",
          this.onAdPlayPauseClick.bind(this),
          !1
        ),
        this.assignControlAttributes(this.muteDiv, "ima-mute-div"),
        this.addClass(this.muteDiv, "ima-non-muted"),
        this.muteDiv.addEventListener(
          "click",
          this.onAdMuteClick.bind(this),
          !1
        ),
        this.assignControlAttributes(this.sliderDiv, "ima-slider-div"),
        this.sliderDiv.addEventListener(
          "mousedown",
          this.onAdVolumeSliderMouseDown.bind(this),
          !1
        ),
        this.controller.getIsIos() && (this.sliderDiv.style.display = "none"),
        this.assignControlAttributes(
          this.sliderLevelDiv,
          "ima-slider-level-div"
        ),
        this.assignControlAttributes(this.fullscreenDiv, "ima-fullscreen-div"),
        this.addClass(this.fullscreenDiv, "ima-non-fullscreen"),
        this.fullscreenDiv.addEventListener(
          "click",
          this.onAdFullscreenClick.bind(this),
          !1
        ),
        this.adContainerDiv.appendChild(this.controlsDiv),
        this.controlsDiv.appendChild(this.countdownDiv),
        this.controlsDiv.appendChild(this.seekBarDiv),
        this.controlsDiv.appendChild(this.playPauseDiv),
        this.controlsDiv.appendChild(this.muteDiv),
        this.controlsDiv.appendChild(this.sliderDiv),
        this.controlsDiv.appendChild(this.fullscreenDiv),
        this.seekBarDiv.appendChild(this.progressDiv),
        this.sliderDiv.appendChild(this.sliderLevelDiv);
    }),
    (i.prototype.onAdPlayPauseClick = function () {
      this.controller.onAdPlayPauseClick();
    }),
    (i.prototype.onAdMuteClick = function () {
      this.controller.onAdMuteClick();
    }),
    (i.prototype.onAdFullscreenClick = function () {
      this.controller.toggleFullscreen();
    }),
    (i.prototype.onAdsPaused = function () {
      (this.controller.sdkImpl.adPlaying = !1),
        this.addClass(this.playPauseDiv, "ima-paused"),
        this.removeClass(this.playPauseDiv, "ima-playing"),
        this.showAdControls();
    }),
    (i.prototype.onAdsResumed = function () {
      this.onAdsPlaying(), this.showAdControls();
    }),
    (i.prototype.onAdsPlaying = function () {
      (this.controller.sdkImpl.adPlaying = !0),
        this.addClass(this.playPauseDiv, "ima-playing"),
        this.removeClass(this.playPauseDiv, "ima-paused");
    }),
    (i.prototype.updateAdUi = function (t, e, i, n, s) {
      var o = Math.floor(e / 60),
        r = Math.floor(e % 60);
      r.toString().length < 2 && (r = "0" + r);
      var a = ": ";
      s > 1 &&
        (a =
          " (" +
          n +
          " " +
          this.controller.getSettings().adLabelNofN +
          " " +
          s +
          "): "),
        (this.countdownDiv.innerHTML =
          this.controller.getSettings().adLabel + a + o + ":" + r);
      var d = 100 * (t / i);
      this.progressDiv.style.width = d + "%";
    }),
    (i.prototype.unmute = function () {
      this.addClass(this.muteDiv, "ima-non-muted"),
        this.removeClass(this.muteDiv, "ima-muted"),
        (this.sliderLevelDiv.style.width =
          100 * this.controller.getPlayerVolume() + "%");
    }),
    (i.prototype.mute = function () {
      this.addClass(this.muteDiv, "ima-muted"),
        this.removeClass(this.muteDiv, "ima-non-muted"),
        (this.sliderLevelDiv.style.width = "0%");
    }),
    (i.prototype.onAdVolumeSliderMouseDown = function () {
      document.addEventListener("mouseup", this.boundOnMouseUp, !1),
        document.addEventListener("mousemove", this.boundOnMouseMove, !1);
    }),
    (i.prototype.onMouseMove = function (t) {
      this.changeVolume(t);
    }),
    (i.prototype.onMouseUp = function (t) {
      this.changeVolume(t),
        document.removeEventListener("mouseup", this.boundOnMouseUp),
        document.removeEventListener("mousemove", this.boundOnMouseMove);
    }),
    (i.prototype.changeVolume = function (t) {
      var e =
        (t.clientX - this.sliderDiv.getBoundingClientRect().left) /
        this.sliderDiv.offsetWidth;
      (e *= 100),
        (e = Math.min(Math.max(e, 0), 100)),
        (this.sliderLevelDiv.style.width = e + "%"),
        0 == this.percent
          ? (this.addClass(this.muteDiv, "ima-muted"),
            this.removeClass(this.muteDiv, "ima-non-muted"))
          : (this.addClass(this.muteDiv, "ima-non-muted"),
            this.removeClass(this.muteDiv, "ima-muted")),
        this.controller.setVolume(e / 100);
    }),
    (i.prototype.showAdContainer = function () {
      this.adContainerDiv.style.display = "block";
    }),
    (i.prototype.hideAdContainer = function () {
      this.adContainerDiv.style.display = "none";
    }),
    (i.prototype.onAdContainerClick = function () {
      this.isAdNonlinear && this.controller.togglePlayback();
    }),
    (i.prototype.reset = function () {
      this.hideAdContainer();
    }),
    (i.prototype.onAdError = function () {
      this.hideAdContainer();
    }),
    (i.prototype.onAdBreakStart = function (t) {
      this.showAdContainer(),
        "application/javascript" !== t.getAd().getContentType() ||
        this.controller.getSettings().showControlsForJSAds
          ? (this.controlsDiv.style.display = "block")
          : (this.controlsDiv.style.display = "none"),
        this.onAdsPlaying(),
        this.hideAdControls();
    }),
    (i.prototype.onAdBreakEnd = function () {
      var t = this.controller.getCurrentAd();
      (null == t || t.isLinear()) && this.hideAdContainer(),
        (this.controlsDiv.style.display = "none"),
        (this.countdownDiv.innerHTML = "");
    }),
    (i.prototype.onAllAdsCompleted = function () {
      this.hideAdContainer();
    }),
    (i.prototype.onLinearAdStart = function () {
      this.removeClass(this.adContainerDiv, "bumpable-ima-ad-container"),
        (this.isAdNonlinear = !1);
    }),
    (i.prototype.onNonLinearAdLoad = function () {
      (this.adContainerDiv.style.display = "block"),
        this.addClass(this.adContainerDiv, "bumpable-ima-ad-container"),
        (this.isAdNonlinear = !0);
    }),
    (i.prototype.onPlayerEnterFullscreen = function () {
      this.addClass(this.fullscreenDiv, "ima-fullscreen"),
        this.removeClass(this.fullscreenDiv, "ima-non-fullscreen");
    }),
    (i.prototype.onPlayerExitFullscreen = function () {
      this.addClass(this.fullscreenDiv, "ima-non-fullscreen"),
        this.removeClass(this.fullscreenDiv, "ima-fullscreen");
    }),
    (i.prototype.onPlayerVolumeChanged = function (t) {
      0 == t
        ? (this.addClass(this.muteDiv, "ima-muted"),
          this.removeClass(this.muteDiv, "ima-non-muted"),
          (this.sliderLevelDiv.style.width = "0%"))
        : (this.addClass(this.muteDiv, "ima-non-muted"),
          this.removeClass(this.muteDiv, "ima-muted"),
          (this.sliderLevelDiv.style.width = 100 * t + "%"));
    }),
    (i.prototype.showAdControls = function () {
      this.controller.getSettings().disableAdControls ||
        this.addClass(this.controlsDiv, "ima-controls-div-showing");
    }),
    (i.prototype.hideAdControls = function () {
      this.removeClass(this.controlsDiv, "ima-controls-div-showing");
    }),
    (i.prototype.assignControlAttributes = function (t, e) {
      (t.id = this.controlPrefix + e),
        (t.className = this.controlPrefix + e + " " + e);
    }),
    (i.prototype.getClassRegexp = function (t) {
      return new RegExp("(^|[^A-Za-z-])" + t + "((?![A-Za-z-])|$)", "gi");
    }),
    (i.prototype.elementHasClass = function (t, e) {
      return this.getClassRegexp(e).test(t.className);
    }),
    (i.prototype.addClass = function (t, e) {
      t.className = t.className.trim() + " " + e;
    }),
    (i.prototype.removeClass = function (t, e) {
      var i = this.getClassRegexp(e);
      t.className = t.className.trim().replace(i, "");
    }),
    (i.prototype.getAdContainerDiv = function () {
      return this.adContainerDiv;
    }),
    (i.prototype.setShowCountdown = function (t) {
      (this.showCountdown = t),
        (this.countdownDiv.style.display = this.showCountdown
          ? "block"
          : "none");
    });
  var n = "1.10.1",
    s =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (t) {
            return typeof t;
          }
        : function (t) {
            return t &&
              "function" == typeof Symbol &&
              t.constructor === Symbol &&
              t !== Symbol.prototype
              ? "symbol"
              : typeof t;
          },
    o = function (t) {
      (this.controller = t),
        (this.adDisplayContainer = null),
        (this.adDisplayContainerInitialized = !1),
        (this.adsLoader = null),
        (this.adsManager = null),
        (this.adsRenderingSettings = null),
        (this.adsResponse = null),
        (this.currentAd = null),
        (this.adTrackingTimer = null),
        (this.allAdsCompleted = !1),
        (this.adsActive = !1),
        (this.adPlaying = !1),
        (this.adMuted = !1),
        (this.adBreakReadyListener = void 0),
        (this.contentCompleteCalled = !1),
        (this.isAdTimedOut = !1),
        (this.adsManagerDimensions = { width: 0, height: 0 }),
        (this.autoPlayAdBreaks = !0),
        !1 === this.controller.getSettings().autoPlayAdBreaks &&
          (this.autoPlayAdBreaks = !1),
        this.controller.getSettings().locale &&
          google.ima.settings.setLocale(this.controller.getSettings().locale),
        this.controller.getSettings().disableFlashAds &&
          google.ima.settings.setDisableFlashAds(
            this.controller.getSettings().disableFlashAds
          ),
        this.controller.getSettings().disableCustomPlaybackForIOS10Plus &&
          google.ima.settings.setDisableCustomPlaybackForIOS10Plus(
            this.controller.getSettings().disableCustomPlaybackForIOS10Plus
          ),
        this.controller.getSettings().ppid &&
          google.ima.settings.setPpid(this.controller.getSettings().ppid);
    };
  (o.prototype.initAdObjects = function () {
    (this.adDisplayContainer = new google.ima.AdDisplayContainer(
      this.controller.getAdContainerDiv(),
      this.controller.getContentPlayer()
    )),
      (this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer)),
      this.adsLoader
        .getSettings()
        .setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED),
      0 == this.controller.getSettings().vpaidAllowed &&
        this.adsLoader
          .getSettings()
          .setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.DISABLED),
      void 0 !== this.controller.getSettings().vpaidMode &&
        this.adsLoader
          .getSettings()
          .setVpaidMode(this.controller.getSettings().vpaidMode),
      this.controller.getSettings().locale &&
        this.adsLoader
          .getSettings()
          .setLocale(this.controller.getSettings().locale),
      this.controller.getSettings().numRedirects &&
        this.adsLoader
          .getSettings()
          .setNumRedirects(this.controller.getSettings().numRedirects),
      this.controller.getSettings().sessionId &&
        this.adsLoader
          .getSettings()
          .setSessionId(this.controller.getSettings().sessionId),
      this.adsLoader.getSettings().setPlayerType("videojs-ima"),
      this.adsLoader.getSettings().setPlayerVersion(n),
      this.adsLoader.getSettings().setAutoPlayAdBreaks(this.autoPlayAdBreaks),
      this.adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        this.onAdsManagerLoaded.bind(this),
        !1
      ),
      this.adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        this.onAdsLoaderError.bind(this),
        !1
      ),
      this.controller.playerWrapper.vjsPlayer.trigger({
        type: "ads-loader",
        adsLoader: this.adsLoader,
      });
  }),
    (o.prototype.requestAds = function () {
      var t = new google.ima.AdsRequest();
      this.controller.getSettings().adTagUrl
        ? (t.adTagUrl = this.controller.getSettings().adTagUrl)
        : (t.adsResponse = this.controller.getSettings().adsResponse),
        this.controller.getSettings().forceNonLinearFullSlot &&
          (t.forceNonLinearFullSlot = !0),
        this.controller.getSettings().vastLoadTimeout &&
          (t.vastLoadTimeout = this.controller.getSettings().vastLoadTimeout),
        (t.linearAdSlotWidth = this.controller.getPlayerWidth()),
        (t.linearAdSlotHeight = this.controller.getPlayerHeight()),
        (t.nonLinearAdSlotWidth =
          this.controller.getSettings().nonLinearWidth ||
          this.controller.getPlayerWidth()),
        (t.nonLinearAdSlotHeight =
          this.controller.getSettings().nonLinearHeight ||
          this.controller.getPlayerHeight()),
        t.setAdWillAutoPlay(this.controller.adsWillAutoplay()),
        t.setAdWillPlayMuted(this.controller.adsWillPlayMuted());
      var e = this.controller.getSettings().adsRequest;
      e &&
        "object" === (void 0 === e ? "undefined" : s(e)) &&
        Object.keys(e).forEach(function (i) {
          t[i] = e[i];
        }),
        this.adsLoader.requestAds(t),
        this.controller.playerWrapper.vjsPlayer.trigger({
          type: "ads-request",
          AdsRequest: t,
        });
    }),
    (o.prototype.onAdsManagerLoaded = function (t) {
      this.createAdsRenderingSettings(),
        (this.adsManager = t.getAdsManager(
          this.controller.getContentPlayheadTracker(),
          this.adsRenderingSettings
        )),
        this.adsManager.addEventListener(
          google.ima.AdErrorEvent.Type.AD_ERROR,
          this.onAdError.bind(this)
        ),
        this.adsManager.addEventListener(
          google.ima.AdEvent.Type.AD_BREAK_READY,
          this.onAdBreakReady.bind(this)
        ),
        this.adsManager.addEventListener(
          google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
          this.onContentPauseRequested.bind(this)
        ),
        this.adsManager.addEventListener(
          google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
          this.onContentResumeRequested.bind(this)
        ),
        this.adsManager.addEventListener(
          google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
          this.onAllAdsCompleted.bind(this)
        ),
        this.adsManager.addEventListener(
          google.ima.AdEvent.Type.LOADED,
          this.onAdLoaded.bind(this)
        ),
        this.adsManager.addEventListener(
          google.ima.AdEvent.Type.STARTED,
          this.onAdStarted.bind(this)
        ),
        this.adsManager.addEventListener(
          google.ima.AdEvent.Type.COMPLETE,
          this.onAdComplete.bind(this)
        ),
        this.adsManager.addEventListener(
          google.ima.AdEvent.Type.SKIPPED,
          this.onAdComplete.bind(this)
        ),
        this.adsManager.addEventListener(
          google.ima.AdEvent.Type.LOG,
          this.onAdLog.bind(this)
        ),
        this.adsManager.addEventListener(
          google.ima.AdEvent.Type.PAUSED,
          this.onAdPaused.bind(this)
        ),
        this.adsManager.addEventListener(
          google.ima.AdEvent.Type.RESUMED,
          this.onAdResumed.bind(this)
        ),
        this.controller.playerWrapper.vjsPlayer.trigger({
          type: "ads-manager",
          adsManager: this.adsManager,
        }),
        this.autoPlayAdBreaks || this.initAdsManager();
      var e = this.controller.getSettings().preventLateAdStart;
      e
        ? e && !this.isAdTimedOut && this.controller.onAdsReady()
        : this.controller.onAdsReady(),
        this.controller.getSettings().adsManagerLoadedCallback &&
          this.controller.getSettings().adsManagerLoadedCallback();
    }),
    (o.prototype.onAdsLoaderError = function (t) {
      window.console.warn("AdsLoader error: " + t.getError()),
        this.controller.onErrorLoadingAds(t),
        this.adsManager && this.adsManager.destroy();
    }),
    (o.prototype.initAdsManager = function () {
      try {
        var t = this.controller.getPlayerWidth(),
          e = this.controller.getPlayerHeight();
        (this.adsManagerDimensions.width = t),
          (this.adsManagerDimensions.height = e),
          this.adsManager.init(t, e, google.ima.ViewMode.NORMAL),
          this.adsManager.setVolume(this.controller.getPlayerVolume()),
          this.initializeAdDisplayContainer();
      } catch (t) {
        this.onAdError(t);
      }
    }),
    (o.prototype.createAdsRenderingSettings = function () {
      if (
        ((this.adsRenderingSettings = new google.ima.AdsRenderingSettings()),
        (this.adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete =
          !0),
        this.controller.getSettings().adsRenderingSettings)
      )
        for (var t in this.controller.getSettings().adsRenderingSettings)
          "" !== t &&
            (this.adsRenderingSettings[t] =
              this.controller.getSettings().adsRenderingSettings[t]);
    }),
    (o.prototype.onAdError = function (t) {
      var e = void 0 !== t.getError ? t.getError() : t.stack;
      window.console.warn("Ad error: " + e),
        this.adsManager.destroy(),
        this.controller.onAdError(t),
        (this.adsActive = !1),
        (this.adPlaying = !1);
    }),
    (o.prototype.onAdBreakReady = function (t) {
      this.adBreakReadyListener(t);
    }),
    (o.prototype.onContentPauseRequested = function (t) {
      (this.adsActive = !0),
        (this.adPlaying = !0),
        this.controller.onAdBreakStart(t);
    }),
    (o.prototype.onContentResumeRequested = function (t) {
      (this.adsActive = !1),
        (this.adPlaying = !1),
        this.controller.onAdBreakEnd();
    }),
    (o.prototype.onAllAdsCompleted = function (t) {
      (this.allAdsCompleted = !0), this.controller.onAllAdsCompleted();
    }),
    (o.prototype.onAdLoaded = function (t) {
      t.getAd().isLinear() ||
        (this.controller.onNonLinearAdLoad(), this.controller.playContent());
    }),
    (o.prototype.onAdStarted = function (t) {
      (this.currentAd = t.getAd()),
        this.currentAd.isLinear()
          ? ((this.adTrackingTimer = setInterval(
              this.onAdPlayheadTrackerInterval.bind(this),
              250
            )),
            this.controller.onLinearAdStart())
          : this.controller.onNonLinearAdStart();
    }),
    (o.prototype.onAdPaused = function () {
      this.controller.onAdsPaused();
    }),
    (o.prototype.onAdResumed = function (t) {
      this.controller.onAdsResumed();
    }),
    (o.prototype.onAdComplete = function () {
      this.currentAd.isLinear() && clearInterval(this.adTrackingTimer);
    }),
    (o.prototype.onAdLog = function (t) {
      this.controller.onAdLog(t);
    }),
    (o.prototype.onAdPlayheadTrackerInterval = function () {
      if (null !== this.adsManager) {
        var t = this.adsManager.getRemainingTime(),
          e = this.currentAd.getDuration(),
          i = e - t;
        i = i > 0 ? i : 0;
        var n = 0,
          s = void 0;
        this.currentAd.getAdPodInfo() &&
          ((s = this.currentAd.getAdPodInfo().getAdPosition()),
          (n = this.currentAd.getAdPodInfo().getTotalAds())),
          this.controller.onAdPlayheadUpdated(i, t, e, s, n);
      }
    }),
    (o.prototype.onContentComplete = function () {
      this.adsLoader &&
        (this.adsLoader.contentComplete(), (this.contentCompleteCalled = !0)),
        ((this.adsManager &&
          this.adsManager.getCuePoints() &&
          !this.adsManager.getCuePoints().includes(-1)) ||
          !this.adsManager) &&
          this.controller.onNoPostroll(),
        this.allAdsCompleted && this.controller.onContentAndAdsCompleted();
    }),
    (o.prototype.onPlayerDisposed = function () {
      this.adTrackingTimer && clearInterval(this.adTrackingTimer),
        this.adsManager &&
          (this.adsManager.destroy(), (this.adsManager = null));
    }),
    (o.prototype.onPlayerReadyForPreroll = function () {
      if (this.autoPlayAdBreaks) {
        this.initAdsManager();
        try {
          this.controller.showAdContainer(),
            this.adsManager.setVolume(this.controller.getPlayerVolume()),
            this.adsManager.start();
        } catch (t) {
          this.onAdError(t);
        }
      }
    }),
    (o.prototype.onAdTimeout = function () {
      this.isAdTimedOut = !0;
    }),
    (o.prototype.onPlayerReady = function () {
      this.initAdObjects(),
        (this.controller.getSettings().adTagUrl ||
          this.controller.getSettings().adsResponse) &&
          "onLoad" === this.controller.getSettings().requestMode &&
          this.requestAds();
    }),
    (o.prototype.onPlayerEnterFullscreen = function () {
      this.adsManager &&
        this.adsManager.resize(
          window.screen.width,
          window.screen.height,
          google.ima.ViewMode.FULLSCREEN
        );
    }),
    (o.prototype.onPlayerExitFullscreen = function () {
      this.adsManager &&
        this.adsManager.resize(
          this.controller.getPlayerWidth(),
          this.controller.getPlayerHeight(),
          google.ima.ViewMode.NORMAL
        );
    }),
    (o.prototype.onPlayerVolumeChanged = function (t) {
      this.adsManager && this.adsManager.setVolume(t), (this.adMuted = 0 == t);
    }),
    (o.prototype.onPlayerResize = function (t, e) {
      this.adsManager &&
        ((this.adsManagerDimensions.width = t),
        (this.adsManagerDimensions.height = e),
        this.adsManager.resize(t, e, google.ima.ViewMode.NORMAL));
    }),
    (o.prototype.getCurrentAd = function () {
      return this.currentAd;
    }),
    (o.prototype.setAdBreakReadyListener = function (t) {
      this.adBreakReadyListener = t;
    }),
    (o.prototype.isAdPlaying = function () {
      return this.adPlaying;
    }),
    (o.prototype.isAdMuted = function () {
      return this.adMuted;
    }),
    (o.prototype.pauseAds = function () {
      this.adsManager.pause(), (this.adPlaying = !1);
    }),
    (o.prototype.resumeAds = function () {
      this.adsManager.resume(), (this.adPlaying = !0);
    }),
    (o.prototype.unmute = function () {
      this.adsManager.setVolume(1), (this.adMuted = !1);
    }),
    (o.prototype.mute = function () {
      this.adsManager.setVolume(0), (this.adMuted = !0);
    }),
    (o.prototype.setVolume = function (t) {
      this.adsManager.setVolume(t), (this.adMuted = 0 == t);
    }),
    (o.prototype.initializeAdDisplayContainer = function () {
      this.adDisplayContainer &&
        (this.adDisplayContainerInitialized ||
          (this.adDisplayContainer.initialize(),
          (this.adDisplayContainerInitialized = !0)));
    }),
    (o.prototype.playAdBreak = function () {
      this.autoPlayAdBreaks ||
        (this.controller.showAdContainer(),
        this.adsManager.setVolume(this.controller.getPlayerVolume()),
        this.adsManager.start());
    }),
    (o.prototype.addEventListener = function (t, e) {
      this.adsManager && this.adsManager.addEventListener(t, e);
    }),
    (o.prototype.getAdsManager = function () {
      return this.adsManager;
    }),
    (o.prototype.reset = function () {
      (this.adsActive = !1),
        (this.adPlaying = !1),
        this.adTrackingTimer && clearInterval(this.adTrackingTimer),
        this.adsManager &&
          (this.adsManager.destroy(), (this.adsManager = null)),
        this.adsLoader &&
          !this.contentCompleteCalled &&
          this.adsLoader.contentComplete(),
        (this.contentCompleteCalled = !1),
        (this.allAdsCompleted = !1);
    });
  var r = function (t, n) {
    (this.settings = {}),
      (this.contentAndAdsEndedListeners = []),
      (this.isMobile =
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/Android/i)),
      (this.isIos =
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i)),
      this.initWithSettings(n);
    var s = {
        debug: this.settings.debug,
        timeout: this.settings.timeout,
        prerollTimeout: this.settings.prerollTimeout,
      },
      r = this.extend({}, s, n.contribAdsSettings || {});
    (this.playerWrapper = new e(t, r, this)),
      (this.adUi = new i(this)),
      (this.sdkImpl = new o(this));
  };
  (r.IMA_DEFAULTS = {
    adLabel: "Advertisement",
    adLabelNofN: "of",
    debug: !1,
    disableAdControls: !1,
    prerollTimeout: 1e3,
    preventLateAdStart: !1,
    requestMode: "onLoad",
    showControlsForJSAds: !0,
    timeout: 5e3,
  }),
    (r.prototype.initWithSettings = function (t) {
      (this.settings = this.extend({}, r.IMA_DEFAULTS, t || {})),
        this.warnAboutDeprecatedSettings(),
        (this.showCountdown = !0),
        !1 === this.settings.showCountdown && (this.showCountdown = !1);
    }),
    (r.prototype.warnAboutDeprecatedSettings = function () {
      var t = this;
      [
        "adWillAutoplay",
        "adsWillAutoplay",
        "adWillPlayMuted",
        "adsWillPlayMuted",
      ].forEach(function (e) {
        void 0 !== t.settings[e] &&
          console.warn("WARNING: videojs.ima setting " + e + " is deprecated");
      });
    }),
    (r.prototype.getSettings = function () {
      return this.settings;
    }),
    (r.prototype.getIsMobile = function () {
      return this.isMobile;
    }),
    (r.prototype.getIsIos = function () {
      return this.isIos;
    }),
    (r.prototype.injectAdContainerDiv = function (t) {
      this.playerWrapper.injectAdContainerDiv(t);
    }),
    (r.prototype.getAdContainerDiv = function () {
      return this.adUi.getAdContainerDiv();
    }),
    (r.prototype.getContentPlayer = function () {
      return this.playerWrapper.getContentPlayer();
    }),
    (r.prototype.getContentPlayheadTracker = function () {
      return this.playerWrapper.getContentPlayheadTracker();
    }),
    (r.prototype.requestAds = function () {
      this.sdkImpl.requestAds();
    }),
    (r.prototype.setSetting = function (t, e) {
      this.settings[t] = e;
    }),
    (r.prototype.onErrorLoadingAds = function (t) {
      this.adUi.onAdError(), this.playerWrapper.onAdError(t);
    }),
    (r.prototype.onAdPlayPauseClick = function () {
      this.sdkImpl.isAdPlaying()
        ? (this.adUi.onAdsPaused(), this.sdkImpl.pauseAds())
        : (this.adUi.onAdsPlaying(), this.sdkImpl.resumeAds());
    }),
    (r.prototype.onAdMuteClick = function () {
      this.sdkImpl.isAdMuted()
        ? (this.playerWrapper.unmute(),
          this.adUi.unmute(),
          this.sdkImpl.unmute())
        : (this.playerWrapper.mute(), this.adUi.mute(), this.sdkImpl.mute());
    }),
    (r.prototype.setVolume = function (t) {
      this.playerWrapper.setVolume(t), this.sdkImpl.setVolume(t);
    }),
    (r.prototype.getPlayerVolume = function () {
      return this.playerWrapper.getVolume();
    }),
    (r.prototype.toggleFullscreen = function () {
      this.playerWrapper.toggleFullscreen();
    }),
    (r.prototype.onAdError = function (t) {
      this.adUi.onAdError(), this.playerWrapper.onAdError(t);
    }),
    (r.prototype.onAdBreakStart = function (t) {
      this.playerWrapper.onAdBreakStart(), this.adUi.onAdBreakStart(t);
    }),
    (r.prototype.showAdContainer = function () {
      this.adUi.showAdContainer();
    }),
    (r.prototype.onAdBreakEnd = function () {
      this.playerWrapper.onAdBreakEnd(), this.adUi.onAdBreakEnd();
    }),
    (r.prototype.onAllAdsCompleted = function () {
      this.adUi.onAllAdsCompleted(), this.playerWrapper.onAllAdsCompleted();
    }),
    (r.prototype.onAdsPaused = function () {
      this.adUi.onAdsPaused();
    }),
    (r.prototype.onAdsResumed = function () {
      this.adUi.onAdsResumed();
    }),
    (r.prototype.onAdPlayheadUpdated = function (t, e, i, n, s) {
      this.adUi.updateAdUi(t, e, i, n, s);
    }),
    (r.prototype.onAdLog = function (t) {
      this.playerWrapper.onAdLog(t);
    }),
    (r.prototype.getCurrentAd = function () {
      return this.sdkImpl.getCurrentAd();
    }),
    (r.prototype.playContent = function () {
      this.playerWrapper.play();
    }),
    (r.prototype.onLinearAdStart = function () {
      this.adUi.onLinearAdStart(), this.playerWrapper.onAdStart();
    }),
    (r.prototype.onNonLinearAdLoad = function () {
      this.adUi.onNonLinearAdLoad();
    }),
    (r.prototype.onNonLinearAdStart = function () {
      this.adUi.onNonLinearAdLoad(), this.playerWrapper.onAdStart();
    }),
    (r.prototype.getPlayerWidth = function () {
      return this.playerWrapper.getPlayerWidth();
    }),
    (r.prototype.getPlayerHeight = function () {
      return this.playerWrapper.getPlayerHeight();
    }),
    (r.prototype.onAdsReady = function () {
      this.playerWrapper.onAdsReady();
    }),
    (r.prototype.onPlayerResize = function (t, e) {
      this.sdkImpl.onPlayerResize(t, e);
    }),
    (r.prototype.onContentComplete = function () {
      this.sdkImpl.onContentComplete();
    }),
    (r.prototype.onNoPostroll = function () {
      this.playerWrapper.onNoPostroll();
    }),
    (r.prototype.onContentAndAdsCompleted = function () {
      for (var t in this.contentAndAdsEndedListeners)
        "function" == typeof this.contentAndAdsEndedListeners[t] &&
          this.contentAndAdsEndedListeners[t]();
    }),
    (r.prototype.onPlayerDisposed = function () {
      (this.contentAndAdsEndedListeners = []), this.sdkImpl.onPlayerDisposed();
    }),
    (r.prototype.onPlayerReadyForPreroll = function () {
      this.sdkImpl.onPlayerReadyForPreroll();
    }),
    (r.prototype.onAdTimeout = function () {
      this.sdkImpl.onAdTimeout();
    }),
    (r.prototype.onPlayerReady = function () {
      this.sdkImpl.onPlayerReady();
    }),
    (r.prototype.onPlayerEnterFullscreen = function () {
      this.adUi.onPlayerEnterFullscreen(),
        this.sdkImpl.onPlayerEnterFullscreen();
    }),
    (r.prototype.onPlayerExitFullscreen = function () {
      this.adUi.onPlayerExitFullscreen(), this.sdkImpl.onPlayerExitFullscreen();
    }),
    (r.prototype.onPlayerVolumeChanged = function (t) {
      this.adUi.onPlayerVolumeChanged(t), this.sdkImpl.onPlayerVolumeChanged(t);
    }),
    (r.prototype.setContentWithAdTag = function (t, e) {
      this.reset(),
        (this.settings.adTagUrl = e || this.settings.adTagUrl),
        this.playerWrapper.changeSource(t);
    }),
    (r.prototype.setContentWithAdsResponse = function (t, e) {
      this.reset(),
        (this.settings.adsResponse = e || this.settings.adsResponse),
        this.playerWrapper.changeSource(t);
    }),
    (r.prototype.setContentWithAdsRequest = function (t, e) {
      this.reset(),
        (this.settings.adsRequest = e || this.settings.adsRequest),
        this.playerWrapper.changeSource(t);
    }),
    (r.prototype.reset = function () {
      this.sdkImpl.reset(), this.playerWrapper.reset(), this.adUi.reset();
    }),
    (r.prototype.addContentEndedListener = function (t) {
      this.playerWrapper.addContentEndedListener(t);
    }),
    (r.prototype.addContentAndAdsEndedListener = function (t) {
      this.contentAndAdsEndedListeners.push(t);
    }),
    (r.prototype.setAdBreakReadyListener = function (t) {
      this.sdkImpl.setAdBreakReadyListener(t);
    }),
    (r.prototype.setShowCountdown = function (t) {
      this.adUi.setShowCountdown(t),
        (this.showCountdown = t),
        (this.adUi.countdownDiv.style.display = this.showCountdown
          ? "block"
          : "none");
    }),
    (r.prototype.initializeAdDisplayContainer = function () {
      this.sdkImpl.initializeAdDisplayContainer();
    }),
    (r.prototype.playAdBreak = function () {
      this.sdkImpl.playAdBreak();
    }),
    (r.prototype.addEventListener = function (t, e) {
      this.sdkImpl.addEventListener(t, e);
    }),
    (r.prototype.getAdsManager = function () {
      return this.sdkImpl.getAdsManager();
    }),
    (r.prototype.getPlayerId = function () {
      return this.playerWrapper.getPlayerId();
    }),
    (r.prototype.changeAdTag = function (t) {
      this.reset(), (this.settings.adTagUrl = t);
    }),
    (r.prototype.pauseAd = function () {
      this.adUi.onAdsPaused(), this.sdkImpl.pauseAds();
    }),
    (r.prototype.resumeAd = function () {
      this.adUi.onAdsPlaying(), this.sdkImpl.resumeAds();
    }),
    (r.prototype.togglePlayback = function () {
      this.playerWrapper.togglePlayback();
    }),
    (r.prototype.adsWillAutoplay = function () {
      return void 0 !== this.settings.adsWillAutoplay
        ? this.settings.adsWillAutoplay
        : void 0 !== this.settings.adWillAutoplay
        ? this.settings.adWillAutoplay
        : !!this.playerWrapper.getPlayerOptions().autoplay;
    }),
    (r.prototype.adsWillPlayMuted = function () {
      return void 0 !== this.settings.adsWillPlayMuted
        ? this.settings.adsWillPlayMuted
        : void 0 !== this.settings.adWillPlayMuted
        ? this.settings.adWillPlayMuted
        : void 0 !== this.playerWrapper.getPlayerOptions().muted
        ? this.playerWrapper.getPlayerOptions().muted
        : 0 == this.playerWrapper.getVolume();
    }),
    (r.prototype.triggerPlayerEvent = function (t, e) {
      this.playerWrapper.triggerPlayerEvent(t, e);
    }),
    (r.prototype.extend = function (t) {
      for (
        var e = void 0,
          i = void 0,
          n = void 0,
          s = arguments.length,
          o = Array(s > 1 ? s - 1 : 0),
          r = 1;
        r < s;
        r++
      )
        o[r - 1] = arguments[r];
      for (i = 0; i < o.length; i++)
        for (n in (e = o[i])) e.hasOwnProperty(n) && (t[n] = e[n]);
      return t;
    });
  var a = function (t, e) {
    (this.controller = new r(t, e)),
      (this.addContentAndAdsEndedListener = function (t) {
        this.controller.addContentAndAdsEndedListener(t);
      }.bind(this)),
      (this.addContentEndedListener = function (t) {
        this.controller.addContentEndedListener(t);
      }.bind(this)),
      (this.addEventListener = function (t, e) {
        this.controller.addEventListener(t, e);
      }.bind(this)),
      (this.changeAdTag = function (t) {
        this.controller.changeAdTag(t);
      }.bind(this)),
      (this.getAdsManager = function () {
        return this.controller.getAdsManager();
      }.bind(this)),
      (this.initializeAdDisplayContainer = function () {
        this.controller.initializeAdDisplayContainer();
      }.bind(this)),
      (this.pauseAd = function () {
        this.controller.pauseAd();
      }.bind(this)),
      (this.playAdBreak = function () {
        this.controller.playAdBreak();
      }.bind(this)),
      (this.requestAds = function () {
        this.controller.requestAds();
      }.bind(this)),
      (this.resumeAd = function () {
        this.controller.resumeAd();
      }.bind(this)),
      (this.setAdBreakReadyListener = function (t) {
        this.controller.setAdBreakReadyListener(t);
      }.bind(this)),
      (this.setContentWithAdTag = function (t, e) {
        this.controller.setContentWithAdTag(t, e);
      }.bind(this)),
      (this.setContentWithAdsResponse = function (t, e) {
        this.controller.setContentWithAdsResponse(t, e);
      }.bind(this)),
      (this.setContentWithAdsRequest = function (t, e) {
        this.controller.setContentWithAdsRequest(t, e);
      }.bind(this)),
      (this.setShowCountdown = function (t) {
        this.controller.setShowCountdown(t);
      }.bind(this));
  };
  return (
    (t.registerPlugin || t.plugin)("ima", function (t) {
      this.ima = new a(this, t);
    }),
    a
  );
});
