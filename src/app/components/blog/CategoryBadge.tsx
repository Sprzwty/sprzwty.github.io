import { Badge } from '../ui/badge';
import { colorForCategory } from '../../lib/categoryColor';
import type { Category } from '../../data/posts';

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const color = colorForCategory(category);
  return (
    <Badge variant="outline" style={{ color, borderColor: color }}>
      {category}
    </Badge>
  );
}
