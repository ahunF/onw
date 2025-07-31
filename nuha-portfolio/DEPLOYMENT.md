# Deployment Guide

This guide will help you deploy the Nuha Yoosuf portfolio website to GitHub Pages.

## Prerequisites

1. GitHub account
2. Git installed on your local machine
3. Node.js and npm installed

## Step-by-Step Deployment

### 1. Fork or Clone the Repository

If you're setting up for the first time:

```bash
git clone https://github.com/NuhaYoosuf/nuha-portfolio.git
cd nuha-portfolio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure for Your GitHub Account

Update the following files:

**package.json** - Update the homepage URL:
```json
"homepage": "https://YOUR_USERNAME.github.io/nuha-portfolio"
```

**vite.config.js** - Update the base path:
```javascript
base: '/nuha-portfolio/'
```

### 4. Build the Project

Test that everything builds correctly:

```bash
npm run build
```

### 5. Deploy to GitHub Pages

#### First Time Setup

1. Create a new repository on GitHub named `nuha-portfolio`

2. Initialize git and connect to your repository:
```bash
git init
git add .
git commit -m "Initial commit: Portfolio website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nuha-portfolio.git
git push -u origin main
```

3. Deploy to GitHub Pages:
```bash
npm run deploy
```

#### Subsequent Deployments

For future updates:

```bash
# Make your changes
git add .
git commit -m "Update portfolio content"
git push origin main

# Deploy the changes
npm run deploy
```

### 6. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select "gh-pages" branch and "/ (root)" folder
6. Click "Save"

Your portfolio will be available at: `https://YOUR_USERNAME.github.io/nuha-portfolio`

## Customization Before Deployment

### Essential Updates

1. **Personal Information**:
   - Update name and contact details in all components
   - Replace placeholder email addresses
   - Update social media links

2. **Profile Image**:
   - Replace the placeholder image in Hero component
   - Add your actual profile photo to the `public` folder

3. **Projects**:
   - Update project descriptions and links
   - Replace placeholder images with actual project screenshots
   - Update GitHub repository links

4. **Skills**:
   - Modify skill levels to reflect your expertise
   - Add or remove technologies as needed

5. **Content**:
   - Update the About section with your story
   - Modify project descriptions and achievements

### Optional Customizations

1. **Colors and Styling**:
   - Update CSS custom properties in `src/App.css`
   - Modify color scheme to match your preferences

2. **Additional Sections**:
   - Add certifications or education section
   - Include testimonials or recommendations

3. **SEO Optimization**:
   - Update meta tags in `public/index.html`
   - Add structured data for better search visibility

## Troubleshooting

### Common Issues

1. **404 Error on Deployment**:
   - Check that the base path in `vite.config.js` matches your repository name
   - Ensure the homepage URL in `package.json` is correct

2. **Build Failures**:
   - Run `npm run lint` to check for code issues
   - Ensure all dependencies are installed

3. **Images Not Loading**:
   - Place images in the `public` folder
   - Use relative paths starting with `/`

4. **GitHub Pages Not Updating**:
   - Check the Actions tab in your GitHub repository for build status
   - Clear browser cache and try again

### Build Optimization

The build process automatically:
- Minifies CSS and JavaScript
- Optimizes images
- Creates code splitting for better performance
- Generates a service worker for caching

## Alternative Deployment Options

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on git push

### Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in project directory
3. Follow the setup prompts
4. Deploy with `vercel --prod`

## Maintenance

### Regular Updates

1. Keep dependencies updated:
```bash
npm update
```

2. Test builds regularly:
```bash
npm run build
npm run preview
```

3. Monitor performance and optimize as needed

### Content Updates

The portfolio should be updated regularly with:
- New projects and achievements
- Updated skills and technologies
- Fresh content and improvements

## Support

If you encounter issues during deployment:

1. Check the GitHub Actions logs for detailed error messages
2. Ensure all file paths use forward slashes
3. Verify that all required dependencies are installed
4. Test the build locally before deploying

For additional help, refer to the main README.md or create an issue in the repository.