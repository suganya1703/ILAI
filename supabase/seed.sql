-- Seed Store Settings
INSERT INTO store_settings (id, delivery_charge, free_delivery_threshold, store_contact_email, store_whatsapp)
VALUES (1, 40.00, 499.00, 'support@ilai.in', '+918300815220')
ON CONFLICT (id) DO UPDATE SET
  delivery_charge = EXCLUDED.delivery_charge,
  free_delivery_threshold = EXCLUDED.free_delivery_threshold,
  store_contact_email = EXCLUDED.store_contact_email,
  store_whatsapp = EXCLUDED.store_whatsapp;

-- Seed Flagship Product: ILAI Sanitary Pad
INSERT INTO products (slug, name, subtitle, price, pack_quantity, stock_quantity, is_available)
VALUES (
  'ilai-sanitary-pad',
  'ILAI Sanitary Pad',
  'Eco-Friendly Sanitary Pads (Banana Fibre & Water Hyacinth)',
  45.00,
  6,
  500,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  price = EXCLUDED.price,
  pack_quantity = EXCLUDED.pack_quantity,
  stock_quantity = EXCLUDED.stock_quantity,
  is_available = EXCLUDED.is_available;

-- 3. Seed Exactly ONE Admin User (info.ilaiofficial@gmail.com) with PBKDF2 (SHA-512) Hashed Password
-- Clean up any other existing or test admin accounts
DELETE FROM admin_users WHERE email != 'info.ilaiofficial@gmail.com';

INSERT INTO admin_users (email, password_hash, salt, role)
VALUES (
  'info.ilaiofficial@gmail.com',
  'c17cef34bc3b815aff6f51330fcb140615d366b0495867d3fc141ce860e07fcc29b7247733a4f2c1669457aa530c1c8855fd8be8c44db59a3c7a19dd81c1bb5d',
  'fc19a9ca7ab64639db2977a190b8b21d',
  'super_admin'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  salt = EXCLUDED.salt,
  updated_at = NOW();

