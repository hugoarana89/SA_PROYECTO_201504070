import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { orderService }       from '../../services/order.service';
import { notificationService } from '../../services/notification.service';
import { paymentService }      from '../../services/payment.service';
import type { Order, OrderStatus } from '../../types/order.types';
import { useCart }    from '../../context/CartContext';
import { getUser }    from '../../utils/authStorage';
import Spinner        from '../../components/Spinner';
import CheckoutModal  from './CheckoutModal';

const statusColors: Record<OrderStatus, { bg: string; text: string; icon: any }> = {
  'CREADA':     { bg: 'bg-blue-100',   text: 'text-blue-800',   icon: ClockIcon        },
  'EN_PROCESO': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ArrowPathIcon    },
  'LISTA':      { bg: 'bg-orange-100', text: 'text-orange-800', icon: CheckCircleIcon  },
  'FINALIZADA': { bg: 'bg-green-100',  text: 'text-green-800',  icon: CheckCircleIcon  },
  'CANCELADA':  { bg: 'bg-gray-100',   text: 'text-gray-800',   icon: XCircleIcon      },
  'RECHAZADA':  { bg: 'bg-red-100',    text: 'text-red-800',    icon: XCircleIcon      },
};

const statusLabels: Record<OrderStatus, string> = {
  'CREADA':     'Creada',
  'EN_PROCESO': 'En proceso',
  'LISTA':      'Lista para entregar',
  'FINALIZADA': 'Finalizada',
  'CANCELADA':  'Cancelada',
  'RECHAZADA':  'Rechazada',
};

const getClientInfo = (): { email: string; name: string } => {
  const user  = getUser();
  const email = user?.email || user?.sub || '';
  const name  = email.split('@')[0] || 'Cliente';
  return { email, name };
};

const MyOrders: React.FC = () => {
  const [orders, setOrders]                 = useState<Order[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'TODAS'>('TODAS');
  const [page, setPage]                     = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  // ── Checkout state ────────────────────────────────────────
  const [checkoutOpen, setCheckoutOpen]     = useState(false);
  const [checkoutOrder, setCheckoutOrder]   = useState<{ id: string; amount: number } | null>(null);
  // Mapa de pagos ya existentes por orderId
  const [paidOrders, setPaidOrders]         = useState<Set<string>>(new Set());

  const { cart, clearCart } = useCart();

  useEffect(() => { loadOrders(); }, [selectedStatus, page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getClientOrders({
        page,
        limit: 10,
        status: selectedStatus !== 'TODAS' ? selectedStatus : undefined,
      });

      const fetched = data.orders.map(o => ({ ...o, restaurant_name: 'Restaurante' }));
      setOrders(fetched);
      setTotalPages(Math.ceil(data.total / data.limit));
      setError(null);

      // Verificar cuáles órdenes ya tienen pago registrado
      const paid = new Set<string>();
      await Promise.allSettled(
        fetched.map(async o => {
          try {
            await paymentService.getByOrder(o.id);
            paid.add(o.id);
          } catch { /* no tiene pago */ }
        }),
      );
      setPaidOrders(paid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!window.confirm('¿Estás seguro de cancelar esta orden?')) return;
    try {
      setCancellingOrder(order.id);
      await orderService.cancelOrder(order.id);
      const { email, name } = getClientInfo();
      await notificationService.notifyOrderCancelledByClient({
        client_name:  name,
        client_email: email,
        order_id:     order.id,
        products:     order.items.map(i => ({ name: i.product_name, quantity: i.quantity, price: i.unit_price })),
        cancelled_at: new Date().toISOString(),
      });
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar la orden');
    } finally {
      setCancellingOrder(null);
    }
  };

  const handleCreateOrderFromCart = async () => {
    if (!cart) return;
    try {
      setLoading(true);
      const newOrder = await orderService.createOrder({
        restaurant_id: cart.restaurant_id,
        items: cart.items.map(item => ({
          menu_item_id:  item.menu_item_id,
          quantity:      item.quantity,
          price:         item.unit_price,
          product_name:  item.product_name,
        })),
      });
      const { email, name } = getClientInfo();
      await notificationService.notifyOrderCreated({
        client_name:  name,
        client_email: email,
        order_id:     newOrder.id,
        products:     newOrder.items.map(i => ({ name: i.product_name, quantity: i.quantity, price: i.unit_price })),
        total_amount: newOrder.total_amount,
        created_at:   newOrder.created_at,
      });
      clearCart();
      await loadOrders();
      alert('¡Orden creada exitosamente! Ahora puedes proceder al pago.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  const openCheckout = (order: Order) => {
    setCheckoutOrder({ id: order.id, amount: order.total_amount });
    setCheckoutOpen(true);
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('es-GT', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <>
      {/* Modal de checkout */}
      {checkoutOrder && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => { loadOrders(); setCheckoutOpen(false); }}
          orderId={checkoutOrder.id}
          amount={checkoutOrder.amount}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                Mis Órdenes
              </h2>
              <p className="mt-1 text-sm text-gray-500">Historial y seguimiento de tus pedidos</p>
            </div>
            {/* Acceso rápido a pagos */}
            <Link
              to="/client/payments"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <CreditCardIcon className="h-5 w-5 text-gray-500" />
              Ver mis pagos
            </Link>
          </div>

          {/* Carrito pendiente */}
          {cart && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingBagIcon className="h-8 w-8 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-indigo-900">
                      Carrito pendiente - {cart.restaurant_name}
                    </h3>
                    <p className="text-indigo-700">
                      {cart.items.length} items • Total: Q{cart.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCreateOrderFromCart}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <BanknotesIcon className="-ml-1 mr-2 h-5 w-5" />
                  Realizar pedido
                </button>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado</label>
            <select
              value={selectedStatus}
              onChange={e => { setSelectedStatus(e.target.value as OrderStatus | 'TODAS'); setPage(1); }}
              className="block w-full md:w-64 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="TODAS">Todas las órdenes</option>
              <option value="CREADA">Creadas</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="LISTA">Lista para entregar</option>
              <option value="FINALIZADA">Finalizadas</option>
              <option value="CANCELADA">Canceladas</option>
              <option value="RECHAZADA">Rechazadas</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">{error}</div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedStatus === 'TODAS'
                  ? 'Aún no has realizado ninguna orden'
                  : `No hay órdenes con estado ${statusLabels[selectedStatus as OrderStatus]}`}
              </p>
              <Link to="/" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Ver restaurantes
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => {
                const StatusIcon = statusColors[order.status].icon;
                const hasPago    = paidOrders.has(order.id);
                // Mostrar botón de pago solo en órdenes CREADAS o EN_PROCESO sin pago aún
                const canPay = !hasPago && ['CREADA', 'EN_PROCESO'].includes(order.status);

                return (
                  <div key={order.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              Orden #{order.id.slice(0,8)}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                              <StatusIcon className="mr-1 h-4 w-4" />
                              {statusLabels[order.status]}
                            </span>
                            {/* Indicador de pago */}
                            {hasPago && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                <CheckCircleIcon className="h-3.5 w-3.5" />Pagado
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{formatDate(order.created_at)}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold text-indigo-600">
                            Q{order.total_amount.toFixed(2)}
                          </p>
                          {/* Botón pagar */}
                          {canPay && (
                            <button
                              onClick={() => openCheckout(order)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 active:scale-95 transition-all shadow-md shadow-indigo-200"
                            >
                              <CreditCardIcon className="h-4 w-4" />
                              Pagar ahora
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200">
                      <div className="bg-gray-50 px-4 py-3">
                        <p className="text-sm font-medium text-gray-700">Items de la orden:</p>
                      </div>
                      <ul className="divide-y divide-gray-200">
                        {order.items.map(item => (
                          <li key={item.id} className="px-4 py-3 flex items-center justify-between text-sm">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product_name}</p>
                              <p className="text-gray-500">Cantidad: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-gray-900">Q{item.subtotal.toFixed(2)}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {order.rejection_reason && (
                      <div className="border-t border-gray-200 bg-red-50 px-4 py-3">
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Motivo del rechazo:</span> {order.rejection_reason}
                        </p>
                      </div>
                    )}

                    {order.status === 'FINALIZADA' && (
                      <div className="border-t border-gray-200 bg-green-50 px-4 py-3">
                        <div className="flex items-center text-green-700">
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          <p className="text-sm font-medium">¡Has recibido tu orden!</p>
                        </div>
                      </div>
                    )}

                    {order.status === 'CREADA' && (
                      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-right">
                        <button
                          onClick={() => handleCancelOrder(order)}
                          disabled={cancellingOrder === order.id}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {cancellingOrder === order.id
                            ? <Spinner size="sm" />
                            : <><XCircleIcon className="-ml-1 mr-2 h-4 w-4 text-gray-500" />Cancelar orden</>
                          }
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
        </div>
      </div>
    </>
  );
};

export default MyOrders;
