# Mission Intermediate Backend 2B - Chill Movie App REST API

**Student:** Muhammad Burhanudin (20071)  
**Topik:** Node.js, Express.js, MySQL Connection & DML SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)

Repository ini merupakan kelanjutan dari **Mission Intermediate Backend 1** (Perancangan Skema Database Aplikasi Streaming Film **Chill** - `chill_movie_db`). Proyek ini mengimplementasikan koneksi database MySQL menggunakan **Node.js**, layanan manipulasi data (**DML SQL**), serta **REST API** menggunakan framework **Express.js** yang diuji melalui **Postman**.

---

## Struktur Proyek

```text
mission-intermediate-backend2B/
├── database/
│   └── schema.sql                                   # Skema DDL & seed data dari Mission 1 (chill_movie_db)
├── postman/
│   └── Chill_Movie_API.postman_collection.json      # Koleksi Postman siap import untuk pengujian API
├── src/
│   ├── config/
│   │   └── database.js                              # Langkah 1: Konfigurasi & koneksi pool MySQL
│   ├── controllers/
│   │   └── movieController.js                       # Handler request & response HTTP
│   ├── database/
│   │   └── init.js                                  # Skrip inisialisasi otomatis database & seed data
│   ├── routes/
│   │   └── movieRoutes.js                           # Langkah 3: Definisi endpoint REST API
│   ├── services/
│   │   └── movieService.js                          # Langkah 2: Implementasi query DML SQL (SELECT, INSERT, UPDATE, DELETE)
│   └── app.js                                       # Konfigurasi middleware Express.js
├── .env.example                                     # Contoh konfigurasi environment variabel
├── index.js                                         # Entry point server aplikasi
└── package.json
```

---

## Langkah Pertama: Connecting to Database

### 1. Instalasi Library
Project ini menggunakan library berikut:
- `express`: Web framework untuk membangun REST API
- `mysql2`: Driver MySQL untuk Node.js dengan dukungan Promise & Prepared Statements
- `dotenv`: Mengelola konfigurasi variabel environment dari file `.env`
- `cors`: Middleware Cross-Origin Resource Sharing

Instal seluruh dependensi dengan perintah:
```bash
npm install
```

### 2. Konfigurasi Database
Salin file `.env.example` menjadi `.env` dan sesuaikan dengan konfigurasi MySQL lokal (Laragon/XAMPP):
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=chill_movie_db
```

Konfigurasi koneksi berada pada `src/config/database.js` menggunakan `mysql.createPool()`.

Untuk membuat database `chill_movie_db` beserta seluruh tabel dan data awal secara otomatis, jalankan:
```bash
npm run db:init
```

---

## Langkah Kedua: Implementing Data Manipulation Language (DML)

Seluruh operasi DML SQL diimplementasikan di dalam `src/services/movieService.js` terhadap tabel `films`:

1. **Query `SELECT` Semua Data (`getAllMovies`)**  
   Mengambil seluruh daftar movie dari database (`SELECT * FROM films`), serta mendukung filter query parameter opsional (`type`, `release_year`, `age_rating`, `is_premium`, `search`).
2. **Query `SELECT` Berdasarkan ID (`getMovieById`) & Atribut Lain (`getMoviesByAttribute`)**  
   - Berdasarkan ID: `SELECT * FROM films WHERE id = ?`
   - Berdasarkan atribut lain: `SELECT * FROM films WHERE <attribute> = ?`
3. **Query `INSERT` / `ADD` (`addMovie`)**  
   Menambahkan data movie baru menggunakan perintah `INSERT INTO films (...) VALUES (...)`.
4. **Query `UPDATE` (`updateMovieById`)**  
   Mengubah data movie secara spesifik berdasarkan ID menggunakan perintah `UPDATE films SET ... WHERE id = ?`.
5. **Query `DELETE` (`deleteMovieById`)**  
   Menghapus data movie secara spesifik berdasarkan ID menggunakan perintah `DELETE FROM films WHERE id = ?`.

---

## Langkah Ketiga: Implementing REST API

Jalankan server dengan perintah:
```bash
npm start
# atau mode development:
npm run dev
```

Server berjalan di `http://localhost:3000`.

### Daftar Endpoint

| Endpoint | Method | Service DML | Keterangan |
| :--- | :---: | :---: | :--- |
| `/movies` | `GET` | `SELECT *` | Menampilkan semua data movies |
| `/movie/:id` | `GET` | `SELECT by Id` | Menampilkan satu movie berdasarkan `id` |
| `/movies/attribute/:attribute/:value` | `GET` | `SELECT by Attribute` | Menampilkan movies berdasarkan atribut tertentu (contoh: `/movies/attribute/type/movie`) |
| `/movie` | `POST` | `INSERT` (`ADD`) | Menambahkan data movie baru |
| `/movie/:id` | `PATCH` / `PUT` | `UPDATE` | Mengubah data movie berdasarkan `id` |
| `/movie/:id` | `DELETE` | `DELETE` | Menghapus data movie berdasarkan `id` |

---

## Langkah Keempat: Pengujian Menggunakan Postman

File koleksi Postman telah disediakan pada `postman/Chill_Movie_API.postman_collection.json`.

### Cara Import ke Postman:
1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di bagian kiri atas.
3. Pilih file `postman/Chill_Movie_API.postman_collection.json`.
4. Jalankan masing-masing request pada koleksi:

#### 1. `GET /movies` (List Semua Movies)
- **URL:** `http://localhost:3000/movies`
- **Method:** `GET`

#### 2. `GET /movie/:id` (Menampilkan Satu Movie Berdasarkan ID)
- **URL:** `http://localhost:3000/movie/1`
- **Method:** `GET`

#### 3. `POST /movie` (Menambahkan Data Movie)
- **URL:** `http://localhost:3000/movie`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "title": "Interstellar",
  "slug": "interstellar",
  "synopsis": "Tim penjelajah melakukan perjalanan melalui lubang cacing di luar angkasa dalam upaya untuk memastikan kelangsungan hidup umat manusia.",
  "type": "movie",
  "release_year": 2014,
  "age_rating": "13+",
  "poster_url": "https://images.chill.com/posters/interstellar.jpg",
  "trailer_url": "https://videos.chill.com/trailers/interstellar.mp4",
  "rating": 4.9,
  "is_premium": true,
  "is_published": true
}
```

#### 4. `PATCH /movie/:id` (Mengubah Data Movie Berdasarkan ID)
- **URL:** `http://localhost:3000/movie/6`
- **Method:** `PATCH`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "title": "Interstellar (Remastered Edition)",
  "rating": 5.0,
  "is_premium": false
}
```

#### 5. `DELETE /movie/:id` (Menghapus Data Movie Berdasarkan ID)
- **URL:** `http://localhost:3000/movie/6`
- **Method:** `DELETE`
