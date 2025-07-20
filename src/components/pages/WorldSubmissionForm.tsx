import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTypography } from '../../utils/typography';
import { validateEmail, validateAge, validateDuration, getValidationMessages } from '../../utils/formValidation';
import { WorldFormData, FormErrors } from '../../types/form.types';
import AnimatedButton from '../ui/AnimatedButton';
import NationalitySelector from '../ui/NationalitySelector';
import GenreSelector from '../forms/GenreSelector';
import AgreementCheckboxes from '../forms/AgreementCheckboxes';
import FormSection from '../forms/FormSection';
import ErrorMessage from '../forms/ErrorMessage';
import FileUploader from '../forms/FileUploader';

const WorldSubmissionForm = () => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const currentLanguage = i18n.language as 'en' | 'th';
  const validationMessages = getValidationMessages(currentLanguage);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isThaiNationality, setIsThaiNationality] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<WorldFormData>({
    // Film Information
    filmTitle: '',
    filmTitleTh: '',
    genres: [],
    duration: '',
    synopsis: '',
    chiangmaiConnection: '',
    
    // Director Information
    directorName: '',
    directorAge: '',
    directorPhone: '',
    directorEmail: '',
    occupation: '',
    
    // Team Information
    teamMembers: '',
    
    // Files
    filmFile: null,
    posterFile: null,
    proofFile: null,
    
    // Agreements
    agreement1: false,
    agreement2: false,
    agreement3: false,
    agreement4: false
  });

  const content = {
    th: {
      pageTitle: "ส่งผลงานเข้าประกวด - รางวัลหนังสั้นแฟนตาสติกโลก",
      categoryTitle: "World Fantastic Short Film Award",
      prizeAmount: "460,000 บาท",
      
      // Sections
      filmInfoTitle: "ข้อมูลภาพยนตร์",
      directorInfoTitle: "ข้อมูลผู้กำกับ",
      teamInfoTitle: "ข้อมูลทีมงาน",
      filesTitle: "ไฟล์ที่ต้องส่ง",
      
      // Form fields
      filmTitle: "ชื่อภาพยนตร์ (ภาษาอังกฤษ)",
      filmTitleTh: "ชื่อภาพยนตร์ (ภาษาไทย)",
      duration: "ความยาว (นาที)",
      synopsis: "เรื่องย่อ (ไม่เกิน 200 คำ)",
      chiangmaiConnection: "ความเกี่ยวข้องกับเชียงใหม่",
      
      directorName: "ชื่อ-นามสกุล ผู้กำกับ",
      age: "อายุ",
      phone: "เบอร์โทรศัพท์",
      email: "อีเมล",
      occupation: "อาชีพ",
      
      teamMembers: "รายชื่อทีมงาน",
      teamMembersPlaceholder: "ระบุรายชื่อและบทบาทของทีมงาน (ไม่บังคับ)",
      
      filmFile: "ไฟล์ภาพยนตร์ (MP4, MOV)",
      posterFile: "โปสเตอร์ภาพยนตร์ (JPG, PNG)",
      proofFile: "หลักฐานบัตรประชาชน/พาสปอร์ต",
      
      submitButton: "ส่งผลงานเข้าประกวด",
      submitting: "กำลังส่งผลงาน...",
      successMessage: "ส่งผลงานเรียบร้อยแล้ว!"
    },
    en: {
      pageTitle: "Submit Your Film - World Fantastic Short Film Award",
      categoryTitle: "World Fantastic Short Film Award",
      prizeAmount: "460,000 THB",
      
      // Sections
      filmInfoTitle: "Film Information",
      directorInfoTitle: "Director Information",
      teamInfoTitle: "Team Information",
      filesTitle: "Required Files",
      
      // Form fields
      filmTitle: "Film Title (English)",
      filmTitleTh: "Film Title (Thai)",
      duration: "Duration (minutes)",
      synopsis: "Synopsis (max 200 words)",
      chiangmaiConnection: "Connection to Chiang Mai",
      
      directorName: "Director Full Name",
      age: "Age",
      phone: "Phone Number",
      email: "Email",
      occupation: "Occupation",
      
      teamMembers: "Team Members",
      teamMembersPlaceholder: "List team members and their roles (optional)",
      
      filmFile: "Film File (MP4, MOV)",
      posterFile: "Film Poster (JPG, PNG)",
      proofFile: "ID Card/Passport",
      
      submitButton: "Submit Your Film",
      submitting: "Submitting...",
      successMessage: "Submission successful!"
    }
  };

  const currentContent = content[currentLanguage];

  const validateMainForm = (): FormErrors => {
    const errors: FormErrors = {};

    // Film Information
    if (!formData.filmTitle.trim()) errors.filmTitle = validationMessages.required;
    if (isThaiNationality && !formData.filmTitleTh?.trim()) errors.filmTitleTh = validationMessages.required;
    if (!formData.genres || formData.genres.length === 0) errors.genres = validationMessages.required;
    if (!formData.duration) {
      errors.duration = validationMessages.required;
    } else {
      const duration = parseInt(formData.duration);
      if (!validateDuration(duration)) errors.duration = validationMessages.invalidDuration;
    }
    if (!formData.synopsis.trim()) errors.synopsis = validationMessages.required;
    if (!formData.chiangmaiConnection.trim()) errors.chiangmaiConnection = validationMessages.required;

    // Director Information
    if (!formData.directorName.trim()) errors.directorName = validationMessages.required;
    if (!formData.directorAge) {
      errors.directorAge = validationMessages.required;
    } else {
      const age = parseInt(formData.directorAge);
      if (!validateAge(age, 'WORLD')) errors.directorAge = validationMessages.invalidAge('WORLD');
    }
    if (!formData.directorPhone.trim()) errors.directorPhone = validationMessages.required;
    if (!formData.directorEmail.trim()) {
      errors.directorEmail = validationMessages.required;
    } else if (!validateEmail(formData.directorEmail)) {
      errors.directorEmail = validationMessages.invalidEmail;
    }

    // Files
    if (!formData.filmFile) errors.filmFile = validationMessages.required;
    if (!formData.posterFile) errors.posterFile = validationMessages.required;
    if (!formData.proofFile) errors.proofFile = validationMessages.required;

    // Agreements
    if (!formData.agreement1 || !formData.agreement2 || !formData.agreement3 || !formData.agreement4) {
      errors.agreements = validationMessages.allAgreementsRequired;
    }

    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGenreChange = (genres: string[]) => {
    setFormData(prev => ({ ...prev, genres }));
    if (formErrors.genres) {
      setFormErrors(prev => ({ ...prev, genres: '' }));
    }
  };

  const handleAgreementChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (formErrors.agreements) {
      setFormErrors(prev => ({ ...prev, agreements: '' }));
    }
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [name]: file }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle nationality change from NationalitySelector
  const handleNationalityChange = useCallback((nationality: string) => {
    // World form doesn't store nationality in formData, but we track it for Thai fields
  }, []);

  // Handle nationality type change from NationalitySelector
  const handleNationalityTypeChange = useCallback((isThaiNationality: boolean) => {
    setIsThaiNationality(isThaiNationality);
    
    // Clear Thai-specific fields when switching to International
    if (!isThaiNationality) {
      setFormData(prev => ({
        ...prev,
        filmTitleTh: ''
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateMainForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to first error
      const firstErrorElement = document.querySelector('.error-field');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Firestore
      await addDoc(collection(db, 'submissions'), {
        category: 'world',
        filmTitle: formData.filmTitle,
        filmTitleTh: isThaiNationality ? formData.filmTitleTh : null,
        genres: formData.genres,
        duration: parseInt(formData.duration),
        synopsis: formData.synopsis,
        chiangmaiConnection: formData.chiangmaiConnection,
        directorName: formData.directorName,
        directorAge: parseInt(formData.directorAge),
        directorPhone: formData.directorPhone,
        directorEmail: formData.directorEmail,
        occupation: formData.occupation || null,
        teamMembers: formData.teamMembers || null,
        agreements: {
          copyright: formData.agreement1,
          terms: formData.agreement2,
          promotional: formData.agreement3,
          finalDecision: formData.agreement4
        },
        submittedAt: serverTimestamp(),
        status: 'submitted'
      });

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(currentLanguage === 'th' 
        ? 'เกิดข้อผิดพลาดในการส่งผลงาน กรุณาลองใหม่อีกครั้ง' 
        : 'An error occurred while submitting. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#110D16] text-white pt-16 sm:pt-20 flex items-center justify-center">
        <div className="glass-container rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-4">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className={`text-2xl sm:text-3xl ${getClass('header')} mb-4 text-white`}>
            {currentContent.successMessage}
          </h2>
          <p className={`text-white/80 ${getClass('body')} mb-6`}>
            {currentLanguage === 'th' 
              ? 'ทางเทศกาลจะแจ้งผลการคัดเลือกภายใน 30 วัน ขอบคุณที่ส่งผลงานเข้าร่วม CIFAN 2025'
              : 'The festival will announce the selection results within 30 days. Thank you for submitting to CIFAN 2025'
            }
          </p>
          <AnimatedButton 
            variant="primary" 
            size="medium" 
            icon="🏠"
            onClick={() => window.location.hash = '#home'}
          >
            {currentLanguage === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
          </AnimatedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#110D16] text-white pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/cifan-c41c6.firebasestorage.app/o/site_files%2Ffest_logos%2FGroup%204.png?alt=media&token=84ad0256-2322-4999-8e9f-d2f30c7afa67"
              alt="World Competition Logo"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl ${getClass('header')} mb-4 text-white`}>
            {currentContent.pageTitle}
          </h1>
          <p className={`text-lg sm:text-xl ${getClass('subtitle')} text-[#FCB283] mb-4`}>
            {currentContent.categoryTitle}
          </p>
          <p className={`text-xl sm:text-2xl ${getClass('subtitle')} text-[#FCB283] font-bold`}>
            {currentLanguage === 'th' ? 'รางวัลรวม: ' : 'Total Prize: '}{currentContent.prizeAmount}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Nationality Selector */}
          <NationalitySelector
            onNationalityChange={handleNationalityChange}
            onNationalityTypeChange={handleNationalityTypeChange}
          />

          {/* Section 2: Film Information */}
          <FormSection title={currentContent.filmInfoTitle} icon="🎬">
            <div className="space-y-6">
              {/* Film Title Thai - Only for Thai nationality */}
              {isThaiNationality && (
                <div>
                  <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                    {currentContent.filmTitleTh} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="filmTitleTh"
                    value={formData.filmTitleTh || ''}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.filmTitleTh ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                  />
                  <ErrorMessage error={formErrors.filmTitleTh} />
                </div>
              )}
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.filmTitle} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="filmTitle"
                  value={formData.filmTitle}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.filmTitle ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.filmTitle} />
              </div>
              
              {/* Genre Selector - Full Width */}
              <GenreSelector
                value={formData.genres}
                onChange={handleGenreChange}
                error={formErrors.genres}
                required
              />
              
              {/* Duration Field - Separate Row */}
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.duration} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="5"
                  max="10"
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.duration ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <small className="text-white/60 text-xs mt-1 block">
                  {currentLanguage === 'th' ? 'ระหว่าง 5-10 นาที' : 'Between 5-10 minutes'}
                </small>
                <ErrorMessage error={formErrors.duration} />
              </div>
            
              {/* Synopsis Field */}
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.synopsis} <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="synopsis"
                  value={formData.synopsis}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.synopsis ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none resize-vertical`}
                />
                <ErrorMessage error={formErrors.synopsis} />
              </div>
            
              {/* Chiang Mai Connection Field */}
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.chiangmaiConnection} <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="chiangmaiConnection"
                  value={formData.chiangmaiConnection}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.chiangmaiConnection ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none resize-vertical`}
                />
                <ErrorMessage error={formErrors.chiangmaiConnection} />
              </div>
            </div>
          </FormSection>

          {/* Section 3: Director Information */}
          <FormSection title={currentContent.directorInfoTitle} icon="👤">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.directorName} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="directorName"
                  value={formData.directorName}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.directorName ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.directorName} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.age} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="directorAge"
                  value={formData.directorAge}
                  onChange={handleInputChange}
                  min="18"
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.directorAge ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.directorAge} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.phone} <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="directorPhone"
                  value={formData.directorPhone}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.directorPhone ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.directorPhone} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.email} <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="directorEmail"
                  value={formData.directorEmail}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.directorEmail ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.directorEmail} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.occupation}
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation || ''}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.occupation ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.occupation} />
              </div>
            </div>
          </FormSection>

          {/* Section 4: Team Information */}
          <FormSection title={currentContent.teamInfoTitle} icon="👥">
            <div>
              <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                {currentContent.teamMembers}
              </label>
              <textarea
                name="teamMembers"
                value={formData.teamMembers || ''}
                onChange={handleInputChange}
                rows={4}
                placeholder={currentContent.teamMembersPlaceholder}
                className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.teamMembers ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none resize-vertical`}
              />
              <ErrorMessage error={formErrors.teamMembers} />
            </div>
          </FormSection>

          {/* Section 5: File Uploads */}
          <FormSection title={currentContent.filesTitle} icon="📁">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploader
                name="filmFile"
                label={currentContent.filmFile}
                accept="video/*"
                fileType="VIDEO"
                required
                onFileChange={(file) => handleFileChange('filmFile', file)}
                error={formErrors.filmFile}
                currentFile={formData.filmFile}
              />
              
              <FileUploader
                name="posterFile"
                label={currentContent.posterFile}
                accept="image/*"
                fileType="IMAGE"
                required
                onFileChange={(file) => handleFileChange('posterFile', file)}
                error={formErrors.posterFile}
                currentFile={formData.posterFile}
              />
              
              <div className="md:col-span-2">
                <FileUploader
                  name="proofFile"
                  label={currentContent.proofFile}
                  accept="image/*,.pdf"
                  fileType="DOCUMENT"
                  required
                  onFileChange={(file) => handleFileChange('proofFile', file)}
                  error={formErrors.proofFile}
                  currentFile={formData.proofFile}
                />
              </div>
            </div>
          </FormSection>

          {/* Section 6: Agreements */}
          <AgreementCheckboxes
            agreements={{
              agreement1: formData.agreement1,
              agreement2: formData.agreement2,
              agreement3: formData.agreement3,
              agreement4: formData.agreement4
            }}
            onChange={handleAgreementChange}
            error={formErrors.agreements}
          />

          {/* Submit Button */}
          <div className="text-center pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#AA4626] to-[#FCB283] text-white rounded-lg hover:from-[#FCB283] hover:to-[#AA4626] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${getClass('menu')} flex items-center justify-center gap-2`}
            >
              <span>🎬</span>
              {isSubmitting ? currentContent.submitting : currentContent.submitButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorldSubmissionForm;