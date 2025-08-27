import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { CheckoutDto } from './dto/checkout.dto';
import {
  PaginationOptions,
  PaginationHelper,
  PaginatedResult,
} from '../../common/utils/pagination.util';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // =============  CHECKOUT PROCESS  =============

  /**
   * Procesa el checkout completo: validación, creación de orden, procesamiento de pago y actualización de stock
   */
  async processCheckout(userId: string, checkoutDto: CheckoutDto) {
    // 1. Obtener el carrito del usuario
    const cart = await this.getUserCart(userId);

    if (!cart || cart.lineItems.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // 2. Validar stock disponible para todos los items
    await this.validateCartStock(cart.lineItems);

    // 3. Calcular totales
    const orderTotals = this.calculateOrderTotals(cart.lineItems);

    // 4. Obtener información del usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, names: true, surnames: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 5. Crear la orden
    const order = await this.createOrderFromCart(
      userId,
      checkoutDto.email || user.email,
      cart.lineItems,
      orderTotals,
      checkoutDto,
    );

    // 6. Procesar pago (simulado)
    const paymentResult = await this.processPayment(
      order,
      checkoutDto.paymentMethod,
    );

    // 7. Si el pago es exitoso, actualizar stock y vaciar carrito
    if (paymentResult.success) {
      await this.updateStockAfterOrder(cart.lineItems);
      await this.clearUserCart(userId);

      // Actualizar estado de la orden
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CONFIRMED',
          financialStatus: 'PAID',
          processedAt: new Date(),
        },
      });
    }

    // 8. Retornar resumen de la orden
    return this.formatOrderSummary(order, paymentResult);
  }

  /**
   * Obtiene una orden específica del usuario
   */
  async findUserOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                productImages: {
                  where: { isPrimary: true },
                  take: 1,
                },
                brand: true,
                category: true,
              },
            },
            variant: {
              include: {
                productImage: true,
              },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Verificar que la orden pertenece al usuario
    if (order.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para ver esta orden');
    }

    return order;
  }

  // =============  HELPER METHODS FOR CHECKOUT  =============

  /**
   * Obtiene el carrito del usuario
   */
  private async getUserCart(userId: string) {
    return this.prisma.cart.findFirst({
      where: { userId },
      include: {
        lineItems: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    productImages: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                    brand: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Valida que hay stock suficiente para todos los items del carrito
   */
  private async validateCartStock(cartItems: any[]) {
    for (const item of cartItems) {
      const variant = item.variant;

      if (!variant.isActive || !variant.product.isActive) {
        throw new BadRequestException(
          `El producto "${variant.product.name}" ya no está disponible`,
        );
      }

      if (
        variant.inventoryPolicy === 'DENY' &&
        variant.inventoryQuantity < item.quantity
      ) {
        throw new BadRequestException(
          `Stock insuficiente para "${variant.product.name}". Solo hay ${variant.inventoryQuantity} unidades disponibles`,
        );
      }
    }
  }

  /**
   * Calcula los totales de la orden
   */
  private calculateOrderTotals(cartItems: any[]) {
    let subtotalPrice = 0;

    cartItems.forEach((item) => {
      subtotalPrice += item.variant.price.toNumber() * item.quantity;
    });

    // Por ahora, impuestos y envío son 0, pero se pueden calcular aquí
    const totalTax = 0;
    const totalShipping = 0;
    const totalDiscounts = 0;
    const totalPrice =
      subtotalPrice + totalTax + totalShipping - totalDiscounts;

    return {
      subtotalPrice,
      totalTax,
      totalShipping,
      totalDiscounts,
      totalPrice,
    };
  }

  /**
   * Crea la orden desde el carrito
   */
  private async createOrderFromCart(
    userId: string,
    email: string,
    cartItems: any[],
    totals: any,
    checkoutDto: CheckoutDto,
  ) {
    const orderNumber = await this.generateOrderNumber();

    const orderItems = cartItems.map((item) => ({
      variantId: item.variantId,
      productId: item.variant.productId,
      quantity: item.quantity,
      price: item.variant.price,
      totalDiscount: 0,
      title: item.variant.product.name,
      variantTitle: item.variant.title,
      sku: item.variant.sku,
      vendor: item.variant.product.brand?.name,
      properties: item.properties,
    }));

    return this.prisma.order.create({
      data: {
        userId,
        email,
        orderNumber,
        status: 'PENDING',
        financialStatus: 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
        ...totals,
        billingAddress: checkoutDto.billingAddress,
        shippingAddress: checkoutDto.shippingAddress,
        notes: checkoutDto.notes,
        currency: 'USD',
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                productImages: {
                  where: { isPrimary: true },
                  take: 1,
                },
                brand: true,
              },
            },
            variant: true,
          },
        },
      },
    });
  }

  /**
   * Procesa el pago (simulado)
   */
  private async processPayment(order: any, paymentMethod: any) {
    // Crear transacción de pago
    const transaction = await this.prisma.transaction.create({
      data: {
        orderId: order.id,
        kind: 'SALE',
        gateway: paymentMethod.type,
        status: 'PENDING',
        amount: order.totalPrice,
        currency: order.currency,
        gatewayResponse: {
          paymentMethod: paymentMethod.type,
          details: paymentMethod.details,
          simulatedPayment: true,
        },
      },
    });

    // Simular procesamiento de pago (siempre exitoso por ahora)
    const paymentSuccess = true;

    // Actualizar transacción
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: paymentSuccess ? 'SUCCESS' : 'FAILURE',
        processedAt: new Date(),
        gatewayTransactionId: `sim_${Date.now()}`,
      },
    });

    return {
      success: paymentSuccess,
      transactionId: transaction.id,
      gatewayTransactionId: `sim_${Date.now()}`,
    };
  }

  /**
   * Actualiza el stock después de crear la orden
   */
  private async updateStockAfterOrder(cartItems: any[]) {
    for (const item of cartItems) {
      // Actualizar inventoryQuantity en la variante
      await this.prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          inventoryQuantity: {
            decrement: item.quantity,
          },
        },
      });

      // Crear movimiento de inventario (asumiendo que hay una ubicación por defecto)
      const defaultLocation = await this.getOrCreateDefaultLocation();

      await this.prisma.inventoryMovement.create({
        data: {
          variantId: item.variantId,
          locationId: defaultLocation.id,
          quantity: item.quantity,
          type: 'SALE',
          referenceType: 'ORDER',
          referenceId: item.variant.productId,
          notes: `Venta - Orden procesada`,
        },
      });

      // Actualizar nivel de inventario
      await this.prisma.inventoryLevel.upsert({
        where: {
          variantId_locationId: {
            variantId: item.variantId,
            locationId: defaultLocation.id,
          },
        },
        update: {
          available: {
            decrement: item.quantity,
          },
          onHand: {
            decrement: item.quantity,
          },
        },
        create: {
          variantId: item.variantId,
          locationId: defaultLocation.id,
          available: Math.max(0, -item.quantity),
          onHand: Math.max(0, -item.quantity),
        },
      });
    }
  }

  /**
   * Obtiene o crea la ubicación de inventario por defecto
   */
  private async getOrCreateDefaultLocation() {
    let location = await this.prisma.inventoryLocation.findFirst({
      where: { name: 'Almacén Principal' },
    });

    if (!location) {
      location = await this.prisma.inventoryLocation.create({
        data: {
          name: 'Almacén Principal',
          address: { type: 'main_warehouse' },
        },
      });
    }

    return location;
  }

  /**
   * Vacía el carrito del usuario
   */
  private async clearUserCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (cart) {
      await this.prisma.cartLineItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  }

  /**
   * Formatea el resumen de la orden para la respuesta
   */
  private formatOrderSummary(order: any, paymentResult: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalPrice: order.totalPrice.toNumber(),
      createdAt: order.createdAt.toISOString(),
      paymentStatus: paymentResult.success ? 'SUCCESS' : 'FAILED',
      transactionId: paymentResult.transactionId,
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        productName: item.title,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        price: item.price.toNumber(),
        total: item.price.toNumber() * item.quantity,
        image: item.product.productImages[0]?.url || null,
      })),
    };
  }

  // =============  ÓRDENES  =============
  async create(createOrderDto: CreateOrderDto) {
    const { items, ...orderData } = createOrderDto;

    // Generar número de orden único
    const orderNumber = await this.generateOrderNumber();

    // Calcular totales
    let subtotalPrice = 0;
    let totalTax = 0;
    let totalShipping = 0;
    let totalDiscounts = 0;

    for (const item of items) {
      subtotalPrice += item.price * item.quantity;
    }

    const totalPrice =
      subtotalPrice + totalTax + totalShipping - totalDiscounts;

    return this.prisma.order.create({
      data: {
        ...orderData,
        orderNumber,
        subtotalPrice,
        totalTax,
        totalShipping,
        totalDiscounts,
        totalPrice,
        status: orderData.status as any,
        orderItems: {
          create: items.map((item) => ({
            ...item,
            totalDiscount: 0,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
            variant: true,
          },
        },
        transactions: true,
      },
    });
  }

  async findAll(
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationOptions;
    const offset = PaginationHelper.calculateOffset(page, limit);

    const [orders, totalCount] = await Promise.all([
      this.prisma.order.findMany({
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          orderItems: {
            include: {
              product: true,
              variant: true,
            },
          },
          transactions: true,
          _count: {
            select: { orderItems: true },
          },
        },
      }),
      this.prisma.order.count(),
    ]);

    return PaginationHelper.createPaginatedResult(
      orders,
      totalCount,
      page,
      limit,
    );
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                productImages: {
                  where: { isPrimary: true },
                  take: 1,
                },
                brand: true,
                category: true,
              },
            },
            variant: {
              include: {
                productImage: true,
              },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id); // Verifica que la orden existe

    return this.prisma.order.update({
      where: { id },
      data: {
        ...updateOrderDto,
        status: updateOrderDto.status as any,
        financialStatus: updateOrderDto.financialStatus as any,
        fulfillmentStatus: updateOrderDto.fulfillmentStatus as any,
      },
      include: {
        orderItems: {
          include: {
            product: true,
            variant: true,
          },
        },
        transactions: true,
      },
    });
  }

  async remove(id: string) {
    const order = await this.findOne(id);

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'Solo se pueden eliminar órdenes pendientes',
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async cancelOrder(id: string) {
    const order = await this.findOne(id);

    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException('No se puede cancelar esta orden');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: {
        orderItems: true,
        transactions: true,
      },
    });
  }

  // Buscar órdenes por usuario
  async findOrdersByUser(
    userId: string,
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationOptions;
    const offset = PaginationHelper.calculateOffset(page, limit);

    const [orders, totalCount] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  productImages: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
              variant: true,
            },
          },
          _count: {
            select: { orderItems: true },
          },
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return PaginationHelper.createPaginatedResult(
      orders,
      totalCount,
      page,
      limit,
    );
  }

  // Buscar órdenes por estado
  async findOrdersByStatus(
    status: string,
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationOptions;
    const offset = PaginationHelper.calculateOffset(page, limit);

    const [orders, totalCount] = await Promise.all([
      this.prisma.order.findMany({
        where: { status: status as any },
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          orderItems: {
            include: {
              product: true,
              variant: true,
            },
          },
          transactions: true,
        },
      }),
      this.prisma.order.count({ where: { status: status as any } }),
    ]);

    return PaginationHelper.createPaginatedResult(
      orders,
      totalCount,
      page,
      limit,
    );
  }

  // =============  TRANSACCIONES  =============
  async createTransaction(createTransactionDto: CreateTransactionDto) {
    // Verificar que la orden existe
    const order = await this.findOne(createTransactionDto.orderId);

    return this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        kind: createTransactionDto.kind as any,
        status: 'PENDING',
        currency: createTransactionDto.currency || order.currency,
      },
      include: {
        order: true,
        parent: true,
        children: true,
      },
    });
  }

  async findTransactionsByOrder(orderId: string) {
    await this.findOne(orderId); // Verifica que la orden existe

    return this.prisma.transaction.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async updateTransaction(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...updateTransactionDto,
        status: updateTransactionDto.status as any,
        processedAt:
          updateTransactionDto.status === 'SUCCESS' ? new Date() : undefined,
      },
      include: {
        order: true,
        parent: true,
        children: true,
      },
    });
  }

  // Obtener estadísticas de órdenes
  async getOrderStats() {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.order.count({ where: { status: 'SHIPPED' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      this.prisma.order.aggregate({
        where: { status: { in: ['DELIVERED', 'SHIPPED'] } },
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      totalOrders,
      ordersByStatus: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    };
  }

  // Método privado para generar número de orden
  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `${year}${month}${day}`;

    // Buscar el último número de orden del día
    const lastOrder = await this.prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.substring(8));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
