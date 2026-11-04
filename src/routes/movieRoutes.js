const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

// Endpoint sesuai tabel referensi Mission Intermediate BE 2
router.get('/movies', movieController.getAllMovies);
router.get('/movie/:id', movieController.getMovieById);
router.patch('/movie/:id', movieController.updateMovieById);
router.put('/movie/:id', movieController.updateMovieById);
router.delete('/movie/:id', movieController.deleteMovieById);
router.post('/movie', movieController.addMovie);

// Endpoint query berdasarkan atribut lain (misal: /movies/attribute/type/movie)
router.get('/movies/attribute/:attribute/:value', movieController.getMoviesByAttribute);

// Dukungan langsung tanpa :id dan alias plural agar tinggal klik Send di Postman/Hoppscotch
router.get('/movie', movieController.getAllMovies);
router.patch('/movie', movieController.updateMovieById);
router.put('/movie', movieController.updateMovieById);
router.delete('/movie', movieController.deleteMovieById);

router.get('/movies/:id', movieController.getMovieById);
router.patch('/movies/:id', movieController.updateMovieById);
router.put('/movies/:id', movieController.updateMovieById);
router.delete('/movies/:id', movieController.deleteMovieById);
router.post('/movies', movieController.addMovie);
router.patch('/movies', movieController.updateMovieById);
router.put('/movies', movieController.updateMovieById);
router.delete('/movies', movieController.deleteMovieById);

module.exports = router;
