import React from 'react'
import { motion } from 'framer-motion'
import { FaReact, FaJs, FaHtml5, FaCss3Alt, FaNode, FaPython, FaGitAlt, FaDatabase } from 'react-icons/fa'
import { SiTypescript, SiMongodb, SiExpress, SiTailwindcss } from 'react-icons/si'
import './Skills.css'

const Skills = () => {
  const skillCategories = [
    {
      title: "Frontend",
      skills: [
        { name: "React", icon: <FaReact />, level: 90 },
        { name: "JavaScript", icon: <FaJs />, level: 88 },
        { name: "TypeScript", icon: <SiTypescript />, level: 82 },
        { name: "HTML5", icon: <FaHtml5 />, level: 95 },
        { name: "CSS3", icon: <FaCss3Alt />, level: 90 },
        { name: "Tailwind CSS", icon: <SiTailwindcss />, level: 85 }
      ]
    },
    {
      title: "Backend",
      skills: [
        { name: "Node.js", icon: <FaNode />, level: 85 },
        { name: "Express.js", icon: <SiExpress />, level: 80 },
        { name: "Python", icon: <FaPython />, level: 78 },
        { name: "MongoDB", icon: <SiMongodb />, level: 82 },
        { name: "SQL", icon: <FaDatabase />, level: 75 }
      ]
    },
    {
      title: "Tools & Technologies",
      skills: [
        { name: "Git", icon: <FaGitAlt />, level: 88 },
        { name: "RESTful APIs", icon: <FaDatabase />, level: 85 },
        { name: "Responsive Design", icon: <FaCss3Alt />, level: 92 },
        { name: "Version Control", icon: <FaGitAlt />, level: 90 }
      ]
    }
  ]

  return (
    <section id="skills" className="skills">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Skills & Expertise</h2>
          <p className="section-subtitle">Technologies and tools I work with</p>
        </motion.div>

        <div className="skills-grid">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div 
              key={categoryIndex}
              className="skill-category"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="category-title">{category.title}</h3>
              <div className="skills-list">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div 
                    key={skillIndex}
                    className="skill-item"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: (categoryIndex * 0.2) + (skillIndex * 0.1) }}
                    viewport={{ once: true }}
                  >
                    <div className="skill-header">
                      <div className="skill-info">
                        <span className="skill-icon">{skill.icon}</span>
                        <span className="skill-name">{skill.name}</span>
                      </div>
                      <span className="skill-percentage">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <motion.div 
                        className="skill-progress"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: (categoryIndex * 0.2) + (skillIndex * 0.1) + 0.3 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills