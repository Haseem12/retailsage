'use client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

const API_BASE_URL = 'https://arewaskills.com.ng/retaillab';

export default function DataManagement() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const token = sessionStorage.getItem('user-token');
            const response = await fetch(`${API_BASE_URL}/api/data.php?action=backup`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to download backup");
            }
            
            const backupData = await response.json();

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
        } catch (error: any) {
            console.error("Backup failed", error);
            toast({
                variant: 'destructive',
                title: "Backup Failed",
                description: error.message || "Could not create a backup. Please try again.",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            setIsUploading(true);
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File could not be read");
                }
                const data = JSON.parse(text);

                if (confirm('Are you sure you want to restore this data? This will overwrite your current products, sales, and spoilage records on the server.')) {
                    const token = sessionStorage.getItem('user-token');
                    const response = await fetch(`${API_BASE_URL}/api/data.php?action=restore`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();
                    if (!response.ok) {
                        throw new Error(result.message || "Failed to restore data");
                    }

                    toast({
                        title: "Restore Successful",
                        description: "Your data has been restored from the backup. The app will now reload.",
                    });

                    setTimeout(() => window.location.reload(), 2000);
                }
            } catch (error: any) {
                console.error("Restore failed", error);
                toast({
                    variant: 'destructive',
                    title: "Restore Failed",
                    description: error.message || "The selected file is not a valid backup file.",
                });
            } finally {
                setIsUploading(false);
                 if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleDownload} variant="outline" className="w-full" disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
                Download Backup
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} className="w-full" disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
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