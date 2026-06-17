import { type FC } from 'react';


const HeroSection: FC = () => {

  const handleStartClick = () => {
    document.getElementById('templates')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section id="hero" className="hero-section">
      {/* Background Auras */}
      <div className="aur aur-a" style={{ top: '-80px', left: '-120px' }}></div>
      <div className="aur aur-b" style={{ top: '180px', right: '-180px' }}></div>
      <div className="aur aur-a" style={{ bottom: '-80px', left: '45%', transform: 'translateX(-50%)', opacity: 0.4 }}></div>
      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div className="text-center">
          <p></p>
          <h1 className="h1 afu" style={{ animationDelay: '0.12s' }}>
            The form for perfectionists
            <br />
            with <span className="gt">deadlines</span>
          </h1>
          <p
            className="mx-auto afu"
            style={{
              maxWidth: '580px',
              fontSize: 'clamp(0.95rem, 1.8vw, 1.2rem)',
              color: 'var(--tx2)',
              marginBottom: '36px',
              animationDelay: '0.2s',
            }}
          >
            {/* Facing a weekend deadline for a complex form? Let us handle the frontend so you can focus entirely on your backend API. Always free, no account or card required. */}
            {/* Skip the frontend grunt work. Build complex forms instantly and focus on your backend APIs. 100% free—no accounts, no credit cards. */}
            Crush your weekend demo deadlines. Our form builder handles the UI so backend developers can focus on the APIs. Always free, no cards, no signup needed.
          </p>

          <div
            className="d-flex align-items-center justify-content-center gap-3 flex-wrap afu"
            style={{ animationDelay: '0.28s' }}
          >
            <button
              className="bgrd btn px-4 py-3 fs-6"
              onClick={handleStartClick}
            >
              Start for Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
