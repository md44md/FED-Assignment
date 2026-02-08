// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    set,
    get,
    update,
    remove,
    child
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// generate temprorary uid
function getTempUserId() {
    let id = localStorage.getItem("tempUserId");
    if (!id) {
    id = "temp_" + crypto.randomUUID();
    localStorage.setItem("tempUserId", id);
  }
  return id;
}

const firebaseConfig = {
    apiKey: "AIzaSyBukUCu_LAoZE9X4nORQAcKrb1Pe9By8X8",
    authDomain: "fed-assignment-ffb90.firebaseapp.com",
    databaseURL: "https://fed-assignment-ffb90-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fed-assignment-ffb90",
    storageBucket: "fed-assignment-ffb90.firebasestorage.app",
    messagingSenderId: "336842942112",
    appId: "1:336842942112:web:3e0c6f4646bf7e23fd8bc5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


//// MAIN PROGRAM
document.addEventListener("DOMContentLoaded", async () => {
    // Read cart from database
    const userId = getTempUserId();

    async function getCart() {
        const cartRef = ref(db, `carts/${userId}`);
        const snapshot = await get(cartRef);
        return snapshot.exists() ? snapshot.val() : {};
    }

    // Save cart to database
    async function saveCart(cart) {
        await set(ref(db, `carts/${userId}`), cart);
    }

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }


/// Add to cart page 
    const menuContainer = document.querySelector(".menu-container");
    if (menuContainer){
        // Add to cart buttons
        document.querySelectorAll(".add-to-cart").forEach(button => {
            button.addEventListener("click", async () => {
                const cart = await getCart();
                const stall = button.dataset.stall;
                
                const item = {
                    id: button.dataset.id,
                    name: button.dataset.name,
                    price: parseFloat(button.dataset.price),
                    quantity: 1,
                    img: button.dataset.img
                };

                if (!cart[stall]) cart[stall] = [];
                const existing = cart[stall].find(i => i.id === item.id);
                if (existing) existing.quantity++;
                else cart[stall].push(item);

                await saveCart(cart);       
                console.log(cart);
                alert(`${item.name} added to cart`);
            });
        }); 
    }

/// Cart page
    const cartContainer = document.querySelector(".cart-container");
    if (cartContainer) {

        // Render cart cards
        async function renderAllCarts() {
            const cart = await getCart();
            cartContainer.innerHTML = "";

            if (Object.keys(cart).length === 0) {
                const emptyMsg = document.createElement("p");
                emptyMsg.className = "empty-message";
                emptyMsg.textContent = "Your cart is empty.";

                cartContainer.appendChild(emptyMsg);
                return;
            }

            for (const stall in cart) {
                const stallHeader = document.createElement("div");
                stallHeader.classList.add("stall-header");
                stallHeader.textContent = stall;
                cartContainer.appendChild(stallHeader);

                cart[stall].forEach(item => {
                    const card = document.createElement("div");
                    card.className = "cart-item-card card flex-center";

                    card.innerHTML = `
                        <div class="cart-img-wrapper img-wrapper">
                            <img class="cart-item-img img-cover" src="${item.img}" alt="${item.name}">
                        </div>
                        <div class="cart-item-content">
                            <p class="cart-item-name">${item.name}</p>

                            <div class="cart-item-qty-container flex-center">
                                <button class="cart-item-decrease-btn" data-stall="${stall}" data-id="${item.id}">-</button>
                                <p class="cart-item-qty">${item.quantity}</p>
                                <button class="cart-item-increase-btn" data-stall="${stall}" data-id="${item.id}">+</button>
                            </div>

                            <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>

                            <button class="cart-item-delete-btn" data-stall="${stall}" data-id="${item.id}">
                                <img src="/images/delete.png" alt="Remove item">
                            </button>
                        </div>
                    `;

                    cartContainer.appendChild(card);
                });
            }

            populateCheckoutStalls();
        }

        renderAllCarts();

        // Quantity button functionality
        cartContainer.addEventListener("click", async e => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const stall = btn.dataset.stall;
            const id = btn.dataset.id;

            // Read cart from Firebase
            const cart = await getCart();
            if (!cart[stall]) return;

            const item = cart[stall].find(i => i.id === id);
            if (!item) return;

            // Apply quantity logic
            if (btn.classList.contains("cart-item-increase-btn")) {
                item.quantity++;
            }

            if (btn.classList.contains("cart-item-decrease-btn")) {
                item.quantity--;

                if (item.quantity <= 0) {
                    cart[stall] = cart[stall].filter(i => i.id !== id);
                    if (cart[stall].length === 0) {
                        delete cart[stall];
                    }
                }
            }

            if (btn.classList.contains("cart-item-delete-btn")) {
                cart[stall] = cart[stall].filter(i => i.id !== id);
                if (cart[stall].length === 0) {
                    delete cart[stall];
                }
            }

            // Save updated cart back to Firebase
            await saveCart(cart);

            // Re-render UI
            renderAllCarts();
        });

        // checkout functionality
        const stallSelect = document.querySelector("#stall-select");
        const totalCost = document.querySelector(".total-cost");
        const placeOrderBtn = document.querySelector(".place-order-btn");
        const paymentSelect = document.querySelector("#payment-select");

        // Update options inside checkout card
        async function populateCheckoutStalls() {
            const cart = await getCart();
            
            stallSelect.innerHTML = "";

            const stalls = Object.keys(cart);
            if (stalls.length === 0) {
                stallSelect.innerHTML = '<option disabled selected>No stalls in cart</option>';
                totalCost.textContent = "Total: $0.00";
                placeOrderBtn.href = "#";
                return;
            }

            stalls.forEach(stall => {
                const option = document.createElement("option");
                option.value = stall;
                option.textContent = stall;
                stallSelect.appendChild(option);
            });

            updateCheckoutInfo(); 
        }

        // Update total whenever the user changes the selected stall and update payment method
        async function updateCheckoutInfo() {
            const cart = await getCart();
            const selectedStall = stallSelect.value;
            if (!cart[selectedStall]) return;

            const total = cart[selectedStall].reduce((sum, item) => sum + item.price * item.quantity, 0);
            totalCost.textContent = `Total: $${total.toFixed(2)}`;

            placeOrderBtn.href = `checkout-summary.html?stall=${encodeURIComponent(stallSelect.value)}&payment=${encodeURIComponent(paymentSelect.value)}`;
        }

        // Listen for changes in stall selection
        stallSelect.addEventListener("change", updateCheckoutInfo);
        paymentSelect.addEventListener("change", updateCheckoutInfo);

        populateCheckoutStalls();
    }

/// Checkout summary page
    const checkoutSummaryContainer = document.querySelector(".checkout-summary-container");
    if (checkoutSummaryContainer){

        // Checkout rendering
        const selectedStall = getQueryParam("stall");
        const paymentMethod = getQueryParam("payment");
        const checkoutBtn = document.querySelector("#checkout-btn");

        if (selectedStall) {
            // Only run checkout summary if a stall is selected (on checkout page)
            const cart = await getCart();
            const items = cart[selectedStall] || [];
            const tbody = document.querySelector(".checkout-items-body");

            let total = 0;

            items.forEach(item => {
                const cost = item.price * item.quantity;
                total += cost;

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${cost.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });

            // Update total
            document.querySelector("#total-cost").textContent = `$${total.toFixed(2)}`;

            // Display order info
            const orderId = "ORD-" + Math.floor(Math.random() * 1000000);
            const orderDate = new Date().toLocaleString();

            document.querySelector("#order-id").textContent = orderId;
            document.querySelector("#order-date").textContent = orderDate;   
            document.querySelector("#payment-method").textContent = paymentMethod;
            document.querySelector("#stall-name").textContent = selectedStall;

            // Save to firebase when click checkout button
            checkoutBtn.addEventListener("click", async () => {
                if (!cart[selectedStall]) {
                    alert("No items to checkout");
                    return;
                }

                // Prepare items array for Firebase
                const orderItems = items.map(i => ({
                    name: i.name,
                    quantity: i.quantity,
                    cost: i.price * i.quantity
                }));

                const orderData = {
                    orderId,
                    date: new Date().toISOString(), // use ISO for sorting
                    stall: selectedStall,
                    paymentMethod,
                    total,
                    items: orderItems
                };

                // Save under orders/<userId>/<orderId>
                const userId = getTempUserId();
                const orderRef = ref(db, `orders/${userId}/${orderId}`);
                await set(orderRef, orderData);

                alert("Order confirmed");

                // Clear cart for that stall
                delete cart[selectedStall];
                await saveCart(cart);
            });
        }
    }

/// Order history page
    const orderHistoryBody = document.querySelector(".order-history-body");
    if (orderHistoryBody) {
        const userId = getTempUserId();
        const ordersRef = ref(db, `orders/${userId}`);
        const snapshot = await get(ordersRef);

        if (!snapshot.exists()) {
            orderHistoryBody.innerHTML = "<tr><td colspan='5'>No orders found.</td></tr>";
        } else {
            const ordersObj = snapshot.val();
            // Convert object into array
            const orders = Object.values(ordersObj);

            // Sort by date (latest first)
            orders.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Render
            orders.forEach(order => {
                const tr = document.createElement("tr");

                const detailsBtn = document.createElement("a");
                detailsBtn.classList.add("details-btn");
                detailsBtn.textContent = "Details";
                detailsBtn.href = `order-details.html?orderId=${order.orderId}`;

                tr.innerHTML = `
                    <td>${order.orderId}</td>
                    <td>${new Date(order.date).toLocaleString()}</td>
                    <td>${order.stall}</td>
                    <td>$${order.total.toFixed(2)}</td>
                    <td></td>
                `;

                tr.querySelector("td:last-child").appendChild(detailsBtn);
                orderHistoryBody.appendChild(tr);
            });
        }
    }

/// order details page
    const orderDetailsContainer = document.querySelector(".order-details-container");
    if (orderDetailsContainer) {
        const orderId = getQueryParam("orderId");
        const userId = getTempUserId();
        
        if (!orderId) return alert("No order selected");

        const orderRef = ref(db, `orders/${userId}/${orderId}`);
        const snapshot = await get(orderRef);

        if (!snapshot.exists()) {
            alert("Order not found");
            return;
        }

        const order = snapshot.val();

        document.querySelector("#order-id").textContent = order.orderId;
        document.querySelector("#order-date").textContent = new Date(order.date).toLocaleString();
        document.querySelector("#stall-name").textContent = order.stall;
        document.querySelector("#payment-method").textContent = order.paymentMethod;
        document.querySelector("#total-cost").textContent = `$${order.total.toFixed(2)}`;

        const tbody = document.querySelector(".order-details-body");
        order.items.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.cost.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
});
