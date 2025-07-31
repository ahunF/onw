import React from 'react'
import { motion } from 'framer-motion'
import { Code, Lightbulb, Target, Users } from 'lucide-react'
import './About.css'

const About = () => {
  const features = [
    {
      icon: <Code size={24} />,
      title: "Clean Code",
      description: "Writing maintainable and efficient code following best practices"
    },
    {
      icon: <Lightbulb size={24} />,
      title: "Problem Solving",
      description: "Creative solutions to complex technical challenges"
    },
    {
      icon: <Target size={24} />,
      title: "Goal Oriented",
      description: "Focused on delivering results that meet project objectives"
    },
    {
      icon: <Users size={24} />,
      title: "Team Player",
      description: "Collaborative approach to development and project management"
    }
  ]

  return (
    <section id="about" className="about">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">About Me</h2>
          <p className="section-subtitle">Get to know more about my journey and passion for development</p>
        </motion.div>

        <div className="about-content">
          <motion.div 
            className="about-text"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3>My Story</h3>
            <p>
              I'm a passionate full-stack developer with a love for creating digital experiences 
              that make a difference. My journey in programming started with curiosity and has 
              evolved into a dedication to crafting clean, efficient, and user-friendly applications.
            </p>
            <p>
              I believe in continuous learning and staying up-to-date with the latest technologies. 
              Whether it's building responsive web applications, optimizing database performance, 
              or implementing modern design patterns, I approach each project with enthusiasm and attention to detail.
            </p>
            <p>
              When I'm not coding, you can find me exploring new technologies, contributing to 
              open-source projects, or sharing knowledge with the developer community.
            </p>
          </motion.div>

          <motion.div 
            className="about-features"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="features-grid">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About