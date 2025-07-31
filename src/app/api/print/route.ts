
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://arewaskills.com.ng/retaillab';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const saleIdWithPrefix = searchParams.get('saleId');

        if (!saleIdWithPrefix) {
            return NextResponse.json({ error: "No saleId provided" }, { status: 400 });
        }
        
        const saleId = saleIdWithPrefix.replace(/[^0-9]/g, '');
        if (!saleId) {
            return NextResponse.json({ error: "Invalid saleId format" }, { status: 400 });
        }

        const res = await fetch(`${API_BASE_URL}/api/sales.php?action=read_single&id=${saleId}`);
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Failed to decode error from backend.' }));
            throw new Error(errorData.message || `Failed to fetch sale data, status: ${res.status}`);
        }

        const saleData = await res.json();
        
        if (!saleData) {
             return NextResponse.json({ error: "Sale not found" }, { status: 404 });
        }

        const sale = {
            ...saleData,
            total: parseFloat(saleData.total || 0),
            items: Array.isArray(saleData.items) ? saleData.items.map((item: any) => ({
                ...item,
                quantity: parseInt(item.quantity, 10) || 0,
                price: parseFloat(item.price || 0)
            })) : []
        };
        
        return NextResponse.json(sale, {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error: any) {
        console.error("Error in /api/print:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
