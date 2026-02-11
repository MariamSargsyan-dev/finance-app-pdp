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
  Badge,
} from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import './AccountsPage.scss';

interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
}

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash',
    currency: 'USD',
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAccount(formData);
      setShowModal(false);
      setFormData({ name: '', type: 'cash', currency: 'USD' });
      showToast('Account created successfully', 'success');
      loadAccounts();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create account', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setAccountToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    try {
      await api.deleteAccount(accountToDelete);
      showToast('Account deleted successfully', 'success');
      loadAccounts();
    } catch (error) {
      showToast('Failed to delete account', 'error');
    } finally {
      setAccountToDelete(null);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="accounts-page">
      <div className="page-header">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Account
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="skeleton" style={{ height: '200px' }} />
        ) : accounts.length === 0 ? (
          <EmptyState
            icon="🏦"
            title="No accounts yet"
            description="Create your first account to start tracking finances"
            action={{
              label: 'Add Account',
              onClick: () => setShowModal(true),
            }}
          />
        ) : (
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'type', label: 'Type' },
              { key: 'currency', label: 'Currency' },
              { key: 'balance', label: 'Balance' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={accounts}
            renderCell={(key, value, row) => {
              if (key === 'type') {
                return (
                  <Badge variant="info">
                    {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
                  </Badge>
                );
              }
              if (key === 'balance') {
                return formatCurrency(row.balance, row.currency);
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
          setFormData({ name: '', type: 'cash', currency: 'USD' });
        }}
        title="Add Account"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setFormData({ name: '', type: 'cash', currency: 'USD' });
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="account-form">
              Create
            </Button>
          </>
        }
      >
        <form id="account-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Checking Account"
            />
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank', label: 'Bank' },
                { value: 'card', label: 'Card' },
              ]}
              required
            />
            <Input
              label="Currency"
              type="text"
              value={formData.currency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currency: e.target.value.toUpperCase(),
                })
              }
              required
              maxLength={3}
              placeholder="USD"
            />
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setAccountToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete this account? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
