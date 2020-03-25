> Safari浏览器，跨域下，iframe的localStorage是独立的，其他窗口相同页面设置了localStorage，iframe内同样的页面也无法拿到对应的值，只有在iframe内操作了localStorage，才有效。

目前测试了Chrome和Firefox，不存在这样的问题

## 步骤
1、两个不同容器，容器1: container.html和iframe.html，容器2: iframe.html
2、两个域名下的iframe.html页面设置缓存localStorage.setItem('cache', 'Hello World');
3、刷新页面iframe.html，此时页面会显示Hello World；刷新container.html，同域的iframe显示Hello World，跨域的iframe不显示