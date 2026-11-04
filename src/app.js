const path = require('path');
const express = require('express');
const cors = require('cors');
const movieRoutes = require('./routes/movieRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/postman', express.static(path.join(__dirname, '../postman')));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/info', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Chill Movie App REST API - Mission Intermediate Backend 2B',
    endpoints: {
      listAllMovies: 'GET /movies',
      getMovieById: 'GET /movie/:id',
      getMoviesByAttribute: 'GET /movies/attribute/:attribute/:value',
      addMovie: 'POST /movie',
      updateMoviePatch: 'PATCH /movie/:id',
      updateMoviePut: 'PUT /movie/:id',
      deleteMovie: 'DELETE /movie/:id',
    },
  });
});

app.use('/', movieRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

module.exports = app;
