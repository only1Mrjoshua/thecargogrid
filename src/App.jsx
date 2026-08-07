import { Routes, Route } from 'react-router-dom';
import { ShipmentProvider } from './context/ShipmentContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import TrackPage from './pages/TrackPage';
import ShipmentDetailsPage from './pages/ShipmentDetailsPage';
import CustomsHoldPage from './pages/CustomsHoldPage';
import CustomsPaymentPage from './pages/CustomsPaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import ShipmentDocumentsPage from './pages/ShipmentDocumentsPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ShipPage from './pages/ShipPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShipments from './pages/admin/AdminShipments';
import AdminCreateShipment from './pages/admin/AdminCreateShipment';
import AdminUpdateShipment from './pages/admin/AdminUpdateShipment';
import AdminShipmentTimeline from './pages/admin/AdminShipmentTimeline';
import AdminShipmentDocuments from './pages/admin/AdminShipmentDocuments';
import AdminPayments from './pages/admin/AdminPayments';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminReceipts from './pages/admin/AdminReceipts';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminCustomers from './pages/admin/AdminCustomers';

function App() {
  return (
    <ShipmentProvider>
      <InvoiceProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/shipment" element={<ShipmentDetailsPage />} />
            <Route path="/customs" element={<CustomsHoldPage />} />
            <Route path="/payment" element={<CustomsPaymentPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-failed" element={<PaymentFailedPage />} />
            <Route path="/documents" element={<ShipmentDocumentsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/ship" element={<ShipPage />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="shipments" element={<AdminShipments />} />
              <Route path="shipments/create" element={<AdminCreateShipment />} />
              <Route path="shipments/update/:id" element={<AdminUpdateShipment />} />
              <Route path="shipments/timeline/:id" element={<AdminShipmentTimeline />} />
              <Route path="shipments/documents/:id" element={<AdminShipmentDocuments />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="receipts" element={<AdminReceipts />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="users" element={<AdminCustomers />} />
              <Route path="tracking" element={<div className="text-center py-12 text-gray-500">Live Tracking (Coming Soon)</div>} />
              <Route path="settings" element={<div className="text-center py-12 text-gray-500">Admin Settings (Coming Soon)</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </InvoiceProvider>
    </ShipmentProvider>
  );
}

export default App;