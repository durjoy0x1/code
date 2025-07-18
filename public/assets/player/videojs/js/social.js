+(function (t, e, r) {
  "use strict";
  var i = { calc: !1 };
  e.fn.rrssb = function (t) {
    var i = e.extend(
      {
        description: r,
        emailAddress: r,
        emailBody: r,
        emailSubject: r,
        image: r,
        title: r,
        url: r,
      },
      t
    );
    (i.emailSubject = i.emailSubject || i.title),
      (i.emailBody =
        i.emailBody ||
        (i.description ? i.description : "") + (i.url ? "\n\n" + i.url : ""));
    for (var s in i) i.hasOwnProperty(s) && i[s] !== r && (i[s] = a(i[s]));
    i.url !== r &&
      (e(this)
        .find(".rrssb-facebook a")
        .attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + i.url),
      e(this)
        .find(".rrssb-tumblr a")
        .attr(
          "href",
          "http://tumblr.com/share/link?url=" +
            i.url +
            (i.title !== r ? "&name=" + i.title : "") +
            (i.description !== r ? "&description=" + i.description : "")
        ),
      e(this)
        .find(".rrssb-linkedin a")
        .attr(
          "href",
          "http://www.linkedin.com/shareArticle?mini=true&url=" +
            i.url +
            (i.title !== r ? "&title=" + i.title : "") +
            (i.description !== r ? "&summary=" + i.description : "")
        ),
      e(this)
        .find(".rrssb-twitter a")
        .attr(
          "href",
          "https://twitter.com/intent/tweet?text=" +
            (i.description !== r ? i.description : "") +
            "%20" +
            i.url
        ),
      e(this)
        .find(".rrssb-hackernews a")
        .attr(
          "href",
          "https://news.ycombinator.com/submitlink?u=" +
            i.url +
            (i.title !== r ? "&text=" + i.title : "")
        ),
      e(this)
        .find(".rrssb-vk a")
        .attr("href", "https://vk.com/share.php?url=" + i.url),
      e(this)
        .find(".rrssb-reddit a")
        .attr(
          "href",
          "http://www.reddit.com/submit?url=" +
            i.url +
            (i.description !== r ? "&text=" + i.description : "") +
            (i.title !== r ? "&title=" + i.title : "")
        ),
      e(this)
        .find(".rrssb-googleplus a")
        .attr("href", "https://plus.google.com/share?url=" + i.url),
      e(this)
        .find(".rrssb-pinterest a")
        .attr(
          "href",
          "http://pinterest.com/pin/create/button/?url=" +
            i.url +
            (i.image !== r ? "&amp;media=" + i.image : "") +
            (i.description !== r ? "&description=" + i.description : "")
        ),
      e(this)
        .find(".rrssb-pocket a")
        .attr("href", "https://getpocket.com/save?url=" + i.url),
      e(this).find(".rrssb-github a").attr("href", i.url),
      e(this).find(".rrssb-print a").attr("href", "javascript:window.print()"),
      e(this)
        .find(".rrssb-whatsapp a")
        .attr(
          "href",
          "whatsapp://send?text=" +
            (i.description !== r
              ? i.description + "%20"
              : i.title !== r
              ? i.title + "%20"
              : "") +
            i.url
        )),
      (i.emailAddress !== r || i.emailSubject) &&
        e(this)
          .find(".rrssb-email a")
          .attr(
            "href",
            "mailto:" +
              (i.emailAddress ? i.emailAddress : "") +
              "?" +
              (i.emailSubject !== r ? "subject=" + i.emailSubject : "") +
              (i.emailBody !== r ? "&body=" + i.emailBody : "")
          );
  };
  var s = function () {
      var t = e("<div>"),
        r = ["calc", "-webkit-calc", "-moz-calc"];
      e("body").append(t);
      for (var s = 0; s < r.length; s++)
        if ((t.css("width", r[s] + "(1px)"), 1 === t.width())) {
          i.calc = r[s];
          break;
        }
      t.remove();
    },
    a = function (t) {
      if (t !== r && null !== t) {
        if (null === t.match(/%[0-9a-f]{2}/i)) return encodeURIComponent(t);
        (t = decodeURIComponent(t)), a(t);
      }
    },
    n = function () {
      e(".rrssb-buttons").each(function (t) {
        var r = e(this),
          i = e("li:visible", r),
          s = i.length,
          a = 100 / s;
        i.css("width", a + "%").attr("data-initwidth", a);
      });
    },
    l = function () {
      e(".rrssb-buttons").each(function (t) {
        var r = e(this),
          i = r.width(),
          s = e("li", r).not(".small").eq(0).width(),
          a = e("li.small", r).length;
        if (s > 170 && a < 1) {
          r.addClass("large-format");
          var n = s / 12 + "px";
          r.css("font-size", n);
        } else r.removeClass("large-format"), r.css("font-size", "");
        i < 25 * a
          ? r.removeClass("small-format").addClass("tiny-format")
          : r.removeClass("tiny-format");
      });
    },
    o = function () {
      e(".rrssb-buttons").each(function (t) {
        var r = e(this),
          i = e("li", r),
          s = i.filter(".small"),
          a = 0,
          n = 0,
          l = s.eq(0),
          o = parseFloat(l.attr("data-size")) + 55,
          c = s.length;
        if (c === i.length) {
          var d = 42 * c,
            u = r.width();
          d + o < u &&
            (r.removeClass("small-format"), s.eq(0).removeClass("small"), h());
        } else {
          i.not(".small").each(function (t) {
            var r = e(this),
              i = parseFloat(r.attr("data-size")) + 55,
              s = parseFloat(r.width());
            (a += s), (n += i);
          });
          var m = a - n;
          o < m && (l.removeClass("small"), h());
        }
      });
    },
    c = function (t) {
      e(".rrssb-buttons").each(function (t) {
        var r = e(this),
          i = e("li", r);
        e(i.get().reverse()).each(function (t, r) {
          var s = e(this);
          if (s.hasClass("small") === !1) {
            var a = parseFloat(s.attr("data-size")) + 55,
              n = parseFloat(s.width());
            if (a > n) {
              var l = i.not(".small").last();
              e(l).addClass("small"), h();
            }
          }
          --r || o();
        });
      }),
        t === !0 && u(h);
    },
    h = function () {
      e(".rrssb-buttons").each(function (t) {
        var r,
          s,
          a,
          l,
          o,
          c = e(this),
          h = e("li", c),
          d = h.filter(".small"),
          u = d.length;
        u > 0 && u !== h.length
          ? (c.removeClass("small-format"),
            d.css("width", "42px"),
            (a = 42 * u),
            (r = h.not(".small").length),
            (s = 100 / r),
            (o = a / r),
            i.calc === !1
              ? ((l = (c.innerWidth() - 1) / r - o),
                (l = Math.floor(1e3 * l) / 1e3),
                (l += "px"))
              : (l = i.calc + "(" + s + "% - " + o + "px)"),
            h.not(".small").css("width", l))
          : u === h.length
          ? (c.addClass("small-format"), n())
          : (c.removeClass("small-format"), n());
      }),
        l();
    },
    d = function () {
      e(".rrssb-buttons").each(function (t) {
        e(this).addClass("rrssb-" + (t + 1));
      }),
        s(),
        n(),
        e(".rrssb-buttons li .rrssb-text").each(function (t) {
          var r = e(this),
            i = r.width();
          r.closest("li").attr("data-size", i);
        }),
        c(!0);
    },
    u = function (t) {
      e(".rrssb-buttons li.small").removeClass("small"), c(), t();
    },
    m = function (e, i, s, a) {
      var n = t.screenLeft !== r ? t.screenLeft : screen.left,
        l = t.screenTop !== r ? t.screenTop : screen.top,
        o = t.innerWidth
          ? t.innerWidth
          : document.documentElement.clientWidth
          ? document.documentElement.clientWidth
          : screen.width,
        c = t.innerHeight
          ? t.innerHeight
          : document.documentElement.clientHeight
          ? document.documentElement.clientHeight
          : screen.height,
        h = o / 2 - s / 2 + n,
        d = c / 3 - a / 3 + l,
        u = t.open(
          e,
          i,
          "scrollbars=yes, width=" +
            s +
            ", height=" +
            a +
            ", top=" +
            d +
            ", left=" +
            h
        );
      u && u.focus && u.focus();
    },
    f = (function () {
      var t = {};
      return function (e, r, i) {
        i || (i = "Don't call this twice without a uniqueId"),
          t[i] && clearTimeout(t[i]),
          (t[i] = setTimeout(e, r));
      };
    })();
  e(document).ready(function () {
    try {
      e(document).on("click", ".rrssb-buttons a.popup", {}, function (t) {
        var r = e(this);
        m(r.attr("href"), r.find(".rrssb-text").html(), 580, 470),
          t.preventDefault();
      });
    } catch (t) {}
    e(t).resize(function () {
      u(h),
        f(
          function () {
            u(h);
          },
          200,
          "finished resizing"
        );
    }),
      d();
  }),
    (t.rrssbInit = d);
})(window, jQuery);
