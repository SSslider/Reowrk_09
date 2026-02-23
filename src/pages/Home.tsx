import React from 'react';
import Hero from '../components/Hero';
import LogoTicker from '../components/LogoTicker';
import WhyUs from '../components/WhyUs';
import Services from '../components/Services';
import Projects from '../components/Projects';
import Team from '../components/Team';
import Review from '../components/Testimonials'; // Check generic name if Review or Testimonials
import FAQ from '../components/FAQ';

const Home = () => {
    return (
        <div className="bg-[#020204]">
            <Hero />
            <LogoTicker />
            <Services />
            <Projects />
            <WhyUs />
            <Team />
            <Review />
            <FAQ />
        </div>
    );
};

export default Home;
