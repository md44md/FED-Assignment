const addToCartButtons = document.querySelectorAll(".add-to-cart");
let cart = [];

function addToCart(stall, item) {
    if (!cart[stall]) {
        cart[stall] = [];
    }

    const existingItem = cart[stall].find(cartItem => cartItem.id === item.id);
    if (existingItem) {
        existingItem.quantity++;
    } 
    else {
        cart[stall].push(item);
    }   
    // FOR TESTING
    // console.log(`Stall: ${stall}`);
    // for (let i = 0; i < cart[stall].length; i++) {
    //     console.log(`Item: ${cart[stall][i].name}, Quantity: ${cart[stall][i].quantity}`);
    // }
    // localStorage.setItem("cart", JSON.stringify(cart));
}

addToCartButtons.forEach(button => {
    button.addEventListener("click", () => {
        const stall = button.getAttribute("data-stall");
        const item = {
            id: button.getAttribute("data-id"),
            name: button.getAttribute("data-name"),
            price: parseFloat(button.getAttribute("data-price")),
            quantity: 1
        };
    addToCart(stall, item);
  });
});

