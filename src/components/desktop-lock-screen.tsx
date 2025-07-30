
'use client';

import { Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import RetailLabLogo from './retaillab-logo';
import { useEffect, useState } from 'react';

const QRCode = () => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentUrl = window.location.href;
            setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`);
        }
    }, []);

    if (!qrCodeUrl) {
        return <div className="w-[150px] h-[150px] bg-muted rounded-md animate-pulse"></div>;
    }

    return (
        <img src={qrCodeUrl} alt="QR Code to open on mobile" width={150} height={150} />
    );
}


export default function DesktopLockScreen() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-background">
             <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/bg.jpg')", filter: 'blur(4px) brightness(0.3)' }}
            ></div>
            <Card className="w-full max-w-md z-10 text-center shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="mx-auto flex items-center justify-center gap-2 mb-4">
                        <RetailLabLogo className="w-12 h-12" />
                    </div>
                    <CardTitle className="text-2xl flex items-center justify-center gap-2">
                        <Smartphone />
                        Optimized for Mobile
                    </CardTitle>
                    <CardDescription>
                        For the best experience, please open RetailLab on your mobile device.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                   <p className="text-sm text-muted-foreground">Scan the QR code with your phone's camera to continue.</p>
                   <div className="p-2 bg-white rounded-lg">
                    <QRCode />
                   </div>
                </CardContent>
            </Card>
        </main>
    )
}
