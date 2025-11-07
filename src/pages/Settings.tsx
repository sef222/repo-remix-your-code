import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, AlertTriangle } from "lucide-react";
import { backupStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your practice data and backups</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Backup & Restore</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export your data to a JSON file for backup or import from a previous backup.
              All patient records, treatments, appointments, and payments will be included.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Backup
              </Button>
              <Button onClick={handleImport} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Backup
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

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">About Offline Storage</h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            This application stores all your data locally in your browser using localStorage.
            This means:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Your data persists even after closing the browser or restarting your device</li>
            <li>No internet connection is required to use the app</li>
            <li>Data is stored only on this device and browser</li>
            <li>Clearing browser data will delete all stored information</li>
            <li>Regular backups are recommended to prevent data loss</li>
          </ul>
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg flex gap-3 mt-4">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Important Storage Notes</p>
              <p className="text-sm mt-1">
                localStorage has a storage limit (typically 5-10MB). For practices with large amounts of data,
                consider regular exports and archiving old records. Always maintain external backups of critical data.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all patient records,
              treatments, appointments, and payments from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, clear all data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
