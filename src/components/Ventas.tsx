import { useState, useEffect } from 'react';
import { supabase, Product, SaleItem, Shift } from '../lib/supabase';
import { Search, Minus, Plus, Trash2, ShoppingCart, CreditCard } from 'lucide-react';

interface VentasProps {
  shift: Shift | null;
}

export default function Ventas({ shift }: VentasProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').eq('active', true).gt('stock', 0);
    setProducts(data || []);
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.product_id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return alert('Stock insuficiente');
      setCart(cart.map(i => i.product_id === product.id ? {...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price} : i));
    } else {
      setCart([...cart, {product_id: product.id, product_name: product.name, quantity: 1, price: product.price, subtotal: product.price}]);
    }
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return setCart(cart.filter(i => i.product_id !== id));
    setCart(cart.map(i => i.product_id === id ? {...i, quantity: qty, subtotal: qty * i.price} : i));
  };

  const total = cart.reduce((sum, i) => sum + i.subtotal, 0);

  const completeSale = async () => {
    if (!cart.length || !shift) return alert('Carrito vacío o sin turno');

    const saleData = {
      sale_number: `V-${Date.now()}`,
      date: new Date().toISOString(),
      user_id: '00000000-0000-0000-0000-000000000003',
      user_name: 'Damian',
      shift_id: shift.id,
      items: cart,
      subtotal: total,
      discount: 0,
      total,
      payment_method: paymentMethod
    };

    await supabase.from('sales').insert([saleData]);

    for (const item of cart) {
      const prod = products.find(p => p.id === item.product_id);
      if (prod) {
        await supabase.from('products').update({stock: prod.stock - item.quantity}).eq('id', item.product_id);
      }
    }

    await supabase.from('cash_transactions').insert([{
      shift_id: shift.id,
      type: 'income',
      category: 'venta',
      amount: total,
      payment_method: paymentMethod,
      description: `Venta ${saleData.sale_number}`
    }]);

    alert('Venta completada');
    setCart([]);
    loadProducts();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 hover:border-emerald-500 rounded-xl p-4 text-left transition-all hover:shadow-lg"
            >
              <h3 className="font-bold text-slate-800 mb-1">{p.name}</h3>
              <p className="text-2xl font-bold text-emerald-600">${p.price.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">Stock: {p.stock}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg p-4 border-2 border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="text-emerald-600" size={24} />
            <h3 className="text-lg font-bold text-slate-800">Carrito</h3>
          </div>

          <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
            {cart.map(item => (
              <div key={item.product_id} className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{item.product_name}</span>
                  <button onClick={() => updateQuantity(item.product_id, 0)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="w-8 h-8 bg-slate-100 rounded-lg"><Minus size={16} /></button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 bg-slate-100 rounded-lg"><Plus size={16} /></button>
                  </div>
                  <span className="font-bold text-emerald-600">${item.subtotal.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-slate-200 pt-4 space-y-3">
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="qr">QR</option>
              <option value="tarjeta">Tarjeta</option>
            </select>

            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Total:</span>
              <span className="text-emerald-600">${total.toFixed(2)}</span>
            </div>

            <button
              onClick={completeSale}
              disabled={!cart.length}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <CreditCard size={24} />
              Completar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
