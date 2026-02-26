import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(@Inject('PEDIDOS_SERVICE') private client: ClientProxy) {}

  enviarPedido(datos: any) {
    // emit() envía el mensaje sin esperar respuesta (ideal para eventos)
    return this.client.emit('pedido_creado', datos);
  }
}