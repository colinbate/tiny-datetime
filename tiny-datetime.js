(function(root, factory) {
  'use strict';
  /* CommonJS */
  if (typeof exports === 'object') {
    module.exports = factory();
  }
  /* AMD module */
  else if (typeof define === 'function' && define.amd) {
    define(factory);
  }
  /* Browser global */
  else {
    root.tinyDT = factory();
  }
}
(this, function() {
  'use strict';
  /*
  Time   := "Hour:MinPad:SecPad"
  Date   := "Year-MonPad-DayPad"
  Hour   := 0..23
  Min    := 0..59
  MinPad := "0" + Min(0-9) | Min(10-59)
  Second := 0..59
  SecPad := "0" + Second(0-9) | Second(10-59)
  Year   := 1..9999
  Month  := 1..12
  MonPad := "0" + Month(0-9) | Month(10-12)
  Day    := 1..31
  DayPad := "0" + Day(0-9) | Day(10-31)
  */
  var timeRegex = /^(\d{1,2}):(\d\d)(:(\d\d))?\s*(([aApP])([mM])?)?$/,
      dateLikeRegex = /^\d{1,4}-\d?\d-\d?\d$/,
      TIME_SEP = ':',
      DATE_SEP = '-',
      pad = function (value, digits, padder) {
        var str = value + '';
        padder = padder || '0';
        digits = digits || 2;
        while (digits > str.length) {
          str = padder + str;
        }
        return str;
      },
      jsDate = function (date) {
        return Object.prototype.toString.call(date) === '[object Date]' ? date : new Date(date);
      },
      parseIntBaseTen = function (str) {
        return parseInt(str, 10);
      },
      splitAndParse = function (str, sep) {
        return str.split(sep).map(parseIntBaseTen);
      },
      validateTime = function (str) {
        str = str || this._a;
        if (!str) {
          return false;
        }
        var time = splitAndParse(str, TIME_SEP);
        return time[0] >= 0 && time[0] <= 23 && time[1] >= 0 && time[1] <= 59 && time[2] >= 0 && time[2] <= 59;
      },
      validateIsoDate = function (str) {
        str = str || this._a;
        if (!str) {
          return false;
        }
        var arr = splitAndParse(str, DATE_SEP);
        return arr[0] >= 1 && arr[0] <= 9999 && arr[1] >= 1 && arr[1] <= 12 && arr[2] >= 1 && arr[2] <= 31;
        // TODO: Month lengths and leap years, etc.
      },
      humanTime = function (time) {
        return pad(time[0]) + TIME_SEP + pad(time[1]) + TIME_SEP + pad(time[2]);
      },
      humanDate = function (date) {
        return pad(date[0], 4) + DATE_SEP + pad(date[1]) + DATE_SEP + pad(date[2]);
      },
      dateToTime = function (date) {
        var jsdate = jsDate(date);
        return humanTime([jsdate.getUTCHours(), jsdate.getUTCMinutes(), jsdate.getUTCSeconds()]);
      },
      dateToDate = function (date) {
        var jsdate = jsDate(date);
        return humanDate([jsdate.getUTCFullYear(), jsdate.getUTCMonth()+1, jsdate.getUTCDate()]);
      },
      dateTimeToDate = function (date, time) {
        var hours, mins, secs, ret, timeOk = validateTime(time);
        if (!validateDateArray(dateArray)) {
          return null;
        }
        hours = timeOk && time[0] || 0;
        mins = timeOk && time[1] || 0;
        secs = timeOk && time[2] || 0;
        ret = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], hours, mins, secs);
        return ret;
      },
      compareTime = function (timeA, timeB) {
        var a = splitAndParse(timeA, TIME_SEP),
            b = splitAndParse(timeB, TIME_SEP);
        return (a[0]-b[0]) * 3600 + (a[1]-b[1]) * 60 + (a[2]-b[2]);
      },
      compareDate = function (dateA, dateB) {
        var a = splitAndParse(dateA, DATE_SEP),
            b = splitAndParse(dateB, DATE_SEP);
        return (a[0]-b[0]) * 384 + (a[1]-b[1]) * 32 + (a[2]-b[2]);
      },
      // Fluent Compare API
      // time.is('7:04').before('8:30') => true
      // time.is('7:90').valid() => false
      before = function (b) {
        return this._compare(this._a, this._parse(b)) < 0;
      },
      after = function (b) {
        return this._compare(this._a, this._parse(b)) > 0;
      },
      between = function (b, c) {
        return this._compare(this._a, this._parse(b)) >= 0 && this._compare(this._a, this._parse(c)) <= 0;
      },
      equalTo = function (b) {
        return this._compare(this._a, this._parse(b)) === 0;
      },
      isFactory = function (compFn, parseFn, validFn) {
        return function (a) {
          return {
            _compare: compFn,
            _parse: parseFn,
            _a: parseFn(a),
            before: before,
            after: after,
            equalTo: equalTo,
            valid: validFn
          };
        };
      },
      parseTime = function (str) {
        var match = timeRegex.exec(str),
            hours, out;
        if (!match) {
          return null;
        }
        hours = match[1] * 1;
        if (hours < 12) {
          hours += ((match[5]||'').toLowerCase()[0] === 'p' ? 12 : 0);
        }
        out = humanTime([hours, match[2]*1, (match[4] || 0)*1]);
        return validateTime(out) ? out : null;
      },
      parseDate = function (str) {
        // TODO: This needs to be better.
        if (dateLikeRegex.test(str)) {
          return humanDate(splitAndParse(str, DATE_SEP));
        }
        return dateToDate(new Date(str + ' UTC'));
      };

  return {
    time: {
      parse: parseTime,
      compare: compareTime,
      fromDate: dateToTime,
      is: isFactory(compareTime, parseTime, validateTime)
    },
    date: {
      parse: parseDate,
      compare: compareDate,
      fromDate: dateToDate,
      is: isFactory(compareDate, parseDate, validateIsoDate)
    },
    toDate: dateTimeToDate
  };
}));
