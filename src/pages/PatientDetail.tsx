import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Calendar, DollarSign, FileText } from "lucide-react";
import { patientStorage, treatmentStorage, appointmentStorage, paymentStorage, Patient, Treatment, Appointment, Payment } from "@/lib/storage";
import { AddTreatmentDialog } from "@/components/AddTreatmentDialog";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isTreatmentDialogOpen, setIsTreatmentDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const loadData = () => {
    if (id) {
      const patientData = patientStorage.getById(id);
      setPatient(patientData || null);
      setTreatments(treatmentStorage.getByPatientId(id));
      setAppointments(appointmentStorage.getByPatientId(id));
      setPayments(paymentStorage.getByPatientId(id));
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const totalTreatmentCost = treatments.reduce((sum, t) => sum + t.cost, 0);
  const totalPaid = treatments.reduce((sum, t) => sum + t.paid, 0);
  const balance = totalTreatmentCost - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-muted-foreground">{patient.phone} • {patient.email}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Treatments</p>
              <p className="text-2xl font-bold">{treatments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Appointments</p>
              <p className="text-2xl font-bold">{appointments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Patient Info</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{patient.dateOfBirth || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{patient.address || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emergency Contact</p>
                <p className="font-medium">{patient.emergencyContact || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emergency Phone</p>
                <p className="font-medium">{patient.emergencyPhone || "Not provided"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Insurance</p>
                <p className="font-medium">{patient.insurance || "No insurance on file"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Allergies</p>
                <p className="font-medium">{patient.allergies || "None reported"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medical History</p>
                <p className="font-medium whitespace-pre-wrap">{patient.medicalHistory || "No history recorded"}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="treatments" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsTreatmentDialogOpen(true)}>Add Treatment</Button>
          </div>
          <div className="space-y-4">
            {treatments.map((treatment) => (
              <Card key={treatment.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{treatment.procedure}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(treatment.date).toLocaleDateString()}
                      {treatment.tooth && ` • Tooth #${treatment.tooth}`}
                    </p>
                    <p className="text-sm mt-2">{treatment.notes}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${treatment.cost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Paid: ${treatment.paid.toFixed(2)}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                      treatment.status === 'completed' ? 'bg-success/10 text-[hsl(var(--success))]' :
                      treatment.status === 'ongoing' ? 'bg-info/10 text-[hsl(var(--info))]' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {treatment.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
            {treatments.length === 0 && (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No treatments recorded yet</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-foreground">{appointment.type}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </p>
                  <p className="text-sm mt-2">{appointment.notes}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  appointment.status === 'completed' ? 'bg-success/10 text-[hsl(var(--success))]' :
                  appointment.status === 'scheduled' ? 'bg-info/10 text-[hsl(var(--info))]' :
                  appointment.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </Card>
          ))}
          {appointments.length === 0 && (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments scheduled</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsPaymentDialogOpen(true)}>Record Payment</Button>
          </div>
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-foreground">${payment.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()} • {payment.method}
                    </p>
                    {payment.notes && <p className="text-sm mt-1">{payment.notes}</p>}
                  </div>
                </div>
              </Card>
            ))}
            {payments.length === 0 && (
              <Card className="p-12 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payments recorded</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AddTreatmentDialog
        open={isTreatmentDialogOpen}
        onOpenChange={setIsTreatmentDialogOpen}
        patientId={patient.id}
        onTreatmentAdded={loadData}
      />

      <AddPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        patientId={patient.id}
        onPaymentAdded={loadData}
      />
    </div>
  );
};

export default PatientDetail;
