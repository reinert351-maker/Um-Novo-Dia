
import React, { useState } from 'react';
import { ArrowLeft, Send, Heart, Music } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants';

interface RequestFormProps {
  type: 'prayer' | 'praise';
  onBack: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ type, onBack }) => {
  const [name, setName] = useState('');
  const [request, setRequest] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let message = '';
    if (type === 'prayer') {
      message = `Paz do Senhor! Me chamo ${name || 'um ouvinte'}. Gostaria de fazer um pedido de oração: ${request}. Deus abençoe a Web Rádio Um Novo Dia.`;
    } else {
      message = `Paz do Senhor! Me chamo ${name || 'um ouvinte'}. Gostaria de ouvir o louvor: ${request}. Deus abençoe a Web Rádio Um Novo Dia.`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-purple-800 rounded-full transition-colors text-amber-400"
        >
          <ArrowLeft size={24} />
        </button>
        <h3 className="text-2xl font-bold flex items-center gap-2">
          {type === 'prayer' ? <Heart className="text-amber-500" /> : <Music className="text-amber-500" />}
          {type === 'prayer' ? 'Pedido de Oração' : 'Pedido de Louvor'}
        </h3>
      </div>

      <div className="bg-purple-950/40 border border-amber-500/20 p-6 rounded-3xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-amber-400 font-bold text-sm ml-1">Seu Nome</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome..."
              required
              className="w-full bg-purple-900/50 border border-purple-500/30 rounded-xl px-4 py-4 focus:outline-none focus:border-amber-500 text-white placeholder:text-purple-300/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-amber-400 font-bold text-sm ml-1">
              {type === 'prayer' ? 'Qual sua necessidade?' : 'Qual hino deseja ouvir?'}
            </label>
            <textarea 
              rows={4}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder={type === 'prayer' ? "Conte-nos como podemos orar por você..." : "Digite o nome da música e cantor..."}
              required
              className="w-full bg-purple-900/50 border border-purple-500/30 rounded-xl px-4 py-4 focus:outline-none focus:border-amber-500 text-white placeholder:text-purple-300/50 transition-all resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-purple-950 font-bold rounded-2xl shadow-xl shadow-amber-500/10 active:scale-[0.98] transition-all"
          >
            <Send size={20} /> ENVIAR VIA WHATSAPP
          </button>
        </form>
      </div>

      <p className="text-center text-purple-300 text-sm px-6 italic">
        "E tudo o que pedirem em oração, se crerem, vocês receberão." - Mateus 21:22
      </p>
    </div>
  );
};

export default RequestForm;
