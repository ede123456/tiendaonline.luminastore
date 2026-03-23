const products = [
  {
    id: 1,
    name: "Aurora Headphones Pro",
    category: "Audio",
    price: 249,
    description: "Audio inmersivo con cancelacion activa, aluminio cepillado y estuche premium.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    name: "Pulse Watch X",
    category: "Wearables",
    price: 319,
    description: "Reloj inteligente con cristal zafiro, monitoreo de salud y autonomia extendida.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    name: "Studio Speaker One",
    category: "Audio",
    price: 189,
    description: "Altavoz compacto con sonido balanceado, graves profundos y conectividad multiroom.",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 4,
    name: "Orbit Charging Pad",
    category: "Workspace",
    price: 89,
    description: "Base de carga inalambrica en aluminio con superficie antideslizante y acabado mate.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 5,
    name: "Canvas Desk Lamp",
    category: "Workspace",
    price: 129,
    description: "Iluminacion regulable de luz calida a fria para una mesa moderna y sofisticada.",
    image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 6,
    name: "Motion Earbuds Air",
    category: "Wearables",
    price: 159,
    description: "Earbuds ultraligeros con estuche compacto, controles tactiles y sonido detallado.",
    image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=900&q=80"
  }
];

const STORAGE_KEY = "lumina-cart";
const WHATSAPP_NUMBER = "18095551234";

let selectedCategory = "Todos";
let searchTerm = "";
let cart = loadCart();

const productsGrid = document.getElementById("productsGrid");
const filters = document.getElementById("filters");
const searchInput = document.getElementById("searchInput");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");
const navLinks = document.getElementById("navLinks");
const menuToggle = document.getElementById("menuToggle");
const whatsappButton = document.getElementById("whatsappButton");

function loadCart() {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("No se pudo leer el carrito:", error);
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function getFilteredProducts() {
  return products.filter((product) => {
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

// Renderiza el catalogo segun categoria y texto de busqueda.
function renderProducts() {
  const filteredProducts = getFilteredProducts();

  if (!filteredProducts.length) {
    productsGrid.innerHTML = `
      <div class="empty-cart">
        <p>No encontramos productos que coincidan con tu busqueda.</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card reveal visible">
          <div class="product-image">
            <span class="product-badge">${product.category}</span>
            <img src="${product.image}" alt="${product.name}" loading="lazy">
          </div>
          <div class="product-body">
            <p class="product-category">${product.category}</p>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
              <span class="price">${formatPrice(product.price)}</span>
              <button class="add-to-cart" data-id="${product.id}">Agregar al carrito</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

// Mantiene el resumen del carrito sincronizado en toda la interfaz.
function updateCartCount() {
  const totalItems = cart.reduce((accumulator, item) => accumulator + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function calculateCartTotal() {
  const total = cart.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0);
  cartTotal.textContent = formatPrice(total);
  return total;
}

// Pinta el drawer del carrito y sus controles de cantidad.
function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <p>Tu carrito esta vacio. Agrega productos para comenzar tu compra.</p>
      </div>
    `;
    calculateCartTotal();
    updateCartCount();
    updateWhatsAppLink();
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-item">
          <img class="cart-item-image" src="${item.image}" alt="${item.name}">
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <p>${formatPrice(item.price)}</p>
            <div class="quantity-controls">
              <button class="quantity-btn" data-action="decrease" data-id="${item.id}" aria-label="Reducir cantidad">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-btn" data-action="increase" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
              <button class="remove-item" data-action="remove" data-id="${item.id}" aria-label="Eliminar producto">&times;</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  calculateCartTotal();
  updateCartCount();
  updateWhatsAppLink();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} se agrego al carrito`);
}

// Ajusta cantidades y elimina el item cuando llega a cero.
function changeQuantity(productId, action) {
  cart = cart
    .map((item) => {
      if (item.id !== productId) {
        return item;
      }

      const nextQuantity = action === "increase" ? item.quantity + 1 : item.quantity - 1;
      return { ...item, quantity: nextQuantity };
    })
    .filter((item) => item.quantity > 0);

  saveCart();
  renderCart();
}

function removeItem(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function buildWhatsAppMessage() {
  if (!cart.length) {
    return "Hola, quiero informacion sobre los productos de Lumina Store.";
  }

  const lines = cart.map((item) => `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`);
  const total = calculateCartTotal();

  return [
    "Hola, quiero realizar esta compra en Lumina Store:",
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`
  ].join("\n");
}

// Genera el enlace de compra con el resumen actual del carrito.
function updateWhatsAppLink() {
  const message = encodeURIComponent(buildWhatsAppMessage());
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  whatsappButton.onclick = () => window.open(url, "_blank");
  document.getElementById("checkoutButton").onclick = () => window.open(url, "_blank");
}

function handleFilterClick(event) {
  const button = event.target.closest(".filter-chip");
  if (!button) {
    return;
  }

  selectedCategory = button.dataset.category;
  document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active"));
  button.classList.add("active");
  renderProducts();
}

function setupRevealAnimations() {
  // Activa animaciones suaves cuando las secciones entran en pantalla.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

productsGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-to-cart");
  if (!button) {
    return;
  }

  addToCart(Number(button.dataset.id));
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const productId = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "remove") {
    removeItem(productId);
    return;
  }

  changeQuantity(productId, action);
});

filters.addEventListener("click", handleFilterClick);

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim();
  renderProducts();
});

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("cartOverlay").addEventListener("click", closeCart);

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
  }
});

renderProducts();
renderCart();
setupRevealAnimations();
