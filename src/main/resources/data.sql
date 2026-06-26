-- ============================================================
-- UCD Canteen Hub — Seed Data
-- Canteen names/hours based on real UCD campus food outlets:
-- https://www.ucd.ie/estates/ourservices/foodincampus/
-- All passwords: password123 (BCrypt hash, identical for every seed user)
-- Re-run safe: DELETE block at top clears prior seed data first
-- ============================================================

-- --------------------------------------------------------------
-- 0. Clean slate for seed data (idempotent re-run)
-- --------------------------------------------------------------
DELETE FROM order_items;
DELETE FROM payments;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM reviews;
DELETE FROM dishes;
DELETE FROM canteen_schedules;
DELETE FROM holiday_schedules;
DELETE FROM canteens;
DELETE FROM user_roles;
DELETE FROM users;

-- --------------------------------------------------------------
-- 1. Users — 1 admin, 5 managers (one per canteen), 4 students
-- --------------------------------------------------------------
INSERT INTO users (id, name, email, password, phone_number, address, user_status, email_verified, created_at, update_at) VALUES
                                                                                                                             (1, 'Admin User', 'admin@ucdconnect.ie', '$2b$10$fQMBGyuAc4k7Z3.Wj3ug.uqMlDlgsXXrD5fvJpZH36s54.K/QNbES', '0871000001', 'UCD Belfield, Dublin 4', 'ACTIVE', true, NOW(), NOW()),

                                                                                                                             (2, 'Sarah Murphy',   'manager.main@ucdconnect.ie',   '$2b$10$fQMBGyuAc4k7Z3.Wj3ug.uqMlDlgsXXrD5fvJpZH36s54.K/QNbES', '0871000002', 'UCD Belfield, Dublin 4', 'ACTIVE', true, NOW(), NOW()),
                                                                                                                             (3, 'Liam O''Connor',  'manager.pi@ucdconnect.ie',     '$2b$10$fQMBGyuAc4k7Z3.Wj3ug.uqMlDlgsXXrD5fvJpZH36s54.K/QNbES', '0871000003', 'UCD Belfield, Dublin 4', 'ACTIVE', true, NOW(), NOW()),
                                                                                                                             (4, 'Aoife Kelly',     'manager.mikeys@ucdconnect.ie', '$2b$10$fQMBGyuAc4k7Z3.Wj3ug.uqMlDlgsXXrD5fvJpZH36s54.K/QNbES', '0871000004', 'UCD Belfield, Dublin 4', 'ACTIVE', true, NOW(), NOW()),
                                                                                                                             (5, 'Wei Chen',        'manager.buzz@ucdconnect.ie',   '$2b$10$fQMBGyuAc4k7Z3.Wj3ug.uqMlDlgsXXrD5fvJpZH36s54.K/QNbES', '0871000005', 'UCD Belfield, Dublin 4', 'ACTIVE', true, NOW(), NOW()),
                                                                                                                             (6, 'Niamh Byrne',     'manager.sushilab@ucdconnect.ie', '$2b$10$fQMBGyuAc4k7Z3.Wj3ug.uqMlDlgsXXrD5fvJpZH36s54.K/QNbES', '0871000006', 'UCD Belfield, Dublin 4', 'ACTIVE', true, NOW(), NOW()),
                                                                                                                             (11, 'Conor Fitzgerald', 'manager.bulletbbq@ucdconnect.ie', '$2b$10$fQMBGyuAc4k7Z3.Wj3ug.uqMlDlgsXXrD5fvJpZH36s54.K/QNbES', '0871000011', 'UCD Belfield, Dublin 4', 'ACTIVE', true, NOW(), NOW()),

                                                                                                                             (7,  'Blair Wang',   'blair.student@ucdconnect.ie',   '$2b$10$fQMBGyuAc4k7Z3.Wj3ug.uqMlDlgsXXrD5fvJpZH36s54.K/QNbES', '0871000007', 'Roebuck Hall, UCD',      'ACTIVE', true, NOW(), NOW()),
                                                                                                                             (8,  'Tom Walsh',     'tom.student@ucdconnect.ie',     '$2b$10$fQMBGyuAc4k7Z3.Wj3ug.uqMlDlgsXXrD5fvJpZH36s54.K/QNbES', '0871000008', 'Glenomena, UCD',         'ACTIVE', true, NOW(), NOW()),
                                                                                                                             (9,  'Priya Nair',    'priya.student@ucdconnect.ie',   '$2b$10$fQMBGyuAc4k7Z3.Wj3ug.uqMlDlgsXXrD5fvJpZH36s54.K/QNbES', '0871000009', 'Merville Hall, UCD',     'ACTIVE', true, NOW(), NOW()),
                                                                                                                             (10, 'Jack Doyle',    'jack.student@ucdconnect.ie',    '$2b$10$fQMBGyuAc4k7Z3.Wj3ug.uqMlDlgsXXrD5fvJpZH36s54.K/QNbES', '0871000010', 'Off-campus, Dublin 4',   'ACTIVE', true, NOW(), NOW());

-- user_roles: @ElementCollection table, columns are (user_id, role) — no surrogate id
INSERT INTO user_roles (user_id, role) VALUES
                                           (1, 'ROLE_ADMIN'),
                                           (2, 'ROLE_MANAGER'),
                                           (3, 'ROLE_MANAGER'),
                                           (4, 'ROLE_MANAGER'),
                                           (5, 'ROLE_MANAGER'),
                                           (6, 'ROLE_MANAGER'),
                                           (11, 'ROLE_MANAGER'),
                                           (7, 'ROLE_STUDENT'),
                                           (8, 'ROLE_STUDENT'),
                                           (9, 'ROLE_STUDENT'),
                                           (10, 'ROLE_STUDENT');

-- --------------------------------------------------------------
-- 2. Canteens — version=0 required (optimistic locking column)
-- --------------------------------------------------------------
INSERT INTO canteens (id, name, canteen_type, description, image_url, manager_id, is_deleted, version) VALUES
                                                                                                           (1, 'UCD Main Restaurant', 'Restaurant',
                                                                                                            'A diverse menu featuring toasties, street food, daily carvery, and specials, with a focus on fresh, locally sourced ingredients.',
                                                                                                            NULL, 2, false, 0),
                                                                                                           (2, 'Pi Restaurant', 'Café',
                                                                                                            'Lunch specials, sandwiches and salads to home cooked warm dinner specials. Dine in or take away.',
                                                                                                            NULL, 3, false, 0),
                                                                                                           (3, 'MIKEYS', 'Quick Bite',
                                                                                                            'Late-night campus favourite for burgers, fries and milkshakes.',
                                                                                                            NULL, 4, false, 0),
                                                                                                           (4, 'The Buzz', 'Café',
                                                                                                            'Coffee, light bites and a quick pick-me-up between lectures.',
                                                                                                            NULL, 5, false, 0),
                                                                                                           (5, 'SUSHI LAB', 'Restaurant',
                                                                                                            'Discover a world of flavors at Sushi Lab. From traditional rolls to innovative creations, each bite is a culinary adventure.',
                                                                                                            NULL, 6, false, 0),
                                                                                                           (6, 'BULLET BBQ', 'Restaurant',
                                                                                                            'Authentic Hong Kong-style BBQ. Roast meats served over rice, plus bao buns. Add two meats for €3.',
                                                                                                            NULL, 11, false, 0);

-- --------------------------------------------------------------
-- 3. Canteen weekly schedules
-- --------------------------------------------------------------
-- UCD Main Restaurant: 8:00 - 15:30 (Fri closes 15:00), closed weekends
INSERT INTO canteen_schedules (canteen_id, day_of_week, opening_time, closing_time, is_closed) VALUES
                                                                                                   (1, 'MONDAY',    '08:00:00', '15:30:00', false),
                                                                                                   (1, 'TUESDAY',   '08:00:00', '15:30:00', false),
                                                                                                   (1, 'WEDNESDAY', '08:00:00', '15:30:00', false),
                                                                                                   (1, 'THURSDAY',  '08:00:00', '15:30:00', false),
                                                                                                   (1, 'FRIDAY',    '08:00:00', '15:00:00', false),
                                                                                                   (1, 'SATURDAY',  NULL, NULL, true),
                                                                                                   (1, 'SUNDAY',    NULL, NULL, true);

-- Pi Restaurant: 8:30 - 17:00, closed weekends
INSERT INTO canteen_schedules (canteen_id, day_of_week, opening_time, closing_time, is_closed) VALUES
                                                                                                   (2, 'MONDAY',    '08:30:00', '17:00:00', false),
                                                                                                   (2, 'TUESDAY',   '08:30:00', '17:00:00', false),
                                                                                                   (2, 'WEDNESDAY', '08:30:00', '17:00:00', false),
                                                                                                   (2, 'THURSDAY',  '08:30:00', '17:00:00', false),
                                                                                                   (2, 'FRIDAY',    '08:30:00', '17:00:00', false),
                                                                                                   (2, 'SATURDAY',  NULL, NULL, true),
                                                                                                   (2, 'SUNDAY',    NULL, NULL, true);

-- MIKEYS: 12:00 - 22:00 every day (late-night spot)
INSERT INTO canteen_schedules (canteen_id, day_of_week, opening_time, closing_time, is_closed) VALUES
                                                                                                   (3, 'MONDAY',    '12:00:00', '22:00:00', false),
                                                                                                   (3, 'TUESDAY',   '12:00:00', '22:00:00', false),
                                                                                                   (3, 'WEDNESDAY', '12:00:00', '22:00:00', false),
                                                                                                   (3, 'THURSDAY',  '12:00:00', '22:00:00', false),
                                                                                                   (3, 'FRIDAY',    '12:00:00', '23:00:00', false),
                                                                                                   (3, 'SATURDAY',  '12:00:00', '23:00:00', false),
                                                                                                   (3, 'SUNDAY',    '14:00:00', '21:00:00', false);

-- The Buzz: 8:30 - 16:00, closed weekends
INSERT INTO canteen_schedules (canteen_id, day_of_week, opening_time, closing_time, is_closed) VALUES
                                                                                                   (4, 'MONDAY',    '08:30:00', '16:00:00', false),
                                                                                                   (4, 'TUESDAY',   '08:30:00', '16:00:00', false),
                                                                                                   (4, 'WEDNESDAY', '08:30:00', '16:00:00', false),
                                                                                                   (4, 'THURSDAY',  '08:30:00', '16:00:00', false),
                                                                                                   (4, 'FRIDAY',    '08:30:00', '15:00:00', false),
                                                                                                   (4, 'SATURDAY',  NULL, NULL, true),
                                                                                                   (4, 'SUNDAY',    NULL, NULL, true);

-- SUSHI LAB: 11:30 - 20:00, Mon - Sat, closed Sunday
INSERT INTO canteen_schedules (canteen_id, day_of_week, opening_time, closing_time, is_closed) VALUES
                                                                                                   (5, 'MONDAY',    '11:30:00', '20:00:00', false),
                                                                                                   (5, 'TUESDAY',   '11:30:00', '20:00:00', false),
                                                                                                   (5, 'WEDNESDAY', '11:30:00', '20:00:00', false),
                                                                                                   (5, 'THURSDAY',  '11:30:00', '20:00:00', false),
                                                                                                   (5, 'FRIDAY',    '11:30:00', '20:00:00', false),
                                                                                                   (5, 'SATURDAY',  '11:30:00', '20:00:00', false),
                                                                                                   (5, 'SUNDAY',    NULL, NULL, true);

-- BULLET BBQ: 11:30 - 20:00, every day
INSERT INTO canteen_schedules (canteen_id, day_of_week, opening_time, closing_time, is_closed) VALUES
                                                                                                   (6, 'MONDAY',    '11:30:00', '20:00:00', false),
                                                                                                   (6, 'TUESDAY',   '11:30:00', '20:00:00', false),
                                                                                                   (6, 'WEDNESDAY', '11:30:00', '20:00:00', false),
                                                                                                   (6, 'THURSDAY',  '11:30:00', '20:00:00', false),
                                                                                                   (6, 'FRIDAY',    '11:30:00', '20:00:00', false),
                                                                                                   (6, 'SATURDAY',  '11:30:00', '20:00:00', false),
                                                                                                   (6, 'SUNDAY',    '11:30:00', '20:00:00', false);

-- --------------------------------------------------------------
-- 4. Dishes — version=0 required (optimistic locking column)
-- --------------------------------------------------------------
INSERT INTO dishes (id, name, description, price, image_url, canteen_id, food_category, is_available, is_deleted, version) VALUES
-- UCD Main Restaurant
(1, 'Daily Carvery',             'Roast of the day with seasonal vegetables and gravy.', 7.95, NULL, 1, 'Main Course', true, false, 0),
(2, 'Cheese and Ham Toastie',    'Classic toasted sandwich, served with side salad.', 4.50, NULL, 1, 'Main Course', true, false, 0),
(3, 'Filter Coffee',             'Freshly brewed, regular or large.', 2.50, NULL, 1, 'Beverage', true, false, 0),

-- Pi Restaurant
(4, 'Chicken Caesar Salad',      'Grilled chicken, romaine, parmesan, croutons, Caesar dressing.', 7.50, NULL, 2, 'Main Course', true, false, 0),
(5, 'Home-Cooked Lasagne',       'Beef ragu lasagne with garlic bread.', 8.20, NULL, 2, 'Main Course', true, false, 0),
(6, 'Chocolate Brownie',         'Warm fudge brownie, served with cream.', 3.20, NULL, 2, 'Dessert', true, false, 0),

-- MIKEYS
(7, 'Breaded Mozzarella Sticks', 'Crispy breaded mozzarella, served with marinara dip.', 5.50, NULL, 3, 'Bites', true, false, 0),
(8, 'Chicken Wings',             'Six wings, choice of sauce.', 6.90, NULL, 3, 'Bites', true, false, 0),
(9, 'Route 66',                  'Double stack burger with bacon and American cheese.', 10.50, NULL, 3, 'Burgers', true, false, 0),
(10, 'New Yorker',               'Applewood smoked cheese, crispy bacon, topped with a fried egg.', 11.20, NULL, 3, 'Burgers', true, false, 0),
(11, 'Wrights Fish Burger',      'Crispy white fish, mushy peas and tartare sauce.', 9.80, NULL, 3, 'Burgers', true, false, 0),
(12, 'Chicken & Waffles',        'Crispy fried chicken on a Belgian waffle, maple syrup.', 10.90, NULL, 3, 'Chicken', true, false, 0),
(13, 'Chicken Tenders',          'Five breaded chicken tenders, choice of dip.', 8.50, NULL, 3, 'Chicken', true, false, 0),
(14, 'Chicken Wrap',             'Grilled chicken, lettuce, sauce, soft tortilla wrap.', 7.80, NULL, 3, 'Chicken', true, false, 0),
(15, 'Margherita Pizza',         'Classic tomato, mozzarella, basil.', 9.50, NULL, 3, 'Pizza', true, false, 0),
(16, 'Pepperoni Pizza',          'Tomato, mozzarella, pepperoni.', 10.50, NULL, 3, 'Pizza', true, false, 0),
(17, 'Vegan Pizza',              'Tomato, vegan cheese, roasted vegetables.', 10.50, NULL, 3, 'Pizza', true, false, 0),
(18, 'Garlic Butter Fries',      'Hand-cut fries tossed in garlic butter.', 4.20, NULL, 3, 'Sides', true, false, 0),
(19, 'Bacon & Cheese Fries',     'Fries loaded with bacon bits and melted cheese.', 5.50, NULL, 3, 'Sides', true, false, 0),

-- The Buzz
(20, 'Flat White',               'Double espresso with steamed milk.', 3.20, NULL, 4, 'Beverage', true, false, 0),
(21, 'Granola Yoghurt Pot',      'Greek yoghurt, honey, house-made granola.', 4.20, NULL, 4, 'Snack', true, false, 0),
(22, 'Blueberry Muffin',         'Freshly baked, served warm.', 2.80, NULL, 4, 'Dessert', true, false, 0),

-- SUSHI LAB
(23, 'Teriyaki Katsu Chicken Burrito', 'Crispy katsu chicken, teriyaki glaze, sushi rice, wrapped.', 8.50, NULL, 5, 'Sushi Burritos', true, false, 0),
(24, 'Hoisin Roast Duck Burrito',      'Roast duck, hoisin sauce, sushi rice, wrapped.', 9.20, NULL, 5, 'Sushi Burritos', true, false, 0),
(25, 'Cucumber Roll',                  'Hosomaki, cucumber, 6 pieces.', 4.50, NULL, 5, 'Hosomaki', true, false, 0),
(26, 'Avocado Roll',                   'Hosomaki, avocado, 6 pieces.', 4.80, NULL, 5, 'Hosomaki', true, false, 0),
(27, 'Salmon Roll',                    'Hosomaki, fresh salmon, 6 pieces.', 5.50, NULL, 5, 'Hosomaki', true, false, 0),
(28, 'California Roll',                'Norimaki, crab stick, avocado, cucumber, 8 pieces.', 7.90, NULL, 5, 'Norimaki', true, false, 0),
(29, 'Spicy Salmon Roll',               'Norimaki, salmon, spicy mayo, 8 pieces.', 8.50, NULL, 5, 'Norimaki', true, false, 0),
(30, 'Chicken Katsu Roll',              'Norimaki, crispy chicken katsu, katsu sauce, 8 pieces.', 8.20, NULL, 5, 'Norimaki', true, false, 0),
(31, 'Vegan Roll',                      'Norimaki, marinated tofu, avocado, pickled vegetables, 8 pieces.', 7.50, NULL, 5, 'Norimaki', true, false, 0),
(32, 'Chicken Katsu Curry Bowl',        'Crispy chicken katsu over rice with Japanese curry sauce.', 10.20, NULL, 5, 'Rice Bowls', true, false, 0),
(33, 'Salmon Poke Bowl',                'Fresh salmon, sushi rice, edamame, avocado, sesame dressing.', 10.90, NULL, 5, 'Rice Bowls', true, false, 0),

-- BULLET BBQ
(34, 'Roast Silverhill Duck',          'Roast duck served with broccoli and jasmine rice.', 12.50, NULL, 6, 'Meats', true, false, 0),
(35, 'Crispy Pork Belly',              'Crispy pork belly served with broccoli and jasmine rice.', 11.90, NULL, 6, 'Meats', true, false, 0),
(36, 'Soy Free-Range Chicken',         'Soy-marinated free-range chicken served with broccoli and jasmine rice.', 10.90, NULL, 6, 'Meats', true, false, 0),
(37, 'Char Siu BBQ Pork',              'Char siu BBQ pork served with broccoli and jasmine rice.', 11.50, NULL, 6, 'Meats', true, false, 0),
(38, 'Roast Duck Bao Bun',             'Steamed bao bun filled with roast Silverhill duck.', 5.50, NULL, 6, 'Bao Buns', true, false, 0),
(39, 'Crispy Pork Belly Bao Bun',      'Steamed bao bun filled with crispy pork belly.', 5.20, NULL, 6, 'Bao Buns', true, false, 0),
(40, 'Char Siu Bao Bun',               'Steamed bao bun filled with char siu BBQ pork.', 5.20, NULL, 6, 'Bao Buns', true, false, 0);

-- --------------------------------------------------------------
-- 5. Sample orders — covering INITIALIZED / CONFIRMED / COMPLETED /
--    CANCELLED / REFUNDED. version=0 required on every order.
-- --------------------------------------------------------------

-- Order #1: Blair, UCD Main Restaurant — INITIALIZED (never paid, awaiting checkout)
INSERT INTO orders (id, user_id, canteen_id, order_date, total_amount, pickup_code, order_status, payment_status, version) VALUES
    (1, 7, 1, NOW(), 6.70, 'A1B2', 'INITIALIZED', 'PENDING', 0);
INSERT INTO order_items (id, order_id, dish_id, dish_name, dish_image_url, quantity, price_per_unit, subtotal) VALUES
                                                                                                                   (1, 1, 2, 'Cheese and Ham Toastie', NULL, 1, 4.50, 4.50),
                                                                                                                   (2, 1, 3, 'Filter Coffee', NULL, 1, 2.50, 2.50);

-- Order #2: Tom, Pi Restaurant — CONFIRMED (paid, kitchen preparing)
INSERT INTO orders (id, user_id, canteen_id, order_date, total_amount, pickup_code, order_status, payment_status, version) VALUES
    (2, 8, 2, NOW(), 11.40, 'C3D4', 'CONFIRMED', 'COMPLETED', 0);
INSERT INTO order_items (id, order_id, dish_id, dish_name, dish_image_url, quantity, price_per_unit, subtotal) VALUES
                                                                                                                   (3, 2, 4, 'Chicken Caesar Salad', NULL, 1, 7.50, 7.50),
                                                                                                                   (4, 2, 6, 'Chocolate Brownie', NULL, 1, 3.20, 3.20);
INSERT INTO payments (id, order_id, user_id, amount, payment_status, transaction_id, payment_gateway, created_at, payment_date, version) VALUES
    (1, 2, 8, 11.40, 'COMPLETED', 'pi_seed_demo_0002', 'STRIPE', NOW(), NOW(), 0);

-- Order #3: Priya, MIKEYS — COMPLETED (picked up)
INSERT INTO orders (id, user_id, canteen_id, order_date, total_amount, pickup_code, order_status, payment_status, version) VALUES
    (3, 9, 3, NOW(), 21.60, 'E5F6', 'COMPLETED', 'COMPLETED', 0);
INSERT INTO order_items (id, order_id, dish_id, dish_name, dish_image_url, quantity, price_per_unit, subtotal) VALUES
                                                                                                                   (5, 3, 9, 'Route 66', NULL, 1, 10.50, 10.50),
                                                                                                                   (6, 3, 18, 'Garlic Butter Fries', NULL, 1, 4.20, 4.20),
                                                                                                                   (11, 3, 8, 'Chicken Wings', NULL, 1, 6.90, 6.90);
INSERT INTO payments (id, order_id, user_id, amount, payment_status, transaction_id, payment_gateway, created_at, payment_date, version) VALUES
    (2, 3, 9, 21.60, 'COMPLETED', 'pi_seed_demo_0003', 'STRIPE', NOW(), NOW(), 0);

-- Order #4: Jack, SUSHI LAB — REFUNDED (manager cancelled during prep)
INSERT INTO orders (id, user_id, canteen_id, order_date, total_amount, pickup_code, order_status, payment_status, version) VALUES
    (4, 10, 5, NOW(), 19.40, 'G7H8', 'REFUNDED', 'REFUNDED', 0);
INSERT INTO order_items (id, order_id, dish_id, dish_name, dish_image_url, quantity, price_per_unit, subtotal) VALUES
                                                                                                                   (7, 4, 29, 'Spicy Salmon Roll', NULL, 1, 8.50, 8.50),
                                                                                                                   (8, 4, 33, 'Salmon Poke Bowl', NULL, 1, 10.90, 10.90);
INSERT INTO payments (id, order_id, user_id, amount, payment_status, transaction_id, payment_gateway, created_at, payment_date, version) VALUES
    (3, 4, 10, 19.40, 'REFUNDED', 'pi_seed_demo_0004', 'STRIPE', NOW(), NOW(), 0);

-- Order #5: Blair, The Buzz — CANCELLED (timed out before payment, never charged)
INSERT INTO orders (id, user_id, canteen_id, order_date, total_amount, pickup_code, order_status, payment_status, version) VALUES
    (5, 7, 4, NOW(), 3.20, 'I9J0', 'CANCELLED', 'PENDING', 0);
INSERT INTO order_items (id, order_id, dish_id, dish_name, dish_image_url, quantity, price_per_unit, subtotal) VALUES
    (9, 5, 20, 'Flat White', NULL, 1, 3.20, 3.20);

-- Order #6: Tom, BULLET BBQ — COMPLETED (picked up)
INSERT INTO orders (id, user_id, canteen_id, order_date, total_amount, pickup_code, order_status, payment_status, version) VALUES
    (6, 8, 6, NOW(), 16.70, 'K1L2', 'COMPLETED', 'COMPLETED', 0);
INSERT INTO order_items (id, order_id, dish_id, dish_name, dish_image_url, quantity, price_per_unit, subtotal) VALUES
                                                                                                                   (10, 6, 37, 'Char Siu BBQ Pork', NULL, 1, 11.50, 11.50),
                                                                                                                   (12, 6, 40, 'Char Siu Bao Bun', NULL, 1, 5.20, 5.20);
INSERT INTO payments (id, order_id, user_id, amount, payment_status, transaction_id, payment_gateway, created_at, payment_date, version) VALUES
    (4, 6, 8, 16.70, 'COMPLETED', 'pi_seed_demo_0006', 'STRIPE', NOW(), NOW(), 0);

-- --------------------------------------------------------------
-- 6. Sample reviews — only for COMPLETED orders (verified purchase)
-- --------------------------------------------------------------
INSERT INTO reviews (id, user_id, dish_id, rating, comment, created_at, order_id) VALUES
                                                                                      (1, 9, 9, 5, 'Double stack burger was massive and so juicy. Worth the wait.', NOW(), 3),
                                                                                      (2, 9, 18, 4, 'Fries were great, could use a bit more garlic butter.', NOW(), 3),
                                                                                      (3, 8, 37, 5, 'Char siu pork was perfectly tender, will order again.', NOW(), 6);