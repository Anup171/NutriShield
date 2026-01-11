/**
 * COMPREHENSIVE ALLERGEN DETECTION CONFIGURATION
 * This file contains all allergen keywords and detection logic
 * 
 * IMPORTANT: 
 * - All allergen names must match EXACTLY with signup form values (case-insensitive comparison)
 * - Keywords are comprehensive to catch all variations
 * - Compound words are handled to prevent false positives
 */

// STANDARDIZED ALLERGEN KEYWORDS
// Keys MUST match the values from signup.html (lowercase for comparison)
const ALLERGEN_KEYWORDS = {
  // ===== MAJOR ALLERGENS (TOP 8 + SESAME) =====
  'milk': [
    // Direct dairy
    'milk', 'dairy', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt',
    
    // Dairy proteins and components
    'whey', 'casein', 'lactose', 'curd', 'ghee', 'buttermilk',
    'lactoglobulin', 'lactalbumin', 'lactate',
    
    // Cheese varieties
    'paneer', 'cottage cheese', 'ricotta', 'mozzarella', 'cheddar', 
    'parmesan', 'gouda', 'brie', 'feta', 'swiss cheese', 'provolone', 
    'cream cheese', 'mascarpone', 'blue cheese', 'goat cheese',
    'gruyere', 'monterey jack', 'colby', 'muenster', 'havarti',
    'camembert', 'gorgonzola', 'romano', 'asiago', 'fontina',
    
    // Dairy products
    'ice cream', 'icecream', 'frozen yogurt', 'custard', 'pudding',
    'condensed milk', 'evaporated milk', 'sour cream', 'half and half',
    'heavy cream', 'whipping cream', 'clotted cream', 'crème',
    
    // Chocolate with milk
    'milk chocolate', 'white chocolate',
    
    // Processed forms
    'milk powder', 'dried milk', 'powdered milk', 'milk solids',
    'whey protein', 'whey powder', 'whey concentrate', 'whey isolate',
    'butter cream', 'clarified butter', 'butter oil',
    
    // Cultural/regional dairy
    'queso', 'fromage', 'käse', 'formaggio', 'lassi', 'raita',
    'khoya', 'mawa', 'rabri', 'malai', 'dahi'
  ],

  'eggs': [
    // Basic egg forms
    'egg', 'eggs', 'egg white', 'egg yolk', 'whole egg',
    
    // Cooked preparations
    'scrambled egg', 'fried egg', 'boiled egg', 'poached egg',
    'hard boiled', 'soft boiled', 'omelet', 'omelette', 'frittata',
    'quiche', 'deviled egg', 'egg salad',
    
    // Egg proteins and components
    'albumin', 'ovalbumin', 'ovomucoid', 'ovotransferrin', 'lysozyme',
    'egg protein', 'egg powder', 'dried egg', 'egg solids',
    
    // Products containing eggs
    'mayonnaise', 'mayo', 'meringue', 'eggnog', 'hollandaise',
    'béarnaise', 'aioli', 'custard', 'zabaglione', 'sabayon',
    
    // Egg substitutes (may contain traces)
    'egg substitute', 'egg replacer'
  ],

  'peanuts': [
    'peanut', 'peanuts', 'groundnut', 'groundnuts', 'goober', 'goober pea',
    'peanut butter', 'peanut oil', 'peanut flour', 'peanut protein',
    'arachis oil', 'arachis hypogaea', 'ground nut', 'monkey nut',
    'beer nut', 'mandelonas', 'nut meat'
  ],

  'tree nuts': [
    // Common tree nuts
    'almond', 'almonds', 'cashew', 'cashews', 'walnut', 'walnuts',
    'pecan', 'pecans', 'pistachio', 'pistachios', 'macadamia',
    'hazelnut', 'hazelnuts', 'filbert',
    
    // Other tree nuts
    'pine nut', 'pine nuts', 'pignoli', 'pignolia', 'pinon',
    'brazil nut', 'brazil nuts', 'chestnut', 'chestnuts',
    'beechnut', 'butternut', 'chinquapin', 'ginkgo nut', 'hickory nut',
    'shea nut', 'coconut',
    
    // Nut products
    'almond butter', 'almond milk', 'almond flour', 'almond paste',
    'cashew butter', 'cashew milk', 'walnut oil', 'hazelnut spread',
    'praline', 'marzipan', 'nougat', 'gianduja', 'frangipane',
    'nut butter', 'nut milk', 'nut oil', 'nut flour',
    
    // Generic
    'tree nut', 'mixed nuts', 'cocktail nuts'
  ],

  'fish': [
    // Common fish
    'fish', 'salmon', 'tuna', 'cod', 'haddock', 'halibut', 'pollock',
    'bass', 'sea bass', 'seabass', 'flounder', 'sole', 'trout',
    'anchovy', 'anchovies', 'sardine', 'sardines', 'mackerel',
    'tilapia', 'catfish', 'perch', 'pike', 'herring',
    
    // Specialty fish
    'swordfish', 'mahi mahi', 'mahi-mahi', 'grouper', 'snapper',
    'barramundi', 'branzino', 'turbot', 'monkfish', 'rockfish',
    'arctic char', 'walleye', 'crappie', 'bluegill',
    
    // Fish products
    'fish sauce', 'fish oil', 'fish stock', 'dashi', 'bonito',
    'fish roe', 'caviar', 'tobiko', 'masago', 'ikura',
    'surimi', 'imitation crab', 'fish paste', 'fish cake',
    
    // Preparations
    'sashimi', 'sushi', 'ceviche', 'gravlax', 'lox', 'smoked salmon',
    'fish fillet', 'fish steak', 'fish and chips'
  ],

  'shellfish': [
    // Crustaceans
    'shrimp', 'shrimps', 'prawn', 'prawns', 'crab', 'crabmeat',
    'lobster', 'crayfish', 'crawfish', 'langoustine', 'langostino',
    'krill',
    
    // Mollusks
    'clam', 'clams', 'mussel', 'mussels', 'oyster', 'oysters',
    'scallop', 'scallops', 'squid', 'calamari', 'octopus',
    'cuttlefish', 'conch', 'whelk', 'periwinkle', 'limpet',
    'snail', 'escargot', 'abalone', 'sea urchin', 'uni',
    
    // Generic
    'shellfish', 'seafood', 'crustacean', 'mollusk', 'mollusc',
    
    // Products
    'shrimp paste', 'oyster sauce', 'clam chowder'
  ],

  'wheat': [
    // Wheat forms
    'wheat', 'wheat flour', 'wheat germ', 'wheat bran', 'wheat starch',
    'whole wheat', 'wholewheat', 'whole grain wheat',
    
    // Wheat varieties
    'durum', 'semolina', 'spelt', 'kamut', 'farina', 'farro',
    'einkorn', 'emmer', 'triticale', 'bulgur', 'cracked wheat',
    
    // Bread products
    'bread', 'white bread', 'wheat bread', 'whole wheat bread',
    'pita', 'pita bread', 'naan', 'roti', 'chapati', 'paratha',
    'bagel', 'baguette', 'ciabatta', 'focaccia', 'brioche',
    'croissant', 'english muffin', 'tortilla', 'wrap',
    'bun', 'roll', 'biscuit', 'scone',
    
    // Pasta
    'pasta', 'noodle', 'noodles', 'spaghetti', 'macaroni',
    'fettuccine', 'linguine', 'penne', 'rigatoni', 'fusilli',
    'lasagna', 'ravioli', 'tortellini', 'gnocchi',
    'ramen', 'udon', 'soba', 'lo mein',
    
    // Baked goods
    'cake', 'cookie', 'cookies', 'cracker', 'crackers',
    'muffin', 'donut', 'doughnut', 'pastry', 'pie crust',
    'brownie', 'waffle', 'pancake',
    
    // Other wheat products
    'seitan', 'couscous', 'orzo', 'matzo', 'matzah',
    'graham', 'pretzels', 'breadcrumbs', 'croutons',
    'wheat protein', 'vital wheat gluten'
  ],

  'soy': [
    // Soy beans and products
    'soy', 'soya', 'soybean', 'soybeans', 'soy bean', 'soy beans',
    'tofu', 'edamame', 'tempeh', 'miso', 'natto',
    
    // Soy sauces and condiments
    'soy sauce', 'soysauce', 'tamari', 'shoyu', 'teriyaki',
    
    // Soy milk and derivatives
    'soy milk', 'soymilk', 'soy yogurt', 'soy cheese',
    'soy ice cream', 'soy creamer',
    
    // Soy ingredients
    'soy protein', 'soy protein isolate', 'soy flour', 'soy lecithin',
    'textured vegetable protein', 'tvp', 'textured soy protein',
    'hydrolyzed soy protein', 'soy oil', 'soybean oil',
    
    // Asian preparations
    'yuba', 'bean curd', 'fermented soy', 'soy paste'
  ],

  'sesame': [
    'sesame', 'sesame seed', 'sesame seeds', 'tahini', 'tahina',
    'sesame oil', 'sesame paste', 'sesamol', 'sesamum',
    'benne', 'benne seed', 'gingelly', 'gingelly oil',
    'til', 'til oil', 'simsim', 'gomasio', 'halva', 'halvah'
  ],

  // ===== ADDITIONAL COMMON ALLERGENS =====
  'gluten': [
    'gluten', 'wheat gluten', 'vital wheat gluten',
    'wheat flour', 'wheat', 'barley', 'rye', 'malt', 'malt extract',
    'malted barley', 'beer', 'ale', 'lager', 'stout',
    'bread', 'pasta', 'seitan', 'spelt', 'kamut', 'triticale',
    'farina', 'semolina', 'durum', 'bulgur', 'couscous'
  ],

  'mustard': [
    'mustard', 'mustard seed', 'mustard seeds', 'mustard powder',
    'dijon', 'dijon mustard', 'yellow mustard', 'brown mustard',
    'whole grain mustard', 'mustard oil', 'mustard greens'
  ],

  'corn': [
    'corn', 'maize', 'cornmeal', 'cornstarch', 'corn starch',
    'corn flour', 'cornflour', 'corn syrup', 'high fructose corn syrup',
    'hfcs', 'corn oil', 'corn sugar', 'dextrose', 'maltodextrin',
    'hominy', 'polenta', 'grits', 'popcorn', 'corn tortilla',
    'masa', 'masa harina', 'corn chips', 'corn flakes'
  ],

  // ===== LEGUMES =====
  'chickpeas': [
    'chickpea', 'chickpeas', 'garbanzo', 'garbanzos', 'garbanzo bean',
    'garbanzo beans', 'chana', 'channa', 'chole',
    'hummus', 'houmous', 'humus', 'falafel', 'falafels',
    'besan', 'gram flour', 'chickpea flour'
  ],

  'lentils': [
    'lentil', 'lentils', 'lentil soup', 'dal', 'dhal', 'daal',
    'red lentil', 'green lentil', 'brown lentil', 'black lentil',
    'yellow lentil', 'masoor', 'moong', 'moong dal', 'urad',
    'toor dal', 'chana dal', 'lentil flour'
  ],

  'peas': [
    'pea', 'peas', 'green pea', 'green peas', 'garden pea',
    'split pea', 'split peas', 'snow pea', 'snap pea',
    'sugar snap', 'sugar snap pea', 'pea protein', 'pea flour',
    'marrowfat pea', 'black-eyed pea', 'field pea'
  ],

  'beans': [
    'bean', 'beans', 'kidney bean', 'black bean', 'pinto bean',
    'navy bean', 'white bean', 'lima bean', 'butter bean',
    'cannellini', 'great northern', 'fava bean', 'broad bean',
    'adzuki', 'adzuki bean', 'mung bean', 'mung beans',
    'refried beans', 'baked beans', 'green bean', 'string bean',
    'wax bean', 'haricot', 'flageolet', 'borlotti'
  ],

  // ===== SEAFOOD (SPECIFIC) =====
  'crustaceans': [
    'crustacean', 'crab', 'crabmeat', 'lobster', 'crawfish',
    'crayfish', 'shrimp', 'shrimps', 'prawn', 'prawns',
    'langoustine', 'langostino', 'krill', 'barnacle'
  ],

  'mollusks': [
    'mollusk', 'mollusc', 'clam', 'clams', 'oyster', 'oysters',
    'mussel', 'mussels', 'scallop', 'scallops', 'squid',
    'calamari', 'octopus', 'cuttlefish', 'snail', 'escargot',
    'abalone', 'conch', 'whelk', 'periwinkle', 'sea urchin', 'uni'
  ],

  // ===== FRUITS =====
  'banana': [
    'banana', 'bananas', 'plantain', 'plantains',
    'banana bread', 'banana chip'
  ],

  'avocado': [
    'avocado', 'avocados', 'guacamole', 'avo', 'avocado oil'
  ],

  'kiwi': [
    'kiwi', 'kiwifruit', 'kiwi fruit', 'chinese gooseberry'
  ],

  'strawberry': [
    'strawberry', 'strawberries', 'strawberry jam'
  ],

  // ===== VEGETABLES =====
  'tomato': [
    'tomato', 'tomatoes', 'tomato sauce', 'marinara', 'marinara sauce',
    'salsa', 'ketchup', 'catsup', 'tomato paste', 'tomato puree',
    'roma tomato', 'cherry tomato', 'grape tomato',
    'sun dried tomato', 'sundried tomato', 'tomato juice'
  ],

  'potato': [
    'potato', 'potatoes', 'french fries', 'french fry', 'fries',
    'mashed potato', 'baked potato', 'roasted potato',
    'hash brown', 'hashbrown', 'tater tot', 'potato chip',
    'chips', 'crisps', 'potato salad', 'potato flour',
    'potato starch', 'sweet potato', 'yam'
  ],

  'garlic': [
    'garlic', 'garlic powder', 'garlic salt', 'garlic oil',
    'aioli', 'garlic bread', 'roasted garlic', 'garlic clove'
  ],

  'onion': [
    'onion', 'onions', 'scallion', 'scallions', 'green onion',
    'spring onion', 'shallot', 'shallots', 'leek', 'leeks',
    'chive', 'chives', 'onion powder', 'red onion', 'white onion',
    'yellow onion', 'sweet onion', 'vidalia', 'caramelized onion',
    'onion ring', 'pearl onion', 'cipollini'
  ],

  // ===== GRAINS =====
  'oats': [
    'oat', 'oats', 'oatmeal', 'oat flour', 'oat milk', 'oat bran',
    'rolled oats', 'steel cut oats', 'oat cereal', 'granola',
    'muesli', 'porridge', 'oat groats', 'oat flakes'
  ],

  'rice': [
    'rice', 'brown rice', 'white rice', 'wild rice', 'basmati',
    'basmati rice', 'jasmine rice', 'rice flour', 'rice milk',
    'rice paper', 'rice noodle', 'rice noodles', 'rice cake',
    'rice cakes', 'risotto', 'sushi rice', 'sticky rice',
    'arborio', 'rice vinegar', 'rice bran', 'rice cereal',
    'puffed rice', 'rice crispy', 'rice krispies'
  ],

  'barley': [
    'barley', 'barley malt', 'malt', 'malted barley', 'malt extract',
    'malt syrup', 'pearl barley', 'barley flour', 'barley grass'
  ],

  'rye': [
    'rye', 'rye bread', 'rye flour', 'pumpernickel', 'rye whiskey'
  ],

  'quinoa': [
    'quinoa', 'quinoa flour', 'quinoa flakes'
  ],

  'buckwheat': [
    'buckwheat', 'buckwheat flour', 'soba', 'soba noodle',
    'soba noodles', 'kasha'
  ],

  // ===== OTHER ALLERGENS =====
  'gelatin': [
    'gelatin', 'gelatine', 'jello', 'jell-o', 'marshmallow',
    'marshmallows', 'gummy', 'gummies', 'gummy bear',
    'gelatin capsule', 'gel cap', 'aspic'
  ],

  'cocoa': [
    'cocoa', 'cacao', 'chocolate', 'dark chocolate', 'milk chocolate',
    'white chocolate', 'hot chocolate', 'cocoa powder', 'cacao powder',
    'chocolate chip', 'chocolate bar', 'cocoa butter', 'cacao nibs'
  ],

  'red meat': [
    'beef', 'pork', 'lamb', 'veal', 'venison', 'bison', 'buffalo',
    'red meat', 'steak', 'hamburger', 'burger', 'bacon', 'ham',
    'sausage', 'salami', 'pepperoni', 'prosciutto', 'pancetta',
    'alpha-gal', 'alpha gal', 'mammalian meat', 'mutton',
    'ground beef', 'beef patty', 'pork chop', 'lamb chop',
    'beef jerky', 'pastrami', 'corned beef', 'roast beef'
  ],

  'lupin': [
    'lupin', 'lupine', 'lupin flour', 'lupin bean', 'lupini bean',
    'lupini beans', 'lupin protein'
  ]
};

// COMPOUND WORDS - Prevent false positives
// These contain allergen keywords but are NOT actual allergens
const SAFE_COMPOUNDS = {
  // Nut butters that are safe if not allergic to that specific nut
  'peanut butter': ['butter'], // Don't trigger "milk" from butter
  'almond butter': ['butter'],
  'cashew butter': ['butter'],
  'sunflower butter': ['butter'],
  'apple butter': ['butter'],
  'fruit butter': ['butter'],
  
  // Cocoa butter is not dairy
  'cocoa butter': ['butter', 'milk', 'dairy'],
  'cacao butter': ['butter', 'milk', 'dairy'],
  'shea butter': ['butter', 'milk', 'dairy'],
  
  // Butter beans are legumes, not dairy
  'butter bean': ['butter', 'milk', 'dairy'],
  'butter beans': ['butter', 'milk', 'dairy'],
  
  // Coconut is classified as tree nut but many allergists don't restrict it
  // Keep coconut detection but note it's controversial
  
  // Nutmeg is a spice, not a nut
  'nutmeg': ['nut', 'nuts'],
  
  // Butternut squash
  'butternut squash': ['butter', 'milk', 'dairy', 'nut'],
  'butternut': ['butter', 'milk', 'dairy', 'nut'],
  
  // Water chestnuts are not tree nuts
  'water chestnut': ['chestnut', 'nut'],
  'water chestnuts': ['chestnut', 'nuts']
};

module.exports = {
  ALLERGEN_KEYWORDS,
  SAFE_COMPOUNDS
};
