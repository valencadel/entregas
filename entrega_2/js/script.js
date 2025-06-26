// Creacion de los perfumes
const perfumes = [
    {
        id: 1,
        brand: "Chanel",
        name: "No. 5",
        description: "Un clásico atemporal con notas florales y aldehídos.",
        price: 145,
        category: "mujer",
        image: "images/chanel_5.jpg"
    },
    {
        id: 2,
        brand: "Dior",
        name: "Sauvage",
        description: "Fragancia masculina fresca y especiada.",
        price: 160,
        category: "hombre",
        image: "images/dior_sauvage.webp"
    },
    {
        id: 3,
        brand: "Tom Ford",
        name: "Black Orchid",
        description: "Perfume unisex lujoso con notas oscuras y sensuales.",
        price: 150,
        category: "unisex",
        image: "images/tom_ford_blacj_orchid.avif"
    },
    {
        id: 4,
        brand: "Versace",
        name: "Bright Crystal",
        description: "Fragancia femenina brillante y floral.",
        price: 75,
        category: "mujer",
        image: "images/versace_bright_cristal.webp"
    },
    {
        id: 5,
        brand: "Giorgio Armani",
        name: "Acqua di Gio",
        description: "Perfume masculino acuático y refrescante.",
        price: 90,
        category: "hombre",
        image: "images/acqua_di_gio.webp"
    },
    {
        id: 6,
        brand: "Yves Saint Laurent",
        name: "Black Opium",
        description: "Fragancia femenina adictiva con café y vainilla.",
        price: 110,
        category: "mujer",
        image: "images/ysl_black_opium.webp"
    },
    {
        id: 7,
        brand: "Paco Rabanne",
        name: "1 Million",
        description: "Perfume masculino dorado y seductor.",
        price: 85,
        category: "hombre",
        image: "images/paco_1_mill.webp"
    },
    {
        id: 8,
        brand: "Maison Margiela",
        name: "REPLICA Beach Walk",
        description: "Fragancia unisex que evoca paseos por la playa.",
        price: 130,
        category: "unisex",
        image: "images/maison_replica.webp"
    },
    {
        id: 9,
        brand: "Chanel",
        name: "Bleu de Chanel",
        description: "Una fragancia elegante, amaderada y aromática con notas de incienso, cítricos y sándalo",
        price: 135,
        category: "hombre",
        image: "images/bleu_chanel.webp"
    },
    {
      id: 10,
      brand: "Versace",
      name: "Eros Flame",
      description: "Un perfume intenso y apasionado, con notas especiadas y amaderadas mezcladas con cítricos.",
      price: 75,
      category: "hombre",
      image: "images/versace_eros.webp"
    },
    {
      id: 11,
      brand: "Lancôme",
      name: "La Vie Est Belle",
      description: "Una fragancia femenina, dulce y luminosa, con notas de vainilla, praliné y flor de iris.",
      price: 115,
      category: "mujer",
      image: "images/lancome_la_vie.jpg"
    },
    {
      id: 12,
      brand: "Tom Ford",
      name: "Soleil Blanc",
      description: "Un perfume solar, cálido y exótico, con notas de coco, ylang-ylang y ámbar.",
      price: 135,
      category: "unisex",
      image: "images/tom_ford_soleil.webp"
    }
];

// Array de mi carrito
let cart = JSON.parse(localStorage.getItem('perfumeCart')) || [];

// Elementos del DOM
const productsGrid = document.getElementById('products-grid');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const cartSection = document.getElementById('cart');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const filterButtons = document.querySelectorAll('.filter-btn');

// Inicializacion de la app
document.addEventListener('DOMContentLoaded', function() {
    displayProducts(perfumes);
    updateCart();
    setupEventListeners();
});

// Funcion para mostrar los productos
function displayProducts(productsToShow = perfumes) {
    productsGrid.innerHTML = '';
    
    productsToShow.forEach(perfume => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${perfume.image}" alt="${perfume.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 3rem; background: #f8f8f8;">🌸</div>
            </div>
            <div class="product-info">
                <div class="product-brand">${perfume.brand}</div>
                <h3 class="product-name">${perfume.name}</h3>
                <p class="product-description">${perfume.description}</p>
                <div class="product-price">$${perfume.price}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${perfume.id})">
                    Agregar al Carrito
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Funcion para agregar al carrito
function addToCart(productId) {
    const perfume = perfumes.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...perfume,
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
    cartCount.textContent = totalItems;
    
    // Funcion para actualizar los items del carrito
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 2rem;">Tu carrito está vacío</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="fallback-emoji" style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 2rem; color: #999;">🌸</div>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-info">
                    <h4>${item.brand} - ${item.name}</h4>
                    <p>Cantidad: ${item.quantity}</p>
                </div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button onclick="removeFromCart(${item.id})">Eliminar</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
        total += item.price * item.quantity;
    });
    
    cartTotal.textContent = total.toFixed(2);
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
    
    alert(`¡Gracias por tu compra!\n\nResumen:\n${itemsCount} productos\nTotal: $${total.toFixed(2)}\n\nTu pedido será procesado en breve.`);
    
    cart = [];
    updateCart();
    saveCartToStorage();
    closeCart();
}

// Funcion para guardar el carrito en localStorage
function saveCartToStorage() {
    localStorage.setItem('perfumeCart', JSON.stringify(cart));
}

// Funcion para filtrar los productos
function filterProducts(category) {
    const filteredProducts = category === 'all' 
        ? perfumes 
        : perfumes.filter(perfume => perfume.category === category);
    
    displayProducts(filteredProducts);
}

// Funcion para abrir el carrito
function openCart() {
    cartSection.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Funcion para cerrar el carrito
function closeCart() {
    cartSection.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Funcion para configurar los event listeners
function setupEventListeners() {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.getAttribute('data-filter');
            filterProducts(category);
        });
    });
    
    document.getElementById('cart-link').addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });

    closeCartBtn.addEventListener('click', closeCart);
    
    cartOverlay.addEventListener('click', closeCart);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartSection.classList.contains('open')) {
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
    document.getElementById('products').scrollIntoView({
        behavior: 'smooth'
    });
}

// Mostrar notificacion de producto agregado al carrito
function showAddedToCartNotification() {
    // Crear notificacion temporal
    const notification = document.createElement('div');
    notification.innerHTML = '✅ Producto agregado al carrito';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: grey;
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
