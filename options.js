document.addEventListener('DOMContentLoaded', function() {
    var colorInput = document.getElementById('highlight-color');
    var saveButton = document.getElementById('save-button');
    var confirmationMessage = document.getElementById('confirmation-message');

    chrome.storage.sync.get('highlightColor', function(data) {
        var color = data.highlightColor;
        if (color) {
            colorInput.value = color;
        }
    });

    saveButton.addEventListener('click', function() {
        var color = colorInput.value;
        chrome.storage.sync.set({ 'highlightColor': color }, function() {
            console.log('Color preferences saved:', color);
            // Show confirmation message
            confirmationMessage.classList.remove('hidden');
            // Hide confirmation message after 2 seconds
            setTimeout(function() {
                confirmationMessage.classList.add('hidden');
                // Send message to existing popup window with selected color
                chrome.runtime.sendMessage({ highlightColor: color });
                // Close inline options page
                window.close();
            }, 2000);
        });
    });
});
