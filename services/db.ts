import { User, UserRole, SaleItem, Expense, Debtor, DebtorPayment, DebtorStatus, MonthlySummary } from '../types';

// Initial Seed Data Keys
const USERS_KEY = 'sb_users';
const SALES_KEY = 'sb_sales';
const EXPENSES_KEY = 'sb_expenses';
const DEBTORS_KEY = 'sb_debtors';
const PAYMENTS_KEY = 'sb_payments';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Initialize DB if empty
const initializeDB = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const initialUsers: User[] = [
      {
        id: 'admin_1',
        role: UserRole.ADMIN,
        // Empty PIN for first time setup
        pin: '', 
        default_pin_changed: false,
        name: 'Administrator'
      },
      {
        id: 'saler_1',
        role: UserRole.SALER,
        // Empty PIN for first time setup
        pin: '',
        default_pin_changed: false,
        name: 'Sales Staff',
        salary_amount: 0
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(SALES_KEY)) localStorage.setItem(SALES_KEY, JSON.stringify([]));
  if (!localStorage.getItem(EXPENSES_KEY)) localStorage.setItem(EXPENSES_KEY, JSON.stringify([]));
  if (!localStorage.getItem(DEBTORS_KEY)) localStorage.setItem(DEBTORS_KEY, JSON.stringify([]));
  if (!localStorage.getItem(PAYMENTS_KEY)) localStorage.setItem(PAYMENTS_KEY, JSON.stringify([]));
};

initializeDB();

// --- Users ---
export const getUsers = (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

export const updateUser = (user: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const getUserById = (id: string) => getUsers().find(u => u.id === id);

export const updateUserSalary = (userId: string, salary: number) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.salary_amount = salary;
    updateUser(user);
  }
};

export const updateUserPin = (userId: string, newPin: string) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.pin = newPin;
    user.default_pin_changed = true;
    updateUser(user);
  }
};

// --- Sales ---
export const getSales = (): SaleItem[] => JSON.parse(localStorage.getItem(SALES_KEY) || '[]');
export const addSale = (sale: Omit<SaleItem, 'id'>) => {
  const sales = getSales();
  const newSale = { ...sale, id: generateId() };
  sales.push(newSale);
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  return newSale;
};

// --- Expenses ---
export const getExpenses = (): Expense[] => JSON.parse(localStorage.getItem(EXPENSES_KEY) || '[]');
export const addExpense = (expense: Omit<Expense, 'id'>) => {
  const expenses = getExpenses();
  const newExpense = { ...expense, id: generateId() };
  expenses.push(newExpense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  return newExpense;
};

// --- Debtors ---
export const getDebtors = (): Debtor[] => JSON.parse(localStorage.getItem(DEBTORS_KEY) || '[]');
export const addDebtor = (debtor: Omit<Debtor, 'id' | 'balance' | 'status' | 'created_at'>) => {
  const debtors = getDebtors();
  const newDebtor: Debtor = {
    ...debtor,
    id: generateId(),
    balance: debtor.total_debt,
    status: DebtorStatus.UNPAID,
    created_at: new Date().toISOString()
  };
  debtors.push(newDebtor);
  localStorage.setItem(DEBTORS_KEY, JSON.stringify(debtors));
  return newDebtor;
};

export const addDebtorPayment = (debtorId: string, amount: number) => {
  const debtors = getDebtors();
  const debtorIndex = debtors.findIndex(d => d.id === debtorId);
  if (debtorIndex === -1) throw new Error("Debtor not found");

  const debtor = debtors[debtorIndex];
  const newBalance = debtor.balance - amount;
  
  debtor.balance = newBalance <= 0 ? 0 : newBalance;
  if (debtor.balance === 0) debtor.status = DebtorStatus.PAID;
  else if (debtor.balance < debtor.total_debt) debtor.status = DebtorStatus.PARTIALLY_PAID;
  else debtor.status = DebtorStatus.UNPAID;

  debtors[debtorIndex] = debtor;
  localStorage.setItem(DEBTORS_KEY, JSON.stringify(debtors));

  const payments = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
  const newPayment: DebtorPayment = {
    id: generateId(),
    debtor_id: debtorId,
    amount_paid: amount,
    date: new Date().toISOString(),
    remaining_balance: debtor.balance
  };
  payments.push(newPayment);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  return newPayment;
};

export const getDebtorPayments = (debtorId: string): DebtorPayment[] => {
  const payments: DebtorPayment[] = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
  return payments.filter(p => p.debtor_id === debtorId);
};

// --- Analysis & Reports ---
export const generateMonthlySummary = (month: number, year: number): MonthlySummary => {
  // Filter Sales
  const sales = getSales().filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const total_sales = sales.reduce((acc, curr) => acc + curr.total, 0);

  // Filter Expenses
  const expenses = getExpenses().filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const total_expenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Filter Payments
  const payments = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]') as DebtorPayment[];
  const monthPayments = payments.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const total_debtor_payments = monthPayments.reduce((acc, curr) => acc + curr.amount_paid, 0);

  // Calculate Salary Costs (Fixed per month for active Salers)
  const users = getUsers();
  const salers = users.filter(u => u.role === UserRole.SALER);
  const salary_cost = salers.reduce((acc, curr) => acc + (curr.salary_amount || 0), 0);

  const profit_or_loss = total_sales - (total_expenses + salary_cost);

  return {
    month,
    year,
    total_sales,
    total_expenses,
    total_debtor_payments,
    salary_cost,
    profit_or_loss
  };
};

export const getDailyBreakdown = (month: number, year: number) => {
  const sales = getSales().filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  
  // Group by day
  const daily: Record<string, number> = {};
  sales.forEach(s => {
    const day = new Date(s.date).getDate();
    daily[day] = (daily[day] || 0) + s.total;
  });
  
  return Object.entries(daily).map(([day, total]) => ({ day: Number(day), total })).sort((a,b) => a.day - b.day);
}

export const getFullDBDump = () => {
  return {
    users: getUsers(),
    sales: getSales(),
    expenses: getExpenses(),
    debtors: getDebtors(),
    payments: JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]')
  };
};