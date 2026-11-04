require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/database');

async function initDatabase() {
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Connect without selecting a database first so CREATE DATABASE IF NOT EXISTS can run.
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true,
  });

  try {
    await connection.query(sql);
    console.log(`Database "${dbConfig.database}" berhasil diinisialisasi dan diisi data awal.`);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  initDatabase().catch((error) => {
    console.error('Gagal menginisialisasi database:', error.message);
    process.exit(1);
  });
}

module.exports = { initDatabase };
