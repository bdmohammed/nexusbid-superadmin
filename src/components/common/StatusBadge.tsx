import { cn } from '@/lib/tailwind/utils';

export interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase();

  const getStyle = (s: string) => {
    switch (s) {
      case 'active':
      case 'published':
      case 'open':
      case 'approved':
      case 'clean':
      case 'qualified':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30';
      case 'draft':
      case 'unpublished':
      case 'pending':
      case 'in_preparation':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30';
      case 'submitted':
      case 'under_review':
      case 'review_assigned':
      case 'under_evaluation':
      case 'in_bidding':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30';
      case 'scheduled':
      case 'not_open':
      case 'pre_bidding':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30';
      case 'awarded':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30';
      case 'closed':
      case 'archived':
      case 'retracted':
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/30';
      case 'rejected':
      case 'failed':
      case 'cancelled':
      case 'disqualified':
      case 'infected':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
        getStyle(normalized),
      )}
    >
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
