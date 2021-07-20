-- Query to get logged in customer information before every request is processed
-- Colons before words indicate variables that will be provided by the backend

SELECT customer_id, name, customer_type, is_admin
FROM Customers
WHERE customer_id = :customer_id


-- Query to get logged in customer's cart information before every request is processed
-- Colons before words indicate variables that will be provided by the backend

SELECT Orders.order_id, SUM(Orders_products_relation.ordered_quantity) AS itemCount FROM Orders
INNER JOIN Orders_products_relation ON Orders_products_relation.order_id = Orders.order_id
WHERE Orders.customer_id = ? AND Orders.is_cart = true GROUP BY Orders.order_id;