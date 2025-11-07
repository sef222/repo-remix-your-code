import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";
import { patientStorage, appointmentStorage, paymentStorage, treatmentStorage } from "@/lib/storage";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatientsThisMonth: 0,
    todayAppointments: 0,
    monthRevenue: 0,
    lastMonthRevenue: 0,
    pendingPayments: 0,
    completedTreatments: 0,
  });

  useEffect(() => {
    const patients = patientStorage.getAll();
    const appointments = appointmentStorage.getAll();
    const payments = paymentStorage.getAll();
    const treatments = treatmentStorage.getAll();

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const today = format(now, 'yyyy-MM-dd');

    const newPatientsThisMonth = patients.filter(p => {
      const created = new Date(p.createdAt);
      return created >= monthStart && created <= monthEnd;
    }).length;

    const todayAppointments = appointments.filter(a => a.date === today).length;

    const monthRevenue = payments
      .filter(p => {
        const date = new Date(p.date);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const lastMonthRevenue = payments
      .filter(p => {
        const date = new Date(p.date);
        return date >= lastMonthStart && date <= lastMonthEnd;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayments = treatments
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.cost - t.paid), 0);

    const completedTreatments = treatments.filter(t => t.status === 'completed').length;

    setStats({
      totalPatients: patients.length,
      newPatientsThisMonth,
      todayAppointments,
      monthRevenue,
      lastMonthRevenue,
      pendingPayments,
      completedTreatments,
    });
  }, []);

  const revenueGrowth = stats.lastMonthRevenue > 0
    ? ((stats.monthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your practice overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
              <h3 className="text-2xl font-bold text-foreground mt-2">{stats.totalPatients}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                +{stats.newPatientsThisMonth} this month
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
              <h3 className="text-2xl font-bold text-foreground mt-2">{stats.todayAppointments}</h3>
              <p className="text-xs text-muted-foreground mt-1">Scheduled for today</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <h3 className="text-2xl font-bold text-foreground mt-2">${stats.monthRevenue.toFixed(2)}</h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {revenueGrowth}% vs last month
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-[hsl(var(--success))]" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
              <h3 className="text-2xl font-bold text-foreground mt-2">${stats.pendingPayments.toFixed(2)}</h3>
              <p className="text-xs text-muted-foreground mt-1">Outstanding balance</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-[hsl(var(--warning))]" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completed Treatments</span>
              <span className="font-semibold">{stats.completedTreatments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Patients (30 days)</span>
              <span className="font-semibold">{stats.newPatientsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Revenue/Patient</span>
              <span className="font-semibold">
                ${stats.totalPatients > 0 ? (stats.monthRevenue / stats.totalPatients).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Practice Insights</h3>
          <div className="space-y-4">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm font-medium text-primary">All data stored locally</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your patient data is saved on this device and persists across sessions
              </p>
            </div>
            <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
              <p className="text-sm font-medium text-accent">Offline-first design</p>
              <p className="text-xs text-muted-foreground mt-1">
                No internet required - works completely offline
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
