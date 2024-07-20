$(document).ready(function() {
    fetchProducts();

    $('#productForm').on('submit', function(e) {
        e.preventDefault();
        const productData = {
            productName: $('#productName').val(),
            description: $('#description').val(),
            price: $('#price').val(),
            category: $('#category').val(),
            quantity: $('#quantity').val(),
            reorderLevel: $('#reorderLevel').val()
        };

        $.ajax({
            url: '/api/products',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(productData),
            success: function(response) {
                $('#productForm')[0].reset();
                fetchProducts();
            }
        });
    });

    function fetchProducts() {
        $.ajax({
            url: '/api/products',
            type: 'GET',
            success: function(products) {
                let productRows = '';
                products.forEach(product => {
                    productRows += `
                        <tr>
                            <td>${product.productID}</td>
                            <td>${product.productName}</td>
                            <td>${product.description}</td>
                            <td>${product.price}</td>
                            <td>${product.category}</td>
                            <td>${product.quantity}</td>
                            <td>${product.reorderLevel}</td>
                        </tr>
                    `;
                });
                $('#productList').html(productRows);
            }
        });
    }
});
