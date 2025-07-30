
'use client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload } from "lucide-react";
import { useRef } from "react";

export default function DataManagement() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownload = () => {
        try {
            const products = localStorage.getItem('products') || '[]';
            const sales = localStorage.getItem('sales') || '[]';
            const spoilage = localStorage.getItem('spoilage') || '[]';

            const backupData = {
                products: JSON.parse(products),
                sales: JSON.parse(sales),
                spoilage: JSON.parse(spoilage),
                backupDate: new Date().toISOString(),
            };

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'retaillab_backup.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
                title: "Backup Successful",
                description: "Your data has been downloaded as retaillab_backup.json",
            });
        } catch (error) {
            console.error("Backup failed", error);
            toast({
                variant: 'destructive',
                title: "Backup Failed",
                description: "Could not create a backup. Please try again.",
            });
        }
    };

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File could not be read");
                }
                const data = JSON.parse(text);

                if (confirm('Are you sure you want to restore this data? This will overwrite your current products, sales, and spoilage records.')) {
                    if (data.products && Array.isArray(data.products)) {
                        localStorage.setItem('products', JSON.stringify(data.products));
                    }
                    if (data.sales && Array.isArray(data.sales)) {
                        localStorage.setItem('sales', JSON.stringify(data.sales));
                    }
                    if (data.spoilage && Array.isArray(data.spoilage)) {
                        localStorage.setItem('spoilage', JSON.stringify(data.spoilage));
                    }

                    toast({
                        title: "Restore Successful",
                        description: "Your data has been restored from the backup. The app will now reload.",
                    });

                    setTimeout(() => window.location.reload(), 2000);
                }
            } catch (error) {
                console.error("Restore failed", error);
                toast({
                    variant: 'destructive',
                    title: "Restore Failed",
                    description: "The selected file is not a valid backup file.",
                });
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleDownload} variant="outline" className="w-full">
                <Download className="mr-2" />
                Download Backup
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                <Upload className="mr-2" />
                Upload Backup
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleUpload}
            />
        </div>
    );
}
