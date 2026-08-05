import { Routes, Route } from 'react-router-dom';
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
import TermsPage from './pages/TermsPage'; // new import

function App() {
  return (
    <Routes>
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
      <Route path="/terms" element={<TermsPage />} /> // new route
    </Routes>
  );
}

export default App;