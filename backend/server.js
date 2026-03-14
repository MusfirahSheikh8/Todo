require('dotenv').config({ override: true });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.API_KEY || 'changeme';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Please set DATABASE_URL in .env');
  console.log("ENV DATABASE_URL:", process.env.DATABASE_URL);
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

function apiKeyMiddleware(req, res, next) {
  const key = req.header('x-api-key');
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
}

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['todo', 'in_progress', 'done'];

app.post('/tasks', apiKeyMiddleware, async (req, res) => {
  try {
    const { title, description = null, priority = 'medium', status = 'todo', deadline = null } = req.body;
    if (!title || typeof title !== 'string') return res.status(400).json({ error: 'title is required' });
    if (!PRIORITIES.includes(priority)) return res.status(400).json({ error: 'invalid priority' });
    if (!STATUSES.includes(status)) return res.status(400).json({ error: 'invalid status' });

    const query = `
      INSERT INTO tasks (title, description, priority, status, deadline)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
    `;
    const values = [title, description, priority, status, deadline];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});
console.log("DATABASE_URL:", DATABASE_URL);
app.get('/tasks', apiKeyMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      per_page = 10,
      status,
      priority,
      search,
      due_before,
      due_after,
      sort_by = 'created_at',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPageNum = Math.max(1, Math.min(100, parseInt(per_page, 10) || 10));
    const offset = (pageNum - 1) * perPageNum;

    const allowedSortBy = ['deadline', 'created_at'];
    const sortBy = allowedSortBy.includes(sort_by) ? sort_by : 'created_at';
    const orderLower = (order || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const filters = [];
    const values = [];
    let idx = 1;

    if (status === 'overdue') {
      // Overdue = deadline has passed and task is not done
      filters.push(`deadline < NOW()`);
      filters.push(`status != 'done'`);
    } else if (status && STATUSES.includes(status)) {
      filters.push(`status = $${idx++}`);
      values.push(status);
    }
    if (priority && PRIORITIES.includes(priority)) {
      filters.push(`priority = $${idx++}`);
      values.push(priority);
    }
    if (search && search.trim()) {
      filters.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    if (due_before) {
      filters.push(`deadline <= $${idx++}`);
      values.push(due_before);
    }
    if (due_after) {
      filters.push(`deadline >= $${idx++}`);
      values.push(due_after);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM tasks ${where}`;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const dataQuery = `
      SELECT * FROM tasks
      ${where}
      ORDER BY ${sortBy} ${orderLower}, id ${orderLower}
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(perPageNum, offset);
    const dataRes = await pool.query(dataQuery, values);

    res.json({
      total,
      page: pageNum,
      per_page: perPageNum,
      total_pages: Math.ceil(total / perPageNum),
      tasks: dataRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/tasks/:id', apiKeyMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.put('/tasks/:id', apiKeyMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description = null, priority, status, deadline = null } = req.body;
    if (!title || typeof title !== 'string') return res.status(400).json({ error: 'title is required' });
    if (priority && !PRIORITIES.includes(priority)) return res.status(400).json({ error: 'invalid priority' });
    if (status && !STATUSES.includes(status)) return res.status(400).json({ error: 'invalid status' });

    const query = `
      UPDATE tasks
      SET title = $1, description = $2, priority = $3, status = $4, deadline = $5, updated_at = now()
      WHERE id = $6
      RETURNING *
    `;
    const values = [title, description, priority || 'medium', status || 'todo', deadline, id];
    const { rows } = await pool.query(query, values);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.patch('/tasks/:id', apiKeyMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, priority, status, deadline } = req.body;

    const sets = [];
    const values = [];
    let idx = 1;
    if (title !== undefined) {
      sets.push(`title = $${idx++}`);
      values.push(title);
    }
    if (description !== undefined) {
      sets.push(`description = $${idx++}`);
      values.push(description);
    }
    if (priority !== undefined) {
      if (!PRIORITIES.includes(priority)) return res.status(400).json({ error: 'invalid priority' });
      sets.push(`priority = $${idx++}`);
      values.push(priority);
    }
    if (status !== undefined) {
      if (!STATUSES.includes(status)) return res.status(400).json({ error: 'invalid status' });
      sets.push(`status = $${idx++}`);
      values.push(status);
    }
    if (deadline !== undefined) {
      sets.push(`deadline = $${idx++}`);
      values.push(deadline);
    }

    if (!sets.length) return res.status(400).json({ error: 'nothing to update' });

    const query = `
      UPDATE tasks
      SET ${sets.join(', ')}, updated_at = now()
      WHERE id = $${idx}
      RETURNING *
    `;
    values.push(id);

    const { rows } = await pool.query(query, values);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.delete('/tasks/:id', apiKeyMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
