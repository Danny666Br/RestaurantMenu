-- ============================================================
-- Pastelería Florida — Seed SQL (menú real)
-- Ejecutar DESPUÉS de schema.sql
-- Si ya tienes datos anteriores, este script los reemplaza.
-- ============================================================

-- Limpiar datos anteriores (orden importante por foreign keys)
delete from order_items;
delete from orders;
delete from products;
delete from categories;

-- ============================================================
-- CATEGORÍAS (4 categorías)
-- ============================================================

insert into categories (id, name, display_order) values
  ('11111111-0000-0000-0000-000000000001', 'Bebidas Calientes',  1),
  ('11111111-0000-0000-0000-000000000002', 'Bebidas Frías',      2),
  ('11111111-0000-0000-0000-000000000003', 'Platos Principales', 3),
  ('11111111-0000-0000-0000-000000000004', 'Panadería',          4);

-- ============================================================
-- PRODUCTOS — BEBIDAS CALIENTES (11 productos)
-- ============================================================

insert into products (name, description, price, emoji, category_id, subcategory, is_active) values

('Expreso',
 '',
 5000, '☕', '11111111-0000-0000-0000-000000000001', null, true),

('Expreso doble',
 '',
 8000, '☕', '11111111-0000-0000-0000-000000000001', null, true),

('Americano',
 '',
 5500, '☕', '11111111-0000-0000-0000-000000000001', null, true),

('Café Moka',
 '',
 7000, '☕', '11111111-0000-0000-0000-000000000001', null, true),

('Macchiato',
 '',
 6000, '☕', '11111111-0000-0000-0000-000000000001', null, true),

('Capuchino',
 '',
 7000, '☕', '11111111-0000-0000-0000-000000000001', null, true),

('Capuchino con licor',
 '',
 8800, '☕', '11111111-0000-0000-0000-000000000001', null, true),

('Tinto',
 '',
 4500, '☕', '11111111-0000-0000-0000-000000000001', null, true),

('Taza de chocolate en leche o en agua',
 '',
 8700, '🍫', '11111111-0000-0000-0000-000000000001', null, true),

('Taza de agua de panela',
 'Con miel de jengibre o clavo o anís estrellado',
 7000, '🍵', '11111111-0000-0000-0000-000000000001', null, true),

('Taza de café en leche',
 '',
 8700, '☕', '11111111-0000-0000-0000-000000000001', null, true);

-- ============================================================
-- PRODUCTOS — BEBIDAS FRÍAS (9 productos)
-- ============================================================

insert into products (name, description, price, emoji, category_id, subcategory, is_active) values

('Jugos de fruta',
 'Fresa, mora, lulo, maracuyá, guanábana, piña, mango en agua, sin azúcar',
 9500, '🍹', '11111111-0000-0000-0000-000000000002', null, true),

('Jugo de naranja',
 '',
 10000, '🍊', '11111111-0000-0000-0000-000000000002', null, true),

('Jugo de mandarina',
 '',
 11500, '🍊', '11111111-0000-0000-0000-000000000002', null, true),

('Jugo de piña con hierbabuena',
 '',
 9500, '🍍', '11111111-0000-0000-0000-000000000002', null, true),

('Limonada natural',
 '',
 9000, '🍋', '11111111-0000-0000-0000-000000000002', null, true),

('Soda con Zumo de Limón',
 '',
 8500, '🍋', '11111111-0000-0000-0000-000000000002', null, true),

('Zumo de limón',
 '',
 2500, '🍋', '11111111-0000-0000-0000-000000000002', null, true),

('Avena Santafereña',
 '',
 8500, '🥛', '11111111-0000-0000-0000-000000000002', null, true),

('Kumis',
 '',
 7500, '🥛', '11111111-0000-0000-0000-000000000002', null, true);

-- ============================================================
-- PRODUCTOS — PLATOS PRINCIPALES (32 productos, 6 subcategorías)
-- ============================================================

-- Subcategoría: Frutas

insert into products (name, description, price, emoji, category_id, subcategory, is_active) values

('Parfait de frutos rojos',
 'Cerezas, fresas, salsa de frutos rojos, exquisita granola de la casa y yogurt',
 15500, '🍓', '11111111-0000-0000-0000-000000000003', 'Frutas', true),

('Bowl de frutas',
 'Manzana, fresas, banano, mango, granola de la casa y yogurt',
 17000, '🍎', '11111111-0000-0000-0000-000000000003', 'Frutas', true);

-- Subcategoría: Chocolate Acompañado

insert into products (name, description, price, emoji, category_id, subcategory, is_active) values

('Chocolate Santafereño',
 'Chocolate, mini pan, mini pan de yuca, mini almojábana, queso, mantequilla y mermelada',
 19500, '🍫', '11111111-0000-0000-0000-000000000003', 'Chocolate Acompañado', true),

('Chocolate Dietético',
 'Chocolate en leche deslactosada, pan integral, queso campesino y mermelada sin azúcar hecha en casa',
 16500, '🍫', '11111111-0000-0000-0000-000000000003', 'Chocolate Acompañado', true),

('Agua de panela Santafereña',
 'Con mini pan, mini pan de yuca, mini almojábana, queso, mantequilla y mermelada',
 17500, '🍵', '11111111-0000-0000-0000-000000000003', 'Chocolate Acompañado', true),

('Café en leche Santafereño',
 'Con mini pan, mini pan de yuca, mini almojábana, queso, mantequilla y mermelada',
 19500, '☕', '11111111-0000-0000-0000-000000000003', 'Chocolate Acompañado', true);

-- Subcategoría: Huevos

insert into products (name, description, price, emoji, category_id, subcategory, is_active) values

('Florida',
 'Tomate, queso mozarela y tocineta, montados sobre croissant de mantequilla',
 18500, '🍳', '11111111-0000-0000-0000-000000000003', 'Huevos', true),

('Percherona',
 'Huevos fritos sobre cama de papa chips, con salsa de queso, trozos de tocineta, cebolla caramelizada y cebollín',
 21500, '🍳', '11111111-0000-0000-0000-000000000003', 'Huevos', true),

('Florentinos',
 'Pochados, montados sobre pan brioche y tomate, con salsa de queso y espinaca',
 17500, '🍳', '11111111-0000-0000-0000-000000000003', 'Huevos', true),

('Pochados',
 'Montados sobre pan brioche con salsa de queso y cebollín',
 20000, '🍳', '11111111-0000-0000-0000-000000000003', 'Huevos', true),

('Ahogados',
 'Huevos fritos, bañados en salsa napolitana, con frijol, maíz tierno, guiso de tomate y cebolla junca, queso mozarela y arepa de peto queso',
 22500, '🍳', '11111111-0000-0000-0000-000000000003', 'Huevos', true),

('Bretone',
 'Crocante tortilla de trigo, rellena de jamón, queso mozarela, huevos fritos con sofrito de tomate, cebolla y cilantro',
 18500, '🌯', '11111111-0000-0000-0000-000000000003', 'Huevos', true),

('Combinados',
 'Jamón y queso, o champiñones y mazorca, o mazorca y jamón, o mazorca y queso',
 14000, '🍳', '11111111-0000-0000-0000-000000000003', 'Huevos', true),

('Pericos',
 '',
 8500, '🍳', '11111111-0000-0000-0000-000000000003', 'Huevos', true),

('Revueltos',
 '',
 8000, '🍳', '11111111-0000-0000-0000-000000000003', 'Huevos', true),

('Fritos',
 '',
 8000, '🍳', '11111111-0000-0000-0000-000000000003', 'Huevos', true),

('Omelet de huevos o claras',
 'Tomate, queso y albahaca, o pollo y champiñón, o maíz y tocineta, o jamón y queso',
 14000, '🍳', '11111111-0000-0000-0000-000000000003', 'Huevos', true),

('Ingrediente adicional',
 'Para huevos combinados y omelet',
 6500, '➕', '11111111-0000-0000-0000-000000000003', 'Huevos', true);

-- Subcategoría: Típicos

insert into products (name, description, price, emoji, category_id, subcategory, is_active) values

('Tamal Tolimense',
 'Masa de arroz, con pollo, cerdo, huevo, arveja amarilla, en hoja de plátano y cocidos al vapor',
 14000, '🌿', '11111111-0000-0000-0000-000000000003', 'Típicos', true),

('Tamal Santandereano',
 'Masa de maíz, con pollo, cerdo, garbanzo, en hojas de plátano y cocidos al vapor',
 15000, '🌿', '11111111-0000-0000-0000-000000000003', 'Típicos', true),

('Changua Santafereña',
 'Tradicional changua con leche, huevos, almojábana y queso, aromatizada con cilantro',
 17000, '🥣', '11111111-0000-0000-0000-000000000003', 'Típicos', true),

('Envueltos de mazorca',
 'Tradicional preparación de mazorca tierna, queso, cuajada, mantequilla y azúcar',
 11000, '🌽', '11111111-0000-0000-0000-000000000003', 'Típicos', true),

('Arepa de choclo y queso gratinado',
 '',
 11000, '🫓', '11111111-0000-0000-0000-000000000003', 'Típicos', true),

('Arepa de choclo con carne desmechada',
 '',
 21000, '🫓', '11111111-0000-0000-0000-000000000003', 'Típicos', true);

-- Subcategoría: Sándwich

insert into products (name, description, price, emoji, category_id, subcategory, is_active) values

('Sándwich de Huevo',
 'Mezcla de huevo, jamón, tomate, sal, pimienta, montado sobre pan árabe y acompañado de cascos de papa rústica',
 17500, '🥪', '11111111-0000-0000-0000-000000000003', 'Sándwich', true),

('Sándwich Jamón y queso',
 'Jamón ahumado con queso, montado sobre pan árabe y acompañado de cascos de papa rústica',
 23500, '🥪', '11111111-0000-0000-0000-000000000003', 'Sándwich', true),

('Sándwich Cubano',
 'Carne desmechada sobre pan árabe, con salsa de pimentón, lechuga, tomate, julianas de pimentón, y cascos de papa rústica',
 25500, '🥪', '11111111-0000-0000-0000-000000000003', 'Sándwich', true);

-- Subcategoría: Tostadas Francesas

insert into products (name, description, price, emoji, category_id, subcategory, is_active) values

('Tostadas Frutos rojos',
 'Crujientes tostadas de pan brioche, bañadas en salsa de frutos rojos y acompañadas de crema chantilly',
 17000, '🍞', '11111111-0000-0000-0000-000000000003', 'Tostadas Francesas', true),

('Tostadas Fresas y chocolate',
 'Crujientes tostadas de pan brioche, acompañadas de fresas salteadas, salsa de chocolate y crema chantilly',
 17000, '🍞', '11111111-0000-0000-0000-000000000003', 'Tostadas Francesas', true),

('Tostadas Banano y chocolate',
 'Crujientes tostadas de pan brioche, acompañadas de banano caramelizado, salsa de chocolate y crema chantilly',
 17000, '🍞', '11111111-0000-0000-0000-000000000003', 'Tostadas Francesas', true),

('Tostadas Mango maracuyá',
 'Crujientes tostadas de pan brioche, acompañadas de salsa de mango maracuyá, con trozos de mango y crema chantilly',
 17000, '🍞', '11111111-0000-0000-0000-000000000003', 'Tostadas Francesas', true),

('Tostadas Banano y arequipe',
 'Crujientes tostadas de pan brioche, acompañadas de banano caramelizado, salsa de arequipe y crema chantilly',
 17000, '🍞', '11111111-0000-0000-0000-000000000003', 'Tostadas Francesas', true);

-- ============================================================
-- PRODUCTOS — PANADERÍA (12 productos)
-- ============================================================

insert into products (name, description, price, emoji, category_id, subcategory, is_active) values

('Pan de Chocolate',
 '',
 5000, '🍫', '11111111-0000-0000-0000-000000000004', null, true),

('Pasaboca de chocolate',
 '',
 2000, '🍫', '11111111-0000-0000-0000-000000000004', null, true),

('Pasaboca de bocadillo',
 '',
 2000, '🍬', '11111111-0000-0000-0000-000000000004', null, true),

('Rollo de canela',
 '',
 7500, '🥐', '11111111-0000-0000-0000-000000000004', null, true),

('Pastel de Piña',
 '',
 7500, '🧁', '11111111-0000-0000-0000-000000000004', null, true),

('Pastel de ciruela y tocineta',
 '',
 7500, '🧁', '11111111-0000-0000-0000-000000000004', null, true),

('Pastel Gloria',
 '',
 7500, '🧁', '11111111-0000-0000-0000-000000000004', null, true),

('Galleta de Avena',
 '',
 5000, '🍪', '11111111-0000-0000-0000-000000000004', null, true),

('Galleta de Almendra',
 '',
 5000, '🍪', '11111111-0000-0000-0000-000000000004', null, true),

('Galleta Red Velvet',
 '',
 5000, '🍪', '11111111-0000-0000-0000-000000000004', null, true),

('Galleta Chips de chocolate',
 '',
 5000, '🍪', '11111111-0000-0000-0000-000000000004', null, true),

('Galleta Vainilla y yogurt',
 '',
 5000, '🍪', '11111111-0000-0000-0000-000000000004', null, true);
