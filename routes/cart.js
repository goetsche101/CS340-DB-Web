const express = require('express');
var mysql = require('../dbcon.js');

const router = express.Router();
module.exports = router;

router.get('/cart', function(req, res, next) {

  var context = req.context;

  // mysql.pool.query('SELECT * FROM Categories', function(err, rows, fields){

  //   if (err) {
  //     next(err);
  //     return;
  //   }

  //   context.categories = rows;
  //   res.render('categories', context);
  // });

  context.addresses = [
    {
      address_id: 1,
      address1: '123 Test Street',
      address2: 'Unit 3',
      city: 'Dallas',
      state: 'TX',
      zip: 76123
    },
    {
      address_id: 2,
      address1: '246 Other Street',
      address2: '',
      city: 'New York City',
      state: 'NY',
      zip: 11201
    }
  ];

  context.payment_methods = [
    {
      payment_method_id: 1,
      type: 'Credit Card',
      display_info: 'Credit Card ending in 1234'
    },
    {
      payment_method_id: 2,
      type: 'PayPal',
      display_info: 'PayPal: test@test.com'
    }
  ]

  context.cart = {
    order_id: 3,
    total_cost: '$400.00',
    address_id: null,
    selected_address_description: 'None. Please select or create an address below.',
    payment_method_id: null,
    selected_payment_method_description: 'None. Please select or create a payment method below.',
    products: [
      {
        product_id: 5,
        description: '21 Inch LCD Monitor',
        in_stock_qty: 5,
        price: '$150.00',
        ordered_quantity: 1
      },
      {
        product_id: 23,
        description: 'Acoustic Guitar',
        in_stock_qty: 300,
        price: '$250.00',
        ordered_quantity: 1
      }
    ]
  };

  res.render('cart', context);
});

router.post('/cart/add-product', function (req, res, next) {

  var context = req.context;

  const cartId = context.cartInfo.order_id;
  const productId = req.body.product_id;

  const query = 'SELECT * FROM Orders_products_relation WHERE order_id = ? AND product_id = ?';
  const values = [cartId, productId];

  mysql.pool.query(query, values, function (err, rows) {
    if (err) {
      next(err);
      return;
    }

    var updateQuery;
    var updateValues;

    // If this product is already in the cart increase the quantity
    if (rows && rows.length) {
      updateQuery = `
        UPDATE Orders_products_relation
        SET ordered_quantity = ?
        WHERE order_id = ? AND product_id = ?;
      `;
      updateValues = [rows[0].ordered_quantity + 1, cartId, productId];
    }
    // Otherwise add the product to the cart
    else {
      updateQuery = `
        INSERT INTO Orders_products_relation (order_id, product_id, ordered_quantity)
        VALUES (?, ?, ?);
      `;
      updateValues = [cartId, productId, 1];
    }

    mysql.pool.query(updateQuery, updateValues, function (err, rows) {

      if (err) {
        next(err);
        return;
      }

      res.redirect('/cart');
    });
  });
});


router.post('/cart/update-product-quantities', function (req, res, next) {

  res.redirect('/cart');
});

