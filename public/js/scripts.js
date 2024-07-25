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
                window.allProducts = products; 
                displayResults(products);
                populateCategories(products);
            }
        });
    }

    function populateCategories(products) {
        const categoryFilter = $('#category-filter');
        const categories = new Set();
        products.forEach(product => categories.add(product.category));

        categoryFilter.empty();
        categoryFilter.append('<option value="">All Categories</option>');
        categories.forEach(category => {
            categoryFilter.append(`<option value="${category}">${category}</option>`);
        });
    }

    $('#filter-button').on('click', function() {
        const searchTerm = $('#search-bar').val().toLowerCase();
        const selectedCategory = $('#category-filter').val();
        const minPrice = parseFloat($('#min-price').val()) || 0;
        const maxPrice = parseFloat($('#max-price').val()) || Number.MAX_VALUE;
        const minQuantity = parseFloat($('#min-quantity').val()) || 0;
        const maxQuantity = parseFloat($('#max-quantity').val()) || Number.MAX_VALUE;
        const minReorderLevel = parseFloat($('#min-reorder-level').val()) || 0;
        const maxReorderLevel = parseFloat($('#max-reorder-level').val()) || Number.MAX_VALUE;

        const filteredProducts = window.allProducts.filter(product => {
            const matchesSearchTerm = product.productName.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
            const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
            const matchesQuantity = product.quantity >= minQuantity && product.quantity <= maxQuantity;
            const matchesReorderLevel = product.reorderLevel >= minReorderLevel && product.reorderLevel <= maxReorderLevel;

            return matchesSearchTerm && matchesCategory && matchesPrice && matchesQuantity && matchesReorderLevel;
        });

        displayResults(filteredProducts);
    });

    $('#toggle-advanced-filters').on('click', function() {
        $('#advanced-filters').toggleClass('hidden');
    });

    function displayResults(products) {
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

    let currentSort = {
        column: null,
        order: 'asc'
    };

    $('.sortable').on('click', function() {
        const column = $(this).data('sort');
        let order = 'asc';
        if (currentSort.column === column && currentSort.order === 'asc') {
            order = 'desc';
        }

        currentSort = { column, order };
        const sortedProducts = [...window.allProducts].sort((a, b) => {
            if (a[column] > b[column]) return order === 'asc' ? 1 : -1;
            if (a[column] < b[column]) return order === 'asc' ? -1 : 1;
            return 0;
        });

        displayResults(sortedProducts);
    });
});
