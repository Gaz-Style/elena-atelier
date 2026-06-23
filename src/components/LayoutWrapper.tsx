'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPagar = pathname?.startsWith('/pagar');

    return (
        <>
            {!isPagar && <Navbar />}
            <main className={!isPagar ? "pt-20 flex-grow" : "flex-grow"}>
                {children}
            </main>
            {!isPagar && <Footer />}
        </>
    );
}
