// API Configuration
const API_URL = 'http://localhost:5000/api';

// Helper Functions
function getAuthToken() {
  return localStorage.getItem('token');
}

function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Check if user is logged in
if (!getAuthToken()) {
  window.location.href = 'loginpage.html';
}

// Display user information
async function displayUserInfo() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      document.getElementById('userName').textContent = data.user.name;
      document.getElementById('userEmail').textContent = data.user.email;
      document.getElementById('allergyCount').textContent = data.user.allergies.length;
      displayAllergies(data.user.allergies);
    } else {
      if (response.status === 401) {
        alert('Session expired. Please login again.');
        logoutUser();
      } else {
        throw new Error(data.message || 'Failed to fetch user data');
      }
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    const cachedUser = getCurrentUser();
    if (cachedUser) {
      document.getElementById('userName').textContent = cachedUser.name;
      document.getElementById('userEmail').textContent = cachedUser.email;
      document.getElementById('allergyCount').textContent = cachedUser.allergies.length;
      displayAllergies(cachedUser.allergies);
    } else {
      alert('Error loading user data. Please try logging in again.');
      logoutUser();
    }
  }
}

// Display allergies with scientific formatting
function displayAllergies(allergies) {
  const allergyListEl = document.getElementById('allergyList');
  
  if (!allergies || allergies.length === 0) {
    allergyListEl.innerHTML = '<div class="empty-allergies"><span class="empty-icon">🔬</span><span>No allergen sensitivities configured</span></div>';
    return;
  }

  allergyListEl.innerHTML = '';
  allergies.forEach(allergy => {
    const pill = document.createElement('span');
    pill.className = 'allergy-pill-dash scientific-allergy-pill';
    
    // Add icon based on allergen type
    const icon = getAllergenIcon(allergy);
    pill.innerHTML = `<span class="allergen-icon">${icon}</span><span class="allergen-text">${allergy}</span>`;
    
    allergyListEl.appendChild(pill);
  });
}

// Get scientific icon for each allergen
function getAllergenIcon(allergen) {
  const iconMap = {
    'milk': '🥛', 'eggs': '🥚', 'peanuts': '🥜', 'tree nuts': '🌰',
    'fish': '🐟', 'shellfish': '🦐', 'wheat': '🌾', 'soy': '🫘',
    'sesame': '🫘', 'gluten': '🌾', 'corn': '🌽',
    'chickpeas': '🫘', 'lentils': '🫘', 'peas': '🫘', 'beans': '🫘',
    'crustaceans': '🦐', 'mollusks': '🦪',
    'banana': '🍌', 'avocado': '🥑', 'kiwi': '🥝', 'strawberry': '🍓',
    'tomato': '🍅', 'potato': '🥔', 'garlic': '🧄', 'onion': '🧅',
    'oats': '🌾', 'rice': '🍚', 'barley': '🌾', 'rye': '🌾',
    'quinoa': '🌾', 'buckwheat': '🌾',
    'gelatin': '🔬', 'cocoa': '🍫', 'red meat': '🥩', 'lupin': '🫘'
  };
  
  const key = allergen.toLowerCase();
  return iconMap[key] || '⚠️';
}

// Load recent searches from backend
async function loadRecentSearches() {
  const recentListEl = document.getElementById('recentList');
  
  try {
    const response = await fetch(`${API_URL}/food/history?limit=15`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    const data = await response.json();

    if (data.success && data.history && data.history.length > 0) {
      recentListEl.innerHTML = '';
      data.history.forEach(search => {
        const item = document.createElement('div');
        item.className = 'recent-item-dash';
        
        const displayName = search.foodName || 'Unknown Food';
        const displayTime = search.searchedAt ? getTimeAgo(new Date(search.searchedAt)) : 'Recently';
        
        const allergenBadge = search.allergenDetected 
          ? `<span class="allergen-indicator-badge">⚠️</span>` 
          : '';
        
        item.innerHTML = `
          <div class="recent-item-content">
            <span class="recent-name-dash">${displayName}</span>
            ${allergenBadge}
          </div>
          <span class="recent-time-dash">${displayTime}</span>
        `;
        
        if (search.foodId) {
          item.style.cursor = 'pointer';
          item.addEventListener('click', () => {
            window.location.href = `food-details.html?foodId=${search.foodId}&name=${encodeURIComponent(displayName)}`;
          });
        } else {
          item.style.cursor = 'default';
          item.style.opacity = '0.7';
          item.title = 'Food details not available';
        }
        
        recentListEl.appendChild(item);
      });
    } else {
      recentListEl.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <p>No searches yet. Start searching to see your history!</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading search history:', error);
    recentListEl.innerHTML = `<div class="empty-state"><p>Could not load search history</p></div>`;
  }
}

// Get all foods from database (loaded from foodDatabase.js)
const allFoods = getAllFoods();

// Category icons mapping
const categoryIcons = {
  dairy: '🥛',
  eggs: '🥚',
  peanuts: '🥜',
  treeNuts: '🌰',
  fish: '🐟',
  shellfish: '🦐',
  wheat: '🌾',
  soy: '🫘',
  legumes: '🫘',
  grains: '🌾',
  vegetables: '🥬',
  fruits: '🍎',
  poultry: '🍗',
  redMeat: '🥩',
  dishes: '🍽️',
  desserts: '🧁',
  beverages: '☕',
  condiments: '🥫'
};

// Get category label with icon
function getCategoryLabel(category) {
  const icon = categoryIcons[category] || '🍽️';
  const label = category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
  return `${icon} ${label}`;
}

// Autocomplete functionality
const searchInput = document.getElementById('searchInput');
const suggestionsPanel = document.getElementById('suggestionsPanel');
const searchBtn = document.getElementById('searchBtn');

function showSuggestions(matches) {
  if (!matches || matches.length === 0) {
    suggestionsPanel.style.display = 'none';
    return;
  }

  const limited = matches.slice(0, 15);
  suggestionsPanel.innerHTML = limited
    .map(item => `
      <div class="suggestion-item-dash" data-value="${item.name}">
        <div class="suggestion-content">
          <span class="suggestion-name">${highlightMatch(item.name, searchInput.value)}</span>
          <span class="suggestion-category">${getCategoryLabel(item.category)}</span>
        </div>
      </div>
    `)
    .join('');

  suggestionsPanel.style.display = 'block';
}

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
}

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();

  if (query.length < 2) {
    suggestionsPanel.style.display = 'none';
    return;
  }

  // Smart matching: prioritize starts-with, then contains
  const startsWithMatches = allFoods.filter(food =>
    food.searchText.startsWith(query)
  );
  
  const containsMatches = allFoods.filter(food =>
    !food.searchText.startsWith(query) && food.searchText.includes(query)
  );

  const matches = [...startsWithMatches, ...containsMatches];
  showSuggestions(matches);
});

suggestionsPanel.addEventListener('click', (e) => {
  const item = e.target.closest('.suggestion-item-dash');
  if (!item) return;

  const value = item.getAttribute('data-value');
  searchInput.value = value;
  suggestionsPanel.style.display = 'none';
  performSearch(value);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrapper-dash')) {
    suggestionsPanel.style.display = 'none';
  }
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    suggestionsPanel.style.display = 'none';
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    const firstSuggestion = suggestionsPanel.querySelector('.suggestion-item-dash');
    if (firstSuggestion && suggestionsPanel.style.display !== 'none') {
      const value = firstSuggestion.getAttribute('data-value');
      searchInput.value = value;
      suggestionsPanel.style.display = 'none';
      performSearch(value);
    } else {
      searchBtn.click();
    }
  }
  
  // Arrow key navigation
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    navigateSuggestions(e.key === 'ArrowDown' ? 1 : -1);
  }
});

let selectedIndex = -1;

function navigateSuggestions(direction) {
  const suggestions = suggestionsPanel.querySelectorAll('.suggestion-item-dash');
  if (suggestions.length === 0) return;

  if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
    suggestions[selectedIndex].classList.remove('selected');
  }

  selectedIndex += direction;
  if (selectedIndex < 0) selectedIndex = suggestions.length - 1;
  if (selectedIndex >= suggestions.length) selectedIndex = 0;

  suggestions[selectedIndex].classList.add('selected');
  suggestions[selectedIndex].scrollIntoView({ block: 'nearest' });

  searchInput.value = suggestions[selectedIndex].getAttribute('data-value');
}

// Search functionality with backend API
searchBtn.addEventListener('click', () => {
  const value = searchInput.value.trim();
  if (!value) {
    alert('Please enter a food name to search');
    return;
  }
  performSearch(value);
});

async function performSearch(foodName) {
  searchBtn.disabled = true;
  searchBtn.innerHTML = `
    <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
    </svg>
    Searching...
  `;

  try {
    const response = await fetch(`${API_URL}/food/search?query=${encodeURIComponent(foodName)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    const data = await response.json();

    if (data.success && data.foods && data.foods.length > 0) {
      const firstFood = data.foods[0];
      window.location.href = `food-details.html?foodId=${firstFood.foodId}&name=${encodeURIComponent(foodName)}&searchQuery=${encodeURIComponent(foodName)}`;
    } else {
      alert('No food items found for: ' + foodName + '\n\nTry a different search term or check spelling.');
    }
  } catch (error) {
    console.error('Search error:', error);
    alert('Error searching for food. Please check your connection and try again.');
  } finally {
    searchBtn.disabled = false;
    searchBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      Search
    `;
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  
  return 'Last month';
}

// Logout functionality
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'loginpage.html';
}

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm('Are you sure you want to log out?')) {
    logoutUser();
  }
});

// Initialize dashboard
displayUserInfo();
loadRecentSearches();

// Add spinner animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spinner {
    animation: spin 1s linear infinite;
  }
  .suggestion-item-dash.selected {
    background: #f0f7ff !important;
  }
  .suggestion-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .suggestion-name {
    flex: 1;
  }
  .suggestion-name strong {
    color: #34a853;
    font-weight: 600;
  }
  .suggestion-category {
    font-size: 0.75rem;
    color: #64748b;
    margin-left: 12px;
    white-space: nowrap;
  }
  .recent-item-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .allergen-indicator-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #fee;
    color: #c00;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
  }
  
  /* Scientific Allergy Pills */
  .scientific-allergy-pill {
    background: linear-gradient(135deg, #34a853 0%, #2d8f47 100%);
    color: white;
    padding: 8px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 4px;
    box-shadow: 0 2px 5px rgba(52,168,83,0.25);
    transition: all 0.2s ease;
    border: 1px solid rgba(255,255,255,0.2);
  }
  
  .scientific-allergy-pill:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(52,168,83,0.35);
  }
  
  .allergen-icon {
    font-size: 16px;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
  }
  
  .allergen-text {
    font-weight: 500;
    letter-spacing: 0.3px;
  }
  
  .empty-allergies {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 8px;
    color: #64748b;
    font-size: 13px;
    font-style: italic;
    border: 1px dashed #cbd5e1;
  }
  
  .empty-icon {
    font-size: 20px;
    opacity: 0.6;
  }
`;
document.head.appendChild(style);

// ========================================
// CLEAR HISTORY FUNCTIONALITY
// ========================================
document.getElementById('clearHistoryBtn').addEventListener('click', async () => {
  if (!confirm('Are you sure you want to clear all your search history? This action cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/food/history`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    const data = await response.json();

    if (data.success) {
      showToast('✓ Search history cleared successfully', 'success');
      loadRecentSearches();
    } else {
      throw new Error(data.message || 'Failed to clear history');
    }
  } catch (error) {
    console.error('Error clearing history:', error);
    showToast('✗ Failed to clear history. Please try again.', 'error');
  }
});

// ========================================
// MANAGE ALLERGIES MODAL FUNCTIONALITY
// ========================================

const ALLERGEN_DATABASE = {
  'FDA Priority Allergens': [
    { value: 'Milk', label: 'Milk & Dairy Products', detail: 'Lactose, Casein, Whey proteins' },
    { value: 'Eggs', label: 'Eggs', detail: 'Ovalbumin, Ovomucoid proteins' },
    { value: 'Peanuts', label: 'Peanuts', detail: 'Arachis hypogaea' },
    { value: 'Tree Nuts', label: 'Tree Nuts', detail: 'Almonds, Cashews, Walnuts, etc.' },
    { value: 'Fish', label: 'Fish (Finned)', detail: 'All finned species' },
    { value: 'Shellfish', label: 'Shellfish', detail: 'Crustaceans & Mollusks' },
    { value: 'Wheat', label: 'Wheat', detail: 'Triticum species, gluten' },
    { value: 'Soy', label: 'Soy (Soybean)', detail: 'Glycine max' },
    { value: 'Sesame', label: 'Sesame Seeds', detail: 'Sesamum indicum' }
  ],
  'Common Allergens': [
    { value: 'Gluten', label: 'Gluten', detail: 'Wheat, Barley, Rye' },
    { value: 'Mustard', label: 'Mustard', detail: 'Brassica species' },
    { value: 'Corn', label: 'Corn (Maize)', detail: 'Zea mays' },
    { value: 'Lupin', label: 'Lupin', detail: 'Lupinus species' }
  ],
  'Legumes': [
    { value: 'Chickpeas', label: 'Chickpeas', detail: 'Cicer arietinum' },
    { value: 'Lentils', label: 'Lentils', detail: 'Lens culinaris' },
    { value: 'Peas', label: 'Peas', detail: 'Pisum sativum' },
    { value: 'Beans', label: 'Beans', detail: 'Common beans' }
  ],
  'Seafood': [
    { value: 'Crustaceans', label: 'Crustaceans', detail: 'Shrimp, Crab, Lobster' },
    { value: 'Mollusks', label: 'Mollusks', detail: 'Clams, Oysters, Squid' }
  ],
  'Grains': [
    { value: 'Oats', label: 'Oats', detail: 'Avena sativa' },
    { value: 'Rice', label: 'Rice', detail: 'Oryza sativa' },
    { value: 'Barley', label: 'Barley', detail: 'Hordeum vulgare' },
    { value: 'Rye', label: 'Rye', detail: 'Secale cereale' },
    { value: 'Quinoa', label: 'Quinoa', detail: 'Chenopodium quinoa' },
    { value: 'Buckwheat', label: 'Buckwheat', detail: 'Fagopyrum esculentum' }
  ],
  'Fruits & Vegetables': [
    { value: 'Banana', label: 'Banana', detail: 'Latex cross-reactivity' },
    { value: 'Avocado', label: 'Avocado', detail: 'Latex-fruit syndrome' },
    { value: 'Kiwi', label: 'Kiwi Fruit', detail: 'Actinidia deliciosa' },
    { value: 'Strawberry', label: 'Strawberry', detail: 'Fragaria × ananassa' },
    { value: 'Tomato', label: 'Tomato', detail: 'Nightshade family' },
    { value: 'Potato', label: 'Potato', detail: 'Solanine content' },
    { value: 'Garlic', label: 'Garlic', detail: 'Allium sativum' },
    { value: 'Onion', label: 'Onion', detail: 'Allium cepa' }
  ],
  'Other': [
    { value: 'Gelatin', label: 'Gelatin', detail: 'Animal-derived collagen' },
    { value: 'Cocoa', label: 'Cocoa/Chocolate', detail: 'Theobroma cacao' },
    { value: 'Red Meat', label: 'Red Meat', detail: 'Alpha-gal syndrome' }
  ]
};

let selectedAllergies = [];

document.getElementById('manageAllergiesBtn').addEventListener('click', () => {
  const currentUser = getCurrentUser();
  selectedAllergies = currentUser?.allergies ? [...currentUser.allergies] : [];
  renderAllergenCategories();
  document.getElementById('allergiesModal').classList.add('active');
  document.body.style.overflow = 'hidden';
});

function closeModal() {
  document.getElementById('allergiesModal').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelModalBtn').addEventListener('click', closeModal);

document.getElementById('allergiesModal').addEventListener('click', (e) => {
  if (e.target.id === 'allergiesModal') {
    closeModal();
  }
});

function renderAllergenCategories(searchTerm = '') {
  const container = document.getElementById('allergenCategoriesModal');
  container.innerHTML = '';

  Object.entries(ALLERGEN_DATABASE).forEach(([category, allergens]) => {
    const filtered = searchTerm 
      ? allergens.filter(a => 
          a.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.detail.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allergens;

    if (filtered.length === 0) return;

    const categoryEl = document.createElement('div');
    categoryEl.className = 'allergen-category-modal';
    
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header-modal';
    categoryHeader.textContent = category;
    categoryEl.appendChild(categoryHeader);

    filtered.forEach(allergen => {
      const allergenEl = document.createElement('label');
      allergenEl.className = 'allergen-option-modal';
      
      const isSelected = selectedAllergies.includes(allergen.value);
      if (isSelected) {
        allergenEl.classList.add('selected');
      }

      allergenEl.innerHTML = `
        <input type="checkbox" value="${allergen.value}" ${isSelected ? 'checked' : ''} />
        <div class="allergen-info">
          <span class="allergen-label">${allergen.label}</span>
          <span class="allergen-detail-text">${allergen.detail}</span>
        </div>
        <div class="check-indicator">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      `;

      allergenEl.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!selectedAllergies.includes(allergen.value)) {
            selectedAllergies.push(allergen.value);
          }
          allergenEl.classList.add('selected');
        } else {
          selectedAllergies = selectedAllergies.filter(a => a !== allergen.value);
          allergenEl.classList.remove('selected');
        }
      });

      categoryEl.appendChild(allergenEl);
    });

    container.appendChild(categoryEl);
  });

  if (container.children.length === 0) {
    container.innerHTML = '<div class="no-results">No allergens found matching your search.</div>';
  }
}

document.getElementById('allergenSearchInput').addEventListener('input', (e) => {
  renderAllergenCategories(e.target.value.trim());
});

document.getElementById('saveAllergiesBtn').addEventListener('click', async () => {
  const saveBtn = document.getElementById('saveAllergiesBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = `
    <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
    </svg>
    Saving...
  `;

  try {
    const response = await fetch(`${API_URL}/users/allergies`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ allergies: selectedAllergies })
    });

    const data = await response.json();

    if (data.success) {
      const user = getCurrentUser();
      user.allergies = data.allergies;
      localStorage.setItem('user', JSON.stringify(user));
      
      showToast('✓ Allergies updated successfully', 'success');
      displayUserInfo();
      closeModal();
    } else {
      throw new Error(data.message || 'Failed to update allergies');
    }
  } catch (error) {
    console.error('Error saving allergies:', error);
    showToast('✗ Failed to save allergies. Please try again.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Save Changes
    `;
  }
});

function showToast(message, type = 'info') {
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
