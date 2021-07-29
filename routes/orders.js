const express = require('express');
var mysql = require('../dbcon.js');

const router = express.Router();
module.exports = router;

router.get('/orders', function(req, res, next) {

  var context = req.context;

  const ordersQuery = `
    SELECT Orders.*, Addresses.*, Payment_methods.*,
      group_concat(
        Orders_products_relation.ordered_quantity, '<SPLIT>',
        Products.description, '<SPLIT>',
        Products.price
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

    for (const order of orders) {
      const products = [];

      const productStrings = order.products_string.split('<END>');
      for (const productString of productStrings) {
        const productFields = productString.split('<SPLIT>');

        // If there were no products in this order somehow all of the items in productFields will be blank
        if (productFields[0].length) {
          products.push({
            ordered_quantity: productFields[0],
            description: productFields[1],
            price: '$' + (parseFloat(productFields[2]).toFixed(2))
          });
        }
      }

      order.products = products;
      order.total_paid = '$' + (parseFloat(order.total_paid).toFixed(2));
      if (!order.shipped_date) {
        order.shipped_date = 'Awaiting shipment';
      }

      if (order.address_id) {
        order.address = {
          address1: order.address1,
          address2: order.address2,
          city: order.city,
          state: order.state,
          zip: order.zip
        };
      }
      else {
        order.address = {
          address1: '',
          address2: '',
          city: '',
          state: '',
          zip: ''
        };
      }

      if (order.payment_method_id) {

        var type = '';
        var display_info = '';

        if (order.type === 1) {
          const ccNumber = order.credit_card_number;
          type = 'Credit Card';
          display_info = `Credit card ending in ${ccNumber.substr(ccNumber.length - 4)}`;
        }
        else {
          type = 'PayPal';
          display_info = `PayPal: ${order.paypal_email}`;
        }


        order.payment_method = {
          type: type,
          display_info: display_info
        };
      }
      else {
        order.payment_method = {
          type: '',
          display_info: ''
        };
      }
    }

    context.orders = orders;

    res.render('orders', context);
  });
});


router.post('/orders/create', function (req, res, next) {

  var context = req.context;

  if (!context.cartInfo.itemCount) {
    res.redirect('/cart');
    return;
  }

  const cartProductsQuery = `
    SELECT Products.*, Orders_products_relation.ordered_quantity FROM Products
    INNER JOIN Orders_products_relation
      ON Orders_products_relation.product_id = Products.product_id
    WHERE Orders_products_relation.order_id = ?;
  `;
  const cartProductsValues = [context.cartInfo.order_id];

  mysql.pool.query(cartProductsQuery, cartProductsValues, function (err, products) {
    if (err) {
      next(err);
      return;
    }

    if (!products.length) {
      res.redirect('/cart');
      return;
    }

    var cartTotalCost = 0.0;
    for (const product of products) {
      cartTotalCost += parseFloat(product.price) * product.ordered_quantity;
    }

    // Convert the cart into an order and create a new cart
    const orderQuery = `
      UPDATE Orders
      SET is_cart = false, created_date = ?, total_paid = ?
      WHERE order_id = ? AND customer_id = ?;

      INSERT INTO Orders (customer_id, address_id, payment_method_id, is_cart, created_date, shipped_date, total_paid)
      VALUES (?, NULL, NULL, true, ?, NULL, NULL);
    `;
    const orderValues = [
      new Date(),
      cartTotalCost,
      context.cartInfo.order_id,
      context.loggedInCustomer.customer_id,
      context.loggedInCustomer.customer_id,
      new Date()
    ];

    mysql.pool.query(orderQuery, orderValues, function (err) {
      if (err) {
        next(err);
        return;
      }

      res.redirect('/orders');
    });
    
  });
});


router.post('/orders/delete', function (req, res, next) {

  const query = 'DELETE FROM Orders WHERE is_cart = false AND order_id = ?';
  const values = [req.body.order_id];

  mysql.pool.query(query, values, function (err) {
    if (err) {
      next(err);
      return;
    }

    res.redirect('/orders');
  });
});

