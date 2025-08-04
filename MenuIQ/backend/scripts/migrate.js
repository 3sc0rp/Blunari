const db = require('../config/database');

const createTables = async () => {
  try {
    console.log('🔄 Running database migrations...');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'owner',
        restaurant_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created/verified');

    // Create menus table
    await db.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Menus table created/verified');

    // Create menu_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        cost NUMERIC(10,2) DEFAULT 0,
        category TEXT,
        tags TEXT[],
        sales_count INTEGER DEFAULT 0,
        profit_margin NUMERIC(5,2) GENERATED ALWAYS AS (
          CASE 
            WHEN cost > 0 THEN ((price - cost) / price * 100)
            ELSE 0
          END
        ) STORED,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Menu items table created/verified');

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_menus_user_id ON menus(user_id);
      CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON menu_items(menu_id);
      CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
      CREATE INDEX IF NOT EXISTS idx_menu_items_price ON menu_items(price);
      CREATE INDEX IF NOT EXISTS idx_menu_items_sales_count ON menu_items(sales_count);
    `);
    console.log('✅ Database indexes created/verified');

    // Create updated_at trigger function
    await db.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    await db.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
      CREATE TRIGGER update_menus_updated_at
        BEFORE UPDATE ON menus
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
      CREATE TRIGGER update_menu_items_updated_at
        BEFORE UPDATE ON menu_items
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Database triggers created/verified');

    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Migration completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = createTables;