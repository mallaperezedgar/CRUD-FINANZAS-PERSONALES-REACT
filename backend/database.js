const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'gastos.db');

// Wrapper que emula la API síncrona de better-sqlite3
class DB {
  constructor(sqlJs) {
    if (fs.existsSync(DB_PATH)) {
      const buf = fs.readFileSync(DB_PATH);
      this.db = new sqlJs.Database(buf);
    } else {
      this.db = new sqlJs.Database();
    }
  }

  // Guarda la BD en disco tras cada escritura
  _save() {
    const data = this.db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }

  exec(sql) {
    this.db.exec(sql);
    this._save();
  }

  // Convierte resultado de sql.js → array de objetos
  _toObjects(results) {
    if (!results || results.length === 0) return [];
    const { columns, values } = results[0];
    return values.map(row =>
      Object.fromEntries(columns.map((col, i) => [col, row[i]]))
    );
  }

  all(sql, ...params) {
    const stmt = this.db.prepare(sql);
    stmt.bind(params.flat());
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  get(sql, ...params) {
    const rows = this.all(sql, ...params);
    return rows[0] || null;
  }

  run(sql, ...params) {
    const stmt = this.db.prepare(sql);
    stmt.bind(params.flat());
    stmt.step();
    stmt.free();
    const lastId = this.db.exec('SELECT last_insert_rowid() as id')[0];
    this._save();
    return {
      lastInsertRowid: lastId ? lastId.values[0][0] : null,
      changes: this.db.getRowsModified(),
    };
  }
}

// Singleton inicializado de forma asíncrona
let dbInstance = null;

async function getDB() {
  if (dbInstance) return dbInstance;
  const SQL = await initSqlJs();
  dbInstance = new DB(SQL);

  // Crear tabla si no existe
  dbInstance.db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      concepto  TEXT    NOT NULL,
      importe   REAL    NOT NULL,
      categoria TEXT    NOT NULL,
      fecha     TEXT    NOT NULL,
      created_at TEXT   DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
    
    CREATE TABLE IF NOT EXISTS recurring_finances (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      concepto  TEXT    NOT NULL,
      importe   REAL    NOT NULL,
      tipo      TEXT    NOT NULL,
      frecuencia TEXT   NOT NULL,
      created_at TEXT   DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    )
  `);
  dbInstance._save();

  // Seed con datos de ejemplo si está vacía
  const count = dbInstance.get('SELECT COUNT(*) as c FROM expenses');
  if (count && count.c === 0) {
    const samples = [
      { concepto: 'Compra supermercado',     importe: 85.50,  categoria: 'Alimentación', fecha: '2026-04-01' },
      { concepto: 'Abono transporte mensual', importe: 54.60, categoria: 'Transporte',   fecha: '2026-04-01' },
      { concepto: 'Cine + palomitas',         importe: 22.00, categoria: 'Ocio',         fecha: '2026-03-30' },
      { concepto: 'Farmacia vitaminas',        importe: 18.90, categoria: 'Salud',        fecha: '2026-03-29' },
      { concepto: 'Factura luz',               importe: 67.30, categoria: 'Hogar',        fecha: '2026-03-28' },
      { concepto: 'Curso de inglés',           importe: 120.00,categoria: 'Educación',   fecha: '2026-03-25' },
    ];
    for (const s of samples) {
      dbInstance.run(
        'INSERT INTO expenses (concepto, importe, categoria, fecha) VALUES (?, ?, ?, ?)',
        s.concepto, s.importe, s.categoria, s.fecha
      );
    }
  }

  return dbInstance;
}

module.exports = { getDB };
