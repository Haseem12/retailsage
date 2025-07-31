
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://arewaskills.com.ng/retaillab';

interface PrintEntry {
    type: number; // 0 for text, 1 for image, etc.
    content?: string;
    bold?: number;
    align?: number;
    format?: number;
    // other fields as needed by the app
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const saleIdWithPrefix = searchParams.get('saleId');

    if (!saleIdWithPrefix) {
        return NextResponse.json({ error: "No saleId provided" }, { status: 400 });
    }
    
    // The saleId from the client can be `sale_123`, we need just the numeric part
    const saleId = saleIdWithPrefix.replace(/[^0-9]/g, '');
    if (!saleId) {
        return NextResponse.json({ error: "Invalid saleId format" }, { status: 400 });
    }

    try {
        // We need to fetch the sale details from our backend now
        // NOTE: This assumes the PHP backend can be called from the Next.js backend.
        // A token might be required if the endpoint is protected. For now, we assume public access or server-to-server auth.
        // Also, this GET request won't have the user's session token, so the PHP API needs to allow this request.
        // A better approach would be to pass the token from the mobile app if possible.
        // Since we can't do that easily, we'll assume the PHP script is adjusted to allow this lookup by ID.
        const res = await fetch(`${API_BASE_URL}/api/sales.php?action=read_single&id=${saleId}`);
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Failed to fetch sale data, status: ${res.status}`);
        }

        const sale = await res.json();
        
        if (!sale || !sale.items) {
             return NextResponse.json({ error: "Sale not found or is invalid" }, { status: 404 });
        }

        const printPayload: PrintEntry[] = [];

        // Title
        printPayload.push({
            type: 0,
            content: sale.business_name,
            bold: 1,
            align: 1,
            format: 1
        });

        // Address
        printPayload.push({
            type: 0,
            content: sale.business_address,
            bold: 0,
            align: 1,
            format: 4
        });

        // RC and Phone
        let details = [];
        if (sale.rc_number) details.push(`RC: ${sale.rc_number}`);
        if (sale.phone_number) details.push(`Tel: ${sale.phone_number}`);
        if (details.length > 0) {
            printPayload.push({
                type: 0,
                content: details.join(' | '),
                bold: 0,
                align: 1,
                format: 4
            });
        }
        
        // Date
        printPayload.push({
            type: 0,
            content: new Date(sale.date).toLocaleString(),
            bold: 0,
            align: 1,
            format: 4
        });

        // Separator
        printPayload.push({ type: 0, content: '-'.repeat(32), bold: 0, align: 1, format: 0 });

        // Items
        sale.items.forEach((item: any) => {
            const itemTotal = (item.quantity * item.price).toFixed(2);
            const line = `${item.quantity}x ${item.name}`.padEnd(22) + `N${itemTotal}`.padStart(10);
            printPayload.push({
                type: 0,
                content: line,
                bold: 0,
                align: 0,
                format: 4 // Small format for item list
            });
        });

        // Separator
        printPayload.push({ type: 0, content: '-'.repeat(32), bold: 0, align: 1, format: 0 });
        
        const subtotal = sale.items.reduce((acc: number, item: any) => acc + item.quantity * item.price, 0);

        // Totals
        printPayload.push({ type: 0, content: `Subtotal: N${subtotal.toFixed(2)}`, bold: 0, align: 2, format: 0 });
        printPayload.push({ type: 0, content: `TOTAL: N${sale.total.toFixed(2)}`, bold: 1, align: 2, format: 1 });
        
        // Footer
        printPayload.push({ type: 0, content: ' ', bold: 0, align: 0, format: 0 }); // Empty line
        printPayload.push({ type: 0, content: 'Thank you for your purchase!', bold: 1, align: 1, format: 0 });


        return new NextResponse(JSON.stringify(printPayload, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow app to fetch from any origin
            },
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
