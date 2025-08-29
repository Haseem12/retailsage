import DataManagement from '@/components/data-management';
import PinManagement from '@/components/pin-management';
import SubscriptionTiers from '@/components/subscription-tiers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
       <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Set a 4-digit PIN to secure access to this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PinManagement />
        </CardContent>
      </Card>
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Download a backup of your data or restore from a previous backup. This is useful for transferring data between devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataManagement />
        </CardContent>
      </Card>
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your SAJ FOODS subscription plan and features.</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionTiers />
        </CardContent>
      </Card>
    </div>
  );
}
