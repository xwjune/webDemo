// 无法访问页面中的JS，虽然它可以操作DOM，但是DOM却不能调用它，也就是无法在DOM中通过绑定事件的方式调用content-script中的代码

document.addEventListener('DOMContentLoaded', function() {
  console.log('Hello Chrome Plugin.');

  // 访问dom
  const dom = document.querySelector('title');
  console.log(dom);

  // dom操作
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'test');
  meta.setAttribute('content', 'content-script');
  document.head.appendChild(meta);

  injectCustomJs();
});

// 向页面发送消息
window.postMessage({ 'message': 'content-script: hello' }, '*');

// 向background发消息
chrome.runtime.sendMessage({ greeting: 'Hello, I am content-script, I send messages to the background!' }, function(response) {
	console.log('Received a reply from the background: ' + response);
});

window.addEventListener('message', function(e) {
	console.log(e.data);
}, false);

// 读取数据，第一个参数是指定要读取的key以及设置默认值
chrome.storage.sync.get({ color: 'red', age: 18 }, function(items) {
	console.log(items.color, items.age);
});

// 向页面注入JS
function injectCustomJs(jsPath) {
	jsPath = jsPath || 'scripts/inject.js';
	const script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	// 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
	script.src = chrome.extension.getURL(jsPath);
	document.head.appendChild(script);
}
