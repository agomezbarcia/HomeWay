module.exports = mongoose => {
    // Definición del esquema de propiedades
    const propertySchema = new mongoose.Schema({
        // Título de la propiedad
        title: {
            type: String,
            trim: true,
            required: [true, 'El título es obligatorio'],
            minlength: [5, 'El título debe tener mínimo 5 caracteres'],
            maxlength: [100, 'El título no puede exceder 100 caracteres']
        },
        // Descripción de la propiedad
        description: {
            type: String,
            trim: true,
            required: true,
            minlength: [20, 'La descripción debe tener mínimo 20 caracteres'],
            maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
        },
        // Referencia al anfitrión (usuario)
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: [true, 'El anfitrión es obligatorio']
        },
        // Ubicación geográfica (GeoJSON)
        location: {
            type: {
                type: String,
                default: "Point",
                enum: ['Point']
            },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: function (v) {
                        return v.length === 2 &&
                            v[0] >= -180 && v[0] <= 180 &&
                            v[1] >= -90 && v[1] <= 90;
                    },
                    message: 'Coordenadas inválidas'
                }
            }
        },
        // Dirección de la propiedad
        address: {
            street: {
                type: String,
                trim: true,
                required: [true, 'La calle es obligatoria']
            },
            number: {
                type: String,
                trim: true,
                required: [true, 'El número de calle es obligatorio']
            },
            municipality: {
                type: String,
                trim: true,
                required: [true, 'El municipio es obligatorio']
            },
            block: {
                type: String,
                trim: true
            },
            staircase: {
                type: String,
                trim: true
            },
            floor: {
                type: String,
                trim: true
            },
            door: {
                type: String,
                trim: true
            },
            city: {
                type: String,
                trim: true,
                required: [true, 'La ciudad es obligatoria']
            },
            state: {
                type: String,
                trim: true
            },
            country: {
                type: String,
                trim: true,
                required: [true, 'El país es obligatorio']
            },
            postalCode: {
                type: String,
                trim: true,
                required: [true, 'El código postal es obligatorio']
            }
        },
        // Precio por noche
        pricePerNight: {
            type: Number,
            required: [true, 'El precio por noche es obligatorio'],
            min: [1, 'El precio mínimo es 1']
        },
        // Lista de amenidades (referencias)
        amenities: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "amenities"
        }],
        // Capacidad máxima de huéspedes
        maxGuests: {
            type: Number,
            required: true,
            min: [1, 'Mínimo 1 huésped'],
            max: [50, 'Máximo 50 huéspedes']
        },
        // Número de dormitorios
        bedrooms: {
            type: Number,
            required: true,
            min: [1, 'No puede ser negativo']
        },
        // Número de baños
        bathrooms: {
            type: Number,
            required: true,
            min: [1, 'No puede ser negativo']
        }
    }, {
        versionKey: false,
        timestamps: true // Agrega createdAt y updatedAt
    });

    // Índice geoespacial para búsquedas por ubicación
    propertySchema.index({ location: '2dsphere' });

    // Exporta el modelo
    return mongoose.model("properties", propertySchema);
};