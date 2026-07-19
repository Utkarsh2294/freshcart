import { pool } from '../config/database.js';

const productSelect = `
  SELECT
    p.id,
    p.name,
    p.category_id,
    p.brand_id,
    p.price::float AS price,
    COALESCE(p.mrp, p.price)::float AS mrp,
    p.unit,
    p.stock_qty,
    p.image_url,
    p.attributes,
    p.dietary_tags,
    c.name AS category,
    b.name AS brand,
    (p.stock_qty > 0) AS in_stock,
    GREATEST(
      0,
      ROUND(((COALESCE(p.mrp, p.price) - p.price) / NULLIF(COALESCE(p.mrp, p.price), 0) * 100)::numeric)
    )::int AS discount
`;

export const list = async (req, res, next) => {
  try {
    const {
      category,
      category_id,
      brand,
      search,
      sort,
      min_price,
      max_price,
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Number(page);
    const pageSize = Number(limit);
    const offset = (currentPage - 1) * pageSize;
    const values = [];
    const whereClauses = [];
    let valIndex = 1;
    let selectSql = productSelect;

    if (search) {
      selectSql += `,
        similarity(p.name, $${valIndex}) AS sml,
        ts_rank(p.search_vector, plainto_tsquery('english', $${valIndex})) AS rank
      `;
      whereClauses.push(`(
        p.name ILIKE $${valIndex + 1}
        OR similarity(p.name, $${valIndex}) > 0.2
        OR p.search_vector @@ plainto_tsquery('english', $${valIndex})
      )`);
      values.push(search, `%${search}%`);
      valIndex += 2;
    }

    const categoryFilter = category || category_id;
    if (categoryFilter) {
      whereClauses.push(`(
        p.category_id = $${valIndex}
        OR p.category_id IN (SELECT id FROM categories WHERE parent_id = $${valIndex})
      )`);
      values.push(categoryFilter);
      valIndex += 1;
    }

    if (brand) {
      whereClauses.push(`p.brand_id = $${valIndex}`);
      values.push(brand);
      valIndex += 1;
    }

    if (min_price !== undefined) {
      whereClauses.push(`p.price >= $${valIndex}`);
      values.push(min_price);
      valIndex += 1;
    }

    if (max_price !== undefined) {
      whereClauses.push(`p.price <= $${valIndex}`);
      values.push(max_price);
      valIndex += 1;
    }

    const fromSql = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
    `;
    const whereSql = whereClauses.length ? ` WHERE ${whereClauses.join(' AND ')}` : '';

    let orderSql = ' ORDER BY p.id DESC';
    if (search) {
      orderSql = ' ORDER BY sml DESC, rank DESC, p.name ASC';
    } else if (sort === 'deals') {
      orderSql = ' ORDER BY (COALESCE(p.mrp, p.price) - p.price) DESC, p.name ASC';
    } else if (sort === 'price_asc') {
      orderSql = ' ORDER BY p.price ASC, p.name ASC';
    } else if (sort === 'price_desc') {
      orderSql = ' ORDER BY p.price DESC, p.name ASC';
    } else if (sort === 'newest') {
      orderSql = ' ORDER BY p.id DESC';
    } else {
      orderSql = ' ORDER BY p.stock_qty DESC, p.name ASC';
    }

    const itemsSql = `${selectSql}${fromSql}${whereSql}${orderSql} LIMIT $${valIndex} OFFSET $${valIndex + 1}`;
    const result = await pool.query(itemsSql, [...values, pageSize, offset]);
    const countResult = await pool.query(`SELECT COUNT(p.id) AS total ${fromSql}${whereSql}`, values);
    const total = Number(countResult.rows[0]?.total || 0);

    res.json({
      data: result.rows,
      meta: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      ${productSelect},
      COALESCE(AVG(r.rating), 0)::float AS avg_rating,
      COUNT(r.id)::int AS review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.id = $1
      GROUP BY p.id, c.name, b.name
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const alsoBought = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productResult = await pool.query('SELECT category_id FROM products WHERE id = $1', [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const categoryId = productResult.rows[0].category_id;
    const query = `
      ${productSelect}
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.category_id = $1 AND p.id != $2
      ORDER BY p.stock_qty DESC, p.name ASC
      LIMIT 6
    `;
    const result = await pool.query(query, [categoryId, id]);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
