const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

// 🔥 IMPORTANTE PARA RENDER
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 📁 Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// 🧠 BASE DE DATOS
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

// 🔥 RUTA PRINCIPAL (SOLUCIÓN DEL "NOT FOUND")
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 📥 OBTENER DATOS
app.get("/api/horas", (req, res) => {
  db.all("SELECT * FROM horas ORDER BY id DESC", [], (err, rows) => {
    res.json(rows);
  });
});

// ➕ AÑADIR REGISTRO
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

// ❌ ELIMINAR
app.delete("/api/horas/:id", (req, res) => {
  db.run("DELETE FROM horas WHERE id = ?", req.params.id);
  res.json({ ok: true });
});

// 💰 RESUMEN MENSUAL
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

// 🚀 START SERVER (OBLIGATORIO RENDER)
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});