// Importaciones principales de Vue Router y otros módulos
import { createRouter, createWebHistory } from 'vue-router'
import settings from '@/settings'
import Layout from '@/layout'
import { useUsersStore } from '@/stores/UsersVuex'

// Definición de rutas principales de la aplicación
const routes = [
  // Redirección raíz a /homes
  {
    path: '/',
    redirect: '/homes'
  },
  // Ruta de login con lazy loading y control de acceso
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login'),
    async beforeEnter(to, from, next) {
      const hasToken = await useUsersStore().v_decodeToken()
      // Si no tiene token, permite acceso al login
      if (!hasToken) {
        return next();
      } else {
        // Si el token es válido, redirige a homes; si no, a logout
        if (hasToken.hasOwnProperty('exp') && (hasToken.exp > Date.now() / 1000)) {
          return next({ name: 'homes' });
        } else {
          return next({ name: 'logout' });
        }
      }
    },
    meta: {
      title: 'Sistema de Identificación',
      guest: true
    }
  },
  // Rutas bajo /usuario (perfil y logout)
  {
    path: '/usuario',
    name: 'usuario',
    meta: {
      breadCrumb: 'Usuarios'
    },
    component: Layout,
    children: [
      {
        path: 'perfil',
        name: 'perfil',
        component: () => import('@/views/profile/'),
        meta: {
          title: 'Mi perfil',
          breadCrumb: 'Mi perfil',
          action: 'USER_SELF',
          guest: false
        }
      },
      {
        path: 'logout',
        name: 'logout',
        // Componente inline para cerrar sesión y redirigir al login
        component: {
          async beforeRouteEnter(to, from, next) {
            useUsersStore().v_closeSession()
            return await next({ name: 'login' })
          }
        },
        meta: {
          title: 'Cerrar sesión',
          guest: true
        }
      }
    ]
  },
  // Ruta principal de Homes
  {
    path: '/homes',
    meta: {
      breadCrumb: 'Homes'
    },
    component: Layout,
    children: [
      {
        path: '',
        name: 'homes',
        component: () => import('@/views/homes'),
        meta: {
          title: 'Homes',
          breadCrumb: 'Homes',
          action: 'PROPERTY_SEE',
          guest: false
        }
      }
    ]
  },
  // Ruta de reservas
  {
    path: '/reservas',
    meta: {
      breadCrumb: 'Listado de reservas'
    },
    component: Layout,
    children: [
      {
        path: '',
        name: 'reservas',
        component: () => import('@/views/reservations'),
        meta: {
          title: 'Listado de reservas',
          breadCrumb: 'Listado de reservas',
          action: 'BOOKINGS_SEE',
          guest: false
        }
      }
    ]
  },
  // Rutas de administración (usuarios y logs)
  {
    path: '/administracion',
    meta: {
      breadCrumb: 'Administración',
      action: 'USER_SEE' || 'PANEL_ADMIN',
      guest: false
    },
    component: Layout,
    children: [
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('@/views/users'),
        meta: {
          title: 'Usuarios y permisos',
          breadCrumb: 'Usuarios y permisos',
          action: 'USER_SEE',
          guest: false
        }
      },
      {
        path: 'logs',
        name: 'logs',
        component: () => import('@/views/log'),
        meta: {
          title: 'Logs del sistema',
          breadCrumb: 'Logs del sistema',
          action: 'PANEL_ADMIN',
          guest: false
        }
      }
    ]
  }
]

// Creación del historial de rutas
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard global: acciones antes de entrar en cada ruta
router.beforeEach(async (to, from, next) => {
  const usersStore = useUsersStore();
  const hasToken = await usersStore.v_decodeToken();

  // Cambiar el título de la página
  let secTitle = "";
  secTitle = settings.template.site.shortname;
  document.title = secTitle;

  // Permitir acceso a rutas de invitado
  if (to.meta.guest === true) {
    return next();
  } else {
    try {
      // Si hay token válido y permisos, permite acceso
      if (hasToken) {
        if (hasToken.hasOwnProperty('exp') && (hasToken.exp > Date.now() / 1000)) {
          if ((hasToken.role.actions).includes(to.meta.action) || (hasToken.role.alias.includes(settings.template.superuser))) {
            return next();
          } else {
            // Si no tiene permisos, redirige a 401
            return next({ name: '401' });
          }
        } else {
          // Token expirado, redirige a login
          return next({ name: 'login' });
        }
      } else {
        // Sin token, redirige a login
        return next({ name: 'login' });
      }
    } catch (err) {
      // En caso de error, cerrar sesión y redirigir a login
      console.log(err);
      usersStore.v_closeSession;
      return next({ name: 'login' });
    }
  }
});

// Exportación del router para uso en la app
export default router
