import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { treatmentStorage, procedureStorage, treatmentPlanStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useState as useReactState } from "react";

interface AddTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onTreatmentAdded: () => void;
}

export const AddTreatmentDialog = ({ open, onOpenChange, patientId, onTreatmentAdded }: AddTreatmentDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    procedure: "",
    tooth: "",
    notes: "",
    cost: "",
    paid: "",
    status: "completed" as "completed" | "planned" | "ongoing",
  });

  const procedures = procedureStorage.getAll();
  const treatmentPlans = treatmentPlanStorage.getAll();
  const [selectedTemplate, setSelectedTemplate] = useReactState<string>("");

  const handleTemplateSelect = (templateId: string) => {
    const procedure = procedures.find(p => p.id === templateId);
    if (procedure) {
      setFormData({
        ...formData,
        procedure: procedure.name,
        cost: procedure.defaultCost.toString(),
        notes: procedure.description || "",
      });
      setSelectedTemplate("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.procedure || !formData.cost) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    treatmentStorage.add({
      patientId,
      date: formData.date,
      procedure: formData.procedure,
      tooth: formData.tooth,
      notes: formData.notes,
      cost: parseFloat(formData.cost),
      paid: parseFloat(formData.paid) || 0,
      status: formData.status,
    });
    
    toast({
      title: "Success",
      description: "Treatment added successfully",
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      procedure: "",
      tooth: "",
      notes: "",
      cost: "",
      paid: "",
      status: "completed",
    });

    onTreatmentAdded();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Treatment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {procedures.length > 0 && (
            <div>
              <Label htmlFor="template">Quick Select from Library</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a procedure template..." />
                </SelectTrigger>
                <SelectContent>
                  {procedures.map((proc) => (
                    <SelectItem key={proc.id} value={proc.id}>
                      {proc.name} - ${proc.defaultCost.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
            <Label htmlFor="procedure">Procedure *</Label>
            <Input
              id="procedure"
              value={formData.procedure}
              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
              placeholder="e.g., Root Canal, Filling, Cleaning"
              required
            />
          </div>

          <div>
            <Label htmlFor="tooth">Tooth Number</Label>
            <Input
              id="tooth"
              value={formData.tooth}
              onChange={(e) => setFormData({ ...formData, tooth: e.target.value })}
              placeholder="e.g., 14, 21"
            />
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Cost *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="paid">Paid Amount</Label>
              <Input
                id="paid"
                type="number"
                step="0.01"
                value={formData.paid}
                onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Treatment details, observations..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Treatment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
