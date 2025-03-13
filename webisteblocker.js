function initWebsiteBlocker() {
    // Get website blocker elements
    const blacklistForm = document.getElementById('blacklist-form');
    const websiteInput = document.getElementById('website-input');
    const addToBlacklistBtn = document.getElementById('add-to-blacklist');
    const blacklistedWebsites = document.getElementById('blacklisted-websites');
    
    // Load existing blacklisted websites
    loadBlacklistedWebsites();
    
    // Add website to blacklist on form submit
    blacklistForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addToBlacklist();
    });
    
    // Add website to blacklist on button click
    addToBlacklistBtn.addEventListener('click', function() {
        addToBlacklist();
    });
    
    // Add website on Enter key in input
    websiteInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addToBlacklist();
        }
    });
}

function loadBlacklistedWebsites() {
    fetch('/api/whitelist') // Still using the same API endpoint
    .then(response => response.json())
    .then(websites => {
        renderBlacklistedWebsites(websites);
    })
    .catch(error => {
        console.error('Error loading blacklisted websites:', error);
    });
}

function renderBlacklistedWebsites(websites) {
    const blacklistedWebsites = document.getElementById('blacklisted-websites');
    blacklistedWebsites.innerHTML = '';
    
    if (websites.length === 0) {
        blacklistedWebsites.innerHTML = '<div class="blacklist-empty">No websites blacklisted yet.</div>';
        return;
    }
    
    websites.forEach(website => {
        const websiteItem = document.createElement('div');
        websiteItem.className = 'blacklist-item';
        websiteItem.innerHTML = `
            <span class="website-url">${escapeHtml(website)}</span>
            <button class="website-delete" data-website="${website}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        blacklistedWebsites.appendChild(websiteItem);
        
        // Add event listener to delete button
        const deleteBtn = websiteItem.querySelector('.website-delete');
        deleteBtn.addEventListener('click', function() {
            removeFromBlacklist(website);
        });
    });
}

function addToBlacklist() {
    const websiteInput = document.getElementById('website-input');
    const website = websiteInput.value.trim();
    
    if (!website) {
        window.showPopup('Please enter a website.');
        return;
    }
    
    fetch('/api/whitelist', { // Still using same API endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ website: website }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            window.showPopup(data.error);
            return;
        }
        
        // Clear input and reload blacklist
        websiteInput.value = '';
        loadBlacklistedWebsites();
    })
    .catch(error => {
        console.error('Error adding website to blacklist:', error);
        window.showPopup('Error adding website to blacklist.');
    });
}

function removeFromBlacklist(website) {
    fetch(`/api/whitelist/${encodeURIComponent(website)}`, { // Still using same API endpoint
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadBlacklistedWebsites();
        }
    })
    .catch(error => {
        console.error('Error removing website from blacklist:', error);
    });
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
