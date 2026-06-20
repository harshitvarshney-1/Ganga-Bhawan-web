import React, { useEffect, useState } from 'react';
import LogoIcon from "../../shared/components/atoms/Logo/LogoIcon";
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationStage, setAnimationStage] = useState('letters'); // 'letters', 'joined', 'expanded'

  const title = "GANGA BHAWAN";
  const letters = title.split('');

  useEffect(() => {
    // Stage 1: Letters appear one by one (1.5s)
    const joinTimer = setTimeout(() => {
      setAnimationStage('joined');
    }, 1500);

    // Stage 2: Letters join together (2.5s total)
    const expandTimer = setTimeout(() => {
      setAnimationStage('expanded');
    }, 2500);

    // Stage 3: Hide after expansion (4.5s total)
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    }, 4500);

    return () => {
      clearTimeout(joinTimer);
      clearTimeout(expandTimer);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`splash-screen ${!isVisible ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className={`splash-icon ${animationStage}`}><LogoIcon size={80} /></div>
        
        <div className={`splash-title-container ${animationStage}`}>
          {letters.map((letter, index) => (
            <span
              key={index}
              className={`splash-letter ${animationStage}`}
              style={{
                animationDelay: `${index * 0.1}s`,
                transitionDelay: animationStage === 'joined' ? `${index * 0.05}s` : '0s'
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>

        <p className={`splash-subtitle ${animationStage}`}>Premium PG Accommodation</p>
        
        {animationStage === 'expanded' && (
          <div className="splash-loader">
            <div className="splash-dot"></div>
            <div className="splash-dot"></div>
            <div className="splash-dot"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
