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

// 休眠
// 同步
function sleep(ms = 0) {
  let sleepSwitch = true;
  const s = Date.now();
  while (sleepSwitch) {
    if (Date.now() - s > ms) {
      sleepSwitch = false;
    }
  }
}
function sleep2(ms) {
  const start = new Date().getTime();
  while(true) {
    if (new Date().getTime() - start > ms) {
      break;
    }
  }
}
function asyncPrint() {
  sleep(2000);
  console.log('hello');
  sleep2(2000);
  console.log('world');
}
// 异步
function sleep3(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
async function asyncPrint2() {
  await sleep3(2000);
  console.log('hello');
}
