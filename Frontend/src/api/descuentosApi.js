import apiClient from "./axiosConfig";

/**
 * ==============================
 * DESCUENTOS API
 * Integrado con backend Express + Prisma
 * ==============================
 */

/* =====================
   DESCUENTOS
===================== */

const obtenerDescuentos = async (params = {}) => {
  const { data } = await apiClient.get("/descuentos", { params });
  return data;
};

const obtenerDescuentoPorId = async (id) => {
  if (!id) throw new Error("ID de descuento requerido");
  const { data } = await apiClient.get(`/descuentos/${id}`);
  return data;
};

const obtenerDescuentoPorCodigo = async (codigo) => {
  if (!codigo) throw new Error("Código de descuento requerido");
  const { data } = await apiClient.get(`/descuentos/codigo/${codigo}`);
  return data;
};

const crearDescuento = async (descuentoData) => {
  const { data } = await apiClient.post("/descuentos", descuentoData);
  return data;
};

const actualizarDescuento = async (id, descuentoData) => {
  if (!id) throw new Error("ID requerido para actualizar");
  const { data } = await apiClient.put(`/descuentos/${id}`, descuentoData);
  return data;
};

const eliminarDescuento = async (id) => {
  if (!id) throw new Error("ID requerido para eliminar");
  const { data } = await apiClient.delete(`/descuentos/${id}`);
  return data;
};

const actualizarEstadoDescuento = async (id, estado) => {
  if (!id || !estado) throw new Error("ID y estado requeridos");
  const { data } = await apiClient.patch(
    `/descuentos/${id}/estado`,
    { estado }
  );
  return data;
};

/* =====================
   VALIDACIÓN
===================== */

const validarDescuento = async (codigoDescuento, montoCompra) => {
  if (!codigoDescuento) throw new Error("Código requerido");
  const { data } = await apiClient.post("/descuentos/validar", {
    codigoDescuento,
    montoCompra,
  });
  return data;
};

/* =====================
   HISTORIAL
===================== */

const obtenerHistorialDescuento = async (idDescuento, params = {}) => {
  if (!idDescuento) throw new Error("ID de descuento requerido");
  const { data } = await apiClient.get(
    `/descuentos/${idDescuento}/historial`,
    { params }
  );
  return data;
};

const obtenerHistorialGeneral = async (params = {}) => {
  const { data } = await apiClient.get("/descuentos/historial", { params });
  return data;
};

/* =====================
   ESTADÍSTICAS
===================== */

const obtenerEstadisticasDescuentos = async () => {
  const { data } = await apiClient.get("/descuentos/estadisticas");
  return data;
};

/* =====================
   EXPORT
===================== */

export const descuentosApi = {
  obtenerDescuentos,
  obtenerDescuentoPorId,
  obtenerDescuentoPorCodigo,
  crearDescuento,
  actualizarDescuento,
  eliminarDescuento,
  actualizarEstadoDescuento,
  validarDescuento,
  obtenerHistorialDescuento,
  obtenerHistorialGeneral,
  obtenerEstadisticasDescuentos,
};
