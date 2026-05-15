// ================= GLOBAL ELEMENTS =================
const chips = document.querySelectorAll(".chip");
const cards = document.querySelectorAll(".card");
const menuToggle = document.querySelector(".menu-toggle");
const navList = document.querySelector(".nav-list");

// ================= AUTH ELEMENTS =================
const authModal = document.getElementById("auth-modal");
const loginBox = document.getElementById("login-box");
const registerBox = document.getElementById("register-box");
const toRegisterLink = document.getElementById("to-register");
const toLoginLink = document.getElementById("to-login");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// ================= 1. AUTH LOGIC =================
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem("sc-user-logged-in");
    if (isLoggedIn === "true") {
        if (authModal) authModal.classList.add("hidden");
        document.body.classList.remove("modal-open");
    } else {
        if (authModal) authModal.classList.remove("hidden");
        document.body.classList.add("modal-open");
    }
}

// Toggle between Boxes (Ye bilkul theek hai)
if (toRegisterLink && toLoginLink) {
    toRegisterLink.addEventListener("click", (e) => {
        e.preventDefault();
        loginBox.classList.add("hidden");
        registerBox.classList.remove("hidden");
    });
    toLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        registerBox.classList.add("hidden");
        loginBox.classList.remove("hidden");
    });
}

// --- YAHAN CHANGES KARNI HAIN (Submit Handlers) ---

// Handle Registration
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("register-name").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;

        localStorage.setItem(`user_${email}`, JSON.stringify({ name, email, password }));
        
        alert("Account created! Please login now.");
        // Signup ke baad login box dikhao
        registerBox.classList.add("hidden");
        loginBox.classList.remove("hidden");
    });
}

// Handle Login
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const savedUser = localStorage.getItem(`user_${email}`);

        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser.password === password) {
                // Success: Session save karo aur reload karo
                localStorage.setItem("sc-user-logged-in", "true");
                localStorage.setItem("sc-current-user", parsedUser.name);
                
                alert(`Welcome back, ${parsedUser.name}!`);
                window.location.reload(); // Is se modal permanent chala jayega
            } else {
                alert("Incorrect password!");
            }
        } else {
            alert("No account found! Please register.");
        }
    });
}

// ================= 2. CART LOGIC =================
const CART_STORAGE_KEY = "sweetcrumbs-cart";

function getCartItems() {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
}

function updateCartCount() {
    const cartItems = getCartItems();
    const total = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    document.querySelectorAll(".cart-count").forEach(el => el.textContent = total);
}

function addToCart(product) {
    let cartItems = getCartItems();
    const existing = cartItems.find(item => item.name === product.name);
    if (existing) { existing.quantity += 1; } 
    else { cartItems.push({ ...product, quantity: 1 }); }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    updateCartCount();
    alert(`${product.name} added to cart!`);
}

// ================= 3. FILTER & MENU LOGIC (Wapis Add Kiya) =================
function initFilters() {
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
}

// ================= 4. SCROLL & UI ANIMATIONS =================
function initAnimations() {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, observerOptions);

    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
}

// FAQ Logic
function initFAQ() {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((item) => {
        item.querySelector(".faq-question").addEventListener("click", () => {
            faqItems.forEach(i => { if(i !== item) i.classList.remove("active"); });
            item.classList.toggle("active");
        });
    });
}

// ================= 5. SETUP & BUTTONS =================
function setupAddButtons() {
    cards.forEach(card => {
        const row = card.querySelector(".row");
        const viewLink = card.querySelector(".btn.mini");
        if (!row || row.querySelector(".cart-add-btn")) return;

        const name = card.querySelector("h3")?.textContent.trim();
        const price = card.querySelector(".row span")?.textContent.trim();
        const image = card.querySelector("img")?.src;

        const btn = document.createElement("button");
        btn.className = "btn mini cart-add-btn";
        btn.textContent = "Add";
        btn.onclick = () => addToCart({ name, price, image });
        row.insertBefore(btn, viewLink);
    });
}

function setupViewCart() {
    const viewCartLink = document.getElementById("view-cart-link");
    if (viewCartLink) {
        viewCartLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "cart.html";
        });
    }
}

function handleLogout() {
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("sc-user-logged-in");
            window.location.reload();
        });
    }
}

function initPageLoader() {
    const loader = document.querySelector(".page-loader");
    if (loader) {
        window.addEventListener("load", () => {
            setTimeout(() => loader.classList.add("hide"), 1000);
        });
    }
}

if (menuToggle && navList) {
    menuToggle.addEventListener("click", () => navList.classList.toggle("open"));
}

// ================= 6. FINAL INITIALIZE =================
function init() {
    checkAuthStatus();   // Auth modal
    initFilters();       // Gallery/Menu fix
    initAnimations();    // Scroll fix
    initFAQ();           // FAQ fix
    setupAddButtons();   // Cart Add buttons
    setupViewCart();     // Cart Redirect fix
    updateCartCount();   // Cart counter
    initPageLoader();    // Loader fix
    handleLogout();      // Logout fix
}

init();