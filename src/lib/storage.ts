// Local storage utilities for offline data persistence

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  allergies: string;
  insurance: string;
  createdAt: string;
  lastVisit?: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  date: string;
  procedure: string;
  tooth?: string;
  notes: string;
  cost: number;
  paid: number;
  status: 'completed' | 'planned' | 'ongoing';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  chair?: string;
}

export interface Payment {
  id: string;
  patientId: string;
  treatmentId?: string;
  date: string;
  amount: number;
  method: 'cash' | 'card' | 'insurance' | 'transfer';
  notes: string;
}

export interface ProcedureTemplate {
  id: string;
  name: string;
  code?: string;
  defaultCost: number;
  duration?: number; // in minutes
  category: string;
  description?: string;
}

export interface TreatmentPlan {
  id: string;
  name: string;
  description: string;
  procedures: {
    procedureId: string;
    procedureName: string;
    tooth?: string;
    cost: number;
    notes?: string;
  }[];
  totalCost: number;
}

const STORAGE_KEYS = {
  PATIENTS: 'dental_patients',
  TREATMENTS: 'dental_treatments',
  APPOINTMENTS: 'dental_appointments',
  PAYMENTS: 'dental_payments',
  PREFERENCES: 'dental_preferences',
  PROCEDURES: 'dental_procedures',
  TREATMENT_PLANS: 'dental_treatment_plans',
};

// User Preferences
export interface UserPreferences {
  primaryColor: string;
  showRevenue: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  primaryColor: '200 98% 39%', // Default blue
  showRevenue: true,
};

export const preferencesStorage = {
  get: (): UserPreferences => {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
  },
  set: (preferences: Partial<UserPreferences>): void => {
    const current = preferencesStorage.get();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
  },
  applyTheme: (): void => {
    const prefs = preferencesStorage.get();
    document.documentElement.style.setProperty('--primary', prefs.primaryColor);
  },
};

// Initialize theme on load
preferencesStorage.applyTheme();

// Generic storage functions with optimization for large datasets
function getItems<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing ${key}:`, error);
    return [];
  }
}

function setItems<T>(key: string, items: T[]): void {
  try {
    // For large datasets, we could compress here
    const data = JSON.stringify(items);
    
    // Check if we're approaching localStorage limits (5-10MB)
    const estimatedSize = new Blob([data]).size;
    if (estimatedSize > 4 * 1024 * 1024) { // 4MB warning
      console.warn(`Storage for ${key} is getting large (${(estimatedSize / 1024 / 1024).toFixed(2)}MB). Consider archiving old records.`);
    }
    
    localStorage.setItem(key, data);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please export and clear old data.');
    }
    throw error;
  }
}

// Patient operations
export const patientStorage = {
  getAll: (): Patient[] => getItems<Patient>(STORAGE_KEYS.PATIENTS),
  getById: (id: string): Patient | undefined => {
    const patients = getItems<Patient>(STORAGE_KEYS.PATIENTS);
    return patients.find(p => p.id === id);
  },
  add: (patient: Omit<Patient, 'id' | 'createdAt'>): Patient => {
    const patients = getItems<Patient>(STORAGE_KEYS.PATIENTS);
    const newPatient: Patient = {
      ...patient,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    patients.push(newPatient);
    setItems(STORAGE_KEYS.PATIENTS, patients);
    return newPatient;
  },
  update: (id: string, updates: Partial<Patient>): void => {
    const patients = getItems<Patient>(STORAGE_KEYS.PATIENTS);
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients[index] = { ...patients[index], ...updates };
      setItems(STORAGE_KEYS.PATIENTS, patients);
    }
  },
  delete: (id: string): void => {
    const patients = getItems<Patient>(STORAGE_KEYS.PATIENTS);
    setItems(STORAGE_KEYS.PATIENTS, patients.filter(p => p.id !== id));
  },
};

// Treatment operations
export const treatmentStorage = {
  getAll: (): Treatment[] => getItems<Treatment>(STORAGE_KEYS.TREATMENTS),
  getByPatientId: (patientId: string): Treatment[] => {
    const treatments = getItems<Treatment>(STORAGE_KEYS.TREATMENTS);
    return treatments.filter(t => t.patientId === patientId);
  },
  add: (treatment: Omit<Treatment, 'id'>): Treatment => {
    const treatments = getItems<Treatment>(STORAGE_KEYS.TREATMENTS);
    const newTreatment: Treatment = {
      ...treatment,
      id: Date.now().toString(),
    };
    treatments.push(newTreatment);
    setItems(STORAGE_KEYS.TREATMENTS, treatments);
    return newTreatment;
  },
  update: (id: string, updates: Partial<Treatment>): void => {
    const treatments = getItems<Treatment>(STORAGE_KEYS.TREATMENTS);
    const index = treatments.findIndex(t => t.id === id);
    if (index !== -1) {
      treatments[index] = { ...treatments[index], ...updates };
      setItems(STORAGE_KEYS.TREATMENTS, treatments);
    }
  },
  delete: (id: string): void => {
    const treatments = getItems<Treatment>(STORAGE_KEYS.TREATMENTS);
    setItems(STORAGE_KEYS.TREATMENTS, treatments.filter(t => t.id !== id));
  },
};

// Appointment operations
export const appointmentStorage = {
  getAll: (): Appointment[] => getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS),
  getByDate: (date: string): Appointment[] => {
    const appointments = getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    return appointments.filter(a => a.date === date);
  },
  getByPatientId: (patientId: string): Appointment[] => {
    const appointments = getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    return appointments.filter(a => a.patientId === patientId);
  },
  add: (appointment: Omit<Appointment, 'id'>): Appointment => {
    const appointments = getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
    };
    appointments.push(newAppointment);
    setItems(STORAGE_KEYS.APPOINTMENTS, appointments);
    return newAppointment;
  },
  update: (id: string, updates: Partial<Appointment>): void => {
    const appointments = getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      setItems(STORAGE_KEYS.APPOINTMENTS, appointments);
    }
  },
  delete: (id: string): void => {
    const appointments = getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    setItems(STORAGE_KEYS.APPOINTMENTS, appointments.filter(a => a.id !== id));
  },
};

// Payment operations
export const paymentStorage = {
  getAll: (): Payment[] => getItems<Payment>(STORAGE_KEYS.PAYMENTS),
  getByPatientId: (patientId: string): Payment[] => {
    const payments = getItems<Payment>(STORAGE_KEYS.PAYMENTS);
    return payments.filter(p => p.patientId === patientId);
  },
  add: (payment: Omit<Payment, 'id'>): Payment => {
    const payments = getItems<Payment>(STORAGE_KEYS.PAYMENTS);
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
    };
    payments.push(newPayment);
    setItems(STORAGE_KEYS.PAYMENTS, payments);
    return newPayment;
  },
  delete: (id: string): void => {
    const payments = getItems<Payment>(STORAGE_KEYS.PAYMENTS);
    setItems(STORAGE_KEYS.PAYMENTS, payments.filter(p => p.id !== id));
  },
};

// Procedure template operations
export const procedureStorage = {
  getAll: (): ProcedureTemplate[] => getItems<ProcedureTemplate>(STORAGE_KEYS.PROCEDURES),
  getById: (id: string): ProcedureTemplate | undefined => {
    const procedures = getItems<ProcedureTemplate>(STORAGE_KEYS.PROCEDURES);
    return procedures.find(p => p.id === id);
  },
  add: (procedure: Omit<ProcedureTemplate, 'id'>): ProcedureTemplate => {
    const procedures = getItems<ProcedureTemplate>(STORAGE_KEYS.PROCEDURES);
    const newProcedure: ProcedureTemplate = {
      ...procedure,
      id: Date.now().toString(),
    };
    procedures.push(newProcedure);
    setItems(STORAGE_KEYS.PROCEDURES, procedures);
    return newProcedure;
  },
  update: (id: string, updates: Partial<ProcedureTemplate>): void => {
    const procedures = getItems<ProcedureTemplate>(STORAGE_KEYS.PROCEDURES);
    const index = procedures.findIndex(p => p.id === id);
    if (index !== -1) {
      procedures[index] = { ...procedures[index], ...updates };
      setItems(STORAGE_KEYS.PROCEDURES, procedures);
    }
  },
  delete: (id: string): void => {
    const procedures = getItems<ProcedureTemplate>(STORAGE_KEYS.PROCEDURES);
    setItems(STORAGE_KEYS.PROCEDURES, procedures.filter(p => p.id !== id));
  },
};

// Treatment plan operations
export const treatmentPlanStorage = {
  getAll: (): TreatmentPlan[] => getItems<TreatmentPlan>(STORAGE_KEYS.TREATMENT_PLANS),
  getById: (id: string): TreatmentPlan | undefined => {
    const plans = getItems<TreatmentPlan>(STORAGE_KEYS.TREATMENT_PLANS);
    return plans.find(p => p.id === id);
  },
  add: (plan: Omit<TreatmentPlan, 'id'>): TreatmentPlan => {
    const plans = getItems<TreatmentPlan>(STORAGE_KEYS.TREATMENT_PLANS);
    const newPlan: TreatmentPlan = {
      ...plan,
      id: Date.now().toString(),
    };
    plans.push(newPlan);
    setItems(STORAGE_KEYS.TREATMENT_PLANS, plans);
    return newPlan;
  },
  update: (id: string, updates: Partial<TreatmentPlan>): void => {
    const plans = getItems<TreatmentPlan>(STORAGE_KEYS.TREATMENT_PLANS);
    const index = plans.findIndex(p => p.id === id);
    if (index !== -1) {
      plans[index] = { ...plans[index], ...updates };
      setItems(STORAGE_KEYS.TREATMENT_PLANS, plans);
    }
  },
  delete: (id: string): void => {
    const plans = getItems<TreatmentPlan>(STORAGE_KEYS.TREATMENT_PLANS);
    setItems(STORAGE_KEYS.TREATMENT_PLANS, plans.filter(p => p.id !== id));
  },
};

// Password management (simple hash for offline security)
const PASSWORD_KEY = 'dental_app_password';
const DEFAULT_PASSWORD = 'admin123'; // Default password

export const passwordStorage = {
  initialize: (): void => {
    if (!localStorage.getItem(PASSWORD_KEY)) {
      localStorage.setItem(PASSWORD_KEY, btoa(DEFAULT_PASSWORD));
    }
  },
  verify: (password: string): boolean => {
    const stored = localStorage.getItem(PASSWORD_KEY);
    return stored === btoa(password);
  },
  change: (oldPassword: string, newPassword: string): boolean => {
    if (!passwordStorage.verify(oldPassword)) {
      return false;
    }
    localStorage.setItem(PASSWORD_KEY, btoa(newPassword));
    return true;
  },
  getDefault: (): string => DEFAULT_PASSWORD,
};

// Initialize password on first load
passwordStorage.initialize();

// Backup and restore
export const backupStorage = {
  exportAll: (): string => {
    const data = {
      patients: patientStorage.getAll(),
      treatments: treatmentStorage.getAll(),
      appointments: appointmentStorage.getAll(),
      payments: paymentStorage.getAll(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },
  importAll: (jsonData: string): void => {
    try {
      const data = JSON.parse(jsonData);
      if (data.patients) setItems(STORAGE_KEYS.PATIENTS, data.patients);
      if (data.treatments) setItems(STORAGE_KEYS.TREATMENTS, data.treatments);
      if (data.appointments) setItems(STORAGE_KEYS.APPOINTMENTS, data.appointments);
      if (data.payments) setItems(STORAGE_KEYS.PAYMENTS, data.payments);
    } catch (error) {
      throw new Error('Invalid backup file format');
    }
  },
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
  exportPatients: (): string => {
    const data = {
      patients: patientStorage.getAll(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },
  importPatients: (jsonData: string): void => {
    try {
      const data = JSON.parse(jsonData);
      if (data.patients) setItems(STORAGE_KEYS.PATIENTS, data.patients);
    } catch (error) {
      throw new Error('Invalid patients file format');
    }
  },
};
