import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import {
  Search, Filter, Plus, Eye, Download, Printer, Send,
  Edit, Trash2, X, CheckCircle, Clock, AlertTriangle,
  FileText, DollarSign, Calendar, User, Package
} from 'lucide-react';
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

const statusOptions = ['All', 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];
const statusColors = {
  Draft: 'bg-gray-100 text-gray-600',
  Sent: 'text-[#2B0071] bg-[#2B0071]/10',
  Paid: 'text-[#10B981] bg-[#10B981]/10',
  Overdue: 'text-[#EF4444] bg-[#EF4444]/10',
  Cancelled: 'text-gray-400 bg-gray-100',
};
const statusIcons = {
  Draft: FileText,
  Sent: Send,
  Paid: CheckCircle,
  Overdue: AlertTriangle,
  Cancelled: X,
};

function AdminInvoices() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    trackingNumber: '',
    description: '',
    amount: '',
    currency: 'USD',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'Draft',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For customer dropdown
  const [customers, setCustomers] = useState([]);
  const [trackingNumbers, setTrackingNumbers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data.invoices);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.response?.data?.message || 'Failed to load invoices');
      showToast('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Fetch customers when modal opens
  useEffect(() => {
    if (showModal) {
      const fetchCustomers = async () => {
        setLoadingCustomers(true);
        try {
          const response = await api.get('/shipments/customers');
          setCustomers(response.data.customers);
        } catch (err) {
          console.error('Error fetching customers:', err);
          showToast('Failed to load customers', 'error');
        } finally {
          setLoadingCustomers(false);
        }
      };
      fetchCustomers();
    }
  }, [showModal]);

  // When editing invoice and customers are loaded, set the exact customer name and tracking numbers
  useEffect(() => {
    if (editingInvoice && customers.length > 0) {
      // Find exact match (case‑sensitive)
      let found = customers.find(c => c.name === editingInvoice.customer);
      if (!found) {
        // Fallback: case‑insensitive match
        found = customers.find(c => c.name.toLowerCase() === editingInvoice.customer.toLowerCase());
      }
      if (found) {
        // Set the customer name to the exact case from the list (so the dropdown selects it)
        setFormData(prev => ({ ...prev, customer: found.name }));
        // Build tracking numbers list: all from this customer + the current one (if not included)
        let numbers = [...found.trackingNumbers];
        if (editingInvoice.trackingNumber && !numbers.includes(editingInvoice.trackingNumber)) {
          numbers.push(editingInvoice.trackingNumber);
        }
        setTrackingNumbers(numbers);
        console.log('✅ Customer matched:', found.name, 'Tracking numbers:', numbers);
      } else {
        // No match found: keep the original customer name, but clear tracking numbers
        setTrackingNumbers([]);
        console.warn('⚠️ Customer not found in list:', editingInvoice.customer);
      }
    }
  }, [editingInvoice, customers]);

  // Filter and search
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.trackingNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, filterStatus]);

  // Sort
  const sortedInvoices = useMemo(() => {
    const sorted = [...filteredInvoices];
    sorted.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else if (sortField === 'dueDate' || sortField === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredInvoices, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCustomerChange = (e) => {
    const customerName = e.target.value;
    setFormData({ ...formData, customer: customerName, trackingNumber: '' });
    const found = customers.find(c => c.name === customerName);
    setTrackingNumbers(found ? found.trackingNumbers : []);
  };

  // Modal handlers
  const handleCreate = () => {
    setEditingInvoice(null);
    setFormData({
      customer: '',
      trackingNumber: '',
      description: '',
      amount: '',
      currency: 'USD',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'Draft',
    });
    setTrackingNumbers([]);
    setShowModal(true);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({ ...invoice });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await api.delete(`/invoices/${id}`);
      await fetchInvoices();
      showToast('Invoice deleted successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete invoice', 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.customer || !formData.trackingNumber || !formData.amount) {
      showToast('Please fill in Customer, Tracking Number, and Amount.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingInvoice) {
        await api.put(`/invoices/${editingInvoice._id}`, formData);
        showToast('Invoice updated successfully', 'success');
      } else {
        await api.post('/invoices', formData);
        showToast('Invoice created successfully', 'success');
      }
      await fetchInvoices();
      setShowModal(false);
      setEditingInvoice(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save invoice', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Actions ----
  const handleView = (invoice) => {
    setViewingInvoice(invoice);
    setShowViewModal(true);
  };

  const handleSend = async (invoice) => {
    if (invoice.status === 'Sent' || invoice.status === 'Paid') {
      showToast(`Invoice ${invoice.invoiceNumber} has already been sent.`, 'info');
      return;
    }
    if (!window.confirm(`Send invoice ${invoice.invoiceNumber} to ${invoice.customer}?`)) return;
    try {
      await api.put(`/invoices/${invoice._id}`, { status: 'Sent' });
      await fetchInvoices();
      showToast(`Invoice ${invoice.invoiceNumber} sent via email.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send invoice', 'error');
    }
  };

  // ---- Download PDF ----
  const handleDownload = (invoice) => {
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.maxWidth = '800px';
    element.style.margin = '0 auto';
    element.innerHTML = `
      <div style="border-bottom: 2px solid #E2E5F0; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between;">
        <div>
          <h1 style="color: #2B0071;">The Cargo Grid</h1>
          <p style="font-size: 14px; color: #666;">Invoice #${invoice.invoiceNumber}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 14px;"><strong>Status:</strong> ${invoice.status}</p>
          <p style="font-size: 14px;"><strong>Date:</strong> ${invoice.createdAt}</p>
        </div>
      </div>
      <div style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #666;">Customer</span>
          <span>${invoice.customer}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #666;">Tracking Number</span>
          <span>${invoice.trackingNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #666;">Description</span>
          <span>${invoice.description}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #666;">Due Date</span>
          <span>${invoice.dueDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="font-weight: bold; color: #666;">Amount</span>
          <span>${invoice.amount} ${invoice.currency}</span>
        </div>
      </div>
      <div style="margin-top: 30px; font-size: 24px; font-weight: bold; color: #2B0071;">
        Total: ${invoice.amount} ${invoice.currency}
      </div>
      <div style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
        Thank you for choosing The Cargo Grid.
      </div>
    `;

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Invoice_${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      showToast(`Invoice ${invoice.invoiceNumber} downloaded successfully.`, 'success');
    }).catch((err) => {
      console.error('PDF generation error:', err);
      showToast('Failed to generate PDF. Please try again.', 'error');
    });
  };

  // ---- Print ----
  const handlePrint = (invoice) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      showToast('Please allow popups to print.', 'error');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #2B0071; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E2E5F0; padding-bottom: 20px; }
            .details { margin-top: 20px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
            .label { font-weight: bold; color: #666; }
            .total { font-size: 1.5rem; font-weight: bold; color: #2B0071; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>The Cargo Grid</h1>
              <p>Invoice #${invoice.invoiceNumber}</p>
            </div>
            <div>
              <p><strong>Status:</strong> ${invoice.status}</p>
              <p><strong>Date:</strong> ${invoice.createdAt}</p>
            </div>
          </div>
          <div class="details">
            <div class="row"><span class="label">Customer</span><span>${invoice.customer}</span></div>
            <div class="row"><span class="label">Tracking Number</span><span>${invoice.trackingNumber}</span></div>
            <div class="row"><span class="label">Description</span><span>${invoice.description}</span></div>
            <div class="row"><span class="label">Due Date</span><span>${invoice.dueDate}</span></div>
            <div class="row"><span class="label">Amount</span><span>${invoice.amount} ${invoice.currency}</span></div>
          </div>
          <div class="total">Total: ${invoice.amount} ${invoice.currency}</div>
          <div class="footer">Thank you for choosing The Cargo Grid.</div>
          <script>
            window.onload = function() { window.print(); }
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Close view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingInvoice(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading invoices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 text-[#EF4444]">
        <p className="font-medium">Error loading invoices</p>
        <p className="text-sm">{error}</p>
        <button onClick={fetchInvoices} className="mt-2 text-sm font-medium text-[#2B0071] hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-[#1A1A2E]">Invoices</h2>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors"
        >
          <Plus size={16} />
          Create Invoice
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice, customer, tracking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FD] border-b border-[#E2E5F0] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('invoiceNumber')}>
                  Invoice {sortField === 'invoiceNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('customer')}>
                  Customer {sortField === 'customer' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('trackingNumber')}>
                  Tracking {sortField === 'trackingNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('description')}>
                  Description {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('amount')}>
                  Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('dueDate')}>
                  Due Date {sortField === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[#2B0071]" onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5F0]">
              {sortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                sortedInvoices.map((invoice) => {
                  const StatusIcon = statusIcons[invoice.status] || FileText;
                  return (
                    <tr key={invoice._id || invoice.id} className="hover:bg-[#F8F9FD]/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#2B0071]">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 font-medium text-[#1A1A2E]">{invoice.customer}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{invoice.trackingNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{invoice.description}</td>
                      <td className="px-4 py-3 font-medium">{invoice.amount} {invoice.currency}</td>
                      <td className="px-4 py-3 text-gray-500">{invoice.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status] || 'bg-gray-100 text-gray-600'}`}>
                          <StatusIcon size={12} />
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleView(invoice)} className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] rounded-lg hover:bg-[#2B0071]/5" aria-label="View">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleSend(invoice)} className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] rounded-lg hover:bg-[#2B0071]/5" aria-label="Send">
                            <Send size={16} />
                          </button>
                          <button onClick={() => handleDownload(invoice)} className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] rounded-lg hover:bg-[#2B0071]/5" aria-label="Download">
                            <Download size={16} />
                          </button>
                          <button onClick={() => handlePrint(invoice)} className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] rounded-lg hover:bg-[#2B0071]/5" aria-label="Print">
                            <Printer size={16} />
                          </button>
                          <button onClick={() => handleEdit(invoice)} className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] rounded-lg hover:bg-[#2B0071]/5" aria-label="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(invoice._id)} className="p-1.5 text-[#EF4444]/60 hover:text-[#EF4444] rounded-lg hover:bg-[#EF4444]/5" aria-label="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#E2E5F0] text-xs text-gray-400 bg-[#F8F9FD]/30">
          Showing {sortedInvoices.length} of {invoices.length} invoices
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">
                {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEditingInvoice(null); }}
                className="p-2 text-gray-400 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-[#F8F9FD]"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              {/* Customer dropdown */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Customer *</label>
                <select
                  value={formData.customer}
                  onChange={handleCustomerChange}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  disabled={loadingCustomers}
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {editingInvoice && customers.length === 0 && !loadingCustomers && (
                  <p className="text-xs text-[#FF5500] mt-1">No customers found. Please create a shipment first.</p>
                )}
              </div>

              {/* Tracking Number dropdown */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Tracking Number *</label>
                <select
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  disabled={!formData.customer || trackingNumbers.length === 0}
                >
                  <option value="">Select a tracking number</option>
                  {trackingNumbers.map((tn) => (
                    <option key={tn} value={tn}>{tn}</option>
                  ))}
                </select>
                {formData.customer && trackingNumbers.length === 0 && (
                  <p className="text-xs text-[#FF5500] mt-1">No shipments found for this customer.</p>
                )}
              </div>

              {/* Other fields */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                  >
                    <option value="GBP">GBP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                >
                  {statusOptions.filter(s => s !== 'All').map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E5F0]">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingInvoice(null); }}
                  className="px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (editingInvoice ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">Invoice Details</h3>
              <button
                onClick={closeViewModal}
                className="p-2 text-gray-400 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-[#F8F9FD]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Invoice Number</p>
                  <p className="font-medium font-mono">{viewingInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[viewingInvoice.status]}`}>
                    {viewingInvoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Customer</p>
                  <p className="font-medium">{viewingInvoice.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tracking Number</p>
                  <p className="font-mono">{viewingInvoice.trackingNumber}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Description</p>
                  <p className="font-medium">{viewingInvoice.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
                  <p className="font-medium">{viewingInvoice.amount} {viewingInvoice.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Due Date</p>
                  <p className="font-medium">{viewingInvoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Created</p>
                  <p className="font-medium">{viewingInvoice.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Last Updated</p>
                  <p className="font-medium">{viewingInvoice.updatedAt}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E2E5F0]">
                <button
                  onClick={() => { handleSend(viewingInvoice); closeViewModal(); }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors"
                >
                  <Send size={16} />
                  Send Invoice
                </button>
                <button
                  onClick={() => { handleDownload(viewingInvoice); closeViewModal(); }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2B0071] bg-[#2B0071]/5 rounded-xl hover:bg-[#2B0071]/10 transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={() => { handlePrint(viewingInvoice); closeViewModal(); }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2B0071] border border-[#2B0071] rounded-xl hover:bg-[#2B0071] hover:text-white transition-colors"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInvoices;