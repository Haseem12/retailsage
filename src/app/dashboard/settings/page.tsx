import SubscriptionTiers from '@/components/subscription-tiers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your RetailSage subscription plan and features.</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionTiers />
        </CardContent>
      </Card>
    </div>
  );
}
