document.getElementById('btn').addEventListener('click', function() {
	const bg = chrome.extension.getBackgroundPage();
  const result = bg.fun();
  document.querySelector('.result').innerText = result;
});
