import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const tooltipOffset = 8; // Space between trigger and tooltip
      
      let style: React.CSSProperties = {};
      
      switch (position) {
        case 'top':
          style = {
            left: rect.left + rect.width / 2,
            top: rect.top - tooltipOffset,
            transform: 'translate(-50%, -100%)',
          };
          break;
        case 'bottom':
          style = {
            left: rect.left + rect.width / 2,
            top: rect.bottom + tooltipOffset,
            transform: 'translate(-50%, 0)',
          };
          break;
        case 'left':
          style = {
            left: rect.left - tooltipOffset,
            top: rect.top + rect.height / 2,
            transform: 'translate(-100%, -50%)',
          };
          break;
        case 'right':
          style = {
            left: rect.right + tooltipOffset,
            top: rect.top + rect.height / 2,
            transform: 'translate(0, -50%)',
          };
          break;
      }
      
      setTooltipStyle(style);
    }
  }, [isVisible, position]);

  return (
    <div className="tooltip-container" ref={containerRef}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={`tooltip tooltip-${position}`} style={tooltipStyle}>
          <div className="tooltip-content">
            {content}
          </div>
          <div className={`tooltip-arrow tooltip-arrow-${position}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;