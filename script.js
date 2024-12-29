// Global state
let products = [];
let users = [];
let cart = [];
let isAdminMode = false;

// Toggle between User and Admin Mode
document.getElementById('toggle-mode').addEventListener('click', () => {
    isAdminMode = !isAdminMode;
    document.body.classList.toggle('admin-mode', isAdminMode);
    document.getElementById('toggle-mode').textContent = isAdminMode ? 'Toggle to User Mode' : 'Toggle to Admin Mode';
    displayUsers(); // Show user management if in admin mode
    displayProducts(); // Update product display based on mode
});

// USER MANAGEMENT
// Fetch users from Fake Store API
async function fetchUsers() {
    try {
        const response = await fetch('https://fakestoreapi.com/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to load users. Please try again later.");
        return [];
    }
}

async function displayUsers() {
    users = await fetchUsers();
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.textContent = `${user.email} (${user.role || 'user'})`;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            deleteUser(user.id);
        });

        userItem.appendChild(removeButton);
        userList.appendChild(userItem);
    });
}

const deleteUser = async (userId) => {
    try {
        const response = await fetch(`https://fakestoreapi.com/users/${userId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        console.log('User deleted:', result);
        alert('User deleted successfully!');
        displayUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// PRODUCT SECTION

// Fetch products from Fake Store API
async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        alert("Failed to load products. Please try again later.");
        return [];
    }
}

async function displayProducts() {
    products = await fetchProducts();
    const productContainer = document.getElementById('products-container');
    const category = document.getElementById('category-filter').value;
    const sortOption = document.getElementById('sort-options').value;

    let filteredProducts = products.filter(product => category === 'all' || product.category.toLowerCase() === category);

    if (sortOption === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'name') {
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
    }

    productContainer.innerHTML = '';
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h2>${product.title}</h2>
            <p>${product.description.substring(0, 60)}...</p>
            <p><strong>$${product.price.toFixed(2)}</strong></p>
        `;

        if (isAdminMode) {
            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.addEventListener('click', () => {
                populateAdminForm(product);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete ${product.title}?`)) {
                    deleteProduct(product.id);
                }
            });

            productCard.appendChild(updateButton);
            productCard.appendChild(deleteButton);
        } else {
            const addToCartButton = document.createElement('button');
            addToCartButton.textContent = 'Add to Cart';
            addToCartButton.addEventListener('click', () => {
                addToCart(product.id);
            });
            productCard.appendChild(addToCartButton);
        }

        productContainer.appendChild(productCard);
    });
}

// Add Event Listener to the Add Product Button
document.getElementById('admin-product-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const productId = document.getElementById('product-id').value;
    const title = document.getElementById('product-title').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value.trim();
    const image = document.getElementById('product-image').value.trim();
    const description = document.getElementById('product-description').value.trim();

    const productData = { title, price, category, image, description };

    if (!productId) {
        await addProduct(productData);
    } else {
        await updateProduct(productId, productData);
    }

    document.getElementById('admin-product-form').reset();
    document.getElementById('update-product').style.display = 'none';
    document.getElementById('delete-product').style.display = 'none';
    displayProducts();
});

async function addProduct(productData) {
    try {
        const response = await fetch('https://fakestoreapi.com/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            throw new Error(`Failed to add product: ${response.statusText}`);
        }

        const newProduct = await response.json();
        console.log('Product added successfully:', newProduct);
        alert('Product added successfully!');
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
    }
}

async function updateProduct(productId, productData) {
    try {
        const response = await fetch(`https://fakestoreapi.com/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            throw new Error(`Failed to update product: ${response.statusText}`);
        }

        const updatedProduct = await response.json();
        console.log('Product updated successfully:', updatedProduct);
        alert('Product updated successfully!');
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product. Please try again.');
    }
}

async function deleteProduct(productId) {
    try {
        const response = await fetch(`https://fakestoreapi.com/products/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete product: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Product deleted:', result);
        alert('Product deleted successfully!');
        displayProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
    }
}


// CART SECTION

document.getElementById('cart-toggle').addEventListener('click', () => {
    document.getElementById('cart-container').classList.toggle('open');
});
// Add to Cart functionality
async function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Product not found.');
        return;
    }

    const existingProduct = cart.find(item => item.id === productId);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartDisplay();
}

function updateCartDisplay() {
    const cartContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('li');
        cartItem.innerHTML = `
            ${item.title} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)}
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartContainer.appendChild(cartItem);
        total += item.price * item.quantity;
    });

    totalPriceElement.innerText = `$${total.toFixed(2)}`;

    const checkoutButton = document.createElement('button');
    checkoutButton.innerText = 'Checkout';
    checkoutButton.addEventListener('click', checkoutCart);
    cartContainer.appendChild(checkoutButton);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}


// Checkout Functionality
async function checkoutCart() {
    if (cart.length === 0) {
        alert("Your cart is empty. Add items before checking out.");
        return;
    }

    try {
        const response = await fetch('https://fakestoreapi.com/carts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 1,
                date: new Date().toISOString(),
                products: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
            }),
        });

        if (!response.ok) {
            throw new Error('Checkout failed: ' + response.statusText);
        }

        const result = await response.json();
        console.log('Checkout successful:', result);
        alert('Order placed successfully!');

        cart = [];
        updateCartDisplay();
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('An error occurred while processing your order. Please try again.');
    }
}

// Initialize event listeners for filters
document.getElementById('category-filter').addEventListener('change', displayProducts);
document.getElementById('sort-options').addEventListener('change', displayProducts);

// Initialize by displaying products
displayProducts();
