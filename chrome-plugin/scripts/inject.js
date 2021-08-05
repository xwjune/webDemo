// 向页面发送消息
window.postMessage({ 'message': 'injected-script: hello' }, '*');
console.log('hello: injected-script.');

function run() {
  // 访问页面方法
  window.fun();
}
