import { useState } from 'react';

function Header({ setCurrentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false); // Close menu after click on mobile
  };

  return (
    <header>
      <div className="logo">
        <h1 onClick={() => handleNavClick('home')} style={{ cursor: 'pointer' }}>BurnoutBreaker</h1>
      </div>
      
      <nav className={isMenuOpen ? 'active' : ''}>
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>Home</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('therapy'); }}>Therapy</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('coaching'); }}>Coaching</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('community'); }}>Community</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('resources'); }}>Resources</a></li>
        </ul>
      </nav>
      
      <button className="menu-toggle" onClick={toggleMenu}>
        <span className="sr-only">Menu</span>
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </header>
  );
}

export default Header; 