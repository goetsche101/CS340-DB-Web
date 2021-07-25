-- Query to get logged in customer information before every request is processed
-- Colons before words indicate variables that will be provided by the backend

SELECT customer_id, name, customer_type, is_admin
FROM Customers
WHERE customer_id = :customer_id


-- Query to get logged in customer's cart information before every request is processed
-- Colons before words indicate variables that will be provided by the backend

SELECT Orders.order_id, SUM(Orders_products_relation.ordered_quantity) AS itemCount FROM Orders
INNER JOIN Orders_products_relation ON Orders_products_relation.order_id = Orders.order_id
WHERE Orders.customer_id = :customer_id AND Orders.is_cart = true GROUP BY Orders.order_id;




-- Query to get logged in customer's saved addresses
-- Colons before words indicate variables that will be provided by the backend

SELECT * FROM Addresses WHERE customer_id = :customer_id;


-- Query to insert new addresses
-- Colons before words indicate variables that will be provided by the backend

INSERT INTO Addresses ('customer_id', 'address1', 'address2', 'city', 'state', 'zip')
VALUES (:customer_id, :address1, :address2, :city, :state, :zip);


-- Query to delete addresses
-- Colons before words indicate variables that will be provided by the backend

DELETE FROM Addresses WHERE address_id = :address_id;



-- Query to get the user's cart
-- Colons before words indicate variables that will be provided by the backend

SELECT * from Orders WHERE order_id = :order_id;


-- Query to get the cart's products
-- Colons before words indicate variables that will be provided by the backend

SELECT Products.*, Orders_products_relation.ordered_quantity FROM Products
INNER JOIN Orders_products_relation
  ON Orders_products_relation.product_id = Products.product_id
WHERE Orders_products_relation.order_id = :order_id;


-- Query to get check if a cart contains a specific product
-- Colons before words indicate variables that will be provided by the backend

SELECT * FROM Orders_products_relation WHERE order_id = :order_id AND product_id = :product_id;


-- Query to update the quantity of a specific product in a cart
-- Colons before words indicate variables that will be provided by the backend

UPDATE Orders_products_relation
SET ordered_quantity = :ordered_quantity
WHERE order_id = :order_id AND product_id = :product_id;


-- Query to insert a product into the users cart
-- Colons before words indicate variables that will be provided by the backend

INSERT INTO Orders_products_relation (order_id, product_id, ordered_quantity)
VALUES (:order_id, :product_id, :ordered_quantity);


-- Query to convert a cart into an order
-- Colons before words indicate variables that will be provided by the backend

UPDATE Orders
SET is_cart = false, address_id = :address_id, payment_method_id = :payment_method_id,
  created_date = :created_date, total_paid = :total_paid
WHERE order_id = :order_id AND customer_id = :customer_id;


-- create a new cart
-- Colons before words indicate variables that will be provided by the backend

INSERT INTO Orders (customer_id, address_id, payment_method_id, is_cart, created_date, shipped_date, total_paid)
VALUES (:customer_id, NULL, NULL, true, :created_date, NULL, NULL);



-- Get all categories
-- Colons before words indicate variables that will be provided by the backend

SELECT * FROM Categories;


-- Query to insert a new category
-- Colons before words indicate variables that will be provided by the backend

INSERT INTO Categories (category_name) VALUES (:category_name);


-- Query to delete a category
-- Colons before words indicate variables that will be provided by the backend

DELETE FROM Categories WHERE category_id = :category_id;



-- Query to select all customers
-- Colons before words indicate variables that will be provided by the backend

SELECT * FROM Customers;


-- Query to insert a new customer
-- Colons before words indicate variables that will be provided by the backend

INSERT INTO Customers ('password', 'customer_type', 'name', 'phone', 'is_admin')
VALUES (:password, :customer_type, :name, :name, :phone, :is_admin);


-- Query to create a cart for a new customer
-- Colons before words indicate variables that will be provided by the backend

INSERT INTO Orders (customer_id, address_id, payment_method_id, is_cart, created_date, shipped_date, total_paid)
VALUES (:customer_id, NULL, NULL, true, :created_date, NULL, NULL);


-- Query to delete a customer
-- Colons before words indicate variables that will be provided by the backend

DELETE FROM Customers WHERE customer_id = :customer_id;


-- Query to update a customer
-- Colons before words indicate variables that will be provided by the backend

UPDATE Customers SET password = :password, name = :name, phone = :phone, is_admin = :is_admin
WHERE customer_id = :customer_id;




-- Query to select a customer's emails
-- Colons before words indicate variables that will be provided by the backend

SELECT * FROM Emails WHERE customer_id = :customer_id;


-- Query to insert a new email
-- Colons before words indicate variables that will be provided by the backend

INSERT INTO Emails ('customer_id' ,'email_address', 'is_primary')
VALUES (:customer_id, :email_address, :is_primary);


-- Query to delete an email
-- Colons before words indicate variables that will be provided by the backend

DELETE FROM Emails WHERE email_id = :email_id;



-- Query to get the logged in user's cart, its products, and the user's addresses and emails.
-- The products are retrieved as a single string with each field seperated by '<SPLIT>'
-- and each product seperated by '<END>'.
-- Colons before words indicate variables that will be provided by the backend

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
WHERE Orders.is_cart = false AND Orders.customer_id = :customer_id
GROUP BY Orders.order_id
ORDER BY Orders.created_date DESC;


-- Query to delete an order
-- Colons before words indicate variables that will be provided by the backend

DELETE FROM Orders WHERE is_cart = false AND order_id = ?




-- Query to get a customer's payment methods
-- Colons before words indicate variables that will be provided by the backend

SELECT * FROM Payment_methods WHERE customer_id = :customer_id;


-- Query to insert a new payment method
-- Colons before words indicate variables that will be provided by the backend

INSERT INTO Payment_methods ('customer_id', 'type', 'credit_card_number', 'paypal_email')
VALUES (:customer_id, :type, :credit_card_number, :paypal_email);


-- Query to delete a payment method.
-- Colons before words indicate variables that will be provided by the backend

DELETE FROM Payment_methods WHERE payment_method_id = :payment_method_id;




-- Query to select all products
-- Colons before words indicate variables that will be provided by the backend


SELECT * FROM Products;


-- Query to search for a specific product
-- Colons before words indicate variables that will be provided by the backend

SELECT * FROM Products WHERE lower(description) LIKE '%:search_term%';


-- Query to search for products in a specific category
-- Colons before words indicate variables that will be provided by the backend

SELECT * FROM Products
LEFT JOIN Products_categories_relation
ON Products_categories_relation.product_id = Products.product_id
WHERE Products_categories_relation.category_id = :category_id;


-- Query to insert a new product
-- Colons before words indicate variables that will be provided by the backend

INSERT INTO Products (description, in_stock_qty, price)
VALUES (:description, :in_stock_qty, :price);

--Query to add categories to Products
INSERT INTO Products_categories_relation(category_id, product_id)
VALUES(:category_id, :product_id)
