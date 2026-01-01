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

// Display allergies
function displayAllergies(allergies) {
  const allergyListEl = document.getElementById('allergyList');
  
  if (!allergies || allergies.length === 0) {
    allergyListEl.innerHTML = '<div class="empty-allergies">No allergies listed</div>';
    return;
  }

  allergyListEl.innerHTML = '';
  allergies.forEach(allergy => {
    const pill = document.createElement('span');
    pill.className = 'allergy-pill-dash';
    pill.textContent = allergy;
    allergyListEl.appendChild(pill);
  });
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
        
        // Display food name or 'Unknown Food' if not available
        const displayName = search.foodName || 'Unknown Food';
        const displayTime = search.searchedAt ? getTimeAgo(new Date(search.searchedAt)) : 'Recently';
        
        // Add allergen indicator if detected
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
        
        // Only make clickable if we have a valid foodId
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

// COMPREHENSIVE FOOD DATABASE - Organized and Error-Free
const foodDatabase = {
  // 🍎 Fruits
  fruits: [
    "Apple", "Apricot", "Avocado", "Banana", "Blackberry", "Blueberry", 
    "Cantaloupe", "Cherry", "Clementine", "Coconut", "Cranberry",
    "Dates", "Dragon Fruit", "Fig", "Grapefruit", "Grape", "Guava",
    "Honeydew", "Kiwi", "Lemon", "Lime", "Lychee", "Mango",
    "Orange", "Papaya", "Passion Fruit", "Peach", "Pear", "Pineapple",
    "Plum", "Pomegranate", "Raspberry", "Strawberry", "Tangerine", "Watermelon"
  ],
  
  // 🥬 Vegetables
  vegetables: [
    "Artichoke", "Arugula", "Asparagus", "Beetroot", "Bell Pepper",
    "Bok Choy", "Broccoli", "Brussels Sprouts", "Cabbage", "Carrot",
    "Cauliflower", "Celery", "Chard", "Corn", "Cucumber",
    "Eggplant", "Garlic", "Green Beans", "Kale", "Leek", "Lettuce",
    "Mushroom", "Okra", "Onion", "Peas", "Potato", "Pumpkin",
    "Radish", "Spinach", "Squash", "Sweet Potato", "Tomato", "Turnip", "Zucchini"
  ],
  
  // 🍖 Proteins - Meat
  meat: [
    "Bacon", "Beef Ribs", "Beef Steak", "Ground Beef", "Ham",
    "Lamb Chops", "Pork Chops", "Sausage"
  ],
  
  // 🍗 Proteins - Poultry
  poultry: [
    "Chicken Breast", "Chicken Thigh", "Chicken Wings", "Ground Chicken",
    "Roasted Chicken", "Turkey", "Duck"
  ],
  
  // 🐟 Proteins - Seafood
  seafood: [
    "Cod", "Crab", "Lobster", "Salmon", "Scallops", "Shrimp",
    "Tilapia", "Tuna"
  ],
  
  // 🫘 Proteins - Plant-Based
  plantProtein: [
    "Black Beans", "Chickpeas", "Edamame", "Kidney Beans",
    "Lentils", "Pinto Beans", "Tempeh", "Tofu"
  ],
  
  // 🥚 Eggs & Dairy
  eggsAndDairy: [
    "Eggs", "Scrambled Eggs", "Boiled Eggs", "Fried Eggs", "Omelet"
  ],
  
  // 🥛 Dairy Products
  dairy: [
    "Almond Milk", "Butter", "Cheddar Cheese", "Cottage Cheese",
    "Cream Cheese", "Feta Cheese", "Ghee", "Goat Cheese",
    "Greek Yogurt", "Heavy Cream", "Ice Cream", "Milk",
    "Mozzarella Cheese", "Oat Milk", "Parmesan Cheese",
    "Ricotta Cheese", "Skim Milk", "Sour Cream", "Soy Milk",
    "Swiss Cheese", "Whipped Cream", "Whole Milk", "Yogurt"
  ],
  
  // 🌾 Grains & Rice
  grains: [
    "Basmati Rice", "Brown Rice", "Bulgur", "Couscous",
    "Jasmine Rice", "Oatmeal", "Oats", "Quinoa",
    "White Rice", "Wild Rice"
  ],
  
  // 🍞 Bread & Baked Goods
  bread: [
    "Bagel", "Baguette", "Bread", "Croissant", "English Muffin",
    "Naan", "Pita Bread", "Rye Bread", "Sourdough Bread",
    "Tortilla", "Whole Wheat Bread", "White Bread"
  ],
  
  // 🍝 Pasta & Noodles
  pasta: [
    "Fettuccine", "Lasagna", "Macaroni", "Pasta", "Penne",
    "Ramen Noodles", "Rice Noodles", "Spaghetti", "Udon Noodles"
  ],
  
  // 🍛 Indian Cuisine
  indian: [
    "Aloo Gobi", "Biryani", "Butter Chicken", "Chana Masala",
    "Chapati", "Chicken Biryani", "Chicken Curry", "Chicken Tikka Masala",
    "Chole Bhature", "Dal Makhani", "Dal Tadka", "Dosa", "Idli",
    "Kadhi", "Khichdi", "Kulcha", "Pakora", "Palak Paneer",
    "Paneer Butter Masala", "Paneer Tikka", "Paratha", "Pav Bhaji",
    "Puri", "Raita", "Rajma", "Roti", "Samosa", "Tandoori Chicken",
    "Uttapam", "Vada", "Vada Pav", "Vegetable Biryani"
  ],
  
  // 🍕 Fast Food
  fastFood: [
    "BLT Sandwich", "Burger", "Burrito", "Cheeseburger",
    "Chicken Burger", "Chicken Nuggets", "Club Sandwich",
    "Fish and Chips", "French Fries", "Fried Chicken",
    "Grilled Cheese Sandwich", "Hamburger", "Hot Dog",
    "Nachos", "Onion Rings", "Pepperoni Pizza", "Pizza",
    "Quesadilla", "Sandwich", "Taco", "Veggie Burger"
  ],
  
  // 🍣 International Cuisine
  international: [
    "Bibimbap", "California Roll", "Ceviche", "Empanada",
    "Enchiladas", "Falafel", "Fried Rice", "Hummus", "Kebab",
    "Kimchi", "Kung Pao Chicken", "Lo Mein", "Pad Thai",
    "Paella", "Pho", "Ramen", "Risotto", "Salmon Sashimi",
    "Shawarma", "Spaghetti Carbonara", "Spring Roll", "Sushi",
    "Sweet and Sour Chicken", "Tamales", "Tom Yum Soup", "Tuna Roll"
  ],
  
  // 🍿 Snacks
  snacks: [
    "Almond Butter", "Crackers", "Granola Bar", "Peanut Butter",
    "Popcorn", "Potato Chips", "Pretzels", "Protein Bar",
    "Rice Cakes", "Tortilla Chips", "Trail Mix"
  ],
  
  // 🍰 Desserts & Sweets
  desserts: [
    "Brownies", "Cake", "Candy", "Cheesecake", "Chocolate",
    "Cookies", "Cupcake", "Dark Chocolate", "Donut",
    "Jam", "Jelly", "Milk Chocolate", "Muffin", "Pie", "Pudding"
  ],
  
  // ☕ Beverages
  beverages: [
    "Apple Juice", "Black Tea", "Cappuccino", "Chai", "Coffee",
    "Cranberry Juice", "Energy Drink", "Espresso", "Green Tea",
    "Hot Chocolate", "Latte", "Milkshake", "Orange Juice",
    "Protein Shake", "Smoothie", "Soda", "Tea"
  ]
};

// Flatten all foods into single array with categories
const allFoods = [];
Object.keys(foodDatabase).forEach(category => {
  foodDatabase[category].forEach(food => {
    allFoods.push({
      name: food,
      category: category,
      searchText: food.toLowerCase()
    });
  });
});

// Sort alphabetically
allFoods.sort((a, b) => a.name.localeCompare(b.name));

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

function getCategoryLabel(category) {
  const labels = {
    fruits: '🍎 Fruit',
    vegetables: '🥬 Vegetable',
    meat: '🍖 Meat',
    poultry: '🍗 Poultry',
    seafood: '🐟 Seafood',
    plantProtein: '🫘 Plant Protein',
    eggsAndDairy: '🥚 Eggs',
    dairy: '🥛 Dairy',
    grains: '🌾 Grain',
    bread: '🍞 Bread',
    pasta: '🍝 Pasta',
    indian: '🍛 Indian',
    fastFood: '🍔 Fast Food',
    international: '🍣 International',
    snacks: '🍿 Snack',
    desserts: '🍰 Dessert',
    beverages: '☕ Beverage'
  };
  return labels[category] || '🍽️ Food';
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

  // Remove previous selection
  if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
    suggestions[selectedIndex].classList.remove('selected');
  }

  // Update index
  selectedIndex += direction;
  if (selectedIndex < 0) selectedIndex = suggestions.length - 1;
  if (selectedIndex >= suggestions.length) selectedIndex = 0;

  // Add new selection
  suggestions[selectedIndex].classList.add('selected');
  suggestions[selectedIndex].scrollIntoView({ block: 'nearest' });

  // Update input
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
  // Show loading state
  searchBtn.disabled = true;
  searchBtn.innerHTML = `
    <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
    </svg>
    Searching...
  `;

  try {
    // Search for food using backend API
    const response = await fetch(`${API_URL}/food/search?query=${encodeURIComponent(foodName)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    const data = await response.json();

    if (data.success && data.foods && data.foods.length > 0) {
      // Take the first result and redirect to details page
      // PASS THE ORIGINAL SEARCH QUERY so history shows what user typed
      const firstFood = data.foods[0];
      window.location.href = `food-details.html?foodId=${firstFood.foodId}&name=${encodeURIComponent(foodName)}&searchQuery=${encodeURIComponent(foodName)}`;
    } else {
      alert('No food items found for: ' + foodName + '\n\nTry a different search term or check spelling.');
    }
  } catch (error) {
    console.error('Search error:', error);
    alert('Error searching for food. Please check your connection and try again.');
  } finally {
    // Reset button state
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

// Add some CSS for spinner animation and styling
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
    color: #2563eb;
    font-weight: 600;
  }
  .suggestion-category {
    font-size: 0.75rem;
    color: #64748b;
    margin-left: 12px;
    whitespace: nowrap;
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
`;
document.head.appendChild(style);
