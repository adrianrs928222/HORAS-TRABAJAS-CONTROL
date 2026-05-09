function calcularHoras(e, s) {
  let [h1,m1] = e.split(":").map(Number);
  let [h2,m2] = s.split(":").map(Number);

  return (h2 + m2/60) - (h1 + m1/60);
}

async function cargar() {
  let res = await fetch("/api/horas");
  let data = await res.json();

  let tabla = document.getElementById("tabla");
  tabla.innerHTML = "";

  data.forEach(d => {
    tabla.innerHTML += `
      <tr>
        <td>${d.fecha}</td>
        <td>${d.entrada}</td>
        <td>${d.salida}</td>
        <td>${d.horas.toFixed(2)}</td>
        <td>${d.total.toFixed(2)}€</td>
        <td><button onclick="eliminar(${d.id})">X</button></td>
      </tr>
    `;
  });
}

async function guardar() {
  let fecha = document.getElementById("fecha").value;
  let entrada = document.getElementById("entrada").value;
  let salida = document.getElementById("salida").value;
  let precio = parseFloat(document.getElementById("precio").value);

  let horas = calcularHoras(entrada, salida);
  let total = horas * precio;

  await fetch("/api/horas", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({fecha, entrada, salida, horas, precio, total})
  });

  cargar();
}

async function eliminar(id) {
  await fetch("/api/horas/" + id, { method: "DELETE" });
  cargar();
}

async function verMes() {
  let mes = document.getElementById("mes").value;

  let res = await fetch("/api/resumen/" + mes);
  let data = await res.json();

  document.getElementById("resumen").innerText =
    `Total: ${data.total.toFixed(2)}€ | Días: ${data.registros}`;
}

function exportar() {
  html2canvas(document.body).then(canvas => {
    let link = document.createElement("a");
    link.download = "horas.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

cargar();