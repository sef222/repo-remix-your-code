import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appointmentStorage, patientStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AddAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentAdded: () => void;
  selectedDate?: Date;
}

export const AddAppointmentDialog = ({ open, onOpenChange, onAppointmentAdded, selectedDate }: AddAppointmentDialogProps) => {
  const { toast } = useToast();
  const [patients, setPatients] = useState(patientStorage.getAll());
  const [formData, setFormData] = useState({
    patientId: "",
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
    time: "09:00",
    duration: "30",
    type: "",
    chair: "",
    notes: "",
    status: "scheduled" as "scheduled" | "completed" | "cancelled" | "no-show",
  });

  useEffect(() => {
    setPatients(patientStorage.getAll());
  }, [open]);

  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
    }
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const patient = patients.find(p => p.id === formData.patientId);
    if (!patient) {
      toast({
        title: "Error",
        description: "Selected patient not found",
        variant: "destructive",
      });
      return;
    }

    appointmentStorage.add({
      patientId: formData.patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      date: formData.date,
      time: formData.time,
      duration: parseInt(formData.duration),
      type: formData.type,
      chair: formData.chair,
      notes: formData.notes,
      status: formData.status,
    });
    
    toast({
      title: "Success",
      description: "Appointment scheduled successfully",
    });

    setFormData({
      patientId: "",
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
      time: "09:00",
      duration: "30",
      type: "",
      chair: "",
      notes: "",
      status: "scheduled",
    });

    onAppointmentAdded();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patientId">Patient *</Label>
            <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Appointment Type *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., Checkup, Cleaning"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (min) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="chair">Chair Number</Label>
            <Input
              id="chair"
              value={formData.chair}
              onChange={(e) => setFormData({ ...formData, chair: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional information..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
