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