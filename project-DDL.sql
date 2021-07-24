-- phpMyAdmin SQL Dump
-- version 5.1.1-1.el7.remi
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 24, 2021 at 10:53 PM
-- Server version: 10.4.20-MariaDB-log
-- PHP Version: 7.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cs340_kruegead`
--

-- --------------------------------------------------------

--
-- Table structure for table `Addresses`
--

DROP TABLE IF EXISTS `Addresses`;
CREATE TABLE `Addresses` (
  `address_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `address1` varchar(255) NOT NULL,
  `address2` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` char(2) DEFAULT NULL,
  `zip` int(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Addresses`
--

INSERT INTO `Addresses` (`address_id`, `customer_id`, `address1`, `address2`, `city`, `state`, `zip`) VALUES
(1, 1, '123 Test Street', 'Unit 3', 'Dallas', 'TX', 76123),
(2, 1, '246 Other Street', '', 'New York City', 'NY', 11201),
(3, 1, '567 Some Rd', '2nd Floor', 'California', 'CA', 93208);

-- --------------------------------------------------------

--
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
CREATE TABLE `Categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Categories`
--

INSERT INTO `Categories` (`category_id`, `category_name`) VALUES
(1, 'Sports Equiptment'),
(2, 'Computer Parts'),
(3, 'Musical Instruments');

-- --------------------------------------------------------

--
-- Table structure for table `Customers`
--

DROP TABLE IF EXISTS `Customers`;
CREATE TABLE `Customers` (
  `customer_id` int(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `customer_type` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` char(10) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Customers`
--

INSERT INTO `Customers` (`customer_id`, `password`, `customer_type`, `name`, `phone`, `is_admin`) VALUES
(1, 'password', 'employee', 'Admin', '8888888888', 1),
(2, 'password', 'employee', 'Some One', '1234567890', 0),
(3, 'password', 'customer', 'Example Customer', '8888888888', 0);

-- --------------------------------------------------------

--
-- Table structure for table `Emails`
--

DROP TABLE IF EXISTS `Emails`;
CREATE TABLE `Emails` (
  `email_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Emails`
--

INSERT INTO `Emails` (`email_id`, `customer_id`, `email_address`, `is_primary`) VALUES
(1, 1, 'primary@email.com', 1),
(2, 1, 'secondary@email.com', 0),
(3, 1, 'other@test.org', 0);

-- --------------------------------------------------------

--
-- Table structure for table `Orders`
--

DROP TABLE IF EXISTS `Orders`;
CREATE TABLE `Orders` (
  `order_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `address_id` int(11) DEFAULT NULL,
  `payment_method_id` int(11) DEFAULT NULL,
  `is_cart` tinyint(1) DEFAULT 0,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `shipped_date` timestamp NULL DEFAULT NULL,
  `total_paid` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Orders`
--

INSERT INTO `Orders` (`order_id`, `customer_id`, `address_id`, `payment_method_id`, `is_cart`, `created_date`, `shipped_date`, `total_paid`) VALUES
(1, 1, 1, 1, 0, '2021-07-06 01:19:20', '2021-07-07 15:15:05', '400.00'),
(2, 1, 2, 1, 0, '2021-07-11 03:45:30', '2021-07-12 17:35:40', '500.00'),
(3, 1, NULL, NULL, 1, '2021-07-06 01:19:20', '2021-07-07 15:15:05', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Orders_products_relation`
--

DROP TABLE IF EXISTS `Orders_products_relation`;
CREATE TABLE `Orders_products_relation` (
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `ordered_quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Orders_products_relation`
--

INSERT INTO `Orders_products_relation` (`order_id`, `product_id`, `ordered_quantity`) VALUES
(1, 2, 1),
(1, 3, 1),
(2, 1, 1),
(3, 2, 1),
(3, 3, 2);

-- --------------------------------------------------------

--
-- Table structure for table `Payment_methods`
--

DROP TABLE IF EXISTS `Payment_methods`;
CREATE TABLE `Payment_methods` (
  `payment_method_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `type` int(11) DEFAULT NULL,
  `credit_card_number` varchar(19) DEFAULT NULL,
  `paypal_email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Payment_methods`
--

INSERT INTO `Payment_methods` (`payment_method_id`, `customer_id`, `type`, `credit_card_number`, `paypal_email`) VALUES
(1, 1, 2, NULL, 'primary@email.com'),
(2, 1, 1, '1234567891011123', NULL),
(3, 1, 1, '2468101214161820', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Products`
--

DROP TABLE IF EXISTS `Products`;
CREATE TABLE `Products` (
  `product_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `in_stock_qty` int(11) NOT NULL,
  `price` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Products`
--

INSERT INTO `Products` (`product_id`, `description`, `in_stock_qty`, `price`) VALUES
(1, '21 Speed Mountain Bike', 50, '500.00'),
(2, '21 Inch LCD Monitor', 5, '150.00'),
(3, 'Acoustic Guitar', 300, '250.00');

-- --------------------------------------------------------

--
-- Table structure for table `Products_categories_relation`
--

DROP TABLE IF EXISTS `Products_categories_relation`;
CREATE TABLE `Products_categories_relation` (
  `category_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Products_categories_relation`
--

INSERT INTO `Products_categories_relation` (`category_id`, `product_id`) VALUES
(1, 1),
(2, 2),
(3, 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Addresses`
--
ALTER TABLE `Addresses`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `Categories`
--
ALTER TABLE `Categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `Customers`
--
ALTER TABLE `Customers`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `Emails`
--
ALTER TABLE `Emails`
  ADD PRIMARY KEY (`email_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `Orders`
--
ALTER TABLE `Orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `address_id` (`address_id`),
  ADD KEY `payment_method_id` (`payment_method_id`);

--
-- Indexes for table `Orders_products_relation`
--
ALTER TABLE `Orders_products_relation`
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `Payment_methods`
--
ALTER TABLE `Payment_methods`
  ADD PRIMARY KEY (`payment_method_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `Products`
--
ALTER TABLE `Products`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `Products_categories_relation`
--
ALTER TABLE `Products_categories_relation`
  ADD KEY `category_id` (`category_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Addresses`
--
ALTER TABLE `Addresses`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Categories`
--
ALTER TABLE `Categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Customers`
--
ALTER TABLE `Customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Emails`
--
ALTER TABLE `Emails`
  MODIFY `email_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Orders`
--
ALTER TABLE `Orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Payment_methods`
--
ALTER TABLE `Payment_methods`
  MODIFY `payment_method_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Products`
--
ALTER TABLE `Products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Addresses`
--
ALTER TABLE `Addresses`
  ADD CONSTRAINT `Addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `Customers` (`customer_id`) ON DELETE CASCADE;

--
-- Constraints for table `Emails`
--
ALTER TABLE `Emails`
  ADD CONSTRAINT `Emails_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `Customers` (`customer_id`) ON DELETE CASCADE;

--
-- Constraints for table `Orders`
--
ALTER TABLE `Orders`
  ADD CONSTRAINT `Orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `Customers` (`customer_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Orders_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `Addresses` (`address_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `Orders_ibfk_3` FOREIGN KEY (`payment_method_id`) REFERENCES `Payment_methods` (`payment_method_id`) ON DELETE SET NULL;

--
-- Constraints for table `Orders_products_relation`
--
ALTER TABLE `Orders_products_relation`
  ADD CONSTRAINT `Orders_products_relation_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Orders_products_relation_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `Products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `Payment_methods`
--
ALTER TABLE `Payment_methods`
  ADD CONSTRAINT `Payment_methods_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `Customers` (`customer_id`) ON DELETE CASCADE;

--
-- Constraints for table `Products_categories_relation`
--
ALTER TABLE `Products_categories_relation`
  ADD CONSTRAINT `Products_categories_relation_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `Categories` (`category_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Products_categories_relation_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `Products` (`product_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
