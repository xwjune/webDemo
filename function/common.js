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
