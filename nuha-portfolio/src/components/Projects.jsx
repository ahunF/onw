import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, ExternalLink, Eye, Code } from 'lucide-react'
import './Projects.css'

const Projects = () => {
  const [filter, setFilter] = useState('all')
  
  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "A full-stack e-commerce solution with React frontend and Node.js backend, featuring user authentication, payment integration, and admin dashboard.",
      image: "/api/placeholder/400/300",
      category: "fullstack",
      technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe API"],
      github: "https://github.com/NuhaYoosuf/ecommerce-platform",
      demo: "https://ecommerce-demo.netlify.app",
      featured: true
    },
    {
      id: 2,
      title: "Task Management App",
      description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
      image: "/api/placeholder/400/300",
      category: "frontend",
      technologies: ["React", "TypeScript", "Tailwind CSS", "Firebase"],
      github: "https://github.com/NuhaYoosuf/task-manager",
      demo: "https://task-manager-demo.netlify.app",
      featured: true
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "A responsive weather application with location-based forecasts, interactive maps, and detailed weather analytics.",
      image: "/api/placeholder/400/300",
      category: "frontend",
      technologies: ["React", "OpenWeather API", "Chart.js", "CSS3"],
      github: "https://github.com/NuhaYoosuf/weather-dashboard",
      demo: "https://weather-dashboard-demo.netlify.app",
      featured: false
    },
    {
      id: 4,
      title: "Blog Platform API",
      description: "RESTful API for a blog platform with authentication, CRUD operations, comment system, and user management.",
      image: "/api/placeholder/400/300",
      category: "backend",
      technologies: ["Node.js", "Express", "MongoDB", "JWT", "Bcrypt"],
      github: "https://github.com/NuhaYoosuf/blog-api",
      demo: "https://blog-api-docs.herokuapp.com",
      featured: false
    },
    {
      id: 5,
      title: "Personal Finance Tracker",
      description: "A comprehensive finance tracking application with expense categorization, budget planning, and financial insights.",
      image: "/api/placeholder/400/300",
      category: "fullstack",
      technologies: ["React", "Python", "Flask", "PostgreSQL", "Chart.js"],
      github: "https://github.com/NuhaYoosuf/finance-tracker",
      demo: "https://finance-tracker-demo.herokuapp.com",
      featured: true
    },
    {
      id: 6,
      title: "Recipe Sharing Platform",
      description: "A social platform for sharing and discovering recipes with user profiles, ratings, and recipe collections.",
      image: "/api/placeholder/400/300",
      category: "fullstack",
      technologies: ["React", "Node.js", "Express", "MongoDB", "Cloudinary"],
      github: "https://github.com/NuhaYoosuf/recipe-platform",
      demo: "https://recipe-platform-demo.netlify.app",
      featured: false
    }
  ]

  const categories = [
    { key: 'all', label: 'All Projects' },
    { key: 'frontend', label: 'Frontend' },
    { key: 'backend', label: 'Backend' },
    { key: 'fullstack', label: 'Full Stack' }
  ]

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.category === filter)

  return (
    <section id="projects" className="projects">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">A showcase of my recent work and contributions</p>
        </motion.div>

        <motion.div 
          className="filter-tabs"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {categories.map((category) => (
            <button
              key={category.key}
              className={`filter-tab ${filter === category.key ? 'active' : ''}`}
              onClick={() => setFilter(category.key)}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        <div className="projects-grid">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className={`project-card ${project.featured ? 'featured' : ''}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                {project.featured && <div className="featured-badge">Featured</div>}
                
                <div className="project-image">
                  <img src={project.image} alt={project.title} />
                  <div className="project-overlay">
                    <div className="project-links">
                      <a 
                        href={project.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="project-link"
                        aria-label="View source code"
                      >
                        <Github size={20} />
                      </a>
                      <a 
                        href={project.demo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="project-link"
                        aria-label="View live demo"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  
                  <div className="project-technologies">
                    {project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="tech-tag">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="project-actions">
                    <a 
                      href={project.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                    >
                      <Code size={16} />
                      Code
                    </a>
                    <a 
                      href={project.demo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      <Eye size={16} />
                      Demo
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

export default Projects