import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, User } from "lucide-react";
import { patientStorage, Patient } from "@/lib/storage";
import { useNavigate } from "react-router-dom";
import { AddPatientDialog } from "@/components/AddPatientDialog";

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();

  const loadPatients = () => {
    setPatients(patientStorage.getAll());
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => (
          <Card
            key={patient.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/patients/${patient.id}`)}
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {patient.firstName} {patient.lastName}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{patient.phone}</p>
                <p className="text-sm text-muted-foreground truncate">{patient.email}</p>
                {patient.lastVisit && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No patients found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search" : "Get started by adding your first patient"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          )}
        </Card>
      )}

      <AddPatientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onPatientAdded={loadPatients}
      />
    </div>
  );
};

export default Patients;
