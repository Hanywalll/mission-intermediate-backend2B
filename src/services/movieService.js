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
  const query = 'SELECT * FROM films WHERE id = ?';
  const [rows] = await pool.query(query, [id]);
  return rows[0] || null;
}

async function getMoviesByAttribute(attribute, value) {
  if (!ALLOWED_ATTRIBUTES.includes(attribute)) {
    throw new Error(`Atribut "${attribute}" tidak valid untuk pencarian.`);
  }

  const query = `SELECT * FROM films WHERE ${attribute} = ? ORDER BY id ASC`;
  const [rows] = await pool.query(query, [value]);
  return rows;
}

async function addMovie(payload) {
  const title = payload.title ? String(payload.title).trim() : '';
  if (!title) {
    const error = new Error('Field "title" wajib diisi.');
    error.statusCode = 400;
    throw error;
  }

  let slug = payload.slug ? createSlug(payload.slug) : createSlug(title);
  if (!slug) {
    slug = `movie-${Date.now()}`;
  }

  // Append a timestamp suffix when the generated slug is already taken.
  const [existingSlug] = await pool.query('SELECT id FROM films WHERE slug = ?', [slug]);
  if (existingSlug.length > 0 && !payload.slug) {
    slug = `${slug}-${Date.now()}`;
  }

  const synopsis = payload.synopsis ?? 'Sinopsis belum tersedia.';
  const type = payload.type === 'series' ? 'series' : 'movie';
  const releaseYear = Number(payload.release_year) || new Date().getFullYear();
  const ageRating = payload.age_rating || '13+';
  const posterUrl = payload.poster_url || `https://images.chill.com/posters/${slug}.jpg`;
  const trailerUrl = payload.trailer_url ?? null;
  const rating = payload.rating !== undefined ? Number(payload.rating) : 0.0;
  const isPremium = payload.is_premium !== undefined ? Boolean(payload.is_premium) : false;
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

async function updateMovieById(id, payload) {
  const existingMovie = await getMovieById(id);
  if (!existingMovie) {
    return null;
  }

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
    const error = new Error('Tidak ada field valid yang dikirim untuk diperbarui.');
    error.statusCode = 400;
    throw error;
  }

  values.push(id);
  const query = `UPDATE films SET ${setClauses.join(', ')} WHERE id = ?`;
  await pool.query(query, values);

  return getMovieById(id);
}

async function deleteMovieById(id) {
  const existingMovie = await getMovieById(id);
  if (!existingMovie) {
    return null;
  }

  const query = 'DELETE FROM films WHERE id = ?';
  await pool.query(query, [id]);
  return existingMovie;
}

module.exports = {
  getAllMovies,
  getMovieById,
  getMoviesByAttribute,
  addMovie,
  updateMovieById,
  deleteMovieById,
};
