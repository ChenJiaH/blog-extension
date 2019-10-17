/**
 * @Author: Created By McChen
 * @Date: 2019/10/15
 * @Mail: chenjiahao.xyz@gmail.com
 */

chrome.runtime.onInstalled.addListener(function () {
	console.log('onInstalled');
});

// ==== 内容菜单开始 ======

chrome.contextMenus.create({
	id: 'McChen',
	title: 'McChen',
	contexts: ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'page_action']
});
chrome.contextMenus.create({
	id: 'home',
	title: '主页',
	parentId: 'McChen', // 右键菜单项的父菜单项ID。指定父菜单项将会使此菜单项成为父菜单项的子菜单
	contexts: ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'page_action']
});
chrome.contextMenus.create({
	id: 'archives',
	title: '博客',
	parentId: 'McChen', // 右键菜单项的父菜单项ID。指定父菜单项将会使此菜单项成为父菜单项的子菜单
	contexts: ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'page_action']
});
chrome.contextMenus.create({
	id: 'labels',
	title: '标签',
	parentId: 'McChen', // 右键菜单项的父菜单项ID。指定父菜单项将会使此菜单项成为父菜单项的子菜单
	contexts: ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'page_action']
});
chrome.contextMenus.create({
	id: 'links',
	title: '友链',
	parentId: 'McChen', // 右键菜单项的父菜单项ID。指定父菜单项将会使此菜单项成为父菜单项的子菜单
	contexts: ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'page_action']
});
chrome.contextMenus.create({
	id: 'about',
	title: '关于',
	parentId: 'McChen', // 右键菜单项的父菜单项ID。指定父菜单项将会使此菜单项成为父菜单项的子菜单
	contexts: ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'page_action']
});
chrome.contextMenus.create({
	id: 'board',
	title: '留言',
	parentId: 'McChen', // 右键菜单项的父菜单项ID。指定父菜单项将会使此菜单项成为父菜单项的子菜单
	contexts: ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'page_action']
});
chrome.contextMenus.create({
	id: 'search',
	title: '搜索',
	parentId: 'McChen', // 右键菜单项的父菜单项ID。指定父菜单项将会使此菜单项成为父菜单项的子菜单
	contexts: ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'page_action']
});
chrome.contextMenus.onClicked.addListener(function (info, tab) {
	alert(JSON.stringify(info))
	if (info.menuItemId === 'home') {
		chrome.tabs.create({url: 'https://chenjiahao.xyz'});
	} else {
		chrome.tabs.create({url: 'https://chenjiahao.xyz/blog/#/' + info.menuItemId});
	}
})

// ==== 内容菜单结束 ======

// ==== 搜索建议开始 ======

let timer = '';

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
	if (timer) {
		clearTimeout(timer)
		timer = ''
	} else {
		timer = setTimeout(() => {
			if (text.length > 1) {
				const query = `query {
					search(query: "${text} repo:ChenJiaH/blog", type: ISSUE, first: 5, after: null) {
						nodes {
							... on Issue {
								title
								number
							}
						}
					}
				}`;
				const xhr = new XMLHttpRequest();
				xhr.open("POST", "https://api.artfe.club/transfer/github", true);
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
				xhr.onreadystatechange = function () {
					if (xhr.readyState === 4) {
						const list = JSON.parse(xhr.responseText).data.search.nodes;
						if (list.length) {
							console.log(list.map(_ => ({content: String(_.number), description: _.title})));
							suggest(list.map(_ => ({content: 'ISSUE_NUMBER:' + _.number, description: '文章 - ' + _.title})))
						} else {
							suggest([
								{content: 'none', description: '无相关结果'}
							])
						}
					}
				};
				xhr.send('query=' + query);
			} else {
				suggest([
					{content: 'none', description: '查询中，请稍后...'}
				])
			}
		}, 300)
	}
});

// 当用户接收关键字建议时触发
chrome.omnibox.onInputEntered.addListener((text) => {
	if (text.startsWith('ISSUE_NUMBER:')) {
		const number = text.substr(13)
		openUrlCurrentTab('https://chenjiahao.xyz/blog/#/archives/' + number);
	}
});

// 获取当前选项卡ID
function getCurrentTabId(callback) {
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		if (callback) callback(tabs.length ? tabs[0].id : null);
	});
}

// 当前标签打开某个链接
function openUrlCurrentTab(url) {
	getCurrentTabId(tabId => {
		chrome.tabs.update(tabId, {url: url});
	})
}

// ==== 搜索建议结束 ======

