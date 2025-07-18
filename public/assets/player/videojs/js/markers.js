var $ = jQuery;
!(function (e, r) {
  if ("function" == typeof define && define.amd) define(["video.js"], r);
  else if ("undefined" != typeof exports) r(require("video.js"));
  else {
    var t = { exports: {} };
    r(e.videojs), (e.videojsMarkers = t.exports);
  }
})(this, function (e) {
  "use strict";
  function r() {
    var e = new Date().getTime();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (r) {
        var t = (e + 16 * Math.random()) % 16 | 0;
        return (
          (e = Math.floor(e / 16)), ("x" == r ? t : (3 & t) | 8).toString(16)
        );
      }
    );
  }
  function t(e) {
    function t() {
      j.sort(function (e, r) {
        return T.markerTip.time(e) - T.markerTip.time(r);
      });
    }
    function l(e) {
      e.forEach(function (e) {
        (e.key = r()),
          M.el().querySelector(".vjs-progress-holder").appendChild(c(e)),
          (g[e.key] = e),
          j.push(e);
      }),
        t();
    }
    function u(e) {
      return (T.markerTip.time(e) / M.duration()) * 100;
    }
    function c(e) {
      var r = i.default.dom.createEl(
        "div",
        { className: "vjs-marker " + (e.class || "") },
        { "data-marker-key": e.key, "data-marker-time": T.markerTip.time(e) }
      );
      return (
        Object.keys(T.markerStyle).forEach(function (e) {
          r.style[e] = T.markerStyle[e];
        }),
        (r.style.left = u(e) + "%"),
        (r.style.marginLeft = r.getBoundingClientRect().width / 2 + "px"),
        r.addEventListener("click", function (r) {
          var t = !1;
          if (
            ("function" == typeof T.onMarkerClick &&
              (t = !1 === T.onMarkerClick(e)),
            !t)
          ) {
            var i = this.getAttribute("data-marker-key");
            M.currentTime(T.markerTip.time(g[i]));
          }
        }),
        T.markerTip.display && d(r),
        r
      );
    }
    function f() {
      j.forEach(function (e) {
        var r = M.el().querySelector(
            ".vjs-marker[data-marker-key='" + e.key + "']"
          ),
          t = T.markerTip.time(e);
        r.getAttribute("data-marker-time") !== t &&
          ((r.style.left = u(e) + "%"), r.setAttribute("data-marker-time", t));
      }),
        t();
    }
    function s(e) {
      S && ((A = o), (S.style.visibility = "hidden")), (E = o);
      var r = [];
      e.forEach(function (e) {
        var t = j[e];
        if (t) {
          delete g[t.key], r.push(e);
          var i = M.el().querySelector(
            ".vjs-marker[data-marker-key='" + t.key + "']"
          );
          i.parentNode.removeChild(i);
        }
      }),
        r.reverse(),
        r.forEach(function (e) {
          j.splice(e, 1);
        }),
        t();
    }
    function d(e) {
      e.addEventListener("mouseover", function () {
        var r = g[e.getAttribute("data-marker-key")];
        O &&
          ((O.querySelector(".vjs-tip-inner").innerText = T.markerTip.text(r)),
          (O.style.left = u(r) + "%"),
          (O.style.marginLeft =
            -parseFloat(O.getBoundingClientRect().width / 2) +
            parseFloat(e.getBoundingClientRect().width / 4) +
            "px"),
          (O.style.visibility = "visible"));
      }),
        e.addEventListener("mouseout", function () {
          O && (O.style.visibility = "hidden");
        });
    }
    function m() {
      (O = i.default.dom.createEl("div", {
        className: "vjs-tip",
        innerHTML:
          "<div class='vjs-tip-arrow'></div><div class='vjs-tip-inner'></div>",
      })),
        M.el().querySelector(".vjs-progress-holder").appendChild(O);
    }
    function v() {
      if (T.breakOverlay.display && !(E < 0)) {
        var e = M.currentTime(),
          r = j[E],
          t = T.markerTip.time(r);
        e >= t && e <= t + T.breakOverlay.displayTime
          ? (A !== E &&
              ((A = E),
              S &&
                (S.querySelector(".vjs-break-overlay-text").innerHTML =
                  T.breakOverlay.text(r))),
            S && (S.style.visibility = "visible"))
          : ((A = o), S && (S.style.visibility = "hidden"));
      }
    }
    function y() {
      (S = i.default.dom.createEl("div", {
        className: "vjs-break-overlay",
        innerHTML: "<div class='vjs-break-overlay-text'></div>",
      })),
        Object.keys(T.breakOverlay.style).forEach(function (e) {
          S && (S.style[e] = T.breakOverlay.style[e]);
        }),
        M.el().appendChild(S),
        (A = o);
    }
    function k() {
      p(),
        v(),
        e.onTimeUpdateAfterMarkerUpdate && e.onTimeUpdateAfterMarkerUpdate();
    }
    function p() {
      if (j.length) {
        var r = function (e) {
            return e < j.length - 1 ? T.markerTip.time(j[e + 1]) : M.duration();
          },
          t = M.currentTime(),
          i = o;
        if (E !== o) {
          var n = r(E);
          if (t >= T.markerTip.time(j[E]) && t < n) return;
          if (E === j.length - 1 && t === M.duration()) return;
        }
        if (t < T.markerTip.time(j[0])) i = o;
        else
          for (var a = 0; a < j.length; a++)
            if (((n = r(a)), t >= T.markerTip.time(j[a]) && t < n)) {
              i = a;
              break;
            }
        i !== E &&
          (i !== o && e.onMarkerReached && e.onMarkerReached(j[i], i), (E = i));
      }
    }
    function x() {
      T.markerTip.display && m(),
        M.markers.removeAll(),
        l(e.markers),
        T.breakOverlay.display && y(),
        k(),
        M.on("timeupdate", k),
        M.off("loadedmetadata");
    }
    if (!i.default.mergeOptions) {
      var h = function (e) {
          return (
            !!e &&
            "object" === (void 0 === e ? "undefined" : n(e)) &&
            "[object Object]" === toString.call(e) &&
            e.constructor === Object
          );
        },
        b = function e(r, t) {
          var i = {};
          return (
            [r, t].forEach(function (r) {
              r &&
                Object.keys(r).forEach(function (t) {
                  var n = r[t];
                  h(n)
                    ? (h(i[t]) || (i[t] = {}), (i[t] = e(i[t], n)))
                    : (i[t] = n);
                });
            }),
            i
          );
        };
      i.default.mergeOptions = b;
    }
    i.default.dom.createEl ||
      (i.default.dom.createEl = function (e, r, t) {
        var n = i.default.Player.prototype.dom.createEl(e, r);
        return (
          t &&
            Object.keys(t).forEach(function (e) {
              n.setAttribute(e, t[e]);
            }),
          n
        );
      });
    var T = i.default.mergeOptions(a, e),
      g = {},
      j = [],
      E = o,
      M = this,
      O = null,
      S = null,
      A = o;
    M.on("loadedmetadata", function () {
      x();
    }),
      (M.markers = {
        getMarkers: function () {
          return j;
        },
        next: function () {
          for (var e = M.currentTime(), r = 0; r < j.length; r++) {
            var t = T.markerTip.time(j[r]);
            if (t > e) {
              M.currentTime(t);
              break;
            }
          }
        },
        prev: function () {
          for (var e = M.currentTime(), r = j.length - 1; r >= 0; r--) {
            var t = T.markerTip.time(j[r]);
            if (t + 0.5 < e) return void M.currentTime(t);
          }
        },
        add: function (e) {
          l(e);
        },
        remove: function (e) {
          s(e);
        },
        removeAll: function () {
          for (var e = [], r = 0; r < j.length; r++) e.push(r);
          s(e);
        },
        updateTime: function () {
          f();
        },
        reset: function (e) {
          M.markers.removeAll(), l(e);
        },
        destroy: function () {
          M.markers.removeAll(),
            S && S.remove(),
            O && O.remove(),
            M.off("timeupdate", v),
            delete M.markers;
        },
      });
  }
  var i = (function (e) {
      return e && e.__esModule ? e : { default: e };
    })(e),
    n =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              "function" == typeof Symbol &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? "symbol"
              : typeof e;
          },
    a = {
      markerStyle: {
        width: "7px",
        "border-radius": "30%",
        "background-color": "red",
      },
      markerTip: {
        display: !0,
        text: function (e) {
          return "Break: " + e.text;
        },
        time: function (e) {
          return e.time;
        },
      },
      breakOverlay: {
        display: !1,
        displayTime: 3,
        text: function (e) {
          return "Break overlay: " + e.overlayText;
        },
        style: {},
      },
      onMarkerClick: function (e) {},
      onMarkerReached: function (e, r) {},
      markers: [],
    },
    o = -1;
  i.default.registerPlugin("markers", t);
});
