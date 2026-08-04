// src/components/ServiceCard.jsx
import { ArrowRight } from 'lucide-react';

function ServiceCard({ title, description, icon: Icon, delay = 0 }) {
  return (
    <div
      className="card-premium p-6 sm:p-7 group hover:border-[#2B0071]/20 hover:-translate-y-1 reveal"
      style={{ transitionDelay: `${delay}ms` }}
      role="article"
    >
      <div className="flex flex-col h-full">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-[#2B0071]/5 flex items-center justify-center text-[#2B0071] group-hover:bg-[#2B0071]/10 transition-colors duration-300 mb-4">
          <Icon size={24} strokeWidth={1.6} />
        </div>

        <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{title}</h3>
        <p className="body-small flex-1">{description}</p>

        {/* Subtle hover indicator */}
        <div className="mt-4 pt-3 border-t border-[#E2E5F0]/60 flex items-center text-xs font-medium text-[#2B0071]/60 group-hover:text-[#FF5500] transition-colors duration-300">
          <span>Learn more</span>
          <ArrowRight size={14} className="ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;