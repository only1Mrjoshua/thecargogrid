// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Other routes will be added later */}
      <Route path="/track" element={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]"><p className="text-xl text-[#1A1A2E]">Tracking page coming soon.</p></div>} />
      <Route path="/services" element={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]"><p className="text-xl text-[#1A1A2E]">Services page coming soon.</p></div>} />
      <Route path="/about" element={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]"><p className="text-xl text-[#1A1A2E]">About page coming soon.</p></div>} />
      <Route path="/faq" element={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]"><p className="text-xl text-[#1A1A2E]">FAQ page coming soon.</p></div>} />
      <Route path="/contact" element={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]"><p className="text-xl text-[#1A1A2E]">Contact page coming soon.</p></div>} />
    </Routes>
  );
}

export default App;