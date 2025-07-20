import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTypography } from '../../utils/typography';
import { validateEmail, validateAge, validateDuration, getValidationMessages } from '../../utils/formValidation';
import { YouthFormData, CrewMember, FormErrors } from '../../types/form.types';
import AnimatedButton from '../ui/AnimatedButton';
import NationalitySelector from '../ui/NationalitySelector';
import GenreSelector from '../forms/GenreSelector';
import CrewManagement from '../forms/CrewManagement';
import AgreementCheckboxes from '../forms/AgreementCheckboxes';
import FormSection from '../forms/FormSection';
import ErrorMessage from '../forms/ErrorMessage';
import FileUploader from '../forms/FileUploader';

const YouthSubmissionForm = () => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const currentLanguage = i18n.language as 'en' | 'th';
  const validationMessages = getValidationMessages(currentLanguage);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isThaiNationality, setIsThaiNationality] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<YouthFormData>({
    nationality: 'Thailand',
    
    // Film Information
    filmTitle: '',
    filmTitleTh: '',
    genres: [],
    duration: '',
    synopsis: '',
    chiangmaiConnection: '',
    
    // Submitter Information
    submitterName: '',
    submitterNameTh: '',
    submitterAge: '',
    submitterPhone: '',
    submitterEmail: '',
    submitterRole: '',
    submitterCustomRole: '',
    schoolName: '',
    studentId: '',
    
    // Crew Information
    crewMembers: [],
    
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
      pageTitle: "ส่งผลงานเข้าประกวด - รางวัลหนังสั้นแฟนตาสติกเยาวชน",
      categoryTitle: "Youth Fantastic Short Film Award",
      prizeAmount: "160,000 บาท",
      
      // Sections
      filmInfoTitle: "ข้อมูลภาพยนตร์",
      submitterInfoTitle: "ข้อมูลผู้ส่งผลงาน",
      fileUploadTitle: "อัปโหลดไฟล์",
      
      // Form fields
      filmTitle: "ชื่อภาพยนตร์ (ภาษาอังกฤษ)",
      filmTitleTh: "ชื่อภาพยนตร์ (ภาษาไทย)",
      duration: "ความยาว (นาที)",
      synopsis: "เรื่องย่อ (ไม่เกิน 200 คำ)",
      chiangmaiConnection: "ความเกี่ยวข้องกับเชียงใหม่",
      
      submitterName: "ชื่อ-นามสกุล",
      submitterNameTh: "ชื่อ-นามสกุล (ภาษาไทย)",
      age: "อายุ",
      phone: "เบอร์โทรศัพท์",
      email: "อีเมล",
      roleInFilm: "บทบาทในภาพยนตร์",
      schoolName: "ชื่อโรงเรียน",
      studentId: "รหัสนักเรียน",
      
      // File upload fields
      filmFile: "ไฟล์ภาพยนตร์",
      posterFile: "โปสเตอร์ภาพยนตร์",
      proofFile: "หลักฐานการเป็นนักเรียน",
      
      selectRole: "เลือกบทบาท",
      specifyRole: "ระบุบทบาท",
      
      submitButton: "ส่งผลงานเข้าประกวด",
      submitting: "กำลังส่งผลงาน...",
      successMessage: "ส่งผลงานเรียบร้อยแล้ว!"
    },
    en: {
      pageTitle: "Submit Your Film - Youth Fantastic Short Film Award",
      categoryTitle: "Youth Fantastic Short Film Award",
      prizeAmount: "160,000 THB",
      
      // Sections
      filmInfoTitle: "Film Information",
      submitterInfoTitle: "Submitter Information",
      fileUploadTitle: "File Upload",
      
      // Form fields
      filmTitle: "Film Title (English)",
      filmTitleTh: "Film Title (Thai)",
      duration: "Duration (minutes)",
      synopsis: "Synopsis (max 200 words)",
      chiangmaiConnection: "Connection to Chiang Mai",
      
      submitterName: "Full Name",
      submitterNameTh: "Full Name (Thai)",
      age: "Age",
      phone: "Phone Number",
      email: "Email",
      roleInFilm: "Role in Film",
      schoolName: "School Name",
      studentId: "Student ID",
      
      // File upload fields
      filmFile: "Film File",
      posterFile: "Film Poster",
      proofFile: "Student ID Proof",
      
      selectRole: "Select Role",
      specifyRole: "Specify Role",
      
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

    // Submitter Information
    if (!formData.submitterName.trim()) errors.submitterName = validationMessages.required;
    if (isThaiNationality && !formData.submitterNameTh?.trim()) errors.submitterNameTh = validationMessages.required;
    if (!formData.submitterAge) {
      errors.submitterAge = validationMessages.required;
    } else {
      const age = parseInt(formData.submitterAge);
      if (!validateAge(age, 'YOUTH')) errors.submitterAge = validationMessages.invalidAge('YOUTH');
    }
    if (!formData.submitterPhone.trim()) errors.submitterPhone = validationMessages.required;
    if (!formData.submitterEmail.trim()) {
      errors.submitterEmail = validationMessages.required;
    } else if (!validateEmail(formData.submitterEmail)) {
      errors.submitterEmail = validationMessages.invalidEmail;
    }
    if (!formData.submitterRole) errors.submitterRole = validationMessages.required;
    if (formData.submitterRole === 'Other' && !formData.submitterCustomRole?.trim()) {
      errors.submitterCustomRole = validationMessages.required;
    }
    if (!formData.schoolName.trim()) errors.schoolName = validationMessages.required;
    if (!formData.studentId.trim()) errors.studentId = validationMessages.required;

    // Crew Members
    if (formData.crewMembers.length === 0) errors.crewMembers = validationMessages.minCrewMembers;

    // File uploads
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

  const handleCrewMembersChange = (crewMembers: CrewMember[]) => {
    setFormData(prev => ({ ...prev, crewMembers }));
    if (formErrors.crewMembers) {
      setFormErrors(prev => ({ ...prev, crewMembers: '' }));
    }
  };

  const handleAgreementChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (formErrors.agreements) {
      setFormErrors(prev => ({ ...prev, agreements: '' }));
    }
  };

  // Handle nationality change from NationalitySelector
  const handleNationalityChange = useCallback((nationality: string) => {
    setFormData(prev => ({ ...prev, nationality }));
  }, []);

  // Handle nationality type change from NationalitySelector
  const handleNationalityTypeChange = useCallback((isThaiNationality: boolean) => {
    setIsThaiNationality(isThaiNationality);
    
    // Clear Thai-specific fields when switching to International
    if (!isThaiNationality) {
      setFormData(prev => ({
        ...prev,
        filmTitleTh: '',
        submitterNameTh: '',
        crewMembers: prev.crewMembers.map(member => ({
          ...member,
          fullNameTh: undefined
        }))
      }));
    }
  }, []);

  // Handle file changes
  const handleFileChange = (fieldName: keyof Pick<YouthFormData, 'filmFile' | 'posterFile' | 'proofFile'>) => (file: File | null) => {
    setFormData(prev => ({ ...prev, [fieldName]: file }));
    
    // Clear error when file is selected
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

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
        category: 'youth',
        nationality: formData.nationality,
        filmTitle: formData.filmTitle,
        filmTitleTh: isThaiNationality ? formData.filmTitleTh : null,
        genres: formData.genres,
        duration: parseInt(formData.duration),
        synopsis: formData.synopsis,
        chiangmaiConnection: formData.chiangmaiConnection,
        submitterName: formData.submitterName,
        submitterNameTh: isThaiNationality ? formData.submitterNameTh : null,
        submitterAge: parseInt(formData.submitterAge),
        submitterPhone: formData.submitterPhone,
        submitterEmail: formData.submitterEmail,
        submitterRole: formData.submitterRole,
        submitterCustomRole: formData.submitterCustomRole || null,
        schoolName: formData.schoolName,
        studentId: formData.studentId,
        crewMembers: formData.crewMembers,
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
              src="https://firebasestorage.googleapis.com/v0/b/cifan-c41c6.firebasestorage.app/o/site_files%2Ffest_logos%2FGroup%202.png?alt=media&token=e8be419f-f0b2-4f64-8d7f-c3e8532e2689"
              alt="Youth Competition Logo"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Film Title Thai - Only for Thai nationality */}
              {isThaiNationality && (
                <div className="md:col-span-2">
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
              
              <div className="md:col-span-2">
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
              
              <GenreSelector
                value={formData.genres}
                onChange={handleGenreChange}
                error={formErrors.genres}
                required
              />
              
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
            </div>
            
            <div className="mt-6">
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
            
            <div className="mt-6">
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
          </FormSection>

          {/* Section 3: Submitter Information */}
          <FormSection title={currentContent.submitterInfoTitle} icon="👤">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.submitterName} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="submitterName"
                  value={formData.submitterName}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterName ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.submitterName} />
              </div>
              
              {/* Thai Name - only for Thai nationality */}
              {isThaiNationality && (
                <div>
                  <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                    {currentContent.submitterNameTh} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="submitterNameTh"
                    value={formData.submitterNameTh || ''}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterNameTh ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                  />
                  <ErrorMessage error={formErrors.submitterNameTh} />
                </div>
              )}
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.age} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="submitterAge"
                  value={formData.submitterAge}
                  onChange={handleInputChange}
                  min="12"
                  max="18"
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterAge ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.submitterAge} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.phone} <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="submitterPhone"
                  value={formData.submitterPhone}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterPhone ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.submitterPhone} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.email} <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="submitterEmail"
                  value={formData.submitterEmail}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterEmail ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.submitterEmail} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.roleInFilm} <span className="text-red-400">*</span>
                </label>
                <select
                  name="submitterRole"
                  value={formData.submitterRole}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterRole ? 'border-red-400 error-field' : 'border-white/20'} text-white focus:border-[#FCB283] focus:outline-none`}
                >
                  <option value="" className="bg-[#110D16]">{currentContent.selectRole}</option>
                  {['Director', 'Producer', 'Cinematographer', 'Editor', 'Sound Designer', 'Production Designer', 'Costume Designer', 'Makeup Artist', 'Screenwriter', 'Composer', 'Casting Director', 'Visual Effects Supervisor', 'Location Manager', 'Script Supervisor', 'Assistant Director', 'Other'].map(role => (
                    <option key={role} value={role} className="bg-[#110D16]">
                      {role}
                    </option>
                  ))}
                </select>
                <ErrorMessage error={formErrors.submitterRole} />
              </div>
              
              {/* Custom Role - only show if Other is selected */}
              {formData.submitterRole === 'Other' && (
                <div>
                  <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                    {currentContent.specifyRole} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="submitterCustomRole"
                    value={formData.submitterCustomRole || ''}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterCustomRole ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                  />
                  <ErrorMessage error={formErrors.submitterCustomRole} />
                </div>
              )}
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.schoolName} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.schoolName ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.schoolName} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.studentId} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.studentId ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.studentId} />
              </div>
            </div>
          </FormSection>

          {/* Section 4: Crew Information */}
          <CrewManagement
            crewMembers={formData.crewMembers}
            onCrewMembersChange={handleCrewMembersChange}
            isThaiNationality={isThaiNationality}
            error={formErrors.crewMembers}
          />

          {/* Section 5: File Upload */}
          <FormSection title={currentContent.fileUploadTitle} icon="📁">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FileUploader
                  name="filmFile"
                  label={currentContent.filmFile}
                  accept=".mp4,.mov"
                  fileType="VIDEO"
                  required={true}
                  onFileChange={handleFileChange('filmFile')}
                  error={formErrors.filmFile}
                  currentFile={formData.filmFile}
                  icon="🎬"
                />
              </div>
              
              <FileUploader
                name="posterFile"
                label={currentContent.posterFile}
                accept=".jpg,.jpeg,.png"
                fileType="IMAGE"
                required={true}
                onFileChange={handleFileChange('posterFile')}
                error={formErrors.posterFile}
                currentFile={formData.posterFile}
                icon="🖼️"
              />
              
              <FileUploader
                name="proofFile"
                label={currentContent.proofFile}
                accept=".pdf,.jpg,.jpeg,.png"
                fileType="DOCUMENT"
                required={true}
                onFileChange={handleFileChange('proofFile')}
                error={formErrors.proofFile}
                currentFile={formData.proofFile}
                icon="📄"
              />
            </div>
          </FormSection>

          {/* Section 6: Terms and Conditions */}
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
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`relative overflow-hidden font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 glass-button-primary text-white shadow-lg hover:shadow-[#AA4626]/30 px-8 py-4 text-lg rounded-2xl w-full sm:w-auto ${getClass('menu')} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>{isSubmitting ? currentContent.submitting : currentContent.submitButton}</span>
              </span>
              
              {/* Shine effect */}
              {!isSubmitting && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default YouthSubmissionForm;
