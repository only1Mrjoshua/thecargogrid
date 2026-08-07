import { useEffect, useState } from 'react';
import {
  Package, Truck, CheckCircle, Clock, AlertTriangle,
  DollarSign, TrendingUp, BarChart3, PieChart
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart,
  Pie, Cell, AreaChart, Area
} from 'recharts';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const statusColors = {
  'In Transit': '#2B0071',
  'Delivered': '#10B981',
  'Pending': '#FF5500',
  'Customs Hold': '#EF4444',
  'Delayed': '#F59E0B',
};

function AdminDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard data states
  const [shipments, setShipments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalShipments: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0,
    customsHolds: 0,
    delayed: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });

  const [shipmentTrend, setShipmentTrend] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch shipments, payments, invoices concurrently
      const [shipmentsRes, paymentsRes, invoicesRes] = await Promise.all([
        api.get('/shipments'),
        api.get('/payments'),
        api.get('/invoices'),
      ]);

      const shipmentsData = shipmentsRes.data.shipments || [];
      const paymentsData = paymentsRes.data.payments || [];
      const invoicesData = invoicesRes.data.invoices || [];

      setShipments(shipmentsData);
      setPayments(paymentsData);
      setInvoices(invoicesData);

      // Compute stats
      const totalShipments = shipmentsData.length;
      const inTransit = shipmentsData.filter(s => s.status === 'In Transit').length;
      const delivered = shipmentsData.filter(s => s.status === 'Delivered' || s.status === 'Completed').length;
      const pending = shipmentsData.filter(s => s.status === 'Pending' || s.status === 'Order Received' || s.status === 'Processing').length;
      const customsHolds = shipmentsData.filter(s => s.status === 'Customs Hold' || s.status === 'Customs Fee Pending').length;
      const delayed = shipmentsData.filter(s => s.status === 'Shipment Delayed').length;
      const pendingPayments = paymentsData.filter(p => p.status === 'Pending' || p.status === 'Unpaid').length;
      
      // Total revenue from paid invoices + paid payments
      const paidInvoices = invoicesData.filter(i => i.status === 'Paid');
      const paidPayments = paymentsData.filter(p => p.status === 'Paid');
      const invoiceRevenue = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
      const paymentRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalRevenue = invoiceRevenue + paymentRevenue;

      setStats({
        totalShipments,
        inTransit,
        delivered,
        pending,
        customsHolds,
        delayed,
        pendingPayments,
        totalRevenue,
      });

      // Shipment trend (group by month)
      const trendMap = {};
      shipmentsData.forEach(s => {
        if (s.date) {
          const date = new Date(s.date);
          const month = date.toLocaleString('default', { month: 'short' });
          if (!trendMap[month]) {
            trendMap[month] = { month, shipments: 0, revenue: 0 };
          }
          trendMap[month].shipments += 1;
          // Add revenue if available (from fees)
          if (s.fees?.total) {
            trendMap[month].revenue += s.fees.total;
          }
        }
      });
      const trendArray = Object.values(trendMap);
      // Sort by month order (Jan, Feb, ...)
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      trendArray.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
      setShipmentTrend(trendArray);

      // Status breakdown
      const statusCounts = {};
      shipmentsData.forEach(s => {
        const status = s.status || 'Unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const breakdown = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
        color: statusColors[name] || '#6B7280',
      }));
      setStatusBreakdown(breakdown);

      // Payment overview: paid vs unpaid per month (using shipment dates)
      const paymentMap = {};
      shipmentsData.forEach(s => {
        if (s.date) {
          const date = new Date(s.date);
          const month = date.toLocaleString('default', { month: 'short' });
          if (!paymentMap[month]) {
            paymentMap[month] = { month, paid: 0, unpaid: 0 };
          }
          if (s.payment === 'Paid') {
            paymentMap[month].paid += 1;
          } else {
            paymentMap[month].unpaid += 1;
          }
        }
      });
      const paymentArray = Object.values(paymentMap);
      paymentArray.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
      // Convert counts to amounts (simple: multiply by 100 for demo)
      paymentArray.forEach(p => {
        p.paid = p.paid * 100;
        p.unpaid = p.unpaid * 100;
      });
      setPaymentData(paymentArray);

      // Recent shipments (latest 5)
      const sorted = [...shipmentsData].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
      });
      setRecentShipments(sorted.slice(0, 5));

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 text-[#EF4444]">
        <p className="font-medium">Error loading dashboard</p>
        <p className="text-sm">{error}</p>
        <button onClick={fetchData} className="mt-2 text-sm font-medium text-[#2B0071] hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const statsCards = [
    { label: 'Total Shipments', value: stats.totalShipments.toLocaleString(), icon: Package, color: 'text-[#2B0071]', bg: 'bg-[#2B0071]/5' },
    { label: 'In Transit', value: stats.inTransit.toLocaleString(), icon: Truck, color: 'text-[#2B0071]', bg: 'bg-[#2B0071]/5' },
    { label: 'Delivered', value: stats.delivered.toLocaleString(), icon: CheckCircle, color: 'text-[#10B981]', bg: 'bg-[#10B981]/5' },
    { label: 'Pending', value: stats.pending.toLocaleString(), icon: Clock, color: 'text-[#FF5500]', bg: 'bg-[#FF5500]/5' },
    { label: 'Customs Holds', value: stats.customsHolds.toLocaleString(), icon: AlertTriangle, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/5' },
    { label: 'Delayed', value: stats.delayed.toLocaleString(), icon: AlertTriangle, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/5' },
    { label: 'Pending Payments', value: stats.pendingPayments.toLocaleString(), icon: DollarSign, color: 'text-[#FF5500]', bg: 'bg-[#FF5500]/5' },
    { label: 'Total Revenue', value: `£${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-[#10B981]', bg: 'bg-[#10B981]/5' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-5 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-[#1A1A2E] mt-1">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipments over time */}
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider">Shipment Trend</h3>
            <BarChart3 size={18} className="text-[#2B0071]/40" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={shipmentTrend.length ? shipmentTrend : [{ month: 'No Data', shipments: 0 }]}>
                <defs>
                  <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2B0071" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2B0071" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E5F0" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E5F0',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="shipments"
                  stroke="#2B0071"
                  strokeWidth={2}
                  fill="url(#colorShipments)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider">Status Breakdown</h3>
            <PieChart size={18} className="text-[#2B0071]/40" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={statusBreakdown.length ? statusBreakdown : [{ name: 'No Data', value: 1, color: '#E2E5F0' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E5F0',
                    borderRadius: '8px',
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second row: Payments & Recent Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment statistics */}
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider">Payment Overview</h3>
            <DollarSign size={18} className="text-[#2B0071]/40" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData.length ? paymentData : [{ month: 'No Data', paid: 0, unpaid: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E5F0" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E5F0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="paid" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unpaid" fill="#FF5500" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Shipments */}
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
          <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider mb-4">Recent Shipments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E5F0] text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-2 font-medium">Tracking</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Destination</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-400">No recent shipments</td>
                  </tr>
                ) : (
                  recentShipments.map((shipment) => (
                    <tr key={shipment.id} className="border-b border-[#E2E5F0] last:border-0">
                      <td className="py-2 font-mono text-xs text-[#2B0071]">{shipment.id}</td>
                      <td className="py-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            shipment.status === 'Delivered' || shipment.status === 'Completed'
                              ? 'bg-[#10B981]/10 text-[#10B981]'
                              : shipment.status === 'Customs Hold' || shipment.status === 'Customs Fee Pending'
                              ? 'bg-[#EF4444]/10 text-[#EF4444]'
                              : shipment.status === 'In Transit' || shipment.status === 'Out for Delivery'
                              ? 'bg-[#2B0071]/10 text-[#2B0071]'
                              : shipment.status === 'Shipment Delayed'
                              ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                              : 'bg-[#FF5500]/10 text-[#FF5500]'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {shipment.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600">{shipment.destination}</td>
                      <td className="py-2 text-gray-500">{shipment.date || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;