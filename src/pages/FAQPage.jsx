import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const faqData = [
  {
    id: 1,
    category: 'Tracking',
    question: 'How do I track my package?',
    answer: 'You can track your package by entering your tracking number in the tracking form on the homepage or the Track Shipment page. You will see real‑time updates on your shipment’s status and location.'
  },
  {
    id: 2,
    category: 'Tracking',
    question: 'Where can I find my tracking number?',
    answer: 'Your tracking number is provided in your shipment confirmation email and on your order receipt. It typically starts with "CG-" followed by a series of numbers. If you cannot find it, please contact our support team.'
  },
  {
    id: 3,
    category: 'Delivery',
    question: 'How long does delivery take?',
    answer: 'Delivery times vary based on the service selected and the destination. Standard deliveries within the UK typically take 2–5 business days, while express services can take 1–2 business days. International shipments may take longer. You can see the estimated delivery date in your tracking details.'
  },
  {
    id: 4,
    category: 'Customs',
    question: 'What does "Held by Customs" mean?',
    answer: '"Held by Customs" means your shipment is undergoing customs inspection or requires additional documentation before it can be released. You will receive a notification with instructions on what documents or fees are needed. Our support team can also assist you.'
  },
  {
    id: 5,
    category: 'Delivery',
    question: 'Why is my shipment delayed?',
    answer: 'Delays can occur due to weather conditions, customs processing, incorrect addresses, or high shipment volumes. You can check the latest status in your tracking timeline. If the delay persists, please contact our support team for more information.'
  },
  {
    id: 6,
    category: 'Payment',
    question: 'How do I pay a clearance fee?',
    answer: 'If your shipment requires a customs clearance fee, you will see a "Pay Fee" button on the customs hold page or in your shipment details. Click the button to be taken to our secure payment page, where you can complete the transaction using a credit or debit card.'
  },
  {
    id: 7,
    category: 'Payment',
    question: 'How do I download my receipt?',
    answer: 'After a successful payment, you will be redirected to a receipt page. There you can click the "Download PDF" button to save your receipt. You can also find a copy of your receipt under the documents section of your shipment details.'
  },
  {
    id: 8,
    category: 'Customs',
    question: 'What happens after customs clearance?',
    answer: 'Once your shipment has been cleared by customs, it will resume its journey to the final destination. The tracking timeline will update to reflect the next steps, such as "Out for Delivery". If additional actions are required, you will be notified.'
  },
  {
    id: 9,
    category: 'Support',
    question: 'How do I contact support?',
    answer: 'You can reach our support team via the Contact page, by emailing support@thecargogrid.com, or by calling +44 800 555 0199. Our team is available Monday–Friday from 8:00am to 6:00pm and Saturday from 9:00am to 2:00pm.'
  },
];

function FAQPage() {
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique categories for filter pills
  const categories = [...new Set(faqData.map((item) => item.category))];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px]">
        <div className="container-custom py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="heading-section text-[#1A1A2E]">
                Frequently Asked <span className="text-[#2B0071]">Questions</span>
              </h1>
              <p className="body-text mt-3 max-w-2xl mx-auto">
                Find answers to the most common questions about tracking, delivery, customs, and more.
              </p>
            </div>

            {/* Search bar */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-base bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all shadow-sm"
              />
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setSearchTerm('')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  searchTerm === '' ? 'bg-[#2B0071] text-white' : 'bg-white text-[#1A1A2E] border border-[#E2E5F0] hover:bg-[#F8F9FD]'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchTerm(cat)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    searchTerm.toLowerCase() === cat.toLowerCase()
                      ? 'bg-[#2B0071] text-white'
                      : 'bg-white text-[#1A1A2E] border border-[#E2E5F0] hover:bg-[#F8F9FD]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ list */}
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No results found. Try a different search term.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((item) => {
                  const isOpen = openId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card overflow-hidden transition-shadow hover:shadow-md"
                    >
                      <button
                        onClick={() => toggle(item.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#F8F9FD]/50 transition-colors"
                      >
                        <div>
                          <span className="text-xs font-medium text-[#2B0071] bg-[#2B0071]/5 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                          <span className="block text-base font-semibold text-[#1A1A2E] mt-1">
                            {item.question}
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp size={20} className="text-[#2B0071] flex-shrink-0" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 text-gray-600 text-sm leading-relaxed border-t border-[#E2E5F0]">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Still have questions? */}
            <div className="mt-12 bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 text-center">
              <h3 className="text-lg font-bold text-[#1A1A2E]">Still have questions?</h3>
              <p className="text-gray-600 text-sm mt-1">
                Our support team is here to help. Get in touch with us and we’ll get back to you promptly.
              </p>
              <button
                onClick={() => window.location.href = '/contact'}
                className="mt-4 btn-primary text-sm py-2.5 px-6"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default FAQPage;