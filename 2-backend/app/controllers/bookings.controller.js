// Importar funciones auxiliares y modelo de Bookings
const auxFunc = require("../utils/auxiliary.functions");
const Bookings = require("../models/").bookings;

/**
 * Obtener todas las reservas con paginación y filtrado por fecha (upcoming/pasadas)
 */
exports.getAllBookings = async (req, res) => {
  try {
    // Parsear los parámetros del encabezado de la solicitud
    let serverParams = req.headers.serverParams ? JSON.parse(req.headers.serverParams) : req.headers.serverparams ? JSON.parse(req.headers.serverparams) : {};
    let upcoming = req.headers.upcoming == "true" ? true : false;
    // Filtrar por reservas futuras o pasadas
    let filter = upcoming === true ? { checkInDate: { $gte: new Date() } } : { checkInDate: { $lt: new Date() } };

    // Establecer limit y offset para la paginación
    let limit = serverParams.perPage ? parseInt(serverParams.perPage, 10) : 10;
    let page = serverParams.page ? parseInt(serverParams.page, 10) : 1;
    let skip = (page - 1) * limit;

    // Determinar el orden según si upcoming es true o false
    const sortOrder = upcoming === true ? 1 : -1;

    // Ejecutar la consulta con los parámetros de búsqueda, paginación y límites
    const bookings = await auxFunc.findDB(
      Bookings,
      filter,
      "Bookings found",
      "No bookings found",
      ["property", "payment"],
      { checkInDate: sortOrder },
      skip,
      limit
    );

    // Contar el total de registros sin limitar ni saltar para la paginación
    let totalbookings = await Bookings.countDocuments(filter);

    // Si hay datos, eliminamos el campo de pago y agregamos transactionId
    if (bookings.data && bookings.data.length > 0) {
      bookings.data = bookings.data.map(booking => {
        let transactionId = booking.payment && booking.payment.transactionId ? booking.payment.transactionId : null;
        let bookingObj = booking.toObject ? booking.toObject() : { ...booking };
        delete bookingObj.payment;
        return { ...bookingObj, transactionId };
      });
    }

    // Responder según si hay datos o no
    if (!bookings.data || bookings.data.length === 0) {
      return res.status(200).send({ message: "No se encuentran registros", code: 3001 });
    } else {
      return res.status(200).send({
        bookings: bookings.data,
        totalbookings
      });
    }
  }
  catch (error) {
    // Manejo de errores
    console.error("Error fetching all bookings:", error);
    res.status(403).send({ message: "Internal server error.", code: 3000 });
  }
}

/**
 * Obtener reservas por usuario con paginación y filtrado por fecha (upcoming/pasadas)
 */
exports.getBookingsByUser = async (req, res) => {
  try {
    // Obtener el ID del usuario de los parámetros de la solicitud
    const userId = req.params.userId;

    // Parsear los parámetros del encabezado de la solicitud
    let serverParams = req.headers.serverParams ? JSON.parse(req.headers.serverParams) : req.headers.serverparams ? JSON.parse(req.headers.serverparams) : {};
    let upcoming = req.headers.upcoming == "true" ? true : false;
    // Filtrar por usuario y por reservas futuras o pasadas
    let filter = upcoming === true ? { guest: userId, checkInDate: { $gte: new Date() } } : { guest: userId, checkInDate: { $lt: new Date() } };

    // Establecer limit y offset para la paginación
    let limit = serverParams.perPage ? parseInt(serverParams.perPage, 10) : 10;
    let page = serverParams.page ? parseInt(serverParams.page, 10) : 1;
    let skip = (page - 1) * limit;

    // Ejecutar la consulta con los parámetros de búsqueda, paginación y límites
    const bookings = await auxFunc.findDB(
      Bookings,
      filter,
      "Bookings found",
      "No bookings found",
      ["property", "payment"],
      { checkInDate: 1 },
      skip,
      limit
    );

    // Contar el total de registros sin limitar ni saltar para la paginación
    let totalbookings = await Bookings.countDocuments(filter);

    // Si hay datos, eliminamos el campo de pago y agregamos transactionId
    if (bookings.data && bookings.data.length > 0) {
      bookings.data = bookings.data.map(booking => {
        let transactionId = booking.payment && booking.payment.transactionId ? booking.payment.transactionId : null;
        let bookingObj = booking.toObject ? booking.toObject() : { ...booking };
        delete bookingObj.payment;
        return { ...bookingObj, transactionId };
      });
    }

    // Responder según si hay datos o no
    if (!bookings.data || bookings.data.length === 0) {
      return res.status(200).send({ message: "No se encuentran registros", code: 3001 });
    } else {
      return res.status(200).send({
        bookings: bookings.data,
        totalbookings
      });
    }
  }
  catch (error) {
    // Manejo de errores
    console.error("Error fetching bookings by user:", error);
    res.status(403).send({ message: "Internal server error.", code: 3000 });
  }
}

/**
 * Obtener las fechas de reservas de una propiedad (solo las confirmadas o completadas)
 */
exports.getBookingsByProperty = async (req, res) => {
  try {
    // Obtener el ID de la propiedad de los parámetros de la solicitud
    const propertyId = req.params.propertyId;

    // Buscar reservas por propiedad
    const bookings = await auxFunc.findDB(Bookings, { property: propertyId });

    // Si no hay reservas, responder con error
    if (!bookings || bookings.length === 0) {
      return res.status(403).send({ message: "No bookings found for this property.", code: 3001 });
    }

    // Extraer solo las fechas si el estado es 'completed' o 'confirm'
    const dates = bookings.data
      .filter(b => b.status === 'completed' || b.status === 'confirm')
      .map(b => ({
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate
      }));

    // Responder con las fechas encontradas
    res.status(200).send({
      message: "Fechas encontradas correctamente.",
      code: 2001,
      data: dates
    });

  } catch (error) {
    // Manejo de errores
    console.error("Error fetching bookings by property:", error);
    res.status(403).send({ message: "Internal server error.", code: 3000 });
  }
};

/**
 * Obtener reservas por anfitrión con paginación y filtrado por fecha (upcoming/pasadas)
 */
exports.getBookingsByHost = async (req, res) => {
  try {
    // Obtener el ID del anfitrión de los parámetros de la solicitud
    const hostId = req.params.hostId;

    // Parsear los parámetros del encabezado de la solicitud
    let serverParams = req.headers.serverParams ? JSON.parse(req.headers.serverParams) : req.headers.serverparams ? JSON.parse(req.headers.serverparams) : {};
    let upcoming = req.headers.upcoming == "true" ? true : false;
    // Filtrar por reservas futuras o pasadas
    let filter = upcoming === true ? { checkInDate: { $gte: new Date() } } : { checkInDate: { $lt: new Date() } };

    // Establecer limit y offset para la paginación
    let limit = serverParams.perPage ? parseInt(serverParams.perPage, 10) : 10;
    let page = serverParams.page ? parseInt(serverParams.page, 10) : 1;
    let skip = (page - 1) * limit;

    // Buscar reservas con los filtros y paginación
    const bookings = await auxFunc.findDB(
      Bookings,
      filter,
      "Bookings found",
      "No bookings found",
      ["property", "payment"],
      { checkInDate: 1 },
      skip,
      limit
    );

    // Filtrar las reservas por el ID del anfitrión, asegurando que property y host existan
    bookings.data = bookings.data.filter(booking => {
      return booking.property && booking.property.host && booking.property.host.toString() === hostId;
    });

    // Contar el total de registros filtrados
    let totalbookings = bookings.data.length;

    // Si hay datos, eliminamos el campo de pago y agregamos transactionId
    if (bookings.data && bookings.data.length > 0) {
      bookings.data = bookings.data.map(booking => {
        let transactionId = booking.payment && booking.payment.transactionId ? booking.payment.transactionId : null;
        let bookingObj = booking.toObject ? booking.toObject() : { ...booking };
        delete bookingObj.payment;
        return { ...bookingObj, transactionId };
      });
    }

    // Responder según si hay datos o no
    if (!bookings.data || bookings.data.length === 0) {
      return res.status(200).send({ message: "No se encuentran registros", code: 3001 });
    } else {
      return res.status(200).send({
        bookings: bookings.data,
        totalbookings
      });
    }
  } catch (error) {
    // Manejo de errores
    console.error("Error fetching bookings by host:", error);
    res.status(403).send({ message: "Internal server error.", code: 3000 });
  }
}

/**
 * Crear una nueva reserva
 */
exports.createBooking = (req, res) => {
  new Promise(async (resolve, reject) => {
    try {
      // Crear nueva instancia de reserva con los datos recibidos
      const bookingData = new Bookings(req.body);

      // Validar que se haya creado correctamente
      if (!bookingData) {
        return reject({ status: 403, body: { message: "Error creating booking.", code: 3000 } });
      }

      // Guardar la reserva en la base de datos
      await bookingData.save();

      // Responder con éxito y el ID de la reserva creada
      resolve({
        status: 200,
        body: {
          message: "Reserva realizada correctamente.",
          code: 2000,
          bookingId: bookingData._id
        }
      });

    } catch (error) {
      // Manejo de errores
      console.error("Error creating booking:", error);
      reject({
        status: 403,
        body: { message: "Internal server error.", code: 3000 }
      });
    }
  })
    .then(result => res.status(result.status).send(result.body))
    .catch(err => res.status(err.status).send(err.body));
};

/**
 * Actualizar una reserva existente
 */
exports.updateBooking = async (req, res) => {
  try {
    // Obtener el ID de la reserva de los parámetros de la solicitud
    const bookingId = req.params.bookingId;
    // Obtener los datos a actualizar del cuerpo de la solicitud
    const bookingData = req.body;
    // Actualizar la reserva en la base de datos
    const booking = await auxFunc.updateOneDB(Bookings, { _id: bookingId }, bookingData, "", "");
    // Si no se encuentra la reserva, responder con error
    if (!booking) {
      return res.status(403).send({ message: "Error updating booking.", code: 3000 });
    }
    // Responder con éxito
    res.status(200).send({ message: "Reserva actualizada correctamente.", code: 2000 });
  }
  catch (error) {
    // Manejo de errores
    console.error("Error updating booking:", error);
    res.status(403).send({ message: "Internal server error.", code: 3000 });
  }
}