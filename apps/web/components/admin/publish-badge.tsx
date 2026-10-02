import type { PublishStatus } from '@hikeup/types';
import { Badge } from '@/components/ui/badge';

export function PublishBadge({ status }: { status: PublishStatus }) {
  return <Badge variant={status === 'PUBLISHED' ? 'success' : 'neutral'}>{status === 'PUBLISHED' ? 'Published' : 'Draft'}</Badge>;
}
