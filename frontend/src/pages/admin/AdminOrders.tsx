// pages/admin/AdminOrders.tsx
import React, { useState, useEffect, useCallback, use } from 'react';
import {
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PhotoIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CalendarIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { adminService, type AdminDeliveryItem, type DeliveryStatus } from '../../services/admin.service';
import Spinner from '../../components/Spinner';

const AdminOrders: React.FC = () => {
  const [deliveries, setDeliveries] = useState<AdminDeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus | 'TODAS'>('TODAS');
  const [itemsPerPage] = useState(10);
  
  // Modals
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const statusOptions: (DeliveryStatus | 'TODAS')[] = ['TODAS', 'EN_CAMINO', 'ENTREGADA', 'CANCELADA'];

  const loadDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (selectedStatus !== 'TODAS') {
        params.status = selectedStatus;
      }

      const data = await adminService.getAllDeliveries(params);
      setDeliveries(data.deliveries);
      setTotalItems(data.total);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los deliveries');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, itemsPerPage]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleStatusChange = (status: DeliveryStatus | 'TODAS') => {
    setSelectedStatus(status);
    setCurrentPage(1); // Resetear a primera página al cambiar filtro
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const openUserModal = async (userId: string) => {
    try {
      setLoadingUser(true);
      const userInfo = await adminService.getUserInfo(userId);
      userInfo.id = userId; // Aseguramos que el ID esté presente
      setSelectedUser(userInfo);
      setShowUserModal(true);
    } catch (err) {
      setError('Error al cargar información del usuario');
    } finally {
      setLoadingUser(false);
    }
  };

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'EN_CAMINO':
        return <TruckIcon className="h-4 w-4" />;
      case 'ENTREGADA':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'CANCELADA':
        return <XCircleIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 shadow-lg">
              <TruckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
                Administración de Entregas
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona y visualiza todas las entregas del sistema
              </p>
            </div>
          </div>
          <button
            onClick={loadDeliveries}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'TODAS' ? 'Todas' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total registros</p>
            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Página actual</p>
            <p className="text-2xl font-bold text-gray-900">{currentPage} / {totalPages}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Items por página</p>
            <p className="text-2xl font-bold text-gray-900">{itemsPerPage}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Filtro activo</p>
            <p className="text-2xl font-bold text-indigo-600">{selectedStatus}</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabla de deliveries */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Orden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Repartidor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Asignación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Entrega
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comprobante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          No se encontraron deliveries
                        </td>
                      </tr>
                    ) : (
                      deliveries.map((delivery) => {
                        const statusConfig = adminService.getStatusConfig(delivery.status);
                        return (
                          <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-mono text-indigo-600">
                                #{delivery.order_id.slice(0, 8)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => openUserModal(delivery.delivery_user_id)}
                                className="inline-flex items-center gap-1 text-sm text-gray-900 hover:text-indigo-600 transition-colors"
                              >
                                <UserIcon className="h-4 w-4" />
                                <span className="font-mono text-xs">
                                  {delivery.delivery_user_id.slice(0, 8)}...
                                </span>
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                {getStatusIcon(delivery.status)}
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                {adminService.formatDate(delivery.assigned_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {delivery.delivered_at ? (
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                                  {adminService.formatDate(delivery.delivered_at)}
                                </div>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {delivery.proof_image_url ? (
                                <button
                                  onClick={() => openImageModal(delivery.proof_image_url)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                >
                                  <PhotoIcon className="h-3.5 w-3.5" />
                                  Ver imagen
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400">Sin comprobante</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => openUserModal(delivery.delivery_user_id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                <IdentificationIcon className="h-3.5 w-3.5" />
                                Ver repartidor
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{' '}
                    de <span className="font-medium">{totalItems}</span> resultados
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="h-4 w-4 mr-1" />
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Información de cancelación si existe */}
            {deliveries.some(d => d.cancel_reason) && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium mb-2">Órdenes canceladas:</p>
                <div className="space-y-2">
                  {deliveries.filter(d => d.cancel_reason).map(d => (
                    <div key={d.id} className="text-xs text-yellow-700">
                      <span className="font-mono">#{d.order_id.slice(0, 8)}</span>: {d.cancel_reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal para ver imagen */}
        {showImageModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowImageModal(false)}
              />
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                        <PhotoIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Comprobante de entrega</h3>
                    </div>
                    <button
                      onClick={() => setShowImageModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <img
                      src={selectedImage}
                      alt="Comprobante de entrega"
                      className="max-w-full max-h-[70vh] rounded-lg object-contain"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para ver información del repartidor */}
        {showUserModal && selectedUser && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowUserModal(false)}
              />
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100">
                      <UserIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Información del Repartidor</h3>
                  </div>
                  
                  {loadingUser ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="md" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500">ID del usuario</p>
                        <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded-lg">
                          {selectedUser.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded-lg">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;