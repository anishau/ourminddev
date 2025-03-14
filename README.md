# ourmind.care

A mindful space for understanding and working with unusual experiences. Built with simplicity and care using Eleventy.

## Philosophy

This project follows wu wei principles:
- Minimal, purposeful design
- Clear, gentle language
- Natural flow of information
- Respect for individual experiences
- Space for content to breathe

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- Git
- A text editor you're comfortable with

### Local Development

1. Clone the repository:
```bash
git clone git@github.com:yourusername/ourmind.care.git
cd ourmind.care
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The site will be available at http://localhost:8080 with live reload.

## Content Structure

Content lives in the `src` directory:
- `src/index.njk` - Homepage
- `src/*.md` - Content pages
- `src/_includes/` - Templates and layouts

### Creating New Content

1. Create a new markdown file in `src/`:
```markdown
---
layout: content
title: Your Title
keyMessage: A gentle introduction to your topic
---

## Main Section
Your content here...
```

2. Use mindful language that:
- Respects individual experiences
- Maintains dignity and agency
- Offers possibilities rather than prescriptions
- Flows naturally and gently

## Building for Production

To build the site for production:
```bash
npm run build
```

This creates the `_site` directory with the built site.

## Contributing

### Making Changes

1. Create a new branch for your changes:
```bash
git checkout -b meaningful-branch-name
```

2. Make your changes, following our principles:
- Keep edits minimal and purposeful
- Let content breathe
- Maintain the gentle tone
- Test locally using `npm start`

3. Commit your changes:
```bash
git add .
git commit -m "A clear description of your changes"
```

### Submitting Changes

1. Push your branch:
```bash
git push origin meaningful-branch-name
```

2. Visit GitHub and create a Pull Request:
- Write a clear description of your changes
- Explain how they enhance the site's purpose
- Be open to gentle feedback and iteration

### Pull Request Guidelines

Your PR should:
- Maintain the site's minimal aesthetic
- Follow existing patterns
- Include only relevant changes
- Have clear, purposeful commit messages

## Deployment

The site automatically deploys to Vercel when changes are merged to main.

## File Structure

```
ourmind.care/
├── src/                    # Source files
│   ├── _includes/         # Templates and layouts
│   │   ├── base.njk       # Base template
│   │   └── content.njk    # Content page template
│   ├── index.njk          # Homepage
│   └── *.md               # Content pages
├── .eleventy.js           # Eleventy configuration
├── package.json           # Project dependencies
└── README.md             # This file
```

## Writing Style Guide

When creating content:
1. Use natural, flowing language
2. Avoid clinical terms unless necessary
3. Create space for different experiences
4. Use metaphors mindfully
5. Keep paragraphs brief and breathable
6. Let headings guide gently

## Need Help?

- For content questions: Open a Discussion on GitHub
- For technical issues: Create an Issue
- For sensitive matters: Contact maintainers directly

Remember: Like tending a garden, this project grows through careful, mindful contributions. Take your time, move lightly, and let changes emerge naturally.
