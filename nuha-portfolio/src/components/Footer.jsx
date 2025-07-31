import React from 'react'
import { Github, Linkedin, Mail, Heart } from 'lucide-react'
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' }
  ]

  const socialLinks = [
    {
      icon: <Github size={20} />,
      url: "https://github.com/NuhaYoosuf",
      label: "GitHub"
    },
    {
      icon: <Linkedin size={20} />,
      url: "https://linkedin.com/in/nuhayoosuf",
      label: "LinkedIn"
    },
    {
      icon: <Mail size={20} />,
      url: "mailto:nuhayoosuf@example.com",
      label: "Email"
    }
  ]

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId.replace('#', ''))
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <h3>Nuha Yoosuf</h3>
              <p>Full Stack Developer passionate about creating impactful digital experiences.</p>
            </div>
            <div className="footer-social">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <nav className="footer-nav">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(link.href)
                  }}
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer-section">
            <h4>Get In Touch</h4>
            <div className="footer-contact">
              <p>
                <Mail size={16} />
                nuhayoosuf@example.com
              </p>
              <p>Available for freelance projects and full-time opportunities</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>
              © {currentYear} Nuha Yoosuf. Made with <Heart size={16} className="heart" /> using React
            </p>
          </div>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer