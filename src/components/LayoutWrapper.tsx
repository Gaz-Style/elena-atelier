'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPagar = pathname?.startsWith('/pagar');
    const isPortal = pathname?.startsWith('/portal-novias');
    const isAdmin = pathname?.startsWith('/admin');
    const hideNavFooter = isPagar || isPortal || isAdmin;

    return (
        <>
            {!hideNavFooter && <Navbar />}
            <main className={!hideNavFooter ? "pt-20 flex-grow" : "flex-grow"}>
                {children}
            </main>
            {!hideNavFooter && <Footer />}
        </>
    );
}
