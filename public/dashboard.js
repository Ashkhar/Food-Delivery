// Function to add a product to the cart
function addToCart(productId) {
    fetch(`/add-to-cart/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (response.ok) {
            alert('Product added to cart!');
        } else {
            alert('Failed to add product to cart.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while adding the product to the cart.');
    });
}
