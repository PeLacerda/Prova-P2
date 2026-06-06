import * as SQLite from 'expo-sqlite';

// Abre (ou cria) o banco local
const db = SQLite.openDatabaseSync('cadastros.db');

export async function initDB() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pessoas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL
    );
  `);
};

export async function adicionarPessoa(nome, email, password) {
  await db.runAsync(
    'INSERT INTO pessoas (nome, email, password) VALUES (?, ?, ?);',
    [nome, email, password]
  );
};

export async function listarPessoas() {
  const pessoas = await db.getAllAsync('SELECT * FROM pessoas;');
  return pessoas;
};

export async function deletarPessoa(id) {
  await db.runAsync('DELETE FROM pessoas WHERE id = ?;', [id]);
};