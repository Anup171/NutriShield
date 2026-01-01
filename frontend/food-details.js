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

// Get food info from URL parameters
function getFoodInfoFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    foodId: params.get('foodId'),
    name: params.get('name') || 'Unknown Food',
    searchQuery: params.get('searchQuery') || params.get('name') || 'Unknown Food'
  };
}

// Display food details with backend API
async function displayFoodDetails() {
  const foodInfo = getFoodInfoFromURL();
  
  if (!foodInfo.foodId) {
    alert('No food ID provided');
    window.location.href = 'dashboard.html';
    return;
  }

  const userData = getCurrentUser();
  
  // Show loading state
  document.getElementById('foodName').textContent = foodInfo.name;
  document.getElementById('foodCategory').textContent = 'Loading...';

  try {
    // Get detailed food information from backend
    const response = await fetch(`${API_URL}/food/details`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        foodId: foodInfo.foodId,
        quantity: 100,
        searchQuery: foodInfo.searchQuery // Pass the original search query
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch food details');
    }

    const food = data.food;
    
    // Update page title and name
    document.getElementById('foodName').textContent = food.label;
    document.getElementById('foodCategory').textContent = food.category || 'General Food';
    document.title = `${food.label} - Food Details`;
    
    // Update nutrition values with proper formatting
    document.getElementById('calories').textContent = Math.round(food.calories);
    document.getElementById('protein').textContent = food.nutrients.protein?.toFixed(1) || '0.0';
    document.getElementById('carbs').textContent = food.nutrients.carbs?.toFixed(1) || '0.0';
    document.getElementById('fat').textContent = food.nutrients.fat?.toFixed(1) || '0.0';
    document.getElementById('satFat').textContent = food.nutrients.saturatedFat?.toFixed(1) || '0.0';
    document.getElementById('fiber').textContent = food.nutrients.fiber?.toFixed(1) || '0.0';
    document.getElementById('sugar').textContent = food.nutrients.sugar?.toFixed(1) || '0.0';
    document.getElementById('sodium').textContent = Math.round(food.nutrients.sodium || 0);

    // Update serving size
    document.querySelector('.serving-badge').textContent = `Per Serving (${food.quantity}g)`;

    // Update ingredients section with better formatting
    const ingredientsList = document.getElementById('ingredientsList');
    ingredientsList.innerHTML = '';
    
    if (food.ingredients && food.ingredients.length > 0) {
      // Filter out empty or very short ingredient names
      const validIngredients = food.ingredients.filter(ing => 
        ing && ing.trim().length > 1
      );
      
      if (validIngredients.length > 0) {
        validIngredients.forEach(ingredient => {
          const tag = document.createElement('span');
          tag.className = 'ingredient-tag';
          // Capitalize first letter
          tag.textContent = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
          ingredientsList.appendChild(tag);
        });
        document.getElementById('ingredientCount').textContent = `${validIngredients.length} ingredient${validIngredients.length !== 1 ? 's' : ''}`;
      } else {
        ingredientsList.innerHTML = '<span class="ingredient-tag">Ingredient information not available</span>';
        document.getElementById('ingredientCount').textContent = 'Ingredients';
      }
    } else {
      ingredientsList.innerHTML = '<span class="ingredient-tag">Ingredient information not available</span>';
      document.getElementById('ingredientCount').textContent = 'Ingredients';
    }

    // Update allergen tags (general food health tags)
    const allergenTags = document.getElementById('allergenTags');
    const healthLabels = food.healthLabels || [];
    
    if (healthLabels.length > 0) {
      allergenTags.innerHTML = healthLabels.slice(0, 5).map(label => {
        // Determine tag style based on label type
        let tagClass = 'allergen-tag safe';
        if (label.toLowerCase().includes('free') || label.toLowerCase().includes('low')) {
          tagClass = 'allergen-tag safe';
        } else if (label.toLowerCase().includes('high')) {
          tagClass = 'allergen-tag warning';
        }
        return `<span class="${tagClass}">${label}</span>`;
      }).join('');
    } else {
      allergenTags.innerHTML = '<span class="allergen-tag safe">No specific health labels</span>';
    }

    // Check user allergies and show warning - IMPROVED VISIBILITY
    if (food.allergenDetected && food.detectedAllergens && food.detectedAllergens.length > 0) {
      // Show prominent warning
      const warningDiv = document.getElementById('allergyWarning');
      warningDiv.innerHTML = ''; // Clear existing content
      warningDiv.style.display = 'flex';
      warningDiv.style.flexDirection = 'column';
      warningDiv.style.background = 'linear-gradient(135deg, #fee, #fdd)';
      warningDiv.style.border = '3px solid #dc2626';
      warningDiv.style.padding = '24px';
      warningDiv.style.borderRadius = '12px';
      warningDiv.style.marginTop = '20px';
      warningDiv.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.3)';
      
      // Add main warning icon and title
      const warningHeader = document.createElement('div');
      warningHeader.style.display = 'flex';
      warningHeader.style.alignItems = 'center';
      warningHeader.style.gap = '12px';
      warningHeader.style.marginBottom = '16px';
      warningHeader.innerHTML = `
        <span style="font-size: 32px;">⚠️</span>
        <h3 style="margin: 0; color: #dc2626; font-size: 20px; font-weight: 700;">ALLERGY ALERT!</h3>
      `;
      warningDiv.appendChild(warningHeader);
      
      // Add warning message
      const warningText = document.createElement('p');
      warningText.style.margin = '0 0 16px 0';
      warningText.style.fontWeight = '600';
      warningText.style.color = '#991b1b';
      warningText.style.fontSize = '16px';
      warningText.style.lineHeight = '1.5';
      warningText.textContent = `This food contains ${food.detectedAllergens.length} allergen(s) that you're allergic to. Do NOT consume!`;
      warningDiv.appendChild(warningText);
      
      // Add detected allergens
      const detectedContainer = document.createElement('div');
      detectedContainer.style.display = 'flex';
      detectedContainer.style.flexWrap = 'wrap';
      detectedContainer.style.gap = '10px';
      
      food.detectedAllergens.forEach(allergen => {
        const pill = document.createElement('span');
        pill.style.background = '#dc2626';
        pill.style.color = 'white';
        pill.style.padding = '8px 16px';
        pill.style.borderRadius = '8px';
        pill.style.fontSize = '15px';
        pill.style.fontWeight = '700';
        pill.style.textTransform = 'uppercase';
        pill.style.letterSpacing = '0.5px';
        pill.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.4)';
        pill.textContent = `⚠️ ${allergen}`;
        detectedContainer.appendChild(pill);
      });
      
      warningDiv.appendChild(detectedContainer);
      
      document.getElementById('safeIndicator').style.display = 'none';
      
    } else {
      // Show safe indicator
      const safeDiv = document.getElementById('safeIndicator');
      safeDiv.style.display = 'flex';
      safeDiv.style.background = 'linear-gradient(135deg, #d4f4dd, #b8e6c4)';
      safeDiv.style.border = '2px solid #10b981';
      safeDiv.style.padding = '16px';
      safeDiv.style.borderRadius = '12px';
      safeDiv.style.marginTop = '20px';
      safeDiv.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
      
      document.getElementById('allergyWarning').style.display = 'none';
      
      // Enhance safe message
      const safeIcon = safeDiv.querySelector('.safe-icon');
      if (!safeIcon) {
        const icon = document.createElement('span');
        icon.className = 'safe-icon';
        icon.style.fontSize = '24px';
        icon.style.marginRight = '12px';
        icon.textContent = '✓';
        safeDiv.insertBefore(icon, safeDiv.firstChild);
      }
      
      const safeText = safeDiv.querySelector('p');
      if (safeText) {
        safeText.style.fontWeight = '600';
        safeText.style.color = '#047857';
        safeText.textContent = '✓ Safe to consume - No allergens detected';
      }
    }
    
  } catch (error) {
    console.error('Error fetching food details:', error);
    document.getElementById('foodCategory').textContent = 'Error loading data';
    
    // Show error message to user
    const foodName = document.getElementById('foodName');
    foodName.innerHTML = `
      <div style="color: #e74c3c; font-size: 16px; margin-top: 10px;">
        <p>Unable to load food details. ${error.message}</p>
        <button onclick="window.location.href='dashboard.html'" style="
          background: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
        ">Return to Dashboard</button>
      </div>
    `;
  }
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

// Initialize page
displayFoodDetails();
