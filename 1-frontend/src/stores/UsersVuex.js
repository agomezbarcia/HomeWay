import { defineStore } from 'pinia';
import UserService from "@/services/UserService";
import { parseJwt } from "@/utils/general";
import { setUserToken, getUserToken, removeUserToken } from '@/utils/auth';

// Pinia store for user management
export const useUsersStore = defineStore('users', {
  // =========================
  // State
  // =========================
  state: () => ({
    id: null,                  // User ID
    token: getUserToken(),     // JWT token
    v_userdata: null,          // User data object
    v_rolesList: [],           // List of roles (except 'Administrador')
    v_decodedToken: null,      // Decoded JWT token
    v_isOwner: false           // Ownership flag
  }),

  // =========================
  // Actions
  // =========================
  actions: {
    // User login
    async login(userData) {
      try {
        const res = await UserService.login({
          key: userData.key,
          password: userData.password
        });

        if (res.code === 3000) {
          throw new Error('Credenciales incorrectas');
        } else if (res.code === 4000) {
          throw new Error('Su cuenta ha sido bloqueada');
        } else {
          this.id = res.data._id;
          this.token = res.data.token;
          this.v_userdata = res.data;
          setUserToken(res.data.token);

          return res;
        }
      } catch (error) {
        throw error;
      }
    },

    // Get self user data
    async v_getselfdata() {
      try {
        const id = parseJwt(this.token)._id;
        const res = await UserService.getUser(id);

        if (res.code === 3000) {
          throw new Error('No hay datos');
        }

        this.id = res.data._id;
        this.token = res.data.token;
        this.v_userdata = res.data;
        setUserToken(res.data.token);

        return res;
      } catch (error) {
        throw error;
      }
    },

    // Update self user data
    async v_updateSelfData(data) {
      try {
        await UserService.updateUser(this.id, { data });
        this.v_userdata = data;
      } catch (error) {
        throw error;
      }
    },

    // Get list of roles (excluding 'Administrador')
    async v_getRoleList() {
      try {
        const res = await UserService.getAllRoles();

        if (res.code === 3000) {
          throw new Error('No hay datos');
        }

        const localRoleList = res.data.filter(element => element.alias !== 'Administrador');
        this.v_rolesList = localRoleList;
      } catch (error) {
        throw error;
      }
    },

    // Add a new role
    async v_addRole(data) {
      try {
        const res = await UserService.createRole(data);

        if (res.code === 3000) {
          throw new Error('No se ha podido crear el rol');
        }

        this.v_rolesList.push(res.ack);
      } catch (error) {
        throw error;
      }
    },

    // Update an existing role
    async v_updateRole(data) {
      try {
        const res = await UserService.updateRole(data);

        if (res.code === 3000 || res.code === 3001) {
          throw new Error(res.message);
        }

        const index = this.v_rolesList.findIndex(role => role._id === data._id);
        if (index !== -1) {
          this.v_rolesList[index] = data;
        }
      } catch (error) {
        throw error;
      }
    },

    // Delete a role by ID
    async v_deleteRole(id) {
      try {
        const res = await UserService.deleteRole(id);

        if (res.code === 3000) {
          throw new Error('No se ha podido actualizar el rol');
        }

        this.v_rolesList = this.v_rolesList.filter(role => role._id !== id);
        return this.v_rolesList.length > 0 ? this.v_rolesList[0]._id : null;
      } catch (error) {
        throw error;
      }
    },

    // Decode JWT token and cache result
    async v_decodeToken() {
      if (this.v_decodedToken === null) {
        const data = this.token ? parseJwt(this.token) : parseJwt(await getUserToken());
        this.v_decodedToken = data;
        return data;
      } else {
        return this.v_decodedToken;
      }
    },

    // Check if user is owner (to be implemented)
    async v_checkIsOwner(locid) {
      // Implementa tu lógica aquí
    },

    // Check if user is shared owner (placeholder)
    async v_checkIsSharedOwner(locid) {
      return true; // Placeholder, implementar la lógica si es necesario
    },

    // Close user session and clear state
    v_closeSession() {
      removeUserToken();
      this.v_decodedToken = null;
      this.token = null;
    }
  },

  // =========================
  // Getters
  // =========================
  getters: {
    // Get user ID
    getID() {
      return this.id;
    },
    // Get JWT token
    getToken() {
      return this.token;
    },
    // Get user data
    getData() {
      return this.v_userdata;
    }
  }
});
