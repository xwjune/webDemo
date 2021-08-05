// 检测jQuery
document.getElementById('check_jquery').addEventListener('click', function() {
	// 访问被检查的页面DOM需要使用inspectedWindow
	// 简单例子：检测被检查页面是否使用了jQuery
	chrome.devtools.inspectedWindow.eval("jQuery.fn.jquery", function(result, isException) {
		let html = '';
		if (isException) html = '当前页面没有使用jQuery。';
		else html = '当前页面使用了jQuery，版本为：' + result;
		document.querySelector('p').innerText = html;
	});
});
// 获取所有资源
document.getElementById('get_all_resources').addEventListener('click', function() {
	chrome.devtools.inspectedWindow.getResources(function(resources) {
		alert(JSON.stringify(resources));
	});
});