const mongoose = require("mongoose");
const { Reserva } = require("../modelos/reservas");

function representarReserva(reserva) {
  return {
    id: reserva._id ? reserva._id.toString() : reserva.id?.toString(),
    estudiante: reserva.estudiante,
    email: reserva.email,
    sala: reserva.sala,
    fecha: reserva.fecha,
    turno: reserva.turno,
    personas: reserva.personas,
    estado: reserva.estado,
  };
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function crearServicioReservasMongo() {
  // Ahora aceptamos un filtro (por ejemplo, { sala: "Sala Norte" } o vacío {})
  async function listar(filtroConsulta = {}) {
    const filtro = {};

    // Si pasas una sala para filtrar de forma opcional
    if (filtroConsulta.sala) {
      filtro.sala = filtroConsulta.sala;
    }

    const documentos = await Reserva.find(filtro).lean();
    return documentos.map(representarReserva);
  }

  function validarId(id) {
    if (!mongoose.isObjectIdOrHexString(id)) {
      const error = new Error("Identificador inválido");
      error.codigo = "ID_INVALIDO";
      throw error;
    }
  }
  async function obtenerPorId(id) {
    validarId(id);

    const documento = await Reserva.findById(id).lean();
    return documento ? representarReserva(documento) : null;
  }

  async function crear(datos) {
    const documento = await Reserva.create({
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
    });
    return representarReserva(documento);
  }
  async function reemplazar(id, datos) {
    validarId(id);
    const reemplazo = {
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
      estado: datos.estado,
    };

    const documento = await Reserva.findOneAndReplace({ _id: id }, reemplazo, {
      returnDocument: "after",
      runValidators: true,
      upsert: false,
    });
    return documento ? representarReserva(documento) : null;
  }
  async function actualizar(id, cambios) {
    validarId(id);
    const documento = await Reserva.findByIdAndUpdate(
      id,
      { $set: cambios },
      {
        returnDocument: "after",
        runValidators: true,
        upsert: false,
      },
    );

    return documento ? representarReserva(documento) : null;
  }
  async function eliminar(id) {
    validarId(id);
    const documento = await Reserva.findByIdAndDelete(id);

    return documento ? representarReserva(documento) : null;
  }
  async function consultar(sala, orden = "estudiante", pagina = 1, limite = 5) {
    const filtro = {};

    if (sala !== undefined) {
      filtro.sala = sala.trim();
    }

    let ordenMongo;

    if (orden === "personas-asc") {
      ordenMongo = { personas: 1, _id: 1 };
    } else if (orden === "personas-desc") {
      ordenMongo = { personas: -1, _id: 1 };
    } else {
      ordenMongo = { estudiante: 1, _id: 1 };
    }
    const salto = (pagina - 1) * limite;
    const documentos = await Reserva.find(filtro)
      .select("estudiante email sala fecha turno personas estado")
      .sort(ordenMongo)
      .skip(salto)
      .limit(limite)
      .lean();

    return documentos.map(representarReserva);
  }
  async function contar(sala) {
    const filtro = {};

    if (sala !== undefined) {
      filtro.sala = sala.trim();
    }

    return await Reserva.countDocuments(filtro);
  }

  async function buscar(criterios = {}) {
    const filtro = {};

    if (criterios.q) {
      filtro.estudiante = {
        $regex: escaparRegex(criterios.q),
        $options: "i",
      };
    }

    if (criterios.sala) {
      filtro.sala = criterios.sala;
    }

    const ordenes = {
      estudiante: { estudiante: 1, _id: 1 },
      "personas-asc": { personas: 1, _id: 1 },
      "personas-desc": { personas: -1, _id: 1 },
    };

    const ordenMongo = ordenes[criterios.orden];

    // Contar todos los documentos que cumplen los filtros.
    const total = await Reserva.countDocuments(filtro);

    // Calcular la cantidad total de páginas.
    const paginas = Math.ceil(total / criterios.limite);

    // Calcular desde qué registro comienza la página solicitada.
    const salto = (criterios.pagina - 1) * criterios.limite;

    // Consultar solamente los registros de esa página.
    const documentos = await Reserva.find(filtro)
      .sort(ordenMongo)
      .skip(salto)
      .limit(criterios.limite)
      .lean();

    return {
      datos: documentos.map(representarReserva),
      pagina: criterios.pagina,
      limite: criterios.limite,
      total,
      paginas,
    };
  }

  return {
    listar,
    obtenerPorId,
    crear,
    reemplazar,
    actualizar,
    eliminar,
    consultar,
    contar,
    buscar,
  };
}

module.exports = { crearServicioReservasMongo };
