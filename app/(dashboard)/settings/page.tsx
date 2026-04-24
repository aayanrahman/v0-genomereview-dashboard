import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure your GenomeReview workspace
        </p>
      </header>

      <div className="max-w-2xl space-y-8">
        <Card className="border-border/50 p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Profile</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Dr. Michael Torres" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="m.torres@hospital.org" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue="Clinical Geneticist" className="mt-2" disabled />
            </div>
          </div>
        </Card>

        <Card className="border-border/50 p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email when a case is ready for review
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Urgent case alerts</p>
                <p className="text-sm text-muted-foreground">
                  Get notified immediately for Stat priority cases
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Weekly digest</p>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of case activity
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="border-border/50 p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">API Configuration</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Configure connections to external services and the WDK backend.
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="wdk-endpoint">WDK Endpoint</Label>
              <Input 
                id="wdk-endpoint" 
                defaultValue="https://api.genomelab.dev/v1" 
                className="mt-2 font-mono text-sm" 
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {"// TODO: Connect to production WDK workflow endpoint"}
              </p>
            </div>
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input 
                id="api-key" 
                type="password" 
                defaultValue="sk-xxxxxxxxxxxxxxxx" 
                className="mt-2 font-mono text-sm" 
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
