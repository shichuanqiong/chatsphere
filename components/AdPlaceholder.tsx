
import React from 'react';

interface AdPlaceholderProps {
  title: string;
  width: string;
  height: string;
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ title, width, height }) => {
  return (
    <div className={`flex items-center justify-center bg-accent/30 border-2 border-dashed border-accent rounded-lg ${width} ${height}`}>
      <div className="text-center text-text-secondary">
        <p className="font-semibold">{title}</p>
        <p className="text-sm">(Google Ad Slot)</p>
      </div>
    </div>
  );
};

export default AdPlaceholder;
