/**
 * videojs-seek-buttons
 * @version 1.1.0
 * @copyright 2017 Ben Clifford
 * @license Apache-2.0
 */
!(function (e, o) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = o(require("video.js")))
    : "function" == typeof define && define.amd
    ? define(["video.js"], o)
    : (e.videojsSeekButtons = o(e.videojs));
})(this, function (e) {
  "use strict";
  function o(e, o) {
    if (!(e instanceof o))
      throw new TypeError("Cannot call a class as a function");
  }
  function t(e, o) {
    if (!e)
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called"
      );
    return !o || ("object" != typeof o && "function" != typeof o) ? e : o;
  }
  function n(e, o) {
    if ("function" != typeof o && null !== o)
      throw new TypeError(
        "Super expression must either be null or a function, not " + typeof o
      );
    (e.prototype = Object.create(o && o.prototype, {
      constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 },
    })),
      o &&
        (Object.setPrototypeOf
          ? Object.setPrototypeOf(e, o)
          : (e.__proto__ = o));
  }
  var r = (e = "default" in e ? e.default : e).getComponent("Button"),
    i = e.getComponent("Component"),
    s = {},
    c = e.registerPlugin || e.plugin,
    a = function (e, o) {
      e.addClass("vjs-seek-buttons"),
        o.forward &&
          o.forward > 0 &&
          ((e.controlBar.seekForward = e.controlBar.addChild("seekButton", {
            direction: "forward",
            seconds: o.forward,
          })),
          e.controlBar
            .el()
            .insertBefore(
              e.controlBar.seekForward.el(),
              e.controlBar.el().firstChild.nextSibling
            )),
        o.back &&
          o.back > 0 &&
          ((e.controlBar.seekBack = e.controlBar.addChild("seekButton", {
            direction: "back",
            seconds: o.back,
          })),
          e.controlBar
            .el()
            .insertBefore(
              e.controlBar.seekBack.el(),
              e.controlBar.el().firstChild.nextSibling
            ));
    },
    l = function (o) {
      var t = this;
      this.ready(function () {
        a(t, e.mergeOptions(s, o));
      });
    },
    d = (function (e) {
      function r(n, i) {
        o(this, r);
        var s = t(this, e.call(this, n, i));
        return (
          "forward" === s.options_.direction
            ? s.controlText(
                s
                  .localize("Forward {{seconds}} seconds")
                  .replace("{{seconds}}", s.options_.seconds)
              )
            : "back" === s.options_.direction &&
              s.controlText(
                s
                  .localize("Backward {{seconds}} seconds")
                  .replace("{{seconds}}", s.options_.seconds)
              ),
          s
        );
      }
      return (
        n(r, e),
        (r.prototype.buildCSSClass = function () {
          return (
            "vjs-seek-button skip-" +
            this.options_.direction +
            " skip-" +
            this.options_.seconds +
            " " +
            e.prototype.buildCSSClass.call(this)
          );
        }),
        (r.prototype.handleClick = function () {
          var e = this.player_.currentTime();
          "forward" === this.options_.direction
            ? this.player_.currentTime(e + this.options_.seconds)
            : "back" === this.options_.direction &&
              this.player_.currentTime(e - this.options_.seconds);
        }),
        r
      );
    })(r);
  return (
    i.registerComponent("SeekButton", d),
    c("seekButtons", l),
    (l.VERSION = "1.1.0"),
    l
  );
});
