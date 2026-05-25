const chalk = require('chalk');
const gradient = require('gradient-string');
const figlet = require('figlet');
const config = require("../configs/console.json");

var successColor = config.console.success;
const errorColor = config.console.error;
const warnColor = config.console.warn;

// Startup banner — prints only once
let _bannerPrinted = false;
function printBanner() {
  if (_bannerPrinted) return;
  _bannerPrinted = true;
  try {
    const banner = figlet.textSync('JOY-BOT', { font: 'ANSI Shadow' });
    const g = gradient(['#243aff', '#a044ff', '#ff44aa']);
    console.log('\n' + g(banner));
    console.log(gradient('#243aff', '#a044ff')('  ──────────────────────────────────────────────────'));
    console.log(gradient('#a044ff', '#ff44aa')('  ✦  Author : Joy Ahmed') + '  │  ' + chalk.cyan('Prefix : ' + (global.config && global.config.PREFIX ? global.config.PREFIX : '.')));
    console.log(gradient('#243aff', '#a044ff')('  ──────────────────────────────────────────────────') + '\n');
  } catch (e) {
    // silent fail if figlet not ready
  }
}

// Suppress junk console.log output (e.g. "Hello World!" from obfuscated code)
const _originalLog = console.log;
const _blocked = ['Hello World!'];
console.log = function (...args) {
  const msg = args.join(' ');
  if (_blocked.some(b => msg.includes(b))) return;
  _originalLog.apply(console, args);
};

printBanner();

module.exports = (text, type) => {
  switch (type) {
    case "warn":
      process.stderr.write(chalk[`${warnColor}`](config.console.editNames.warn) + ` - ${text}\n`);
      break;
    case "error":
      process.stderr.write(chalk[`${errorColor}`](config.console.editNames.error) + ` - ${text}\n`);
      break;
    case "load":
      process.stderr.write(chalk[`${successColor}`]('new user') + `- ${text}\n`);
      break;
    default:
      process.stderr.write(chalk[`${successColor}`](type) + ` - ${text}\n`);
      break;
  }
};

module.exports.error = (text) => {
  process.stderr.write(chalk[`${errorColor}`](config.console.editNames.error) + ` - ${text}\n`);
};

module.exports.err = (text) => {
  process.stderr.write(chalk[`${errorColor}`](config.console.editNames.error) + ` - ${text}\n`);
};

module.exports.warn = (text) => {
  process.stderr.write(chalk[`${warnColor}`](config.console.editNames.warn) + ` - ${text}\n`);
};

module.exports.loader = (data, option) => {
  switch (option) {
    case "warn":
      process.stderr.write(chalk[`${warnColor}`](config.console.editNames.warn) + ` - ${data}\n`);
      break;
    case "error":
      process.stderr.write(chalk[`${errorColor}`](`${config.console.editNames.error}`) + ` - ${data}\n`);
      break;
    default:
      process.stderr.write(chalk[`${successColor}`](`${config.console.editNames.success}`) + ` - ${data}\n`);
      break;
  }
};
