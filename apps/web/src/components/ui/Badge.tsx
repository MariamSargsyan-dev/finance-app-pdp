import './Badge.scss';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'info' | 'warning';
  children: React.ReactNode;
}

export function Badge({ variant = 'info', children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
