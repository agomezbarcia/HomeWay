module.exports = mongoose => {
    // Definición del esquema de reservas (bookings)
    const bookingSchema = new mongoose.Schema({
        // Referencia al huésped (usuario)
        guest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: [true, 'El huésped es obligatorio']
        },
        // Referencia a la propiedad reservada
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "properties",
            required: [true, 'La propiedad es obligatoria']
        },
        // Fecha de entrada
        checkInDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (v) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);  // elimina la hora de "hoy"
                    return v >= today;
                },
                message: 'La fecha de entrada debe ser hoy o en el futuro'
            }
        },
        // Fecha de salida
        checkOutDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (v) {
                    return v > this.checkInDate;
                },
                message: 'La fecha de salida debe ser posterior a la entrada'
            }
        },
        // Precio total de la reserva
        totalPrice: {
            type: Number,
            required: true,
            min: [1, 'El precio total debe ser mayor a 0']
        },
        // Estado de la reserva
        status: {
            type: String,
            enum: {
                values: ['pending', 'completed', 'confirm', 'refound', 'failed'],
                message: 'Estado de reserva inválido'
            },
            default: 'pending'
        },
        // Referencia al pago asociado (opcional)
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "payments",
            required: false
        },
        // Número de huéspedes
        numberOfGuests: {
            type: Number,
            required: true,
            min: [1, 'Mínimo 1 huésped'],
            validate: {
                validator: async function (v) {
                    // Valida que no exceda el máximo de huéspedes de la propiedad
                    const property = await mongoose.model('properties').findById(this.property);
                    return v <= property.maxGuests;
                },
                message: 'Excede el máximo de huéspedes de la propiedad'
            }
        }
    }, {
        versionKey: false, // Desactiva el campo __v
        timestamps: true   // Agrega createdAt y updatedAt
    });

    // Exporta el modelo de reservas
    return mongoose.model("bookings", bookingSchema);
};