// ─────────────────────────────────────────────────────────────
// Infrastructure: EmailTemplates
// SRP: Solo genera el HTML de cada tipo de correo.
//      Centralizado para que los cambios de diseño no toquen
//      los casos de uso.
// ─────────────────────────────────────────────────────────────

export interface ProductItem {
  name:     string;
  quantity: number;
  price:    number;
}

function productRows(products: ProductItem[]): string {
  return products
    .map(
      (p) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;">${p.name}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${p.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">$${p.price.toFixed(2)}</td>
      </tr>`,
    )
    .join('');
}

function baseLayout(title: string, body: string): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
    <div style="background:#1a1a2e;padding:20px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:20px;">🛵 Tu App de Pedidos</h1>
    </div>
    <div style="padding:24px;">
      <h2 style="color:#1a1a2e;">${title}</h2>
      ${body}
    </div>
    <div style="background:#f5f5f5;padding:12px;text-align:center;font-size:12px;color:#888;">
      Este es un correo automático, por favor no respondas a este mensaje.
    </div>
  </div>`;
}

// ── 1. Orden creada ───────────────────────────────────────────
export function orderCreatedHtml(data: {
  clientName:  string;
  orderId:     string;
  products:    ProductItem[];
  totalAmount: number;
  createdAt:   string;
}): string {
  const body = `
    <p>Hola <strong>${data.clientName}</strong>, ¡gracias por tu pedido!</p>
    <p><strong>N° de Orden:</strong> ${data.orderId}</p>
    <p><strong>Fecha:</strong> ${data.createdAt}</p>
    <p><strong>Estado:</strong> <span style="color:#f39c12;">CREADA</span></p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:8px;text-align:left;">Producto</th>
          <th style="padding:8px;text-align:center;">Cant.</th>
          <th style="padding:8px;text-align:right;">Precio</th>
        </tr>
      </thead>
      <tbody>${productRows(data.products)}</tbody>
    </table>
    <p style="text-align:right;font-size:18px;margin-top:12px;">
      <strong>Total: $${data.totalAmount.toFixed(2)}</strong>
    </p>`;
  return baseLayout('¡Pedido recibido!', body);
}

// ── 2. Cancelación por cliente ────────────────────────────────
export function orderCancelledByClientHtml(data: {
  clientName:  string;
  orderId:     string;
  products:    ProductItem[];
  cancelledAt: string;
}): string {
  const body = `
    <p>Hola <strong>${data.clientName}</strong>, tu pedido ha sido cancelado.</p>
    <p><strong>N° de Orden:</strong> ${data.orderId}</p>
    <p><strong>Fecha de cancelación:</strong> ${data.cancelledAt}</p>
    <p><strong>Estado:</strong> <span style="color:#e74c3c;">CANCELADA</span></p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:8px;text-align:left;">Producto</th>
          <th style="padding:8px;text-align:center;">Cant.</th>
          <th style="padding:8px;text-align:right;">Precio</th>
        </tr>
      </thead>
      <tbody>${productRows(data.products)}</tbody>
    </table>`;
  return baseLayout('Pedido cancelado', body);
}

// ── 3. Orden en camino ────────────────────────────────────────
export function orderInTransitHtml(data: {
  orderId:      string;
  deliveryName: string;
  products:     ProductItem[];
}): string {
  const body = `
    <p>¡Buenas noticias! Tu pedido <strong>#${data.orderId}</strong> ya está en camino. 🛵</p>
    <p><strong>Repartidor:</strong> ${data.deliveryName}</p>
    <p><strong>Estado:</strong> <span style="color:#27ae60;">EN CAMINO</span></p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:8px;text-align:left;">Producto</th>
          <th style="padding:8px;text-align:center;">Cant.</th>
          <th style="padding:8px;text-align:right;">Precio</th>
        </tr>
      </thead>
      <tbody>${productRows(data.products)}</tbody>
    </table>`;
  return baseLayout('Tu pedido está en camino', body);
}

// ── 4. Cancelación por restaurante ────────────────────────────
export function orderCancelledByRestaurantHtml(data: {
  orderId:        string;
  restaurantName: string;
  cancelReason:   string;
  products:       ProductItem[];
}): string {
  const body = `
    <p>Lamentamos informarte que el restaurante <strong>${data.restaurantName}</strong> ha cancelado tu pedido.</p>
    <p><strong>N° de Orden:</strong> ${data.orderId}</p>
    <p><strong>Motivo:</strong> ${data.cancelReason}</p>
    <p><strong>Estado:</strong> <span style="color:#e74c3c;">CANCELADA</span></p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:8px;text-align:left;">Producto</th>
          <th style="padding:8px;text-align:center;">Cant.</th>
          <th style="padding:8px;text-align:right;">Precio</th>
        </tr>
      </thead>
      <tbody>${productRows(data.products)}</tbody>
    </table>`;
  return baseLayout('Tu pedido fue cancelado por el restaurante', body);
}

// ── 5. Cancelación por repartidor ─────────────────────────────
export function orderCancelledByDeliveryHtml(data: {
  orderId:      string;
  deliveryName: string;
  cancelReason: string;
  products:     ProductItem[];
}): string {
  const body = `
    <p>Lamentamos informarte que el repartidor <strong>${data.deliveryName}</strong> ha cancelado la entrega de tu pedido.</p>
    <p><strong>N° de Orden:</strong> ${data.orderId}</p>
    <p><strong>Motivo:</strong> ${data.cancelReason}</p>
    <p><strong>Estado:</strong> <span style="color:#e74c3c;">CANCELADA</span></p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:8px;text-align:left;">Producto</th>
          <th style="padding:8px;text-align:center;">Cant.</th>
          <th style="padding:8px;text-align:right;">Precio</th>
        </tr>
      </thead>
      <tbody>${productRows(data.products)}</tbody>
    </table>`;
  return baseLayout('Entrega cancelada por el repartidor', body);
}

// ── 6. Orden rechazada ────────────────────────────────────────
export function orderRejectedHtml(data: {
  orderId:        string;
  restaurantName: string;
  products:       ProductItem[];
}): string {
  const body = `
    <p>El restaurante <strong>${data.restaurantName}</strong> ha rechazado tu pedido <strong>#${data.orderId}</strong>.</p>
    <p><strong>Estado:</strong> <span style="color:#e74c3c;">RECHAZADA</span></p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:8px;text-align:left;">Producto</th>
          <th style="padding:8px;text-align:center;">Cant.</th>
          <th style="padding:8px;text-align:right;">Precio</th>
        </tr>
      </thead>
      <tbody>${productRows(data.products)}</tbody>
    </table>
    <p style="margin-top:16px;">Puedes realizar un nuevo pedido a otro restaurante.</p>`;
  return baseLayout('Tu pedido fue rechazado', body);
}
