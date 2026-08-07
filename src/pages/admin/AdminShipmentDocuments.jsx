import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Upload, Eye, Download, RefreshCw, Trash2,
  Paperclip, FileText, AlertCircle, X, CheckCircle
} from 'lucide-react';

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

function AdminShipmentDocuments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: '',
    type: 'application/pdf',
    size: '',
    file: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/shipments/${id}/documents`);
      setDocuments(response.data.documents || []);
      // Also fetch shipment info for header
      const shipmentRes = await api.get(`/shipments/${id}`);
      setShipment(shipmentRes.data.shipment);
      setNotFound(false);
    } catch (err) {
      console.error('Error fetching documents:', err);
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError('Failed to load documents');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDocuments();
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData({
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        file: file,
      });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file) {
      alert('Please select a file.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result; // data URL
        try {
          await api.post(`/shipments/${id}/documents`, {
            name: uploadData.name,
            type: uploadData.type,
            size: uploadData.size,
            data: base64Data,
            attached: false,
          });
          await fetchDocuments(); // Refresh
          setShowUploadModal(false);
          setUploadData({ name: '', type: 'application/pdf', size: '', file: null });
        } catch (err) {
          setError(err.response?.data?.message || 'Upload failed');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(uploadData.file);
    } catch (err) {
      setError('Failed to read file');
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/shipments/${id}/documents/${docId}`);
      await fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleToggleAttach = async (docId) => {
    try {
      await api.patch(`/shipments/${id}/documents/${docId}/toggle`);
      await fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update attachment status');
    }
  };

  const handlePreview = (doc) => {
    // Open a new window with the document data
    if (doc.data) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<iframe src="${doc.data}" style="width:100%;height:100%;border:none;"></iframe>`);
        win.document.title = doc.name;
      }
    } else {
      alert('Preview not available for this document.');
    }
  };

  const handleDownload = (doc) => {
    if (doc.data) {
      // Create a download link
      const link = document.createElement('a');
      link.href = doc.data;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Download not available for this document.');
    }
  };

  const handleReplace = (doc) => {
    alert('Replace functionality: You can re-upload a new version (not implemented yet).');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading documents...</span>
      </div>
    );
  }

  if (notFound || !shipment) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#1A1A2E]">Shipment not found</h3>
        <p className="text-gray-500">The shipment with tracking number <strong>{id}</strong> does not exist.</p>
        <Link to="/admin/shipments" className="mt-4 inline-block btn-primary text-sm py-2 px-6">
          Back to Shipments
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/shipments"
            className="p-2 text-[#1A1A2E]/60 hover:text-[#1A1A2E] hover:bg-[#F8F9FD] rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-xl font-bold text-[#1A1A2E]">Shipment Documents</h2>
          <span className="text-sm text-gray-400 font-mono">{id}</span>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors"
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-3 text-sm text-[#EF4444] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          {error}
        </div>
      )}

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 text-center">
          <FileText size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No documents uploaded for this shipment.</p>
          <p className="text-sm text-gray-400">Click "Upload Document" to add one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card overflow-hidden">
          <div className="divide-y divide-[#E2E5F0]">
            {documents.map((doc) => (
              <div key={doc.id} className="px-6 py-4 hover:bg-[#F8F9FD]/50 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                    <FileText size={20} className="text-[#2B0071]/60" />
                    <div>
                      <p className="font-medium text-[#1A1A2E]">{doc.name}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span>{doc.size || '—'}</span>
                        <span>Uploaded: {doc.uploadDate || '—'}</span>
                        {doc.attached && (
                          <span className="inline-flex items-center gap-1 text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                            <CheckCircle size={12} /> Attached to Notification
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handlePreview(doc)}
                      className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                      aria-label="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                      aria-label="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleReplace(doc)}
                      className="p-1.5 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                      aria-label="Replace"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleAttach(doc.id)}
                      className={`p-1.5 transition-colors rounded-lg ${
                        doc.attached
                          ? 'text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20'
                          : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                      }`}
                      aria-label="Toggle attach"
                    >
                      <Paperclip size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-[#EF4444]/60 hover:text-[#EF4444] transition-colors rounded-lg hover:bg-[#EF4444]/5"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1A1A2E]">Upload Document</h3>
              <button
                onClick={() => { setShowUploadModal(false); setUploadData({ name: '', type: 'application/pdf', size: '', file: null }); }}
                className="p-2 text-gray-400 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-[#F8F9FD]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">Select File *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]"
                />
                {uploadData.name && (
                  <p className="text-xs text-gray-500 mt-1">Selected: {uploadData.name} ({uploadData.size})</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E5F0]">
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setUploadData({ name: '', type: 'application/pdf', size: '', file: null }); }}
                  className="px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !uploadData.file}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" /> Uploading...</>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminShipmentDocuments;