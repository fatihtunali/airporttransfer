
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `agencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agencies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `legal_name` varchar(255) DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `billing_email` varchar(255) DEFAULT NULL,
  `vat_number` varchar(50) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text,
  `logo_url` varchar(500) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT '10.00',
  `markup_rate` decimal(5,2) DEFAULT '0.00',
  `credit_limit` decimal(10,2) DEFAULT '0.00',
  `credit_used` decimal(10,2) DEFAULT '0.00',
  `default_currency` varchar(3) DEFAULT 'EUR',
  `payment_terms` int DEFAULT '30',
  `is_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `api_key` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_key` (`api_key`),
  KEY `idx_api_key` (`api_key`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `agency_api_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agency_api_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `agency_id` bigint NOT NULL,
  `endpoint` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `method` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_body` json DEFAULT NULL,
  `response_status` int DEFAULT NULL,
  `response_time_ms` int DEFAULT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_agency_date` (`agency_id`,`created_at`),
  KEY `idx_endpoint` (`endpoint`),
  CONSTRAINT `agency_api_logs_ibfk_1` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `agency_credit_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agency_credit_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `agency_id` bigint NOT NULL,
  `type` enum('CREDIT_ADD','CREDIT_USE','REFUND','ADJUSTMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `balance_after` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EUR',
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  `invoice_id` bigint DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_agency` (`agency_id`),
  KEY `idx_type` (`type`),
  CONSTRAINT `agency_credit_transactions_ibfk_1` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `agency_credit_transactions_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `agency_credit_transactions_ibfk_3` FOREIGN KEY (`invoice_id`) REFERENCES `agency_invoices` (`id`),
  CONSTRAINT `agency_credit_transactions_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `agency_invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agency_invoice_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint NOT NULL,
  `booking_id` bigint NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booking_date` date DEFAULT NULL,
  `route_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gross_amount` decimal(10,2) NOT NULL,
  `commission_rate` decimal(5,2) NOT NULL,
  `commission_amount` decimal(10,2) NOT NULL,
  `net_amount` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `agency_invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `agency_invoices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `agency_invoice_items_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `agency_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agency_invoices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `agency_id` bigint NOT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `commission_rate` decimal(5,2) NOT NULL,
  `commission_amount` decimal(10,2) NOT NULL,
  `tax_rate` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EUR',
  `status` enum('DRAFT','SENT','PAID','OVERDUE','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `due_date` date NOT NULL,
  `paid_at` datetime DEFAULT NULL,
  `booking_count` int DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `idx_agency` (`agency_id`),
  KEY `idx_status` (`status`),
  KEY `idx_due_date` (`due_date`),
  CONSTRAINT `agency_invoices_ibfk_1` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `agency_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agency_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `agency_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `role` enum('OWNER','MANAGER','BOOKER') NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agency_user` (`agency_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `agency_users_ibfk_1` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `agency_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `agency_whitelabel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agency_whitelabel` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `agency_id` bigint NOT NULL,
  `custom_domain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subdomain` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `favicon_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#0EA5E9',
  `secondary_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#64748B',
  `accent_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#F59E0B',
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tagline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `footer_text` text COLLATE utf8mb4_unicode_ci,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `show_powered_by` tinyint(1) DEFAULT '1',
  `show_reviews` tinyint(1) DEFAULT '1',
  `show_suppliers` tinyint(1) DEFAULT '0',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `google_analytics` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_pixel` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agency_id` (`agency_id`),
  CONSTRAINT `agency_whitelabel_ibfk_1` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `agency_widgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agency_widgets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `agency_id` bigint NOT NULL,
  `widget_key` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `widget_type` enum('SEARCH_FORM','FULL_BOOKING','QUOTE_ONLY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SEARCH_FORM',
  `allowed_domains` text COLLATE utf8mb4_unicode_ci,
  `theme` enum('LIGHT','DARK','AUTO') COLLATE utf8mb4_unicode_ci DEFAULT 'LIGHT',
  `border_radius` int DEFAULT '8',
  `show_logo` tinyint(1) DEFAULT '1',
  `impressions` int DEFAULT '0',
  `conversions` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `widget_key` (`widget_key`),
  KEY `agency_id` (`agency_id`),
  CONSTRAINT `agency_widgets_ibfk_1` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `airports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_local` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `country_code` varchar(3) DEFAULT NULL,
  `timezone` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `terminals` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_country` (`country`),
  KEY `idx_city` (`city`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=260 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `booking_extras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_extras` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `extra_id` bigint DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `extra_id` (`extra_id`),
  CONSTRAINT `booking_extras_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `booking_extras_ibfk_2` FOREIGN KEY (`extra_id`) REFERENCES `extras` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `booking_passengers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_passengers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_lead` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `booking_passengers_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `public_code` varchar(20) NOT NULL,
  `customer_id` bigint DEFAULT NULL,
  `supplier_id` bigint DEFAULT NULL,
  `channel` enum('B2C','B2B','AGENCY_API','WIDGET') NOT NULL DEFAULT 'B2C',
  `agency_id` bigint DEFAULT NULL,
  `agency_ref` varchar(100) DEFAULT NULL,
  `airport_id` bigint NOT NULL,
  `zone_id` bigint NOT NULL,
  `direction` enum('FROM_AIRPORT','TO_AIRPORT') NOT NULL,
  `pickup_address` text,
  `dropoff_address` text,
  `flight_number` varchar(50) DEFAULT NULL,
  `flight_date` date DEFAULT NULL,
  `flight_time` time DEFAULT NULL,
  `pickup_datetime` datetime NOT NULL,
  `original_pickup_datetime` datetime DEFAULT NULL,
  `pickup_adjusted_reason` varchar(255) DEFAULT NULL,
  `pickup_adjusted_at` datetime DEFAULT NULL,
  `pax_adults` int NOT NULL DEFAULT '1',
  `pax_children` int DEFAULT '0',
  `pax_infants` int DEFAULT '0',
  `luggage_count` int DEFAULT '0',
  `vehicle_type` enum('SEDAN','VAN','MINIBUS','BUS','VIP') NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'EUR',
  `base_price` decimal(10,2) NOT NULL,
  `extras_price` decimal(10,2) DEFAULT '0.00',
  `adjustments` decimal(10,2) DEFAULT '0.00',
  `total_price` decimal(10,2) NOT NULL,
  `commission` decimal(10,2) DEFAULT '0.00',
  `supplier_payout` decimal(10,2) DEFAULT '0.00',
  `status` enum('PENDING','AWAITING_PAYMENT','CONFIRMED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `payment_status` enum('UNPAID','PARTIALLY_PAID','PAID','REFUNDED') DEFAULT 'UNPAID',
  `customer_notes` text,
  `internal_notes` text,
  `confirmed_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `cancel_reason` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `public_code` (`public_code`),
  KEY `airport_id` (`airport_id`),
  KEY `zone_id` (`zone_id`),
  KEY `idx_public_code` (`public_code`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_status` (`status`),
  KEY `idx_pickup_date` (`pickup_datetime`),
  KEY `idx_channel` (`channel`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`airport_id`) REFERENCES `airports` (`id`),
  CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cancellation_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cancellation_policies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `policy_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `policy_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `hours_before` int NOT NULL,
  `refund_percent` int NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `policy_code` (`policy_code`),
  KEY `idx_policy_code` (`policy_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `dispatch_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispatch_actions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dispatcher_id` bigint NOT NULL,
  `action_type` enum('ASSIGN_DRIVER','REASSIGN_DRIVER','CANCEL_RIDE','ADJUST_PICKUP_TIME','CONTACT_CUSTOMER','CONTACT_DRIVER','RESOLVE_ISSUE','ESCALATE_ISSUE','ADD_NOTE','OVERRIDE_SYSTEM','MANUAL_NOTIFICATION') COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` bigint DEFAULT NULL,
  `ride_id` bigint DEFAULT NULL,
  `issue_id` bigint DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dispatcher` (`dispatcher_id`),
  KEY `idx_booking` (`booking_id`),
  KEY `idx_action` (`action_type`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `dispatch_actions_ibfk_1` FOREIGN KEY (`dispatcher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `dispatch_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispatch_issues` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint DEFAULT NULL,
  `ride_id` bigint DEFAULT NULL,
  `driver_id` bigint DEFAULT NULL,
  `supplier_id` bigint DEFAULT NULL,
  `issue_type` enum('NO_SHOW_CUSTOMER','NO_SHOW_DRIVER','DRIVER_LATE','VEHICLE_BREAKDOWN','ACCIDENT','CUSTOMER_COMPLAINT','DRIVER_COMPLAINT','PAYMENT_ISSUE','FLIGHT_ISSUE','ADDRESS_ISSUE','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','ESCALATED','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `resolution` text COLLATE utf8mb4_unicode_ci,
  `resolved_by` bigint DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `reported_by` enum('CUSTOMER','DRIVER','DISPATCHER','SYSTEM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reporter_id` bigint DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_booking` (`booking_id`),
  KEY `idx_ride` (`ride_id`),
  KEY `idx_type` (`issue_type`),
  KEY `idx_severity` (`severity`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `dispatcher_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispatcher_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `notify_new_issues` tinyint(1) DEFAULT '1',
  `notify_escalations` tinyint(1) DEFAULT '1',
  `notify_flight_delays` tinyint(1) DEFAULT '1',
  `notify_driver_offline` tinyint(1) DEFAULT '1',
  `auto_assign_region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_concurrent_issues` int DEFAULT '10',
  `is_on_shift` tinyint(1) DEFAULT '0',
  `shift_start` time DEFAULT NULL,
  `shift_end` time DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `dispatcher_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `driver_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `driver_id` bigint NOT NULL,
  `doc_type` enum('ID_CARD','LICENSE','PHOTO','OTHER') NOT NULL,
  `doc_name` varchar(255) DEFAULT NULL,
  `file_url` varchar(500) NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `driver_documents_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `driver_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_locations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `driver_id` bigint NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `accuracy` decimal(6,2) DEFAULT NULL,
  `heading` decimal(5,2) DEFAULT NULL,
  `speed` decimal(6,2) DEFAULT NULL,
  `status` enum('ONLINE','OFFLINE','ON_TRIP','BREAK') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OFFLINE',
  `battery_level` tinyint DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_driver` (`driver_id`),
  KEY `idx_status` (`status`),
  KEY `idx_updated` (`updated_at`),
  CONSTRAINT `driver_locations_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `license_expiry` date DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `languages` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `rating_avg` decimal(3,2) DEFAULT '0.00',
  `rating_count` int DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `drivers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `email_auto_replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_auto_replies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sender_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `replied_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sender` (`sender_email`),
  KEY `idx_sender` (`sender_email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `extras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `extras` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_key` varchar(50) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'EUR',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `extras_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `flight_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight_tracking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `flight_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flight_date` date NOT NULL,
  `scheduled_departure` datetime DEFAULT NULL,
  `scheduled_arrival` datetime DEFAULT NULL,
  `estimated_arrival` datetime DEFAULT NULL,
  `actual_arrival` datetime DEFAULT NULL,
  `status` enum('SCHEDULED','DEPARTED','EN_ROUTE','LANDED','ARRIVED_GATE','CANCELLED','DIVERTED','DELAYED','UNKNOWN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SCHEDULED',
  `delay_minutes` int DEFAULT '0',
  `delay_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departure_airport` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_airport` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_terminal` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_gate` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `baggage_claim` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_checked` datetime DEFAULT NULL,
  `raw_data` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_booking` (`booking_id`),
  KEY `idx_flight` (`flight_number`,`flight_date`),
  KEY `idx_status` (`status`),
  KEY `idx_arrival` (`estimated_arrival`),
  CONSTRAINT `flight_tracking_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `ride_id` bigint DEFAULT NULL,
  `sender_type` enum('CUSTOMER','DRIVER','DISPATCHER','SYSTEM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` bigint DEFAULT NULL,
  `sender_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_type` enum('TEXT','IMAGE','LOCATION','SYSTEM') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TEXT',
  `attachment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_lat` decimal(10,7) DEFAULT NULL,
  `location_lng` decimal(10,7) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_booking` (`booking_id`),
  KEY `idx_ride` (`ride_id`),
  KEY `idx_sender` (`sender_type`,`sender_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient_type` enum('CUSTOMER','DRIVER','SUPPLIER','DISPATCHER','AGENCY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` bigint DEFAULT NULL,
  `recipient_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('BOOKING_CONFIRMED','DRIVER_ASSIGNED','DRIVER_EN_ROUTE','DRIVER_ARRIVED','TRIP_STARTED','TRIP_COMPLETED','FLIGHT_DELAYED','PICKUP_TIME_CHANGED','BOOKING_CANCELLED','REVIEW_REQUEST','PAYMENT_RECEIVED','PAYOUT_SENT','DOCUMENT_EXPIRING','GENERAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` bigint DEFAULT NULL,
  `ride_id` bigint DEFAULT NULL,
  `channel` enum('EMAIL','SMS','PUSH','WHATSAPP','IN_APP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','SENT','DELIVERED','FAILED','READ') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `sent_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipient` (`recipient_type`,`recipient_id`),
  KEY `idx_booking` (`booking_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `payment_method` enum('CARD','BANK_TRANSFER','CASH','WALLET') NOT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `provider_txid` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `refund_reason` text,
  `metadata` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_booking` (`booking_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `customer_id` bigint NOT NULL,
  `supplier_id` bigint NOT NULL,
  `driver_id` bigint DEFAULT NULL,
  `rating_overall` int NOT NULL,
  `rating_punctuality` int DEFAULT NULL,
  `rating_vehicle` int DEFAULT NULL,
  `rating_driver` int DEFAULT NULL,
  `review_text` text,
  `is_published` tinyint(1) DEFAULT '1',
  `supplier_response` text,
  `response_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `customer_id` (`customer_id`),
  KEY `driver_id` (`driver_id`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_rating` (`rating_overall`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `ride_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ride_tracking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ride_id` bigint NOT NULL,
  `event_type` enum('DRIVER_ASSIGNED','DRIVER_EN_ROUTE','DRIVER_ARRIVED','PASSENGER_PICKED_UP','IN_TRANSIT','APPROACHING_DESTINATION','ARRIVED_DESTINATION','COMPLETED','CANCELLED','DELAY_REPORTED','ISSUE_REPORTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `eta_minutes` int DEFAULT NULL,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `reported_by` enum('SYSTEM','DRIVER','DISPATCHER') COLLATE utf8mb4_unicode_ci DEFAULT 'SYSTEM',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ride` (`ride_id`),
  KEY `idx_event` (`event_type`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `ride_tracking_ibfk_1` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `rides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rides` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `supplier_id` bigint NOT NULL,
  `vehicle_id` bigint DEFAULT NULL,
  `driver_id` bigint DEFAULT NULL,
  `driver_eta_minutes` int DEFAULT NULL,
  `driver_distance_km` decimal(8,2) DEFAULT NULL,
  `status` enum('PENDING_ASSIGN','ASSIGNED','ON_WAY','AT_PICKUP','IN_RIDE','FINISHED','NO_SHOW','CANCELLED') NOT NULL DEFAULT 'PENDING_ASSIGN',
  `driver_arrived_at` datetime DEFAULT NULL,
  `passenger_picked_at` datetime DEFAULT NULL,
  `pickup_lat` decimal(10,7) DEFAULT NULL,
  `pickup_lng` decimal(10,7) DEFAULT NULL,
  `dropoff_lat` decimal(10,7) DEFAULT NULL,
  `dropoff_lng` decimal(10,7) DEFAULT NULL,
  `current_lat` decimal(10,7) DEFAULT NULL,
  `current_lng` decimal(10,7) DEFAULT NULL,
  `assigned_at` datetime DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `arrived_at` datetime DEFAULT NULL,
  `picked_up_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `driver_note` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `driver_id` (`driver_id`),
  KEY `idx_booking` (`booking_id`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `rides_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rides_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `rides_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `rides_ibfk_4` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `airport_id` bigint NOT NULL,
  `zone_id` bigint NOT NULL,
  `direction` enum('FROM_AIRPORT','TO_AIRPORT','BOTH') NOT NULL DEFAULT 'BOTH',
  `approx_distance_km` decimal(8,2) DEFAULT NULL,
  `approx_duration_min` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_airport_zone_direction` (`airport_id`,`zone_id`,`direction`),
  KEY `idx_airport` (`airport_id`),
  KEY `idx_zone` (`zone_id`),
  CONSTRAINT `routes_ibfk_1` FOREIGN KEY (`airport_id`) REFERENCES `airports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `routes_ibfk_2` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `key_name` varchar(100) NOT NULL,
  `value` text,
  `description` text,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_name` (`key_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sla_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sla_rules` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rule_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rule_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rule_value` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rule_key` (`rule_key`),
  KEY `idx_rule_key` (`rule_key`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `supplier_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `doc_type` enum('LICENSE','INSURANCE','TAX_CERT','ID_CARD','OTHER') NOT NULL,
  `doc_name` varchar(255) DEFAULT NULL,
  `file_url` varchar(500) NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `verified_at` datetime DEFAULT NULL,
  `verified_by` bigint DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `verified_by` (`verified_by`),
  CONSTRAINT `supplier_documents_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_documents_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `supplier_payouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_payouts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `booking_id` bigint DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `status` enum('PENDING','SCHEDULED','PAID','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `payout_method` enum('BANK_TRANSFER','PAYPAL','WISE','OTHER') DEFAULT 'BANK_TRANSFER',
  `reference` varchar(255) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `supplier_payouts_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_payouts_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `supplier_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_routes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `airport_id` bigint NOT NULL,
  `zone_id` bigint DEFAULT NULL,
  `destination_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destination_address` text COLLATE utf8mb4_unicode_ci,
  `destination_lat` decimal(10,7) DEFAULT NULL,
  `destination_lng` decimal(10,7) DEFAULT NULL,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `duration_min` int DEFAULT NULL,
  `direction` enum('FROM_AIRPORT','TO_AIRPORT','BOTH') COLLATE utf8mb4_unicode_ci DEFAULT 'BOTH',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_airport` (`airport_id`),
  KEY `idx_zone` (`zone_id`),
  CONSTRAINT `supplier_routes_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_routes_ibfk_2` FOREIGN KEY (`airport_id`) REFERENCES `airports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_routes_ibfk_3` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `supplier_service_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_service_zones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `airport_id` bigint NOT NULL,
  `max_distance_km` decimal(8,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_supplier_airport` (`supplier_id`,`airport_id`),
  KEY `airport_id` (`airport_id`),
  CONSTRAINT `supplier_service_zones_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_service_zones_ibfk_2` FOREIGN KEY (`airport_id`) REFERENCES `airports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `supplier_sla_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_sla_metrics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `metric_date` date NOT NULL,
  `total_bookings` int DEFAULT '0',
  `completed_bookings` int DEFAULT '0',
  `cancelled_bookings` int DEFAULT '0',
  `no_shows` int DEFAULT '0',
  `late_arrivals` int DEFAULT '0',
  `avg_response_time_min` int DEFAULT '0',
  `sla_breaches` int DEFAULT '0',
  `customer_complaints` int DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_supplier_date` (`supplier_id`,`metric_date`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_date` (`metric_date`),
  CONSTRAINT `supplier_sla_metrics_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `supplier_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `role` enum('OWNER','MANAGER','DISPATCHER') NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_supplier_user` (`supplier_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `supplier_users_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `supplier_zone_coverage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_zone_coverage` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_service_zone_id` bigint NOT NULL,
  `zone_id` bigint NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_service_zone` (`supplier_service_zone_id`,`zone_id`),
  KEY `zone_id` (`zone_id`),
  CONSTRAINT `supplier_zone_coverage_ibfk_1` FOREIGN KEY (`supplier_service_zone_id`) REFERENCES `supplier_service_zones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_zone_coverage_ibfk_2` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `legal_name` varchar(255) DEFAULT NULL,
  `tax_number` varchar(100) DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `whatsapp` varchar(50) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text,
  `logo_url` varchar(500) DEFAULT NULL,
  `description` text,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `commission_rate` decimal(5,2) DEFAULT '15.00',
  `rating_avg` decimal(3,2) DEFAULT '0.00',
  `rating_count` int DEFAULT '0',
  `response_time_avg` int DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_country_city` (`country`,`city`),
  KEY `idx_verified_active` (`is_verified`,`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tariff_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tariff_rules` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tariff_id` bigint NOT NULL,
  `rule_type` enum('TIME_OF_DAY','DAY_OF_WEEK','SEASON','LAST_MINUTE') NOT NULL,
  `rule_name` varchar(100) DEFAULT NULL,
  `day_of_week` int DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `season_from` date DEFAULT NULL,
  `season_to` date DEFAULT NULL,
  `hours_before` int DEFAULT NULL,
  `perc_adjustment` decimal(6,2) DEFAULT NULL,
  `fixed_adjustment` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tariff_id` (`tariff_id`),
  CONSTRAINT `tariff_rules_ibfk_1` FOREIGN KEY (`tariff_id`) REFERENCES `tariffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tariffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tariffs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `route_id` bigint NOT NULL,
  `vehicle_type` enum('SEDAN','VAN','MINIBUS','BUS','VIP') NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'EUR',
  `base_price` decimal(10,2) NOT NULL,
  `price_per_pax` decimal(10,2) DEFAULT NULL,
  `min_pax` int DEFAULT '1',
  `max_pax` int DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_supplier_route_vehicle` (`supplier_id`,`route_id`,`vehicle_type`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_route` (`route_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `tariffs_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tariffs_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=432 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `role` enum('ADMIN','SUPPLIER_OWNER','DISPATCHER','DRIVER','END_CUSTOMER','AGENCY_OWNER','AGENCY_MANAGER','AGENCY_BOOKER') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `avatar_url` varchar(500) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `email_verification_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_verification_token` (`email_verification_token`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `v_active_rides`;
/*!50001 DROP VIEW IF EXISTS `v_active_rides`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_active_rides` AS SELECT 
 1 AS `ride_id`,
 1 AS `booking_id`,
 1 AS `public_code`,
 1 AS `pickup_datetime`,
 1 AS `pickup_address`,
 1 AS `dropoff_address`,
 1 AS `flight_number`,
 1 AS `airport_name`,
 1 AS `zone_name`,
 1 AS `ride_status`,
 1 AS `driver_id`,
 1 AS `driver_name`,
 1 AS `driver_phone`,
 1 AS `supplier_name`,
 1 AS `supplier_phone`,
 1 AS `driver_lat`,
 1 AS `driver_lng`,
 1 AS `driver_status`,
 1 AS `driver_eta_minutes`,
 1 AS `customer_name`,
 1 AS `customer_phone`,
 1 AS `flight_status`,
 1 AS `flight_delay`,
 1 AS `flight_eta`*/;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `v_expiring_documents`;
/*!50001 DROP VIEW IF EXISTS `v_expiring_documents`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_expiring_documents` AS SELECT 
 1 AS `entity_type`,
 1 AS `entity_id`,
 1 AS `entity_name`,
 1 AS `doc_type`,
 1 AS `doc_name`,
 1 AS `expiry_date`,
 1 AS `days_until_expiry`,
 1 AS `expiry_status`*/;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `vehicle_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `vehicle_id` bigint NOT NULL,
  `doc_type` enum('REGISTRATION','INSURANCE','INSPECTION','OTHER') NOT NULL,
  `doc_name` varchar(255) DEFAULT NULL,
  `file_url` varchar(500) NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vehicle_id` (`vehicle_id`),
  CONSTRAINT `vehicle_documents_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `plate_number` varchar(50) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `seat_count` int NOT NULL,
  `luggage_count` int DEFAULT '0',
  `vehicle_type` enum('SEDAN','VAN','MINIBUS','BUS','VIP') NOT NULL,
  `features` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_type` (`vehicle_type`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `name_local` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `country_code` varchar(3) DEFAULT NULL,
  `zone_type` enum('CITY_CENTER','DISTRICT','RESORT','HOTEL','PORT','STATION','OTHER') DEFAULT 'DISTRICT',
  `parent_zone_id` bigint DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `is_popular` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parent_zone_id` (`parent_zone_id`),
  KEY `idx_country_city` (`country`,`city`),
  KEY `idx_popular` (`is_popular`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `zones_ibfk_1` FOREIGN KEY (`parent_zone_id`) REFERENCES `zones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50001 DROP VIEW IF EXISTS `v_active_rides`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_active_rides` AS select `r`.`id` AS `ride_id`,`r`.`booking_id` AS `booking_id`,`b`.`public_code` AS `public_code`,`b`.`pickup_datetime` AS `pickup_datetime`,`b`.`pickup_address` AS `pickup_address`,`b`.`dropoff_address` AS `dropoff_address`,`b`.`flight_number` AS `flight_number`,`a`.`name` AS `airport_name`,`z`.`name` AS `zone_name`,`r`.`status` AS `ride_status`,`r`.`driver_id` AS `driver_id`,`d`.`full_name` AS `driver_name`,`d`.`phone` AS `driver_phone`,`s`.`name` AS `supplier_name`,`s`.`contact_phone` AS `supplier_phone`,`dl`.`latitude` AS `driver_lat`,`dl`.`longitude` AS `driver_lng`,`dl`.`status` AS `driver_status`,`r`.`driver_eta_minutes` AS `driver_eta_minutes`,`bp`.`full_name` AS `customer_name`,`bp`.`phone` AS `customer_phone`,`ft`.`status` AS `flight_status`,`ft`.`delay_minutes` AS `flight_delay`,`ft`.`estimated_arrival` AS `flight_eta` from ((((((((`rides` `r` join `bookings` `b` on((`b`.`id` = `r`.`booking_id`))) left join `airports` `a` on((`a`.`id` = `b`.`airport_id`))) left join `zones` `z` on((`z`.`id` = `b`.`zone_id`))) left join `drivers` `d` on((`d`.`id` = `r`.`driver_id`))) left join `suppliers` `s` on((`s`.`id` = `r`.`supplier_id`))) left join `driver_locations` `dl` on((`dl`.`driver_id` = `r`.`driver_id`))) left join `booking_passengers` `bp` on(((`bp`.`booking_id` = `b`.`id`) and (`bp`.`is_lead` = true)))) left join `flight_tracking` `ft` on((`ft`.`booking_id` = `b`.`id`))) where ((`r`.`status` not in ('COMPLETED','CANCELLED')) and (`b`.`pickup_datetime` >= (now() - interval 24 hour))) order by `b`.`pickup_datetime` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!50001 DROP VIEW IF EXISTS `v_expiring_documents`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`airporttransfer`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_expiring_documents` AS select 'supplier' AS `entity_type`,`sd`.`supplier_id` AS `entity_id`,`s`.`name` AS `entity_name`,`sd`.`doc_type` AS `doc_type`,`sd`.`doc_name` AS `doc_name`,`sd`.`expiry_date` AS `expiry_date`,(to_days(`sd`.`expiry_date`) - to_days(curdate())) AS `days_until_expiry`,(case when (`sd`.`expiry_date` < curdate()) then 'EXPIRED' when ((to_days(`sd`.`expiry_date`) - to_days(curdate())) <= 7) then 'CRITICAL' when ((to_days(`sd`.`expiry_date`) - to_days(curdate())) <= 30) then 'WARNING' else 'OK' end) AS `expiry_status` from (`supplier_documents` `sd` join `suppliers` `s` on((`s`.`id` = `sd`.`supplier_id`))) where ((`sd`.`expiry_date` is not null) and (`sd`.`is_verified` = true)) union all select 'driver' AS `entity_type`,`d`.`id` AS `entity_id`,`d`.`full_name` AS `entity_name`,`dd`.`doc_type` AS `doc_type`,`dd`.`doc_name` AS `doc_name`,`dd`.`expiry_date` AS `expiry_date`,(to_days(`dd`.`expiry_date`) - to_days(curdate())) AS `days_until_expiry`,(case when (`dd`.`expiry_date` < curdate()) then 'EXPIRED' when ((to_days(`dd`.`expiry_date`) - to_days(curdate())) <= 7) then 'CRITICAL' when ((to_days(`dd`.`expiry_date`) - to_days(curdate())) <= 30) then 'WARNING' else 'OK' end) AS `expiry_status` from (`driver_documents` `dd` join `drivers` `d` on((`d`.`id` = `dd`.`driver_id`))) where ((`dd`.`expiry_date` is not null) and (`dd`.`is_verified` = true)) union all select 'vehicle' AS `entity_type`,`v`.`id` AS `entity_id`,concat(`v`.`brand`,' ',`v`.`model`,' (',`v`.`plate_number`,')') AS `entity_name`,`vd`.`doc_type` AS `doc_type`,`vd`.`doc_name` AS `doc_name`,`vd`.`expiry_date` AS `expiry_date`,(to_days(`vd`.`expiry_date`) - to_days(curdate())) AS `days_until_expiry`,(case when (`vd`.`expiry_date` < curdate()) then 'EXPIRED' when ((to_days(`vd`.`expiry_date`) - to_days(curdate())) <= 7) then 'CRITICAL' when ((to_days(`vd`.`expiry_date`) - to_days(curdate())) <= 30) then 'WARNING' else 'OK' end) AS `expiry_status` from (`vehicle_documents` `vd` join `vehicles` `v` on((`v`.`id` = `vd`.`vehicle_id`))) where ((`vd`.`expiry_date` is not null) and (`vd`.`is_verified` = true)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

