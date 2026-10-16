const products = [
  {
    id: "stoneware-mug",
    name: "Sunday stoneware mug",
    category: "Home",
    price: 28,
    badge: "A BEST LOVED",
    image: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=900&q=82",
    alt: "Handmade ceramic mug in soft, natural light"
  },
  {
    id: "linen-tote",
    name: "Market day tote",
    category: "Wear",
    price: 36,
    badge: "MADE TO GO",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=82",
    alt: "Everyday canvas bag ready to carry"
  },
  {
    id: "glass-vase",
    name: "Little glass vase",
    category: "Home",
    price: 32,
    badge: "",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=82",
    alt: "Sculptural glass vase with a simple stem"
  },
  {
    id: "everyday-cap",
    name: "The everyday cap",
    category: "Wear",
    price: 34,
    badge: "JUST LANDED",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=82",
    alt: "Relaxed baseball cap in a warm neutral shade"
  },
  {
    id: "soft-throw",
    name: "Slow morning throw",
    category: "Home",
    price: 88,
    badge: "",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=82",
    alt: "Soft textured throw in a cozy living room"
  },
  {
    id: "sunday-sunnies",
    name: "Sunday sun glasses",
    category: "Wear",
    price: 48,
    badge: "A LITTLE SHADE",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=82",
    alt: "Classic sunglasses with dark lenses"
  },
  {
    id: "daily-candle",
    name: "A slower kind of candle",
    category: "Home",
    price: 30,
    badge: "",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=82",
    alt: "A candle glowing softly on a table"
  },
  {
    id: "weekend-pouch",
    name: "Weekend somewhere pouch",
    category: "Wear",
    price: 26,
    badge: "TAKE IT ALONG",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=82",
    alt: "A simple travel bag for little essentials"
  }
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#product-search");
const emptyState = document.querySelector("#empty-state");
const cart = new Map();
const favorites = new Set();
let activeFilter = "All";
let toastTimer;

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeFilter === "All" || product.category === activeFilter;
    const matchesSearch = `${product.name} ${product.category}`.toLocaleLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = visibleProducts.map((product, index) => `
    <article class="product-card" style="animation-delay:${Math.min(index * 55, 330)}ms">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <button class="favorite-button${favorites.has(product.id) ? " is-favorite" : ""}" type="button" data-favorite="${product.id}" aria-label="${favorites.has(product.id) ? "Remove " + product.name + " from" : "Add " + product.name + " to"} favorites" aria-pressed="${favorites.has(product.id)}">♡</button>
        <button class="add-button" type="button" data-add="${product.id}">Add to bag <span aria-hidden="true">+</span></button>
      </div>
      <div class="product-info">
        <div><p class="product-name">${product.name}</p><p class="product-category">${product.category === "Home" ? "For the home" : "To take along"}</p></div>
        <span class="product-price">${money.format(product.price)}</span>
      </div>
    </article>
  `).join("");
  emptyState.hidden = visibleProducts.length > 0;
}

function cartQuantity() {
  return Array.from(cart.values()).reduce((total, item) => total + item.quantity, 0);
}

function renderCart() {
  const quantity = cartQuantity();
  document.querySelector(".bag-count").textContent = quantity;
  document.querySelector(".drawer-count").textContent = `(${quantity})`;
  const items = Array.from(cart.values());
  document.querySelector("#cart-empty").hidden = items.length > 0;
  document.querySelector("#cart-footer").hidden = items.length === 0;
  document.querySelector("#cart-items").innerHTML = items.map(({ product, quantity: count }) => `
    <article class="cart-item">
      <img src="${product.image}" alt="">
      <div class="cart-item-info">
        <div><p class="cart-item-name">${product.name}</p><p class="cart-item-category">${product.category === "Home" ? "For the home" : "To take along"}</p></div>
        <div class="quantity-control" aria-label="Quantity for ${product.name}">
          <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Remove one ${product.name}">−</button>
          <span>${count}</span>
          <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Add one ${product.name}">+</button>
          <button class="remove-item" type="button" data-remove="${product.id}">Remove</button>
        </div>
      </div>
      <span class="cart-item-price">${money.format(product.price * count)}</span>
    </article>
  `).join("");
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  document.querySelector("#cart-subtotal").textContent = money.format(subtotal);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2300);
}

function setCartOpen(isOpen) {
  const drawer = document.querySelector("#cart-drawer");
  const backdrop = document.querySelector("#drawer-backdrop");
  drawer.classList.toggle("is-open", isOpen);
  drawer.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("drawer-open", isOpen);
  if (isOpen) {
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("is-visible"));
    document.querySelector(".close-drawer").focus();
  } else {
    backdrop.classList.remove("is-visible");
    window.setTimeout(() => { backdrop.hidden = true; }, 250);
  }
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");
  if (addButton) {
    const product = products.find((item) => item.id === addButton.dataset.add);
    const existing = cart.get(product.id);
    cart.set(product.id, { product, quantity: existing ? existing.quantity + 1 : 1 });
    renderCart();
    showToast(`${product.name} is in your bag.`);
  }
  if (favoriteButton) {
    const product = products.find((item) => item.id === favoriteButton.dataset.favorite);
    if (favorites.has(product.id)) {
      favorites.delete(product.id);
      showToast(`${product.name} removed from your favorites.`);
    } else {
      favorites.add(product.id);
      showToast(`${product.name} saved for later.`);
    }
    renderProducts();
  }
});

document.querySelector(".filter-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter-button").forEach((filterButton) => {
    filterButton.classList.toggle("is-active", filterButton === button);
  });
  renderProducts();
});

document.querySelectorAll("[data-nav-filter]").forEach((link) => {
  link.addEventListener("click", () => {
    const filter = link.dataset.navFilter;
    document.querySelector(`.filter-button[data-filter="${filter}"]`).click();
    document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
    document.querySelector("#main-nav").classList.remove("is-open");
    document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
  });
});

searchInput.addEventListener("input", renderProducts);
document.querySelector(".search-toggle").addEventListener("click", () => {
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(() => searchInput.focus(), 350);
});
document.querySelector(".bag-button").addEventListener("click", () => setCartOpen(true));
document.querySelector(".close-drawer").addEventListener("click", () => setCartOpen(false));
document.querySelector("#drawer-backdrop").addEventListener("click", () => setCartOpen(false));
document.querySelector(".continue-shopping").addEventListener("click", () => setCartOpen(false));
document.querySelector("#cart-items").addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    cart.delete(removeButton.dataset.remove);
    renderCart();
    return;
  }
  if (quantityButton) {
    const id = quantityButton.dataset.quantity;
    const item = cart.get(id);
    const quantity = item.quantity + Number(quantityButton.dataset.change);
    if (quantity <= 0) cart.delete(id);
    else cart.set(id, { ...item, quantity });
    renderCart();
  }
});

document.querySelector(".checkout-button").addEventListener("click", () => {
  showToast("Thanks for stopping by! Checkout is coming soon.");
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#newsletter-message").textContent = "You're on the list. Keep an eye on your inbox!";
  event.currentTarget.reset();
});

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const nav = document.querySelector("#main-nav");
  const isOpen = nav.classList.toggle("is-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  event.currentTarget.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector("#cart-drawer").classList.contains("is-open")) {
    setCartOpen(false);
    document.querySelector(".bag-button").focus();
  }
});

renderProducts();
renderCart();
