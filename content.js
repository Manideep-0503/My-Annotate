// Create a toolbar element
function createToolbar() {
    const existingToolbar = document.querySelector('.floating-toolbar');
    if (existingToolbar) {
        existingToolbar.remove();
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'floating-toolbar';

    // Change Color button
    const colorButton = document.createElement('button');
    colorButton.innerText = 'Change Color';
    colorButton.onclick = changeHighlightColor;

    // Add Note button
    const noteButton = document.createElement('button');
    noteButton.innerText = 'Add Note';
    noteButton.onclick = addNote;

    toolbar.appendChild(colorButton);
    toolbar.appendChild(noteButton);

    document.body.appendChild(toolbar);
    return toolbar;
}

// Function to hide toolbar
function hideToolbar(event) {
    if (!event.relatedTarget || !event.relatedTarget.closest('.floating-toolbar')) {
        const existingToolbar = document.querySelector('.floating-toolbar');
        if (existingToolbar) {
            existingToolbar.remove();
        }
    }
}

// Function to show toolbar
function showToolbar(span) {
    const toolbar = createToolbar();
    const rect = span.getBoundingClientRect();
    toolbar.style.left = `${rect.left + window.scrollX}px`;
    toolbar.style.top = `${rect.bottom + window.scrollY}px`;

    toolbar.targetSpan = span;

    toolbar.addEventListener('mouseleave', hideToolbar);
}

// Function to change the highlight color
function changeHighlightColor(event) {
    const optionsUrl = chrome.runtime.getURL('options.html');
    const width = 400;
    const height = 300;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    window.open(optionsUrl, 'Options', `width=${width}, height=${height}, top=${top}, left=${left}, resizable=yes, scrollbars=yes`);
}

// Function to add or edit a note
function addNote() {
    const span = document.querySelector('.floating-toolbar').targetSpan;
    const existingNote = span.getAttribute('data-note') || '';
    
   
    this.setAttribute('title', existingNote);

    
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Enter your note...';
    textarea.value = existingNote;


    const rect = span.getBoundingClientRect();
    textarea.style.position = 'absolute';
    textarea.style.left = `${rect.right + 10}px`; 
    textarea.style.top = `${rect.top}px`; 

  
    document.body.appendChild(textarea);

  
    textarea.focus();

    textarea.addEventListener('blur', function() {
        span.setAttribute('data-note', this.value);
        saveHighlights();
        this.remove(); 
    });

    hideToolbar();
}


function saveHighlights() {
    const highlights = [];
    document.querySelectorAll('.highlight').forEach(span => {
        highlights.push({
            text: span.textContent,
            note: span.getAttribute('data-note'),
            color: span.style.backgroundColor,
            position: getCaretPosition(span)
        });
    });
    chrome.storage.local.set({ highlights });
}

function loadHighlights() {
    chrome.storage.local.get('highlights', function (data) {
        if (data.highlights) {
            data.highlights.forEach(item => {
                const span = document.createElement('span');
                span.className = 'highlight';
                span.style.backgroundColor = item.color;
                span.textContent = item.text;
                span.setAttribute('data-note', item.note);

                document.body.appendChild(span);
                span.addEventListener('mouseover', () => showToolbar(span));
                span.addEventListener('mouseout', hideToolbar);
            });
        }
    });
}

window.onload = function () {
    loadHighlights();
};

function getCaretPosition(element) {
    try {
        const range = document.createRange();
        range.selectNodeContents(element);
        const rects = range.getClientRects();

        if (rects.length === 0) {
            throw new Error("No rectangles found for the given element.");
        }

        const startRect = rects[0];
        const endRect = rects[rects.length - 1];

        return {
            start: { x: startRect.left, y: startRect.top },
            end: { x: endRect.right, y: endRect.bottom }
        };
    } catch (error) {
        console.error("Error getting caret position:", error);
        return {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }
        };
    }
}

document.addEventListener('mouseup', () => {
    if (window.getSelection().toString().length > 0) {
        chrome.storage.sync.get('highlightColor', function (data) {
            var color = data.highlightColor || 'yellow';
            highlightSelection(color);
        });
    }
});

function highlightSelection(color) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = 'highlight';
    span.style.backgroundColor = color;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    selection.removeAllRanges();

    span.addEventListener('mouseover', () => showToolbar(span));
    span.addEventListener('mouseout', hideToolbar);

    saveHighlights();
}



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "exportPage") {
        window.print();
        // Optionally, you can send a response back to the popup script
        sendResponse({message: "Exporting page"});
    }
});

// Listen for messages from the popup script or extension
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'saveWebpage') {
        // Get the outer HTML of the current webpage
        const webpageContent = document.documentElement.outerHTML;

        // Save the webpage content to storage
        chrome.storage.local.set({ savedWebpageContent: webpageContent }, function() {
            console.log('Webpage content saved.');
        });
    } else if (message.action === 'loadSavedPage') {
        loadSavedPage();
    }
});

// Function to load the saved page content
function loadSavedPage() {
    chrome.storage.local.get('savedWebpageContent', function(data) {
        const savedContent = data.savedWebpageContent;
        if (savedContent) {
            // Replace the current webpage content with the saved content
            document.open();
            document.write(savedContent);
            document.close();

            console.log('Saved page loaded.');
        } else {
            console.log('No saved content found.');
        }
    });
}



