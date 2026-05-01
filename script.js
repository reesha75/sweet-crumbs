// ================= NAV =================
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

// ================= FILTER =================
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

// ================= SCROLL ANIMATION (FIXED) =================
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

// ❌ IMPORTANT FIX: .section REMOVE
const fadeElements = document.querySelectorAll(".fade-up");

fadeElements.forEach((el) => {
  observer.observe(el);
});

// cards animation delay
const cardElements = document.querySelectorAll(".card");
cardElements.forEach((card, index) => {
  card.style.animationDelay = `${index * 0.1}s`;
});

// ================= FAQ =================
const faqItems = document.querySelectorAll(".faq-item");
if (faqItems.length > 0) {
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
        }
      });
      item.classList.toggle("active");
    });
  });
}

// ================= LOADER =================
function initPageLoader() {
  const loader = document.querySelector(".page-loader");
  if (!loader) return;

  const isFirstVisit = !localStorage.getItem("sweetcrumbs-visited");

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
      loader.classList.add("hide");
      setTimeout(() => {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 400);
    }
  });
}

// ================= CART =================
const CART_STORAGE_KEY = "sweetcrumbs-cart";

function getCartItems() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function updateCartCount() {
  const cartItems = getCartItems();
  const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = total;
  });
}

function addToCart(product) {
  if (!product || !product.name || !product.price) return;

  const cartItems = getCartItems();
  const existing = cartItems.find((item) => item.name === product.name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({ ...product, quantity: 1 });
  }

  saveCartItems(cartItems);
  updateCartCount();
}

// ================= ADD BUTTON =================
function setupAddButtons() {
  const cardElements = document.querySelectorAll(".card");

  cardElements.forEach((card) => {
    const row = card.querySelector(".row");
    const viewLink = card.querySelector(".btn.mini");

    if (!row || !viewLink) return;
    if (row.querySelector(".cart-add-btn")) return;

    const name = card.querySelector("h3")?.textContent.trim();
    const price = card.querySelector(".row span")?.textContent.trim();
    const image = card.querySelector("img")?.src;

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "btn mini cart-add-btn";
    addButton.textContent = "Add";

    row.insertBefore(addButton, viewLink);

    addButton.addEventListener("click", () => {
      addToCart({ name, price, image });
    });
  });
}

// ================= IMAGE FALLBACK =================
function initImageFallbacks() {
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      if (!img.dataset.fallbackSet) {
        img.dataset.fallbackSet = "true";
        img.src = "https://via.placeholder.com/600x450";
      }
    });
  });
}

// ================= INIT =================
function init() {
  setupAddButtons();
  initImageFallbacks();
  updateCartCount();
  initPageLoader(); // ⚠️ IMPORTANT
}

init();