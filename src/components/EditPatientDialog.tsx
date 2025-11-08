import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { patientStorage, Patient } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface EditPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  onPatientUpdated: () => void;
}

export const EditPatientDialog = ({ open, onOpenChange, patient, onPatientUpdated }: EditPatientDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalHistory: "",
    allergies: "",
    insurance: "",
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        emergencyPhone: patient.emergencyPhone,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        insurance: patient.insurance,
      });
    }
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    patientStorage.update(patient.id, formData);
    
    toast({
      title: "Success",
      description: "Patient updated successfully",
    });

    onPatientUpdated();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Emergency Phone</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="insurance">Insurance</Label>
            <Input
              id="insurance"
              value={formData.insurance}
              onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Patient</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};