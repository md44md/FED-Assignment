document.addEventListener("DOMContentLoaded", () => {
/// Add to cart functionality 
    // Read cart from localStorage
    function getCart() {
        const saved = localStorage.getItem("cart");
        if (!saved) return {};
        try {
            const parsed = JSON.parse(saved);
            return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
        } catch {
            return {};
        }
    }
    // Save cart to localStorage
    function saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Add to cart buttons
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const cart = getCart();
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

            saveCart(cart);
            console.log(cart);
            // alert(`${item.name} added to cart!`);
        });
    });


/// Cart page functionality
    const cartContainer = document.querySelector(".cart-container");
    if (!cartContainer) return;

    // Display cart cards
    function renderAllCarts() {
        const cart = JSON.parse(localStorage.getItem("cart")) || {};
        cartContainer.innerHTML = "";

        if (Object.keys(cart).length === 0) {
            cartContainer.textContent = "Your cart is empty.";
            return;
        }

        for (const stall in cart) {
            const stallHeader = document.createElement("div");
            stallHeader.classList.add("cart-title");
            stallHeader.textContent = stall;
            cartContainer.appendChild(stallHeader);

            cart[stall].forEach(item => {
                const card = document.createElement("div");
                card.className = "cart-item-card";

                card.innerHTML = `
                    <img class="cart-item-img" src="${item.img || '/images/placeholder.png'}" alt="${item.name}">
                    <div class="cart-item-content">
                        <p class="cart-item-name">${item.name}</p>

                        <div class="cart-item-qty-container">
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
    }

    renderAllCarts();

    // Quantity button functionality
    cartContainer.addEventListener("click", e => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const cart = JSON.parse(localStorage.getItem("cart")) || {};
        const stall = btn.dataset.stall;
        const id = btn.dataset.id;

        if (btn.classList.contains("cart-item-increase-btn")) {
            const item = cart[stall].find(i => i.id === id);
            item.quantity++;
        }

        if (btn.classList.contains("cart-item-decrease-btn")) {
            const item = cart[stall].find(i => i.id === id);
            item.quantity--;
            if (item.quantity <= 0) {
                cart[stall] = cart[stall].filter(i => i.id !== id);
                if (cart[stall].length === 0) delete cart[stall];
            }
        }

        if (btn.classList.contains("cart-item-delete-btn")) {
            cart[stall] = cart[stall].filter(i => i.id !== id);
            if (cart[stall].length === 0) delete cart[stall];
        }

        saveCart(cart);
        renderAllCarts(); // update cart
    }); 
});