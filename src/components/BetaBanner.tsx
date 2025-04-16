import React from 'react';

interface BetaBannerProps {
  className?: string;
}

const BetaBanner: React.FC<BetaBannerProps> = ({ className }) => {
  return (
    <div className={`fixed top-5 left-[-35px] w-[140px] bg-pink-600 text-white py-1 text-center font-bold z-50 shadow-md transform -rotate-45 ${className}`}>
      BETA
    </div>
  );
};

export default BetaBanner; 