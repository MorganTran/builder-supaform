
import { type ReactNode, type FC } from 'react';

// Define the available positions for strict TypeScript typing
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  text: string;
  position?: TooltipPosition;
  children: ReactNode; // The button or element triggering the tooltip
}

const Tooltip: FC<TooltipProps> = ({ 
  text, 
  position = 'top', // Default position is top
  children 
}) => {
  return (
    <div className="tooltip-container">
      {children}
      <span className={`tooltip-box tooltip-${position}`}>
        {text}
      </span>
    </div>
  );
};

export default Tooltip;