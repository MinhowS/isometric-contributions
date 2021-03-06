// Generated by CoffeeScript 1.10.0
var Iso;

Iso = (function() {
  var COLORS, bestDay, contributionsBox, dateOptions, dateWithYearOptions, firstDay, lastDay, maxCount, yearTotal;

  COLORS = [new obelisk.CubeColor().getByHorizontalColor(0xebedf0), new obelisk.CubeColor().getByHorizontalColor(0xc6e48b), new obelisk.CubeColor().getByHorizontalColor(0x7bc96f), new obelisk.CubeColor().getByHorizontalColor(0x239a3b), new obelisk.CubeColor().getByHorizontalColor(0x196127)];

  yearTotal = 0;

  maxCount = 0;

  bestDay = null;

  firstDay = null;

  lastDay = null;

  contributionsBox = null;

  dateOptions = {
    month: "short",
    day: "numeric"
  };

  dateWithYearOptions = {
    month: "short",
    day: "numeric",
    year: "numeric"
  };

  function Iso(target) {
    var graphContainer, observer;
    if (target) {
      graphContainer = ($('.js-contribution-graph')).parent()[0];
      if (graphContainer) {
        observer = new MutationObserver((function(_this) {
          return function(mutations) {
            var isGraphAdded;
            isGraphAdded = mutations.find(function(mutation) {
              return [].find.call(mutation.addedNodes, function(node) {
                return node.className === "js-contribution-graph";
              });
            });
            if (isGraphAdded) {
              return _this.generateIsometricChart();
            }
          };
        })(this));
        observer.observe(graphContainer, {
          childList: true
        });
      }
      this.getSettings((function(_this) {
        return function() {
          return _this.generateIsometricChart();
        };
      })(this));
    }
  }

  Iso.prototype.getSettings = function(callback) {
    var ref, ref1;
    if ((typeof chrome !== "undefined" && chrome !== null ? chrome.storage : void 0) != null) {
      return chrome.storage.local.get(['toggleSetting', 'show2DSetting'], (function(_this) {
        return function(arg) {
          var show2DSetting, toggleSetting;
          toggleSetting = arg.toggleSetting, show2DSetting = arg.show2DSetting;
          _this.toggleSetting = toggleSetting != null ? toggleSetting : 'cubes';
          _this.show2DSetting = show2DSetting != null ? show2DSetting : 'no';
          return callback();
        };
      })(this));
    } else {
      this.toggleSetting = (ref = localStorage.toggleSetting) != null ? ref : 'cubes';
      this.show2DSetting = (ref1 = localStorage.show2DSetting) != null ? ref1 : 'no';
      return callback();
    }
  };

  Iso.prototype.persistSetting = function(key, value, callback) {
    var obj;
    if (callback == null) {
      callback = function() {};
    }
    if ((typeof chrome !== "undefined" && chrome !== null ? chrome.storage : void 0) != null) {
      obj = {};
      obj[key] = value;
      return chrome.storage.local.set(obj, callback);
    } else {
      localStorage[key] = value;
      return callback();
    }
  };

  Iso.prototype.generateIsometricChart = function() {
    this.resetValues();
    this.initUI();
    this.loadStats();
    return this.renderIsometricChart();
  };

  Iso.prototype.resetValues = function() {
    yearTotal = 0;
    maxCount = 0;
    bestDay = null;
    firstDay = null;
    lastDay = null;
    return contributionsBox = null;
  };

  Iso.prototype.initUI = function() {
    var htmlFooter, htmlToggle, insertLocation;
    ($('<div class="ic-contributions-wrapper"></div>')).insertBefore($('.js-calendar-graph'));
    ($('<canvas id="isometric-contributions" width="720" height="470"></canvas>')).appendTo('.ic-contributions-wrapper');
    contributionsBox = $('.js-contribution-graph');
    insertLocation = ($('.js-contribution-graph')).find('h2');
    htmlToggle = "<span class=\"ic-toggle\">\n  <a href=\"#\" class=\"ic-toggle-option tooltipped tooltipped-nw squares\" data-ic-option=\"squares\" aria-label=\"Normal chart view\"></a>\n  <a href=\"#\" class=\"ic-toggle-option tooltipped tooltipped-nw cubes\" data-ic-option=\"cubes\" aria-label=\"Isometric chart view\"></a>\n</span>";
    ($(htmlToggle)).insertBefore(insertLocation);
    htmlFooter = "<span class=\"ic-footer\">\n  <a href=\"#\" class=\"ic-2d-toggle\">Show normal chart below ▾</a>\n</span>";
    ($(htmlFooter)).appendTo($('.ic-contributions-wrapper'));
    return this.observeToggle();
  };

  Iso.prototype.observeToggle = function() {
    var self;
    self = this;
    ($('.ic-toggle-option')).click(function(e) {
      var option;
      e.preventDefault();
      option = ($(this)).data('ic-option');
      if (option === 'squares') {
        (contributionsBox.removeClass('ic-cubes')).addClass('ic-squares');
      } else {
        (contributionsBox.removeClass('ic-squares')).addClass('ic-cubes');
      }
      ($('.ic-toggle-option')).removeClass('active');
      ($(this)).addClass('active');
      self.persistSetting("toggleSetting", option);
      return self.toggleSetting = option;
    });
    ($(".ic-toggle-option." + this.toggleSetting)).addClass('active');
    contributionsBox.addClass("ic-" + this.toggleSetting);
    ($('.ic-2d-toggle')).click(function(e) {
      e.preventDefault();
      if (contributionsBox.hasClass('show-2d')) {
        ($(this)).text('Show normal chart ▾');
        contributionsBox.removeClass('show-2d');
        self.persistSetting("show2DSetting", 'no');
        return self.show2DSetting = 'no';
      } else {
        ($(this)).text('Hide normal chart ▴');
        contributionsBox.addClass('show-2d');
        self.persistSetting("show2DSetting", 'yes');
        return self.show2DSetting = 'yes';
      }
    });
    if (this.show2DSetting === "yes") {
      contributionsBox.addClass('show-2d');
      return ($('.ic-2d-toggle')).text('Hide normal chart ▴');
    } else {
      contributionsBox.removeClass('show-2d');
      return ($('.ic-2d-toggle')).text('Show normal chart ▾');
    }
  };

  Iso.prototype.loadStats = function() {
    var contribColumns, countTotal, currentDayCount, currentStreakEnd, currentStreakStart, d, dateBest, dateFirst, dateLast, datesCurrent, datesLongest, datesTotal, days, i, j, len, longestStreakEnd, longestStreakStart, streakCurrent, streakLongest, tempStreak, tempStreakStart;
    streakLongest = 0;
    streakCurrent = 0;
    tempStreak = 0;
    tempStreakStart = null;
    longestStreakStart = null;
    longestStreakEnd = null;
    currentStreakStart = null;
    currentStreakEnd = null;
    datesCurrent = null;
    contribColumns = $('.contrib-column');
    days = $('.js-calendar-graph rect.day');
    days.each(function(d) {
      var currentDayCount, tempStreakEnd;
      currentDayCount = ($(this)).data('count');
      yearTotal += currentDayCount;
      if (d === 0) {
        firstDay = ($(this)).data('date');
      }
      if (d === days.length - 1) {
        lastDay = ($(this)).data('date');
      }
      if (currentDayCount > maxCount) {
        bestDay = ($(this)).data('date');
        maxCount = currentDayCount;
      }
      if (currentDayCount > 0) {
        if (tempStreak === 0) {
          tempStreakStart = ($(this)).data('date');
        }
        tempStreak++;
        if (tempStreak >= streakLongest) {
          longestStreakStart = tempStreakStart;
          longestStreakEnd = ($(this)).data('date');
          return streakLongest = tempStreak;
        }
      } else {
        tempStreak = 0;
        tempStreakStart = null;
        return tempStreakEnd = null;
      }
    });
    days = ($('.js-calendar-graph rect.day')).get().reverse();
    currentStreakEnd = days[0].getAttribute('data-date');
    for (i = j = 0, len = days.length; j < len; i = ++j) {
      d = days[i];
      currentDayCount = parseInt(d.getAttribute('data-count'), 10);
      if (i === 0 && currentDayCount === 0) {
        currentStreakEnd = days[1].getAttribute('data-date');
        continue;
      }
      if (currentDayCount > 0) {
        streakCurrent++;
        currentStreakStart = d.getAttribute('data-date');
      } else {
        break;
      }
    }
    if (streakCurrent > 0) {
      currentStreakStart = this.formatDateString(currentStreakStart, dateOptions);
      currentStreakEnd = this.formatDateString(currentStreakEnd, dateOptions);
      datesCurrent = currentStreakStart + " — " + currentStreakEnd;
    } else {
      datesCurrent = "No current streak";
    }
    countTotal = yearTotal.toLocaleString();
    dateFirst = this.formatDateString(firstDay, dateWithYearOptions);
    dateLast = this.formatDateString(lastDay, dateWithYearOptions);
    datesTotal = dateFirst + " — " + dateLast;
    dateBest = this.formatDateString(bestDay, dateOptions);
    if (!dateBest) {
      dateBest = 'No activity found';
    }
    longestStreakStart = this.formatDateString(longestStreakStart, dateOptions);
    longestStreakEnd = this.formatDateString(longestStreakEnd, dateOptions);
    datesLongest = longestStreakStart + " — " + longestStreakEnd;
    this.renderTopStats(countTotal, datesTotal, maxCount, dateBest);
    return this.renderBottomStats(streakLongest, datesLongest, streakCurrent, datesCurrent);
  };

  Iso.prototype.renderTopStats = function(countTotal, datesTotal, maxCount, dateBest) {
    var html;
    html = "<div class=\"ic-stats-block ic-stats-top\">\n  <span class=\"ic-stats-table\">\n    <span class=\"ic-stats-row\">\n      <span class=\"ic-stats-label\">1 year total\n        <span class=\"ic-stats-count\">" + countTotal + "</span>\n      </span>\n      <span class=\"ic-stats-meta\">\n        <span class=\"ic-stats-unit\">contributions</span>\n        <span class=\"ic-stats-date\">" + datesTotal + "</span>\n      </span>\n    </span>\n    <span class=\"ic-stats-row\">\n      <span class=\"ic-stats-label\">Busiest day\n        <span class=\"ic-stats-count\">" + maxCount + "</span>\n      </span>\n      <span class=\"ic-stats-meta\">\n        <span class=\"ic-stats-unit\">contributions</span>\n          <span class=\"ic-stats-date\">" + dateBest + "</span>\n        </span>\n      </span>\n    </span>\n  </span>\n</div>";
    return ($(html)).appendTo($('.ic-contributions-wrapper'));
  };

  Iso.prototype.renderBottomStats = function(streakLongest, datesLongest, streakCurrent, datesCurrent) {
    var html;
    html = "<div class=\"ic-stats-block ic-stats-bottom\">\n  <span class=\"ic-stats-table\">\n    <span class=\"ic-stats-row\">\n      <span class=\"ic-stats-label\">Longest streak\n        <span class=\"ic-stats-count\">" + streakLongest + "</span>\n      </span>\n      <span class=\"ic-stats-meta\">\n        <span class=\"ic-stats-unit\">days</span>\n        <span class=\"ic-stats-date\">" + datesLongest + "</span>\n      </span>\n    </span>\n    <span class=\"ic-stats-row\">\n      <span class=\"ic-stats-label\">Current streak\n        <span class=\"ic-stats-count\">" + streakCurrent + "</span>\n      </span>\n      <span class=\"ic-stats-meta\">\n        <span class=\"ic-stats-unit\">days</span>\n        <span class=\"ic-stats-date\">" + datesCurrent + "</span>\n      </span>\n    </span>\n  </span>\n</div>";
    return ($(html)).appendTo($('.ic-contributions-wrapper'));
  };

  Iso.prototype.renderIsometricChart = function() {
    var GH_OFFSET, MAX_HEIGHT, SIZE, canvas, contribCount, pixelView, point, self;
    SIZE = 10;
    GH_OFFSET = 12;
    MAX_HEIGHT = 100;
    canvas = document.getElementById('isometric-contributions');
    point = new obelisk.Point(110, 110);
    pixelView = new obelisk.PixelView(canvas, point);
    contribCount = null;
    self = this;
    return ($('.js-calendar-graph g > g')).each(function(g) {
      var x;
      x = parseInt(((($(this)).attr('transform')).match(/(\d+)/))[0] / (GH_OFFSET + 1));
      return (($(this)).find('rect')).each(function(r) {
        var color, cube, cubeHeight, dimension, fill, p3d, y;
        r = ($(this)).get(0);
        y = parseInt((($(this)).attr('y')) / GH_OFFSET);
        fill = ($(this)).attr('fill');
        contribCount = parseInt(($(this)).data('count'));
        cubeHeight = 3;
        if (maxCount > 0) {
          cubeHeight += parseInt(MAX_HEIGHT / maxCount * contribCount);
        }
        dimension = new obelisk.CubeDimension(SIZE, SIZE, cubeHeight);
        color = self.getSquareColor(fill);
        cube = new obelisk.Cube(dimension, color, false);
        p3d = new obelisk.Point3D(SIZE * x, SIZE * y, 0);
        return pixelView.renderObject(cube, p3d);
      });
    });
  };

  Iso.prototype.getSquareColor = function(fill) {
    var color;
    return color = (function() {
      switch (fill.toLowerCase()) {
        case 'rgb(235, 237, 240)':
        case '#ebedf0':
          return COLORS[0];
        case 'rgb(198, 228, 139)':
        case '#c6e48b':
          return COLORS[1];
        case 'rgb(123, 201, 111)':
        case '#7bc96f':
          return COLORS[2];
        case 'rgb(35, 154, 59)':
        case '#239a3b':
          return COLORS[3];
        case 'rgb(25, 97, 39)':
        case '#196127':
          return COLORS[4];
        default:
          if (fill.indexOf('#') !== -1) {
            return new obelisk.CubeColor().getByHorizontalColor(parseInt('0x' + fill.replace("#", "")));
          }
      }
    })();
  };

  Iso.prototype.formatDateString = function(dateStr, options) {
    var date, dateParts;
    date = null;
    if (dateStr) {
      dateParts = dateStr.split('-');
      date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 0, 0, 0).toLocaleDateString('en-US', options);
    }
    return date;
  };

  return Iso;

})();

$(function() {
  var iso, target;
  target = document.querySelector('.js-calendar-graph');
  return iso = new Iso(target);
});
