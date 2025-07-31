import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import './Header.css'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <span>Nuha Yoosuf</span>
        </div>
        
        <nav className={`nav ${isMobileMenuOpen ? 'nav-open' : ''}`}>
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home') }}>Home</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about') }}>About</a>
          <a href="#skills" onClick={(e) => { e.preventDefault(); scrollToSection('skills') }}>Skills</a>
          <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects') }}>Projects</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact') }}>Contact</a>
        </nav>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  )
}

export default Header