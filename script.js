let allGames = [];

document.addEventListener('DOMContentLoaded', () => {
    if (typeof companionGames !== 'undefined') {
        initializeApp(companionGames);
    } else {
        console.error('Game data not found. Make sure sites.js is properly loaded.');
        document.getElementById('gamesContainer').innerHTML = 
            '<div class="error-message">Unable to load game data.</div>';
    }
    
    // Initialize suggestion modal
    const suggestBtn = document.getElementById('suggestBtn');
    const suggestModal = document.getElementById('suggestModal');
    const closeButtons = suggestModal.querySelectorAll('.close-btn');
    
    suggestBtn.addEventListener('click', () => {
        suggestModal.classList.add('active');
    });
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            suggestModal.classList.remove('active');
        });
    });
    
    suggestModal.addEventListener('click', (e) => {
        if (e.target === suggestModal) {
            suggestModal.classList.remove('active');
        }
    });
    
    // Handle form submission feedback
    const suggestionForm = document.getElementById('suggestionForm');
    suggestionForm.addEventListener('submit', (e) => {
        // Show loading state on button
        const submitBtn = suggestionForm.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
    });

    // Add resource button functionality
    document.getElementById('addResourceBtn').addEventListener('click', () => {
        const container = document.getElementById('resourceFields');
        const resourceCount = container.children.length + 1;
        
        const newGroup = document.createElement('div');
        newGroup.className = 'resource-field-group';
        newGroup.innerHTML = `
            <h4>Resource ${resourceCount}</h4>
            <input type="text" class="res-title" placeholder="Guide Title" required>
            <input type="text" class="res-site" placeholder="Site Name" required>
            <input type="url" class="res-url" placeholder="URL" required>
        `;
        
        container.appendChild(newGroup);
    });
});

function initializeApp(games) {
    allGames = games;
    
    populateSeriesDropdown(games);
    renderGames(games);
    setupSearch();
    setupSeriesDropdown();
    initializeSettings();
}

function populateSeriesDropdown(games) {
    const seriesDropdown = document.getElementById('seriesDropdown');
    const uniqueSeries = [...new Set(games.map(game => game.series))].sort();
    
    uniqueSeries.forEach(series => {
        const option = document.createElement('option');
        option.value = series;
        option.textContent = series;
        seriesDropdown.appendChild(option);
    });
}

function renderGames(games) {
    const gamesContainer = document.getElementById('gamesContainer');
    gamesContainer.innerHTML = '';
    
    if (games.length === 0) {
        gamesContainer.innerHTML = '<div class="no-results">No games found matching your criteria.</div>';
        return;
    }
    
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        
        // Add background class if headerDisplay is "background"
        if (game.headerDisplay === 'background' && game.header) {
            gameCard.classList.add('background-header');
            if (game.header.endsWith('.webm')) {
                gameCard.innerHTML = `
                    <video class="background-video" autoplay loop muted playsinline>
                        <source src="${game.header}" type="video/webm">
                    </video>`;
            } else {
                gameCard.style.backgroundImage = `url(${game.header})`;
            }
        }

        const headerMedia = game.header ? createHeaderMedia(game.header) : '';
        
        gameCard.innerHTML += `
            ${game.headerDisplay === 'above' ? headerMedia : ''}
            <div class="game-header">
                <img src="${game.icon}" alt="${game.game} icon" class="game-icon">
                <div class="game-info">
                    <h2 class="game-name">${game.game}</h2>
                    <div class="game-meta">
                        <span class="game-series">${game.series}</span>
                        ${game.credit ? `<span class="game-credit">Added by ${game.credit}</span>` : ''}
                    </div>
                </div>
                <button class="toggle-btn">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="resources-container">
                <div class="resources-list">
                    ${game.headerDisplay === 'dropdown' ? headerMedia : ''}
                    ${game.resources.map(resource => `
                        <div class="resource-item">
                            <a href="${resource.url}" target="_blank" class="resource-link">
                                <div class="resource-info">
                                    <div class="resource-title">${resource.title}</div>
                                    <div class="resource-site">${resource.site}</div>
                                </div>
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        const header = gameCard.querySelector('.game-header');
        header.addEventListener('click', () => {
            gameCard.classList.toggle('expanded');
        });
        
        gamesContainer.appendChild(gameCard);
    });
}

function createHeaderMedia(headerUrl) {
    if (headerUrl.endsWith('.webm')) {
        return `
            <video class="game-header-media" autoplay loop muted playsinline>
                <source src="${headerUrl}" type="video/webm">
            </video>`;
    }
    return `<img src="${headerUrl}" alt="Game banner" class="game-header-media">`;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedSeries = document.getElementById('seriesDropdown').value;
        
        filterGames(searchTerm, selectedSeries);
    });
}

function setupSeriesDropdown() {
    const seriesDropdown = document.getElementById('seriesDropdown');
    
    seriesDropdown.addEventListener('change', () => {
        const selectedSeries = seriesDropdown.value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        
        filterGames(searchTerm, selectedSeries);
    });
}

function filterGames(searchTerm, series) {
    let filteredGames = allGames;
    
    if (series && series !== 'all') {
        filteredGames = filteredGames.filter(game => game.series === series);
    }
    
    if (searchTerm) {
        filteredGames = filteredGames.filter(game => 
            game.game.toLowerCase().includes(searchTerm) || 
            game.series.toLowerCase().includes(searchTerm) ||
            game.resources.some(resource => 
                resource.title.toLowerCase().includes(searchTerm) ||
                resource.site.toLowerCase().includes(searchTerm)
            )
        );
    }
    
    renderGames(filteredGames);
}

function initializeSettings() {
    // Define all settings with their defaults
    const defaultSettings = {
        headerDisplay: 'dropdown',
        cardLayout: 'comfortable',
        fontSize: 'default',
        theme: 'system',
        cardBorder: 'rounded',
        linkDisplay: 'inline',
        gameSorting: 'alphabetical',
        dropdownDefault: 'collapsed',
        animationSpeed: 'smooth'
    };

    // Load all saved settings or use defaults
    const settings = {};
    Object.keys(defaultSettings).forEach(key => {
        settings[key] = localStorage.getItem(`${key}Setting`) || defaultSettings[key];
    });

    // Apply all settings on load
    applyAllSettings(settings);

    // Set up event listeners for all setting options
    const settingInputs = {};
    Object.keys(defaultSettings).forEach(key => {
        settingInputs[key] = document.getElementsByName(key);
    });

    // Check saved options and set up change listeners
    Object.entries(settingInputs).forEach(([settingName, inputs]) => {
        const savedValue = settings[settingName];
        inputs.forEach(input => {
            input.checked = input.value === savedValue;
            if (!input.disabled) {
                input.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        const value = e.target.value;
                        localStorage.setItem(`${settingName}Setting`, value);
                        applyAllSettings({
                            ...settings,
                            [settingName]: value
                        });
                    }
                });
            }
        });
    });

    // Reset button functionality
    document.getElementById('resetSettings').addEventListener('click', () => {
        if (confirm('Reset all settings to default values?')) {
            Object.keys(defaultSettings).forEach(key => {
                localStorage.removeItem(`${key}Setting`);
            });
            location.reload();
        }
    });

    // Modal controls
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeBtn = settingsModal.querySelector('.close-btn');
    
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
    });
    
    closeBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });
    
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });
}

function applyAllSettings(settings) {
    // Apply all existing settings
    applyHeaderDisplay(settings.headerDisplay);
    document.body.setAttribute('data-layout', settings.cardLayout);
    document.body.setAttribute('data-font-size', settings.fontSize);
    applyTheme(settings.theme);
    
    // Apply new settings
    document.body.setAttribute('data-border', settings.cardBorder);
    document.body.setAttribute('data-link-display', settings.linkDisplay);
    document.body.setAttribute('data-animation', settings.animationSpeed);
    
    // Apply dropdown state
    if (settings.dropdownDefault === 'expanded') {
        document.querySelectorAll('.game-card').forEach(card => {
            card.classList.add('expanded');
        });
    }
    
    // Apply sorting
    sortGames(settings.gameSorting);
}

function sortGames(sortMethod) {
    const container = document.getElementById('gamesContainer');
    const cards = Array.from(container.children);
    
    switch(sortMethod) {
        case 'alphabetical':
            cards.sort((a, b) => {
                const nameA = a.querySelector('.game-name').textContent;
                const nameB = b.querySelector('.game-name').textContent;
                return nameA.localeCompare(nameB);
            });
            break;
            
        case 'recent':
            // Assuming the array order in companionGames represents most recent first
            cards.sort((a, b) => {
                const nameA = a.querySelector('.game-name').textContent;
                const nameB = b.querySelector('.game-name').textContent;
                const indexA = companionGames.findIndex(g => g.game === nameA);
                const indexB = companionGames.findIndex(g => g.game === nameB);
                return indexA - indexB;
            });
            break;
    }
    
    // Reappend cards in new order
    cards.forEach(card => container.appendChild(card));
}

function applyTheme(theme) {
    if (theme === 'system') {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        });
    } else {
        document.body.setAttribute('data-theme', theme);
    }
}

function applyHeaderDisplay(displayMode) {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        // Remove existing display classes
        card.classList.remove('background-header');
        
        // Reset any inline styles
        card.style.backgroundImage = '';
        
        // Get header elements
        const headerMedia = card.querySelector('.game-header-media');
        const backgroundVideo = card.querySelector('.background-video');
        
        // Remove existing header elements
        if (headerMedia) headerMedia.remove();
        if (backgroundVideo) backgroundVideo.remove();
        
        if (displayMode === 'hidden') return;
        
        // Get game data
        const gameTitle = card.querySelector('.game-name').textContent;
        const game = allGames.find(g => g.game === gameTitle);
        if (!game || !game.header) return;
        
        // Apply new display mode
        switch(displayMode) {
            case 'background':
                if (game.header.endsWith('.webm')) {
                    card.insertAdjacentHTML('afterbegin', `
                        <video class="background-video" autoplay loop muted playsinline>
                            <source src="${game.header}" type="video/webm">
                        </video>
                    `);
                } else {
                    card.style.backgroundImage = `url(${game.header})`;
                }
                card.classList.add('background-header');
                break;
                
            case 'above':
                card.querySelector('.game-header').insertAdjacentHTML('beforebegin', 
                    createHeaderMedia(game.header));
                break;
                
            case 'dropdown':
                card.querySelector('.resources-list').insertAdjacentHTML('afterbegin', 
                    createHeaderMedia(game.header));
                break;
        }
    });
}

function packageSuggestion() {
    const titles = [...document.querySelectorAll('.res-title')].map(el => el.value);
    const sites = [...document.querySelectorAll('.res-site')].map(el => el.value);
    const urls = [...document.querySelectorAll('.res-url')].map(el => el.value);

    const resources = titles.map((_, i) => ({
        title: titles[i],
        site: sites[i],
        url: urls[i]
    }));

    const json = {
        game: document.getElementById('gameInput').value,
        series: document.getElementById('seriesInput').value,
        icon: document.getElementById('iconInput').value,
        header: document.getElementById('headerInput').value,
        headerDisplay: document.getElementById('headerDisplayInput').value,
        credit: document.getElementById('creditInput').value,
        resources
    };

    document.getElementById('jsonData').value = JSON.stringify(json, null, 2);
    return true;
}

window.packageSuggestion = packageSuggestion;
