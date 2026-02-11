export type PackKey = 'personal' | 'family' | 'freelancer' | 'student' | 'empty';

export interface PackAccount {
  name: string;
  type: 'cash' | 'bank' | 'card';
  currency: string;
}

export interface PackCategory {
  name: string;
  type: 'income' | 'expense';
}

export interface PackBudget {
  categoryName: string;
  amount: number;
}

export interface StarterPackDefinition {
  key: PackKey;
  label: string;
  description: string;
  accounts: PackAccount[];
  categories: PackCategory[];
  budgets?: PackBudget[];
}

const PERSONAL: StarterPackDefinition = {
  key: 'personal',
  label: 'Personal (Simple)',
  description: 'Basic accounts and categories for personal finance.',
  accounts: [
    { name: 'Cash', type: 'cash', currency: 'USD' },
    { name: 'Main Bank', type: 'bank', currency: 'USD' },
    { name: 'Credit Card', type: 'card', currency: 'USD' },
  ],
  categories: [
    { name: 'Salary', type: 'income' },
    { name: 'Other Income', type: 'income' },
    { name: 'Groceries', type: 'expense' },
    { name: 'Transport', type: 'expense' },
    { name: 'Utilities', type: 'expense' },
    { name: 'Dining', type: 'expense' },
    { name: 'Shopping', type: 'expense' },
    { name: 'Other', type: 'expense' },
  ],
  budgets: [
    { categoryName: 'Groceries', amount: 400 },
    { categoryName: 'Dining', amount: 150 },
  ],
};

const FAMILY: StarterPackDefinition = {
  key: 'family',
  label: 'Family',
  description: 'Accounts and categories for family budgeting.',
  accounts: [
    { name: 'Household Cash', type: 'cash', currency: 'USD' },
    { name: 'Joint Account', type: 'bank', currency: 'USD' },
    { name: 'Savings', type: 'bank', currency: 'USD' },
    { name: 'Family Card', type: 'card', currency: 'USD' },
  ],
  categories: [
    { name: 'Salary', type: 'income' },
    { name: 'Side Income', type: 'income' },
    { name: 'Groceries', type: 'expense' },
    { name: 'Kids', type: 'expense' },
    { name: 'Housing', type: 'expense' },
    { name: 'Transport', type: 'expense' },
    { name: 'Utilities', type: 'expense' },
    { name: 'Healthcare', type: 'expense' },
    { name: 'Entertainment', type: 'expense' },
    { name: 'Other', type: 'expense' },
  ],
  budgets: [
    { categoryName: 'Groceries', amount: 600 },
    { categoryName: 'Kids', amount: 300 },
    { categoryName: 'Entertainment', amount: 200 },
  ],
};

const FREELANCER: StarterPackDefinition = {
  key: 'freelancer',
  label: 'Freelancer',
  description: 'For freelancers tracking business and personal.',
  accounts: [
    { name: 'Business Account', type: 'bank', currency: 'USD' },
    { name: 'Personal Account', type: 'bank', currency: 'USD' },
    { name: 'Business Card', type: 'card', currency: 'USD' },
  ],
  categories: [
    { name: 'Client Payments', type: 'income' },
    { name: 'Other Income', type: 'income' },
    { name: 'Software & Tools', type: 'expense' },
    { name: 'Office', type: 'expense' },
    { name: 'Marketing', type: 'expense' },
    { name: 'Tax & Legal', type: 'expense' },
    { name: 'Personal Draw', type: 'expense' },
    { name: 'Other', type: 'expense' },
  ],
  budgets: [
    { categoryName: 'Software & Tools', amount: 200 },
    { categoryName: 'Marketing', amount: 150 },
  ],
};

const STUDENT: StarterPackDefinition = {
  key: 'student',
  label: 'Student',
  description: 'Simple setup for students.',
  accounts: [
    { name: 'Cash', type: 'cash', currency: 'USD' },
    { name: 'Bank Account', type: 'bank', currency: 'USD' },
  ],
  categories: [
    { name: 'Allowance', type: 'income' },
    { name: 'Part-time', type: 'income' },
    { name: 'Food', type: 'expense' },
    { name: 'Transport', type: 'expense' },
    { name: 'Books & Supplies', type: 'expense' },
    { name: 'Entertainment', type: 'expense' },
    { name: 'Other', type: 'expense' },
  ],
  budgets: [
    { categoryName: 'Food', amount: 200 },
    { categoryName: 'Entertainment', amount: 50 },
  ],
};

const EMPTY: StarterPackDefinition = {
  key: 'empty',
  label: 'Start empty',
  description: 'No pre-configured data. Set up everything yourself.',
  accounts: [],
  categories: [],
};

export const STARTER_PACKS: StarterPackDefinition[] = [
  PERSONAL,
  FAMILY,
  FREELANCER,
  STUDENT,
  EMPTY,
];

export function getStarterPack(key: PackKey): StarterPackDefinition | null {
  return STARTER_PACKS.find((p) => p.key === key) ?? null;
}
