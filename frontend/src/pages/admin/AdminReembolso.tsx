// pages/admin/AdminOrders.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBagIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CalendarIcon,
  BanknotesIcon,
  ArrowPathRoundedSquareIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { orderService } from '../../services/order.service';
import { paymentService } from '../../services/payment.service';
import type { Order, OrderStatus } from '../../types/order.types';
import type { Payment } from '../../types/payment.types';
import Spinner from '../../components/Spinner';

// Interfaz combinada de orden con su pago
interface OrderWithPayment extends Order {
  payment?: Payment;
  showRefundOption?: boolean;
}

type FilterStatus = OrderStatus | 'TODAS';

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  CREADA: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Creada', icon: DocumentTextIcon },
  PENDIENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente', icon: ClockIcon },
  ACEPTADA: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Aceptada', icon: CheckCircleIcon },
  RECHAZADA: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazada', icon: XCircleIcon },
  LISTA: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Lista', icon: CheckCircleIcon },
  FINALIZADA: { bg: 'bg-green-100', text: 'text-green-800', label: 'Finalizada', icon: CheckCircleIcon },
  CANCELADA: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada', icon: XCircleIcon },
};

const paymentStatusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDIENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
  PAGADO: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pagado' },
  FALLIDO: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fallido' },
  REEMBOLSADO: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Reembolsado' },
};

const paymentMethodLabels: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA_CREDITO: 'Tarjeta de Crédito',
  TARJETA_DEBITO: 'Tarjeta de Débito',
  TRANSFERENCIA: 'Transferencia',
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('TODAS');
  const [itemsPerPage] = useState(10);
  const [processingRefund, setProcessingRefund] = useState<string | null>(null);

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithPayment | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundOrder, setRefundOrder] = useState<OrderWithPayment | null>(null);

  const statusOptions: FilterStatus[] = [
    'TODAS', 'CREADA', 'RECHAZADA', 'LISTA', 'FINALIZADA', 'CANCELADA'
  ];

  const loadOrders = useCallback(async () => {
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

      const data = await orderService.getAllOrders(params);
      
      // Inicializar órdenes sin pagos
      const ordersWithPayment: OrderWithPayment[] = data.orders.map(order => ({
        ...order,
        showRefundOption: order.status === 'RECHAZADA' || order.status === 'CANCELADA'
      }));

      setOrders(ordersWithPayment);
      setTotalItems(data.total);
      setTotalPages(Math.ceil(data.total / itemsPerPage));

      // Cargar pagos para estas órdenes
      await loadPaymentsForOrders(ordersWithPayment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, itemsPerPage]);

  const loadPaymentsForOrders = async (ordersList: OrderWithPayment[]) => {
    if (ordersList.length === 0) return;

    setLoadingPayments(true);
    try {
      // Cargar pagos para cada orden (en paralelo)
      const paymentPromises = ordersList.map(async (order) => {
        try {
          const result = await paymentService.getByOrder(order.id);
          return { orderId: order.id, payment: result.payment };
        } catch {
          // Si no hay pago, retornar null
          return { orderId: order.id, payment: null };
        }
      });

      const paymentsResults = await Promise.all(paymentPromises);
      
      // Actualizar órdenes con sus pagos
      setOrders(prevOrders => 
        prevOrders.map(order => {
          const paymentResult = paymentsResults.find(p => p.orderId === order.id);
          return {
            ...order,
            payment: paymentResult?.payment || undefined
          };
        })
      );
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = (status: FilterStatus) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openOrderModal = (order: OrderWithPayment) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const openRefundModal = (order: OrderWithPayment) => {
    if (order.payment) {
      setSelectedPayment(order.payment);
      setRefundOrder(order);
      setShowRefundModal(true);
    }
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;

    try {
      setProcessingRefund(selectedPayment.id);
      setError(null);

      await paymentService.updateStatus(selectedPayment.id, 'REEMBOLSADO');
      
      setSuccessMsg('Pago reembolsado exitosamente');
      setTimeout(() => setSuccessMsg(null), 4000);
      
      setShowRefundModal(false);
      
      // Recargar datos
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el reembolso');
    } finally {
      setProcessingRefund(null);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 shadow-lg">
              <ShoppingBagIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
                Administración de Órdenes
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona todas las órdenes y sus pagos
              </p>
            </div>
          </div>
          <button
            onClick={loadOrders}
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
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total órdenes</p>
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
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMsg}
          </div>
        )}

        {/* Tabla de órdenes */}
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
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          No se encontraron órdenes
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => {
                        const statusConf = statusConfig[order.status] || statusConfig.PENDIENTE;
                        const StatusIcon = statusConf.icon;
                        
                        return (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-mono text-indigo-600">
                                #{order.id.slice(0, 8)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <UserIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-mono text-gray-600">
                                  {order.client_id.slice(0, 8)}...
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.text}`}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {statusConf.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {loadingPayments ? (
                                <Spinner size="sm" />
                              ) : order.payment ? (
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusConfig[order.payment.status]?.bg || 'bg-gray-100'} ${paymentStatusConfig[order.payment.status]?.text || 'text-gray-800'}`}>
                                    <CreditCardIcon className="h-3 w-3 mr-1" />
                                    {paymentStatusConfig[order.payment.status]?.label || order.payment.status}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {paymentMethodLabels[order.payment.method] || order.payment.method}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Sin pago</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-indigo-600">
                                {formatCurrency(order.total_amount)}
                              </span>
                              {order.payment && order.payment.discount_applied > 0 && (
                                <p className="text-xs text-green-600">
                                  -{formatCurrency(order.payment.discount_applied)}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                {formatDate(order.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openOrderModal(order)}
                                  className="inline-flex items-center p-1.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                  title="Ver detalles"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                
                                {order.showRefundOption && order.payment && order.payment.status === 'PAGADO' && (
                                  <button
                                    onClick={() => openRefundModal(order)}
                                    className="inline-flex items-center p-1.5 rounded-lg text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
                                    title="Reembolsar pago"
                                  >
                                    <BanknotesIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
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

            {/* Resumen de órdenes rechazadas/canceladas */}
            {orders.some(o => o.status === 'RECHAZADA' || o.status === 'CANCELADA') && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium mb-2">Órdenes con reembolso disponible:</p>
                <div className="space-y-2">
                  {orders.filter(o => o.status === 'RECHAZADA' || o.status === 'CANCELADA').map(o => (
                    <div key={o.id} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-yellow-700">#{o.id.slice(0, 8)}</span>
                      <span className="text-yellow-600">{o.status}</span>
                      {o.payment && o.payment.status === 'PAGADO' && (
                        <button
                          onClick={() => openRefundModal(o)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200"
                        >
                          <ArrowPathRoundedSquareIcon className="h-3 w-3" />
                          Reembolsar {formatCurrency(o.total_amount)}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal Detalle de Orden */}
        {showOrderModal && selectedOrder && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowOrderModal(false)}
              />
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Detalle de Orden #{selectedOrder.id.slice(0, 8)}
                    </h3>
                    <button
                      onClick={() => setShowOrderModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Información general */}
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Estado</p>
                        <div className="flex items-center gap-1 mt-1">
                          {React.createElement(statusConfig[selectedOrder.status]?.icon || ClockIcon, {
                            className: `h-4 w-4 ${statusConfig[selectedOrder.status]?.text || 'text-gray-600'}`
                          })}
                          <span className={`text-sm font-medium ${statusConfig[selectedOrder.status]?.text || 'text-gray-900'}`}>
                            {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-lg font-bold text-indigo-600">
                          {formatCurrency(selectedOrder.total_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cliente ID</p>
                        <p className="text-sm font-mono">{selectedOrder.client_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Restaurante ID</p>
                        <p className="text-sm font-mono">{selectedOrder.restaurant_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Creado</p>
                        <p className="text-sm">{formatDate(selectedOrder.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Actualizado</p>
                        <p className="text-sm">{formatDate(selectedOrder.updated_at)}</p>
                      </div>
                      {selectedOrder.rejection_reason && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Motivo de rechazo</p>
                          <p className="text-sm text-red-600">{selectedOrder.rejection_reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Información de pago */}
                    {selectedOrder.payment && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCardIcon className="h-5 w-5 text-indigo-600" />
                          <h4 className="text-sm font-semibold text-gray-900">Información de Pago</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Estado del pago</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${paymentStatusConfig[selectedOrder.payment.status]?.bg || 'bg-gray-100'} ${paymentStatusConfig[selectedOrder.payment.status]?.text || 'text-gray-800'}`}>
                              {paymentStatusConfig[selectedOrder.payment.status]?.label || selectedOrder.payment.status}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Método</p>
                            <p className="text-sm font-medium mt-1">
                              {paymentMethodLabels[selectedOrder.payment.method] || selectedOrder.payment.method}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Monto</p>
                            <p className="text-sm font-medium">{formatCurrency(selectedOrder.payment.amount)}</p>
                          </div>
                          {selectedOrder.payment.discount_applied > 0 && (
                            <div>
                              <p className="text-xs text-gray-500">Descuento</p>
                              <p className="text-sm font-medium text-green-600">
                                -{formatCurrency(selectedOrder.payment.discount_applied)}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500">Monto final</p>
                            <p className="text-sm font-bold text-indigo-600">
                              {formatCurrency(selectedOrder.payment.final_amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Productos */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Productos</h4>
                      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="px-4 py-3 flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantity} × {formatCurrency(item.unit_price)}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(item.subtotal)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2">
                  {selectedOrder.showRefundOption && selectedOrder.payment?.status === 'PAGADO' && (
                    <button
                      onClick={() => {
                        setShowOrderModal(false);
                        openRefundModal(selectedOrder);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                    >
                      <BanknotesIcon className="h-4 w-4 mr-2" />
                      Reembolsar pago
                    </button>
                  )}
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

        {/* Modal Reembolso */}
        {showRefundModal && selectedPayment && refundOrder && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowRefundModal(false)}
              />
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                      <BanknotesIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirmar Reembolso</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      ¿Estás seguro de que deseas reembolsar este pago?
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Orden:</span>
                        <span className="text-sm font-mono">#{refundOrder.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Estado orden:</span>
                        <span className={`text-sm font-medium ${statusConfig[refundOrder.status]?.text}`}>
                          {refundOrder.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Monto a reembolsar:</span>
                        <span className="text-lg font-bold text-purple-600">
                          {formatCurrency(selectedPayment.final_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Método de pago:</span>
                        <span className="text-sm">
                          {paymentMethodLabels[selectedPayment.method] || selectedPayment.method}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Esta acción cambiará el estado del pago a "REEMBOLSADO" y no se puede deshacer.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRefund}
                    disabled={!!processingRefund}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  >
                    {processingRefund ? (
                      <>
                        <Spinner size="sm" />
                        <span className="ml-2">Procesando...</span>
                      </>
                    ) : (
                      <>
                        <BanknotesIcon className="h-4 w-4 mr-2" />
                        Confirmar reembolso
                      </>
                    )}
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