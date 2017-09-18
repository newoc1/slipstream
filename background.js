chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({
		url: chrome.extension.getURL("3dtabs.html"),
		selected:true
	});
});

chrome.tabs.onCreated.addListener(function(tab){
	if(tab.url === 'chrome://newtab/'){
		chrome.storage.sync.get( {openInNewTab: false}, function(items){			
			if(items.openInNewTab){
				chrome.tabs.update(
					tab.id,
					{
						url: chrome.extension.getURL('main.html')
					})
			}
		})
	}
})