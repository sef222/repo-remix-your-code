import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { procedureStorage, treatmentPlanStorage, ProcedureTemplate, TreatmentPlan } from "@/lib/storage";
import { Plus, Trash2, Edit, FileText, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TreatmentTemplatesManager = () => {
  const { toast } = useToast();
  const [procedures, setProcedures] = useState<ProcedureTemplate[]>(procedureStorage.getAll());
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>(treatmentPlanStorage.getAll());
  const [showProcedureDialog, setShowProcedureDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<ProcedureTemplate | null>(null);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);

  const categories = ["General", "Preventive", "Restorative", "Cosmetic", "Orthodontics", "Surgery", "Endodontics", "Periodontics"];

  const handleSaveProcedure = (procedure: Omit<ProcedureTemplate, 'id'>) => {
    if (editingProcedure) {
      procedureStorage.update(editingProcedure.id, procedure);
      toast({ title: "Success", description: "Procedure updated successfully" });
    } else {
      procedureStorage.add(procedure);
      toast({ title: "Success", description: "Procedure added successfully" });
    }
    setProcedures(procedureStorage.getAll());
    setShowProcedureDialog(false);
    setEditingProcedure(null);
  };

  const handleDeleteProcedure = (id: string) => {
    procedureStorage.delete(id);
    setProcedures(procedureStorage.getAll());
    toast({ title: "Success", description: "Procedure deleted" });
  };

  const handleSavePlan = (plan: Omit<TreatmentPlan, 'id'>) => {
    if (editingPlan) {
      treatmentPlanStorage.update(editingPlan.id, plan);
      toast({ title: "Success", description: "Treatment plan updated successfully" });
    } else {
      treatmentPlanStorage.add(plan);
      toast({ title: "Success", description: "Treatment plan added successfully" });
    }
    setTreatmentPlans(treatmentPlanStorage.getAll());
    setShowPlanDialog(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = (id: string) => {
    treatmentPlanStorage.delete(id);
    setTreatmentPlans(treatmentPlanStorage.getAll());
    toast({ title: "Success", description: "Treatment plan deleted" });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Procedure Library
          </h2>
          <Button onClick={() => { setEditingProcedure(null); setShowProcedureDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Procedure
          </Button>
        </div>
        <div className="space-y-2">
          {procedures.map((proc) => (
            <div key={proc.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{proc.name}</p>
                  {proc.code && <span className="text-xs text-muted-foreground">({proc.code})</span>}
                </div>
                <p className="text-sm text-muted-foreground">{proc.category} • ${proc.defaultCost.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditingProcedure(proc); setShowProcedureDialog(true); }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteProcedure(proc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {procedures.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No procedures yet. Add your first procedure to get started.</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Treatment Plans
          </h2>
          <Button onClick={() => { setEditingPlan(null); setShowPlanDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Plan
          </Button>
        </div>
        <div className="space-y-3">
          {treatmentPlans.map((plan) => (
            <div key={plan.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingPlan(plan); setShowPlanDialog(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1 mt-2">
                {plan.procedures.map((proc, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">• {proc.procedureName} - ${proc.cost.toFixed(2)}</p>
                ))}
                <p className="text-sm font-medium mt-2">Total: ${plan.totalCost.toFixed(2)}</p>
              </div>
            </div>
          ))}
          {treatmentPlans.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No treatment plans yet. Create a plan to quickly apply common treatments.</p>
          )}
        </div>
      </Card>

      <ProcedureDialog
        open={showProcedureDialog}
        onOpenChange={setShowProcedureDialog}
        procedure={editingProcedure}
        categories={categories}
        onSave={handleSaveProcedure}
      />

      <TreatmentPlanDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
        plan={editingPlan}
        procedures={procedures}
        onSave={handleSavePlan}
      />
    </div>
  );
};

interface ProcedureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedure: ProcedureTemplate | null;
  categories: string[];
  onSave: (procedure: Omit<ProcedureTemplate, 'id'>) => void;
}

const ProcedureDialog = ({ open, onOpenChange, procedure, categories, onSave }: ProcedureDialogProps) => {
  const [formData, setFormData] = useState({
    name: procedure?.name || "",
    code: procedure?.code || "",
    defaultCost: procedure?.defaultCost.toString() || "",
    duration: procedure?.duration?.toString() || "",
    category: procedure?.category || "General",
    description: procedure?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      code: formData.code,
      defaultCost: parseFloat(formData.defaultCost),
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      category: formData.category,
      description: formData.description,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{procedure ? "Edit Procedure" : "Add Procedure"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Procedure Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Root Canal Treatment"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Procedure Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., D3310"
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultCost">Default Cost *</Label>
              <Input
                id="defaultCost"
                type="number"
                step="0.01"
                value={formData.defaultCost}
                onChange={(e) => setFormData({ ...formData, defaultCost: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="60"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about the procedure..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Procedure</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface TreatmentPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: TreatmentPlan | null;
  procedures: ProcedureTemplate[];
  onSave: (plan: Omit<TreatmentPlan, 'id'>) => void;
}

const TreatmentPlanDialog = ({ open, onOpenChange, plan, procedures, onSave }: TreatmentPlanDialogProps) => {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    procedures: plan?.procedures || [] as TreatmentPlan['procedures'],
  });

  const [selectedProcedure, setSelectedProcedure] = useState("");

  const handleAddProcedure = () => {
    const proc = procedures.find(p => p.id === selectedProcedure);
    if (proc) {
      setFormData({
        ...formData,
        procedures: [...formData.procedures, {
          procedureId: proc.id,
          procedureName: proc.name,
          cost: proc.defaultCost,
        }]
      });
      setSelectedProcedure("");
    }
  };

  const handleRemoveProcedure = (index: number) => {
    setFormData({
      ...formData,
      procedures: formData.procedures.filter((_, i) => i !== index)
    });
  };

  const totalCost = formData.procedures.reduce((sum, p) => sum + p.cost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description,
      procedures: formData.procedures,
      totalCost,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Treatment Plan" : "Create Treatment Plan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="planName">Plan Name *</Label>
            <Input
              id="planName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Full Mouth Restoration"
              required
            />
          </div>
          <div>
            <Label htmlFor="planDescription">Description *</Label>
            <Textarea
              id="planDescription"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this treatment plan..."
              required
            />
          </div>
          <div>
            <Label>Add Procedures</Label>
            <div className="flex gap-2">
              <Select value={selectedProcedure} onValueChange={setSelectedProcedure}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select procedure..." />
                </SelectTrigger>
                <SelectContent>
                  {procedures.map((proc) => (
                    <SelectItem key={proc.id} value={proc.id}>
                      {proc.name} - ${proc.defaultCost.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddProcedure} disabled={!selectedProcedure}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-auto">
            {formData.procedures.map((proc, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{proc.procedureName} - ${proc.cost.toFixed(2)}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveProcedure(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {formData.procedures.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No procedures added yet</p>
            )}
          </div>
          {formData.procedures.length > 0 && (
            <div className="text-right font-medium">
              Total Cost: ${totalCost.toFixed(2)}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={formData.procedures.length === 0}>Save Plan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
