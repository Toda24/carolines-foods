document.addEventListener('DOMContentLoaded', () => {

    // ==================================
    // === 0. CONFIG & SEASONAL LOGIC ===
    // ==================================
    let icePrice = 500; // Default

    function initSeasonalPricing() {
        const month = new Date().getMonth(); 
        const isRainy = (month >= 3 && month <= 9);
        
        if (isRainy) {
            icePrice = 300;
        } else {
            icePrice = 500;
        }

        const icePriceText = document.getElementById('ice-price-display');
        const iceBtn = document.getElementById('ice-btn');

        if (icePriceText) icePriceText.innerText = `₦${icePrice}`;
        if (iceBtn) iceBtn.dataset.price = icePrice;
        
        const allIceBtns = document.querySelectorAll('button[data-id="w2"]');
        allIceBtns.forEach(btn => {
            btn.dataset.price = icePrice;
            const priceP = btn.parentElement.querySelector('.price');
            if(priceP) priceP.innerText = `₦${icePrice}`;
        });
    }

    initSeasonalPricing();

    // ==================================
    // === 1. STATE ===
    // ==================================
    let cart = [];

    // ==================================
    // === 2. DOM ELEMENTS ===
    // ==================================
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const cartView = document.getElementById('cart-view');
    const checkoutView = document.getElementById('checkout-view');
    const thankYouView = document.getElementById('thank-you-view');
    const checkoutForm = document.getElementById('checkout-form');
    const backToCartBtn = document.getElementById('back-to-cart-btn');
    const newOrderBtn = document.getElementById('new-order-btn');
    const contactFormPage = document.getElementById('contact-form-page');

    // ==================================
    // === 3. FUNCTIONS ===
    // ==================================

    function renderCart() {
        cartItemsContainer.innerHTML = ''; 
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotalEl.textContent = '₦0';
            cartButton.textContent = 'Cart (0)';
            return;
        }

        let total = 0;
        let totalItems = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;

            const cartItemHTML = `
                <div class="cart-item" data-id="${item.id}">
                    <div>
                        <p style="font-weight:bold;">${item.name}</p>
                        <p style="font-size:0.9rem; color:#555;">₦${item.price} x ${item.quantity} = ₦${item.price * item.quantity}</p>
                    </div>
                    <div class="cart-actions" style="display:flex; gap:10px; align-items:center;">
                        <div class="cart-quantity">
                            <button class="quantity-btn decrease-btn">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn increase-btn">+</button>
                        </div>
                        <button class="remove-btn">x</button>
                    </div>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItemHTML;
        });

        cartTotalEl.textContent = `₦${total.toLocaleString()}`;
        cartButton.textContent = `Cart (${totalItems})`;
    }

    function addToCart(productId, productName, productPrice) {
        let initialQty = 1;
        
        if (productId === 'w1') initialQty = 10;
        if (productId === 'w2') initialQty = 20;

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: initialQty
            });
            
            if(initialQty > 1) {
                Toastify({
                    text: `ℹ️ Minimum order for ${productName} is ${initialQty}`,
                    duration: 4000,
                    style: { background: "#c0392b" }
                }).showToast();
            }
        }
        renderCart();

        // UPDATED: Orange Gradient for "Add to Cart"
        Toastify({
            text: `✅ ${productName} added`,
            duration: 3000,
            gravity: "bottom",
            position: "right",
            style: { background: "linear-gradient(to right, #D35400, #E67E22)" },
        }).showToast();
    }

    function updateQuantity(productId, action) {
        const item = cart.find(item => item.id === productId);
        if (!item) return;

        if (action === 'increase') {
            item.quantity++;
        } else if (action === 'decrease') {
            let min = 1;
            if (item.id === 'w1') min = 10;
            if (item.id === 'w2') min = 20;

            if (item.quantity > min) {
                item.quantity--;
            } else {
                if(confirm(`Remove ${item.name}? (Minimum order is ${min})`)) {
                    removeFromCart(productId);
                }
            }
        }
        renderCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        renderCart();
    }

    function clearCart() {
        cart = [];
        renderCart();
        Toastify({
            text: "🛒 Cart cleared",
            duration: 3000,
            style: { background: "#7f8c8d" },
        }).showToast();
    }

    function toggleModal(show) {
        if (show) {
            cartModal.style.display = 'flex';
            renderCart();
            showCartView();
        } else {
            cartModal.style.display = 'none';
        }
    }
    
    function showCartView() {
        cartView.style.display = 'block';
        checkoutView.style.display = 'none';
        thankYouView.style.display = 'none';
    }
    
    function showCheckoutView() {
        if(cart.length === 0) {
            alert("Cart is empty!");
            return;
        }
        cartView.style.display = 'none';
        checkoutView.style.display = 'block';
        thankYouView.style.display = 'none';
    }
    
    function showThankYouView() {
        cartView.style.display = 'none';
        checkoutView.style.display = 'none';
        thankYouView.style.display = 'block';
    }

    // ==================================
    // === 4. EVENT LISTENERS ===
    // ==================================

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const button = e.target;
            const productId = button.dataset.id;
            const productName = button.dataset.name;
            const productPrice = parseInt(button.dataset.price);

            if (productId && productName && productPrice) {
                addToCart(productId, productName, productPrice);
            }
        }
    });

    if(cartButton) cartButton.addEventListener('click', () => toggleModal(true));
    if(modalCloseBtn) modalCloseBtn.addEventListener('click', () => toggleModal(false));
    if(cartModal) cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) toggleModal(false);
    });

    if(cartItemsContainer) cartItemsContainer.addEventListener('click', (e) => {
        const itemEl = e.target.closest('.cart-item');
        if (!itemEl) return;
        const productId = itemEl.dataset.id; 

        if (e.target.classList.contains('increase-btn')) {
            updateQuantity(productId, 'increase');
        } else if (e.target.classList.contains('decrease-btn')) {
            updateQuantity(productId, 'decrease');
        } else if (e.target.classList.contains('remove-btn')) {
            removeFromCart(productId);
        }
    });

    if(clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
    if(checkoutBtn) checkoutBtn.addEventListener('click', showCheckoutView);
    if(backToCartBtn) backToCartBtn.addEventListener('click', showCartView);
    if(newOrderBtn) newOrderBtn.addEventListener('click', () => toggleModal(false));

    // ==================================
    // === 5. FORM SUBMISSIONS ===
    // ==================================

    if(checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const lga = document.getElementById('checkout-lga').value;
            const lgaError = document.getElementById('lga-error');
            
            if (lga !== 'Amuwo-Odofin') {
                lgaError.style.display = 'block';
                return;
            } else {
                lgaError.style.display = 'none';
            }

            const botCheck = document.querySelector('input[name="bot_check"]').value;
            if(botCheck) return;

            const btn = checkoutForm.querySelector('button[type="submit"]');
            btn.innerHTML = 'Sending...';
            btn.disabled = true;

            const formData = {
                type: 'Order',
                name: document.getElementById('checkout-name').value,
                lga: lga,
                address: document.getElementById('checkout-address').value,
                phone: document.getElementById('checkout-phone').value,
                order_details: cart,
                total_value: cartTotalEl.textContent,
                timestamp: new Date().toISOString()
            };

            try {
                const webhookUrl = 'https://tolu-toye-01.app.n8n.cloud/webhook/caroline-order';
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                });
                
                clearCart();
                checkoutForm.reset();
                showThankYouView();
            } catch(err) {
                alert("Network error. Please try again.");
            } finally {
                btn.innerHTML = 'Place Order';
                btn.disabled = false;
            }
        });
    }

    if(contactFormPage) {
        contactFormPage.addEventListener('submit', async (e) => {
            e.preventDefault();

            const botCheck = contactFormPage.querySelector('input[name="bot_check"]').value;
            if(botCheck) return; 

            const btn = document.getElementById('contact-submit-btn');
            const status = document.getElementById('contact-status');
            btn.innerText = 'Sending...';
            btn.disabled = true;

            const formData = {
                type: 'Contact',
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                message: document.getElementById('contact-message').value,
                timestamp: new Date().toISOString()
            };

            try {
                const webhookUrl = 'https://tolu-toye-01.app.n8n.cloud/webhook/caroline-order';
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                });

                status.innerHTML = '<p style="color:green">Message sent successfully!</p>';
                contactFormPage.reset();
            } catch(err) {
                status.innerHTML = '<p style="color:red">Error sending message.</p>';
            } finally {
                btn.innerText = 'Send Message';
                btn.disabled = false;
            }
        });
    }
});