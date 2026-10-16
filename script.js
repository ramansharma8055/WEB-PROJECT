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
  observeReveals(productGrid.querySelectorAll(".product-card"));
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

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealObserver = "IntersectionObserver" in window && !reducedMotion.matches
  ? new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 })
  : null;

function observeReveals(elements) {
  elements.forEach((element) => {
    if (!revealObserver) {
      element.classList.add("is-revealed");
      return;
    }
    element.classList.add("fx-reveal");
    revealObserver.observe(element);
  });
}

function setupVisualEffects() {
  const canvas = document.querySelector("#vfx-canvas");
  const context = canvas.getContext("2d");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!context || reducedMotion.matches || !canHover.matches) return;

  const particles = [];
  const colors = ["#ef805d", "#e7bd65", "#82a994", "#db91a1", "#a89be1"];
  let frame = 0;
  let width = 0;
  let height = 0;
  let lastTrail = null;

  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function addParticle(x, y, burst = false) {
    const angle = Math.random() * Math.PI * 2;
    const speed = burst ? 1.1 + Math.random() * 3.2 : 0.25 + Math.random() * 1.15;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (burst ? 0 : 0.35),
      size: burst ? 1.8 + Math.random() * 3.2 : 1.2 + Math.random() * 2.4,
      life: 1,
      decay: burst ? 0.018 + Math.random() * 0.02 : 0.024 + Math.random() * 0.025,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
    if (particles.length > 96) particles.splice(0, particles.length - 96);
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.985;
      particle.vy = particle.vy * 0.985 + 0.012;
      particle.life -= particle.decay;
      if (particle.life <= 0) {
        particles.splice(index, 1);
        continue;
      }
      context.globalAlpha = particle.life * 0.8;
      context.fillStyle = particle.color;
      context.shadowColor = particle.color;
      context.shadowBlur = 13;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
    context.shadowBlur = 0;
    if (particles.length) {
      frame = window.requestAnimationFrame(draw);
    } else {
      frame = 0;
    }
  }

  function wakeAnimation() {
    if (!frame) frame = window.requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const previous = lastTrail;
    lastTrail = { x: event.clientX, y: event.clientY };
    if (previous && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 8) return;
    addParticle(event.clientX, event.clientY);
    if (Math.random() > 0.55) addParticle(event.clientX, event.clientY);
    wakeAnimation();
  }, { passive: true });
  window.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") return;
    for (let index = 0; index < 14; index += 1) addParticle(event.clientX, event.clientY, true);
    wakeAnimation();
  }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
      particles.length = 0;
      context.clearRect(0, 0, width, height);
    }
  });
  resizeCanvas();
}

function setupCardTilt() {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!canHover.matches || reducedMotion.matches) return;
  productGrid.addEventListener("pointermove", (event) => {
    const card = event.target.closest(".product-card");
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--tilt-x", `${-y * 5}deg`);
    card.style.setProperty("--tilt-y", `${x * 5}deg`);
  }, { passive: true });
  productGrid.addEventListener("pointerout", (event) => {
    const card = event.target.closest(".product-card");
    if (card && !card.contains(event.relatedTarget)) {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    }
  }, { passive: true });
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
observeReveals(document.querySelectorAll(".section-heading, .story-image, .story-copy, .newsletter-section"));
setupVisualEffects();
setupCardTilt();
