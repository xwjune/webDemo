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

// 判断数组是否相等
const arrayEqual = (arr1 = [], arr2 = []) => {
  return arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]);
};

// 获取文件名前缀
function getPrefix(filename) {
  const pos = filename.lastIndexOf('.');
  let prefix = filename;
  if (pos !== -1) {
    prefix = filename.substring(0, pos);
  }
  return prefix.trim();
}

// 获取文件名后缀
function getSuffix(filename) {
  const pos = filename.lastIndexOf('.');
  let suffix = '';
  if (pos !== -1) {
    suffix = filename.substring(pos + 1);
  }
  return suffix.toLowerCase();
}

async function request(url, config) {
  const options = {
    method: config.method || 'POST',
    mode: config.mode || 'cors',
  };
  if (config.method === 'POST') {
    Object.assign(options, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (config.data) {
      options.body = JSON.stringify(config.data);
    }
  }
  if (config.headers) {
    Object.assign(options, {
      headers: {
        ...options.headers,
        ...config.headers,
      },
    });
  }
  const response = await fetch(url, options);
  const result = await response.json();
  return result;
}
