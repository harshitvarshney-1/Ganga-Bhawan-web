import React, { useState, useEffect } from 'react';
import NavBar from '../../shared/components/organisms/NavBar/NavBar';
import Page1 from './page1/Page1';
import Page2 from './page2/Page2';
import Page3 from './page3/Page3';
import SplashScreen from '../splash/SplashScreen';

const Home = () => {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const hasShown = sessionStorage.getItem('hasShownSplash');
    if (!hasShown) {
      setShowSplash(true);
      sessionStorage.setItem('hasShownSplash', 'true');
    }
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div className="min-h-screen bg-background">
        <NavBar />
        <Page1 />
        <Page2 />
        <Page3 />
      </div>
    </>
  );
};

export default Home;
