import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

// API
import { creditosApi } from '../../../api/creditosApi';
// import { pagosApi } from '../../api/pagosApi'; // Will be needed for abonos

// Componentes comunes
import TableComponent from '../../../components/common/TableComponent';
import ButtonComponent from '../../../components/common/ButtonComponent';
import ModalComponent from '../../../components/common/ModalComponent';
import LoaderComponent from '../../../components/common/LoaderComponent';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog'; // Assuming it exists

// Componentes específicos (if any for abonos)
// import AbonoForm from '../../components/admin/AbonoForm';

const AbonosCreditosPage = () => {
  // Estados de datos y UI
  const [creditos, setCreditos] = useState([]);
  const [paginacion, setPaginacion] = useState({ paginaActual: 1, totalPaginas: 1 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros y búsqueda
  const [filtros, setFiltros] = useState({ estado: '', cliente: '' });
  const [paginaActual, setPaginaActual] = useState(1);

  // Estados para el modal (e.g., para ver abonos o agregar uno)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [creditoSeleccionado, setCreditoSeleccionado] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

  // Estado para confirmación de alguna acción (e.g., cancelar crédito)
  const [dialogoConfirmacionAbierto, setDialogoConfirmacionAbierto] = useState(false);
  const [creditoAAccionar, setCreditoAAccionar] = useState(null); // For actions like canceling

  // Cargar créditos
  const cargarCreditos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const params = { ...filtros, pagina: paginaActual, limite: 10 };
      const res = await creditosApi.getCreditos(params); // Assuming getCreditos exists and accepts params
      setCreditos(res.datos || []);
      setPaginacion(res.paginacion || { paginaActual: 1, totalPaginas: 1 });
    } catch (err) {
      setError('No se pudieron cargar los créditos. Por favor, intente más tarde.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, [filtros, paginaActual]);

  useEffect(() => {
    cargarCreditos();
  }, [cargarCreditos]);

  // Manejadores de eventos
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handlePaginaChange = (nuevaPagina) => {
    if (nuevaPagina > 0 && nuevaPagina <= paginacion.totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const handleAbrirModal = (credito = null) => {
    setCreditoSeleccionado(credito);
    setModalAbierto(true);
    setErrorForm(null);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setCreditoSeleccionado(null);
  };

  const handleAbrirConfirmacion = (credito) => {
    setCreditoAAccionar(credito);
    setDialogoConfirmacionAbierto(true);
  };

  const handleCerrarConfirmacion = () => {
    setCreditoAAccionar(null);
    setDialogoConfirmacionAbierto(false);
  };

  const handleAccionCredito = async () => {
    if (!creditoAAccionar) return;
    try {
      // Logic for action on credit (e.g., cancelar)
      console.log(`Realizando acción sobre crédito: ${creditoAAccionar.idCredito}`);
      // await creditosApi.cancelarCredito(creditoAAccionar.idCredito);
      handleCerrarConfirmacion();
      cargarCreditos();
    } catch (err) {
      console.error(err);
    }
  };

  // Definición de columnas para la tabla
  const columnas = [
    { Header: 'ID Crédito', accessor: 'idCredito' },
    { Header: 'Cliente', accessor: 'nombreCliente' }, // Assuming this will come from backend or be derived
    { Header: 'Venta ID', accessor: 'idVenta' },
    { Header: 'Monto Total', accessor: 'montoTotal' },
    { Header: 'Saldo Pendiente', accessor: 'saldoPendiente' },
    { Header: 'Fecha Vencimiento', accessor: 'fechaVencimiento' },
    { Header: 'Estado', accessor: 'estado' },
    { Header: 'Acciones', accessor: 'acciones' },
  ];

  // Mapeo de datos para la tabla
  const datosTabla = creditos.map(c => ({
    idCredito: c.idCredito,
    nombreCliente: c.usuarioCliente?.nombres ? `${c.usuarioCliente.nombres} ${c.usuarioCliente.apellidos}` : 'N/A', // Accessing related user data
    idVenta: c.idVenta,
    montoTotal: `$${Number(c.montoTotal).toFixed(2)}`,
    saldoPendiente: `$${Number(c.saldoPendiente).toFixed(2)}`,
    fechaVencimiento: c.fechaVencimiento ? new Date(c.fechaVencimiento).toLocaleDateString() : 'N/A',
    estado: <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.estado === 'activo' ? 'bg-yellow-100 text-yellow-800' : c.estado === 'pagado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.estado}</span>,
    acciones: (
      <div className="flex space-x-2">
        <ButtonComponent onClick={() => handleAbrirModal(c)} variant="secondary" size="sm" title="Ver Detalles/Abonar"><FiEye /></ButtonComponent>
        {/* Potencialmente más botones para cancelar, etc. */}
        {c.estado === 'activo' && (
             <ButtonComponent onClick={() => handleAbrirConfirmacion(c)} variant="danger" size="sm" title="Cancelar Crédito"><FiTrash2 /></ButtonComponent>
        )}
      </div>
    )
  }));


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Abonos y Créditos</h1>
        {/* <ButtonComponent onClick={() => handleAbrirModal()} variant="primary">
          <FiPlus className="mr-2"/> Registrar Abono
        </ButtonComponent> */}
      </div>

      {/* Barra de filtros */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="cliente"
            placeholder="Buscar por cliente..."
            value={filtros.cliente}
            onChange={handleFiltroChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
          />
          <select name="estado" value={filtros.estado} onChange={handleFiltroChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="pagado">Pagado</option>
            <option value="vencido">Vencido</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <ButtonComponent onClick={cargarCreditos} variant="secondary">
            <FiSearch className="mr-2"/> Buscar
          </ButtonComponent>
        </div>
      </div>

      {/* Contenido principal */}
      {cargando ? (
        <LoaderComponent />
      ) : error ? (
        <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
      ) : (
        <TableComponent columns={columnas} data={datosTabla} />
      )}

      {/* Paginación */}
      <div className="flex justify-center items-center mt-6">
        <ButtonComponent onClick={() => handlePaginaChange(paginaActual - 1)} disabled={paginaActual <= 1}>
          Anterior
        </ButtonComponent>
        <span className="px-4">Página {paginacion.paginaActual} de {paginacion.totalPaginas}</span>
        <ButtonComponent onClick={() => handlePaginaChange(paginaActual + 1)} disabled={paginaActual >= paginacion.totalPaginas}>
          Siguiente
        </ButtonComponent>
      </div>

      {/* Modal para ver detalles del crédito o registrar abono */}
      <ModalComponent
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
        title={creditoSeleccionado ? `Crédito #${creditoSeleccionado.idCredito}` : 'Registrar Abono'}
      >
        {creditoSeleccionado ? (
          <div>
            <h3 className="text-xl font-semibold mb-2">Detalles del Crédito</h3>
            <p><strong>Cliente:</strong> {creditoSeleccionado.usuarioCliente?.nombres} {creditoSeleccionado.usuarioCliente?.apellidos}</p>
            <p><strong>Monto Total:</strong> ${Number(creditoSeleccionado.montoTotal).toFixed(2)}</p>
            <p><strong>Saldo Pendiente:</strong> ${Number(creditoSeleccionado.saldoPendiente).toFixed(2)}</p>
            <p><strong>Fecha Vencimiento:</strong> {creditoSeleccionado.fechaVencimiento ? new Date(creditoSeleccionado.fechaVencimiento).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Estado:</strong> {creditoSeleccionado.estado}</p>
            {/* Aquí se podría integrar un componente para registrar abonos */}
            {/* <AbonoForm creditoId={creditoSeleccionado.idCredito} onAbonoRegistrado={cargarCreditos} /> */}
            <div className="mt-4 border-t pt-4">
                <h4 className="text-lg font-semibold mb-2">Historial de Pagos (Abonos)</h4>
                <p>Funcionalidad pendiente: Cargar y mostrar abonos para este crédito (idVenta: {creditoSeleccionado.idVenta}).</p>
            </div>
          </div>
        ) : (
          <p>Formulario para registrar un nuevo abono globalmente (no asociado a un crédito específico inicialmente). Funcionalidad pendiente.</p>
        )}
      </ModalComponent>

      {/* Modal de confirmación para alguna acción en el crédito */}
      <ConfirmationDialog
        isOpen={dialogoConfirmacionAbierto}
        onClose={handleCerrarConfirmacion}
        onConfirm={handleAccionCredito}
        title="Confirmar Acción"
        message={`¿Estás seguro de que quieres realizar esta acción sobre el crédito #${creditoAAccionar?.idCredito}?`}
      />
    </div>
  );
};

export default AbonosCreditosPage;
