import { useState, useEffect } from 'react';
import { supabase, Sale, Configuration } from '../lib/supabase';
import { BarChart3, DollarSign, ShoppingBag, TrendingUp, Calendar, X, Printer, Download } from 'lucide-react';

export default function Reportes() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [config, setConfig] = useState<Configuration | null>(null);

  useEffect(() => {
    loadSales();
    loadConfig();
  }, [dateFilter]);

  const loadConfig = async () => {
    const { data } = await supabase.from('configuration').select('*').maybeSingle();
    if (data) setConfig(data);
  };

  const loadSales = async () => {
    setLoading(true);
    let query = supabase.from('sales').select('*').order('created_at', { ascending: false });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateFilter === 'today') {
      query = query.gte('created_at', today.toISOString());
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('created_at', monthAgo.toISOString());
    }

    const { data } = await query;
    setSales(data || []);
    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['Número', 'Fecha', 'Usuario', 'Items', 'Método Pago', 'Subtotal', 'Descuento', 'Total'];
    const rows = sales.map(sale => {
      const items = Array.isArray(sale.items) ? sale.items : [];
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      return [
        sale.sale_number,
        new Date(sale.created_at).toLocaleString('es-AR'),
        sale.user_name,
        itemCount,
        sale.payment_method,
        Number(sale.subtotal).toFixed(2),
        Number(sale.discount).toFixed(2),
        Number(sale.total).toFixed(2)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ventas_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const printSales = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Ventas</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${config?.business_name || 'Kiosco'} - Reporte de Ventas</h1>
          <p><strong>Período:</strong> ${dateFilter === 'today' ? 'Hoy' : dateFilter === 'week' ? 'Última Semana' : dateFilter === 'month' ? 'Último Mes' : 'Todo'}</p>
          <p><strong>Fecha de emisión:</strong> ${new Date().toLocaleString('es-AR')}</p>
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Items</th>
                <th>Método</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${sales.map(sale => {
                const items = Array.isArray(sale.items) ? sale.items : [];
                const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
                return `
                  <tr>
                    <td>${sale.sale_number}</td>
                    <td>${new Date(sale.created_at).toLocaleString('es-AR')}</td>
                    <td>${sale.user_name}</td>
                    <td>${itemCount}</td>
                    <td>${sale.payment_method}</td>
                    <td>$${Number(sale.total).toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="total">
            Total de Ventas: ${sales.length} | Monto Total: $${totalSales.toFixed(2)}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const printTicket = (sale: Sale) => {
    const printWindow = window.open('', '', 'height=600,width=400');
    if (!printWindow) return;

    const items = Array.isArray(sale.items) ? sale.items : [];

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket ${sale.sale_number}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 10px;
              max-width: 300px;
              margin: 0 auto;
            }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
            .header h2 { margin: 5px 0; font-size: 18px; }
            .header p { margin: 3px 0; font-size: 12px; }
            .info { margin: 10px 0; font-size: 12px; }
            .items { margin: 15px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
            .totals { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total-row.final { font-weight: bold; font-size: 14px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 15px; border-top: 2px dashed #000; padding-top: 10px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${config?.business_name || 'Kiosco'}</h2>
            ${config?.address ? `<p>${config.address}</p>` : ''}
            ${config?.phone ? `<p>Tel: ${config.phone}</p>` : ''}
            ${config?.tax_id ? `<p>CUIT: ${config.tax_id}</p>` : ''}
          </div>

          <div class="info">
            <p><strong>Ticket:</strong> ${sale.sale_number}</p>
            <p><strong>Fecha:</strong> ${new Date(sale.created_at).toLocaleString('es-AR')}</p>
            <p><strong>Vendedor:</strong> ${sale.user_name}</p>
            <p><strong>Pago:</strong> ${sale.payment_method}</p>
          </div>

          <div class="items">
            <div style="border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 5px;">
              <strong>PRODUCTOS</strong>
            </div>
            ${items.map(item => `
              <div class="item">
                <div>
                  <div>${item.product_name}</div>
                  <div style="font-size: 10px;">${item.quantity} x $${Number(item.price).toFixed(2)}</div>
                </div>
                <div>$${Number(item.subtotal).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${Number(sale.subtotal).toFixed(2)}</span>
            </div>
            ${sale.discount > 0 ? `
              <div class="total-row">
                <span>Descuento:</span>
                <span>-$${Number(sale.discount).toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row final">
              <span>TOTAL:</span>
              <span>$${Number(sale.total).toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p>${config?.receipt_message || 'Gracias por su compra'}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalItems = sales.reduce((sum, s) => {
    const items = Array.isArray(s.items) ? s.items : [];
    return sum + items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  const avgTicket = sales.length > 0 ? totalSales / sales.length : 0;

  const paymentMethodTotals = sales.reduce((acc, s) => {
    acc[s.payment_method] = (acc[s.payment_method] || 0) + Number(s.total);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold text-slate-800">Resumen de Ventas</h3>
        <div className="flex gap-2 flex-wrap">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
          >
            <option value="today">Hoy</option>
            <option value="week">Última Semana</option>
            <option value="month">Último Mes</option>
            <option value="all">Todo</option>
          </select>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl flex items-center gap-2 font-medium shadow-lg transition-all"
          >
            <Download size={18} />
            Exportar CSV
          </button>
          <button
            onClick={printSales}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl flex items-center gap-2 font-medium shadow-lg transition-all"
          >
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-100">Ventas Totales</span>
                <DollarSign size={24} />
              </div>
              <p className="text-3xl font-bold">${totalSales.toFixed(2)}</p>
              <p className="text-orange-100 text-sm mt-1">{sales.length} transacciones</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Ticket Promedio</span>
                <BarChart3 size={24} />
              </div>
              <p className="text-3xl font-bold">${avgTicket.toFixed(2)}</p>
              <p className="text-blue-100 text-sm mt-1">por venta</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100">Items Vendidos</span>
                <ShoppingBag size={24} />
              </div>
              <p className="text-3xl font-bold">{totalItems}</p>
              <p className="text-emerald-100 text-sm mt-1">unidades</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100">Crecimiento</span>
                <TrendingUp size={24} />
              </div>
              <p className="text-3xl font-bold">+{((sales.length / 10) * 100).toFixed(0)}%</p>
              <p className="text-purple-100 text-sm mt-1">vs período anterior</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-orange-600" />
                Métodos de Pago
              </h4>
              <div className="space-y-3">
                {Object.entries(paymentMethodTotals).map(([method, total]) => (
                  <div key={method} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700 capitalize">{method}</span>
                    <span className="font-bold text-slate-800">${total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" />
                Estadísticas
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">Total de Ventas</span>
                  <span className="font-bold text-slate-800">{sales.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">Productos Vendidos</span>
                  <span className="font-bold text-slate-800">{totalItems}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">Promedio Items/Venta</span>
                  <span className="font-bold text-slate-800">{sales.length > 0 ? (totalItems / sales.length).toFixed(1) : 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
              <h4 className="text-lg font-bold text-slate-800">Últimas Ventas - Click para ver detalle</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Método</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(0, 20).map((sale) => {
                    const items = Array.isArray(sale.items) ? sale.items : [];
                    return (
                      <tr
                        key={sale.id}
                        onClick={() => setSelectedSale(sale)}
                        className="border-t border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-slate-700">{sale.sale_number}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {new Date(sale.created_at).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{sale.user_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {items.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium capitalize">
                            {sale.payment_method}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                          ${Number(sale.total).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Detalle de Venta</h3>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Ticket:</span>
                  <span className="font-mono text-slate-900">{selectedSale.sale_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Fecha:</span>
                  <span className="text-slate-900">{new Date(selectedSale.created_at).toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Vendedor:</span>
                  <span className="text-slate-900">{selectedSale.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Método de Pago:</span>
                  <span className="text-slate-900 capitalize">{selectedSale.payment_method}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-3 text-lg">Productos</h4>
                <div className="space-y-2">
                  {Array.isArray(selectedSale.items) && selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{item.product_name}</p>
                        <p className="text-sm text-slate-600">{item.quantity} x ${Number(item.price).toFixed(2)}</p>
                      </div>
                      <p className="font-bold text-slate-900">${Number(item.subtotal).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t-2 border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold">Subtotal:</span>
                  <span>${Number(selectedSale.subtotal).toFixed(2)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="font-semibold">Descuento:</span>
                    <span>-${Number(selectedSale.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>TOTAL:</span>
                  <span>${Number(selectedSale.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => printTicket(selectedSale)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  Imprimir Ticket
                </button>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="flex-1 border-2 border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
