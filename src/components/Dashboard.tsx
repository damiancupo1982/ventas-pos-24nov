import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Wallet, BarChart3, Settings, Store } from 'lucide-react';
import { Shift, supabase } from '../lib/supabase';
import Ventas from './Ventas';
import Stock from './Stock';
import Caja from './Caja';
import Reportes from './Reportes';
import Configuracion from './Configuracion';

type View = 'ventas' | 'stock' | 'caja' | 'reportes' | 'configuracion';

interface DashboardProps {
  shift: Shift | null;
  onCloseShift: (closingCash: number) => void;
}

export default function Dashboard({ shift, onCloseShift }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('ventas');
  const [businessName, setBusinessName] = useState('Kiosco Damian');

  useEffect(() => {
    loadBusinessName();
  }, []);

  const loadBusinessName = async () => {
    const { data } = await supabase.from('configuration').select('business_name').maybeSingle();
    if (data) {
      setBusinessName(data.business_name);
    }
  };

  const menuItems = [
    { id: 'ventas' as View, label: 'Ventas', icon: ShoppingCart, color: 'from-emerald-500 to-teal-600' },
    { id: 'stock' as View, label: 'Inventario', icon: Package, color: 'from-blue-500 to-cyan-600' },
    { id: 'caja' as View, label: 'Caja', icon: Wallet, color: 'from-purple-500 to-pink-600' },
    { id: 'reportes' as View, label: 'Reportes', icon: BarChart3, color: 'from-orange-500 to-red-600' },
    { id: 'configuracion' as View, label: 'Configuración', icon: Settings, color: 'from-gray-500 to-slate-600' },
  ];

  const currentItem = menuItems.find(item => item.id === currentView);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                <Store className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {businessName}
                </h1>
                <p className="text-sm text-slate-600">Sistema de Gestión POS</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-700">Turno Activo</p>
                <p className="text-xs text-slate-500">Usuario: Damian</p>
              </div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                        : 'text-slate-600 hover:bg-slate-50 hover:scale-102'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="col-span-12 lg:col-span-10">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className={`bg-gradient-to-r ${currentItem?.color} p-6 text-white`}>
                <div className="flex items-center gap-3">
                  {currentItem && <currentItem.icon size={32} />}
                  <div>
                    <h2 className="text-2xl font-bold">{currentItem?.label}</h2>
                    <p className="text-white/80 text-sm">Gestiona tus {currentItem?.label.toLowerCase()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {currentView === 'ventas' && <Ventas shift={shift} />}
                {currentView === 'stock' && <Stock />}
                {currentView === 'caja' && <Caja shift={shift} onCloseShift={onCloseShift} />}
                {currentView === 'reportes' && <Reportes />}
                {currentView === 'configuracion' && <Configuracion />}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
