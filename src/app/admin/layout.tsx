import React from 'react';
import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/AdminHeader';
import AdminLayoutClient from '@/components/AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AdminLayoutClient>
      {/* Admin Topbar */}
      <AdminHeader hasUser={!!user} />
      
      <div className="flex-grow w-full max-w-full overflow-x-hidden">
        {children}
      </div>
    </AdminLayoutClient>
  );
}

