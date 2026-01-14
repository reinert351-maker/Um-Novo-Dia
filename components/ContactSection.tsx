
import React from 'react';
import { Phone, Instagram, Send, Heart, Music, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER, INSTAGRAM_URL } from '../constants';

interface ContactProps {
  onOpenPrayer: () => void;
  onOpenPraise: () => void;
}

const ContactSection: React.FC<ContactProps> = ({ onOpenPrayer, onOpenPraise }) => {
  const openWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
  };

  const openInstagram = () => {
    window.open(INSTAGRAM_URL, '_blank');
  };

  return (
    <div className="flex flex-col space-y-8 animate-in slide-in-from-right duration-500">
      <div className="bg-purple-900/40 backdrop-blur-sm p-6 rounded-3xl border border-amber-500/20 text-center">
        <h3 className="text-amber-400 text-2xl font-bold mb-3 flex items-center justify-center gap-2">
          <MessageCircle /> Fale Conosco
        </h3>
        <p className="text-purple-100 text-base leading-relaxed">
          Sua mensagem é muito importante para nós. Envie seu pedido de oração ou louvor e permita que oremos com você.
        </p>
      </div>

      {/* Contact Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={openWhatsApp}
          className="flex items-center justify-between p-6 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-2xl transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-full text-white shadow-lg shadow-green-600/20">
              <Phone size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">WhatsApp</p>
              <p className="text-sm text-green-300">+55 47 99945-8205</p>
            </div>
          </div>
          <Send size={20} className="text-green-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={openInstagram}
          className="flex items-center justify-between p-6 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-2xl transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full text-white shadow-lg">
              <Instagram size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Instagram</p>
              <p className="text-sm text-purple-200">@umnovodiaweb</p>
            </div>
          </div>
          <Send size={20} className="text-purple-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Request Shortcuts */}
      <div className="space-y-4 pt-4">
        <h4 className="text-amber-400/80 font-bold uppercase tracking-widest text-xs text-center">Integração de Pedidos</h4>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onOpenPrayer}
            className="flex-1 flex items-center justify-center gap-3 py-5 bg-gradient-to-br from-amber-500 to-amber-600 text-purple-950 font-bold rounded-2xl shadow-xl shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Heart size={20} fill="currentColor" /> Pedido de Oração
          </button>
          
          <button 
            onClick={onOpenPraise}
            className="flex-1 flex items-center justify-center gap-3 py-5 bg-purple-800 border-2 border-amber-500/50 text-amber-400 font-bold rounded-2xl hover:bg-purple-700 transition-all"
          >
            <Music size={20} fill="currentColor" /> Pedido de Louvor
          </button>
        </div>
      </div>
      
      <div className="text-center pt-8">
        <p className="text-purple-300/50 text-xs">
          © {new Date().getFullYear()} Web Rádio Um Novo Dia • Excelência no Ar
        </p>
      </div>
    </div>
  );
};

export default ContactSection;
