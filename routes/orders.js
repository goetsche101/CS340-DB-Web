const express = require('express');
var mysql = require('../dbcon.js');

const router = express.Router();
module.exports = router;

router.get('/orders', function(req, res, next) {

  var context = req.context;

  const ordersQuery = `
    SELECT Orders.*, Addresses.*, Payment_methods.*,
      group_concat(
        Products.description, '<SPLIT>',
        Products.price, '<SPLIT>',
        Orders_products_relation.ordered_quantity
        SEPARATOR '<END>'
      ) AS products_string FROM Orders
    INNER JOIN Addresses ON Addresses.address_id = Orders.address_id
    INNER JOIN Payment_methods ON Payment_methods.payment_method_id = Orders.payment_method_id
    INNER JOIN Orders_products_relation ON Orders_products_relation.order_id = Orders.order_id
    INNER JOIN Products ON Orders_products_relation.product_id = Products.product_id
    WHERE Orders.is_cart = false AND Orders.customer_id = ?
    GROUP BY Orders.order_id
    ORDER BY Orders.created_date DESC;
  `;
  const ordersValues = [context.loggedInCustomer.customer_id];

  mysql.pool.query(ordersQuery, ordersValues, function (err, orders) {

    if (err) {
      next(err);
      return;
    }


    console.log(orders);
  });


  // Eventually get orders for customer where not order is not cart, sorted by created_date
  // Also get each order's products, addresses, payment methods
  // Do any formatting on attributes here
  context.orders = [
    {
      order_id: 3,
      created_date: 'July 8 2021',
      shipped_date: 'July 10 2021',
      total_paid: '$400.00',
      address: {
        address_id: 2,
        address1: '246 Other Street',
        address2: '',
        city: 'New York City',
        state: 'NY',
        zip: 11201
      },
      payment_method: {
        payment_method_id: 2,
        type: 'PayPal',
        display_info: 'PayPal: test@test.com'
      },
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
    },
    {
      order_id: 1,
      created_date: 'July 5 2021',
      shipped_date: 'Awaiting Shipment',
      total_paid: '$500.00',
      address: {
        address_id: 1,
        address1: '123 Test Street',
        address2: 'Unit 3',
        city: 'Dallas',
        state: 'TX',
        zip: 76123
      },
      payment_method: {
        payment_method_id: 1,
        type: 'Credit Card',
        display_info: 'Credit Card ending in 1234'
      },
      products: [
        {
          product_id: 1,
          description: '21 Speed Mountain Bike',
          in_stock_qty: 50,
          price: '$500.00',
          ordered_quantity: 1
        }
      ]
    }
  ];

  res.render('orders', context);
});

router.post('/categories/delete', function (req, res, next) {

  const query = 'DELETE FROM Categories WHERE category_id = ?';
  const values = [req.body.category_id];

  mysql.pool.query(query, values, function (err) {
    if (err) {
      next(err);
      return;
    }

    res.redirect('/categories');
  });
});

