/*
 * jQuery MiniColors: A tiny color picker built on jQuery
 *
 * Copyright Cory LaViska for A Beautiful Site, LLC. (http://www.abeautifulsite.net/)
 *
 * Licensed under the MIT license: http://opensource.org/licenses/MIT
 *
 */ jQuery &&
  (function (e) {
    function t(t, n) {
      var r = e('<div class="minicolors" />'),
        i = e.minicolors.defaults;
      if (t.data("minicolors-initialized")) return;
      n = e.extend(!0, {}, i, n);
      r.addClass("minicolors-theme-" + n.theme).toggleClass(
        "minicolors-with-opacity",
        n.opacity
      );
      n.position !== undefined &&
        e.each(n.position.split(" "), function () {
          r.addClass("minicolors-position-" + this);
        });
      t.addClass("minicolors-input")
        .data("minicolors-initialized", !1)
        .data("minicolors-settings", n)
        .prop("size", 7)
        .wrap(r)
        .after(
          '<div class="minicolors-panel minicolors-slider-' +
            n.control +
            '">' +
            '<div class="minicolors-slider">' +
            '<div class="minicolors-picker"></div>' +
            "</div>" +
            '<div class="minicolors-opacity-slider">' +
            '<div class="minicolors-picker"></div>' +
            "</div>" +
            '<div class="minicolors-grid">' +
            '<div class="minicolors-grid-inner"></div>' +
            '<div class="minicolors-picker"><div></div></div>' +
            "</div>" +
            "</div>"
        );
      if (!n.inline) {
        t.after(
          '<span class="minicolors-swatch"><span class="minicolors-swatch-color"></span></span>'
        );
        t.next(".minicolors-swatch").on("click", function (e) {
          e.preventDefault();
          t.focus();
        });
      }
      t.parent()
        .find(".minicolors-panel")
        .on("selectstart", function () {
          return !1;
        })
        .end();
      n.inline && t.parent().addClass("minicolors-inline");
      u(t, !1);
      t.data("minicolors-initialized", !0);
    }
    function n(e) {
      var t = e.parent();
      e.removeData("minicolors-initialized")
        .removeData("minicolors-settings")
        .removeProp("size")
        .removeClass("minicolors-input");
      t.before(e).remove();
    }
    function r(e) {
      var t = e.parent(),
        n = t.find(".minicolors-panel"),
        r = e.data("minicolors-settings");
      if (
        !e.data("minicolors-initialized") ||
        e.prop("disabled") ||
        t.hasClass("minicolors-inline") ||
        t.hasClass("minicolors-focus")
      )
        return;
      i();
      t.addClass("minicolors-focus");
      n.stop(!0, !0).fadeIn(r.showSpeed, function () {
        r.show && r.show.call(e.get(0));
      });
    }
    function i() {
      e(".minicolors-input").each(function () {
        var t = e(this),
          n = t.data("minicolors-settings"),
          r = t.parent();
        if (n.inline) return;
        r.find(".minicolors-panel").fadeOut(n.hideSpeed, function () {
          r.hasClass("minicolors-focus") && n.hide && n.hide.call(t.get(0));
          r.removeClass("minicolors-focus");
        });
      });
    }
    function s(e, t, n) {
      var r = e.parents(".minicolors").find(".minicolors-input"),
        i = r.data("minicolors-settings"),
        s = e.find("[class$=-picker]"),
        u = e.offset().left,
        a = e.offset().top,
        f = Math.round(t.pageX - u),
        l = Math.round(t.pageY - a),
        c = n ? i.animationSpeed : 0,
        h,
        p,
        d,
        v;
      if (t.originalEvent.changedTouches) {
        f = t.originalEvent.changedTouches[0].pageX - u;
        l = t.originalEvent.changedTouches[0].pageY - a;
      }
      f < 0 && (f = 0);
      l < 0 && (l = 0);
      f > e.width() && (f = e.width());
      l > e.height() && (l = e.height());
      if (
        e.parent().is(".minicolors-slider-wheel") &&
        s.parent().is(".minicolors-grid")
      ) {
        h = 75 - f;
        p = 75 - l;
        d = Math.sqrt(h * h + p * p);
        v = Math.atan2(p, h);
        v < 0 && (v += Math.PI * 2);
        if (d > 75) {
          d = 75;
          f = 75 - 75 * Math.cos(v);
          l = 75 - 75 * Math.sin(v);
        }
        f = Math.round(f);
        l = Math.round(l);
      }
      e.is(".minicolors-grid")
        ? s
            .stop(!0)
            .animate(
              { top: l + "px", left: f + "px" },
              c,
              i.animationEasing,
              function () {
                o(r, e);
              }
            )
        : s
            .stop(!0)
            .animate({ top: l + "px" }, c, i.animationEasing, function () {
              o(r, e);
            });
    }
    function o(e, t) {
      function n(e, t) {
        var n, r;
        if (!e.length || !t) return null;
        n = e.offset().left;
        r = e.offset().top;
        return {
          x: n - t.offset().left + e.outerWidth() / 2,
          y: r - t.offset().top + e.outerHeight() / 2,
        };
      }
      var r,
        i,
        s,
        o,
        u,
        f,
        l,
        h = e.val(),
        d = e.attr("data-opacity"),
        v = e.parent(),
        g = e.data("minicolors-settings"),
        y = v.find(".minicolors-swatch"),
        b = v.find(".minicolors-grid"),
        w = v.find(".minicolors-slider"),
        E = v.find(".minicolors-opacity-slider"),
        S = b.find("[class$=-picker]"),
        x = w.find("[class$=-picker]"),
        T = E.find("[class$=-picker]"),
        N = n(S, b),
        C = n(x, w),
        k = n(T, E);
      if (t.is(".minicolors-grid, .minicolors-slider")) {
        switch (g.control) {
          case "wheel":
            o = b.width() / 2 - N.x;
            u = b.height() / 2 - N.y;
            f = Math.sqrt(o * o + u * u);
            l = Math.atan2(u, o);
            l < 0 && (l += Math.PI * 2);
            if (f > 75) {
              f = 75;
              N.x = 69 - 75 * Math.cos(l);
              N.y = 69 - 75 * Math.sin(l);
            }
            i = p(f / 0.75, 0, 100);
            r = p((l * 180) / Math.PI, 0, 360);
            s = p(100 - Math.floor(C.y * (100 / w.height())), 0, 100);
            h = m({ h: r, s: i, b: s });
            w.css("backgroundColor", m({ h: r, s: i, b: 100 }));
            break;
          case "saturation":
            r = p(parseInt(N.x * (360 / b.width()), 10), 0, 360);
            i = p(100 - Math.floor(C.y * (100 / w.height())), 0, 100);
            s = p(100 - Math.floor(N.y * (100 / b.height())), 0, 100);
            h = m({ h: r, s: i, b: s });
            w.css("backgroundColor", m({ h: r, s: 100, b: s }));
            v.find(".minicolors-grid-inner").css("opacity", i / 100);
            break;
          case "brightness":
            r = p(parseInt(N.x * (360 / b.width()), 10), 0, 360);
            i = p(100 - Math.floor(N.y * (100 / b.height())), 0, 100);
            s = p(100 - Math.floor(C.y * (100 / w.height())), 0, 100);
            h = m({ h: r, s: i, b: s });
            w.css("backgroundColor", m({ h: r, s: i, b: 100 }));
            v.find(".minicolors-grid-inner").css("opacity", 1 - s / 100);
            break;
          default:
            r = p(360 - parseInt(C.y * (360 / w.height()), 10), 0, 360);
            i = p(Math.floor(N.x * (100 / b.width())), 0, 100);
            s = p(100 - Math.floor(N.y * (100 / b.height())), 0, 100);
            h = m({ h: r, s: i, b: s });
            b.css("backgroundColor", m({ h: r, s: 100, b: 100 }));
        }
        e.val(c(h, g.letterCase));
      }
      if (t.is(".minicolors-opacity-slider")) {
        g.opacity ? (d = parseFloat(1 - k.y / E.height()).toFixed(2)) : (d = 1);
        g.opacity && e.attr("data-opacity", d);
      }
      y.find("SPAN").css({ backgroundColor: h, opacity: d });
      a(e, h, d);
    }
    function u(e, t) {
      var n,
        r,
        i,
        s,
        o,
        u,
        f,
        l = e.parent(),
        d = e.data("minicolors-settings"),
        v = l.find(".minicolors-swatch"),
        y = l.find(".minicolors-grid"),
        b = l.find(".minicolors-slider"),
        w = l.find(".minicolors-opacity-slider"),
        E = y.find("[class$=-picker]"),
        S = b.find("[class$=-picker]"),
        x = w.find("[class$=-picker]");
      n = c(h(e.val(), !0), d.letterCase);
      n || (n = c(h(d.defaultValue, !0), d.letterCase));
      r = g(n);
      t || e.val(n);
      if (d.opacity) {
        i =
          e.attr("data-opacity") === ""
            ? 1
            : p(parseFloat(e.attr("data-opacity")).toFixed(2), 0, 1);
        isNaN(i) && (i = 1);
        e.attr("data-opacity", i);
        v.find("SPAN").css("opacity", i);
        o = p(w.height() - w.height() * i, 0, w.height());
        x.css("top", o + "px");
      }
      v.find("SPAN").css("backgroundColor", n);
      switch (d.control) {
        case "wheel":
          u = p(Math.ceil(r.s * 0.75), 0, y.height() / 2);
          f = (r.h * Math.PI) / 180;
          s = p(75 - Math.cos(f) * u, 0, y.width());
          o = p(75 - Math.sin(f) * u, 0, y.height());
          E.css({ top: o + "px", left: s + "px" });
          o = 150 - r.b / (100 / y.height());
          n === "" && (o = 0);
          S.css("top", o + "px");
          b.css("backgroundColor", m({ h: r.h, s: r.s, b: 100 }));
          break;
        case "saturation":
          s = p((5 * r.h) / 12, 0, 150);
          o = p(
            y.height() - Math.ceil(r.b / (100 / y.height())),
            0,
            y.height()
          );
          E.css({ top: o + "px", left: s + "px" });
          o = p(b.height() - r.s * (b.height() / 100), 0, b.height());
          S.css("top", o + "px");
          b.css("backgroundColor", m({ h: r.h, s: 100, b: r.b }));
          l.find(".minicolors-grid-inner").css("opacity", r.s / 100);
          break;
        case "brightness":
          s = p((5 * r.h) / 12, 0, 150);
          o = p(
            y.height() - Math.ceil(r.s / (100 / y.height())),
            0,
            y.height()
          );
          E.css({ top: o + "px", left: s + "px" });
          o = p(b.height() - r.b * (b.height() / 100), 0, b.height());
          S.css("top", o + "px");
          b.css("backgroundColor", m({ h: r.h, s: r.s, b: 100 }));
          l.find(".minicolors-grid-inner").css("opacity", 1 - r.b / 100);
          break;
        default:
          s = p(Math.ceil(r.s / (100 / y.width())), 0, y.width());
          o = p(
            y.height() - Math.ceil(r.b / (100 / y.height())),
            0,
            y.height()
          );
          E.css({ top: o + "px", left: s + "px" });
          o = p(b.height() - r.h / (360 / b.height()), 0, b.height());
          S.css("top", o + "px");
          y.css("backgroundColor", m({ h: r.h, s: 100, b: 100 }));
      }
      e.data("minicolors-initialized") && a(e, n, i);
    }
    function a(e, t, n) {
      var r = e.data("minicolors-settings"),
        i = e.data("minicolors-lastChange");
      if (!i || i.hex !== t || i.opacity !== n) {
        e.data("minicolors-lastChange", { hex: t, opacity: n });
        if (r.change)
          if (r.changeDelay) {
            clearTimeout(e.data("minicolors-changeTimeout"));
            e.data(
              "minicolors-changeTimeout",
              setTimeout(function () {
                r.change.call(e.get(0), t, n);
              }, r.changeDelay)
            );
          } else r.change.call(e.get(0), t, n);
        e.trigger("change").trigger("input");
      }
    }
    function f(t) {
      var n = h(e(t).val(), !0),
        r = b(n),
        i = e(t).attr("data-opacity");
      if (!r) return null;
      i !== undefined && e.extend(r, { a: parseFloat(i) });
      return r;
    }
    function l(t, n) {
      var r = h(e(t).val(), !0),
        i = b(r),
        s = e(t).attr("data-opacity");
      if (!i) return null;
      s === undefined && (s = 1);
      return n
        ? "rgba(" + i.r + ", " + i.g + ", " + i.b + ", " + parseFloat(s) + ")"
        : "rgb(" + i.r + ", " + i.g + ", " + i.b + ")";
    }
    function c(e, t) {
      return t === "uppercase" ? e.toUpperCase() : e.toLowerCase();
    }
    function h(e, t) {
      e = e.replace(/[^A-F0-9]/gi, "");
      if (e.length !== 3 && e.length !== 6) return "";
      e.length === 3 && t && (e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2]);
      return "#" + e;
    }
    function p(e, t, n) {
      e < t && (e = t);
      e > n && (e = n);
      return e;
    }
    function d(e) {
      var t = {},
        n = Math.round(e.h),
        r = Math.round((e.s * 255) / 100),
        i = Math.round((e.b * 255) / 100);
      if (r === 0) t.r = t.g = t.b = i;
      else {
        var s = i,
          o = ((255 - r) * i) / 255,
          u = ((s - o) * (n % 60)) / 60;
        n === 360 && (n = 0);
        if (n < 60) {
          t.r = s;
          t.b = o;
          t.g = o + u;
        } else if (n < 120) {
          t.g = s;
          t.b = o;
          t.r = s - u;
        } else if (n < 180) {
          t.g = s;
          t.r = o;
          t.b = o + u;
        } else if (n < 240) {
          t.b = s;
          t.r = o;
          t.g = s - u;
        } else if (n < 300) {
          t.b = s;
          t.g = o;
          t.r = o + u;
        } else if (n < 360) {
          t.r = s;
          t.g = o;
          t.b = s - u;
        } else {
          t.r = 0;
          t.g = 0;
          t.b = 0;
        }
      }
      return { r: Math.round(t.r), g: Math.round(t.g), b: Math.round(t.b) };
    }
    function v(t) {
      var n = [t.r.toString(16), t.g.toString(16), t.b.toString(16)];
      e.each(n, function (e, t) {
        t.length === 1 && (n[e] = "0" + t);
      });
      return "#" + n.join("");
    }
    function m(e) {
      return v(d(e));
    }
    function g(e) {
      var t = y(b(e));
      t.s === 0 && (t.h = 360);
      return t;
    }
    function y(e) {
      var t = { h: 0, s: 0, b: 0 },
        n = Math.min(e.r, e.g, e.b),
        r = Math.max(e.r, e.g, e.b),
        i = r - n;
      t.b = r;
      t.s = r !== 0 ? (255 * i) / r : 0;
      t.s !== 0
        ? e.r === r
          ? (t.h = (e.g - e.b) / i)
          : e.g === r
          ? (t.h = 2 + (e.b - e.r) / i)
          : (t.h = 4 + (e.r - e.g) / i)
        : (t.h = -1);
      t.h *= 60;
      t.h < 0 && (t.h += 360);
      t.s *= 100 / 255;
      t.b *= 100 / 255;
      return t;
    }
    function b(e) {
      e = parseInt(e.indexOf("#") > -1 ? e.substring(1) : e, 16);
      return { r: e >> 16, g: (e & 65280) >> 8, b: e & 255 };
    }
    e.minicolors = {
      defaults: {
        animationSpeed: 50,
        animationEasing: "swing",
        change: null,
        changeDelay: 0,
        control: "hue",
        defaultValue: "",
        hide: null,
        hideSpeed: 100,
        inline: !1,
        letterCase: "lowercase",
        opacity: !1,
        position: "bottom left",
        show: null,
        showSpeed: 100,
        theme: "default",
      },
    };
    e.extend(e.fn, {
      minicolors: function (s, o) {
        switch (s) {
          case "destroy":
            e(this).each(function () {
              n(e(this));
            });
            return e(this);
          case "hide":
            i();
            return e(this);
          case "opacity":
            if (o === undefined) return e(this).attr("data-opacity");
            e(this).each(function () {
              u(e(this).attr("data-opacity", o));
            });
            return e(this);
          case "rgbObject":
            return f(e(this), s === "rgbaObject");
          case "rgbString":
          case "rgbaString":
            return l(e(this), s === "rgbaString");
          case "settings":
            if (o === undefined) return e(this).data("minicolors-settings");
            e(this).each(function () {
              var t = e(this).data("minicolors-settings") || {};
              n(e(this));
              e(this).minicolors(e.extend(!0, t, o));
            });
            return e(this);
          case "show":
            r(e(this).eq(0));
            return e(this);
          case "value":
            if (o === undefined) return e(this).val();
            e(this).each(function () {
              u(e(this).val(o));
            });
            return e(this);
          default:
            s !== "create" && (o = s);
            e(this).each(function () {
              t(e(this), o);
            });
            return e(this);
        }
      },
    });
    e(document)
      .on("mousedown.minicolors touchstart.minicolors", function (t) {
        e(t.target).parents().add(t.target).hasClass("minicolors") || i();
      })
      .on(
        "mousedown.minicolors touchstart.minicolors",
        ".minicolors-grid, .minicolors-slider, .minicolors-opacity-slider",
        function (t) {
          var n = e(this);
          t.preventDefault();
          e(document).data("minicolors-target", n);
          s(n, t, !0);
        }
      )
      .on("mousemove.minicolors touchmove.minicolors", function (t) {
        var n = e(document).data("minicolors-target");
        n && s(n, t);
      })
      .on("mouseup.minicolors touchend.minicolors", function () {
        e(this).removeData("minicolors-target");
      })
      .on(
        "mousedown.minicolors touchstart.minicolors",
        ".minicolors-swatch",
        function (t) {
          var n = e(this).parent().find(".minicolors-input");
          t.preventDefault();
          r(n);
        }
      )
      .on("focus.minicolors", ".minicolors-input", function () {
        var t = e(this);
        if (!t.data("minicolors-initialized")) return;
        r(t);
      })
      .on("blur.minicolors", ".minicolors-input", function () {
        var t = e(this),
          n = t.data("minicolors-settings");
        if (!t.data("minicolors-initialized")) return;
        t.val(h(t.val(), !0));
        t.val() === "" && t.val(h(n.defaultValue, !0));
        t.val(c(t.val(), n.letterCase));
      })
      .on("keydown.minicolors", ".minicolors-input", function (t) {
        var n = e(this);
        if (!n.data("minicolors-initialized")) return;
        switch (t.keyCode) {
          case 9:
            i();
            break;
          case 13:
          case 27:
            i();
            n.blur();
        }
      })
      .on("keyup.minicolors", ".minicolors-input", function () {
        var t = e(this);
        if (!t.data("minicolors-initialized")) return;
        u(t, !0);
      })
      .on("paste.minicolors", ".minicolors-input", function () {
        var t = e(this);
        if (!t.data("minicolors-initialized")) return;
        setTimeout(function () {
          u(t, !0);
        }, 1);
      });
  })(jQuery);
