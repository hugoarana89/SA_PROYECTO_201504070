import React, { useState, useEffect, useCallback } from 'react';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { orderService } from '../../services/order.service';
import { deliveryService } from '../../services/delivery.service';
import type { Order } from '../../types/order.types';
import type { DeliveryItem } from '../../services/delivery.service';
import Spinner from '../../components/Spinner';
import { getUser } from '../../utils/authStorage';

const AvailableDeliveries: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [acceptingOrder, setAcceptingOrder] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentUser = getUser();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar órdenes LISTA y entregas activas en paralelo
      const [ordersData, deliveriesData] = await Promise.all([
        orderService.getAllOrders({ page, limit: 10, status: 'LISTA' }),
        deliveryService.getDeliveries({ limit: 100 }), // todas para filtrar
      ]);

      setOrders(ordersData.orders);
      setTotalPages(Math.ceil(ordersData.total / ordersData.limit));
      setMyDeliveries(deliveriesData.deliveries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar órdenes que ya están siendo procesadas (validación frontend)
  const activeOrderIds = new Set(
    myDeliveries
      .filter((d) => d.status === 'EN_CAMINO')
      .map((d) => d.order_id)
  );

  // quitar ordenes que hayan sido canceladas por repartidores
  const cancelledOrderIds = new Set(
    myDeliveries
      .filter((d) => d.status === 'CANCELADA')
      .map((d) => d.order_id)
  );

  const availableOrders = orders.filter((o) => !activeOrderIds.has(o.id) && !cancelledOrderIds.has(o.id));

  const handleAcceptOrder = async (order: Order) => {
    try {
      setAcceptingOrder(order.id);
      setError(null);

      // Aceptar la orden
      const result = await deliveryService.acceptOrder(order.id);

      // Obtener email del cliente para notificación
      const clientEmail = await deliveryService.getUserEmail(order.client_id);
      const deliveryName = currentUser?.email?.split('@')[0] || 'Repartidor';

      // Enviar notificación
      await deliveryService.notifyOrderInTransit({
        user_id: order.client_id,
        client_email: clientEmail,
        order_id: order.id,
        delivery_user_id: result.delivery.delivery_user_id,
        delivery_name: deliveryName,
        products: order.items.map((i) => ({
          name: i.product_name,
          quantity: i.quantity,
          price: i.unit_price,
        })),
      });

      setSuccessMsg(`¡Orden #${order.id.slice(0, 8)} aceptada! Ahora estás en camino.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aceptar la orden');
    } finally {
      setAcceptingOrder(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
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
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 shadow-lg">
                <ShoppingBagIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
                  Pedidos Disponibles
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Órdenes listas para ser recogidas y entregadas
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={loadData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Stats banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pedidos disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{availableOrders.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mis entregas activas</p>
              <p className="text-2xl font-bold text-gray-900">
                {myDeliveries.filter((d) => d.status === 'EN_CAMINO').length}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✕</span>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Orders list */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : availableOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <ShoppingBagIcon className="mx-auto h-14 w-14 text-gray-300" />
            <h3 className="mt-4 text-base font-semibold text-gray-900">No hay pedidos disponibles</h3>
            <p className="mt-1 text-sm text-gray-500">
              Los pedidos listos para entrega aparecerán aquí.
            </p>
            <button
              onClick={loadData}
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Verificar de nuevo
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-100">
              <ul className="divide-y divide-gray-100">
                {availableOrders.map((order) => (
                  <li key={order.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <span className="text-sm font-semibold text-indigo-600">
                            Orden #{order.id.slice(0, 8)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <ClockIcon className="mr-1 h-3.5 w-3.5" />
                            Lista para entrega
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Restaurante</p>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {order.restaurant_id.slice(0, 12)}...
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Total</p>
                            <p className="text-sm font-bold text-indigo-600">
                              Q{order.total_amount.toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Productos</p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.items.length} ítem{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <p className="mt-2 text-xs text-gray-400">
                          Creada: {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Detalles
                        </button>
                        <button
                          onClick={() => handleAcceptOrder(order)}
                          disabled={!!acceptingOrder}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {acceptingOrder === order.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              <TruckIcon className="h-4 w-4 mr-1" />
                              Aceptar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-100 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-700">
                      Página <span className="font-medium">{page}</span> de{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        «
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ‹
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {page}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        ›
                      </button>
                      <button
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        »
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal detalles */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowDetailsModal(false)}
              />
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100">
                      <ShoppingBagIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Orden #{selectedOrder.id.slice(0, 8)}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Restaurante ID:</span>{' '}
                        <span className="font-mono text-xs">{selectedOrder.restaurant_id}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Cliente ID:</span>{' '}
                        <span className="font-mono text-xs">{selectedOrder.client_id}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Fecha:</span> {formatDate(selectedOrder.created_at)}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Productos:</h4>
                      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="px-4 py-3 flex justify-between items-center">
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

                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                      <p className="text-base font-semibold text-gray-900">Total</p>
                      <p className="text-lg font-bold text-indigo-600">
                        Q{selectedOrder.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleAcceptOrder(selectedOrder);
                    }}
                    disabled={!!acceptingOrder}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <TruckIcon className="h-4 w-4 mr-2" />
                    Aceptar entrega
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

export default AvailableDeliveries;
