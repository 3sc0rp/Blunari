const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { body, param, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and JSON files are allowed.'), false);
    }
  }
});

// Validation middleware
const validateMenuUpload = [
  body('title').notEmpty().withMessage('Menu title is required'),
  body('title').isLength({ max: 255 }).withMessage('Menu title too long')
];

const validateMenuId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid menu ID')
];

// Helper function to parse CSV data
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Helper function to validate menu item data
const validateMenuItem = (item) => {
  const errors = [];
  
  if (!item.name || item.name.trim() === '') {
    errors.push('Item name is required');
  }
  
  if (!item.price || isNaN(parseFloat(item.price)) || parseFloat(item.price) <= 0) {
    errors.push('Valid price is required');
  }
  
  if (item.cost && (isNaN(parseFloat(item.cost)) || parseFloat(item.cost) < 0)) {
    errors.push('Cost must be a valid positive number');
  }
  
  return errors;
};

// POST /api/menu/upload - Upload menu file
router.post('/upload', upload.single('menuFile'), validateMenuUpload, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description } = req.body;
    const userId = req.user?.id || 1; // TODO: Get from auth middleware

    let menuData = [];

    // Parse file based on type
    if (req.file.mimetype === 'application/json') {
      try {
        menuData = JSON.parse(req.file.buffer.toString());
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON format'
        });
      }
    } else if (req.file.mimetype === 'text/csv' || req.file.originalname.endsWith('.csv')) {
      try {
        menuData = await parseCSV(req.file.buffer);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid CSV format',
          error: error.message
        });
      }
    }

    // Validate menu data
    if (!Array.isArray(menuData) || menuData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Menu data must be a non-empty array'
      });
    }

    // Validate each menu item
    const validationErrors = [];
    const validItems = [];

    menuData.forEach((item, index) => {
      const itemErrors = validateMenuItem(item);
      if (itemErrors.length > 0) {
        validationErrors.push({
          row: index + 1,
          errors: itemErrors
        });
      } else {
        validItems.push({
          name: item.name.trim(),
          description: item.description?.trim() || null,
          price: parseFloat(item.price),
          cost: item.cost ? parseFloat(item.cost) : 0,
          category: item.category?.trim() || 'Uncategorized',
          tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
          sales_count: item.sales_count ? parseInt(item.sales_count) : 0
        });
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors found in menu data',
        errors: validationErrors,
        validItemsCount: validItems.length
      });
    }

    // Start database transaction
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Create menu record
      const menuResult = await client.query(
        'INSERT INTO menus (user_id, title, description) VALUES ($1, $2, $3) RETURNING id',
        [userId, title, description]
      );
      const menuId = menuResult.rows[0].id;

      // Insert menu items
      for (const item of validItems) {
        await client.query(`
          INSERT INTO menu_items (menu_id, name, description, price, cost, category, tags, sales_count)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          menuId,
          item.name,
          item.description,
          item.price,
          item.cost,
          item.category,
          item.tags,
          item.sales_count
        ]);
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Menu uploaded successfully',
        data: {
          menuId,
          itemsProcessed: validItems.length,
          title
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Menu upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/menu/:id - Get menu by ID
router.get('/:id', validateMenuId, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu ID',
        errors: errors.array()
      });
    }

    const menuId = parseInt(req.params.id);
    
    // Get menu details
    const menuResult = await db.query(
      'SELECT * FROM menus WHERE id = $1',
      [menuId]
    );

    if (menuResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // Get menu items
    const itemsResult = await db.query(`
      SELECT 
        id, name, description, price, cost, category, tags, 
        sales_count, profit_margin, is_available, created_at
      FROM menu_items 
      WHERE menu_id = $1 
      ORDER BY category, name
    `, [menuId]);

    const menu = menuResult.rows[0];
    const items = itemsResult.rows;

    // Calculate menu statistics
    const stats = {
      totalItems: items.length,
      avgPrice: items.reduce((sum, item) => sum + parseFloat(item.price), 0) / items.length,
      avgMargin: items.reduce((sum, item) => sum + (parseFloat(item.profit_margin) || 0), 0) / items.length,
      totalSales: items.reduce((sum, item) => sum + item.sales_count, 0),
      categories: [...new Set(items.map(item => item.category))]
    };

    res.json({
      success: true,
      data: {
        menu: {
          ...menu,
          stats
        },
        items
      }
    });

  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/menu/:id/insights - Get AI insights for menu
router.get('/:id/insights', validateMenuId, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu ID',
        errors: errors.array()
      });
    }

    const menuId = parseInt(req.params.id);
    
    // Get menu items with sales data
    const itemsResult = await db.query(`
      SELECT 
        id, name, price, cost, category, sales_count, profit_margin
      FROM menu_items 
      WHERE menu_id = $1 AND is_available = true
      ORDER BY sales_count DESC
    `, [menuId]);

    if (itemsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found or has no items'
      });
    }

    const items = itemsResult.rows;
    
    // Generate AI insights (mock implementation for MVP)
    const insights = {
      overview: {
        totalRevenue: items.reduce((sum, item) => sum + (parseFloat(item.price) * item.sales_count), 0),
        avgProfitMargin: items.reduce((sum, item) => sum + (parseFloat(item.profit_margin) || 0), 0) / items.length,
        topPerformer: items[0]?.name || 'No sales data',
        totalItems: items.length
      },
      recommendations: [
        {
          type: 'pricing',
          priority: 'high',
          title: 'Optimize High-Margin Items',
          description: 'Consider promoting items with profit margins above 30%',
          affectedItems: items.filter(item => parseFloat(item.profit_margin) > 30).length,
          potentialImpact: 'Revenue increase of 8-12%'
        },
        {
          type: 'menu_engineering',
          priority: 'medium',
          title: 'Remove Low Performers',
          description: 'Items with less than 10 sales may be candidates for removal',
          affectedItems: items.filter(item => item.sales_count < 10).length,
          potentialImpact: 'Cost reduction of 5-8%'
        },
        {
          type: 'positioning',
          priority: 'medium',
          title: 'Highlight Popular Items',
          description: 'Feature your top-selling items more prominently',
          affectedItems: Math.min(5, items.length),
          potentialImpact: 'Sales increase of 10-15%'
        }
      ],
      itemAnalysis: items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        performance: item.sales_count > 50 ? 'excellent' : 
                    item.sales_count > 20 ? 'good' : 
                    item.sales_count > 5 ? 'average' : 'poor',
        profitability: parseFloat(item.profit_margin) > 40 ? 'high' :
                      parseFloat(item.profit_margin) > 20 ? 'medium' : 'low',
        recommendations: generateItemRecommendations(item)
      }))
    };

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to generate item-specific recommendations
function generateItemRecommendations(item) {
  const recommendations = [];
  const margin = parseFloat(item.profit_margin) || 0;
  const sales = item.sales_count;

  if (margin < 20) {
    recommendations.push('Consider reducing costs or increasing price');
  }
  
  if (sales < 10) {
    recommendations.push('Low sales - consider removing or repositioning');
  } else if (sales > 100) {
    recommendations.push('High performer - consider featuring prominently');
  }
  
  if (margin > 40 && sales > 50) {
    recommendations.push('Star item - excellent profit and popularity');
  }

  return recommendations;
}

// GET /api/menu - Get all menus for user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || 1; // TODO: Get from auth middleware
    
    const result = await db.query(`
      SELECT 
        m.*,
        COUNT(mi.id) as item_count,
        AVG(mi.price) as avg_price,
        SUM(mi.sales_count) as total_sales
      FROM menus m
      LEFT JOIN menu_items mi ON m.id = mi.menu_id
      WHERE m.user_id = $1
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/menu/:id - Delete menu
router.delete('/:id', validateMenuId, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu ID',
        errors: errors.array()
      });
    }

    const menuId = parseInt(req.params.id);
    
    const result = await db.query(
      'DELETE FROM menus WHERE id = $1 RETURNING id',
      [menuId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;