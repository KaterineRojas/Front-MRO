import { Badge } from '../../../ui/badge';

interface StatusBadgeProps {
  status: 'match' | 'discrepancy';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'match') {
    return <Badge variant="default" className="bg-green-600">Match</Badge>;
  } else {
    return <Badge variant="destructive">Discrepancy</Badge>;
  }
}
