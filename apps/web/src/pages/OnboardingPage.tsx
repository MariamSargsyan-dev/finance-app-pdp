import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { Button } from '@/components/ui';
import './OnboardingPage.scss';

type PackKey = 'personal' | 'family' | 'freelancer' | 'student' | 'empty';

interface PackPreview {
  key: string;
  label: string;
  description: string;
  accountsPreview: { name: string; type: string }[];
  categoriesPreview: string[];
}

const FALLBACK_PACKS: PackPreview[] = [
  {
    key: 'personal',
    label: 'Personal (Simple)',
    description: 'Basic accounts and categories for personal finance.',
    accountsPreview: [
      { name: 'Cash', type: 'cash' },
      { name: 'Main Bank', type: 'bank' },
      { name: 'Credit Card', type: 'card' },
    ],
    categoriesPreview: ['Groceries', 'Transport', 'Utilities', 'Dining', 'Shopping'],
  },
  {
    key: 'family',
    label: 'Family',
    description: 'Accounts and categories for family budgeting.',
    accountsPreview: [
      { name: 'Household Cash', type: 'cash' },
      { name: 'Joint Account', type: 'bank' },
      { name: 'Savings', type: 'bank' },
    ],
    categoriesPreview: ['Groceries', 'Kids', 'Housing', 'Healthcare', 'Entertainment'],
  },
  {
    key: 'freelancer',
    label: 'Freelancer',
    description: 'For freelancers tracking business and personal.',
    accountsPreview: [
      { name: 'Business Account', type: 'bank' },
      { name: 'Personal Account', type: 'bank' },
      { name: 'Business Card', type: 'card' },
    ],
    categoriesPreview: ['Software & Tools', 'Office', 'Marketing', 'Tax & Legal'],
  },
  {
    key: 'student',
    label: 'Student',
    description: 'Simple setup for students.',
    accountsPreview: [
      { name: 'Cash', type: 'cash' },
      { name: 'Bank Account', type: 'bank' },
    ],
    categoriesPreview: ['Food', 'Transport', 'Books & Supplies', 'Entertainment'],
  },
  {
    key: 'empty',
    label: 'Start empty',
    description: 'No pre-configured data. Set up everything yourself.',
    accountsPreview: [],
    categoriesPreview: [],
  },
];

const PACK_ICONS: Record<string, string> = {
  personal: '👤',
  family: '👨‍👩‍👧‍👦',
  freelancer: '💼',
  student: '🎓',
  empty: '📋',
};

export function OnboardingPage() {
  const [packs, setPacks] = useState<PackPreview[]>([]);
  const [selectedKey, setSelectedKey] = useState<PackKey>('personal');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getStarterPacks();
        const list = data.packs || [];
        setPacks(list.length > 0 ? list : FALLBACK_PACKS);
        if (list.length > 0 && !list.find((p: PackPreview) => p.key === selectedKey)) {
          setSelectedKey((list[0]?.key as PackKey) || 'personal');
        } else if (list.length === 0) {
          setPacks(FALLBACK_PACKS);
        }
      } catch {
        setPacks(FALLBACK_PACKS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.applyStarterPack(selectedKey);
      showToast('Workspace set up successfully', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to apply pack', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleSkip = async () => {
    setApplying(true);
    try {
      await api.applyStarterPack('empty');
      showToast('You can set up later from settings', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to skip', 'error');
    } finally {
      setApplying(false);
    }
  };

  const displayPacks = packs.length > 0 ? packs : FALLBACK_PACKS;

  if (loading) {
    return (
      <div className="onboarding-loading">
        <span className="animate-pulse">Loading starter packs...</span>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <h1 className="onboarding-title">Set up your workspace</h1>
        <p className="onboarding-subtitle">
          Choose a starter pack to pre-fill accounts and categories, or start empty.
        </p>

        <div className="pack-grid">
          {displayPacks.map((pack) => (
            <button
              key={pack.key}
              type="button"
              onClick={() => setSelectedKey(pack.key as PackKey)}
              className={`pack-card ${selectedKey === pack.key ? 'selected' : ''}`}
            >
              <div className={`pack-icon ${pack.key}`}>
                {PACK_ICONS[pack.key] || '📦'}
              </div>
              <div className="pack-body">
                <div className="pack-label">{pack.label}</div>
                <div className="pack-description">{pack.description}</div>
                {(pack.accountsPreview?.length > 0 || pack.categoriesPreview?.length > 0) && (
                  <div className="pack-tags">
                    {pack.accountsPreview?.map((a) => (
                      <span key={a.name} className="pack-tag">
                        {a.name}
                      </span>
                    ))}
                    {pack.categoriesPreview?.slice(0, 4).map((c) => (
                      <span key={c} className="pack-tag">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="pack-check">
                {selectedKey === pack.key ? '✓' : ''}
              </div>
            </button>
          ))}
        </div>

        <div className="onboarding-actions">
          <Button
            variant="primary"
            onClick={handleApply}
            disabled={applying}
            className="btn-primary"
          >
            {applying ? 'Applying...' : 'Apply pack and continue'}
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={applying}
            className="onboarding-skip"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
