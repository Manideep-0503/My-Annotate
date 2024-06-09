document.addEventListener('DOMContentLoaded', function() {
    var optionsButton = document.getElementById('options-btn');

    optionsButton.addEventListener('click', function() {
        // Open options window on the current page
        openOptionsWindow();
    });
});

function openOptionsWindow() {
    // Calculate window position and size
    var width = 400;
    var height = 300;
    var left = (screen.width - width) / 2;
    var top = (screen.height - height) / 2;

    // Open options window as a dialog
    window.open('options.html', 'Options', 'width=' + width + ', height=' + height + ', top=' + top + ', left=' + left + ', resizable=yes, scrollbars=yes');
}



// Add an event listener to handle the "Load Previous Annotations" button click
document.getElementById('loadAnnotations').addEventListener('click', function() {
    // Send a message to the content script to load the saved page content
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'loadSavedPage'});
    });
});

document.getElementById('exportButton').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "exportPage"}, function(response) {
            console.log(response);
        });
    });
});

document.getElementById('saveButton').addEventListener('click', function() {
    // Send a message to the content script to trigger saving
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'saveWebpage' }, function(response) {
            console.log('Save request sent to contents.js');
        });
    });
});


