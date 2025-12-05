export interface IDetallePedidoProveedorRequest {
  producto_id: number;
  cantidad: number;
  precio_compra: number;
}

export interface IDetallePedidoProveedor extends IDetallePedidoProveedorRequest {
  id: number;
  pedido_proveedor_id: number;
  created_at: string;
  updated_at: string;
}
