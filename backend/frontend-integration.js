// ============================================
// FRONTEND INTEGRATION GUIDE
// Copy this code to connect your frontend to the backend
// ============================================

// Configuration
const API_URL = 'http://localhost:5000/api';

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Register a new user
 */
async function registerUser(name, email, password, allergies = []) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, allergies })
        });

        const data = await response.json();

        if (data.success) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, data };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

/**
 * Login user
 */
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, data };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

/**
 * Logout user
 */
function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'loginpage.html';
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Get auth token
 */
function getAuthToken() {
    return localStorage.getItem('token');
}

// ============================================
// USER PROFILE FUNCTIONS
// ============================================

/**
 * Get user profile
 */
async function getUserProfile() {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            // Update stored user info
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return { success: false, message: 'Error fetching profile' };
    }
}

/**
 * Update user profile
 */
async function updateUserProfile(name, email) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email })
        });

        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return data;
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, message: 'Error updating profile' };
    }
}

// ============================================
// ALLERGY MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get user allergies
 */
async function getUserAllergies() {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/users/allergies`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Error fetching allergies:', error);
        return { success: false, message: 'Error fetching allergies' };
    }
}

/**
 * Add a new allergy
 */
async function addAllergy(allergy) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/users/allergies`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ allergy })
        });

        const data = await response.json();
        
        if (data.success) {
            // Update stored user info
            const user = getCurrentUser();
            user.allergies = data.allergies;
            localStorage.setItem('user', JSON.stringify(user));
        }
        
        return data;
    } catch (error) {
        console.error('Error adding allergy:', error);
        return { success: false, message: 'Error adding allergy' };
    }
}

/**
 * Remove an allergy
 */
async function removeAllergy(allergy) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/users/allergies/${allergy}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            const user = getCurrentUser();
            user.allergies = data.allergies;
            localStorage.setItem('user', JSON.stringify(user));
        }
        
        return data;
    } catch (error) {
        console.error('Error removing allergy:', error);
        return { success: false, message: 'Error removing allergy' };
    }
}

/**
 * Update all allergies
 */
async function updateAllergies(allergies) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/users/allergies`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ allergies })
        });

        const data = await response.json();
        
        if (data.success) {
            const user = getCurrentUser();
            user.allergies = data.allergies;
            localStorage.setItem('user', JSON.stringify(user));
        }
        
        return data;
    } catch (error) {
        console.error('Error updating allergies:', error);
        return { success: false, message: 'Error updating allergies' };
    }
}

// ============================================
// FOOD SEARCH FUNCTIONS
// ============================================

/**
 * Search for food items
 */
async function searchFood(query) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/food/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Error searching food:', error);
        return { success: false, message: 'Error searching for food' };
    }
}

/**
 * Get detailed food information
 */
async function getFoodDetails(foodId, quantity = 100) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/food/details`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ foodId, quantity })
        });

        return await response.json();
    } catch (error) {
        console.error('Error fetching food details:', error);
        return { success: false, message: 'Error fetching food details' };
    }
}

/**
 * Get search history
 */
async function getSearchHistory(limit = 10) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/food/history?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Error fetching history:', error);
        return { success: false, message: 'Error fetching search history' };
    }
}

/**
 * Delete a history item
 */
async function deleteHistoryItem(historyId) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/food/history/${historyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Error deleting history:', error);
        return { success: false, message: 'Error deleting history item' };
    }
}

/**
 * Clear all search history
 */
async function clearSearchHistory() {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/food/history`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Error clearing history:', error);
        return { success: false, message: 'Error clearing history' };
    }
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: User Registration
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const allergies = ['peanuts', 'dairy']; // Get from form
    
    const result = await registerUser(name, email, password, allergies);
    
    if (result.success) {
        alert('Registration successful!');
        window.location.href = 'dashboard.html';
    } else {
        alert(result.message);
    }
});

// Example 2: User Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const result = await loginUser(email, password);
    
    if (result.success) {
        window.location.href = 'dashboard.html';
    } else {
        alert(result.message);
    }
});

// Example 3: Search Food
document.getElementById('searchBtn').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value;
    
    if (!query) {
        alert('Please enter a food name');
        return;
    }
    
    const result = await searchFood(query);
    
    if (result.success) {
        displayFoodResults(result.foods);
    } else {
        alert('No food items found');
    }
});

// Example 4: Get Food Details
async function showFoodDetails(foodId) {
    const result = await getFoodDetails(foodId, 100);
    
    if (result.success) {
        const food = result.food;
        
        // Display food details
        document.getElementById('foodName').textContent = food.label;
        document.getElementById('calories').textContent = food.calories;
        document.getElementById('protein').textContent = food.nutrients.protein;
        document.getElementById('carbs').textContent = food.nutrients.carbs;
        document.getElementById('fats').textContent = food.nutrients.fat;
        
        // Check for allergens
        if (food.allergenDetected) {
            document.getElementById('allergenWarning').style.display = 'block';
            document.getElementById('detectedAllergens').textContent = 
                food.detectedAllergens.join(', ');
        }
    }
}

// Example 5: Load Dashboard Data
async function loadDashboard() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'loginpage.html';
        return;
    }
    
    // Display user info
    const user = getCurrentUser();
    document.getElementById('userName').textContent = user.name;
    
    // Load allergies
    const allergiesResult = await getUserAllergies();
    if (allergiesResult.success) {
        displayAllergies(allergiesResult.allergies);
    }
    
    // Load search history
    const historyResult = await getSearchHistory(5);
    if (historyResult.success) {
        displaySearchHistory(historyResult.history);
    }
}

// Example 6: Add Allergy
async function addNewAllergy() {
    const allergy = prompt('Enter allergy:');
    
    if (allergy) {
        const result = await addAllergy(allergy);
        
        if (result.success) {
            alert('Allergy added successfully!');
            // Refresh allergy list
            loadAllergies();
        } else {
            alert(result.message);
        }
    }
}

// Example 7: Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        logoutUser();
    }
});
*/

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Display loading indicator
 */
function showLoading() {
    document.getElementById('loading')?.classList.remove('hidden');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    document.getElementById('loading')?.classList.add('hidden');
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => successDiv.remove(), 3000);
}
