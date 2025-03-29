import { useState } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <div className="logo">
        <h1>BurnoutBreaker</h1>
      </div>
      
      <nav className={isMenuOpen ? 'active' : ''}>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Therapy</a></li>
          <li><a href="#">Coaching</a></li>
          <li><a href="#">Community</a></li>
          <li><a href="#">Resources</a></li>
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