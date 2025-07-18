/*! selectize.js - v0.13.3 | https://github.com/selectize/selectize.js | Apache License (v2) */

!(function (root, factory) {
  "function" == typeof define && define.amd
    ? define("sifter", factory)
    : "object" == typeof exports
    ? (module.exports = factory())
    : (root.Sifter = factory());
})(this, function () {
  function Sifter(items, settings) {
    (this.items = items), (this.settings = settings || { diacritics: !0 });
  }
  (Sifter.prototype.tokenize = function (query) {
    if (!(query = trim(String(query || "").toLowerCase())) || !query.length)
      return [];
    for (
      var regex,
        letter,
        tokens = [],
        words = query.split(/ +/),
        i = 0,
        n = words.length;
      i < n;
      i++
    ) {
      if (((regex = escape_regex(words[i])), this.settings.diacritics))
        for (letter in DIACRITICS)
          DIACRITICS.hasOwnProperty(letter) &&
            (regex = regex.replace(
              new RegExp(letter, "g"),
              DIACRITICS[letter]
            ));
      tokens.push({ string: words[i], regex: new RegExp(regex, "i") });
    }
    return tokens;
  }),
    (Sifter.prototype.iterator = function (object, callback) {
      var iterator = is_array(object)
        ? Array.prototype.forEach ||
          function (callback) {
            for (var i = 0, n = this.length; i < n; i++)
              callback(this[i], i, this);
          }
        : function (callback) {
            for (var key in this)
              this.hasOwnProperty(key) && callback(this[key], key, this);
          };
      iterator.apply(object, [callback]);
    }),
    (Sifter.prototype.getScoreFunction = function (search, options) {
      function scoreValue(score, token) {
        var pos;
        return !score ||
          -1 === (pos = (score = String(score || "")).search(token.regex))
          ? 0
          : ((score = token.string.length / score.length),
            0 === pos && (score += 0.5),
            score);
      }
      var field_count,
        tokens = (search = this.prepareSearch(search, options)).tokens,
        fields = search.options.fields,
        token_count = tokens.length,
        nesting = search.options.nesting,
        scoreObject = (field_count = fields.length)
          ? 1 === field_count
            ? function (token, data) {
                return scoreValue(getattr(data, fields[0], nesting), token);
              }
            : function (token, data) {
                for (var i = 0, sum = 0; i < field_count; i++)
                  sum += scoreValue(getattr(data, fields[i], nesting), token);
                return sum / field_count;
              }
          : function () {
              return 0;
            };
      return token_count
        ? 1 === token_count
          ? function (data) {
              return scoreObject(tokens[0], data);
            }
          : "and" === search.options.conjunction
          ? function (data) {
              for (var score, i = 0, sum = 0; i < token_count; i++) {
                if ((score = scoreObject(tokens[i], data)) <= 0) return 0;
                sum += score;
              }
              return sum / token_count;
            }
          : function (data) {
              for (var i = 0, sum = 0; i < token_count; i++)
                sum += scoreObject(tokens[i], data);
              return sum / token_count;
            }
        : function () {
            return 0;
          };
    }),
    (Sifter.prototype.getSortFunction = function (search, options) {
      var i,
        n,
        field,
        fields_count,
        multiplier,
        multipliers,
        implicit_score,
        self = this,
        sort =
          (!(search = self.prepareSearch(search, options)).query &&
            options.sort_empty) ||
          options.sort,
        get_field = function (name, result) {
          return "$score" === name
            ? result.score
            : getattr(self.items[result.id], name, options.nesting);
        },
        fields = [];
      if (sort)
        for (i = 0, n = sort.length; i < n; i++)
          (!search.query && "$score" === sort[i].field) || fields.push(sort[i]);
      if (search.query) {
        for (implicit_score = !0, i = 0, n = fields.length; i < n; i++)
          if ("$score" === fields[i].field) {
            implicit_score = !1;
            break;
          }
        implicit_score &&
          fields.unshift({ field: "$score", direction: "desc" });
      } else
        for (i = 0, n = fields.length; i < n; i++)
          if ("$score" === fields[i].field) {
            fields.splice(i, 1);
            break;
          }
      for (multipliers = [], i = 0, n = fields.length; i < n; i++)
        multipliers.push("desc" === fields[i].direction ? -1 : 1);
      return (fields_count = fields.length)
        ? 1 === fields_count
          ? ((field = fields[0].field),
            (multiplier = multipliers[0]),
            function (a, b) {
              return multiplier * cmp(get_field(field, a), get_field(field, b));
            })
          : function (a, b) {
              for (var result, i = 0; i < fields_count; i++)
                if (
                  ((result = fields[i].field),
                  (result =
                    multipliers[i] *
                    cmp(get_field(result, a), get_field(result, b))))
                )
                  return result;
              return 0;
            }
        : null;
    }),
    (Sifter.prototype.prepareSearch = function (query, options) {
      if ("object" == typeof query) return query;
      var option_fields = (options = extend({}, options)).fields,
        option_sort = options.sort,
        option_sort_empty = options.sort_empty;
      return (
        option_fields &&
          !is_array(option_fields) &&
          (options.fields = [option_fields]),
        option_sort && !is_array(option_sort) && (options.sort = [option_sort]),
        option_sort_empty &&
          !is_array(option_sort_empty) &&
          (options.sort_empty = [option_sort_empty]),
        {
          options: options,
          query: String(query || "").toLowerCase(),
          tokens: this.tokenize(query),
          total: 0,
          items: [],
        }
      );
    }),
    (Sifter.prototype.search = function (fn_sort, options) {
      var score,
        fn_score,
        search = this.prepareSearch(fn_sort, options);
      return (
        (options = search.options),
        (fn_sort = search.query),
        (fn_score = options.score || this.getScoreFunction(search)),
        fn_sort.length
          ? this.iterator(this.items, function (item, id) {
              (score = fn_score(item)),
                (!1 === options.filter || 0 < score) &&
                  search.items.push({ score: score, id: id });
            })
          : this.iterator(this.items, function (item, id) {
              search.items.push({ score: 1, id: id });
            }),
        (fn_sort = this.getSortFunction(search, options)) &&
          search.items.sort(fn_sort),
        (search.total = search.items.length),
        "number" == typeof options.limit &&
          (search.items = search.items.slice(0, options.limit)),
        search
      );
    });
  var cmp = function (a, b) {
      return "number" == typeof a && "number" == typeof b
        ? b < a
          ? 1
          : a < b
          ? -1
          : 0
        : ((a = asciifold(String(a || ""))),
          (b = asciifold(String(b || ""))) < a ? 1 : a < b ? -1 : 0);
    },
    extend = function (a, b) {
      for (var k, object, i = 1, n = arguments.length; i < n; i++)
        if ((object = arguments[i]))
          for (k in object) object.hasOwnProperty(k) && (a[k] = object[k]);
      return a;
    },
    getattr = function (obj, name, nesting) {
      if (obj && name) {
        if (!nesting) return obj[name];
        for (
          var names = name.split(".");
          names.length && (obj = obj[names.shift()]);

        );
        return obj;
      }
    },
    trim = function (str) {
      return (str + "").replace(/^\s+|\s+$|/g, "");
    },
    escape_regex = function (str) {
      return (str + "").replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    },
    is_array =
      Array.isArray ||
      ("undefined" != typeof $ && $.isArray) ||
      function (object) {
        return "[object Array]" === Object.prototype.toString.call(object);
      },
    DIACRITICS = {
      a: "[aḀḁĂăÂâǍǎȺⱥȦȧẠạÄäÀàÁáĀāÃãÅåąĄÃąĄ]",
      b: "[b␢βΒB฿𐌁ᛒ]",
      c: "[cĆćĈĉČčĊċC̄c̄ÇçḈḉȻȼƇƈɕᴄＣｃ]",
      d: "[dĎďḊḋḐḑḌḍḒḓḎḏĐđD̦d̦ƉɖƊɗƋƌᵭᶁᶑȡᴅＤｄð]",
      e: "[eÉéÈèÊêḘḙĚěĔĕẼẽḚḛẺẻĖėËëĒēȨȩĘęᶒɆɇȄȅẾếỀềỄễỂểḜḝḖḗḔḕȆȇẸẹỆệⱸᴇＥｅɘǝƏƐε]",
      f: "[fƑƒḞḟ]",
      g: "[gɢ₲ǤǥĜĝĞğĢģƓɠĠġ]",
      h: "[hĤĥĦħḨḩẖẖḤḥḢḣɦʰǶƕ]",
      i: "[iÍíÌìĬĭÎîǏǐÏïḮḯĨĩĮįĪīỈỉȈȉȊȋỊịḬḭƗɨɨ̆ᵻᶖİiIıɪＩｉ]",
      j: "[jȷĴĵɈɉʝɟʲ]",
      k: "[kƘƙꝀꝁḰḱǨǩḲḳḴḵκϰ₭]",
      l: "[lŁłĽľĻļĹĺḶḷḸḹḼḽḺḻĿŀȽƚⱠⱡⱢɫɬᶅɭȴʟＬｌ]",
      n: "[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲȠƞᵰᶇɳȵɴＮｎŊŋ]",
      o: "[oØøÖöÓóÒòÔôǑǒŐőŎŏȮȯỌọƟɵƠơỎỏŌōÕõǪǫȌȍՕօ]",
      p: "[pṔṕṖṗⱣᵽƤƥᵱ]",
      q: "[qꝖꝗʠɊɋꝘꝙq̃]",
      r: "[rŔŕɌɍŘřŖŗṘṙȐȑȒȓṚṛⱤɽ]",
      s: "[sŚśṠṡṢṣꞨꞩŜŝŠšŞşȘșS̈s̈]",
      t: "[tŤťṪṫŢţṬṭƮʈȚțṰṱṮṯƬƭ]",
      u: "[uŬŭɄʉỤụÜüÚúÙùÛûǓǔŰűŬŭƯưỦủŪūŨũŲųȔȕ∪]",
      v: "[vṼṽṾṿƲʋꝞꝟⱱʋ]",
      w: "[wẂẃẀẁŴŵẄẅẆẇẈẉ]",
      x: "[xẌẍẊẋχ]",
      y: "[yÝýỲỳŶŷŸÿỸỹẎẏỴỵɎɏƳƴ]",
      z: "[zŹźẐẑŽžŻżẒẓẔẕƵƶ]",
    },
    asciifold = (function () {
      var i,
        n,
        k,
        chunk,
        foreignletters = "",
        lookup = {};
      for (k in DIACRITICS)
        if (DIACRITICS.hasOwnProperty(k))
          for (
            foreignletters += chunk =
              DIACRITICS[k].substring(2, DIACRITICS[k].length - 1),
              i = 0,
              n = chunk.length;
            i < n;
            i++
          )
            lookup[chunk.charAt(i)] = k;
      var regexp = new RegExp("[" + foreignletters + "]", "g");
      return function (str) {
        return str
          .replace(regexp, function (foreignletter) {
            return lookup[foreignletter];
          })
          .toLowerCase();
      };
    })();
  return Sifter;
}),
  (function (root, factory) {
    "function" == typeof define && define.amd
      ? define("microplugin", factory)
      : "object" == typeof exports
      ? (module.exports = factory())
      : (root.MicroPlugin = factory());
  })(this, function () {
    var MicroPlugin = {
        mixin: function (Interface) {
          (Interface.plugins = {}),
            (Interface.prototype.initializePlugins = function (plugins) {
              var i,
                n,
                key,
                queue = [];
              if (
                ((this.plugins = {
                  names: [],
                  settings: {},
                  requested: {},
                  loaded: {},
                }),
                utils.isArray(plugins))
              )
                for (i = 0, n = plugins.length; i < n; i++)
                  "string" == typeof plugins[i]
                    ? queue.push(plugins[i])
                    : ((this.plugins.settings[plugins[i].name] =
                        plugins[i].options),
                      queue.push(plugins[i].name));
              else if (plugins)
                for (key in plugins)
                  plugins.hasOwnProperty(key) &&
                    ((this.plugins.settings[key] = plugins[key]),
                    queue.push(key));
              for (; queue.length; ) this.require(queue.shift());
            }),
            (Interface.prototype.loadPlugin = function (name) {
              var plugins = this.plugins,
                plugin = Interface.plugins[name];
              if (!Interface.plugins.hasOwnProperty(name))
                throw new Error('Unable to find "' + name + '" plugin');
              (plugins.requested[name] = !0),
                (plugins.loaded[name] = plugin.fn.apply(this, [
                  this.plugins.settings[name] || {},
                ])),
                plugins.names.push(name);
            }),
            (Interface.prototype.require = function (name) {
              var plugins = this.plugins;
              if (!this.plugins.loaded.hasOwnProperty(name)) {
                if (plugins.requested[name])
                  throw new Error(
                    'Plugin has circular dependency ("' + name + '")'
                  );
                this.loadPlugin(name);
              }
              return plugins.loaded[name];
            }),
            (Interface.define = function (name, fn) {
              Interface.plugins[name] = { name: name, fn: fn };
            });
        },
      },
      utils = {
        isArray:
          Array.isArray ||
          function (vArg) {
            return "[object Array]" === Object.prototype.toString.call(vArg);
          },
      };
    return MicroPlugin;
  }),
  (function (root, factory) {
    "function" == typeof define && define.amd
      ? define("selectize", ["jquery", "sifter", "microplugin"], factory)
      : "object" == typeof module && "object" == typeof module.exports
      ? (module.exports = factory(
          require("jquery"),
          require("sifter"),
          require("microplugin")
        ))
      : (root.Selectize = factory(root.jQuery, root.Sifter, root.MicroPlugin));
  })(this, function ($, Sifter, MicroPlugin) {
    "use strict";
    $.fn.removeHighlight = function () {
      return this.find("span.highlight")
        .each(function () {
          this.parentNode.firstChild.nodeName;
          var parent = this.parentNode;
          parent.replaceChild(this.firstChild, this), parent.normalize();
        })
        .end();
    };
    function MicroEvent() {}
    (MicroEvent.prototype = {
      on: function (event, fct) {
        (this._events = this._events || {}),
          (this._events[event] = this._events[event] || []),
          this._events[event].push(fct);
      },
      off: function (event, fct) {
        var n = arguments.length;
        return 0 === n
          ? delete this._events
          : 1 === n
          ? delete this._events[event]
          : ((this._events = this._events || {}),
            void (
              event in this._events != !1 &&
              this._events[event].splice(this._events[event].indexOf(fct), 1)
            ));
      },
      trigger: function (event) {
        if (((this._events = this._events || {}), event in this._events != !1))
          for (var i = 0; i < this._events[event].length; i++)
            this._events[event][i].apply(
              this,
              Array.prototype.slice.call(arguments, 1)
            );
      },
    }),
      (MicroEvent.mixin = function (destObject) {
        for (var props = ["on", "off", "trigger"], i = 0; i < props.length; i++)
          destObject.prototype[props[i]] = MicroEvent.prototype[props[i]];
      });
    function isset(object) {
      return void 0 !== object;
    }
    function hash_key(value) {
      return null == value
        ? null
        : "boolean" == typeof value
        ? value
          ? "1"
          : "0"
        : value + "";
    }
    function escape_html(str) {
      return (str + "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
    function debounce_events(self, types, fn) {
      var type,
        trigger = self.trigger,
        event_args = {};
      for (type in ((self.trigger = function () {
        var type = arguments[0];
        if (-1 === types.indexOf(type)) return trigger.apply(self, arguments);
        event_args[type] = arguments;
      }),
      fn.apply(self, []),
      (self.trigger = trigger),
      event_args))
        event_args.hasOwnProperty(type) &&
          trigger.apply(self, event_args[type]);
    }
    function getSelection(input) {
      var sel,
        selLen,
        result = {};
      return (
        void 0 === input
          ? console.warn("WARN getSelection cannot locate input control")
          : "selectionStart" in input
          ? ((result.start = input.selectionStart),
            (result.length = input.selectionEnd - result.start))
          : document.selection &&
            (input.focus(),
            (sel = document.selection.createRange()),
            (selLen = document.selection.createRange().text.length),
            sel.moveStart("character", -input.value.length),
            (result.start = sel.text.length - selLen),
            (result.length = selLen)),
        result
      );
    }
    function measureString(str, $parent) {
      return str
        ? (Selectize.$testInput ||
            ((Selectize.$testInput = $("<span />").css({
              position: "absolute",
              width: "auto",
              padding: 0,
              whiteSpace: "pre",
            })),
            $("<div />")
              .css({
                position: "absolute",
                width: 0,
                height: 0,
                overflow: "hidden",
              })
              .append(Selectize.$testInput)
              .appendTo("body")),
          Selectize.$testInput.text(str),
          (function ($from, $to, properties) {
            var i,
              n,
              styles = {};
            if (properties)
              for (i = 0, n = properties.length; i < n; i++)
                styles[properties[i]] = $from.css(properties[i]);
            else styles = $from.css();
            $to.css(styles);
          })($parent, Selectize.$testInput, [
            "letterSpacing",
            "fontSize",
            "fontFamily",
            "fontWeight",
            "textTransform",
          ]),
          Selectize.$testInput.width())
        : 0;
    }
    function autoGrow($input) {
      function update(e, selection) {
        var keyCode, width, shift, placeholder;
        (selection = selection || {}),
          (e = e || window.event || {}).metaKey ||
            e.altKey ||
            (!selection.force && !1 === $input.data("grow")) ||
            ((width = $input.val()),
            e.type &&
              "keydown" === e.type.toLowerCase() &&
              ((shift =
                (48 <= (keyCode = e.keyCode) && keyCode <= 57) ||
                (65 <= keyCode && keyCode <= 90) ||
                (96 <= keyCode && keyCode <= 111) ||
                (186 <= keyCode && keyCode <= 222) ||
                32 === keyCode),
              46 === keyCode || 8 === keyCode
                ? (selection = getSelection($input[0])).length
                  ? (width =
                      width.substring(0, selection.start) +
                      width.substring(selection.start + selection.length))
                  : 8 === keyCode && selection.start
                  ? (width =
                      width.substring(0, selection.start - 1) +
                      width.substring(selection.start + 1))
                  : 46 === keyCode &&
                    void 0 !== selection.start &&
                    (width =
                      width.substring(0, selection.start) +
                      width.substring(selection.start + 1))
                : shift &&
                  ((shift = e.shiftKey),
                  (placeholder = String.fromCharCode(e.keyCode)),
                  (width += placeholder =
                    shift
                      ? placeholder.toUpperCase()
                      : placeholder.toLowerCase()))),
            (placeholder = $input.attr("placeholder")),
            (width =
              measureString(
                (width = !width && placeholder ? placeholder : width),
                $input
              ) + 4) !== currentWidth &&
              ((currentWidth = width),
              $input.width(width),
              $input.triggerHandler("resize")));
      }
      var currentWidth = null;
      $input.on("keydown keyup update blur", update), update();
    }
    var IS_MAC = /Mac/.test(navigator.userAgent),
      KEY_CMD = IS_MAC ? 91 : 17,
      KEY_CTRL = IS_MAC ? 18 : 17,
      SUPPORTS_VALIDITY_API =
        !/android/i.test(window.navigator.userAgent) &&
        !!document.createElement("input").validity,
      hook = {
        before: function (self, method, fn) {
          var original = self[method];
          self[method] = function () {
            return fn.apply(self, arguments), original.apply(self, arguments);
          };
        },
        after: function (self, method, fn) {
          var original = self[method];
          self[method] = function () {
            var result = original.apply(self, arguments);
            return fn.apply(self, arguments), result;
          };
        },
      },
      Selectize = function ($input, settings) {
        var i,
          n,
          input = $input[0];
        input.selectize = this;
        var fn,
          delay,
          timeout,
          dir = window.getComputedStyle && window.getComputedStyle(input, null);
        if (
          ((dir =
            (dir = dir
              ? dir.getPropertyValue("direction")
              : input.currentStyle && input.currentStyle.direction) ||
            $input.parents("[dir]:first").attr("dir") ||
            ""),
          $.extend(this, {
            order: 0,
            settings: settings,
            $input: $input,
            tabIndex: $input.attr("tabindex") || "",
            tagType: "select" === input.tagName.toLowerCase() ? 1 : 2,
            rtl: /rtl/i.test(dir),
            eventNS: ".selectize" + ++Selectize.count,
            highlightedValue: null,
            isBlurring: !1,
            isOpen: !1,
            isDisabled: !1,
            isRequired: $input.is("[required]"),
            isInvalid: !1,
            isLocked: !1,
            isFocused: !1,
            isInputHidden: !1,
            isSetup: !1,
            isShiftDown: !1,
            isCmdDown: !1,
            isCtrlDown: !1,
            ignoreFocus: !1,
            ignoreBlur: !1,
            ignoreHover: !1,
            hasOptions: !1,
            currentResults: null,
            lastValue: "",
            lastValidValue: "",
            caretPos: 0,
            loading: 0,
            loadedSearches: {},
            $activeOption: null,
            $activeItems: [],
            optgroups: {},
            options: {},
            userOptions: {},
            items: [],
            renderCache: {},
            onSearchChange:
              null === settings.loadThrottle
                ? this.onSearchChange
                : ((fn = this.onSearchChange),
                  (delay = settings.loadThrottle),
                  function () {
                    var self = this,
                      args = arguments;
                    window.clearTimeout(timeout),
                      (timeout = window.setTimeout(function () {
                        fn.apply(self, args);
                      }, delay));
                  }),
          }),
          (this.sifter = new Sifter(this.options, {
            diacritics: settings.diacritics,
          })),
          this.settings.options)
        ) {
          for (i = 0, n = this.settings.options.length; i < n; i++)
            this.registerOption(this.settings.options[i]);
          delete this.settings.options;
        }
        if (this.settings.optgroups) {
          for (i = 0, n = this.settings.optgroups.length; i < n; i++)
            this.registerOptionGroup(this.settings.optgroups[i]);
          delete this.settings.optgroups;
        }
        (this.settings.mode =
          this.settings.mode ||
          (1 === this.settings.maxItems ? "single" : "multi")),
          "boolean" != typeof this.settings.hideSelected &&
            (this.settings.hideSelected = "multi" === this.settings.mode),
          this.initializePlugins(this.settings.plugins),
          this.setupCallbacks(),
          this.setupTemplates(),
          this.setup();
      };
    return (
      MicroEvent.mixin(Selectize),
      void 0 !== MicroPlugin
        ? MicroPlugin.mixin(Selectize)
        : (function (message, options) {
            options = options || {};
            console.error("Selectize: " + message),
              options.explanation &&
                (console.group && console.group(),
                console.error(options.explanation),
                console.group && console.groupEnd());
          })("Dependency MicroPlugin is missing", {
            explanation:
              'Make sure you either: (1) are using the "standalone" version of Selectize, or (2) require MicroPlugin before you load Selectize.',
          }),
      $.extend(Selectize.prototype, {
        setup: function () {
          var delimiterEscaped,
            $parent,
            fn,
            self = this,
            settings = self.settings,
            eventNS = self.eventNS,
            $window = $(window),
            $document = $(document),
            $input = self.$input,
            event = self.settings.mode,
            classes = $input.attr("class") || "",
            $wrapper = $("<div>")
              .addClass(settings.wrapperClass)
              .addClass(classes)
              .addClass(event),
            $control = $("<div>")
              .addClass(settings.inputClass)
              .addClass("items")
              .appendTo($wrapper),
            $control_input = $(
              '<input type="text" autocomplete="new-password" autofill="no" />'
            )
              .appendTo($control)
              .attr("tabindex", $input.is(":disabled") ? "-1" : self.tabIndex),
            inputId = $(settings.dropdownParent || $wrapper),
            selector = $("<div>")
              .addClass(settings.dropdownClass)
              .addClass(event)
              .hide()
              .appendTo(inputId),
            event = $("<div>")
              .addClass(settings.dropdownContentClass)
              .attr("tabindex", "-1")
              .appendTo(selector);
          (inputId = $input.attr("id")) &&
            ($control_input.attr("id", inputId + "-selectized"),
            $("label[for='" + inputId + "']").attr(
              "for",
              inputId + "-selectized"
            )),
            self.settings.copyClassesToDropdown && selector.addClass(classes),
            $wrapper.css({ width: $input[0].style.width }),
            self.plugins.names.length &&
              ((delimiterEscaped =
                "plugin-" + self.plugins.names.join(" plugin-")),
              $wrapper.addClass(delimiterEscaped),
              selector.addClass(delimiterEscaped)),
            (null === settings.maxItems || 1 < settings.maxItems) &&
              1 === self.tagType &&
              $input.attr("multiple", "multiple"),
            self.settings.placeholder &&
              $control_input.attr("placeholder", settings.placeholder),
            !self.settings.splitOn &&
              self.settings.delimiter &&
              ((delimiterEscaped = self.settings.delimiter.replace(
                /[-\/\\^$*+?.()|[\]{}]/g,
                "\\$&"
              )),
              (self.settings.splitOn = new RegExp(
                "\\s*" + delimiterEscaped + "+\\s*"
              ))),
            $input.attr("autocorrect") &&
              $control_input.attr("autocorrect", $input.attr("autocorrect")),
            $input.attr("autocapitalize") &&
              $control_input.attr(
                "autocapitalize",
                $input.attr("autocapitalize")
              ),
            ($control_input[0].type = $input[0].type),
            (self.$wrapper = $wrapper),
            (self.$control = $control),
            (self.$control_input = $control_input),
            (self.$dropdown = selector),
            (self.$dropdown_content = event),
            selector.on(
              "mouseenter mousedown click",
              "[data-disabled]>[data-selectable]",
              function (e) {
                e.stopImmediatePropagation();
              }
            ),
            selector.on("mouseenter", "[data-selectable]", function () {
              return self.onOptionHover.apply(self, arguments);
            }),
            selector.on("mousedown click", "[data-selectable]", function () {
              return self.onOptionSelect.apply(self, arguments);
            }),
            (event = "mousedown"),
            (selector = "*:not(input)"),
            (fn = function () {
              return self.onItemSelect.apply(self, arguments);
            }),
            ($parent = $control).on(event, selector, function (e) {
              for (
                var child = e.target;
                child && child.parentNode !== $parent[0];

              )
                child = child.parentNode;
              return (e.currentTarget = child), fn.apply(this, [e]);
            }),
            autoGrow($control_input),
            $control.on({
              mousedown: function () {
                return self.onMouseDown.apply(self, arguments);
              },
              click: function () {
                return self.onClick.apply(self, arguments);
              },
            }),
            $control_input.on({
              mousedown: function (e) {
                e.stopPropagation();
              },
              keydown: function () {
                return self.onKeyDown.apply(self, arguments);
              },
              keyup: function () {
                return self.onKeyUp.apply(self, arguments);
              },
              keypress: function () {
                return self.onKeyPress.apply(self, arguments);
              },
              resize: function () {
                self.positionDropdown.apply(self, []);
              },
              blur: function () {
                return self.onBlur.apply(self, arguments);
              },
              focus: function () {
                return (
                  (self.ignoreBlur = !1), self.onFocus.apply(self, arguments)
                );
              },
              paste: function () {
                return self.onPaste.apply(self, arguments);
              },
            }),
            $document.on("keydown" + eventNS, function (e) {
              (self.isCmdDown = e[IS_MAC ? "metaKey" : "ctrlKey"]),
                (self.isCtrlDown = e[IS_MAC ? "altKey" : "ctrlKey"]),
                (self.isShiftDown = e.shiftKey);
            }),
            $document.on("keyup" + eventNS, function (e) {
              e.keyCode === KEY_CTRL && (self.isCtrlDown = !1),
                16 === e.keyCode && (self.isShiftDown = !1),
                e.keyCode === KEY_CMD && (self.isCmdDown = !1);
            }),
            $document.on("mousedown" + eventNS, function (e) {
              if (self.isFocused) {
                if (
                  e.target === self.$dropdown[0] ||
                  e.target.parentNode === self.$dropdown[0]
                )
                  return !1;
                self.$control.has(e.target).length ||
                  e.target === self.$control[0] ||
                  self.blur(e.target);
              }
            }),
            $window.on(
              ["scroll" + eventNS, "resize" + eventNS].join(" "),
              function () {
                self.isOpen && self.positionDropdown.apply(self, arguments);
              }
            ),
            $window.on("mousemove" + eventNS, function () {
              self.ignoreHover = !1;
            }),
            (this.revertSettings = {
              $children: $input.children().detach(),
              tabindex: $input.attr("tabindex"),
            }),
            $input.attr("tabindex", -1).hide().after(self.$wrapper),
            Array.isArray(settings.items) &&
              ((self.lastValidValue = settings.items),
              self.setValue(settings.items),
              delete settings.items),
            SUPPORTS_VALIDITY_API &&
              $input.on("invalid" + eventNS, function (e) {
                e.preventDefault(), (self.isInvalid = !0), self.refreshState();
              }),
            self.updateOriginalInput(),
            self.refreshItems(),
            self.refreshState(),
            self.updatePlaceholder(),
            (self.isSetup = !0),
            $input.is(":disabled") && self.disable(),
            self.on("change", this.onChange),
            $input.data("selectize", self),
            $input.addClass("selectized"),
            self.trigger("initialize"),
            !0 === settings.preload && self.onSearchChange("");
        },
        setupTemplates: function () {
          var field_label = this.settings.labelField,
            field_value = this.settings.valueField,
            field_optgroup = this.settings.optgroupLabelField;
          this.settings.render = $.extend(
            {},
            {
              optgroup: function (data) {
                return '<div class="optgroup">' + data.html + "</div>";
              },
              optgroup_header: function (data, escape) {
                return (
                  '<div class="optgroup-header">' +
                  escape(data[field_optgroup]) +
                  "</div>"
                );
              },
              option: function (data, escape) {
                return (
                  '<div class="option ' +
                  ("" === data[field_value]
                    ? "selectize-dropdown-emptyoptionlabel"
                    : "") +
                  '">' +
                  escape(data[field_label]) +
                  "</div>"
                );
              },
              item: function (data, escape) {
                return (
                  '<div class="item">' + escape(data[field_label]) + "</div>"
                );
              },
              option_create: function (data, escape) {
                return (
                  '<div class="create">Add <strong>' +
                  escape(data.input) +
                  "</strong>&hellip;</div>"
                );
              },
            },
            this.settings.render
          );
        },
        setupCallbacks: function () {
          var key,
            fn,
            callbacks = {
              initialize: "onInitialize",
              change: "onChange",
              item_add: "onItemAdd",
              item_remove: "onItemRemove",
              clear: "onClear",
              option_add: "onOptionAdd",
              option_remove: "onOptionRemove",
              option_clear: "onOptionClear",
              optgroup_add: "onOptionGroupAdd",
              optgroup_remove: "onOptionGroupRemove",
              optgroup_clear: "onOptionGroupClear",
              dropdown_open: "onDropdownOpen",
              dropdown_close: "onDropdownClose",
              type: "onType",
              load: "onLoad",
              focus: "onFocus",
              blur: "onBlur",
              dropdown_item_activate: "onDropdownItemActivate",
              dropdown_item_deactivate: "onDropdownItemDeactivate",
            };
          for (key in callbacks)
            callbacks.hasOwnProperty(key) &&
              (fn = this.settings[callbacks[key]]) &&
              this.on(key, fn);
        },
        onClick: function (e) {
          (this.isFocused && this.isOpen) || (this.focus(), e.preventDefault());
        },
        onMouseDown: function (e) {
          var self = this,
            defaultPrevented = e.isDefaultPrevented();
          $(e.target);
          if (self.isFocused) {
            if (e.target !== self.$control_input[0])
              return (
                "single" === self.settings.mode
                  ? self.isOpen
                    ? self.close()
                    : self.open()
                  : defaultPrevented || self.setActiveItem(null),
                !1
              );
          } else
            defaultPrevented ||
              window.setTimeout(function () {
                self.focus();
              }, 0);
        },
        onChange: function () {
          "" !== this.getValue() && (this.lastValidValue = this.getValue()),
            this.$input.trigger("input"),
            this.$input.trigger("change");
        },
        onPaste: function (e) {
          var self = this;
          self.isFull() || self.isInputHidden || self.isLocked
            ? e.preventDefault()
            : self.settings.splitOn &&
              setTimeout(function () {
                var pastedText = self.$control_input.val();
                if (pastedText.match(self.settings.splitOn))
                  for (
                    var splitInput = pastedText
                        .trim()
                        .split(self.settings.splitOn),
                      i = 0,
                      n = splitInput.length;
                    i < n;
                    i++
                  )
                    self.createItem(splitInput[i]);
              }, 0);
        },
        onKeyPress: function (e) {
          if (this.isLocked) return e && e.preventDefault();
          var character = String.fromCharCode(e.keyCode || e.which);
          return this.settings.create &&
            "multi" === this.settings.mode &&
            character === this.settings.delimiter
            ? (this.createItem(), e.preventDefault(), !1)
            : void 0;
        },
        onKeyDown: function (e) {
          var $prev;
          e.target, this.$control_input[0];
          if (this.isLocked) 9 !== e.keyCode && e.preventDefault();
          else {
            switch (e.keyCode) {
              case 65:
                if (this.isCmdDown) return void this.selectAll();
                break;
              case 27:
                return void (
                  this.isOpen &&
                  (e.preventDefault(), e.stopPropagation(), this.close())
                );
              case 78:
                if (!e.ctrlKey || e.altKey) break;
              case 40:
                return (
                  !this.isOpen && this.hasOptions
                    ? this.open()
                    : this.$activeOption &&
                      ((this.ignoreHover = !0),
                      ($prev = this.getAdjacentOption(this.$activeOption, 1))
                        .length && this.setActiveOption($prev, !0, !0)),
                  void e.preventDefault()
                );
              case 80:
                if (!e.ctrlKey || e.altKey) break;
              case 38:
                return (
                  this.$activeOption &&
                    ((this.ignoreHover = !0),
                    ($prev = this.getAdjacentOption(this.$activeOption, -1))
                      .length && this.setActiveOption($prev, !0, !0)),
                  void e.preventDefault()
                );
              case 13:
                return void (
                  this.isOpen &&
                  this.$activeOption &&
                  (this.onOptionSelect({ currentTarget: this.$activeOption }),
                  e.preventDefault())
                );
              case 37:
                return void this.advanceSelection(-1, e);
              case 39:
                return void this.advanceSelection(1, e);
              case 9:
                return (
                  this.settings.selectOnTab &&
                    this.isOpen &&
                    this.$activeOption &&
                    (this.onOptionSelect({ currentTarget: this.$activeOption }),
                    this.isFull() || e.preventDefault()),
                  void (
                    this.settings.create &&
                    this.createItem() &&
                    this.settings.showAddOptionOnCreate &&
                    e.preventDefault()
                  )
                );
              case 8:
              case 46:
                return void this.deleteSelection(e);
            }
            (!this.isFull() && !this.isInputHidden) ||
              (IS_MAC ? e.metaKey : e.ctrlKey) ||
              e.preventDefault();
          }
        },
        onKeyUp: function (value) {
          if (this.isLocked) return value && value.preventDefault();
          value = this.$control_input.val() || "";
          this.lastValue !== value &&
            ((this.lastValue = value),
            this.onSearchChange(value),
            this.refreshOptions(),
            this.trigger("type", value));
        },
        onSearchChange: function (value) {
          var self = this,
            fn = self.settings.load;
          fn &&
            (self.loadedSearches.hasOwnProperty(value) ||
              ((self.loadedSearches[value] = !0),
              self.load(function (callback) {
                fn.apply(self, [value, callback]);
              })));
        },
        onFocus: function (e) {
          var wasFocused = this.isFocused;
          if (this.isDisabled) return this.blur(), e && e.preventDefault(), !1;
          this.ignoreFocus ||
            ((this.isFocused = !0),
            "focus" === this.settings.preload && this.onSearchChange(""),
            wasFocused || this.trigger("focus"),
            this.$activeItems.length ||
              (this.showInput(),
              this.setActiveItem(null),
              this.refreshOptions(!!this.settings.openOnFocus)),
            this.refreshState());
        },
        onBlur: function (deactivate, dest) {
          var self = this;
          if (self.isFocused && ((self.isFocused = !1), !self.ignoreFocus)) {
            if (
              !self.ignoreBlur &&
              document.activeElement === self.$dropdown_content[0]
            )
              return (self.ignoreBlur = !0), void self.onFocus(deactivate);
            deactivate = function () {
              self.close(),
                self.setTextboxValue(""),
                self.setActiveItem(null),
                self.setActiveOption(null),
                self.setCaret(self.items.length),
                self.refreshState(),
                dest && dest.focus && dest.focus(),
                (self.isBlurring = !1),
                (self.ignoreFocus = !1),
                self.trigger("blur");
            };
            (self.isBlurring = !0),
              (self.ignoreFocus = !0),
              self.settings.create && self.settings.createOnBlur
                ? self.createItem(null, !1, deactivate)
                : deactivate();
          }
        },
        onOptionHover: function (e) {
          this.ignoreHover || this.setActiveOption(e.currentTarget, !1);
        },
        onOptionSelect: function (e) {
          var value,
            self = this;
          e.preventDefault && (e.preventDefault(), e.stopPropagation()),
            (value = $(e.currentTarget)).hasClass("create")
              ? self.createItem(null, function () {
                  self.settings.closeAfterSelect && self.close();
                })
              : void 0 !== (value = value.attr("data-value")) &&
                ((self.lastQuery = null),
                self.setTextboxValue(""),
                self.addItem(value),
                self.settings.closeAfterSelect
                  ? self.close()
                  : !self.settings.hideSelected &&
                    e.type &&
                    /mouse/.test(e.type) &&
                    self.setActiveOption(self.getOption(value)));
        },
        onItemSelect: function (e) {
          this.isLocked ||
            ("multi" === this.settings.mode &&
              (e.preventDefault(), this.setActiveItem(e.currentTarget, e)));
        },
        load: function (fn) {
          var self = this,
            $wrapper = self.$wrapper.addClass(self.settings.loadingClass);
          self.loading++,
            fn.apply(self, [
              function (results) {
                (self.loading = Math.max(self.loading - 1, 0)),
                  results &&
                    results.length &&
                    (self.addOption(results),
                    self.refreshOptions(self.isFocused && !self.isInputHidden)),
                  self.loading ||
                    $wrapper.removeClass(self.settings.loadingClass),
                  self.trigger("load", results);
              },
            ]);
        },
        getTextboxValue: function () {
          return this.$control_input.val();
        },
        setTextboxValue: function (value) {
          var $input = this.$control_input;
          $input.val() !== value &&
            ($input.val(value).triggerHandler("update"),
            (this.lastValue = value));
        },
        getValue: function () {
          return 1 === this.tagType && this.$input.attr("multiple")
            ? this.items
            : this.items.join(this.settings.delimiter);
        },
        setValue: function (value, silent) {
          debounce_events(this, silent ? [] : ["change"], function () {
            this.clear(silent), this.addItems(value, silent);
          });
        },
        setMaxItems: function (value) {
          (this.settings.maxItems = value = 0 === value ? null : value),
            (this.settings.mode =
              this.settings.mode ||
              (1 === this.settings.maxItems ? "single" : "multi")),
            this.refreshState();
        },
        setActiveItem: function ($item, e) {
          var i, idx, begin, end, item, swap;
          if ("single" !== this.settings.mode) {
            if (!($item = $($item)).length)
              return (
                $(this.$activeItems).removeClass("active"),
                (this.$activeItems = []),
                void (this.isFocused && this.showInput())
              );
            if (
              "mousedown" === (idx = e && e.type.toLowerCase()) &&
              this.isShiftDown &&
              this.$activeItems.length
            ) {
              for (
                swap = this.$control.children(".active:last"),
                  begin = Array.prototype.indexOf.apply(
                    this.$control[0].childNodes,
                    [swap[0]]
                  ),
                  (end = Array.prototype.indexOf.apply(
                    this.$control[0].childNodes,
                    [$item[0]]
                  )) < begin && ((swap = begin), (begin = end), (end = swap)),
                  i = begin;
                i <= end;
                i++
              )
                (item = this.$control[0].childNodes[i]),
                  -1 === this.$activeItems.indexOf(item) &&
                    ($(item).addClass("active"), this.$activeItems.push(item));
              e.preventDefault();
            } else
              ("mousedown" === idx && this.isCtrlDown) ||
              ("keydown" === idx && this.isShiftDown)
                ? $item.hasClass("active")
                  ? ((idx = this.$activeItems.indexOf($item[0])),
                    this.$activeItems.splice(idx, 1),
                    $item.removeClass("active"))
                  : this.$activeItems.push($item.addClass("active")[0])
                : ($(this.$activeItems).removeClass("active"),
                  (this.$activeItems = [$item.addClass("active")[0]]));
            this.hideInput(), this.isFocused || this.focus();
          }
        },
        setActiveOption: function (scroll_bottom, scroll, animate) {
          var height_menu, height_item, y, scroll_top;
          this.$activeOption &&
            (this.$activeOption.removeClass("active"),
            this.trigger(
              "dropdown_item_deactivate",
              this.$activeOption.attr("data-value")
            )),
            (this.$activeOption = null),
            (scroll_bottom = $(scroll_bottom)).length &&
              ((this.$activeOption = scroll_bottom.addClass("active")),
              this.isOpen &&
                this.trigger(
                  "dropdown_item_activate",
                  this.$activeOption.attr("data-value")
                ),
              (!scroll && isset(scroll)) ||
                ((height_menu = this.$dropdown_content.height()),
                (height_item = this.$activeOption.outerHeight(!0)),
                (scroll = this.$dropdown_content.scrollTop() || 0),
                (scroll_bottom =
                  (scroll_top = y =
                    this.$activeOption.offset().top -
                    this.$dropdown_content.offset().top +
                    scroll) -
                  height_menu +
                  height_item),
                height_menu + scroll < y + height_item
                  ? this.$dropdown_content
                      .stop()
                      .animate(
                        { scrollTop: scroll_bottom },
                        animate ? this.settings.scrollDuration : 0
                      )
                  : y < scroll &&
                    this.$dropdown_content
                      .stop()
                      .animate(
                        { scrollTop: scroll_top },
                        animate ? this.settings.scrollDuration : 0
                      )));
        },
        selectAll: function () {
          "single" !== this.settings.mode &&
            ((this.$activeItems = Array.prototype.slice.apply(
              this.$control.children(":not(input)").addClass("active")
            )),
            this.$activeItems.length && (this.hideInput(), this.close()),
            this.focus());
        },
        hideInput: function () {
          this.setTextboxValue(""),
            this.$control_input.css({
              opacity: 0,
              position: "absolute",
              left: this.rtl ? 1e4 : -1e4,
            }),
            (this.isInputHidden = !0);
        },
        showInput: function () {
          this.$control_input.css({
            opacity: 1,
            position: "relative",
            left: 0,
          }),
            (this.isInputHidden = !1);
        },
        focus: function () {
          var self = this;
          return (
            self.isDisabled ||
              ((self.ignoreFocus = !0),
              self.$control_input[0].focus(),
              window.setTimeout(function () {
                (self.ignoreFocus = !1), self.onFocus();
              }, 0)),
            self
          );
        },
        blur: function (dest) {
          return this.$control_input[0].blur(), this.onBlur(null, dest), this;
        },
        getScoreFunction: function (query) {
          return this.sifter.getScoreFunction(query, this.getSearchOptions());
        },
        getSearchOptions: function () {
          var settings = this.settings,
            sort = settings.sortField;
          return {
            fields: settings.searchField,
            conjunction: settings.searchConjunction,
            sort: (sort = "string" == typeof sort ? [{ field: sort }] : sort),
            nesting: settings.nesting,
          };
        },
        search: function (query) {
          var i,
            result,
            calculateScore,
            settings = this.settings,
            options = this.getSearchOptions();
          if (
            settings.score &&
            "function" !=
              typeof (calculateScore = this.settings.score.apply(this, [query]))
          )
            throw new Error(
              'Selectize "score" setting must be a function that returns a function'
            );
          if (
            (query !== this.lastQuery
              ? ((this.lastQuery = query),
                (result = this.sifter.search(
                  query,
                  $.extend(options, { score: calculateScore })
                )),
                (this.currentResults = result))
              : (result = $.extend(!0, {}, this.currentResults)),
            settings.hideSelected)
          )
            for (i = result.items.length - 1; 0 <= i; i--)
              -1 !== this.items.indexOf(hash_key(result.items[i].id)) &&
                result.items.splice(i, 1);
          return result;
        },
        refreshOptions: function (triggerDropdown) {
          var i,
            j,
            k,
            groups,
            groups_order,
            option,
            option_html,
            optgroup,
            optgroups,
            html,
            html_children,
            has_create_option,
            $active,
            $create;
          void 0 === triggerDropdown && (triggerDropdown = !0);
          var d,
            tmp,
            self = this,
            query = self.$control_input.val().trim(),
            results = self.search(query),
            $dropdown_content = self.$dropdown_content,
            $active_before =
              self.$activeOption &&
              hash_key(self.$activeOption.attr("data-value")),
            n = results.items.length;
          for (
            "number" == typeof self.settings.maxOptions &&
              (n = Math.min(n, self.settings.maxOptions)),
              groups = {},
              groups_order = [],
              i = 0;
            i < n;
            i++
          )
            for (
              option = self.options[results.items[i].id],
                option_html = self.render("option", option),
                optgroup = option[self.settings.optgroupField] || "",
                j = 0,
                k =
                  (optgroups = Array.isArray(optgroup)
                    ? optgroup
                    : [optgroup]) && optgroups.length;
              j < k;
              j++
            )
              (optgroup = optgroups[j]),
                self.optgroups.hasOwnProperty(optgroup) || (optgroup = ""),
                groups.hasOwnProperty(optgroup) ||
                  ((groups[optgroup] = document.createDocumentFragment()),
                  groups_order.push(optgroup)),
                groups[optgroup].appendChild(option_html);
          for (
            this.settings.lockOptgroupOrder &&
              groups_order.sort(function (a, b) {
                return (
                  ((self.optgroups[a] && self.optgroups[a].$order) || 0) -
                  ((self.optgroups[b] && self.optgroups[b].$order) || 0)
                );
              }),
              html = document.createDocumentFragment(),
              i = 0,
              n = groups_order.length;
            i < n;
            i++
          )
            (optgroup = groups_order[i]),
              self.optgroups.hasOwnProperty(optgroup) &&
              groups[optgroup].childNodes.length
                ? ((html_children =
                    document.createDocumentFragment()).appendChild(
                    self.render("optgroup_header", self.optgroups[optgroup])
                  ),
                  html_children.appendChild(groups[optgroup]),
                  html.appendChild(
                    self.render(
                      "optgroup",
                      $.extend({}, self.optgroups[optgroup], {
                        html:
                          ((d = html_children),
                          (tmp = void 0),
                          (tmp = document.createElement("div")).appendChild(
                            d.cloneNode(!0)
                          ),
                          tmp.innerHTML),
                        dom: html_children,
                      })
                    )
                  ))
                : html.appendChild(groups[optgroup]);
          if (
            ($dropdown_content.html(html),
            self.settings.highlight &&
              ($dropdown_content.removeHighlight(),
              results.query.length && results.tokens.length))
          )
            for (i = 0, n = results.tokens.length; i < n; i++)
              !(function ($element, pattern) {
                if ("string" != typeof pattern || pattern.length) {
                  var regex =
                      "string" == typeof pattern
                        ? new RegExp(pattern, "i")
                        : pattern,
                    highlight = function (node) {
                      var skip = 0;
                      if (3 === node.nodeType) {
                        var spannode,
                          middleclone,
                          middlebit = node.data.search(regex);
                        0 <= middlebit &&
                          0 < node.data.length &&
                          ((middleclone = node.data.match(regex)),
                          ((spannode =
                            document.createElement("span")).className =
                            "highlight"),
                          (middlebit = node.splitText(middlebit)).splitText(
                            middleclone[0].length
                          ),
                          (middleclone = middlebit.cloneNode(!0)),
                          spannode.appendChild(middleclone),
                          middlebit.parentNode.replaceChild(
                            spannode,
                            middlebit
                          ),
                          (skip = 1));
                      } else if (
                        1 === node.nodeType &&
                        node.childNodes &&
                        !/(script|style)/i.test(node.tagName) &&
                        ("highlight" !== node.className ||
                          "SPAN" !== node.tagName)
                      )
                        for (var i = 0; i < node.childNodes.length; ++i)
                          i += highlight(node.childNodes[i]);
                      return skip;
                    };
                  $element.each(function () {
                    highlight(this);
                  });
                }
              })($dropdown_content, results.tokens[i].regex);
          if (!self.settings.hideSelected)
            for (
              self.$dropdown.find(".selected").removeClass("selected"),
                i = 0,
                n = self.items.length;
              i < n;
              i++
            )
              self.getOption(self.items[i]).addClass("selected");
          (has_create_option = self.canCreate(query)) &&
            self.settings.showAddOptionOnCreate &&
            ($dropdown_content.prepend(
              self.render("option_create", { input: query })
            ),
            ($create = $($dropdown_content[0].childNodes[0]))),
            (self.hasOptions =
              0 < results.items.length ||
              (has_create_option && self.settings.showAddOptionOnCreate)),
            self.hasOptions
              ? (0 < results.items.length
                  ? (($active_before =
                      $active_before && self.getOption($active_before)),
                    "" !== results.query &&
                    $active_before &&
                    $active_before.length
                      ? ($active = $active_before)
                      : "single" === self.settings.mode &&
                        self.items.length &&
                        ($active = self.getOption(self.items[0])),
                    ($active && $active.length) ||
                      ($active =
                        $create && !self.settings.addPrecedence
                          ? self.getAdjacentOption($create, 1)
                          : $dropdown_content.find("[data-selectable]:first")))
                  : ($active = $create),
                self.setActiveOption($active),
                triggerDropdown && !self.isOpen && self.open())
              : (self.setActiveOption(null),
                triggerDropdown && self.isOpen && self.close());
        },
        addOption: function (data) {
          var i, n, value;
          if (Array.isArray(data))
            for (i = 0, n = data.length; i < n; i++) this.addOption(data[i]);
          else
            (value = this.registerOption(data)) &&
              ((this.userOptions[value] = !0),
              (this.lastQuery = null),
              this.trigger("option_add", value, data));
        },
        registerOption: function (data) {
          var key = hash_key(data[this.settings.valueField]);
          return (
            null != key &&
            !this.options.hasOwnProperty(key) &&
            ((data.$order = data.$order || ++this.order),
            (this.options[key] = data),
            key)
          );
        },
        registerOptionGroup: function (data) {
          var key = hash_key(data[this.settings.optgroupValueField]);
          return (
            !!key &&
            ((data.$order = data.$order || ++this.order),
            (this.optgroups[key] = data),
            key)
          );
        },
        addOptionGroup: function (id, data) {
          (data[this.settings.optgroupValueField] = id),
            (id = this.registerOptionGroup(data)) &&
              this.trigger("optgroup_add", id, data);
        },
        removeOptionGroup: function (id) {
          this.optgroups.hasOwnProperty(id) &&
            (delete this.optgroups[id],
            (this.renderCache = {}),
            this.trigger("optgroup_remove", id));
        },
        clearOptionGroups: function () {
          (this.optgroups = {}),
            (this.renderCache = {}),
            this.trigger("optgroup_clear");
        },
        updateOption: function ($item, $item_new) {
          var value_new, cache_items, cache_options;
          if (
            (($item = hash_key($item)),
            (value_new = hash_key($item_new[this.settings.valueField])),
            null !== $item && this.options.hasOwnProperty($item))
          ) {
            if ("string" != typeof value_new)
              throw new Error("Value must be set in option data");
            (cache_options = this.options[$item].$order),
              value_new !== $item &&
                (delete this.options[$item],
                -1 !== (cache_items = this.items.indexOf($item)) &&
                  this.items.splice(cache_items, 1, value_new)),
              ($item_new.$order = $item_new.$order || cache_options),
              (this.options[value_new] = $item_new),
              (cache_items = this.renderCache.item),
              (cache_options = this.renderCache.option),
              cache_items &&
                (delete cache_items[$item], delete cache_items[value_new]),
              cache_options &&
                (delete cache_options[$item], delete cache_options[value_new]),
              -1 !== this.items.indexOf(value_new) &&
                (($item = this.getItem($item)),
                ($item_new = $(this.render("item", $item_new))),
                $item.hasClass("active") && $item_new.addClass("active"),
                $item.replaceWith($item_new)),
              (this.lastQuery = null),
              this.isOpen && this.refreshOptions(!1);
          }
        },
        removeOption: function (value, silent) {
          value = hash_key(value);
          var cache_items = this.renderCache.item,
            cache_options = this.renderCache.option;
          cache_items && delete cache_items[value],
            cache_options && delete cache_options[value],
            delete this.userOptions[value],
            delete this.options[value],
            (this.lastQuery = null),
            this.trigger("option_remove", value),
            this.removeItem(value, silent);
        },
        clearOptions: function (silent) {
          var self = this;
          (self.loadedSearches = {}),
            (self.userOptions = {}),
            (self.renderCache = {});
          var options = self.options;
          $.each(self.options, function (key, value) {
            -1 == self.items.indexOf(key) && delete options[key];
          }),
            (self.options = self.sifter.items = options),
            (self.lastQuery = null),
            self.trigger("option_clear"),
            self.clear(silent);
        },
        getOption: function (value) {
          return this.getElementWithValue(
            value,
            this.$dropdown_content.find("[data-selectable]")
          );
        },
        getFirstOption: function () {
          var $options = this.$dropdown.find("[data-selectable]");
          return 0 < $options.length ? $options.eq(0) : $();
        },
        getAdjacentOption: function ($option, index) {
          var $options = this.$dropdown.find("[data-selectable]"),
            index = $options.index($option) + index;
          return 0 <= index && index < $options.length
            ? $options.eq(index)
            : $();
        },
        getElementWithValue: function (value, $els) {
          if (null != (value = hash_key(value)))
            for (var i = 0, n = $els.length; i < n; i++)
              if ($els[i].getAttribute("data-value") === value)
                return $($els[i]);
          return $();
        },
        getElementWithTextContent: function (textContent, ignoreCase, $els) {
          if (null != (textContent = hash_key(textContent)))
            for (var i = 0, n = $els.length; i < n; i++) {
              var eleTextContent = $els[i].textContent;
              if (
                (1 == ignoreCase &&
                  ((eleTextContent =
                    null !== eleTextContent
                      ? eleTextContent.toLowerCase()
                      : null),
                  (textContent = textContent.toLowerCase())),
                eleTextContent === textContent)
              )
                return $($els[i]);
            }
          return $();
        },
        getItem: function (value) {
          return this.getElementWithValue(value, this.$control.children());
        },
        getFirstItemMatchedByTextContent: function (textContent, ignoreCase) {
          return this.getElementWithTextContent(
            textContent,
            (ignoreCase = null !== ignoreCase && !0 === ignoreCase),
            this.$dropdown_content.find("[data-selectable]")
          );
        },
        addItems: function (control, silent) {
          this.buffer = document.createDocumentFragment();
          for (
            var childNodes = this.$control[0].childNodes, i = 0;
            i < childNodes.length;
            i++
          )
            this.buffer.appendChild(childNodes[i]);
          for (
            var items = Array.isArray(control) ? control : [control],
              i = 0,
              n = items.length;
            i < n;
            i++
          )
            (this.isPending = i < n - 1), this.addItem(items[i], silent);
          control = this.$control[0];
          control.insertBefore(this.buffer, control.firstChild),
            (this.buffer = null);
        },
        addItem: function (value, silent) {
          debounce_events(this, silent ? [] : ["change"], function () {
            var $item,
              $options,
              value_next,
              inputMode = this.settings.mode;
            (value = hash_key(value)),
              -1 === this.items.indexOf(value)
                ? this.options.hasOwnProperty(value) &&
                  ("single" === inputMode && this.clear(silent),
                  ("multi" === inputMode && this.isFull()) ||
                    (($item = $(this.render("item", this.options[value]))),
                    (value_next = this.isFull()),
                    this.items.splice(this.caretPos, 0, value),
                    this.insertAtCaret($item),
                    (this.isPending && (value_next || !this.isFull())) ||
                      this.refreshState(),
                    this.isSetup &&
                      (($options =
                        this.$dropdown_content.find("[data-selectable]")),
                      this.isPending ||
                        ((value_next = this.getOption(value)),
                        (value_next = this.getAdjacentOption(
                          value_next,
                          1
                        ).attr("data-value")),
                        this.refreshOptions(
                          this.isFocused && "single" !== inputMode
                        ),
                        value_next &&
                          this.setActiveOption(this.getOption(value_next))),
                      !$options.length || this.isFull()
                        ? this.close()
                        : this.isPending || this.positionDropdown(),
                      this.updatePlaceholder(),
                      this.trigger("item_add", value, $item),
                      this.isPending ||
                        this.updateOriginalInput({ silent: silent }))))
                : "single" === inputMode && this.close();
          });
        },
        removeItem: function (value, silent) {
          var i,
            idx,
            $item = value instanceof $ ? value : this.getItem(value);
          (value = hash_key($item.attr("data-value"))),
            -1 !== (i = this.items.indexOf(value)) &&
              (this.trigger("item_before_remove", value, $item),
              $item.remove(),
              $item.hasClass("active") &&
                ((idx = this.$activeItems.indexOf($item[0])),
                this.$activeItems.splice(idx, 1)),
              this.items.splice(i, 1),
              (this.lastQuery = null),
              !this.settings.persist &&
                this.userOptions.hasOwnProperty(value) &&
                this.removeOption(value, silent),
              i < this.caretPos && this.setCaret(this.caretPos - 1),
              this.refreshState(),
              this.updatePlaceholder(),
              this.updateOriginalInput({ silent: silent }),
              this.positionDropdown(),
              this.trigger("item_remove", value, $item));
        },
        createItem: function (output, triggerDropdown) {
          var self = this,
            caret = self.caretPos;
          output = output || (self.$control_input.val() || "").trim();
          var callback = arguments[arguments.length - 1];
          if (
            ("function" != typeof callback && (callback = function () {}),
            "boolean" != typeof triggerDropdown && (triggerDropdown = !0),
            !self.canCreate(output))
          )
            return callback(), !1;
          self.lock();
          var fn,
            called,
            setup =
              "function" == typeof self.settings.create
                ? this.settings.create
                : function (key) {
                    var data = {},
                      key = (data[self.settings.labelField] = key);
                    if (
                      self.settings.formatValueToKey &&
                      "function" == typeof self.settings.formatValueToKey &&
                      (null ==
                        (key = self.settings.formatValueToKey.apply(this, [
                          key,
                        ])) ||
                        "object" == typeof key ||
                        "function" == typeof key)
                    )
                      throw new Error(
                        'Selectize "formatValueToKey" setting must be a function that returns a value other than object or function.'
                      );
                    return (data[self.settings.valueField] = key), data;
                  },
            create =
              ((called = !(fn = function (data) {
                if ((self.unlock(), !data || "object" != typeof data))
                  return callback();
                var value = hash_key(data[self.settings.valueField]);
                if ("string" != typeof value) return callback();
                self.setTextboxValue(""),
                  self.addOption(data),
                  self.setCaret(caret),
                  self.addItem(value),
                  self.refreshOptions(
                    triggerDropdown && "single" !== self.settings.mode
                  ),
                  callback(data);
              })),
              function () {
                called || ((called = !0), fn.apply(this, arguments));
              }),
            output = setup.apply(this, [output, create]);
          return void 0 !== output && create(output), !0;
        },
        refreshItems: function () {
          (this.lastQuery = null),
            this.isSetup && this.addItem(this.items),
            this.refreshState(),
            this.updateOriginalInput();
        },
        refreshState: function () {
          this.refreshValidityState(), this.refreshClasses();
        },
        refreshValidityState: function () {
          if (!this.isRequired) return !1;
          var invalid = !this.items.length;
          (this.isInvalid = invalid),
            this.$control_input.prop("required", invalid),
            this.$input.prop("required", !invalid);
        },
        refreshClasses: function () {
          var isFull = this.isFull(),
            isLocked = this.isLocked;
          this.$wrapper.toggleClass("rtl", this.rtl),
            this.$control
              .toggleClass("focus", this.isFocused)
              .toggleClass("disabled", this.isDisabled)
              .toggleClass("required", this.isRequired)
              .toggleClass("invalid", this.isInvalid)
              .toggleClass("locked", isLocked)
              .toggleClass("full", isFull)
              .toggleClass("not-full", !isFull)
              .toggleClass(
                "input-active",
                this.isFocused && !this.isInputHidden
              )
              .toggleClass("dropdown-active", this.isOpen)
              .toggleClass("has-options", !$.isEmptyObject(this.options))
              .toggleClass("has-items", 0 < this.items.length),
            this.$control_input.data("grow", !isFull && !isLocked);
        },
        isFull: function () {
          return (
            null !== this.settings.maxItems &&
            this.items.length >= this.settings.maxItems
          );
        },
        updateOriginalInput: function (opts) {
          var i, n, options, label;
          if (((opts = opts || {}), 1 === this.tagType)) {
            for (options = [], i = 0, n = this.items.length; i < n; i++)
              (label =
                this.options[this.items[i]][this.settings.labelField] || ""),
                options.push(
                  '<option value="' +
                    escape_html(this.items[i]) +
                    '" selected="selected">' +
                    escape_html(label) +
                    "</option>"
                );
            options.length ||
              this.$input.attr("multiple") ||
              options.push('<option value="" selected="selected"></option>'),
              this.$input.html(options.join(""));
          } else
            this.$input.val(this.getValue()),
              this.$input.attr("value", this.$input.val());
          this.isSetup &&
            (opts.silent || this.trigger("change", this.$input.val()));
        },
        updatePlaceholder: function () {
          var $input;
          this.settings.placeholder &&
            (($input = this.$control_input),
            this.items.length
              ? $input.removeAttr("placeholder")
              : $input.attr("placeholder", this.settings.placeholder),
            $input.triggerHandler("update", { force: !0 }));
        },
        open: function () {
          this.isLocked ||
            this.isOpen ||
            ("multi" === this.settings.mode && this.isFull()) ||
            (this.focus(),
            (this.isOpen = !0),
            this.refreshState(),
            this.$dropdown.css({ visibility: "hidden", display: "block" }),
            this.positionDropdown(),
            this.$dropdown.css({ visibility: "visible" }),
            this.trigger("dropdown_open", this.$dropdown));
        },
        close: function () {
          var trigger = this.isOpen;
          "single" === this.settings.mode &&
            this.items.length &&
            (this.hideInput(), this.isBlurring && this.$control_input.blur()),
            (this.isOpen = !1),
            this.$dropdown.hide(),
            this.setActiveOption(null),
            this.refreshState(),
            trigger && this.trigger("dropdown_close", this.$dropdown);
        },
        positionDropdown: function () {
          var $control = this.$control,
            offset =
              "body" === this.settings.dropdownParent
                ? $control.offset()
                : $control.position();
          (offset.top += $control.outerHeight(!0)),
            this.$dropdown.css({
              width: $control[0].getBoundingClientRect().width,
              top: offset.top,
              left: offset.left,
            });
        },
        clear: function (silent) {
          this.items.length &&
            (this.$control.children(":not(input)").remove(),
            (this.items = []),
            (this.lastQuery = null),
            this.setCaret(0),
            this.setActiveItem(null),
            this.updatePlaceholder(),
            this.updateOriginalInput({ silent: silent }),
            this.refreshState(),
            this.showInput(),
            this.trigger("clear"));
        },
        insertAtCaret: function (target) {
          var caret = Math.min(this.caretPos, this.items.length),
            el = target[0],
            target = this.buffer || this.$control[0];
          0 === caret
            ? target.insertBefore(el, target.firstChild)
            : target.insertBefore(el, target.childNodes[caret]),
            this.setCaret(caret + 1);
        },
        deleteSelection: function (e) {
          var i,
            n,
            values,
            option_select,
            $option_select,
            caret,
            direction = e && 8 === e.keyCode ? -1 : 1,
            selection = getSelection(this.$control_input[0]);
          if (
            (this.$activeOption &&
              !this.settings.hideSelected &&
              (option_select = (
                "string" == typeof this.settings.deselectBehavior &&
                "top" === this.settings.deselectBehavior
                  ? this.getFirstOption()
                  : this.getAdjacentOption(this.$activeOption, -1)
              ).attr("data-value")),
            (values = []),
            this.$activeItems.length)
          ) {
            for (
              caret = this.$control.children(
                ".active:" + (0 < direction ? "last" : "first")
              ),
                caret = this.$control.children(":not(input)").index(caret),
                0 < direction && caret++,
                i = 0,
                n = this.$activeItems.length;
              i < n;
              i++
            )
              values.push($(this.$activeItems[i]).attr("data-value"));
            e && (e.preventDefault(), e.stopPropagation());
          } else
            (this.isFocused || "single" === this.settings.mode) &&
              this.items.length &&
              (direction < 0 && 0 === selection.start && 0 === selection.length
                ? values.push(this.items[this.caretPos - 1])
                : 0 < direction &&
                  selection.start === this.$control_input.val().length &&
                  values.push(this.items[this.caretPos]));
          if (
            !values.length ||
            ("function" == typeof this.settings.onDelete &&
              !1 === this.settings.onDelete.apply(this, [values]))
          )
            return !1;
          for (void 0 !== caret && this.setCaret(caret); values.length; )
            this.removeItem(values.pop());
          return (
            this.showInput(),
            this.positionDropdown(),
            this.refreshOptions(!0),
            option_select &&
              ($option_select = this.getOption(option_select)).length &&
              this.setActiveOption($option_select),
            !0
          );
        },
        advanceSelection: function (direction, e) {
          var selection, valueLength, idx;
          0 !== direction &&
            (this.rtl && (direction *= -1),
            (idx = 0 < direction ? "last" : "first"),
            (selection = getSelection(this.$control_input[0])),
            this.isFocused && !this.isInputHidden
              ? ((valueLength = this.$control_input.val().length),
                (direction < 0
                  ? 0 !== selection.start || 0 !== selection.length
                  : selection.start !== valueLength) ||
                  valueLength ||
                  this.advanceCaret(direction, e))
              : (idx = this.$control.children(".active:" + idx)).length &&
                ((idx = this.$control.children(":not(input)").index(idx)),
                this.setActiveItem(null),
                this.setCaret(0 < direction ? idx + 1 : idx)));
        },
        advanceCaret: function (direction, e) {
          var $adj;
          0 !== direction &&
            (this.isShiftDown
              ? ($adj = this.$control_input[0 < direction ? "next" : "prev"]())
                  .length &&
                (this.hideInput(),
                this.setActiveItem($adj),
                e && e.preventDefault())
              : this.setCaret(this.caretPos + direction));
        },
        setCaret: function (i) {
          if (
            ((i =
              "single" === this.settings.mode
                ? this.items.length
                : Math.max(0, Math.min(this.items.length, i))),
            !this.isPending)
          )
            for (
              var $child,
                $children = this.$control.children(":not(input)"),
                j = 0,
                n = $children.length;
              j < n;
              j++
            )
              ($child = $($children[j]).detach()),
                j < i
                  ? this.$control_input.before($child)
                  : this.$control.append($child);
          this.caretPos = i;
        },
        lock: function () {
          this.close(), (this.isLocked = !0), this.refreshState();
        },
        unlock: function () {
          (this.isLocked = !1), this.refreshState();
        },
        disable: function () {
          this.$input.prop("disabled", !0),
            this.$control_input.prop("disabled", !0).prop("tabindex", -1),
            (this.isDisabled = !0),
            this.lock();
        },
        enable: function () {
          this.$input.prop("disabled", !1),
            this.$control_input
              .prop("disabled", !1)
              .prop("tabindex", this.tabIndex),
            (this.isDisabled = !1),
            this.unlock();
        },
        destroy: function () {
          var eventNS = this.eventNS,
            revertSettings = this.revertSettings;
          this.trigger("destroy"),
            this.off(),
            this.$wrapper.remove(),
            this.$dropdown.remove(),
            this.$input
              .html("")
              .append(revertSettings.$children)
              .removeAttr("tabindex")
              .removeClass("selectized")
              .attr({ tabindex: revertSettings.tabindex })
              .show(),
            this.$control_input.removeData("grow"),
            this.$input.removeData("selectize"),
            0 == --Selectize.count &&
              Selectize.$testInput &&
              (Selectize.$testInput.remove(), (Selectize.$testInput = void 0)),
            $(window).off(eventNS),
            $(document).off(eventNS),
            $(document.body).off(eventNS),
            delete this.$input[0].selectize;
        },
        render: function (templateName, data) {
          var value,
            id,
            html = "",
            cache = !1;
          return (cache =
            "option" === templateName || "item" === templateName
              ? !!(value = hash_key(data[this.settings.valueField]))
              : cache) &&
            (isset(this.renderCache[templateName]) ||
              (this.renderCache[templateName] = {}),
            this.renderCache[templateName].hasOwnProperty(value))
            ? this.renderCache[templateName][value]
            : ((html = $(
                this.settings.render[templateName].apply(this, [
                  data,
                  escape_html,
                ])
              )),
              "option" === templateName || "option_create" === templateName
                ? data[this.settings.disabledField] ||
                  html.attr("data-selectable", "")
                : "optgroup" === templateName &&
                  ((id = data[this.settings.optgroupValueField] || ""),
                  html.attr("data-group", id),
                  data[this.settings.disabledField] &&
                    html.attr("data-disabled", "")),
              ("option" !== templateName && "item" !== templateName) ||
                html.attr("data-value", value || ""),
              cache && (this.renderCache[templateName][value] = html[0]),
              html[0]);
        },
        clearCache: function (templateName) {
          void 0 === templateName
            ? (this.renderCache = {})
            : delete this.renderCache[templateName];
        },
        canCreate: function (input) {
          if (!this.settings.create) return !1;
          var filter = this.settings.createFilter;
          return (
            input.length &&
            ("function" != typeof filter || filter.apply(this, [input])) &&
            ("string" != typeof filter || new RegExp(filter).test(input)) &&
            (!(filter instanceof RegExp) || filter.test(input))
          );
        },
      }),
      (Selectize.count = 0),
      (Selectize.defaults = {
        options: [],
        optgroups: [],
        plugins: [],
        delimiter: ",",
        splitOn: null,
        persist: !0,
        diacritics: !0,
        create: !1,
        showAddOptionOnCreate: !0,
        createOnBlur: !1,
        createFilter: null,
        highlight: !0,
        openOnFocus: !0,
        maxOptions: 1e3,
        maxItems: null,
        hideSelected: null,
        addPrecedence: !1,
        selectOnTab: !0,
        preload: !1,
        allowEmptyOption: !1,
        showEmptyOptionInDropdown: !1,
        emptyOptionLabel: "--",
        closeAfterSelect: !1,
        scrollDuration: 60,
        deselectBehavior: "previous",
        loadThrottle: 300,
        loadingClass: "loading",
        dataAttr: "data-data",
        optgroupField: "optgroup",
        valueField: "value",
        labelField: "text",
        disabledField: "disabled",
        optgroupLabelField: "label",
        optgroupValueField: "value",
        lockOptgroupOrder: !1,
        sortField: "$order",
        searchField: ["text"],
        searchConjunction: "and",
        mode: null,
        wrapperClass: "selectize-control",
        inputClass: "selectize-input",
        dropdownClass: "selectize-dropdown",
        dropdownContentClass: "selectize-dropdown-content",
        dropdownParent: null,
        copyClassesToDropdown: !0,
        render: {},
      }),
      ($.fn.selectize = function (settings_user) {
        function init_select($input, settings_element) {
          function readData(data) {
            return "string" ==
              typeof (data = attr_data && data.attr(attr_data)) && data.length
              ? JSON.parse(data)
              : null;
          }
          function addOption($option, group) {
            $option = $($option);
            var option,
              value = hash_key($option.val());
            (value || settings.allowEmptyOption) &&
              (optionsMap.hasOwnProperty(value)
                ? group &&
                  ((option = optionsMap[value][field_optgroup])
                    ? $.isArray(option)
                      ? option.push(group)
                      : (optionsMap[value][field_optgroup] = [option, group])
                    : (optionsMap[value][field_optgroup] = group))
                : (((option = readData($option) || {})[field_label] =
                    option[field_label] || $option.text()),
                  (option[field_value] = option[field_value] || value),
                  (option[field_disabled] =
                    option[field_disabled] || $option.prop("disabled")),
                  (option[field_optgroup] = option[field_optgroup] || group),
                  (optionsMap[value] = option),
                  options.push(option),
                  $option.is(":selected") &&
                    settings_element.items.push(value)));
          }
          var i,
            n,
            tagName,
            $children,
            options = settings_element.options,
            optionsMap = {};
          for (
            settings_element.maxItems = $input.attr("multiple") ? null : 1,
              i = 0,
              n = ($children = $input.children()).length;
            i < n;
            i++
          )
            "optgroup" === (tagName = $children[i].tagName.toLowerCase())
              ? (function ($optgroup) {
                  var i, n, id, optgroup, $options;
                  for (
                    (id = ($optgroup = $($optgroup)).attr("label")) &&
                      (((optgroup = readData($optgroup) || {})[
                        field_optgroup_label
                      ] = id),
                      (optgroup[field_optgroup_value] = id),
                      (optgroup[field_disabled] = $optgroup.prop("disabled")),
                      settings_element.optgroups.push(optgroup)),
                      i = 0,
                      n = ($options = $("option", $optgroup)).length;
                    i < n;
                    i++
                  )
                    addOption($options[i], id);
                })($children[i])
              : "option" === tagName && addOption($children[i]);
        }
        var defaults = $.fn.selectize.defaults,
          settings = $.extend({}, defaults, settings_user),
          attr_data = settings.dataAttr,
          field_label = settings.labelField,
          field_value = settings.valueField,
          field_disabled = settings.disabledField,
          field_optgroup = settings.optgroupField,
          field_optgroup_label = settings.optgroupLabelField,
          field_optgroup_value = settings.optgroupValueField;
        return this.each(function () {
          var $input, tag_name, input_html, settings_element;
          this.selectize ||
            (($input = $(this)),
            (tag_name = this.tagName.toLowerCase()),
            (settings_element =
              $input.attr("placeholder") || $input.attr("data-placeholder")) ||
              settings.allowEmptyOption ||
              (settings_element = $input.children('option[value=""]').text()),
            settings.allowEmptyOption &&
              settings.showEmptyOptionInDropdown &&
              !$input.children('option[value=""]').length &&
              ((input_html = $input.html()),
              $input.html(
                '<option value="">' +
                  settings.emptyOptionLabel +
                  "</option>" +
                  input_html
              )),
            ("select" === tag_name
              ? init_select
              : function (value, settings_element) {
                  var i,
                    n,
                    values,
                    option,
                    data_raw = value.attr(attr_data);
                  if (data_raw)
                    for (
                      settings_element.options = JSON.parse(data_raw),
                        i = 0,
                        n = settings_element.options.length;
                      i < n;
                      i++
                    )
                      settings_element.items.push(
                        settings_element.options[i][field_value]
                      );
                  else {
                    value = $.trim(value.val() || "");
                    if (settings.allowEmptyOption || value.length) {
                      for (
                        i = 0,
                          n = (values = value.split(settings.delimiter)).length;
                        i < n;
                        i++
                      )
                        ((option = {})[field_label] = values[i]),
                          (option[field_value] = values[i]),
                          settings_element.options.push(option);
                      settings_element.items = values;
                    }
                  }
                })(
              $input,
              (settings_element = {
                placeholder: settings_element,
                options: [],
                optgroups: [],
                items: [],
              })
            ),
            new Selectize(
              $input,
              $.extend(!0, {}, defaults, settings_element, settings_user)
            ));
        });
      }),
      ($.fn.selectize.defaults = Selectize.defaults),
      ($.fn.selectize.support = { validity: SUPPORTS_VALIDITY_API }),
      Selectize.define("auto_select_on_type", function (options) {
        var originalBlur,
          self = this;
        self.onBlur =
          ((originalBlur = self.onBlur),
          function (e) {
            var $matchedItem = self.getFirstItemMatchedByTextContent(
              self.lastValue,
              !0
            );
            return (
              void 0 !== $matchedItem.attr("data-value") &&
                self.getValue() !== $matchedItem.attr("data-value") &&
                self.setValue($matchedItem.attr("data-value")),
              originalBlur.apply(this, arguments)
            );
          });
      }),
      Selectize.define("autofill_disable", function (options) {
        var original,
          self = this;
        self.setup =
          ((original = self.setup),
          function () {
            original.apply(self, arguments),
              self.$control_input.attr({
                autocomplete: "new-password",
                autofill: "no",
              });
          });
      }),
      Selectize.define("drag_drop", function (options) {
        if (!$.fn.sortable)
          throw new Error(
            'The "drag_drop" plugin requires jQuery UI "sortable".'
          );
        var self, original;
        "multi" === this.settings.mode &&
          (((self = this).lock =
            ((original = self.lock),
            function () {
              var sortable = self.$control.data("sortable");
              return (
                sortable && sortable.disable(), original.apply(self, arguments)
              );
            })),
          (self.unlock = (function () {
            var original = self.unlock;
            return function () {
              var sortable = self.$control.data("sortable");
              return (
                sortable && sortable.enable(), original.apply(self, arguments)
              );
            };
          })()),
          (self.setup = (function () {
            var original = self.setup;
            return function () {
              original.apply(this, arguments);
              var $control = self.$control.sortable({
                items: "[data-value]",
                forcePlaceholderSize: !0,
                disabled: self.isLocked,
                start: function (e, ui) {
                  ui.placeholder.css("width", ui.helper.css("width")),
                    $control.css({ overflow: "visible" });
                },
                stop: function () {
                  $control.css({ overflow: "hidden" });
                  var active = self.$activeItems
                      ? self.$activeItems.slice()
                      : null,
                    values = [];
                  $control.children("[data-value]").each(function () {
                    values.push($(this).attr("data-value"));
                  }),
                    self.setValue(values),
                    self.setActiveItem(active);
                },
              });
            };
          })()));
      }),
      Selectize.define("dropdown_header", function (options) {
        var original,
          self = this;
        (options = $.extend(
          {
            title: "Untitled",
            headerClass: "selectize-dropdown-header",
            titleRowClass: "selectize-dropdown-header-title",
            labelClass: "selectize-dropdown-header-label",
            closeClass: "selectize-dropdown-header-close",
            html: function (data) {
              return (
                '<div class="' +
                data.headerClass +
                '"><div class="' +
                data.titleRowClass +
                '"><span class="' +
                data.labelClass +
                '">' +
                data.title +
                '</span><a href="javascript:void(0)" class="' +
                data.closeClass +
                '">&times;</a></div></div>'
              );
            },
          },
          options
        )),
          (self.setup =
            ((original = self.setup),
            function () {
              original.apply(self, arguments),
                (self.$dropdown_header = $(options.html(options))),
                self.$dropdown.prepend(self.$dropdown_header);
            }));
      }),
      Selectize.define("optgroup_columns", function (options) {
        var original,
          self = this;
        (options = $.extend(
          { equalizeWidth: !0, equalizeHeight: !0 },
          options
        )),
          (this.getAdjacentOption = function ($option, index) {
            var $options = $option
                .closest("[data-group]")
                .find("[data-selectable]"),
              index = $options.index($option) + index;
            return 0 <= index && index < $options.length
              ? $options.eq(index)
              : $();
          }),
          (this.onKeyDown =
            ((original = self.onKeyDown),
            function (e) {
              var $option, $options;
              return !this.isOpen || (37 !== e.keyCode && 39 !== e.keyCode)
                ? original.apply(this, arguments)
                : ((self.ignoreHover = !0),
                  ($option = ($options =
                    this.$activeOption.closest("[data-group]"))
                    .find("[data-selectable]")
                    .index(this.$activeOption)),
                  void (
                    ($option = ($options = ($options =
                      37 === e.keyCode
                        ? $options.prev("[data-group]")
                        : $options.next("[data-group]")).find(
                      "[data-selectable]"
                    )).eq(Math.min($options.length - 1, $option))).length &&
                    this.setActiveOption($option)
                  ));
            }));
        function equalizeSizes() {
          var i,
            height_max,
            width_last,
            width_parent,
            $optgroups = $("[data-group]", self.$dropdown_content),
            n = $optgroups.length;
          if (n && self.$dropdown_content.width()) {
            if (options.equalizeHeight) {
              for (i = height_max = 0; i < n; i++)
                height_max = Math.max(height_max, $optgroups.eq(i).height());
              $optgroups.css({ height: height_max });
            }
            options.equalizeWidth &&
              ((width_parent =
                self.$dropdown_content.innerWidth() - getScrollbarWidth()),
              (width_last = Math.round(width_parent / n)),
              $optgroups.css({ width: width_last }),
              1 < n &&
                ((width_last = width_parent - width_last * (n - 1)),
                $optgroups.eq(n - 1).css({ width: width_last })));
          }
        }
        var getScrollbarWidth = function () {
          var div,
            width = getScrollbarWidth.width,
            doc = document;
          return (
            void 0 === width &&
              (((div = doc.createElement("div")).innerHTML =
                '<div style="width:50px;height:50px;position:absolute;left:-50px;top:-50px;overflow:auto;"><div style="width:1px;height:100px;"></div></div>'),
              (div = div.firstChild),
              doc.body.appendChild(div),
              (width = getScrollbarWidth.width =
                div.offsetWidth - div.clientWidth),
              doc.body.removeChild(div)),
            width
          );
        };
        (options.equalizeHeight || options.equalizeWidth) &&
          (hook.after(this, "positionDropdown", equalizeSizes),
          hook.after(this, "refreshOptions", equalizeSizes));
      }),
      Selectize.define("remove_button", function (options) {
        (options = $.extend(
          {
            label: "&times;",
            title: "Remove",
            className: "remove",
            append: !0,
          },
          options
        )),
          ("single" === this.settings.mode
            ? function (thisRef, options) {
                options.className = "remove-single";
                var original,
                  self = thisRef,
                  html =
                    '<a href="javascript:void(0)" class="' +
                    options.className +
                    '" tabindex="-1" title="' +
                    escape_html(options.title) +
                    '">' +
                    options.label +
                    "</a>";
                thisRef.setup =
                  ((original = self.setup),
                  function () {
                    var id, render_item;
                    options.append &&
                      ((id = $(self.$input.context).attr("id")),
                      $("#" + id),
                      (render_item = self.settings.render.item),
                      (self.settings.render.item = function (data) {
                        return (
                          (html_container = render_item.apply(
                            thisRef,
                            arguments
                          )),
                          (html_element = html),
                          $("<span>")
                            .append(html_container)
                            .append(html_element)
                        );
                        var html_container, html_element;
                      })),
                      original.apply(thisRef, arguments),
                      thisRef.$control.on(
                        "click",
                        "." + options.className,
                        function (e) {
                          e.preventDefault(), self.isLocked || self.clear();
                        }
                      );
                  });
              }
            : function (thisRef, options) {
                var original,
                  self = thisRef,
                  html =
                    '<a href="javascript:void(0)" class="' +
                    options.className +
                    '" tabindex="-1" title="' +
                    escape_html(options.title) +
                    '">' +
                    options.label +
                    "</a>";
                thisRef.setup =
                  ((original = self.setup),
                  function () {
                    var render_item;
                    options.append &&
                      ((render_item = self.settings.render.item),
                      (self.settings.render.item = function (data) {
                        return (
                          (html_container = render_item.apply(
                            thisRef,
                            arguments
                          )),
                          (html_element = html),
                          (pos = html_container.search(/(<\/[^>]+>\s*)$/)),
                          html_container.substring(0, pos) +
                            html_element +
                            html_container.substring(pos)
                        );
                        var html_container, html_element, pos;
                      })),
                      original.apply(thisRef, arguments),
                      thisRef.$control.on(
                        "click",
                        "." + options.className,
                        function ($item) {
                          if (($item.preventDefault(), !self.isLocked)) {
                            $item = $($item.currentTarget).parent();
                            return (
                              self.setActiveItem($item),
                              self.deleteSelection() &&
                                self.setCaret(self.items.length),
                              !1
                            );
                          }
                        }
                      );
                  });
              })(this, options);
      }),
      Selectize.define("restore_on_backspace", function (options) {
        var original,
          self = this;
        (options.text =
          options.text ||
          function (option) {
            return option[this.settings.labelField];
          }),
          (this.onKeyDown =
            ((original = self.onKeyDown),
            function (e) {
              var option;
              return 8 === e.keyCode &&
                "" === this.$control_input.val() &&
                !this.$activeItems.length &&
                0 <= (option = this.caretPos - 1) &&
                option < this.items.length
                ? ((option = this.options[this.items[option]]),
                  this.deleteSelection(e) &&
                    (this.setTextboxValue(options.text.apply(this, [option])),
                    this.refreshOptions(!0)),
                  void e.preventDefault())
                : original.apply(this, arguments);
            }));
      }),
      Selectize.define("select_on_focus", function (options) {
        var originalFocus,
          originalBlur,
          self = this;
        self.on(
          "focus",
          ((originalFocus = self.onFocus),
          function (e) {
            var value = self.getItem(self.getValue()).text();
            return (
              self.clear(),
              self.setTextboxValue(value),
              self.$control_input.select(),
              setTimeout(function () {
                self.settings.selectOnTab &&
                  self.setActiveOption(
                    self.getFirstItemMatchedByTextContent(value)
                  ),
                  (self.settings.score = null);
              }, 0),
              originalFocus.apply(this, arguments)
            );
          })
        ),
          (self.onBlur =
            ((originalBlur = self.onBlur),
            function (e) {
              return (
                "" === self.getValue() &&
                  self.lastValidValue !== self.getValue() &&
                  self.setValue(self.lastValidValue),
                setTimeout(function () {
                  self.settings.score = function () {
                    return function () {
                      return 1;
                    };
                  };
                }, 0),
                originalBlur.apply(this, arguments)
              );
            })),
          (self.settings.score = function () {
            return function () {
              return 1;
            };
          });
      }),
      Selectize
    );
  });
