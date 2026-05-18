import Passport from "@/components/Passport";
import { notFound } from "next/navigation";

// Simulation of data fetching - in production this would come from Supabase
const getGarmentData = (id: string) => {
    const dummyData: Record<string, any> = {
        "et-001": {
            id: "et-001",
            garmentName: "Blazer Loro Piana Upcycled",
            artisan: "Elena R.",
            fabricOrigin: "Biella, Italia (Wool Silk Blend)",
            confectionDate: "12 Oct, 2025",
            status: "sewing"
        },
        "et-002": {
            id: "et-002",
            garmentName: "Pantalón de Lino Sostenible",
            artisan: "Marta S.",
            fabricOrigin: "Normandía, Francia",
            confectionDate: "05 Nov, 2025",
            status: "ready"
        }
    };
    return dummyData[id] || null;
};

export default async function PassportPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const data = getGarmentData(resolvedParams.id);

    if (!data) {
        notFound();
    }

    return <Passport data={data} />;
}
