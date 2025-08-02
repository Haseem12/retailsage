
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://arewaskills.com.ng/retaillab';

// Helper to create a text object for the print payload
const createTextObject = (content: string, { bold = 0, align = 0, format = 0 } = {}) => ({
    type: 0,
    content,
    bold,
    align,
    format,
});

// Helper to create a barcode object for the print payload
const createBarcodeObject = (value: string, { width = 150, height = 50, align = 1 } = {}) => ({
    type: 2,
    value,
    width,
    height,
    align,
});

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
        
        const printPayload = [];

        // Header
        printPayload.push(createTextObject(sale.business_name || 'RetailSage', { bold: 1, align: 1, format: 2 }));
        printPayload.push(createTextObject(sale.business_address || '123 Retail St', { align: 1 }));
        if (sale.rc_number) printPayload.push(createTextObject(`RC: ${sale.rc_number}`, { align: 1 }));
        if (sale.phone_number) printPayload.push(createTextObject(`Tel: ${sale.phone_number}`, { align: 1 }));
        printPayload.push(createTextObject(new Date(sale.date).toLocaleString(), { align: 1 }));
        printPayload.push(createTextObject(' ', {})); // Empty line

        // Items
        sale.items.forEach(item => {
            const itemTotal = (item.quantity * item.price).toFixed(2);
            const line = `${item.quantity}x ${item.name} @ ${item.price.toFixed(2)}....${itemTotal}`;
            printPayload.push(createTextObject(line, {}));
        });

        printPayload.push(createTextObject('--------------------------------', { align: 1 }));

        // Totals
        printPayload.push(createTextObject(`Subtotal: N${sale.total.toFixed(2)}`, { align: 2 }));
        printPayload.push(createTextObject(`TOTAL: N${sale.total.toFixed(2)}`, { bold: 1, align: 2, format: 1 }));

        printPayload.push(createTextObject(' ', {})); // Empty line

        // Footer
        printPayload.push(createTextObject('Thank you for your purchase!', { bold: 1, align: 1 }));
        printPayload.push(createTextObject('Powered by RetailSage', { align: 1, format: 4 }));
        
        printPayload.push(createTextObject(' ', {})); // Empty line
        
        // Barcode
        printPayload.push(createBarcodeObject(saleId));

        return NextResponse.json(printPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error: any) {
        console.error("Error in /api/print:", error);
        // Ensure even errors are sent as JSON
        const errorResponse = {
            error: true,
            message: error.message || 'An internal server error occurred.'
        };
        return NextResponse.json(errorResponse, { status: 500 });
    }
}
