import React from 'react';
import { getStatisticsData } from './actions';
import StatisticsClient from './StatisticsClient';

export const dynamic = 'force-dynamic';

export default async function StatisticsPage() {
    const data = await getStatisticsData();
    return <StatisticsClient initialData={data} />;
}
