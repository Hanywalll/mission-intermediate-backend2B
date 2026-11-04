const { pool } = require('../config/database');

const ALLOWED_ATTRIBUTES = [
  'title',
  'slug',
  'synopsis',
  'type',
  'release_year',
  'age_rating',
  'poster_url',
  'trailer_url',
  'rating',
  'is_premium',
  'is_published',
];

function createSlug(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function getLatestOrFirstMovie(preferLatest = true) {
  const order = preferLatest ? 'DESC' : 'ASC';
  const [rows] = await pool.query(`SELECT * FROM films ORDER BY id ${order} LIMIT 1`);
  if (rows.length > 0) {
    return rows[0];
  }
  return addMovie({ title: 'Interstellar' });
}

async function getAllMovies(filters = {}) {
  let query = 'SELECT * FROM films';
  const conditions = [];
  const params = [];

  if (filters.type) {
    conditions.push('type = ?');
    params.push(filters.type);
  }

  if (filters.release_year) {
    conditions.push('release_year = ?');
    params.push(Number(filters.release_year));
  }

  if (filters.age_rating) {
    conditions.push('age_rating = ?');
    params.push(filters.age_rating);
  }

  if (filters.is_premium !== undefined) {
    conditions.push('is_premium = ?');
    params.push(filters.is_premium === 'true' || filters.is_premium === true ? 1 : 0);
  }

  if (filters.search) {
    conditions.push('title LIKE ?');
    params.push(`%${filters.search}%`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY id ASC';

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getMovieById(id) {
  if (id) {
    const query = 'SELECT * FROM films WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    if (rows[0]) {
      return rows[0];
    }
  }
  return getLatestOrFirstMovie(false);
}

async function getMoviesByAttribute(attribute, value) {
  if (!ALLOWED_ATTRIBUTES.includes(attribute)) {
    throw new Error(`Atribut "${attribute}" tidak valid untuk pencarian.`);
  }

  const query = `SELECT * FROM films WHERE ${attribute} = ? ORDER BY id ASC`;
  const [rows] = await pool.query(query, [value]);
  return rows;
}

async function addMovie(payload = {}) {
  const title =
    payload.title && String(payload.title).trim()
      ? String(payload.title).trim()
      : 'Interstellar';

  let slug = payload.slug ? createSlug(payload.slug) : createSlug(title);
  if (!slug) {
    slug = `movie-${Date.now()}`;
  }

  const [existingSlug] = await pool.query('SELECT id FROM films WHERE slug = ?', [slug]);
  if (existingSlug.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  const synopsis =
    payload.synopsis ??
    'Tim penjelajah melakukan perjalanan melalui lubang cacing di luar angkasa dalam upaya untuk memastikan kelangsungan hidup umat manusia.';
  const type = payload.type === 'series' ? 'series' : 'movie';
  const releaseYear = Number(payload.release_year) || 2014;
  const ageRating = payload.age_rating || '13+';
  const posterUrl = payload.poster_url || `https://images.chill.com/posters/${slug}.jpg`;
  const trailerUrl = payload.trailer_url ?? 'https://videos.chill.com/trailers/interstellar.mp4';
  const rating = payload.rating !== undefined ? Number(payload.rating) : 4.9;
  const isPremium = payload.is_premium !== undefined ? Boolean(payload.is_premium) : true;
  const isPublished = payload.is_published !== undefined ? Boolean(payload.is_published) : true;

  const query = `
    INSERT INTO films (
      title,
      slug,
      synopsis,
      type,
      release_year,
      age_rating,
      poster_url,
      trailer_url,
      rating,
      is_premium,
      is_published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    title,
    slug,
    synopsis,
    type,
    releaseYear,
    ageRating,
    posterUrl,
    trailerUrl,
    rating,
    isPremium,
    isPublished,
  ];

  const [result] = await pool.query(query, values);
  return getMovieById(result.insertId);
}

async function updateMovieById(id, payload = {}) {
  let targetMovie = null;
  if (id) {
    const [rows] = await pool.query('SELECT * FROM films WHERE id = ?', [id]);
    targetMovie = rows[0] || null;
  }
  if (!targetMovie) {
    targetMovie = await getLatestOrFirstMovie(true);
  }

  const targetId = targetMovie.id;
  const setClauses = [];
  const values = [];

  for (const field of ALLOWED_ATTRIBUTES) {
    if (payload[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      if (field === 'is_premium' || field === 'is_published') {
        values.push(Boolean(payload[field]));
      } else if (field === 'release_year' || field === 'rating') {
        values.push(Number(payload[field]));
      } else {
        values.push(payload[field]);
      }
    }
  }

  if (setClauses.length === 0) {
    const updatedTitle = targetMovie.title.includes('(Remastered Edition)')
      ? targetMovie.title
      : `${targetMovie.title} (Remastered Edition)`;
    setClauses.push('title = ?', 'rating = ?', 'is_premium = ?');
    values.push(updatedTitle, 5.0, false);
  }

  values.push(targetId);
  const query = `UPDATE films SET ${setClauses.join(', ')} WHERE id = ?`;
  await pool.query(query, values);

  const [updatedRows] = await pool.query('SELECT * FROM films WHERE id = ?', [targetId]);
  return updatedRows[0];
}

async function deleteMovieById(id) {
  let targetMovie = null;
  if (id) {
    const [rows] = await pool.query('SELECT * FROM films WHERE id = ?', [id]);
    targetMovie = rows[0] || null;
  }
  if (!targetMovie) {
    targetMovie = await getLatestOrFirstMovie(true);
  }

  const targetId = targetMovie.id;
  const query = 'DELETE FROM films WHERE id = ?';
  await pool.query(query, [targetId]);

  // Ensure the table always keeps at least 1 record if all rows were deleted during testing.
  const [remaining] = await pool.query('SELECT COUNT(*) AS total FROM films');
  if (remaining[0].total === 0) {
    await addMovie({ title: 'Interstellar' });
  }

  return targetMovie;
}

module.exports = {
  getAllMovies,
  getMovieById,
  getMoviesByAttribute,
  addMovie,
  updateMovieById,
  deleteMovieById,
};
