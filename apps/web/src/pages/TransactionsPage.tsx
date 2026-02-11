import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  Button,
  Card,
  Input,
  Select,
  Modal,
  ConfirmationModal,
  Table,
  SegmentedControl,
  Badge,
  EmptyState,
} from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import './TransactionsPage.scss';

interface Transaction {
  id: string;
  type: string;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  amount: number;
  date: string;
  note?: string;
}

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    accountId: '',
    toAccountId: '',
    categoryId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    type: '',
    accountId: '',
    categoryId: '',
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadData = async () => {
    try {
      const [txns, accts, cats] = await Promise.all([
        api.getTransactions(),
        api.getAccounts(),
        api.getCategories(),
      ]);
      setTransactions(txns);
      setAccounts(accts);
      setCategories(cats);
      if (accts.length > 0 && !formData.accountId) {
        setFormData((prev) => ({ ...prev, accountId: accts[0].id }));
      }
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const txns = await api.getTransactions({
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        type: filters.type || undefined,
        accountId: filters.accountId || undefined,
        categoryId: filters.categoryId || undefined,
      });
      setTransactions(txns);
    } catch (error) {
      console.error('Failed to load transactions', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await api.updateTransaction(editingTransaction.id, {
          amount: parseFloat(formData.amount),
          date: formData.date,
          note: formData.note || undefined,
        });
        showToast('Transaction updated successfully', 'success');
      } else {
        await api.createTransaction({
          type: formData.type,
          accountId: formData.accountId,
          toAccountId: formData.type === 'transfer' ? formData.toAccountId : undefined,
          categoryId: formData.type !== 'transfer' ? formData.categoryId : undefined,
          amount: parseFloat(formData.amount),
          date: formData.date,
          note: formData.note || undefined,
        });
        showToast('Transaction created successfully', 'success');
      }
      setShowModal(false);
      resetForm();
      loadTransactions();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save transaction', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    try {
      await api.deleteTransaction(transactionToDelete);
      showToast('Transaction deleted successfully', 'success');
      loadTransactions();
    } catch (error) {
      showToast('Failed to delete transaction', 'error');
    } finally {
      setTransactionToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      accountId: accounts[0]?.id || '',
      toAccountId: '',
      categoryId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
    setEditingTransaction(null);
  };

  const openEditModal = (txn: Transaction) => {
    setEditingTransaction(txn);
    setFormData({
      type: txn.type,
      accountId: txn.accountId,
      toAccountId: txn.toAccountId || '',
      categoryId: txn.categoryId || '',
      amount: txn.amount.toString(),
      date: new Date(txn.date).toISOString().split('T')[0],
      note: txn.note || '',
    });
    setShowModal(true);
  };

  const getAccountName = (id: string) =>
    accounts.find((a) => a.id === id)?.name || id;
  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || id;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type || formData.type === 'transfer',
  );

  return (
    <div className="transactions-page">
      <div className="page-header">
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add Transaction
        </Button>
      </div>

      <Card>
        <div className="filters">
          <Input
            type="date"
            label="From Date"
            value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
          />
          <Input
            type="date"
            label="To Date"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
          />
          <Select
            label="Type"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            options={[
              { value: '', label: 'All' },
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
              { value: 'transfer', label: 'Transfer' },
            ]}
          />
          <Select
            label="Account"
            value={filters.accountId}
            onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
            options={[
              { value: '', label: 'All Accounts' },
              ...accounts.map((acc) => ({ value: acc.id, label: acc.name })),
            ]}
          />
          <Select
            label="Category"
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
          />
          <div className="filter-actions">
            <Button
              variant="ghost"
              onClick={() =>
                setFilters({
                  fromDate: '',
                  toDate: '',
                  type: '',
                  accountId: '',
                  categoryId: '',
                })
              }
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {transactions.length === 0 ? (
          <EmptyState
            icon="💸"
            title="No transactions found"
            description="Add your first transaction or adjust your filters"
            action={{
              label: 'Add Transaction',
              onClick: () => {
                resetForm();
                setShowModal(true);
              },
            }}
          />
        ) : (
          <Table
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'type', label: 'Type' },
              { key: 'category', label: 'Category' },
              { key: 'account', label: 'Account' },
              { key: 'amount', label: 'Amount' },
              { key: 'note', label: 'Note' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={transactions}
            renderCell={(key, value, row) => {
              if (key === 'date') {
                return new Date(row.date).toLocaleDateString();
              }
              if (key === 'type') {
                return (
                  <Badge
                    variant={
                      row.type === 'income'
                        ? 'success'
                        : row.type === 'expense'
                          ? 'danger'
                          : 'info'
                    }
                  >
                    {row.type}
                  </Badge>
                );
              }
              if (key === 'category') {
                if (row.type === 'transfer') {
                  return `→ ${getAccountName(row.toAccountId!)}`;
                }
                return row.categoryId ? getCategoryName(row.categoryId) : '-';
              }
              if (key === 'account') {
                return getAccountName(row.accountId);
              }
              if (key === 'amount') {
                const sign = row.type === 'income' ? '+' : row.type === 'expense' ? '-' : '';
                const className =
                  row.type === 'income'
                    ? 'amount-positive'
                    : row.type === 'expense'
                      ? 'amount-negative'
                      : '';
                return (
                  <span className={className}>
                    {sign}
                    {formatCurrency(row.amount)}
                  </span>
                );
              }
              if (key === 'note') {
                return row.note || '-';
              }
              if (key === 'actions') {
                return (
                  <div className="table-actions">
                    <Button
                      variant="ghost"
                      onClick={() => openEditModal(row as Transaction)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteClick(row.id)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Delete
                    </Button>
                  </div>
                );
              }
              return value;
            }}
          />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="transaction-form">
              {editingTransaction ? 'Update' : 'Save'}
            </Button>
          </>
        }
      >
        <form id="transaction-form" onSubmit={handleSubmit}>
          <SegmentedControl
            options={[
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
              { value: 'transfer', label: 'Transfer' },
            ]}
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value })}
          />

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formData.type === 'transfer' ? (
              <>
                <Select
                  label="From Account"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  options={accounts.map((acc) => ({ value: acc.id, label: acc.name }))}
                  required
                />
                <Select
                  label="To Account"
                  value={formData.toAccountId}
                  onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                  options={accounts
                    .filter((acc) => acc.id !== formData.accountId)
                    .map((acc) => ({ value: acc.id, label: acc.name }))}
                  required
                />
              </>
            ) : (
              <>
                <Select
                  label="Account"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  options={accounts.map((acc) => ({ value: acc.id, label: acc.name }))}
                  required
                />
                <Select
                  label="Category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  options={filteredCategories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                  required
                />
              </>
            )}

            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />

            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <Input
              label="Note"
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Optional note"
            />
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setTransactionToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
