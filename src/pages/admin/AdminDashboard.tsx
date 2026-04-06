import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['hsl(150,100%,50%)', '#666', '#888', '#aaa', '#ccc'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, revenueToday: 0, revenueTotal: 0 });
  const [dailyOrders, setDailyOrders] = useState<any[]>([]);
  const [wilayaData, setWilayaData] = useState<any[]>([]);
  const [deliveryData, setDeliveryData] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const { data: orders } = await supabase.from('orders').select('*');
    if (!orders) return;

    const today = new Date().toISOString().split('T')[0];
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'nouveau').length;
    const revenueToday = orders.filter(o => (o.created_at as string).startsWith(today)).reduce((s, o) => s + Number(o.total), 0);
    const revenueTotal = orders.reduce((s, o) => s + Number(o.total), 0);
    setStats({ total, pending, revenueToday, revenueTotal });

    // Daily orders (last 7 days)
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toISOString().split('T')[0]] = 0;
    }
    orders.forEach(o => {
      const d = (o.created_at as string).split('T')[0];
      if (d in days) days[d]++;
    });
    setDailyOrders(Object.entries(days).map(([date, count]) => ({ date: date.slice(5), count })));

    // Wilaya distribution
    const wMap: Record<string, number> = {};
    orders.forEach(o => { wMap[o.wilaya] = (wMap[o.wilaya] || 0) + 1; });
    setWilayaData(Object.entries(wMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value })));

    // Delivery type
    const dMap: Record<string, number> = {};
    orders.forEach(o => { dMap[o.delivery_type] = (dMap[o.delivery_type] || 0) + 1; });
    setDeliveryData(Object.entries(dMap).map(([name, value]) => ({ name, value })));
  }

  const statCards = [
    { label: 'Total Commandes', value: stats.total },
    { label: 'En attente', value: stats.pending },
    { label: "Revenu aujourd'hui", value: `${stats.revenueToday} DA` },
    { label: 'Revenu total', value: `${stats.revenueTotal} DA` },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {statCards.map(s => (
            <div key={s.label} className="bg-white border border-border p-4 shadow-sm">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">{s.label}</p>
              <p className="text-xl font-black text-primary mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-border p-4 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3">Commandes / 7 jours</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={dailyOrders}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} />
              <Bar dataKey="count" fill="hsl(150,100%,50%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-border p-4 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Par wilaya (top 5)</p>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={wilayaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} label={({ name }) => <text fontSize={10} fill="#666">{name}</text>}>
                  {wilayaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-border p-4 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Par livraison</p>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={deliveryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} label={({ name }) => <text fontSize={10} fill="#666">{name}</text>}>
                  {deliveryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
