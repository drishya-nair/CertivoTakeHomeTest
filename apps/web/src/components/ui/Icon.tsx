import { forwardRef } from "react";
import { 
  Search, 
  Loader2, 
  AlertTriangle, 
  Lock, 
  ArrowLeft, 
  Info, 
  Sun, 
  Moon,
  RefreshCw
} from "lucide-react";

// Icon name type for better type safety
type IconName = "search" | "back" | "warning" | "info" | "sun" | "moon" | "lock" | "loading" | "refresh";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

// Icon mapping to lucide-react components
const iconMap = {
  search: Search,
  back: ArrowLeft,
  warning: AlertTriangle,
  info: Info,
  sun: Sun,
  moon: Moon,
  lock: Lock,
  loading: Loader2,
  refresh: RefreshCw,
} as const;

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 16, className = "" }, ref) => {
    const IconComponent = iconMap[name];
    
    if (!IconComponent) return null;

    return (
      <IconComponent
        ref={ref}
        size={size}
        className={className}
      />
    );
  }
);

Icon.displayName = "Icon";

export default Icon;