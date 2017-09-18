
function save_options(){
	var openInNewTab = document.getElementById('open-in-new-tab').checked;
	chrome.storage.sync.set({
		openInNewTab: openInNewTab
	})
}
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {  
  chrome.storage.sync.get({    
    openInNewTab: false
  }, function(items) {
    
    document.getElementById('open-in-new-tab').checked = items.openInNewTab;    
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', function(){
	save_options();
})