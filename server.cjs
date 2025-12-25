// server.cjs

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- ADMIN AUTH CONFIG ---------- */
// change these three values when you want different URL / username / password
const ADMIN_PATH = '/admin';      // URL path for admin page
const ADMIN_USER = 'lokmada';     // admin username
const ADMIN_PASS = 'secret123';   // admin password

function adminAuth(req, res, next) {
  const reject = () => {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.sendStatus(401);
  };

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return reject();
  }

  const base64 = authHeader.replace('Basic ', '');
  const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return next();
  }
  return reject();
}

/* ---------- COMMON MIDDLEWARE ---------- */

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ensure uploads folder
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* ========== MENU ========== */

/** MENU with category image **/
app.get('/api/menu', (req, res) => {
  const query = `
    SELECT
      c.id as cat_id,
      c.name as cat_name,
      c.image_url as cat_image,
      p.id as prod_id,
      p.name as prod_name,
      p.description,
      p.image_url,
      p.is_available,
      pp.id as price_id,
      pp.size,
      pp.price_value
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    LEFT JOIN product_prices pp ON p.id = pp.product_id
    ORDER BY c.id, p.id
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });

    const menuMap = new Map();

    rows.forEach((row) => {
      if (!menuMap.has(row.cat_id)) {
        menuMap.set(row.cat_id, {
          id: row.cat_id,
          name: row.cat_name,
          image: row.cat_image || '',
          productsMap: new Map(),
        });
      }

      const cat = menuMap.get(row.cat_id);

      if (row.prod_id && row.is_available === 1) {
        if (!cat.productsMap.has(row.prod_id)) {
          cat.productsMap.set(row.prod_id, {
            id: row.prod_id,
            name: row.prod_name,
            description: row.description || '',
            image: row.image_url || '',
            prices: [],
          });
        }

        const prod = cat.productsMap.get(row.prod_id);
        if (row.price_id) {
          prod.prices.push({ label: row.size, value: row.price_value });
        }
      }
    });

    const result = Array.from(menuMap.values()).map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
      products: Array.from(cat.productsMap.values()),
    }));

    res.json(result);
  });
});

/* ========== CATEGORIES ========== */

// list
app.get('/api/categories', (req, res) => {
  db.all(
    'SELECT id, name, image_url FROM categories ORDER BY name ASC',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// create
app.post('/api/categories', upload.single('image'), (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name required' });
  }
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  db.run(
    'INSERT INTO categories (name, image_url) VALUES (?, ?)',
    [name.trim(), imageUrl],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID, name: name.trim(), image_url: imageUrl });
    }
  );
});

// update (name and optional new image)
app.put('/api/categories/:id', upload.single('image'), (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name required' });
  }

  if (!imageUrl) {
    db.run(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name.trim(), id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  } else {
    db.run(
      'UPDATE categories SET name = ?, image_url = ? WHERE id = ?',
      [name.trim(), imageUrl, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, image_url: imageUrl });
      }
    );
  }
});

// delete
app.delete('/api/categories/:id', (req, res) => {
  db.run('DELETE FROM categories WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

/* ========== PRODUCTS ========== */

// create
app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, description, categoryid, prices } = req.body;
  if (!name || !categoryid) {
    return res.status(400).json({ error: 'Name and category required' });
  }
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
  let parsedPrices = [];
  try {
    parsedPrices = JSON.parse(prices || '[]');
  } catch (e) {
    return res.status(400).json({ error: 'Invalid prices JSON' });
  }

  db.run(
    'INSERT INTO products (name, description, image_url, category_id, is_available) VALUES (?, ?, ?, ?, 1)',
    [name.trim(), description || '', imageUrl, categoryid],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const productId = this.lastID;
      const stmt = db.prepare(
        'INSERT INTO product_prices (product_id, size, price_value) VALUES (?, ?, ?)'
      );
      parsedPrices.forEach((p) => {
        if (p.label !== undefined && p.value) {
          stmt.run(productId, p.label, p.value);
        }
      });
      stmt.finalize();
      res.json({ id: productId, success: true });
    }
  );
});

// update (all fields + prices, optional new image)
app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const id = req.params.id;
  const { name, description, categoryid, prices } = req.body;
  if (!name || !categoryid) {
    return res.status(400).json({ error: 'Name and category required' });
  }
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  let parsedPrices = [];
  try {
    parsedPrices = JSON.parse(prices || '[]');
  } catch (e) {
    return res.status(400).json({ error: 'Invalid prices JSON' });
  }

  const updateBase = () => {
    db.run(
      'DELETE FROM product_prices WHERE product_id = ?',
      [id],
      (errDel) => {
        if (errDel) return res.status(500).json({ error: errDel.message });

        const stmt = db.prepare(
          'INSERT INTO product_prices (product_id, size, price_value) VALUES (?, ?, ?)'
        );
        parsedPrices.forEach((p) => {
          if (p.label !== undefined && p.value) {
            stmt.run(id, p.label, p.value);
          }
        });
        stmt.finalize();
        res.json({ success: true });
      }
    );
  };

  if (!imageUrl) {
    db.run(
      'UPDATE products SET name = ?, description = ?, category_id = ? WHERE id = ?',
      [name.trim(), description || '', categoryid, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        updateBase();
      }
    );
  } else {
    db.run(
      'UPDATE products SET name = ?, description = ?, image_url = ?, category_id = ? WHERE id = ?',
      [name.trim(), description || '', imageUrl, categoryid, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        updateBase();
      }
    );
  }
});

// delete
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

/* ---------- FRONTEND STATIC (React build) ---------- */

// path to Vite build output
const clientBuildPath = path.join(__dirname, 'dist');

// serve built static files
app.use(express.static(clientBuildPath));

// root -> React index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

/* ---------- ADMIN & STATIC ROUTES ---------- */

// protected admin page
app.get(ADMIN_PATH, adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// (optional) any other static files in project root
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin at http://localhost:${PORT}${ADMIN_PATH}`);
});
