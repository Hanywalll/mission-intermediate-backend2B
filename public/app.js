(function () {
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');

  const movieListEl = document.getElementById('movie-list');
  const loadingBox = document.getElementById('catalog-status-loading');
  const errorBox = document.getElementById('catalog-status-error');
  const errorMsgEl = document.getElementById('catalog-error-message');
  const emptyBox = document.getElementById('catalog-status-empty');

  const filterForm = document.getElementById('filter-form');
  const filterSearch = document.getElementById('filter-search');
  const filterType = document.getElementById('filter-type');
  const filterId = document.getElementById('filter-id');
  const btnResetFilter = document.getElementById('btn-reset-filter');
  const btnEmptyReset = document.getElementById('btn-empty-reset');
  const btnRefreshAll = document.getElementById('btn-refresh-all');
  const btnRetryLoad = document.getElementById('btn-retry-load');

  const movieForm = document.getElementById('movie-form');
  const movieIdInput = document.getElementById('movie-id');
  const inputTitle = document.getElementById('input-title');
  const inputSlug = document.getElementById('input-slug');
  const inputType = document.getElementById('input-type');
  const inputYear = document.getElementById('input-year');
  const inputAge = document.getElementById('input-age');
  const inputRating = document.getElementById('input-rating');
  const inputPoster = document.getElementById('input-poster');
  const inputTrailer = document.getElementById('input-trailer');
  const inputSynopsis = document.getElementById('input-synopsis');
  const inputPremium = document.getElementById('input-premium');
  const inputPublished = document.getElementById('input-published');

  const formModeDesc = document.getElementById('form-mode-desc');
  const btnSubmitForm = document.getElementById('btn-submit-form');
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  const btnFillSample = document.getElementById('btn-fill-sample');
  const formFeedback = document.getElementById('form-feedback');

  const metaEndpoint = document.getElementById('meta-endpoint');
  const metaStatus = document.getElementById('meta-status');
  const metaSql = document.getElementById('meta-sql');
  const inspectorRequest = document.getElementById('inspector-request');
  const inspectorResponse = document.getElementById('inspector-response');
  const btnCopyJson = document.getElementById('btn-copy-json');

  const deleteModal = document.getElementById('delete-modal');
  const deleteTargetTitle = document.getElementById('delete-target-title');
  const deleteTargetId = document.getElementById('delete-target-id');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');

  let pendingDeleteId = null;
  let lastFocusedElement = null;

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    themeToggleBtn.setAttribute('aria-pressed', String(isDark));
    themeToggleBtn.textContent = isDark ? 'Mode Terang' : 'Mode Gelap';
    try {
      localStorage.setItem('chill_workbench_theme', theme);
    } catch (_) {
      // Ignore storage error in restricted environments
    }
  }

  const savedTheme = (function () {
    try {
      return localStorage.getItem('chill_workbench_theme');
    } catch (_) {
      return null;
    }
  })();
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

  themeToggleBtn.addEventListener('click', function () {
    const current = htmlEl.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  function updateInspector(info) {
    metaEndpoint.textContent = info.method + ' ' + info.url;
    metaStatus.textContent = info.status + ' ' + (info.ok ? 'OK' : 'ERROR');
    metaSql.textContent = info.sql;
    inspectorRequest.textContent = info.requestBody
      ? JSON.stringify(info.requestBody, null, 2)
      : 'Tidak ada body payload (Request ' + info.method + ')';
    inspectorResponse.textContent = JSON.stringify(info.responseBody, null, 2);
  }

  function setCatalogViewState(state, errorMessage) {
    loadingBox.hidden = state !== 'loading';
    errorBox.hidden = state !== 'error';
    emptyBox.hidden = state !== 'empty';
    movieListEl.hidden = state !== 'data';
    if (state === 'error' && errorMessage) {
      errorMsgEl.textContent = errorMessage;
    }
  }

  function showFormFeedback(message) {
    formFeedback.textContent = message;
    formFeedback.hidden = false;
  }

  function hideFormFeedback() {
    formFeedback.hidden = true;
    formFeedback.textContent = '';
  }

  function renderMovies(movies) {
    movieListEl.innerHTML = '';
    if (!Array.isArray(movies) || movies.length === 0) {
      setCatalogViewState('empty');
      return;
    }

    setCatalogViewState('data');

    movies.forEach(function (movie) {
      const card = document.createElement('article');
      card.className = 'movie-item';
      card.setAttribute('role', 'listitem');

      const topDiv = document.createElement('div');
      const head = document.createElement('div');
      head.className = 'movie-head';

      const title = document.createElement('h3');
      title.className = 'movie-title';
      title.textContent = '#' + movie.id + ' - ' + movie.title;

      head.appendChild(title);
      topDiv.appendChild(head);

      const tags = document.createElement('div');
      tags.className = 'movie-meta-tags';

      const tagItems = [
        'Tipe: ' + movie.type,
        'Tahun: ' + movie.release_year,
        'Usia: ' + movie.age_rating,
        'Rating: ' + movie.rating,
        movie.is_premium ? 'Paket: Premium' : 'Paket: Reguler',
      ];

      tagItems.forEach(function (text) {
        const span = document.createElement('span');
        span.className = 'meta-tag';
        span.textContent = text;
        tags.appendChild(span);
      });

      topDiv.appendChild(tags);

      const synopsis = document.createElement('p');
      synopsis.className = 'movie-synopsis';
      synopsis.textContent = movie.synopsis || 'Tidak ada sinopsis.';
      topDiv.appendChild(synopsis);

      const actions = document.createElement('div');
      actions.className = 'movie-actions';

      const btnDetail = document.createElement('button');
      btnDetail.type = 'button';
      btnDetail.className = 'btn btn-secondary';
      btnDetail.textContent = 'Detail (GET /movie/' + movie.id + ')';
      btnDetail.addEventListener('click', function () {
        fetchMovieById(movie.id, true);
      });

      const btnEdit = document.createElement('button');
      btnEdit.type = 'button';
      btnEdit.className = 'btn btn-secondary';
      btnEdit.textContent = 'Ubah (PATCH)';
      btnEdit.addEventListener('click', function () {
        enterEditMode(movie);
      });

      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'btn btn-secondary';
      btnDelete.textContent = 'Hapus (DELETE)';
      btnDelete.addEventListener('click', function () {
        openDeleteModal(movie, btnDelete);
      });

      actions.appendChild(btnDetail);
      actions.appendChild(btnEdit);
      actions.appendChild(btnDelete);

      card.appendChild(topDiv);
      card.appendChild(actions);
      movieListEl.appendChild(card);
    });
  }

  async function fetchMovies(url, sqlPreview) {
    setCatalogViewState('loading');
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      const json = await response.json();

      updateInspector({
        method: 'GET',
        url: url,
        status: response.status,
        ok: response.ok,
        sql: sqlPreview,
        requestBody: null,
        responseBody: json,
      });

      if (!response.ok) {
        setCatalogViewState('error', json.message || 'Gagal mengambil data.');
        return;
      }

      const list = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
      renderMovies(list);
    } catch (error) {
      setCatalogViewState('error', error.message);
    }
  }

  async function fetchMovieById(id, keepListVisible) {
    const url = '/movie/' + encodeURIComponent(id);
    const sqlPreview = 'SELECT * FROM films WHERE id = ' + Number(id) + ';';

    if (!keepListVisible) {
      setCatalogViewState('loading');
    }

    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      const json = await response.json();

      updateInspector({
        method: 'GET',
        url: url,
        status: response.status,
        ok: response.ok,
        sql: sqlPreview,
        requestBody: null,
        responseBody: json,
      });

      if (!keepListVisible) {
        if (!response.ok) {
          setCatalogViewState('empty');
          return;
        }
        renderMovies(json.data ? [json.data] : []);
      } else {
        document.getElementById('inspector-section').scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      if (!keepListVisible) {
        setCatalogViewState('error', error.message);
      }
    }
  }

  function enterEditMode(movie) {
    hideFormFeedback();
    movieIdInput.value = movie.id;
    inputTitle.value = movie.title || '';
    inputSlug.value = movie.slug || '';
    inputType.value = movie.type || 'movie';
    inputYear.value = movie.release_year || 2024;
    inputAge.value = movie.age_rating || '13+';
    inputRating.value = movie.rating !== undefined ? movie.rating : 4.5;
    inputPoster.value = movie.poster_url || '';
    inputTrailer.value = movie.trailer_url || '';
    inputSynopsis.value = movie.synopsis || '';
    inputPremium.checked = Boolean(movie.is_premium);
    inputPublished.checked = movie.is_published !== undefined ? Boolean(movie.is_published) : true;

    formModeDesc.innerHTML =
      'Mode aktif: <strong>Ubah Data ID #' +
      movie.id +
      ' (PATCH /movie/' +
      movie.id +
      ')</strong> menggunakan service <code>UPDATE</code>.';
    btnSubmitForm.textContent = 'Simpan Perubahan (PATCH /movie/' + movie.id + ')';
    btnCancelEdit.hidden = false;

    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
    inputTitle.focus();
  }

  function resetFormToPostMode() {
    movieForm.reset();
    movieIdInput.value = '';
    inputYear.value = '2024';
    inputAge.value = '13+';
    inputRating.value = '4.5';
    inputPublished.checked = true;

    formModeDesc.innerHTML =
      'Mode aktif: <strong>Tambah Data Baru (POST /movie)</strong> menggunakan service <code>INSERT</code>.';
    btnSubmitForm.textContent = 'Simpan Movie Baru (POST /movie)';
    btnCancelEdit.hidden = true;
  }

  btnCancelEdit.addEventListener('click', function () {
    hideFormFeedback();
    resetFormToPostMode();
  });

  btnFillSample.addEventListener('click', function () {
    hideFormFeedback();
    const randomYear = 2014 + Math.floor(Math.random() * 11);
    inputTitle.value = 'Interstellar (' + randomYear + ')';
    inputSlug.value = 'interstellar-' + randomYear;
    inputType.value = 'movie';
    inputYear.value = String(randomYear);
    inputAge.value = '13+';
    inputRating.value = '4.9';
    inputPoster.value = 'https://images.chill.com/posters/interstellar.jpg';
    inputTrailer.value = 'https://videos.chill.com/trailers/interstellar.mp4';
    inputSynopsis.value =
      'Tim penjelajah antariksa melewati lubang cacing untuk mencari planet baru yang layak huni bagi umat manusia.';
    inputPremium.checked = true;
    inputPublished.checked = true;
    inputTitle.focus();
  });

  movieForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    hideFormFeedback();

    const titleVal = inputTitle.value.trim();
    if (!titleVal) {
      showFormFeedback('Validasi gagal: Judul Film / Series wajib diisi.');
      inputTitle.focus();
      return;
    }

    const payload = {
      title: titleVal,
      type: inputType.value,
      release_year: Number(inputYear.value) || 2024,
      age_rating: inputAge.value,
      rating: Number(inputRating.value) || 0,
      synopsis: inputSynopsis.value.trim() || 'Sinopsis belum tersedia.',
      is_premium: inputPremium.checked,
      is_published: inputPublished.checked,
    };

    if (inputSlug.value.trim()) {
      payload.slug = inputSlug.value.trim();
    }
    if (inputPoster.value.trim()) {
      payload.poster_url = inputPoster.value.trim();
    }
    if (inputTrailer.value.trim()) {
      payload.trailer_url = inputTrailer.value.trim();
    }

    const editId = movieIdInput.value.trim();
    const isEdit = Boolean(editId);
    const method = isEdit ? 'PATCH' : 'POST';
    const url = isEdit ? '/movie/' + encodeURIComponent(editId) : '/movie';
    const sqlPreview = isEdit
      ? 'UPDATE films SET title = ?, type = ?, release_year = ?, ... WHERE id = ' + Number(editId) + ';'
      : 'INSERT INTO films (title, slug, synopsis, type, release_year, ...) VALUES (?, ?, ?, ?, ?, ...);';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      updateInspector({
        method: method,
        url: url,
        status: response.status,
        ok: response.ok,
        sql: sqlPreview,
        requestBody: payload,
        responseBody: json,
      });

      if (!response.ok) {
        showFormFeedback('Gagal menyimpan: ' + (json.message || 'Terjadi kesalahan.'));
        return;
      }

      showFormFeedback(json.message || 'Data berhasil disimpan ke database.');
      resetFormToPostMode();
      await fetchMovies('/movies', 'SELECT * FROM films ORDER BY id ASC;');
    } catch (error) {
      showFormFeedback('Gagal menghubungi server: ' + error.message);
    }
  });

  filterForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const idVal = filterId.value.trim();
    const typeVal = filterType.value.trim();
    const searchVal = filterSearch.value.trim();

    if (idVal) {
      fetchMovieById(idVal, false);
      return;
    }

    if (typeVal && !searchVal) {
      const attrUrl = '/movies/attribute/type/' + encodeURIComponent(typeVal);
      const attrSql = "SELECT * FROM films WHERE type = '" + typeVal + "' ORDER BY id ASC;";
      fetchMovies(attrUrl, attrSql);
      return;
    }

    const params = new URLSearchParams();
    const conditions = [];
    if (typeVal) {
      params.set('type', typeVal);
      conditions.push("type = '" + typeVal + "'");
    }
    if (searchVal) {
      params.set('search', searchVal);
      conditions.push("title LIKE '%" + searchVal + "%'");
    }

    const queryString = params.toString();
    const url = queryString ? '/movies?' + queryString : '/movies';
    const sql =
      conditions.length > 0
        ? 'SELECT * FROM films WHERE ' + conditions.join(' AND ') + ' ORDER BY id ASC;'
        : 'SELECT * FROM films ORDER BY id ASC;';

    fetchMovies(url, sql);
  });

  function resetAllFilters() {
    filterForm.reset();
    fetchMovies('/movies', 'SELECT * FROM films ORDER BY id ASC;');
  }

  btnResetFilter.addEventListener('click', resetAllFilters);
  btnEmptyReset.addEventListener('click', resetAllFilters);
  btnRefreshAll.addEventListener('click', resetAllFilters);
  btnRetryLoad.addEventListener('click', resetAllFilters);

  function openDeleteModal(movie, triggerElement) {
    pendingDeleteId = movie.id;
    lastFocusedElement = triggerElement || document.activeElement;
    deleteTargetTitle.textContent = movie.title;
    deleteTargetId.textContent = String(movie.id);
    deleteModal.hidden = false;
    btnConfirmDelete.focus();
  }

  function closeDeleteModal() {
    deleteModal.hidden = true;
    pendingDeleteId = null;
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  btnCancelDelete.addEventListener('click', closeDeleteModal);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !deleteModal.hidden) {
      closeDeleteModal();
    }
  });

  deleteModal.addEventListener('click', function (event) {
    if (event.target === deleteModal) {
      closeDeleteModal();
    }
  });

  btnConfirmDelete.addEventListener('click', async function () {
    if (!pendingDeleteId) {
      return;
    }
    const idToDelete = pendingDeleteId;
    closeDeleteModal();

    const url = '/movie/' + encodeURIComponent(idToDelete);
    const sqlPreview = 'DELETE FROM films WHERE id = ' + Number(idToDelete) + ';';

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      const json = await response.json();

      updateInspector({
        method: 'DELETE',
        url: url,
        status: response.status,
        ok: response.ok,
        sql: sqlPreview,
        requestBody: null,
        responseBody: json,
      });

      showFormFeedback(json.message || 'Data film berhasil dihapus.');
      await fetchMovies('/movies', 'SELECT * FROM films ORDER BY id ASC;');
    } catch (error) {
      showFormFeedback('Gagal menghapus data: ' + error.message);
    }
  });

  btnCopyJson.addEventListener('click', async function () {
    const text = inspectorResponse.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      btnCopyJson.textContent = 'Tersalin ke Clipboard';
      setTimeout(function () {
        btnCopyJson.textContent = 'Salin Response JSON';
      }, 1800);
    } catch (_) {
      btnCopyJson.textContent = 'Gagal Menyalin';
    }
  });

  fetchMovies('/movies', 'SELECT * FROM films ORDER BY id ASC;');
})();
