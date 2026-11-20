function leerCriterios(consulta) {
  const permitidos = ["q", "sala", "orden", "pagina", "limite"];

  // Rechazar parámetros desconocidos.
  const hayParametrosExtra = Object.keys(consulta).some(
    (parametro) => !permitidos.includes(parametro),
  );

  if (hayParametrosExtra) {
    const error = new Error("Hay parámetros de consulta desconocidos.");
    error.codigo = "ENTRADA_INVALIDA";
    throw error;
  }

  // Rechazar valores que no sean texto.
  const valores = {};

  for (const parametro of permitidos) {
    const valor = consulta[parametro];

    if (valor !== undefined && typeof valor !== "string") {
      const error = new Error(
        `El parámetro ${parametro} debe ser un texto único.`,
      );
      error.codigo = "ENTRADA_INVALIDA";
      throw error;
    }

    valores[parametro] = valor;
  }

  // Normalizar los textos.
  const q = (valores.q ?? "").trim();
  const sala = (valores.sala ?? "").trim();

  // Validar longitudes.
  if (q.length > 60 || sala.length > 80) {
    const error = new Error("Los criterios superan la longitud permitida.");
    error.codigo = "ENTRADA_INVALIDA";
    throw error;
  }

  // Establecer y validar el orden.
  const orden = valores.orden ?? "estudiante";

  if (!["estudiante", "personas-asc", "personas-desc"].includes(orden)) {
    const error = new Error("El criterio de ordenamiento no es válido.");
    error.codigo = "ENTRADA_INVALIDA";
    throw error;
  }
  const paginaTexto = valores.pagina ?? "1";
  const limiteTexto = valores.limite ?? "2";

  if (!/^\d+$/.test(paginaTexto) || !/^\d+$/.test(limiteTexto)) {
    const error = new Error("La página y el límite deben ser números enteros.");
    error.codigo = "ENTRADA_INVALIDA";
    throw error;
  }

  const pagina = Number(paginaTexto);
  const limite = Number(limiteTexto);

  if (
    !Number.isSafeInteger(pagina) ||
    pagina < 1 ||
    pagina > 1000 ||
    !Number.isSafeInteger(limite) ||
    limite < 1 ||
    limite > 20
  ) {
    const error = new Error(
      "La página debe estar entre 1 y 1000 y el límite entre 1 y 20.",
    );
    error.codigo = "ENTRADA_INVALIDA";
    throw error;
  }
  return { q, sala, orden, pagina, limite };
}

module.exports = { leerCriterios };
