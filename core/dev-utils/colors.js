/* eslint-disable */
/**
 * This file should be written in ES5
 * Code is taken from https://github.com/jorgebucaran/colorette/blob/master/index.js
 * Copy it to https://buble.surge.sh and paste here
 */
"use strict"

var enabled =
  process.env.FORCE_COLOR ||
  process.platform === "win32" ||
  (process.stdout && process.stdout.isTTY && process.env.TERM && process.env.TERM !== "dumb")

var rawInit = function (open, close, searchRegex, replaceValue) { return function (s) { return enabled
    ? open +
      (~(s += "").indexOf(close, 4) // skip opening \x1b[
        ? s.replace(searchRegex, replaceValue)
        : s) +
      close
    : s; }; }

var init = function (open, close) {
  return rawInit(
    ("\u001b[" + open + "m"),
    ("\u001b[" + close + "m"),
    new RegExp(("\\x1b\\[" + close + "m"), "g"),
    ("\u001b[" + open + "m")
  )
}

module.exports = {
  options: Object.defineProperty({}, "enabled", {
    get: function () { return enabled; },
    set: function (value) { return (enabled = value); }
  }),
  reset: init(0, 0),
  bold: rawInit("\x1b[1m", "\x1b[22m", /\x1b\[22m/g, "\x1b[22m\x1b[1m"),
  dim: rawInit("\x1b[2m", "\x1b[22m", /\x1b\[22m/g, "\x1b[22m\x1b[2m"),
  italic: init(3, 23),
  underline: init(4, 24),
  inverse: init(7, 27),
  hidden: init(8, 28),
  strikethrough: init(9, 29),
  black: init(30, 39),
  red: init(31, 39),
  green: init(32, 39),
  yellow: init(33, 39),
  blue: init(34, 39),
  magenta: init(35, 39),
  cyan: init(36, 39),
  white: init(37, 39),
  gray: init(90, 39),
  bgBlack: init(40, 49),
  bgRed: init(41, 49),
  bgGreen: init(42, 49),
  bgYellow: init(43, 49),
  bgBlue: init(44, 49),
  bgMagenta: init(45, 49),
  bgCyan: init(46, 49),
  bgWhite: init(47, 49),
  blackBright: init(90, 39),
  redBright: init(91, 39),
  greenBright: init(92, 39),
  yellowBright: init(93, 39),
  blueBright: init(94, 39),
  magentaBright: init(95, 39),
  cyanBright: init(96, 39),
  whiteBright: init(97, 39),
  bgBlackBright: init(100, 49),
  bgRedBright: init(101, 49),
  bgGreenBright: init(102, 49),
  bgYellowBright: init(103, 49),
  bgBlueBright: init(104, 49),
  bgMagentaBright: init(105, 49),
  bgCyanBright: init(106, 49),
  bgWhiteBright: init(107, 49)
}
