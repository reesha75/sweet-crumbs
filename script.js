const chips = document.querySelectorAll(".chip");
const cards = document.querySelectorAll(".card");
const menuToggle = document.querySelector(".menu-toggle");
const navList = document.querySelector(".nav-list");

if (menuToggle && navList) {
  menuToggle.setAttribute("aria-expanded", "false");

  menuToggle.addEventListener("click", () => {
    const isOpen = navList.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navList.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navList.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (chips.length > 0 && cards.length > 0) {
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");

      const filter = chip.dataset.filter;

      cards.forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.type === filter;
        card.classList.toggle("hidden", !shouldShow);
      });
    });
  });
}

// Scroll Animations
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

const fadeElements = document.querySelectorAll(".fade-up, .section, .panel, .feature, .testimonial-card, .team-member");
fadeElements.forEach((el) => {
  el.classList.add("fade-up");
  observer.observe(el);
});

// Staggered card animations
const cardElements = document.querySelectorAll(".card");
cardElements.forEach((card, index) => {
  card.style.animationDelay = `${index * 0.1}s`;
  card.classList.add("fade-up");
  observer.observe(card);
});

// FAQ Toggles
const faqItems = document.querySelectorAll(".faq-item");
if (faqItems.length > 0) {
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      // Close others
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
        }
      });
      // Toggle current
      item.classList.toggle("active");
    });
  });
}

function initPageLoader() {
  const loader = document.querySelector(".page-loader");
  if (!loader) return;

  const isFirstVisit = !localStorage.getItem("sweetcrumbs-visited");

  const links = document.querySelectorAll("a[href]");
  let navigationStarted = false;

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if (link.target === "_blank") return;
    if (link.classList.contains("nav-link")) return;

    link.addEventListener("click", (event) => {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (navigationStarted) return;
      navigationStarted = true;
      event.preventDefault();
      loader.classList.remove("hide");
      setTimeout(() => {
        window.location.href = url.href;
      }, 300);
    });
  });

  window.addEventListener("load", () => {
    if (isFirstVisit) {
      localStorage.setItem("sweetcrumbs-visited", "true");
      setTimeout(() => {
        loader.classList.add("hide");
        setTimeout(() => {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 400);
      }, 2000);
    } else {
      // Hide immediately on subsequent visits
      loader.classList.add("hide");
      setTimeout(() => {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 400);
    }
  });
}

const CART_STORAGE_KEY = "sweetcrumbs-cart";
const SELECTED_PRODUCT_KEY = "sweetcrumbs-selected-product";

function getCartItems() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function getSelectedProduct() {
  try {
    const stored = localStorage.getItem(SELECTED_PRODUCT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function setSelectedProduct(product) {
  localStorage.setItem(SELECTED_PRODUCT_KEY, JSON.stringify(product));
}

function updateCartCount() {
  const cartItems = getCartItems();
  const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = total;
  });
}

function renderCartPanel() {
  const cartItems = getCartItems();
  const list = document.querySelector(".cart-items");
  const totalPrice = document.querySelector(".cart-total-price");
  if (!list || !totalPrice) return;

  if (cartItems.length === 0) {
    list.innerHTML = `<p style="color:#7c5562;">Your cart is empty. Add something sweet to get started.</p>`;
    totalPrice.textContent = "₹0";
    return;
  }

  list.innerHTML = cartItems
    .map(
      (item, index) => `
        <div class="cart-item">
          <div class="cart-item-top">
            <h4>${item.name}</h4>
            <button class="btn cart-remove-btn" data-index="${index}" type="button">Remove</button>
          </div>
          <span>${item.quantity} × ${item.price}</span>
          <span>Subtotal: ₹${item.quantity * parseInt(item.price.replace(/[^0-9]/g, ""), 10)}</span>
        </div>
      `
    )
    .join("");

  document.querySelectorAll(".cart-remove-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = Number(event.currentTarget.dataset.index);
      removeCartItem(index);
    });
  });

  const total = cartItems.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 0;
    return sum + price * item.quantity;
  }, 0);
  totalPrice.textContent = `₹${total}`;
}

function removeCartItem(index) {
  const cartItems = getCartItems();
  if (index < 0 || index >= cartItems.length) return;
  cartItems.splice(index, 1);
  saveCartItems(cartItems);
  updateCartCount();
  renderCartPanel();
}

function toggleCartPanel(open) {
  const overlay = document.querySelector(".cart-overlay");
  const panel = document.querySelector(".cart-panel");
  if (!overlay || !panel) return;
  if (open) {
    overlay.classList.add("open");
    panel.classList.add("open");
    renderCartPanel();
  } else {
    overlay.classList.remove("open");
    panel.classList.remove("open");
  }
}

function addToCart(product) {
  if (!product || !product.name || !product.price) return;
  const cartItems = getCartItems();
  const existing = cartItems.find((item) => item.name === product.name);
  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cartItems.push(product);
  }
  saveCartItems(cartItems);
  updateCartCount();
}

function createCartPanelMarkup() {
  if (document.querySelector(".cart-overlay")) return;
  const overlay = document.createElement("div");
  overlay.className = "cart-overlay";
  const panel = document.createElement("section");
  panel.className = "cart-panel";
  panel.innerHTML = `
    <button class="cart-close" type="button">×</button>
    <h2>Your Cart</h2>
    <div class="cart-items"></div>
    <div class="cart-footer">
      <p>Total: <strong class="cart-total-price">₹0</strong></p>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  overlay.addEventListener("click", () => toggleCartPanel(false));
  panel.querySelector(".cart-close").addEventListener("click", () => toggleCartPanel(false));
}

function setupCartLink() {
  const cartLink = document.getElementById("view-cart-link");
  if (!cartLink) return;
  cartLink.addEventListener("click", (event) => {
    event.preventDefault();
    toggleCartPanel(true);
  });
}

function setupAddButtons() {
  const cardElements = document.querySelectorAll(".card");
  cardElements.forEach((card) => {
    const row = card.querySelector(".row");
    const viewLink = card.querySelector(".btn.mini");
    if (!row || !viewLink) return;
    if (row.querySelector(".cart-add-btn")) return;

    const name = card.querySelector(".card-content h3")?.textContent.trim();
    const price = card.querySelector(".row span")?.textContent.trim();
    const description = card.querySelector(".card-content p")?.textContent.trim();
    const image = card.querySelector("img")?.src || "";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "btn mini cart-add-btn";
    addButton.textContent = "Add";
    row.insertBefore(addButton, viewLink);

    addButton.addEventListener("click", () => {
      addToCart({ name, price, description, image, quantity: 1 });
      toggleCartPanel(true);
    });

    const originalHref = viewLink.getAttribute("href");
    viewLink.addEventListener("click", (event) => {
      if (!name || !price) return;
      event.preventDefault();
      setSelectedProduct({ name, price, description, image, category: card.dataset.type || "Bakery" });
      window.location.href = originalHref;
    });
  });
}

function initProductDetailPage() {
  const detailSection = document.querySelector(".product-detail-section");
  if (!detailSection) return;

  const selectedProduct = getSelectedProduct();
  const productTitle = document.querySelector(".product-info h1");
  const productPrice = document.querySelector(".price");
  const productDesc = document.querySelector(".product-info p");
  const productImage = document.querySelector(".product-image img");
  const meta = document.querySelector(".meta");
  const addBtn = document.querySelector(".add-to-cart-btn");

  if (selectedProduct) {
    if (productTitle) productTitle.textContent = selectedProduct.name;
    if (productPrice) productPrice.textContent = selectedProduct.price;
    if (productDesc) productDesc.textContent = selectedProduct.description;
    if (productImage && selectedProduct.image) {
      productImage.src = selectedProduct.image;
      productImage.alt = selectedProduct.name;
    }
    if (meta) {
      meta.innerHTML = `
        <p><span>Category:</span> ${selectedProduct.category || "Bakery"}</p>
        <p><span>Allergens:</span> Contains Wheat, Dairy, and Eggs. Manufactured in a facility that processes nuts.</p>
        <p><span>Availability:</span> Baked Fresh Daily</p>
      `;
    }
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const quantityInput = document.querySelector("#qty");
      const quantity = Number(quantityInput?.value || 1);
      if (selectedProduct && quantity > 0) {
        addToCart({
          name: selectedProduct.name || productTitle?.textContent.trim(),
          price: selectedProduct.price || productPrice?.textContent.trim(),
          description: selectedProduct.description || productDesc?.textContent.trim(),
          image: selectedProduct.image || productImage?.src,
          quantity,
        });
        toggleCartPanel(true);
      }
    });
  }

  detailSection.classList.add("animate-detail");
  setTimeout(() => {
    detailSection.classList.add("show-detail");
  }, 50);
}

function initImageFallbacks() {
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      if (!img.dataset.fallbackSet) {
        img.dataset.fallbackSet = "true";
        img.src = "https://via.placeholder.com/600x450/ffe5f0/8f4f6c?text=Sweet+Crumbs";
      }
    });
  });
}

function initCartFeatures() {
  createCartPanelMarkup();
  setupCartLink();
  setupAddButtons();
  initProductDetailPage();
  initImageFallbacks();
  updateCartCount();
}

initCartFeatures();
initPageLoader();
