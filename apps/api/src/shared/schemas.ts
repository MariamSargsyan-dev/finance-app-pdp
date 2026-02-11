export const accountTypeSchema = ['cash', 'bank', 'card'] as const;
export const transactionTypeSchema = ['income', 'expense', 'transfer'] as const;
export const categoryTypeSchema = ['income', 'expense'] as const;

export const monthSchemaRegex = /^\d{4}-\d{2}$/;
export const dateSchemaRegex = /^\d{4}-\d{2}-\d{2}$/;
