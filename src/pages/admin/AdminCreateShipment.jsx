import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Package, User, Truck, Calendar } from 'lucide-react';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance with auth interceptor
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

const statusOptions = [
  'Order Received',
  'Processing',
  'In Transit',
  'Customs',
  'Out for Delivery',
  'Delivered',
];

const packageTypes = ['Standard Parcel', 'Express Parcel', 'Freight', 'Documents', 'Fragile', 'Electronics'];

function AdminCreateShipment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer: '',
    email: '',
    phone: '',
    address: '',
    // Let the backend generate the tracking number, but we can pre-fill an optional field
    id: `TCG-${Math.floor(Math.random() * 10**12).toString().padStart(12, '0')}`,
    packageType: 'Standard Parcel',
    weight: '',
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    status: 'Order Received',
    payment: 'Unpaid',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.customer || !formData.origin || !formData.destination) {
      alert('Please fill in all required fields (Customer, Origin, Destination).');
      return;
    }

    setIsSubmitting(true);

    try {
      // We'll send the tracking number as 'id' if provided; backend will generate if missing.
      // The backend pre-save hook will generate a new ID if none is provided, but we have one.
      const payload = {
        id: formData.id,
        customer: formData.customer,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        packageType: formData.packageType,
        weight: formData.weight || undefined,
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,
        expectedDelivery: formData.expectedDelivery || undefined,
        status: formData.status,
        payment: formData.payment,
      };

      await api.post('/shipments', payload);

      // Navigate back on success
      navigate('/admin/shipments');
    } catch (err) {
      console.error('Error creating shipment:', err);
      setError(err.response?.data?.message || 'Failed to create shipment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/shipments')}
          className="p-2 text-[#1A1A2E]/60 hover:text-[#1A1A2E] hover:bg-[#F8F9FD] rounded-xl transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-[#1A1A2E]">Create New Shipment</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 space-y-6">
        {/* Error message */}
        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-3 text-sm text-[#EF4444] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            {error}
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider flex items-center gap-2 mb-4">
            <User size={16} className="text-[#2B0071]" />
            Customer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Customer Name *</label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E5F0] pt-6">
          <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider flex items-center gap-2 mb-4">
            <Package size={16} className="text-[#2B0071]" />
            Shipment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Tracking Number</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              />
              <p className="text-xs text-gray-400 mt-1">Auto‑generated – you can edit before saving</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Package Type</label>
              <select
                name="packageType"
                value={formData.packageType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              >
                {packageTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Weight (kg)</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Origin *</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Destination *</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Shipment Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Expected Delivery Date</label>
              <input
                type="date"
                name="expectedDelivery"
                value={formData.expectedDelivery}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Payment Status</label>
              <select
                name="payment"
                value={formData.payment}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E5F0]">
          <button
            type="button"
            onClick={() => navigate('/admin/shipments')}
            className="px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save size={16} />
                Create Shipment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminCreateShipment;