module.exports = mongoose => {
  // Definición del esquema de usuario
  const userSchema = new mongoose.Schema({
    // Token de autenticación
    token: String,

    // Información principal del usuario
    info: {
      // Nombre del usuario
      name: {
        type: String,
        trim: true,
        required: [true, 'El nombre es obligatorio'],
        validate: {
          validator: v => v.trim().length > 0,
          message: 'El nombre no puede estar vacío'
        }
      },
      // Email del usuario
      email: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'El email es obligatorio'],
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
      },
      // Apellido del usuario
      surname: {
        type: String,
        trim: true
      },
      // Nombre de usuario
      username: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'El nombre de usuario es obligatorio'],
        minlength: [3, 'El usuario debe tener mínimo 3 caracteres']
      },
      // Estado del usuario (activo/inactivo)
      status: {
        type: Boolean,
        default: true
      },
      // Contraseña del usuario
      password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [8, 'La contraseña debe tener mínimo 8 caracteres']
      },
      // Indica si el usuario es anfitrión
      isHost: {
        type: Boolean,
        default: false
      },
      // Perfil de anfitrión (solo si esHost es true)
      hostProfile: {
        // Email de PayPal del anfitrión
        paypalEmail: {
          type: String,
          trim: true,
          lowercase: true,
          match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
        },
        // Biografía del anfitrión
        bio: {
          type: String,
          trim: true,
          maxlength: [500, 'La biografía no puede exceder 500 caracteres']
        },
        // Número de teléfono del anfitrión
        phoneNumber: {
          type: String,
          trim: true
        },
        // Identificación gubernamental del anfitrión
        governmentId: {
          type: String,
          trim: true,
          unique: true,
          sparse: true
        }
      }
    },

    // Información de recuperación de cuenta
    recovery: {
      recoveryToken: String
    },

    // Rol del usuario (referencia a la colección de roles)
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users_roles",
      required: [true, 'El rol de usuario es obligatorio']
    },

    // Actividades del usuario (referencia a la colección de actividades)
    activity: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "users_activities"
    }],
  }, {
    versionKey: false, // Desactiva el campo __v
    timestamps: true   // Agrega createdAt y updatedAt
  });

  // Exporta el modelo de usuario
  return mongoose.model("users", userSchema);
};