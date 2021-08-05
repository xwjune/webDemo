// 无法直接访问DOM
console.log('Chrome Plugin Background.');

chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					// 只有打开百度才显示pageAction
					new chrome.declarativeContent.PageStateMatcher({ pageUrl: { urlContains: 'baidu.com' }})
				],
				actions: [new chrome.declarativeContent.ShowPageAction()]
			}
		]);
	});
});

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('Received message from content-script: ');
	console.log(request, sender, sendResponse);
	sendResponse('This is Background. I got your message: ' + JSON.stringify(request));
});


chrome.contextMenus.create({
	title: 'chrome-plugin context',
	onclick(){
		alert('you clicked.');
	}
});

chrome.contextMenus.create({
	title: 'baidu search: %s', // %s表示选中的文字
	contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
	onclick(params){
		// 注意不能使用location.href，因为location是属于background的window对象
		chrome.tabs.create({
			url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText)
		});
	},
	documentUrlPatterns: ['https://*.baidu.com/*'] // 只在某些页面显示此右键菜单
});

chrome.windows.getCurrent(function(currentWindow) {
	console.log('current window ID: ' + currentWindow.id);
	// 获取当前选项卡ID
	chrome.tabs.query({ active: true, windowId: currentWindow.id }, function(tabs) {
		const id = tabs.length ? tabs[0].id: null;
		console.log('current tab ID: ' + id);
	});
});

// 获取当前选项卡ID
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
	const id = tabs.length ? tabs[0].id: null;
	console.log('current tab ID: ' + id);
});

// 保存数据
chrome.storage.sync.set({ color: 'blue' }, function() {
	console.log('保存成功！');
});

// web请求监听，最后一个参数表示阻塞式，需单独声明权限：webRequestBlocking
chrome.webRequest.onBeforeRequest.addListener((details) => {
	// cancel 表示取消本次请求
	if (details.type === 'image') {
		return { cancel: true };
	}
}, { urls: ['<all_urls>'] }, ['blocking']);

function fun() {
	return 'backgroundPage';
}