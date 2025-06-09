// Importa el módulo de mongoose
const { de } = require("date-fns/locale");

module.exports = mongoose => {
    // Definición del esquema de pagos
    const paymentSchema = new mongoose.Schema({
        // Referencia a la reserva asociada (única y requerida)
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bookings",
            required: true,
            unique: true
        },
        // Monto del pago (mínimo 1.00, requerido)
        amount: {
            type: Number,
            required: true,
            min: [1.00, 'El monto mínimo es 1.00']
        },
        // Método de pago (solo 'paypal', requerido)
        paymentMethod: {
            type: String,
            enum: {
                values: ['paypal'],
                message: 'Método de pago no válido'
            },
            default: 'paypal',
            required: true
        },
        // ID de la transacción (único, requerido)
        transactionId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        // Estado del pago (varios valores permitidos, valor por defecto 'pendiente')
        status: {
            type: String,
            enum: {
                values: ['pending', 'completed', 'confirm', 'refound', 'failed'],
                message: 'Estado de pago inválido'
            },
            default: 'pendiente'
        },
        // Fecha de pago
        paidAt: Date
    }, {
        // Opciones del esquema: sin versionKey y con timestamps automáticos
        versionKey: false,
        timestamps: true
    });

    // Exporta el modelo de pagos
    return mongoose.model("payments", paymentSchema);
};