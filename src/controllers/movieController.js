const movieService = require('../services/movieService');

async function getAllMovies(req, res) {
  try {
    const movies = await movieService.getAllMovies(req.query);
    return res.status(200).json({
      status: 'success',
      message: 'Berhasil mengambil semua data movie.',
      total: movies.length,
      data: movies,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data movie.',
      error: error.message,
    });
  }
}

async function getMovieById(req, res) {
  try {
    const id = req.params.id ? Number(req.params.id) : null;
    const movie = await movieService.getMovieById(id);

    return res.status(200).json({
      status: 'success',
      message: `Berhasil mengambil data movie dengan id ${movie.id}.`,
      data: movie,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil detail movie.',
      error: error.message,
    });
  }
}

async function getMoviesByAttribute(req, res) {
  try {
    const { attribute, value } = req.params;
    const movies = await movieService.getMoviesByAttribute(attribute, value);

    return res.status(200).json({
      status: 'success',
      message: `Berhasil mengambil data movie berdasarkan ${attribute} = ${value}.`,
      total: movies.length,
      data: movies,
    });
  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
}

async function addMovie(req, res) {
  try {
    const payload = {
      ...req.query,
      ...(req.body && typeof req.body === 'object' ? req.body : {}),
    };
    const newMovie = await movieService.addMovie(payload);
    return res.status(201).json({
      status: 'success',
      message: 'Berhasil menambahkan data movie baru.',
      data: newMovie,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: statusCode < 500 ? 'fail' : 'error',
      message: error.message || 'Gagal menambahkan data movie.',
    });
  }
}

async function updateMovieById(req, res) {
  try {
    const id = req.params.id ? Number(req.params.id) : null;
    const payload = {
      ...req.query,
      ...(req.body && typeof req.body === 'object' ? req.body : {}),
    };

    const updatedMovie = await movieService.updateMovieById(id, payload);

    return res.status(200).json({
      status: 'success',
      message: `Berhasil mengubah data movie dengan id ${updatedMovie.id}.`,
      data: updatedMovie,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: statusCode < 500 ? 'fail' : 'error',
      message: error.message || 'Gagal mengubah data movie.',
    });
  }
}

async function deleteMovieById(req, res) {
  try {
    const id = req.params.id ? Number(req.params.id) : null;
    const deletedMovie = await movieService.deleteMovieById(id);

    return res.status(200).json({
      status: 'success',
      message: `Berhasil menghapus data movie dengan id ${deletedMovie.id}.`,
      data: deletedMovie,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus data movie.',
      error: error.message,
    });
  }
}

module.exports = {
  getAllMovies,
  getMovieById,
  getMoviesByAttribute,
  addMovie,
  updateMovieById,
  deleteMovieById,
};
