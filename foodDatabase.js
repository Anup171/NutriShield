/**
 * UNIFIED FOOD DATABASE
 * Contains foods that are allergen-detectable by the backend system
 * Organized by category for easy autocomplete
 */

const FOOD_DATABASE = {
  // 🥛 DAIRY PRODUCTS (Milk Allergen)
  dairy: [
    "Milk", "Whole Milk", "Skim Milk", "2% Milk",
    "Butter", "Ghee", "Clarified Butter",
    "Cheese", "Cheddar Cheese", "Mozzarella Cheese", "Parmesan Cheese",
    "Swiss Cheese", "Feta Cheese", "Goat Cheese", "Cream Cheese",
    "Cottage Cheese", "Ricotta Cheese", "Blue Cheese",
    "Yogurt", "Greek Yogurt", "Plain Yogurt",
    "Cream", "Heavy Cream", "Sour Cream", "Whipped Cream",
    "Ice Cream", "Frozen Yogurt",
    "Paneer", "Raita", "Lassi"
  ],

  // 🥚 EGGS
  eggs: [
    "Eggs", "Whole Eggs", "Egg Whites", "Egg Yolks",
    "Scrambled Eggs", "Fried Eggs", "Boiled Eggs",
    "Poached Eggs", "Omelet", "Frittata",
    "Deviled Eggs", "Egg Salad"
  ],

  // 🥜 PEANUTS
  peanuts: [
    "Peanuts", "Roasted Peanuts", "Salted Peanuts",
    "Peanut Butter", "Peanut Oil"
  ],

  // 🌰 TREE NUTS
  treeNuts: [
    "Almonds", "Roasted Almonds", "Almond Butter", "Almond Milk",
    "Cashews", "Cashew Butter", "Cashew Milk",
    "Walnuts", "Walnut Pieces",
    "Pecans", "Pecan Halves",
    "Pistachios", "Pistachio Kernels",
    "Hazelnuts", "Hazelnut Spread",
    "Macadamia Nuts",
    "Pine Nuts",
    "Brazil Nuts",
    "Chestnuts",
    "Mixed Nuts", "Trail Mix"
  ],

  // 🐟 FISH
  fish: [
    "Salmon", "Grilled Salmon", "Smoked Salmon", "Salmon Fillet",
    "Tuna", "Tuna Steak", "Canned Tuna",
    "Cod", "Cod Fillet",
    "Tilapia", "Tilapia Fillet",
    "Halibut", "Halibut Steak",
    "Trout", "Rainbow Trout",
    "Bass", "Sea Bass",
    "Sardines", "Canned Sardines",
    "Anchovies",
    "Mackerel",
    "Swordfish",
    "Fish Sticks", "Fish and Chips"
  ],

  // 🦐 SHELLFISH
  shellfish: [
    "Shrimp", "Grilled Shrimp", "Fried Shrimp", "Shrimp Scampi",
    "Crab", "Crab Meat", "Crab Legs", "Crab Cakes",
    "Lobster", "Lobster Tail", "Lobster Roll",
    "Clams", "Clam Chowder",
    "Mussels", "Steamed Mussels",
    "Oysters", "Raw Oysters",
    "Scallops", "Seared Scallops",
    "Squid", "Calamari", "Fried Calamari",
    "Octopus"
  ],

  // 🌾 WHEAT & GLUTEN
  wheat: [
    "Bread", "White Bread", "Whole Wheat Bread", "Wheat Bread",
    "Bagel", "Plain Bagel", "Wheat Bagel",
    "Baguette", "French Bread",
    "Pita Bread", "Whole Wheat Pita",
    "Naan", "Garlic Naan",
    "Tortilla", "Flour Tortilla", "Wheat Tortilla",
    "Croissant", "Butter Croissant",
    "Pasta", "Spaghetti", "Penne", "Fettuccine", "Linguine",
    "Macaroni", "Macaroni and Cheese",
    "Lasagna", "Ravioli",
    "Noodles", "Egg Noodles", "Ramen Noodles", "Udon Noodles",
    "Couscous", "Bulgur", "Semolina",
    "Crackers", "Wheat Crackers",
    "Cereal", "Wheat Cereal",
    "Pretzels", "Soft Pretzels",
    "Pancakes", "Waffles",
    "Cookies", "Cake", "Muffins", "Donuts",
    "Pizza", "Pizza Dough",
    "Seitan"
  ],

  // 🫘 SOY
  soy: [
    "Tofu", "Firm Tofu", "Silken Tofu", "Fried Tofu",
    "Tempeh", "Tempeh Strips",
    "Edamame", "Steamed Edamame",
    "Soy Milk", "Soy Sauce",
    "Miso", "Miso Soup",
    "Natto"
  ],

  // 🌾 LEGUMES
  legumes: [
    "Chickpeas", "Roasted Chickpeas", "Hummus", "Falafel", "Chana Masala",
    "Lentils", "Red Lentils", "Green Lentils", "Lentil Soup", "Dal",
    "Black Beans", "Refried Beans",
    "Kidney Beans", "Rajma",
    "Pinto Beans",
    "Green Peas", "Split Peas", "Pea Soup",
    "Lima Beans",
    "Baked Beans"
  ],

  // 🌽 GRAINS (Potential Allergens)
  grains: [
    "Rice", "White Rice", "Brown Rice", "Basmati Rice", "Jasmine Rice",
    "Wild Rice", "Fried Rice", "Rice Pilaf",
    "Oats", "Oatmeal", "Steel Cut Oats", "Granola",
    "Quinoa", "Quinoa Salad",
    "Barley", "Barley Soup",
    "Buckwheat", "Buckwheat Pancakes",
    "Corn", "Corn on the Cob", "Cornmeal", "Polenta", "Grits",
    "Popcorn"
  ],

  // 🍅 VEGETABLES (Common Allergens)
  vegetables: [
    "Tomato", "Cherry Tomatoes", "Tomato Sauce", "Marinara Sauce",
    "Ketchup", "Salsa",
    "Potato", "Baked Potato", "Mashed Potatoes", "French Fries",
    "Hash Browns", "Potato Salad",
    "Sweet Potato", "Sweet Potato Fries",
    "Garlic", "Roasted Garlic", "Garlic Bread",
    "Onion", "Red Onion", "Caramelized Onions", "Onion Rings",
    "Bell Pepper", "Stuffed Peppers",
    "Broccoli", "Steamed Broccoli",
    "Cauliflower", "Roasted Cauliflower",
    "Spinach", "Sautéed Spinach",
    "Kale", "Kale Salad",
    "Lettuce", "Romaine Lettuce",
    "Cucumber", "Pickles",
    "Carrot", "Baby Carrots",
    "Celery",
    "Mushrooms", "Portobello Mushrooms",
    "Zucchini", "Grilled Zucchini",
    "Eggplant", "Grilled Eggplant",
    "Asparagus", "Roasted Asparagus"
  ],

  // 🍎 FRUITS (Common Allergens)
  fruits: [
    "Banana", "Banana Bread",
    "Avocado", "Guacamole",
    "Kiwi", "Kiwi Fruit",
    "Strawberry", "Strawberries", "Strawberry Jam",
    "Apple", "Green Apple", "Apple Pie",
    "Orange", "Orange Juice",
    "Grapes", "Red Grapes", "Green Grapes",
    "Mango", "Mango Slices",
    "Pineapple", "Pineapple Chunks",
    "Watermelon", "Watermelon Slices",
    "Blueberries", "Fresh Blueberries",
    "Raspberries",
    "Blackberries",
    "Peach", "Peaches",
    "Pear"
  ],

  // 🍗 POULTRY
  poultry: [
    "Chicken", "Chicken Breast", "Grilled Chicken", "Fried Chicken",
    "Chicken Wings", "Buffalo Wings",
    "Chicken Thighs", "Roasted Chicken",
    "Chicken Nuggets", "Chicken Tenders",
    "Turkey", "Turkey Breast", "Roasted Turkey",
    "Duck", "Roasted Duck"
  ],

  // 🥩 RED MEAT
  redMeat: [
    "Beef", "Beef Steak", "Ribeye Steak", "Sirloin Steak",
    "Ground Beef", "Beef Burger", "Hamburger",
    "Beef Ribs", "Short Ribs",
    "Roast Beef",
    "Pork", "Pork Chops", "Pork Tenderloin",
    "Bacon", "Crispy Bacon",
    "Ham", "Honey Ham",
    "Sausage", "Italian Sausage", "Breakfast Sausage",
    "Lamb", "Lamb Chops", "Lamb Curry",
    "Pepperoni", "Salami"
  ],

  // 🍕 POPULAR DISHES (Multiple Allergens)
  dishes: [
    // Italian
    "Pizza", "Pepperoni Pizza", "Cheese Pizza", "Margherita Pizza",
    "Spaghetti", "Spaghetti Carbonara", "Spaghetti Bolognese",
    "Lasagna", "Fettuccine Alfredo",
    
    // Asian
    "Fried Rice", "Chicken Fried Rice", "Vegetable Fried Rice",
    "Ramen", "Chicken Ramen", "Miso Ramen",
    "Pad Thai", "Chicken Pad Thai",
    "Sushi", "California Roll", "Tuna Roll", "Salmon Roll",
    "Spring Rolls", "Egg Rolls",
    "Lo Mein", "Chow Mein",
    "Teriyaki Chicken",
    
    // Indian
    "Chicken Tikka Masala", "Butter Chicken", "Chicken Curry",
    "Paneer Butter Masala", "Palak Paneer",
    "Biryani", "Chicken Biryani", "Vegetable Biryani",
    "Samosa", "Vegetable Samosa",
    "Naan Bread", "Garlic Naan",
    "Dal Makhani", "Dal Tadka",
    
    // Mexican
    "Tacos", "Beef Tacos", "Chicken Tacos", "Fish Tacos",
    "Burrito", "Beef Burrito", "Chicken Burrito",
    "Quesadilla", "Cheese Quesadilla",
    "Enchiladas", "Nachos",
    
    // American
    "Burger", "Cheeseburger", "Bacon Burger",
    "Hot Dog", "Corn Dog",
    "Grilled Cheese Sandwich",
    "BLT Sandwich",
    "Club Sandwich",
    "Mac and Cheese", "Macaroni and Cheese",
    "Fried Chicken", "Buffalo Wings",
    "Fish and Chips",
    
    // Breakfast
    "Pancakes", "Buttermilk Pancakes",
    "Waffles", "Belgian Waffles",
    "French Toast",
    "Scrambled Eggs", "Omelet",
    "Eggs Benedict"
  ],

  // 🧁 DESSERTS & SWEETS
  desserts: [
    "Cake", "Chocolate Cake", "Vanilla Cake", "Cheesecake",
    "Cookies", "Chocolate Chip Cookies", "Peanut Butter Cookies",
    "Brownies", "Chocolate Brownies",
    "Muffins", "Blueberry Muffins",
    "Donuts", "Glazed Donuts",
    "Pie", "Apple Pie", "Pumpkin Pie",
    "Ice Cream", "Vanilla Ice Cream", "Chocolate Ice Cream",
    "Pudding", "Chocolate Pudding",
    "Custard"
  ],

  // ☕ BEVERAGES
  beverages: [
    "Milk", "Chocolate Milk",
    "Almond Milk", "Soy Milk", "Oat Milk",
    "Coffee", "Latte", "Cappuccino",
    "Hot Chocolate",
    "Smoothie", "Fruit Smoothie", "Protein Shake"
  ],

  // 🥗 CONDIMENTS & SAUCES
  condiments: [
    "Butter", "Peanut Butter", "Almond Butter",
    "Mayonnaise", "Aioli",
    "Ketchup", "Mustard",
    "Soy Sauce", "Teriyaki Sauce",
    "Tahini", "Hummus",
    "Salsa", "Guacamole",
    "Cheese Sauce", "Alfredo Sauce", "Marinara Sauce"
  ]
};

// Flatten and export all foods for autocomplete
function getAllFoods() {
  const allFoods = [];
  
  Object.keys(FOOD_DATABASE).forEach(category => {
    FOOD_DATABASE[category].forEach(food => {
      allFoods.push({
        name: food,
        category: category,
        searchText: food.toLowerCase()
      });
    });
  });
  
  // Sort alphabetically
  return allFoods.sort((a, b) => a.name.localeCompare(b.name));
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FOOD_DATABASE, getAllFoods };
}
