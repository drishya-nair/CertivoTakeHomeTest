import Icon from "./Icon";

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 20, 
  text, 
  className = "" 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Icon name="loading" size={size} className="animate-spin mr-2" />
      {text && <span>{text}</span>}
    </div>
  );
}
