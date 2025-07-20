import React from 'react';
import { useTranslation } from 'react-i18next';
import { GENRE_OPTIONS } from '../../utils/formConstants';
import { useTypography } from '../../utils/typography';
import ErrorMessage from './ErrorMessage';

interface GenreSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  label?: string;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({
  value,
  onChange,
  error,
  required = false,
  className = '',
  label
}) => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const currentLanguage = i18n.language as 'en' | 'th';

  const defaultLabel = currentLanguage === 'th' ? 'แนวภาพยนตร์' : 'Genre';
  const selectPlaceholder = currentLanguage === 'th' ? 'เลือกแนวภาพยนตร์' : 'Select Genre';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={className}>
      <label className={`block text-white/90 ${getClass('body')} mb-2`}>
        {label || defaultLabel} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={value}
        onChange={handleChange}
        className={`w-full p-3 rounded-lg bg-white/10 border ${
          error ? 'border-red-400 error-field' : 'border-white/20'
        } text-white focus:border-[#FCB283] focus:outline-none`}
      >
        <option value="" className="bg-[#110D16]">
          {selectPlaceholder}
        </option>
        {GENRE_OPTIONS.map(option => (
          <option key={option.value} value={option.value} className="bg-[#110D16]">
            {option.label[currentLanguage]}
          </option>
        ))}
      </select>
      <ErrorMessage error={error} />
    </div>
  );
};

export default GenreSelector;
