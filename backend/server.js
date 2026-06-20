const express = require('express');
const cors = require('cors');
const { getDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Inicializar BD antes de arrancar ───────────────────────────────────────
let db;
(async () => {
  db = await getDB();

  // ──────────────────────────────────────────────────────────────────────────
  // GET /api/expenses
  // ──────────────────────────────────────────────────────────────────────────
  app.get('/api/expenses', (req, res) => {
    try {
      const { categoria, orden = 'fecha', dir = 'DESC' } = req.query;
      const validCols = ['fecha', 'importe', 'concepto', 'categoria', 'created_at', 'id'];
      const validDirs = ['ASC', 'DESC'];
      const col = validCols.includes(orden) ? orden : 'fecha';
      const direction = validDirs.includes(dir.toUpperCase()) ? dir.toUpperCase() : 'DESC';

      let query = 'SELECT * FROM expenses';
      const params = [];
      if (categoria) { query += ' WHERE categoria = ?'; params.push(categoria); }
      query += ` ORDER BY ${col} ${direction}`;

      const expenses = db.all(query, params);
      res.json({ success: true, data: expenses, total: expenses.length });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET /api/expenses/:id
  // ──────────────────────────────────────────────────────────────────────────
  app.get('/api/expenses/:id', (req, res) => {
    try {
      const expense = db.get('SELECT * FROM expenses WHERE id = ?', req.params.id);
      if (!expense) return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
      res.json({ success: true, data: expense });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST /api/expenses
  // ──────────────────────────────────────────────────────────────────────────
  app.post('/api/expenses', (req, res) => {
    try {
      const { concepto, importe, categoria, fecha } = req.body;
      if (!concepto || importe == null || !categoria || !fecha)
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });

      const imp = parseFloat(importe);
      if (isNaN(imp) || imp <= 0)
        return res.status(400).json({ success: false, message: 'El importe debe ser un número positivo' });

      const { lastInsertRowid } = db.run(
        'INSERT INTO expenses (concepto, importe, categoria, fecha) VALUES (?, ?, ?, ?)',
        concepto.trim(), imp, categoria.trim(), fecha
      );
      const created = db.get('SELECT * FROM expenses WHERE id = ?', lastInsertRowid);
      res.status(201).json({ success: true, data: created, message: 'Gasto creado correctamente' });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PUT /api/expenses/:id
  // ──────────────────────────────────────────────────────────────────────────
  app.put('/api/expenses/:id', (req, res) => {
    try {
      const existing = db.get('SELECT * FROM expenses WHERE id = ?', req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Gasto no encontrado' });

      const { concepto, importe, categoria, fecha } = req.body;
      if (!concepto || importe == null || !categoria || !fecha)
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });

      const imp = parseFloat(importe);
      if (isNaN(imp) || imp <= 0)
        return res.status(400).json({ success: false, message: 'El importe debe ser un número positivo' });

      db.run(
        'UPDATE expenses SET concepto = ?, importe = ?, categoria = ?, fecha = ? WHERE id = ?',
        concepto.trim(), imp, categoria.trim(), fecha, req.params.id
      );
      const updated = db.get('SELECT * FROM expenses WHERE id = ?', req.params.id);
      res.json({ success: true, data: updated, message: 'Gasto actualizado correctamente' });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // DELETE /api/expenses/:id
  // ──────────────────────────────────────────────────────────────────────────
  app.delete('/api/expenses/:id', (req, res) => {
    try {
      const existing = db.get('SELECT * FROM expenses WHERE id = ?', req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
      db.run('DELETE FROM expenses WHERE id = ?', req.params.id);
      res.json({ success: true, data: existing, message: 'Gasto eliminado correctamente' });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET /api/stats
  // ──────────────────────────────────────────────────────────────────────────
  app.get('/api/stats', (req, res) => {
    try {
      const total      = db.get('SELECT SUM(importe) as total, COUNT(*) as count FROM expenses');
      const byCategory = db.all('SELECT categoria, SUM(importe) as total, COUNT(*) as count FROM expenses GROUP BY categoria ORDER BY total DESC');
      const monthly    = db.all("SELECT strftime('%Y-%m', fecha) as mes, SUM(importe) as total FROM expenses GROUP BY mes ORDER BY mes DESC LIMIT 12");
      res.json({ success: true, data: { total, byCategory, monthly } });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET /api/recurring-finances
  // ──────────────────────────────────────────────────────────────────────────
  app.get('/api/recurring-finances', (req, res) => {
    try {
      const items = db.all('SELECT * FROM recurring_finances ORDER BY created_at DESC');
      res.json({ success: true, data: items, total: items.length });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST /api/recurring-finances
  // ──────────────────────────────────────────────────────────────────────────
  app.post('/api/recurring-finances', (req, res) => {
    try {
      const { concepto, importe, tipo, frecuencia } = req.body;
      if (!concepto || importe == null || !tipo || !frecuencia)
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });

      const imp = parseFloat(importe);
      if (isNaN(imp) || imp <= 0)
        return res.status(400).json({ success: false, message: 'El importe debe ser un número positivo' });

      if (!['ingreso_fijo', 'gasto_fijo'].includes(tipo))
        return res.status(400).json({ success: false, message: 'Tipo de finanza inválido' });

      const { lastInsertRowid } = db.run(
        'INSERT INTO recurring_finances (concepto, importe, tipo, frecuencia) VALUES (?, ?, ?, ?)',
        concepto.trim(), imp, tipo, frecuencia
      );
      const created = db.get('SELECT * FROM recurring_finances WHERE id = ?', lastInsertRowid);
      res.status(201).json({ success: true, data: created, message: 'Finanza recurrente creada correctamente' });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PUT /api/recurring-finances/:id
  // ──────────────────────────────────────────────────────────────────────────
  app.put('/api/recurring-finances/:id', (req, res) => {
    try {
      const existing = db.get('SELECT * FROM recurring_finances WHERE id = ?', req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Finanza recurrente no encontrada' });

      const { concepto, importe, tipo, frecuencia } = req.body;
      if (!concepto || importe == null || !tipo || !frecuencia)
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });

      const imp = parseFloat(importe);
      if (isNaN(imp) || imp <= 0)
        return res.status(400).json({ success: false, message: 'El importe debe ser un número positivo' });

      if (!['ingreso_fijo', 'gasto_fijo'].includes(tipo))
        return res.status(400).json({ success: false, message: 'Tipo de finanza inválido' });

      db.run(
        'UPDATE recurring_finances SET concepto = ?, importe = ?, tipo = ?, frecuencia = ? WHERE id = ?',
        concepto.trim(), imp, tipo, frecuencia, req.params.id
      );
      const updated = db.get('SELECT * FROM recurring_finances WHERE id = ?', req.params.id);
      res.json({ success: true, data: updated, message: 'Finanza recurrente actualizada correctamente' });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // DELETE /api/recurring-finances/:id
  // ──────────────────────────────────────────────────────────────────────────
  app.delete('/api/recurring-finances/:id', (req, res) => {
    try {
      const existing = db.get('SELECT * FROM recurring_finances WHERE id = ?', req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Finanza recurrente no encontrada' });
      db.run('DELETE FROM recurring_finances WHERE id = ?', req.params.id);
      res.json({ success: true, data: existing, message: 'Finanza recurrente eliminada correctamente' });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET /api/balance-stats - Para estadísticas de balance
  // ──────────────────────────────────────────────────────────────────────────
  app.get('/api/balance-stats', (req, res) => {
    try {
      const period = req.query.period || 'monthly'; // weekly, monthly, yearly
      let groupBy = "strftime('%Y-%m', fecha)"; // monthly por defecto
      
      if (period === 'weekly') {
        groupBy = "strftime('%Y-W%W', fecha)";
      } else if (period === 'yearly') {
        groupBy = "strftime('%Y', fecha)";
      }

      const stats = db.all(`
        SELECT 
          ${groupBy} as periodo,
          SUM(CASE WHEN tipo = 'gasto_fijo' OR categoria IS NOT NULL THEN importe ELSE 0 END) as total_gastos,
          SUM(CASE WHEN tipo = 'ingreso_fijo' THEN importe ELSE 0 END) as total_ingresos
        FROM (
          SELECT importe, 'gasto' as tipo, fecha, categoria FROM expenses
          UNION ALL
          SELECT importe, tipo, created_at as fecha, NULL as categoria FROM recurring_finances WHERE tipo = 'ingreso_fijo'
          UNION ALL
          SELECT importe, tipo, created_at as fecha, NULL as categoria FROM recurring_finances WHERE tipo = 'gasto_fijo'
        )
        GROUP BY ${groupBy}
        ORDER BY periodo DESC
        LIMIT 52
      `);
      
      res.json({ success: true, data: stats });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 404
  app.use((req, res) => res.status(404).json({ success: false, message: `Ruta ${req.path} no encontrada` }));

  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api/expenses\n`);
  });
})();
