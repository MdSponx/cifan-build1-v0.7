import React from 'react';
import { useTypography } from '../../utils/typography';

interface FormSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon,
  children,
  className = ''
}) => {
  const { getClass } = useTypography();

  return (
    <div className={`glass-container rounded-xl sm:rounded-2xl p-6 sm:p-8 ${className}`}>
      <h3 className={`text-lg sm:text-xl ${getClass('subtitle')} text-white mb-6`}>
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  );
};

export default FormSection;
