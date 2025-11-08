import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Trash2, Key, Users } from "lucide-react";
import { backupStorage, passwordStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PasswordDialog } from "@/components/PasswordDialog";

const Settings = () => {
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleExport = () => {
    const data = backupStorage.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dental-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Backup exported successfully",
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result as string;
          backupStorage.importAll(data);
          toast({
            title: "Success",
            description: "Backup imported successfully. Refreshing page...",
          });
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          toast({
            title: "Error",
            description: "Invalid backup file format",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = () => {
    backupStorage.clearAll();
    toast({
      title: "Success",
      description: "All data cleared. Refreshing page...",
    });
    setTimeout(() => window.location.reload(), 1500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (passwordStorage.change(oldPassword, newPassword)) {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({
        title: "Error",
        description: "Incorrect current password",
        variant: "destructive",
      });
    }
  };

  const handleExportPatients = () => {
    const data = backupStorage.exportPatients();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dental-patients-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Patients exported successfully",
    });
  };

  const handleImportPatients = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result as string;
          backupStorage.importPatients(data);
          toast({
            title: "Success",
            description: "Patients imported successfully. Refreshing page...",
          });
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          toast({
            title: "Error",
            description: "Invalid patients file format",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your practice data and backups</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" />
          Security
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Change Password</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Update your password for sensitive operations. Default password is: {passwordStorage.getDefault()}
            </p>
            <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
              <div>
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Change Password</Button>
            </form>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Full Backup & Restore</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export all your data to a JSON file for backup or import from a previous backup.
              Includes all patient records, treatments, appointments, and payments.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </Button>
              <Button onClick={handleImport} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import All Data
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patient Data Only
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export or import only patient profiles without treatments, appointments, or payments.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleExportPatients} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Patients
              </Button>
              <Button onClick={handleImportPatients} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Patients
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium mb-2 text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete all data from this device. This action cannot be undone.
              Make sure to export a backup before clearing data.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowClearDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </div>
      </Card>


      <PasswordDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onSuccess={handleClearAll}
        title="Confirm Clear All Data"
        description="This action cannot be undone. This will permanently delete all patient records, treatments, appointments, and payments from this device. Enter your password to confirm."
      />
    </div>
  );
};

export default Settings;
