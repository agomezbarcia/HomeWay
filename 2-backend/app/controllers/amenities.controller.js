// Importa las funciones auxiliares
const auxFunc = require("../utils/auxiliary.functions");
// Importa el modelo de amenities
const Amenities = require("../models/").amenities;

// Controlador para obtener todas las amenities
exports.getAllAmenities = async (req, res) => {
    // Busca todas las amenities y las ordena por nombre ascendente
    const amenities = await Amenities.find({}).sort({ name: 1 });

    // Si no se encuentran amenities, responde con un error 404
    if (!amenities || amenities.length === 0) {
        return res.status(404).send({ message: "No se encuentran servicios", code: 3001 });
    } else {
        // Si se encuentran amenities, responde con el listado
        return res.status(200).send({ amenities });
    }
}