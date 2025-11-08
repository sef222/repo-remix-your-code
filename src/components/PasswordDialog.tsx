import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title: string;
  description: string;
}

export const PasswordDialog = ({ open, onOpenChange, onSuccess, title, description }: PasswordDialogProps) => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordStorage.verify(password)) {
      onSuccess();
      setPassword("");
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-destructive" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => {
              setPassword("");
              onOpenChange(false);
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Confirm
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};