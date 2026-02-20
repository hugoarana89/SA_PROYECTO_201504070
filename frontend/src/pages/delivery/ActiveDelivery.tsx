import React, { useState, useEffect, useCallback } from 'react';
import {
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { orderService } from '../../services/order.service';
import { deliveryService } from '../../services/delivery.service';
import type { Order } from '../../types/order.types';
import type { DeliveryItem } from '../../services/delivery.service';
import Spinner from '../../components/Spinner';
import { getUser } from '../../utils/authStorage';

type HistoryTab = 'EN_CAMINO' | 'ENTREGADA' | 'CANCELADA' | 'TODAS';

const statusConfig = {
  EN_CAMINO: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En camino', icon: TruckIcon },
  ENTREGADA: { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregada', icon: CheckCircleIcon },
  CANCELADA: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada', icon: XCircleIcon },
};

const ActiveDelivery: React.FC = () => {
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryItem[]>([]);
  const [historyDeliveries, setHistoryDeliveries] = useState<DeliveryItem[]>([]);
  const [orderMap, setOrderMap] = useState<Record<string, Order>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<HistoryTab>('TODAS');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [modalOrder, setModalOrder] = useState<Order | null>(null);

  const currentUser = getUser();
  const LIMIT = 5;

  const fetchOrderDetails = useCallback(async (orderIds: string[]) => {
    const missing = orderIds.filter((id) => !orderMap[id]);
    if (missing.length === 0) return;
    const results = await Promise.allSettled(missing.map((id) => orderService.getOrderById(id)));
    const newMap: Record<string, Order> = { ...orderMap };
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') newMap[missing[i]] = r.value;
    });
    setOrderMap(newMap);
  }, [orderMap]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [activeData, historyData] = await Promise.all([
        deliveryService.getDeliveries({ status: 'EN_CAMINO', limit: 50 }),
        deliveryService.getDeliveries({
          status: historyTab !== 'TODAS' ? historyTab as any : undefined,
          page: historyPage,
          limit: LIMIT,
        }),
      ]);

      setActiveDeliveries(activeData.deliveries);
      setHistoryDeliveries(historyData.deliveries.filter((d) => d.status !== 'EN_CAMINO'));
      setHistoryTotal(historyData.total);

      // Obtener detalles de órdenes
      const allIds = [
        ...activeData.deliveries.map((d) => d.order_id),
        ...historyData.deliveries.map((d) => d.order_id),
      ];
      await fetchOrderDetails([...new Set(allIds)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar entregas');
    } finally {
      setLoading(false);
    }
  }, [historyTab, historyPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkDelivered = async (delivery: DeliveryItem) => {
    const order = orderMap[delivery.order_id];
    try {
      setProcessingId(delivery.id);
      setError(null);

      // Obtengo el id del restaurante para completar la orden en el sistema de órdenes
      const getOrderById = await orderService.getOrderById(delivery.order_id);
      if (!getOrderById) {
        throw new Error('Orden no encontrada');
      }

      // Ya teniendo el id del restaurante, completo la orden en la base de datos de órdenes
      const result = await orderService.completeOrder(order.id, getOrderById.restaurant_id);
      if (!result) {
        throw new Error('Error al completar la orden en el sistema de órdenes');
      }

      // Completar la orden en la base de datos de deliverys
      if (order) {
        const result = await deliveryService.updateStatus(delivery.id, { status: 2, cancel_reason: '' });
        if (!result) {
          throw new Error('Error al marcar la entrega como entregada');
        }
      }

      setSuccessMsg('¡Entrega marcada como completada!');
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar como entregada');
    } finally {
      setProcessingId(null);
    }
  };

  const openCancelModal = (delivery: DeliveryItem) => {
    setSelectedDelivery(delivery);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelDelivery = async () => {
    if (!selectedDelivery || !cancelReason.trim()) return;
    const order = orderMap[selectedDelivery.order_id];

    try {
      setProcessingId(selectedDelivery.id);
      setError(null);

      await deliveryService.updateStatus(selectedDelivery.id, {
        status: 3,
        cancel_reason: cancelReason,
      });

      // Notificar cancelación al cliente
      if (order) {
        const clientEmail = await deliveryService.getUserEmail(order.client_id);
        const deliveryName = currentUser?.email?.split('@')[0] || 'Repartidor';
        await deliveryService.notifyOrderCancelled({
          user_id: order.client_id,
          client_email: clientEmail,
          order_id: order.id,
          delivery_user_id: selectedDelivery.delivery_user_id,
          delivery_name: deliveryName,
          cancel_reason: cancelReason,
          products: order.items.map((i) => ({
            name: i.product_name,
            quantity: i.quantity,
            price: i.unit_price,
          })),
        });
      }

      setShowCancelModal(false);
      setCancelReason('');
      setSelectedDelivery(null);
      setSuccessMsg('Entrega cancelada. El cliente ha sido notificado.');
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar la entrega');
    } finally {
      setProcessingId(null);
    }
  };

  const openOrderModal = (orderId: string) => {
    const order = orderMap[orderId];
    if (order) {
      setModalOrder(order);
      setShowOrderModal(true);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const historyTotalPages = Math.ceil(historyTotal / LIMIT);
  const filteredHistory = historyDeliveries;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-lg">
              <TruckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
                Mis Entregas
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tus entregas activas y consulta tu historial
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* ===== ENTREGAS ACTIVAS ===== */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                  <TruckIcon className="h-4 w-4 text-blue-600" />
                </span>
                <h3 className="text-lg font-semibold text-gray-900">Entregas activas</h3>
                {activeDeliveries.length > 0 && (
                  <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {activeDeliveries.length}
                  </span>
                )}
              </div>

              {activeDeliveries.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                  <TruckIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-3 text-sm font-semibold text-gray-900">Sin entregas activas</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Acepta un pedido en "Pedidos Disponibles" para comenzar.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeDeliveries.map((delivery) => {
                    const order = orderMap[delivery.order_id];
                    return (
                      <div
                        key={delivery.id}
                        className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden"
                      >
                        <div className="bg-blue-50 border-b border-blue-100 px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TruckIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-800">
                              Orden #{delivery.order_id.slice(0, 8)}
                            </span>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            En camino
                          </span>
                        </div>

                        <div className="px-5 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Asignado</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(delivery.assigned_at)}
                              </p>
                            </div>
                            {order && (
                              <>
                                <div>
                                  <p className="text-xs text-gray-500">Total</p>
                                  <p className="text-sm font-bold text-indigo-600">
                                    Q{order.total_amount.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Productos</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {order.items.length} ítem{order.items.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {order && (
                              <button
                                onClick={() => openOrderModal(delivery.order_id)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                Ver orden
                              </button>
                            )}
                            <button
                              onClick={() => handleMarkDelivered(delivery)}
                              disabled={processingId === delivery.id}
                              className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {processingId === delivery.id ? (
                                <Spinner size="sm" />
                              ) : (
                                <>
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Marcar entregado
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openCancelModal(delivery)}
                              disabled={!!processingId}
                              className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Cancelar entrega
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ===== HISTORIAL ===== */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                  <ArchiveBoxIcon className="h-4 w-4 text-gray-600" />
                </span>
                <h3 className="text-lg font-semibold text-gray-900">Historial de entregas</h3>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100">
                  <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
                    {(['TODAS', 'ENTREGADA', 'CANCELADA'] as HistoryTab[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setHistoryTab(tab);
                          setHistoryPage(1);
                        }}
                        className={`whitespace-nowrap py-4 px-5 border-b-2 font-medium text-sm transition-colors ${historyTab === tab
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        {tab === 'TODAS' ? 'Todas' : tab === 'ENTREGADA' ? 'Entregadas' : 'Canceladas'}
                      </button>
                    ))}
                  </nav>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-3 text-sm font-semibold text-gray-900">Sin registros</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tu historial de entregas aparecerá aquí.
                    </p>
                  </div>
                ) : (
                  <>
                    <ul className="divide-y divide-gray-100">
                      {filteredHistory.map((delivery) => {
                        const cfg = statusConfig[delivery.status] || statusConfig['EN_CAMINO'];
                        const StatusIcon = cfg.icon;
                        const order = orderMap[delivery.order_id];

                        return (
                          <li key={delivery.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                  <span className="text-sm font-semibold text-indigo-600">
                                    Orden #{delivery.order_id.slice(0, 8)}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                                  >
                                    <StatusIcon className="mr-1 h-3.5 w-3.5" />
                                    {cfg.label}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                                  <div>
                                    <span className="font-medium">Asignado:</span>{' '}
                                    {formatDate(delivery.assigned_at)}
                                  </div>
                                  {delivery.delivered_at && (
                                    <div>
                                      <span className="font-medium">Entregado:</span>{' '}
                                      {formatDate(delivery.delivered_at)}
                                    </div>
                                  )}
                                  {order && (
                                    <div>
                                      <span className="font-medium">Total:</span>{' '}
                                      <span className="text-indigo-600 font-semibold">
                                        Q{order.total_amount.toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {delivery.cancel_reason && (
                                  <p className="mt-1 text-xs text-red-600">
                                    <span className="font-medium">Motivo cancelación:</span>{' '}
                                    {delivery.cancel_reason}
                                  </p>
                                )}
                              </div>

                              {order && (
                                <button
                                  onClick={() => openOrderModal(delivery.order_id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 flex-shrink-0 transition-colors"
                                >
                                  <EyeIcon className="h-3.5 w-3.5 mr-1" />
                                  Ver orden
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Paginación historial */}
                    {historyTotalPages > 1 && (
                      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Página <span className="font-medium">{historyPage}</span> de{' '}
                          <span className="font-medium">{historyTotalPages}</span>
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                            disabled={historyPage === 1}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            ‹
                          </button>
                          <button
                            onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                            disabled={historyPage === historyTotalPages}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            ›
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </>
        )}

        {/* Modal Ver Orden */}
        {showOrderModal && modalOrder && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowOrderModal(false)}
              />
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Detalle de Orden #{modalOrder.id.slice(0, 8)}
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Restaurante:</span>{' '}
                        <span className="font-mono text-xs">{modalOrder.restaurant_id}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Cliente:</span>{' '}
                        <span className="font-mono text-xs">{modalOrder.client_id}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Fecha creación:</span>{' '}
                        {formatDate(modalOrder.created_at)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Productos</h4>
                      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                        {modalOrder.items.map((item) => (
                          <div key={item.id} className="px-4 py-3 flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantity} × Q{item.unit_price.toFixed(2)}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              Q{item.subtotal.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <p className="text-base font-semibold text-gray-900">Total</p>
                      <p className="text-lg font-bold text-indigo-600">
                        Q{modalOrder.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Cancelar entrega */}
        {showCancelModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedDelivery(null);
                }}
              />
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Cancelar entrega</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    El cliente será notificado. Esta acción no se puede deshacer.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivo de cancelación <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Ej: No puedo localizar la dirección de entrega..."
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelReason('');
                      setSelectedDelivery(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleCancelDelivery}
                    disabled={!cancelReason.trim() || !!processingId}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId ? <Spinner size="sm" /> : 'Confirmar cancelación'}
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

export default ActiveDelivery;
