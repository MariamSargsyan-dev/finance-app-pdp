import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, Button, EmptyState, Badge } from '../components/ui';
import './DashboardPage.scss';

interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
}

function getPreviousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

interface DailyCashflow {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
}

export function DashboardPage() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [prevSummary, setPrevSummary] = useState<MonthlySummary | null>(null);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<DailyCashflow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    setLoading(true);
    const year = parseInt(currentMonth.substring(0, 4));
    const month = parseInt(currentMonth.substring(5, 7));
    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month, 0, 23, 59, 59);
    const prevMonth = getPreviousMonth(currentMonth);

    try {
      const summaryData = await api.getMonthlySummary(currentMonth);
      if (summaryData) {
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Failed to load summary', error);
    }

    try {
      const topCategoriesData = await api.getTopCategories(currentMonth, 5);
      const categoriesArray = Array.isArray(topCategoriesData) ? topCategoriesData : [];
      setTopCategories(categoriesArray);
    } catch (error) {
      console.error('Failed to load top categories', error);
      setTopCategories([]);
    }

    try {
      const transactionsData = await api.getTransactions({
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
      });
      const transactionsArray = Array.isArray(transactionsData) ? transactionsData : [];
      const sortedTransactions = [...transactionsArray].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentTransactions(sortedTransactions.slice(0, 10));
    } catch (error) {
      console.error('Failed to load transactions', error);
      setRecentTransactions([]);
    }

    try {
      const cashflowData = await api.getCashflow(
        fromDate.toISOString().split('T')[0],
        toDate.toISOString().split('T')[0],
      );
      const cashflowArray = Array.isArray(cashflowData) ? cashflowData : [];
      setCashflow(cashflowArray);
    } catch (error) {
      console.error('Failed to load cashflow', error);
      setCashflow([]);
    }

    try {
      const allCategoriesData = await api.getCategories();
      const allCategoriesArray = Array.isArray(allCategoriesData) ? allCategoriesData : [];
      setCategories(allCategoriesArray);
    } catch (error) {
      console.error('Failed to load categories', error);
      setCategories([]);
    }

    try {
      const prevSummaryData = await api.getMonthlySummary(prevMonth);
      if (prevSummaryData) {
        setPrevSummary(prevSummaryData);
      }
    } catch {
      setPrevSummary({
        month: prevMonth,
        totalIncome: 0,
        totalExpense: 0,
        netCashflow: 0,
      });
    }

    setLoading(false);
  };

  const trendPercent = (
    current: number,
    previous: number,
  ): number | null => {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return current > 0 ? 100 : -100;
    return ((current - previous) / previous) * 100;
  };
  const netTrendPercent = (): number | null => {
    if (!summary || !prevSummary || prevSummary.netCashflow === 0) return null;
    return (
      ((summary.netCashflow - prevSummary.netCashflow) /
        Math.abs(prevSummary.netCashflow)) *
      100
    );
  };
  const formatTrend = (value: number | null): string => {
    if (value === null) return '—';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(0)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return '-';
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || '-';
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="month-selector"
          />
        </div>
        <div className="summary-grid">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="skeleton" style={{ height: '80px' }} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <input
          type="month"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="month-selector"
        />
      </div>

      {summary && (
        <div className="summary-grid">
          <Card>
            <div className="summary-card-content">
              <div className="summary-label">Total Income</div>
              <div className="summary-amount income">
                {formatCurrency(summary.totalIncome)}
              </div>
              <div className="summary-trend positive">
                {(() => {
                  const pct = trendPercent(
                    summary.totalIncome,
                    prevSummary?.totalIncome ?? 0,
                  );
                  if (pct === null) return '—';
                  return (
                    <>
                      {pct >= 0 ? '↑' : '↓'} {formatTrend(pct)}
                    </>
                  );
                })()}
              </div>
            </div>
          </Card>
          <Card>
            <div className="summary-card-content">
              <div className="summary-label">Total Expense</div>
              <div className="summary-amount expense">
                {formatCurrency(summary.totalExpense)}
              </div>
              <div className="summary-trend negative">
                {(() => {
                  const pct = trendPercent(
                    summary.totalExpense,
                    prevSummary?.totalExpense ?? 0,
                  );
                  if (pct === null) return '—';
                  return (
                    <>
                      {pct >= 0 ? '↑' : '↓'} {formatTrend(pct)}
                    </>
                  );
                })()}
              </div>
            </div>
          </Card>
          <Card>
            <div className="summary-card-content">
              <div className="summary-label">Net Cashflow</div>
              <div
                className={`summary-amount ${
                  summary.netCashflow >= 0 ? 'positive' : 'negative'
                }`}
              >
                {formatCurrency(summary.netCashflow)}
              </div>
              <div
                className={`summary-trend ${
                  summary.netCashflow >= 0 ? 'positive' : 'negative'
                }`}
              >
                {(() => {
                  const pct = netTrendPercent();
                  if (pct === null) return '—';
                  return (
                    <>
                      {pct >= 0 ? '↑' : '↓'} {formatTrend(pct)}
                    </>
                  );
                })()}
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="dashboard-grid">
        <Card title="Spend by Category">
          {!summary || summary.totalExpense === 0 || topCategories.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No expenses this month"
              description="Start tracking your expenses to see category breakdowns"
            />
          ) : (
            <div className="category-list">
              {topCategories.map((cat) => {
                const percentage = summary
                  ? (cat.totalAmount / summary.totalExpense) * 100
                  : 0;
                return (
                  <div key={cat.categoryId} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{cat.categoryName}</span>
                      <span className="category-amount">
                        {formatCurrency(cat.totalAmount)}
                      </span>
                    </div>
                    <div className="category-bar">
                      <div
                        className="category-bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Cashflow">
          {cashflow.length === 0 ? (
            <EmptyState
              icon="📈"
              title="No cashflow data"
              description="Add transactions to see daily cashflow trends"
            />
          ) : (
            <div className="cashflow-chart">
              <div className="cashflow-bars">
                {cashflow.map((day) => {
                  const maxAmount = Math.max(
                    ...cashflow.map((d) => Math.max(Math.abs(d.totalIncome), Math.abs(d.totalExpense), Math.abs(d.netCashflow))),
                  );
                  const incomeHeight = maxAmount > 0 ? (day.totalIncome / maxAmount) * 100 : 0;
                  const expenseHeight = maxAmount > 0 ? (day.totalExpense / maxAmount) * 100 : 0;
                  const netHeight = maxAmount > 0 ? (Math.abs(day.netCashflow) / maxAmount) * 100 : 0;
                  const date = new Date(day.date);
                  const dayLabel = date.getDate();
                  
                  return (
                    <div key={day.date} className="cashflow-day">
                      <div className="cashflow-bars-container">
                        {day.totalIncome > 0 && (
                          <div
                            className="cashflow-bar income"
                            style={{ height: `${incomeHeight}%` }}
                            title={`Income: ${formatCurrency(day.totalIncome)}`}
                          />
                        )}
                        {day.totalExpense > 0 && (
                          <div
                            className="cashflow-bar expense"
                            style={{ height: `${expenseHeight}%` }}
                            title={`Expense: ${formatCurrency(day.totalExpense)}`}
                          />
                        )}
                        {day.netCashflow !== 0 && (
                          <div
                            className={`cashflow-bar net ${day.netCashflow >= 0 ? 'positive' : 'negative'}`}
                            style={{ height: `${netHeight}%` }}
                            title={`Net: ${formatCurrency(day.netCashflow)}`}
                          />
                        )}
                      </div>
                      <div className="cashflow-day-label">{dayLabel}</div>
                    </div>
                  );
                })}
              </div>
              <div className="cashflow-legend">
                <div className="legend-item">
                  <div className="legend-color income" />
                  <span>Income</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color expense" />
                  <span>Expense</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color net positive" />
                  <span>Net</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card
        title="Recent Transactions"
        actions={
          <Button variant="ghost" onClick={() => navigate('/transactions')}>
            View all
          </Button>
        }
      >
        {recentTransactions.length === 0 ? (
          <EmptyState
            icon="💸"
            title="No transactions yet"
            description="Add your first transaction to get started"
            action={{
              label: 'Add Transaction',
              onClick: () => navigate('/transactions'),
            }}
          />
        ) : (
          <div className="transactions-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{new Date(txn.date).toLocaleDateString()}</td>
                    <td>
                      <Badge
                        variant={
                          txn.type === 'income'
                            ? 'success'
                            : txn.type === 'expense'
                              ? 'danger'
                              : 'info'
                        }
                      >
                        {txn.type}
                      </Badge>
                    </td>
                    <td>
                      {txn.type === 'transfer' 
                        ? 'Transfer' 
                        : getCategoryName(txn.categoryId)}
                    </td>
                    <td className={txn.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                      {txn.type === 'income' ? '+' : '-'}
                      {formatCurrency(txn.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
