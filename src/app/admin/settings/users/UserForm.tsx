'use client';

import { useState } from 'react';
import { createAdminUser } from './actions';
import { Mail, KeyRound, Loader2 } from 'lucide-react';

export default function UserForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const result = await createAdminUser(formData);
    
    if (result.error) {
      setMessage({ text: result.error, type: 'error' });
    } else if (result.success) {
      setMessage({ text: result.message || 'Usuario creado.', type: 'success' });
      const form = document.getElementById('user-form') as HTMLFormElement;
      form?.reset();
    }
    setLoading(false);
  }

  return (
    <form id="user-form" action={onSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-xs font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="email" 
            name="email"
            required
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta transition-all"
            placeholder="ejemplo@elena.cl"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Contraseña Segura</label>
        <div className="relative">
          <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            name="password"
            required
            minLength={6}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta transition-all"
            placeholder="Min. 6 caracteres"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 bg-brand-charcoal hover:bg-zinc-800 text-white font-medium text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Usuario'}
      </button>
    </form>
  );
}
