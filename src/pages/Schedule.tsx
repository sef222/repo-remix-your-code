import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Plus } from "lucide-react";
import { appointmentStorage, Appointment } from "@/lib/storage";
import { format } from "date-fns";
import { AddAppointmentDialog } from "@/components/AddAppointmentDialog";

const Schedule = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const loadAppointments = () => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setAppointments(appointmentStorage.getByDate(dateStr));
  };

  useEffect(() => {
    loadAppointments();
  }, [date]);

  const allAppointments = appointmentStorage.getAll();
  const appointmentDates = new Set(allAppointments.map(a => a.date));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground">Manage appointments and view your calendar</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Appointment
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[500px_1fr]">
        <Card className="p-8">
          <h2 className="text-lg font-semibold mb-4">Select Date</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="rounded-md border-0 scale-110 origin-top"
            modifiers={{
              hasAppointment: (day) => appointmentDates.has(format(day, 'yyyy-MM-dd'))
            }}
            modifiersStyles={{
              hasAppointment: {
                fontWeight: 'bold',
                textDecoration: 'underline',
                color: 'hsl(var(--primary))'
              }
            }}
          />
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Appointments for {format(date, 'MMMM d, yyyy')}
            </h2>
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No appointments scheduled for this day
                </p>
              ) : (
                appointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
                    <Card key={appointment.id} className="p-4 border-l-4" style={{
                      borderLeftColor: appointment.status === 'completed' ? 'hsl(var(--success))' :
                                      appointment.status === 'cancelled' ? 'hsl(var(--destructive))' :
                                      'hsl(var(--primary))'
                    }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {appointment.time} • {appointment.duration} min
                            {appointment.chair && ` • Chair ${appointment.chair}`}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm mt-2">{appointment.notes}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          appointment.status === 'completed' ? 'bg-success/10 text-[hsl(var(--success))]' :
                          appointment.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                          appointment.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </Card>
                  ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-3">Daily Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Appointments</span>
                <span className="font-medium">{appointments.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="font-medium">{appointments.filter(a => a.status === 'scheduled').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{appointments.filter(a => a.status === 'completed').length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AddAppointmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAppointmentAdded={loadAppointments}
        selectedDate={date}
      />
    </div>
  );
};

export default Schedule;
