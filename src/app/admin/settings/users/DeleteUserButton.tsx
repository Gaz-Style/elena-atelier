'use client';

import { useState } from 'react';
import { deleteAdminUser } from './actions';
import { Trash2, Loader2 } from 'lucide-react';

export default function DeleteUserButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm('¿Estás seguro de que deseas eliminar a este usuario? Perderá acceso inmediato al sistema.')) {
      return;
    }

    setLoading(true);
    const result = await deleteAdminUser(userId);
    if (result.error) {
      alert(result.error);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Eliminar Usuario"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
