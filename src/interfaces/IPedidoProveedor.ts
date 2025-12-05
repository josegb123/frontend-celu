export interface IPedidoProveedorRequest {
  numero_factura_proveedor: string;
  fecha_entrega: string; // YYYY-MM-DD
  proveedor_id: number;
  monto_total: number;
  productos: IDetallePedidoProveedorRequest[];
}

export interface IPedidoProveedor extends IPedidoProveedorRequest {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}
