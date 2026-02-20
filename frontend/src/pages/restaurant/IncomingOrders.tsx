import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { orderService } from '../../services/order.service';
import { notificationService } from '../../services/notification.service';
import type { Order, OrderStatus } from '../../types/order.types';
import Spinner from '../../components/Spinner';
import { restaurantService } from '../../services/restaurant.service';

const statusColors: Record<OrderStatus, { bg: string; text: string; icon: any }> = {
  'CREADA': { bg: 'bg-blue-100', text: 'text-blue-800', icon: ClockIcon },
  'CANCELADA': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircleIcon },
  'RECHAZADA': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon },
  'EN_PROCESO': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ArrowPathIcon },
  'LISTA': { bg: 'bg-orange-100', text: 'text-orange-800', icon: CheckCircleIcon },
  'FINALIZADA': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon }
};

const statusLabels: Record<OrderStatus, string> = {
  'CREADA': 'Creada',
  'EN_PROCESO': 'En proceso',
  'FINALIZADA': 'Finalizada',
  'CANCELADA': 'Cancelada',
  'RECHAZADA': 'Rechazada',
  'LISTA': 'Lista',
};

const IncomingOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'TODAS'>('CREADA');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  // Modal de rechazo
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Modal de cancelación (nueva)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  // Modal de detalles
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders({
        page,
        limit: 10,
        status: selectedStatus !== 'TODAS' ? selectedStatus : undefined,
      });
      setOrders(data.orders);
      setTotalPages(Math.ceil(data.total / data.limit));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string, restaurantId: string) => {
    try {
      setProcessingOrder(orderId);
      await orderService.acceptOrder(orderId, restaurantId);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aceptar la orden');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleListOrder = async (orderId: string, restaurantId: string) => {
    try {
      setProcessingOrder(orderId);
      await orderService.readyOrder(orderId, restaurantId);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar la orden como lista');
    } finally {
      setProcessingOrder(null);
    }
  };

  // ── Rechazar orden + notificación ──────────────────────────
  const handleRejectOrder = async () => {
    if (!selectedOrderId || !rejectReason.trim()) return;

    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;

    try {
      setProcessingOrder(selectedOrderId);

      await orderService.rejectOrder(selectedOrderId, {
        restaurant_id: order.restaurant_id,
        reason: rejectReason,
      });

      // Obtener email del cliente y notificar
      const clientEmail = await notificationService.getUserEmail(order.client_id);
      const getRestaurantName = await restaurantService.getRestaurantById(order.restaurant_id);

      if (clientEmail && getRestaurantName) {
        await notificationService.notifyOrderRejected({
          user_id: order.client_id,
          client_email: clientEmail,
          order_id: order.id,
          restaurant_name: getRestaurantName.name,
          products: order.items.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price,
          })),
        });
      }

      setShowRejectModal(false);
      setRejectReason('');
      setSelectedOrderId(null);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar la orden');
    } finally {
      setProcessingOrder(null);
    }
  };

  // ── Cancelar orden + notificación ─────────────────────────
  const handleCancelOrder = async () => {
    if (!cancelOrderId || !cancelReason.trim()) return;

    const order = orders.find(o => o.id === cancelOrderId);
    if (!order) return;

    try {
      setProcessingOrder(cancelOrderId);

      // Obtener email del cliente y notificar
      const cancelOrderByRestaurant = await orderService.cancelOrderRestaurant(cancelOrderId, order.client_id);
      const clientEmail = await notificationService.getUserEmail(order.client_id);
      const getRestaurantName = await restaurantService.getRestaurantById(order.restaurant_id);

      if (clientEmail && getRestaurantName && cancelOrderByRestaurant) {
        await notificationService.notifyOrderCancelledByRestaurant({
          user_id: order.client_id,
          client_email: clientEmail,
          order_id: order.id,
          restaurant_name: getRestaurantName.name,
          cancel_reason: cancelReason,
          products: order.items.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price,
          })),
        });
      }

      setShowCancelModal(false);
      setCancelReason('');
      setCancelOrderId(null);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar la orden');
    } finally {
      setProcessingOrder(null);
    }
  };

  const openRejectModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const openCancelModal = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
              Órdenes del Sistema
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona todas las órdenes de los clientes
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por estado
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as OrderStatus | 'TODAS');
              setPage(1);
            }}
            className="block w-full md:w-64 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="TODAS">Todas las órdenes</option>
            <option value="CREADA">Creadas</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="LISTA">Listas</option>
            <option value="FINALIZADA">Finalizadas</option>
            <option value="RECHAZADA">Rechazadas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        {/* Lista de órdenes */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus === 'TODAS'
                ? 'No hay órdenes registradas'
                : `No hay órdenes con estado ${statusLabels[selectedStatus as OrderStatus]}`}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => {
                const StatusIcon = statusColors[order.status].icon;

                return (
                  <li key={order.id} className="px-6 py-5 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            Orden #{order.id.slice(0, 8)}
                          </p>
                          <span className="text-sm text-gray-500">
                            • Restaurante ID: {order.restaurant_id.slice(0, 8)}...
                          </span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                            <StatusIcon className="mr-1 h-4 w-4" />
                            {statusLabels[order.status]}
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-900">
                              Cliente: {order.client_id.slice(0, 8)}...
                            </p>
                            <p className="text-sm text-gray-500">
                              Fecha: {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Total: Q{order.total_amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Items: {order.items.length} productos
                            </p>
                          </div>
                        </div>

                        {order.rejection_reason && (
                          <p className="mt-2 text-sm text-red-600">
                            Motivo rechazo: {order.rejection_reason}
                          </p>
                        )}
                      </div>

                      <div className="ml-4 flex-shrink-0 flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={() => openDetailsModal(order)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Ver detalles
                        </button>

                        {order.status === 'CREADA' && (
                          <>
                            <button
                              onClick={() => handleAcceptOrder(order.id, order.restaurant_id)}
                              disabled={processingOrder === order.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              {processingOrder === order.id ? (
                                <Spinner size="sm" />
                              ) : (
                                <>
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Aceptar
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openRejectModal(order.id)}
                              disabled={processingOrder === order.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Rechazar
                            </button>
                          </>
                        )}

                        {order.status === 'EN_PROCESO' && (
                          <>
                            <button
                              onClick={() => handleListOrder(order.id, order.restaurant_id)}
                              disabled={processingOrder === order.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              {processingOrder === order.id ? (
                                <Spinner size="sm" />
                              ) : (
                                <>
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Marcar como lista
                                </>
                              )}
                            </button>
                            {/* Cancelación disponible también en EN_PROCESO */}
                            <button
                              onClick={() => openCancelModal(order.id)}
                              disabled={processingOrder === order.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Anterior</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Siguiente</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span>
                  </p>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button onClick={() => setPage(1)} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Inicio</button>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Anterior</button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">{page}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Siguiente</button>
                    <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Final</button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Modal de detalles ── */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetailsModal(false)} />
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Detalles de la orden #{selectedOrder.id.slice(0, 8)}
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-md space-y-1">
                      <p className="text-sm text-gray-600"><span className="font-medium">Restaurante ID:</span> {selectedOrder.restaurant_id}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Cliente ID:</span> {selectedOrder.client_id}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Fecha:</span> {formatDate(selectedOrder.created_at)}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Estado:</span>{' '}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedOrder.status].bg} ${statusColors[selectedOrder.status].text}`}>
                          {statusLabels[selectedOrder.status]}
                        </span>
                      </p>
                      {selectedOrder.updated_at && (
                        <p className="text-sm text-gray-600"><span className="font-medium">Última actualización:</span> {formatDate(selectedOrder.updated_at)}</p>
                      )}
                      {selectedOrder.rejection_reason && (
                        <p className="text-sm text-red-600 mt-2"><span className="font-medium">Motivo rechazo:</span> {selectedOrder.rejection_reason}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Items de la orden:</h4>
                      <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="px-4 py-3 flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                              <p className="text-sm text-gray-500">Cantidad: {item.quantity} x Q{item.unit_price.toFixed(2)}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">Q{item.subtotal.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <p className="text-base font-medium text-gray-900">Total</p>
                      <p className="text-base font-bold text-indigo-600">Q{selectedOrder.total_amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="button" onClick={() => setShowDetailsModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal de rechazo ── */}
        {showRejectModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => { setShowRejectModal(false); setRejectReason(''); setSelectedOrderId(null); }} />
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Rechazar orden</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Motivo del rechazo *</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Ej: Sin stock de ingredientes, falta de personal, etc."
                    />
                    <p className="mt-1 text-xs text-gray-500">El cliente recibirá un correo informando el rechazo.</p>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleRejectOrder}
                    disabled={!rejectReason.trim() || processingOrder === selectedOrderId}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {processingOrder === selectedOrderId ? <Spinner size="sm" /> : 'Rechazar orden'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowRejectModal(false); setRejectReason(''); setSelectedOrderId(null); }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal de cancelación por restaurante ── */}
        {showCancelModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => { setShowCancelModal(false); setCancelReason(''); setCancelOrderId(null); }} />
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Cancelar orden</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de cancelación *</label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Ej: No contamos con los ingredientes necesarios, cierre imprevisto, etc."
                    />
                    <p className="mt-1 text-xs text-gray-500">El cliente recibirá un correo con el motivo de cancelación.</p>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={!cancelReason.trim() || processingOrder === cancelOrderId}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {processingOrder === cancelOrderId ? <Spinner size="sm" /> : 'Confirmar cancelación'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCancelModal(false); setCancelReason(''); setCancelOrderId(null); }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Volver
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

export default IncomingOrders;
