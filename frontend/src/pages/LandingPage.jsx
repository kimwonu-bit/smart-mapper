import React from 'react';
import HeroSection from '../components/HeroSection';
import IntroSection from '../components/IntroSection';
import ProblemSection from '../components/ProblemSection';
import MechanismSection from '../components/MechanismSection';
import AdvantagesSection from '../components/AdvantagesSection';
import HardwareSection from '../components/HardwareSection';

const LandingPage = () => {
  return (
    <>
      <HeroSection />
      <IntroSection />
      <ProblemSection />
      <MechanismSection />
      <AdvantagesSection />
      <HardwareSection />
    </>
  );
};

export default LandingPage;
