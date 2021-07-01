CREATE TABLE `CUSTOMERS` (
  `customer_id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(255) NOT NULL,
  `customer_type` varchar(255) NOT NULL,
  `customer_name` varchar(45) NOT NULL,
  `phone` char(10) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT NULL,
  `email_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`customer_id`);

  CREATE TABLE `ADDRESS` (
    `address_id` int(11) NOT NULL AUTO_INCREMENT,
    `customer_id` int(11) NOT NULL,
    `address_1` varchar(255) NOT NULL,
    `address_2` varchar(255) DEFAULT NULL,
    `city` varchar(255) NOT NULL,
    `state` char(2) NOT NULL,
    `zip` int(5) NOT NULL,
    `zip4` int(4) DEFAULT NULL,
    PRIMARY KEY (`address_id`),
    KEY `customer_id` (`customer_id`),
    CONSTRAINT `address_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
