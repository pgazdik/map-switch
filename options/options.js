// Saves options to chrome.storage
function save_options() {
    var color = document.getElementById('color').value;
    var likesColor = document.getElementById('like').checked;

    const settings = {
        favoriteColor: color,
        likesColor: likesColor
    }

    chrome.storage.sync.set(settings, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => status.textContent = '', 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    const defaultSettings = {
        favoriteColor: 'red',
        likesColor: true
    }

    chrome.storage.sync.get(defaultSettings, function (items) {
        document.getElementById('color').value = items.favoriteColor;
        document.getElementById('like').checked = items.likesColor;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);