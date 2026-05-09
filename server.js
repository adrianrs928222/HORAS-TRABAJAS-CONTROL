const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("database.db");

db.run(`
CREATE TABLE IF NOT EXISTS horas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT,
  entrada TEXT,
  salida TEXT,
  horas REAL,
  precio REAL,
  total REAL
)
`);

// GET TODOS
app.get("/api/horas", (req, res) => {
  db.all("SELECT * FROM horas ORDER BY id DESC", [], (err, rows) => {
    res.json(rows);
  });
});

// INSERT
app.post("/api/horas", (req, res) => {
  const { fecha, entrada, salida, horas, precio, total } = req.body;

  db.run(
    `INSERT INTO horas (fecha, entrada, salida, horas, precio, total)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [fecha, entrada, salida, horas, precio, total],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

// DELETE
app.delete("/api/horas/:id", (req, res) => {
  db.run("DELETE FROM horas WHERE id = ?", req.params.id);
  res.json({ ok: true });
});

// RESUMEN MENSUAL
app.get("/api/resumen/:mes", (req, res) => {
  const mes = req.params.mes;

  db.all(
    "SELECT * FROM horas WHERE fecha LIKE ?",
    [mes + "%"],
    (err, rows) => {
      let total = 0;

      rows.forEach(r => total += r.total);

      res.json({
        total,
        registros: rows.length
      });
    }
  );
});

app.listen(PORT, () => {
  console.log("Servidor en http://localhost:" + PORT);
});