import React from 'react';
import { useState } from 'react';
import Navigation from './components/layout/Navigation';
import AboutPage from './components/pages/AboutPage';
import CompetitionPage from './components/pages/CompetitionPage';
import OneHeroSection from './components/sections/OneHeroSection';
import OfficialSelectionSection from './components/sections/OfficialSelectionSection';
import QuickInfoSection from './components/sections/QuickInfoSection';
import ProgramsSection from './components/sections/ProgramsSection';
import EntertainmentExpoSection from './components/sections/EntertainmentExpoSection';
import CompetitionHighlight from './components/sections/CompetitionHighlight';
import WorkshopsSection from './components/sections/WorkshopsSection';
import CityRallySection from './components/sections/CityRallySection';
import NewsSection from './components/sections/NewsSection';
import PartnersSection from './components/sections/PartnersSection';
import Footer from './components/layout/Footer';
import AnimatedBackground from './components/ui/AnimatedBackground';
import ParticleSystem from './components/ui/ParticleSystem';
import YouthSubmissionForm from './components/pages/YouthSubmissionForm';
import FutureSubmissionForm from './components/pages/FutureSubmissionForm';
import WorldSubmissionForm from './components/pages/WorldSubmissionForm';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Listen for navigation clicks
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentPage(hash || 'home');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial page

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage />;
      case 'competition':
        return <CompetitionPage />;
      case 'submit-youth':
        return <YouthSubmissionForm />;
      case 'submit-future':
        return <FutureSubmissionForm />;
      case 'submit-world':
        return <WorldSubmissionForm />;
      default:
        return (
          <>
            <OneHeroSection />
            <ProgramsSection />
            <OfficialSelectionSection />
            <CompetitionHighlight />
            <WorkshopsSection />
            <EntertainmentExpoSection />
            <NewsSection />
            <PartnersSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#110D16] text-white overflow-x-hidden relative">
      <Navigation />
      {renderPage()}
      <Footer />
      
      {/* Animated Background Elements */}
      <AnimatedBackground />
      <ParticleSystem />
    </div>
  );
}

export default App;
