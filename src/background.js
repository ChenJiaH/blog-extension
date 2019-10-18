/**
 * @Author: Created By McChen
 * @Date: 2019/10/15
 * @Mail: chenjiahao.xyz@gmail.com
 */

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
	if (info.menuItemId === 'home') {
		chrome.tabs.create({url: 'https://chenjiahao.xyz'});
	} else {
		chrome.tabs.create({url: 'https://chenjiahao.xyz/blog/#/' + info.menuItemId});
	}
});
// ==== 内容菜单结束 ======

// ==== 搜索建议开始 ======
let timer = '';
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
	if (timer) {
		clearTimeout(timer);
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

// 当选中建议内容时触发
chrome.omnibox.onInputEntered.addListener((text) => {
	if (text.startsWith('ISSUE_NUMBER:')) {
		const number = text.substr(13)
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			if (tabs.length) {
				const tabId = tabs[0].id;
				const url = 'https://chenjiahao.xyz/blog/#/archives/' + number;
				chrome.tabs.update(tabId, {url: url});
			}
		});
	}
});
// ==== 搜索建议结束 ======

// ==== 新文章通知开始 ======
getLatestNumber();
chrome.storage.sync.get({LATEST_TIMER: 0}, function (items) {
	if (items.LATEST_TIMER) {
		clearInterval(items.LATEST_TIMER)
	}
	const LATEST_TIMER = setInterval(() => {
		getLatestNumber()
	}, 1000 * 60 * 60 *24)
	chrome.storage.sync.set({LATEST_TIMER: LATEST_TIMER})
});
function getLatestNumber () {
	const query = `query {
		repository(owner: "ChenJiaH", name: "blog") {
			issues(orderBy: {field: CREATED_AT, direction: DESC}, labels: null, first: 1, after: null) {
				nodes {
					title
					number
				}
			}
		}
	}`;
	const xhr = new XMLHttpRequest();
	xhr.open("POST", "https://api.artfe.club/transfer/github", true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			const list = JSON.parse(xhr.responseText).data.repository.issues.nodes;
			if (list.length) {
				const title = list[0].title;
				const ISSUE_NUMBER = list[0].number;
				chrome.storage.sync.get({ISSUE_NUMBER: 0}, function(items) {
					if (items.ISSUE_NUMBER !== ISSUE_NUMBER) {
						chrome.storage.sync.set({ISSUE_NUMBER: ISSUE_NUMBER}, function() {
							chrome.notifications.create('McChen', {
								type: 'basic',
								iconUrl: 'icon.png',
								title: '新文章发布通知',
								message: title
							});
							chrome.notifications.onClicked.addListener(function (notificationId) {
								if (notificationId === 'McChen') {
									chrome.tabs.create({url: 'https://chenjiahao.xyz/blog/#/archives/' + ISSUE_NUMBER});
								}
							})
						});
					}
				});
			}
		}
	};
	xhr.send('query=' + query);
}
// ==== 新文章通知结束 ======
