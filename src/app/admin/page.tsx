import React from 'react';
import { getDashboardData, getDetailedDashboardData } from '@/app/admin/actions';
import DashboardClient from './DashboardClient';

export default async function AdminPage() {
    // Fetching data on the server to ensure high performance and zero client-side layout shift
    const [detailedData, generalData] = await Promise.all([
        getDetailedDashboardData(),
        getDashboardData()
    ]);
    
    return <DashboardClient initialDetailedData={detailedData} initialGeneralData={generalData} />;
}
