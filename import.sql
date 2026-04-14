-- ============================================================
-- Mae Little Loops Studio — Sample Data Import
-- Run this AFTER supabase_setup.sql
-- ============================================================

-- ============================================================
-- BOUQUETS
-- ============================================================

insert into public.products (name, price, category, image_url, description, stock) values
  ('Sunflower Bouquet', 299.00, 'bouquet', '/sunflower-bouquet.png', 'Bright and cheerful sunflower bouquet, perfect for birthdays.', 10),
  ('Rose Bouquet', 350.00, 'bouquet', '/rose-bouquet.png', 'Classic red roses bouquet for your loved one.', 8),
  ('Pink Tulip Bouquet', 320.00, 'bouquet', '/pink-tulip-bouquet.png', 'Soft pink tulips wrapped in pastel ribbon.', 6),
  ('Mixed Wildflower Bouquet', 280.00, 'bouquet', '/wildflower-bouquet.png', 'A colorful mix of wildflowers for any occasion.', 12),
  ('Lavender Dream Bouquet', 310.00, 'bouquet', '/lavender-bouquet.png', 'Calming lavender bouquet with eucalyptus accents.', 5),
  ('White Lily Bouquet', 380.00, 'bouquet', '/lily-bouquet.png', 'Elegant white lilies for weddings and special events.', 7);

-- ============================================================
-- KEYCHAINS
-- ============================================================

insert into public.products (name, price, category, image_url, description, stock) values
  ('Graduation Penguin', 80.00, 'keychain', '/Graduation Penguin.png', 'Cute graduation penguin keychain, perfect for graduates.', 20),
  ('Frog-Hat', 90.00, 'keychain', '/Frog-Hat.png', 'Adorable frog with a tiny hat keychain.', 15),
  ('Strawberry-Hat', 100.00, 'keychain', '/Strawberry-Hat.png', 'Sweet strawberry with hat design keychain.', 18),
  ('Strawberry', 85.00, 'keychain', '/Strawberry.png', 'Classic strawberry charm keychain.', 25),
  ('Purple Bow', 95.00, 'keychain', '/Purple Bow.png', 'Pretty purple bow keychain for bag accessories.', 22),
  ('Monkey D. Luffy', 110.00, 'keychain', '/Monkey D. Luffy.png', 'One Piece inspired Luffy keychain for anime fans.', 14),
  ('Teddy Bear', 75.00, 'keychain', '/Teddy Bear.png', 'Classic mini teddy bear keychain, soft and cute.', 30),
  ('Sweet Bow Keychain', 88.00, 'keychain', '/Sweet Bow Keychain.png', 'Pastel sweet bow keychain, great for gifts.', 20);