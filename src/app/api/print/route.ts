
import { NextRequest, NextResponse } from 'next/server';

interface PrintEntry {
    type: number; // 0 for text, 1 for image, etc.
    content?: string;
    bold?: number;
    align?: number;
    format?: number;
    // other fields as needed by the app
}

export function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get('saleId');

    if (!saleId) {
        return NextResponse.json({ error: "No saleId provided" }, { status: 400 });
    }

    // In a real app, you would fetch sale data from a database using the saleId.
    // This is a simulation, so we can't access client-side sessionStorage here on the server.
    // The architecture relies on the client initiating the `my.bluetoothprint.scheme` call,
    // which then makes the GET request. However, this server route has no access to that client's session.
    
    // To make this work, we will construct a sample payload. In a real scenario,
    // you would either pass all data in the URL (which can be long and complex) or
    // preferably store sales in a database and fetch them here using the saleId.

    const sampleData = {
        businessDetails: {
            name: "RetailLab (Sample)",
            address: "123 Market St, Anytown, USA",
            rcNumber: "RC12345",
            phoneNumber: "080-123-4567"
        },
        items: [
            { name: "Fresh Apples", quantity: 2, price: 2.5 },
            { name: "Whole Milk", quantity: 1, price: 3.0 }
        ],
        subtotal: 8.0,
        total: 8.0, // No tax
        date: new Date().toISOString()
    };
    
    // We use sample data because this route cannot access the sale data from sessionStorage.
    const sale = sampleData;

    const printPayload: PrintEntry[] = [];

    // Title
    printPayload.push({
        type: 0,
        content: sale.businessDetails.name,
        bold: 1,
        align: 1,
        format: 1
    });

    // Address
    printPayload.push({
        type: 0,
        content: sale.businessDetails.address,
        bold: 0,
        align: 1,
        format: 4
    });

    // RC and Phone
     if (sale.businessDetails.rcNumber || sale.businessDetails.phoneNumber) {
        let details = [];
        if (sale.businessDetails.rcNumber) details.push(`RC: ${sale.businessDetails.rcNumber}`);
        if (sale.businessDetails.phoneNumber) details.push(`Tel: ${sale.businessDetails.phoneNumber}`);
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
    sale.items.forEach(item => {
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

    // Totals
    printPayload.push({ type: 0, content: `Subtotal: N${sale.subtotal.toFixed(2)}`, bold: 0, align: 2, format: 0 });
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
}
