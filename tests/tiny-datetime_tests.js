var tiny = require('../tiny-datetime');
describe('tiny datetime api', function () {
  'use strict';
  it('has a time object', function () {
    expect(tiny.time).toBeTruthy();
  });
  it('has a date object', function () {
    expect(tiny.date).toBeTruthy();
  });
  it('has a toDate function', function () {
    expect(tiny.toDate).toBeTruthy();
    expect(typeof tiny.toDate).toBe('function');
  });
  describe('time', function () {
    describe('parse()', function () {
      it('returns hours, minutes, seconds as provided', function () {
        var time = '11:32:45';
        expect(tiny.time.parse(time)).toBe('11:32:45');
      });
      it('returns hours padded to two digits', function () {
        expect(tiny.time.parse('1:22:33')).toBe('01:22:33');
      });
      it('omits seconds if they are zero', function () {
        expect(tiny.time.parse('12:02:00')).toBe('12:02');
      });
      it('outputs in 24h time', function () {
        expect(tiny.time.parse('16:12:00')).toBe('16:12');
      });
      it('output null when input is invalid', function () {
        expect(tiny.time.parse('34:00:00')).toBeNull();
      });
      it('handles AM/PM', function () {
        expect(tiny.time.parse('7:09am')).toBe('07:09');
        expect(tiny.time.parse('7:09 a')).toBe('07:09');
        expect(tiny.time.parse('7:09:45 am')).toBe('07:09:45');
        expect(tiny.time.parse('7:09:45a')).toBe('07:09:45');
        expect(tiny.time.parse('7:09 pm')).toBe('19:09');
        expect(tiny.time.parse('7:09p')).toBe('19:09');
        expect(tiny.time.parse('7:09:45 p')).toBe('19:09:45');
        expect(tiny.time.parse('7:09:45pm')).toBe('19:09:45');
      });
    });
  });

  describe('toDate()', function () {
    it('returns null when first param invalid date', function () {
      expect(tiny.toDate('')).toBeNull();
    });
    describe('with valid date as first param', function () {
      var date = '1982-05-09';
      var result = tiny.toDate(date);

      it('returns a JS Date object', function () {
        expect(Object.prototype.toString.call(result)).toBe('[object Date]');
      });

      it('maps to midnight on that day', function () {
        expect(result.getFullYear()).toBe(1982);
        expect(result.getMonth()).toBe(4);
        expect(result.getDate()).toBe(9);
        expect(result.getHours()).toBe(0);
        expect(result.getMinutes()).toBe(0);
        expect(result.getSeconds()).toBe(0);
      });

      describe('and invalid second param', function () {
        var result = tiny.toDate(date, '');

        it('maps to midnight on that day', function () {
          expect(result.getFullYear()).toBe(1982);
          expect(result.getMonth()).toBe(4);
          expect(result.getDate()).toBe(9);
          expect(result.getHours()).toBe(0);
          expect(result.getMinutes()).toBe(0);
          expect(result.getSeconds()).toBe(0);
        });
      });

      describe('and time array as second param', function () {
        var time = '10:18:00';
        var result = tiny.toDate(date, time);

        it('maps to specified time on that day', function () {
          expect(result.getFullYear()).toBe(1982);
          expect(result.getMonth()).toBe(4);
          expect(result.getDate()).toBe(9);
          expect(result.getHours()).toBe(10);
          expect(result.getMinutes()).toBe(18);
          expect(result.getSeconds()).toBe(0);
        });
      });

    });
    

  });
});