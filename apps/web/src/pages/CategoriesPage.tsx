import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  Button,
  Input,
  Select,
  Modal,
  ConfirmationModal,
  Tabs,
  EmptyState,
} from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import './CategoriesPage.scss';

interface Category {
  id: string;
  name: string;
  type: string;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuId && !(e.target as Element).closest('.actions-mobile')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await api.updateCategory(editingCategoryId, { name: formData.name });
        showToast('Category updated successfully', 'success');
      } else {
        await api.createCategory(formData);
        showToast('Category created successfully', 'success');
      }
      setShowModal(false);
      setFormData({ name: '', type: 'expense' });
      setEditingCategoryId(null);
      loadCategories();
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
          `Failed to ${editingCategoryId ? 'update' : 'create'} category`,
        'error',
      );
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await api.deleteCategory(categoryToDelete);
      showToast('Category deleted successfully', 'success');
      loadCategories();
    } catch (error) {
      showToast('Failed to delete category', 'error');
    } finally {
      setCategoryToDelete(null);
    }
  };

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const displayedCategories =
    activeTab === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="categories-page">
      <div className="categories-header">
        <Button
          variant="primary"
          onClick={() => {
            setFormData({ name: '', type: activeTab });
            setShowModal(true);
          }}
        >
          Add Category
        </Button>
      </div>

      <div className="categories-container">
        <Tabs
          tabs={[
            { id: 'expense', label: 'Expense' },
            { id: 'income', label: 'Income' },
          ]}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as 'expense' | 'income')}
        />
        {loading ? (
          <div className="categories-list">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="category-row skeleton-row">
                <div className="category-row-content">
                  <div className="category-dot skeleton-dot" />
                  <div className="category-name skeleton-text" />
                </div>
                <div className="category-actions skeleton-actions" />
              </div>
            ))}
          </div>
        ) : displayedCategories.length === 0 ? (
          <EmptyState
            icon="📁"
            title={`No ${activeTab} categories yet`}
            description={`Create your first ${activeTab} category to organize transactions`}
            action={{
              label: 'Add Category',
              onClick: () => {
                setFormData({ name: '', type: activeTab });
                setShowModal(true);
              },
            }}
          />
        ) : (
          <div className="categories-list">
            {displayedCategories.map((cat) => (
              <div key={cat.id} className="category-row">
                <div className="category-row-content">
                  <div className="category-dot" />
                  <span className="category-name">{cat.name}</span>
                </div>
                <div className="category-actions">
                  <div className="actions-desktop">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingCategoryId(cat.id);
                        setFormData({ name: cat.name, type: cat.type });
                        setShowModal(true);
                      }}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteClick(cat.id)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="actions-mobile">
                    <button
                      className="action-btn action-btn-kebab"
                      onClick={() =>
                        setOpenMenuId(openMenuId === cat.id ? null : cat.id)
                      }
                      title="More actions"
                    >
                      ⋮
                    </button>
                    {openMenuId === cat.id && (
                      <div className="kebab-menu">
                        <button
                          className="kebab-menu-item"
                          onClick={() => {
                            setEditingCategoryId(cat.id);
                            setFormData({ name: cat.name, type: cat.type });
                            setShowModal(true);
                            setOpenMenuId(null);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="kebab-menu-item kebab-menu-item-danger"
                          onClick={() => {
                            handleDeleteClick(cat.id);
                            setOpenMenuId(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({ name: '', type: 'expense' });
          setEditingCategoryId(null);
        }}
        title={editingCategoryId ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setFormData({ name: '', type: 'expense' });
                setEditingCategoryId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="category-form">
              {editingCategoryId ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Groceries"
            />
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
              required
              disabled={!!editingCategoryId}
            />
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
