// URL base de la API
const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';

// Endpoints
const POKEMON_ENDPOINT = 'https://pokeapi.co/api/v2/pokemon/';
const POKEMON_LIST_ENDPOINT = 'https://pokeapi.co/api/v2/pokemon?limit=151&offset=0';

// Array de pokemons y carrito
let pokemons = [];
let cart = JSON.parse(localStorage.getItem('pokemonCart')) || [];

// Elementos del DOM
const pokemonsGrid = document.getElementById('pokemons-grid');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const cartSection = document.getElementById('cart');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const typeFilter = document.getElementById('type-filter');
const scrollToProductsBtn = document.getElementById('scroll-to-products-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart-btn');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Mapeo de tipos de Pokemon en español
const typeTranslations = {
    'normal': 'normal',
    'fire': 'fuego',
    'water': 'agua',
    'electric': 'electrico',
    'grass': 'planta',
    'ice': 'hielo',
    'fighting': 'lucha',
    'poison': 'veneno',
    'ground': 'tierra',
    'flying': 'volador',
    'psychic': 'psiquico',
    'bug': 'bicho',
    'rock': 'roca',
    'ghost': 'fantasma',
    'dragon': 'dragon',
    'dark': 'siniestro',
    'steel': 'acero',
    'fairy': 'hada'
};

// Inicializacion de la app
document.addEventListener('DOMContentLoaded', async function() {
    await loadPokemons();
    displayProducts(pokemons);
    updateCart();
    setupEventListeners();
});

// Función para cargar los pokemons desde la API
async function loadPokemons() {
    try {
        showLoadingMessage();
        const response = await fetch(POKEMON_LIST_ENDPOINT);
        const data = await response.json();
        
        // Obtener detalles de cada Pokemon
        const pokemonPromises = data.results.map(async (pokemon, index) => {
            const pokemonResponse = await fetch(pokemon.url);
            const pokemonData = await pokemonResponse.json();
            
            // Calcular precio basado en stats (más realista)
            const basePrice = pokemonData.base_experience || 100;
            const price = Math.floor(basePrice / 10) * 10; // Redondear a decenas
            
            return {
                id: pokemonData.id,
                name: pokemonData.name,
                image: pokemonData.sprites.front_default,
                price: price,
                type: pokemonData.types[0].type.name,
                typeSpanish: typeTranslations[pokemonData.types[0].type.name] || pokemonData.types[0].type.name,
                height: pokemonData.height,
                weight: pokemonData.weight,
                abilities: pokemonData.abilities.map(ability => ability.ability.name).join(', '),
                stats: pokemonData.stats
            };
        });
        
        pokemons = await Promise.all(pokemonPromises);
        populateTypeFilter();
        hideLoadingMessage();
        
    } catch (error) {
        console.error('Error loading pokemons:', error);
        hideLoadingMessage();
        showErrorMessage('Error al cargar los Pokemons. Por favor, recarga la página.');
    }
}

// Función para mostrar mensaje de carga
function showLoadingMessage() {
    if (pokemonsGrid) {
        pokemonsGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Cargando Pokemons...</div>';
    }
}

// Función para ocultar mensaje de carga
function hideLoadingMessage() {
    // Se ocultará cuando se muestren los productos
}

// Función para mostrar mensaje de error
function showErrorMessage(message) {
    if (pokemonsGrid) {
        pokemonsGrid.innerHTML = `<div style="text-align: center; padding: 2rem; color: #e74c3c;">${message}</div>`;
    }
}

// Funcion para mostrar los productos
function displayProducts(productsToShow = pokemons) {
    if (!pokemonsGrid) return;
    
    pokemonsGrid.innerHTML = '';
    
    if (productsToShow.length === 0) {
        pokemonsGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">No se encontraron Pokemons.</div>';
        return;
    }
    
    productsToShow.forEach(pokemon => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${pokemon.image}" alt="${pokemon.name}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 3rem; background: #f8f8f8;">⚡</div>
            </div>
            <div class="product-info">
                <div class="product-brand">Tipo: ${pokemon.typeSpanish}</div>
                <h3 class="product-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                <p class="product-description">Altura: ${pokemon.height/10}m | Peso: ${pokemon.weight/10}kg<br>Habilidades: ${pokemon.abilities}</p>
                <div class="product-price">$${pokemon.price}</div>
                <button class="add-to-cart-btn" data-pokemon-id="${pokemon.id}">
                    Agregar al Carrito
                </button>
            </div>
        `;
        
        pokemonsGrid.appendChild(productCard);
    });
}

// Funcion para agregar al carrito
function addToCart(productId) {
    const pokemon = pokemons.find(p => p.id === productId);
    if (!pokemon) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...pokemon,
            quantity: 1
        });
    }
    
    updateCart();
    saveCartToStorage();
    showAddedToCartNotification();
}

// Funcion para actualizar el carrito
function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    
    // Funcion para actualizar los items del carrito
    if (cart.length === 0) {
        if (cartItems) cartItems.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 2rem;">Tu carrito está vacío</p>';
        if (cartTotal) cartTotal.textContent = '0.00';
        return;
    }
    
    if (cartItems) cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="fallback-emoji" style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 2rem; color: #999;">⚡</div>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-info">
                    <h4>${item.name.charAt(0).toUpperCase() + item.name.slice(1)} - ${item.typeSpanish}</h4>
                    <p>Cantidad: ${item.quantity}</p>
                </div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-from-cart-btn" data-pokemon-id="${item.id}">Eliminar</button>
            </div>
        `;
        if (cartItems) cartItems.appendChild(cartItem);
        total += item.price * item.quantity;
    });
    
    if (cartTotal) cartTotal.textContent = total.toFixed(2);
}

// Funcion para eliminar del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToStorage();
}

// Funcion para vaciar el carrito
function clearCart() {
    if (cart.length === 0) {
        alert('El carrito ya está vacío');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        updateCart();
        saveCartToStorage();
        alert('Carrito vaciado correctamente');
    }
}

// Funcion para checkout
function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    alert(`¡Gracias por tu compra!\n\nResumen:\n${itemsCount} Pokemons\nTotal: $${total.toFixed(2)}\n\nTus Pokemons serán entregados pronto.`);
    
    cart = [];
    updateCart();
    saveCartToStorage();
    closeCart();
}

// Funcion para guardar el carrito en localStorage
function saveCartToStorage() {
    localStorage.setItem('pokemonCart', JSON.stringify(cart));
}

// Funcion para filtrar los productos
function filterProducts(category) {
    const filteredProducts = category === 'all' 
        ? pokemons 
        : pokemons.filter(pokemon => pokemon.typeSpanish === category);
    
    displayProducts(filteredProducts);
}

// Funcion para abrir el carrito
function openCart() {
    if (cartSection) cartSection.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Funcion para cerrar el carrito
function closeCart() {
    if (cartSection) cartSection.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Función para poblar el dropdown de tipos
function populateTypeFilter() {
    if (!typeFilter) return;
    
    // Obtener tipos únicos de los Pokemon cargados
    const uniqueTypes = [...new Set(pokemons.map(pokemon => pokemon.typeSpanish))];
    
    // Ordenar alfabéticamente
    uniqueTypes.sort();
    
    // Limpiar opciones existentes (excepto "Todos")
    typeFilter.innerHTML = '<option value="all">Todos</option>';
    
    // Agregar cada tipo único como opción
    uniqueTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeFilter.appendChild(option);
    });
}

// Función para buscar Pokemon por nombre o ID
function searchPokemons(query) {
    if (!query.trim()) {
        // Si no hay query, mostrar todos los Pokemon
        displayProducts(pokemons);
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    const filteredPokemons = pokemons.filter(pokemon => {
        // Buscar por nombre
        const nameMatch = pokemon.name.toLowerCase().includes(searchTerm);
        
        // Buscar por ID (convertir query a número si es posible)
        const idMatch = !isNaN(searchTerm) && pokemon.id.toString() === searchTerm;
        
        return nameMatch || idMatch;
    });
    
    displayProducts(filteredPokemons);
    
    // Resetear filtro de tipo
    if (typeFilter) typeFilter.value = 'all';
}

// Funcion para configurar los event listeners
function setupEventListeners() {
    // Type filter dropdown
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            const selectedType = e.target.value;
            filterProducts(selectedType);
            
            // Limpiar búsqueda cuando se usa filtro
            if (searchInput) searchInput.value = '';
        });
    }
    
    // Search functionality
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput ? searchInput.value : '';
            searchPokemons(query);
        });
    }
    
    if (searchInput) {
        // Buscar al presionar Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchPokemons(searchInput.value);
            }
        });
        
        // Búsqueda en tiempo real (opcional)
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query.length === 0) {
                // Si se borra todo, mostrar todos los Pokemon
                displayProducts(pokemons);
            } else if (query.length >= 2) {
                // Buscar cuando hay al menos 2 caracteres
                searchPokemons(query);
            }
        });
    }
    
    // Cart link
    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }

    // Close cart button
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    
    // Cart overlay
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    
    // Scroll to products button
    if (scrollToProductsBtn) {
        scrollToProductsBtn.addEventListener('click', scrollToProducts);
    }
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
    
    // Clear cart button
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // Event delegation for dynamically created buttons
    document.addEventListener('click', (e) => {
        // Handle add to cart buttons
        if (e.target.classList.contains('add-to-cart-btn')) {
            const pokemonId = parseInt(e.target.getAttribute('data-pokemon-id'));
            addToCart(pokemonId);
        }
        
        // Handle remove from cart buttons
        if (e.target.classList.contains('remove-from-cart-btn')) {
            const pokemonId = parseInt(e.target.getAttribute('data-pokemon-id'));
            removeFromCart(pokemonId);
        }
    });
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartSection && cartSection.classList.contains('open')) {
            closeCart();
        }
    });
    
    // Hacer que el scroll sea suave
    document.querySelectorAll('a[href^="#"]:not(#cart-link)').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll a los productos
function scrollToProducts() {
    const pokemonsSection = document.getElementById('pokemons');
    if (pokemonsSection) {
        pokemonsSection.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Mostrar notificacion de producto agregado al carrito
function showAddedToCartNotification() {
    // Crear notificacion temporal
    const notification = document.createElement('div');
    notification.innerHTML = '✅ Pokemon agregado al carrito';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar la notificaion al agregar algo al carrito
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Eliminar notificacion despues de un segundo y medio
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 1500);
}
