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
  EmptyState,
} from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import './BudgetsPage.scss';

interface Budget {
  id: string;
  month: string;
  categoryId: string;
  amount: number;
}

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [formData, setFormData] = useState({
    month: currentMonth,
    categoryId: '',
    amount: '',
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const year = parseInt(currentMonth.substring(0, 4));
      const month = parseInt(currentMonth.substring(5, 7));
      const fromDate = new Date(year, month - 1, 1);
      const toDate = new Date(year, month, 0);

      const [budgetsData, categoriesData, transactionsData] = await Promise.all([
        api.getBudgets(currentMonth),
        api.getCategories(),
        api.getTransactions({
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
        }),
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
      if (categoriesData.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({
          ...prev,
          categoryId: categoriesData[0].id,
        }));
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBudget({
        month: formData.month,
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
      });
      setShowModal(false);
      setFormData({
        month: currentMonth,
        categoryId: categories[0]?.id || '',
        amount: '',
      });
      showToast('Budget created successfully', 'success');
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create budget', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setBudgetToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;
    try {
      await api.deleteBudget(budgetToDelete);
      showToast('Budget deleted successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to delete budget', 'error');
    } finally {
      setBudgetToDelete(null);
    }
  };

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || id;

  const getSpentAmount = (categoryId: string) => {
    return transactions
      .filter((t) => t.categoryId === categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const budgetData = budgets.map((budget) => {
    const spent = getSpentAmount(budget.categoryId);
    const remaining = budget.amount - spent;
    const percentage =
      budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    return {
      ...budget,
      spent,
      remaining,
      percentage,
    };
  });

  return (
    <div className="budgets-page">
      <div className="page-header">
        <Button
          variant="primary"
          onClick={() => {
            setFormData({
              month: currentMonth,
              categoryId: categories[0]?.id || '',
              amount: '',
            });
            setShowModal(true);
          }}
        >
          Set Budget
        </Button>
      </div>

      <Card>
        <div className="month-selector-container">
          <label className="month-selector-label">Month:</label>
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="month-selector"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="skeleton" style={{ height: '200px' }} />
        ) : budgetData.length === 0 ? (
          <EmptyState
            icon="💰"
            title="No budgets for this month"
            description="Set a budget to track your spending"
            action={{
              label: 'Set Budget',
              onClick: () => {
                setFormData({
                  month: currentMonth,
                  categoryId: categories[0]?.id || '',
                  amount: '',
                });
                setShowModal(true);
              },
            }}
          />
        ) : (
          <Table
            columns={[
              { key: 'category', label: 'Category' },
              { key: 'budget', label: 'Budget' },
              { key: 'spent', label: 'Spent' },
              { key: 'remaining', label: 'Remaining' },
              { key: 'progress', label: 'Progress' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={budgetData}
            renderCell={(key, value, row) => {
              if (key === 'category') {
                return getCategoryName(row.categoryId);
              }
              if (key === 'budget') {
                return formatCurrency(row.amount);
              }
              if (key === 'spent') {
                return formatCurrency(row.spent);
              }
              if (key === 'remaining') {
                const className = row.remaining >= 0 ? 'amount-positive' : 'amount-negative';
                return <span className={className}>{formatCurrency(row.remaining)}</span>;
              }
              if (key === 'progress') {
                const variant =
                  row.percentage >= 100
                    ? 'danger'
                    : row.percentage >= 80
                      ? 'warning'
                      : 'success';
                return (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${variant}`}
                        style={{ width: `${Math.min(row.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="progress-text">{row.percentage.toFixed(0)}%</span>
                  </div>
                );
              }
              if (key === 'actions') {
                return (
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteClick(row.id)}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    Delete
                  </Button>
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
          setFormData({
            month: currentMonth,
            categoryId: categories[0]?.id || '',
            amount: '',
          });
        }}
        title="Set Budget"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setFormData({
                  month: currentMonth,
                  categoryId: categories[0]?.id || '',
                  amount: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="budget-form">
              Save
            </Button>
          </>
        }
      >
        <form id="budget-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Month"
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              required
            />
            <Select
              label="Category"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              options={categories
                .filter((cat) => cat.type === 'expense')
                .map((cat) => ({ value: cat.id, label: cat.name }))}
              required
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              placeholder="0.00"
            />
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setBudgetToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
