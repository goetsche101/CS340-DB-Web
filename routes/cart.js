const express = require('express');
var mysql = require('../dbcon.js');

const router = express.Router();
module.exports = router;

router.get('/cart', function(req, res, next) {

  var context = req.context;
  const loggedInCustomerId = context.loggedInCustomer.customer_id;
  const cartId = context.cartInfo.order_id;

  mysql.pool.query(
    'SELECT * FROM Addresses WHERE customer_id = ?',
    [loggedInCustomerId],
    function (err, addresses) {

    if (err) {
      next(err);
      return;
    }

    context.addresses = addresses;

    mysql.pool.query(
      'SELECT * FROM Payment_methods WHERE customer_id = ?',
      [loggedInCustomerId],
      function (err, paymentMethods) {

      if (err) {
        next(err);
        return;
      }

      context.payment_methods = paymentMethods.map(function (paymentMethod) {

        const output = { payment_method_id: paymentMethod.payment_method_id };

        if (paymentMethod.type === 1) {
          const ccNumber = paymentMethod.credit_card_number;
          output.type = 'Credit Card';
          output.display_info = `Credit card ending in ${ccNumber.substr(ccNumber.length - 4)}`;
        }
        else {
          output.type = 'PayPal';
          output.display_info = `PayPal: ${paymentMethod.paypal_email}`;
        }

        return output;
      });


      const productsQuery = `
        SELECT Products.*, Orders_products_relation.ordered_quantity FROM Products
        INNER JOIN Orders_products_relation
          ON Orders_products_relation.product_id = Products.product_id
        WHERE Orders_products_relation.order_id = ?;
      `;
      const productsValues = [cartId];

      mysql.pool.query(productsQuery, productsValues, function (err, products) {
        if (err) {
          next(err);
          return;
        }

        var cartTotalCost = 0.0;
        for (const product of products) {
          cartTotalCost += parseFloat(product.price) * product.ordered_quantity;
          product.price = '$' + product.price;
        }

        mysql.pool.query('SELECT * from Orders WHERE order_id = ?', [cartId], function (err, cart) {
          if (err) {
            next(err);
            return;
          }

          cart = cart[0];

          cart.products = products;
          cart.total_cost = `$${cartTotalCost.toFixed(2)}`;

          if (cart.address_id) {
            cart.selected_address_description = context.addresses.find((a) => a.address_id === cart.address_id).address1;
          }
          else {
            cart.selected_address_description = 'None. Please select or create an address below.';
          }
          
          if (cart.payment_method_id) {
            cart.selected_payment_method_description =
              context.payment_methods.find((a) => a.payment_method_id === cart.payment_method_id).display_info;
          }
          else {
            cart.selected_payment_method_description = 'None. Please select or create a payment method below.';
          }


          context.cart = cart;

          context.is_possible_to_order = (
            Boolean(cart.address_id) &&
            Boolean(cart.payment_method_id) &&
            Boolean(context.cart.products.length)
          );
    
          res.render('cart', context);
        });
      });
    });
  });
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

  const orderId = req.body.order_id;
  let updateQuery = '';

  // Loop through all the entries in the request body.  If the entry key starts with 'ordered_quantity_'
  // the number at the end of the key will be a product id and the value will be the new quantity
  for (const keyVal of Object.entries(req.body)) {
    const key = keyVal[0];
    const value = keyVal[1];

    if (!key.startsWith('ordered_quantity_')) {
      continue;
    }

    const productId = key.replace('ordered_quantity_', '');
    const newQuantity = value;
    if (newQuantity === '0') {
      updateQuery += `
      DELETE FROM Orders_products_relation
      WHERE order_id = ${orderId} AND product_id = ${productId};

    `;
    }
    else {
      updateQuery += `
        UPDATE Orders_products_relation
        SET ordered_quantity = ${newQuantity}
        WHERE order_id = ${orderId} AND product_id = ${productId};

      `;
    }
  }

  mysql.pool.query(updateQuery, function (err, rows) {

    if (err) {
      next(err);
      return;
    }

    res.redirect('/cart');
  });
});


router.post('/cart/remove_product/:product_id', function (req, res, next) {

  var context = req.context;
  const orderId = req.body.order_id;

  const updateQuery = `
    DELETE FROM Orders_products_relation
    WHERE order_id = ${orderId} AND product_id = ${req.params.product_id};
  `;

  mysql.pool.query(updateQuery, function (err, rows) {

    if (err) {
      next(err);
      return;
    }

    res.redirect('/cart');
  });
});


router.post('/cart/set-address', function (req, res, next) {

  var context = req.context;
  const orderId = req.body.order_id;
  const addressId = isNaN(parseInt(req.body.address_id)) ? null : req.body.address_id;

  if (!orderId) {
    res.redirect('/cart');
    return;
  }

  const updateQuery = `
    UPDATE Orders
    SET address_id = ${addressId}
    WHERE order_id = ${orderId} AND is_cart = true;
  `;

  mysql.pool.query(updateQuery, function (err, rows) {

    if (err) {
      next(err);
      return;
    }

    res.redirect('/cart');
  });
});


router.post('/cart/set-payment-method', function (req, res, next) {

  var context = req.context;
  const orderId = req.body.order_id;
  const paymentMethodId = isNaN(parseInt(req.body.payment_method_id)) ? null : req.body.payment_method_id;

  if (!orderId) {
    res.redirect('/cart');
    return;
  }

  const updateQuery = `
    UPDATE Orders
    SET payment_method_id = ${paymentMethodId}
    WHERE order_id = ${orderId} AND is_cart = true;
  `;

  mysql.pool.query(updateQuery, function (err, rows) {

    if (err) {
      next(err);
      return;
    }

    res.redirect('/cart');
  });
});

