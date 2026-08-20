import apiClient from './axiosConfig';

const getRoles = async () => {
  try {
    const response = await apiClient.get('/roles');
    return response.data;
  } catch (error) {
    console.error('Error en getRoles:', error);
    throw error.response?.data || { mensaje: 'Error al obtener roles' };
  }
};

const getRoleById = async (id) => {
  try {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en getRoleById:', error);
    throw error.response?.data || { mensaje: 'Error al obtener el rol' };
  }
};

const createRole = async (roleData) => {
  try {
    const response = await apiClient.post('/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('Error en createRole:', error);
    throw error.response?.data || { mensaje: 'Error al crear el rol' };
  }
};

const updateRole = async (id, roleData) => {
  try {
    const response = await apiClient.put(`/roles/${id}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Error en updateRole:', error);
    throw error.response?.data || { mensaje: 'Error al actualizar el rol' };
  }
};

const deleteRole = async (id) => {
  try {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en deleteRole:', error);
    throw error.response?.data || { mensaje: 'Error al eliminar el rol' };
  }
};

const toggleRoleStatus = async (id, activo) => {
  try {
    const response = await apiClient.patch(`/roles/${id}/estado`, { activo });
    return response.data;
  } catch (error) {
    console.error('Error en toggleRoleStatus:', error);
    throw error.response?.data || { mensaje: 'Error al cambiar el estado del rol' };
  }
};

const getAvailablePermissions = async () => {
  try {
    const response = await apiClient.get('/roles/permisos/lista');
    return response.data;
  } catch (error) {
    console.error('Error en getAvailablePermissions:', error);
    throw error.response?.data || { mensaje: 'Error al obtener la lista de permisos' };
  }
};

export const rolesApi = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
  getAvailablePermissions
};
