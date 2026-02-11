import './ProgressBar.scss';

interface ProgressBarProps {
  value: number;
  max: number;
  variant?: 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max,
  variant = 'success',
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const displayVariant =
    percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : variant;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className={`progress-bar-fill ${displayVariant}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-text">{percentage.toFixed(0)}%</span>
      )}
    </div>
  );
}
