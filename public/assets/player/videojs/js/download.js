/**
 * videojs-download-button
 * @version 0.0.1
 * @copyright 2016 Mikhail Khazov mikhail.khazov@gmail.com
 * @license MIT
 */
!(function (e) {
  if ("object" == typeof exports && "undefined" != typeof module)
    module.exports = e();
  else if ("function" == typeof define && define.amd) define([], e);
  else {
    var n;
    (n =
      "undefined" != typeof window
        ? window
        : "undefined" != typeof global
        ? global
        : "undefined" != typeof self
        ? self
        : this),
      (n.videojsDownloadButton = e());
  }
})(function () {
  return (function e(n, o, t) {
    function d(r, f) {
      if (!o[r]) {
        if (!n[r]) {
          var l = "function" == typeof require && require;
          if (!f && l) return l(r, !0);
          if (i) return i(r, !0);
          var u = new Error("Cannot find module '" + r + "'");
          throw ((u.code = "MODULE_NOT_FOUND"), u);
        }
        var a = (o[r] = { exports: {} });
        n[r][0].call(
          a.exports,
          function (e) {
            var o = n[r][1][e];
            return d(o ? o : e);
          },
          a,
          a.exports,
          e,
          n,
          o,
          t
        );
      }
      return o[r].exports;
    }
    for (
      var i = "function" == typeof require && require, r = 0;
      r < t.length;
      r++
    )
      d(t[r]);
    return d;
  })(
    {
      1: [
        function (e, n, o) {
          (function (e) {
            "use strict";
            function t(e) {
              return e && e.__esModule ? e : { default: e };
            }
            Object.defineProperty(o, "__esModule", { value: !0 });
            var d =
                "undefined" != typeof window
                  ? window.videojs
                  : "undefined" != typeof e
                  ? e.videojs
                  : null,
              i = t(d),
              r = i.default.getComponent("ClickableComponent"),
              f = { text: "Download" },
              l = function () {
                return (
                  "vjs-download-button-control " + r.prototype.buildCSSClass()
                );
              },
              u = function (e, n) {
                if (
                  (e.addClass("vjs-download-button"),
                  !e.controlBar.childNameIndex_.hasOwnProperty(
                    "DownloadButton"
                  ))
                ) {
                  var o = {
                      className: l(),
                      href: e.currentSrc(),
                      title: n.text,
                      download: "",
                    },
                    t = { "aria-live": "polite", "aria-label": n.text };
                  e.controlBar.addChild(
                    new r(void 0, { el: r.prototype.createEl("a", o, t) })
                  );
                }
              },
              a = function (e) {
                var n = this;
                this.ready(function () {
                  u(n, i.default.mergeOptions(f, e));
                });
              };
            i.default.registerPlugin("downloadButton", a),
              (a.VERSION = "0.0.1"),
              (o.default = a),
              (n.exports = o.default);
          }).call(
            this,
            "undefined" != typeof global
              ? global
              : "undefined" != typeof self
              ? self
              : "undefined" != typeof window
              ? window
              : {}
          );
        },
        {},
      ],
    },
    {},
    [1]
  )(1);
});
