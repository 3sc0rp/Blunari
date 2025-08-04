const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seedData = async () => {
  try {
    console.log('🌱 Seeding database with sample data...');

    // Create sample user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const userResult = await db.query(`
      INSERT INTO users (email, password, restaurant_name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET
        restaurant_name = EXCLUDED.restaurant_name
      RETURNING id
    `, ['demo@menuiq.com', hashedPassword, 'The Golden Spoon', 'owner']);

    const userId = userResult.rows[0].id;
    console.log('✅ Demo user created/updated');

    // Create sample menu
    const menuResult = await db.query(`
      INSERT INTO menus (user_id, title, description)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [userId, 'Main Menu', 'Our signature dining menu featuring seasonal favorites']);

    const menuId = menuResult.rows[0].id;
    console.log('✅ Sample menu created');

    // Sample menu items
    const menuItems = [
      {
        name: 'Grilled Atlantic Salmon',
        description: 'Fresh salmon fillet with lemon herb butter, served with seasonal vegetables',
        price: 28.99,
        cost: 12.50,
        category: 'Main Course',
        tags: ['seafood', 'healthy', 'gluten-free'],
        sales_count: 89
      },
      {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with house-made croutons and parmesan',
        price: 14.99,
        cost: 4.25,
        category: 'Appetizer',
        tags: ['vegetarian', 'classic'],
        sales_count: 127
      },
      {
        name: 'Beef Tenderloin',
        description: '8oz premium beef tenderloin with red wine reduction',
        price: 42.99,
        cost: 18.75,
        category: 'Main Course',
        tags: ['premium', 'beef'],
        sales_count: 67
      },
      {
        name: 'Mushroom Risotto',
        description: 'Creamy arborio rice with wild mushrooms and truffle oil',
        price: 22.99,
        cost: 8.50,
        category: 'Main Course',
        tags: ['vegetarian', 'italian'],
        sales_count: 45
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
        price: 12.99,
        cost: 3.75,
        category: 'Dessert',
        tags: ['dessert', 'chocolate'],
        sales_count: 93
      },
      {
        name: 'Pan-Seared Duck Breast',
        description: 'Herb-crusted duck breast with cherry gastrique',
        price: 36.99,
        cost: 16.25,
        category: 'Main Course',
        tags: ['poultry', 'premium'],
        sales_count: 34
      },
      {
        name: 'Caprese Salad',
        description: 'Fresh mozzarella, tomatoes, and basil with balsamic glaze',
        price: 16.99,
        cost: 5.50,
        category: 'Appetizer',
        tags: ['vegetarian', 'fresh'],
        sales_count: 78
      },
      {
        name: 'Lobster Bisque',
        description: 'Rich and creamy lobster soup with cognac',
        price: 18.99,
        cost: 8.25,
        category: 'Appetizer',
        tags: ['seafood', 'soup'],
        sales_count: 56
      },
      {
        name: 'Vegetarian Pasta',
        description: 'Penne pasta with roasted vegetables and pesto sauce',
        price: 19.99,
        cost: 6.75,
        category: 'Main Course',
        tags: ['vegetarian', 'pasta'],
        sales_count: 41
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers',
        price: 10.99,
        cost: 3.25,
        category: 'Dessert',
        tags: ['dessert', 'italian', 'coffee'],
        sales_count: 62
      }
    ];

    // Insert menu items
    for (const item of menuItems) {
      await db.query(`
        INSERT INTO menu_items (
          menu_id, name, description, price, cost, category, tags, sales_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        menuId,
        item.tags,
        item.sales_count
      ]);
    }

    console.log('✅ Sample menu items created');

    // Get some statistics
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_items,
        AVG(price) as avg_price,
        AVG(profit_margin) as avg_margin,
        SUM(sales_count) as total_sales
      FROM menu_items 
      WHERE menu_id = $1
    `, [menuId]);

    const stats = statsResult.rows[0];
    
    console.log('📊 Seed Summary:');
    console.log(`   • Total items: ${stats.total_items}`);
    console.log(`   • Average price: ${parseFloat(stats.avg_price).toFixed(2)}`);
    console.log(`   • Average margin: ${parseFloat(stats.avg_margin).toFixed(1)}%`);
    console.log(`   • Total sales: ${stats.total_sales}`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('🔑 Demo login credentials:');
    console.log('   Email: demo@menuiq.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seeding completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedData;name,
        item.description,
        item.price,
        item.cost,
        item.category,
        item.