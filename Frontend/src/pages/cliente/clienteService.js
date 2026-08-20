import publicApi from '../../api/publicApi';
import { usuariosApi } from '../../api/usuariosApi';

const getProductos = async (opciones = {}) => {
  const res = await publicApi.obtenerProductosPublicos(opciones);
  return res;
};

const getProducto = async (id) => {
  const res = await publicApi.obtenerProductoDetalle(id);
  return res;
};

const updatePerfil = async (form) => {
  const usuarioStr = localStorage.getItem('usuario');
  if (!usuarioStr) throw new Error('Usuario no autenticado');

  const usuario = JSON.parse(usuarioStr);
  const id = usuario.idUsuario || usuario.id || usuario.idUser;

  const payload = {
    ...usuario,
    ...form,
  };

  const updated = await usuariosApi.updateUsuario(id, payload);

  try {
    // Guardar usuario actualizado en localStorage para mantener contexto
    localStorage.setItem('usuario', JSON.stringify(updated || payload));
  } catch (e) {
    // ignore
  }

  return updated || payload;
};

const clienteService = {
  getProductos,
  getProducto,
  updatePerfil,
};

export default clienteService;
