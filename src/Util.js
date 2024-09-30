const { Message } = require('discord.js');

function toId() {
  return this.replace(/[<@#&!>]/g, '');
} 

function isNumber() {
  if (isNaN(this) || parseInt(this) != this || parseInt(this) <= 0) return false;
  else return true;
} 

function isInteger() {
  if (isNaN(this) || parseInt(this) != this || parseInt(this) < 0) return false;
  else return true;
} 

function toNumber() {
  const units = {
    'k': 1e3,
    'm': 1e6,
    'b': 1e9,
    't': 1e12,
    'q': 1e15,
    's': 1e18,
  };

  const str = this.toString();
  const lastChar = str.charAt(str.length - 1);
  const unit = units[lastChar];

  if (unit) {
    const numericPart = +str.slice(0, str.length - 1);
    return numericPart * unit;
  }

  return +this;
}

function formateNum(num) {
  if (this >= 1e18) {
    return (this / 1e18).toFixed(1) + 's';
  } else if (this >= 1e15) {
    return (this / 1e15).toFixed(1) + 'q';
  } else if (this >= 1e12) {
    return (this / 1e12).toFixed(1) + 't';
  } else if (this >= 1e9) {
    return (this / 1e9).toFixed(1) + 'b';
  } else if (this >= 1e6) {
    return (this / 1e6).toFixed(1) + 'm';
  } else if (this >= 1e3) {
    return (this / 1e3).toFixed(1) + 'k';
  } else {
    return +this;
  }
}

function lineReplyNoMention(options) {
  options = typeof options === 'string' ? { content: options } : options;
  options.allowedMentions = {
    repliedUser: false
  };
  return this.reply(options);
} 

Object.prototype.extends = function(obj) {
  for (const key in obj) {
    this[key] = obj[key];
  }
}

String.prototype.extends({
  toId, 
  isNumber, 
  toNumber, 
  isInteger,
  formateNum
});

Number.prototype.extends({
  isNumber, 
  toNumber, 
  isInteger, 
  formateNum
});

Message.prototype.extends({
  lineReplyNoMention
});