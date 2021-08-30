function isNumber(value) {
  return !/^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value);
}
function isNumber1(value) {
  if (
    value === undefined
    || value === null
    || value === ''
  ) {
    return false;
  }
  return !Number.isNaN(Number(value)); // Number() => 0, Number('') => 0
}
function convertFenToYuan(value) {
  if (
    value === undefined
    || value === null
    || value === ''
  ) {
    return '';
  }
  if (Number.isNaN(Number(value))) {
    return '';
  }
  // 转成数字再转成字符串目的：某些字符串需特殊处理，'.2' => 0.2，字符串'-.2' => -0.2
  let str = Number(value).toString();
  let result = '';
  if (str[0] === '-') {
    result += '-';
    str = str.substr(1);
  }
  if (str.indexOf('.') > -1) {
    // Trim decimal at the ending.
    str = str.replace(/\.[0-9]+$/, '');
  }

  const len = str.length;
  switch (len) {
    case 1:
      result += `0.0${str}`;
      break;
    case 2:
      result += `0.${str}`;
      break;
    default:
      result += `${str.substr(0, len - 2)}.${str.substr(len - 2)}`;
  }

  // Cut zero at the ending.
  result = result.match(/-?[0-9]+(\.[0-9]*[1-9])?/)[0];

  // 数字千位符分隔
  const regExp = new RegExp('^(-?[0-9]+)([0-9]{3})');
  while (regExp.test(result)) {
    result = result.replace(regExp, '$1,$2');
  }

  return result;
}
