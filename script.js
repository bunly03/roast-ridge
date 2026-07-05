/* =========================================================
   Roast & Ridge — storefront logic
   - Loads products from Supabase (falls back to local data
     so the page NEVER breaks if Supabase isn't configured yet)
   - Cart stored in memory (per session)
   - Checkout is a SIMULATION ONLY — no real payment is sent
   ========================================================= */

// ---- 1. SUPABASE CONFIG -----------------------------------------
// Replace these two values with your own project's URL and anon key
// (Supabase Dashboard -> Project Settings -> API).
// The site will still work with local fallback data if left blank.
const SUPABASE_URL = "https://euzlwpwxfcqtjrtgjyol.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1emx3cHd4ZmNxdGpydGdqeW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzMyMjUsImV4cCI6MjA5ODY0OTIyNX0.KAXtor5y5sqepFcJQxa01Mwp8vFfrTR1KeMMkrIAZws";

let supabaseClient = null;
try {
  if (
    window.supabase &&
    SUPABASE_URL &&
    SUPABASE_URL.startsWith("http") &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
  ) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase client init failed, using local data.", e);
}

// ---- 2. LOCAL FALLBACK PRODUCT DATA -------------------------------
// Mirrors the rows in supabase-schema.sql so the page still renders
// products even before Supabase is connected.
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Ethiopian Yirgacheffe",
    tag: "Light Roast",
    description: "Floral and bright with notes of jasmine, bergamot, and lemon zest. Washed process, grown at 1,900m.",
    price: 18.99,
    image_url: "https://images.unsplash.com/photo-1587734195503-904fca47e0d9?w=600&q=80"
  },
  {
    id: 2,
    name: "Colombian Supremo",
    tag: "Medium Roast",
    description: "A balanced, crowd-pleasing cup with caramel sweetness, red apple acidity, and a smooth walnut finish.",
    price: 16.99,
    image_url: "https://images.unsplash.com/photo-1524350876685-274059332603?w=600&q=80"
  },
  {
    id: 3,
    name: "Sumatra Mandheling",
    tag: "Dark Roast",
    description: "Full-bodied and earthy with notes of dark chocolate, cedar, and a low, syrupy acidity.",
    price: 17.99,
    image_url: "https://images.unsplash.com/photo-1559525839-8f275eae4536?w=600&q=80"
  },
  {
    id: 4,
    name: "Guatemala Antigua",
    tag: "Medium Roast",
    description: "Rich and spicy with cocoa, orange peel, and a subtle smokiness from volcanic soil.",
    price: 19.99,
    image_url: "https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=600&q=80"
  },
  {
    id: 5,
    name: "Kenya AA",
    tag: "Light-Medium Roast",
    description: "Wine-like acidity with juicy blackcurrant, tomato, and a bright, sparkling finish.",
    price: 20.99,
    image_url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80"
  },
  {
    id: 6,
    name: "House Blend Espresso",
    tag: "Dark Roast",
    description: "Our signature blend built for espresso — bold, chocolatey, with a thick, lingering crema.",
    price: 15.99,
    image_url: "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=600&q=80"
  }
];

// ---- 3. STATE ------------------------------------------------------
let PRODUCTS = [];
let cart = []; // [{ id, name, price, image_url, qty }]

// ---- 4. DOM REFERENCES ----------------------------------------------
const productGrid = document.getElementById("product-grid");
const dbStatus = document.getElementById("db-status");
const cartToggle = document.getElementById("cart-toggle");
const cartCount = document.getElementById("cart-count");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const cartClose = document.getElementById("cart-close");
const cartItemsEl = document.getElementById("cart-items");
const cartSubtotalEl = document.getElementById("cart-subtotal-amount");
const checkoutBtn = document.getElementById("checkout-btn");

const checkoutOverlay = document.getElementById("checkout-overlay");
const checkoutModal = document.getElementById("checkout-modal");
const checkoutClose = document.getElementById("checkout-close");
const checkoutForm = document.getElementById("checkout-form");
const checkoutSummary = document.getElementById("checkout-summary");
const checkoutFormView = document.getElementById("checkout-form-view");
const checkoutSuccessView = document.getElementById("checkout-success-view");
const successName = document.getElementById("success-name");
const successOrderId = document.getElementById("success-order-id");
const checkoutDoneBtn = document.getElementById("checkout-done-btn");

// ---- 5. LOAD PRODUCTS (Supabase -> fallback) ------------------------
async function loadProducts() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        PRODUCTS = data;
        dbStatus.textContent = "Live from Supabase database";
        dbStatus.classList.add("live");
        renderProducts();
        return;
      }
      throw new Error("No rows returned");
    } catch (err) {
      console.warn("Falling back to local product data:", err.message);
    }
  }

  // Fallback path — guarantees the page never shows an error state
  PRODUCTS = FALLBACK_PRODUCTS;
  dbStatus.textContent = "Showing sample data (connect Supabase for live data)";
  dbStatus.classList.add("fallback");
  renderProducts();
}

function renderProducts() {
  productGrid.innerHTML = PRODUCTS.map((p) => `
    <div class="product-card">
      <img src="${p.image_url}" alt="${escapeHtml(p.name)}" loading="lazy" />
      <div class="product-card-body">
        <span class="product-tag">${escapeHtml(p.tag || "")}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <p class="product-desc">${escapeHtml(p.description)}</p>
        <div class="product-card-footer">
          <span class="product-price">$${Number(p.price).toFixed(2)}</span>
          <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(Number(btn.dataset.id));
      btn.textContent = "Added ✓";
      btn.classList.add("added");
      setTimeout(() => {
        btn.textContent = "Add to Cart";
        btn.classList.remove("added");
      }, 900);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ---- 6. CART LOGIC ----------------------------------------------------
function addToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
  const existing = cart.find((i) => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      qty: 1
    });
  }
  renderCart();
}

function updateQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  renderCart();
}

function cartSubtotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCart() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCount.textContent = totalQty;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    checkoutBtn.disabled = true;
  } else {
    cartItemsEl.innerHTML = cart.map((item) => `
      <div class="cart-item">
        <img src="${item.image_url}" alt="${escapeHtml(item.name)}" />
        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
          <div class="cart-item-controls">
            <button class="qty-btn" data-action="dec" data-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
            <button class="remove-item-btn" data-id="${item.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join("");
    checkoutBtn.disabled = false;

    cartItemsEl.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        updateQty(id, btn.dataset.action === "inc" ? 1 : -1);
      });
    });
    cartItemsEl.querySelectorAll(".remove-item-btn").forEach((btn) => {
      btn.addEventListener("click", () => removeFromCart(Number(btn.dataset.id)));
    });
  }

  cartSubtotalEl.textContent = `$${cartSubtotal().toFixed(2)}`;
}

// ---- 7. CART DRAWER OPEN/CLOSE -----------------------------------------
function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("active");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("active");
}
cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// ---- 8. CHECKOUT MODAL ---------------------------------------------------
function openCheckout() {
  if (cart.length === 0) return;
  closeCart();
  const shipping = 4.99;
  const subtotal = cartSubtotal();
  const total = subtotal + shipping;
  checkoutSummary.innerHTML = `
    <div class="row"><span>Items (${cart.reduce((s, i) => s + i.qty, 0)})</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="row"><span>Shipping</span><span>$${shipping.toFixed(2)}</span></div>
    <div class="row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
  `;
  checkoutFormView.hidden = false;
  checkoutSuccessView.hidden = true;
  checkoutModal.classList.add("open");
  checkoutOverlay.classList.add("active");
}
function closeCheckout() {
  checkoutModal.classList.remove("open");
  checkoutOverlay.classList.remove("active");
}
checkoutBtn.addEventListener("click", openCheckout);
checkoutClose.addEventListener("click", closeCheckout);
checkoutOverlay.addEventListener("click", closeCheckout);
checkoutDoneBtn.addEventListener("click", () => {
  closeCheckout();
});

// ---- 9. SIMULATED ORDER SUBMISSION ----------------------------------------
checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(checkoutForm);
  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const shipping = 4.99;
  const total = cartSubtotal() + shipping;
  const orderId = "DEMO-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  // IMPORTANT: This does NOT call any payment processor.
  // It only (optionally) logs the demo order to Supabase for record-keeping.
  if (supabaseClient) {
    try {
      await supabaseClient.from("orders").insert([{
        order_id: orderId,
        customer_name: fullName,
        customer_email: email,
        items: JSON.stringify(cart),
        total: total.toFixed(2),
        status: "demo_no_payment"
      }]);
    } catch (err) {
      console.warn("Order logging to Supabase skipped/failed:", err.message);
    }
  }

  successName.textContent = fullName;
  successOrderId.textContent = orderId;
  checkoutFormView.hidden = true;
  checkoutSuccessView.hidden = false;

  cart = [];
  renderCart();
  checkoutForm.reset();
});

// ---- 10. INIT ----------------------------------------------------------
loadProducts();
renderCart();
