// Importar modelos y controladores necesarios
const Property = require('../models/index.js').properties;
const Role = require('../models/index.js').roles;
const User = require('../models/index.js').user;
const Logs = require('./logs.controller.js');

/**
 * Función auxiliar para comprobar si el usuario es ADMIN
 */
function isAdmin(res) {
    return new Promise(async (resolve, reject) => {
        try {
            const petitioner = res.locals.tokenedUser;
            resolve(petitioner.role.actions.includes('ADMIN'));
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Función auxiliar para comprobar si el usuario es PROPERTY_ADMIN
 */
function isPropertyAdmin(res) {
    return new Promise(async (resolve, reject) => {
        try {
            const petitioner = res.locals.tokenedUser;
            resolve(petitioner.role.actions.includes('PROPERTY_ADMIN'));
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Función auxiliar para comprobar si el usuario es HOST_ADMIN
 */
function isHostAdmin(res) {
    return new Promise(async (resolve, reject) => {
        try {
            const petitioner = res.locals.tokenedUser;
            resolve(petitioner.role.actions.includes('HOST_ADMIN'));
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Función auxiliar para obtener los roles de administrador de propiedades
 */
function getPropertyAdminRoles() {
    return new Promise(async resolve => {
        const adminActions = ['PROPERTY_ADMIN', 'ADMIN'];
        const adminRoleIds = [];
        const findRoles = await Role.find({ actions: { $in: adminActions } });
        for (const role of findRoles) {
            adminRoleIds.push(role._id.toString());
        }
        resolve(adminRoleIds);
    });
}

/**
 * Crear una nueva propiedad
 */
exports.createProperty = async (req, res) => {
    try {
        // Extraer los datos necesarios del cuerpo de la solicitud
        const title = req.body.title;
        const description = req.body.description;
        const hostId = req.body.host;
        const location = req.body.location;
        const addressData = req.body.address;
        const pricePerNight = req.body.pricePerNight;
        const amenities = req.body.amenities;
        const maxGuests = req.body.maxGuests;
        const bedrooms = req.body.bedrooms;
        const bathrooms = req.body.bathrooms;

        // Validar que se hayan enviado los campos obligatorios generales
        if (!title || !description || !hostId || !location || !addressData || !pricePerNight || !maxGuests || !bedrooms || !bathrooms) {
            return res.status(400).send({
                message: 'Petición incompleta',
                code: 3000
            });
        }

        // Extraer y validar los campos obligatorios de la dirección
        const { street, number, municipality, city, postalCode, country } = addressData;
        if (!street || !number || !municipality || !city || !postalCode || !country) {
            return res.status(400).send({
                message: 'Faltan campos obligatorios en la dirección',
                code: 3000
            });
        }

        // Construir el objeto address incluyendo los campos opcionales
        const fullAddress = {
            street,
            number,
            municipality,
            block: addressData.block || "",
            staircase: addressData.staircase || "",
            floor: addressData.floor || "",
            door: addressData.door || "",
            city,
            postalCode,
            country
        };

        // Crear una nueva instancia de Property con la estructura requerida
        const newProperty = new Property({
            title,
            description,
            host: hostId,
            location,
            address: fullAddress,
            pricePerNight,
            amenities,
            maxGuests,
            bedrooms,
            bathrooms
        });

        // Guardar la nueva propiedad en la base de datos
        await newProperty.save();

        // Registrar la acción
        Logs.postLog(
            'CREATE Property',
            `El usuario ${res.locals.tokenedUser.info.name} ha creado una propiedad`,
            res.locals.tokenedUser._id
        );

        return res.status(200).send({
            message: 'Propiedad creada con éxito',
            data: newProperty,
            code: 2000
        });
    } catch (error) {
        // Manejo específico del error de duplicado (por ejemplo, título ya existente)
        if (error.code === 11000) {
            return res.status(403).send({
                message: 'El título de la propiedad ya existe',
                code: 3000
            });
        }
        console.error('Property Controller: createProperty');
        console.error(error);
        return res.status(403).send({
            message: 'Ha ocurrido un error procesando su solicitud',
            code: 3000
        });
    }
};

/**
 * Obtener la lista de usuarios según el modo y los permisos del solicitante
 */
exports.getUserList = async (req, res) => {
    try {
        // Comprobar permisos de administrador
        const admin = await isAdmin(res);
        const propertyAdmin = await isPropertyAdmin(res);

        const mode = req.params.mode;
        if (mode === undefined) {
            return res.status(400).send({ message: "Petición mal formada", code: 3000 });
        }
        let userlist = [];
        let findUserData = null;
        const adminRoles = await getPropertyAdminRoles();
        switch (mode) {
            case 'user':
                if (admin) {
                    findUserData = await User.find({});
                }
                if (propertyAdmin) {
                    findUserData = await User.find({ role: { $in: adminRoles } });
                    findUserData = findUserData.filter(user => user.info.password === res.locals.tokenedUser.info.password); // Filtrar por más campos de seguridad
                }
                break;
            case 'authorizer':
                findUserData = await User.find({ role: { $in: adminRoles } });
                break;
        }
        if (findUserData && findUserData.length > 0) {
            for (const user of findUserData) {
                let insertData = {
                    name: `${user.info.name} ${user.info.surname}`,
                    email: user.info.email,
                    id: user._id
                }
                userlist.push(insertData);
            }
        }
        return res.status(200).send({ data: userlist, code: 2001 });
    } catch (err) {
        console.error("Property controller: getUserList")
        console.error(err);
        return res.status(403).send({ message: "Ha ocurrido un error procesando su solicitud", code: 3000 });
    }
}

/**
 * Obtener propiedades con filtros dinámicos según los parámetros de consulta
 */
exports.getProperties = async (req, res) => {
    try {
        // Obtener el usuario autenticado desde el token almacenado en res.locals
        const petitioner = res.locals.tokenedUser;

        // Verificar si el usuario tiene permisos de administrador de anfitriones
        const ishostadmin = await isHostAdmin(res);

        // Construir un objeto de consulta dinámica para filtrar propiedades
        const query = {};

        // Filtros de texto: buscar propiedades por título, ciudad o país
        if (req.query.title) {
            query.title = { $regex: new RegExp(req.query.title, 'i') };
        }
        if (req.query.city) {
            query['address.city'] = { $regex: new RegExp(req.query.city, 'i') };
        }
        if (req.query.country) {
            query['address.country'] = { $regex: new RegExp(req.query.country, 'i') };
        }

        // Filtros numéricos: buscar propiedades dentro de un rango de precio por noche
        if (req.query.pricePerNight) {
            const [min, max] = req.query.pricePerNight.split(',').map(Number);
            query.pricePerNight = {};
            if (!isNaN(min)) query.pricePerNight.$gte = min;
            if (!isNaN(max)) query.pricePerNight.$lte = max;
        }

        // Filtros adicionales: número mínimo de huéspedes, habitaciones y baños
        if (req.query.maxGuests) query.maxGuests = { $gte: Number(req.query.maxGuests) };
        if (req.query.bedrooms) query.bedrooms = { $gte: Number(req.query.bedrooms) };
        if (req.query.bathrooms) query.bathrooms = { $gte: Number(req.query.bathrooms) };
        if (ishostadmin) query.host = petitioner._id;

        // Buscar propiedades y poblar referencias
        let result = [];
        result = await Property.find(query).populate("host").populate("amenities");

        // Enviar la respuesta con los resultados encontrados
        return res.status(200).send({ data: result, code: 2001 });

    } catch (err) {
        // Manejo de errores
        console.error('Property Controller: getProperties');
        console.error(err);
        return res.status(403).send({ message: 'Ha ocurrido un error procesando su solicitud', code: 3000 });
    }
}

/**
 * Modificar las coordenadas de una propiedad
 */
exports.setPropertiesCoordinates = async (req, res) => {
    try {
        const petitioner = res.locals.tokenedUser;
        const isadmin = isAdmin(res) || isPropertyAdmin(res);
        const id = req.params.id;
        const location = req.body.location;
        const requestedProperty = await Property.findOne({ _id: id });

        // Validar existencia de la propiedad
        if (!requestedProperty) {
            return res.status(200).send({ message: 'La propiedad solicitada no existe', code: 3000 });
        }
        // Validar formato de la ubicación
        if (location.type == null || location.coordinates == undefined) {
            return res.status(400).send({ message: 'Petición mal formada', code: 3000 });
        }
        // Validar permisos
        if (!isadmin && requestedProperty.owner.toString() != petitioner._id.toString()) {
            return res.status(403).send({ message: 'No puede modificar esta propiedad', code: 3000 });
        }
        // Actualizar coordenadas
        const updatedProperty = await Property.updateOne({ _id: id }, { location: location });
        Logs.postLog('MODIFY Property', `El usuario ${res.locals.tokenedUser.info.name} ha modificado las coordenadas de la explotacion ${requestedProperty.name}`, res.locals.tokenedUser._id);
        return res.status(200).send({ message: 'Coordenadas actualizadas', code: 2000 });

    } catch (err) {
        console.error('Property Controller: setPropertiesCoordinates');
        console.error(err);
        return res.status(403).send({ message: 'Ha ocurrido un error procesando su solicitud', code: 3000 });
    }
}

/**
 * Modificar la información de una propiedad existente
 */
exports.setProperty = async (req, res) => {
    try {
        const id = req.params.id;
        const petitioner = res.locals.tokenedUser;
        const isadmin = isAdmin(res) || isPropertyAdmin(res);
        const title = req.body.title;
        const description = req.body.description;
        const hostId = req.body.host;
        const location = req.body.location;
        const addressData = req.body.address;
        const pricePerNight = req.body.pricePerNight;
        const amenities = req.body.amenities;
        const maxGuests = req.body.maxGuests;
        const bedrooms = req.body.bedrooms;
        const bathrooms = req.body.bathrooms;
        const requestedProperty = await Property.findOne({ _id: id });

        // Validar permisos de administrador
        if (!isadmin) {
            return res.status(403).send({ message: 'No se puede modificar esta propiedad', code: 3000 });
        }

        // Validar existencia de la propiedad
        if (!requestedProperty) {
            return res.status(200).send({ message: 'La propiedad solicitada no existe', code: 3000 });
        }

        // Validar campos obligatorios generales
        if (!title || !description || !hostId || !location || !addressData || !pricePerNight || !maxGuests || !bedrooms || !bathrooms) {
            return res.status(400).send({
                message: 'Petición incompleta',
                code: 3000
            });
        }

        // Validar campos obligatorios de la dirección
        const { street, number, municipality, city, postalCode, country } = addressData;
        if (!street || !number || !municipality || !city || !postalCode || !country) {
            return res.status(400).send({
                message: 'Faltan campos obligatorios en la dirección',
                code: 3000
            });
        }

        // Construir el objeto address incluyendo los campos opcionales
        const fullAddress = {
            street,
            number,
            municipality,
            block: addressData.block || "",
            staircase: addressData.staircase || "",
            floor: addressData.floor || "",
            door: addressData.door || "",
            city,
            postalCode,
            country
        };

        // Actualizar la propiedad
        const updatedProperty = await Property.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    title: title,
                    description: description,
                    host: hostId,
                    location: location,
                    address: fullAddress,
                    pricePerNight: pricePerNight,
                    amenities: amenities,
                    maxGuests: maxGuests,
                    bedrooms: bedrooms,
                    bathrooms: bathrooms
                }
            },
            {
                new: true
            }
        ).populate("host");
        Logs.postLog('MODIFY Property', `El usuario ${res.locals.tokenedUser.info.name} ha modificado la propiedad ${requestedProperty.name}`, res.locals.tokenedUser._id);
        return res.status(200).send({ message: 'Información de la propiedad actualizada', code: 2000, data: updatedProperty });

    } catch (err) {
        console.error('Property Controller: setProperty');
        console.error(err);
        return res.status(403).send({ message: 'Ha ocurrido un error procesando su solicitud', code: 3000 });
    }
}

/**
 * Eliminar una propiedad existente
 */
exports.deleteProperty = async (req, res) => {
    try {
        const isadmin = isAdmin(res) || isPropertyAdmin(res);
        const id = req.params.id;
        const requestedProperty = await Property.findOne({ _id: id });

        // Validar existencia de la propiedad
        if (!requestedProperty) {
            return res.status(200).send({ message: 'La propiedad solicitada no existe', code: 3000 });
        }
        // Validar permisos
        if (!isadmin) {
            return res.status(403).send({ message: 'No se puede eliminar esta propiedad', code: 3000 });
        }
        // Eliminar propiedad
        await Property.deleteOne({ _id: id });
        Logs.postLog('DELETE Property', `El usuario ${res.locals.tokenedUser.info.name} ha eliminado la explotacion ${requestedProperty.name}`, res.locals.tokenedUser._id);
        return res.status(200).send({ message: 'Propiedad eliminada', code: 2000 });

    } catch (err) {
        console.error('Property Controller: deleteProperty');
        console.error(err);
        return res.status(403).send({ message: 'Ha ocurrido un error procesando su solicitud', code: 3000 });
    }
}
