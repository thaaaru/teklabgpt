# TekLab AI - Cybersecurity Intelligence Platform

A modern, responsive UI built with React and Tailwind CSS, inspired by You.com but customized for cybersecurity and AI applications.

## Features

- **Dark Mode First**: Beautiful dark theme with soft gradients and glass morphism effects
- **Responsive Design**: Fully responsive layout that works on all devices
- **Modern UI Components**:
  - Interactive search bar with AI-powered suggestions
  - Tabbed navigation system
  - Dynamic result cards with hover effects
  - Clean header and footer navigation
- **Performance Optimized**: Built with Vite for lightning-fast development and builds
- **Accessibility**: Semantic HTML and ARIA labels throughout

## Tech Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation frontend tooling
- **React Router** - Client-side routing
- **Lucide React** - Beautiful, customizable icons

## Project Structure

```
teklab-ui/
├── public/
├── src/
│   ├── components/
│   │   ├── HeaderNav.jsx      # Main navigation header
│   │   ├── SearchBar.jsx      # AI-powered search input
│   │   ├── Suggestions.jsx    # Search suggestion chips
│   │   ├── Tabs.jsx           # Horizontal tab navigation
│   │   ├── ResultCard.jsx     # Reusable result card component
│   │   └── Footer.jsx         # Site footer
│   ├── pages/
│   │   └── HomePage.jsx       # Main landing page
│   ├── App.jsx                # Root component with routing
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles + Tailwind
├── index.html
├── tailwind.config.js         # Tailwind configuration
├── vite.config.js             # Vite configuration
└── package.json

```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Navigate to the project directory:
```bash
cd teklab-ui
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Design System

### Colors

- **Primary**: `#4F8BFF` - Main brand color
- **Dark Background**: `#0B0D10` - Main background
- **Card Background**: `rgba(255,255,255,0.04)` - Glass effect
- **Text**: `#E5E7EB` - Primary text color
- **Muted Text**: `#9CA3AF` - Secondary text

### Typography

- **Font Family**: Inter
- **Heading Sizes**: 2xl to 5xl
- **Body Text**: sm to base

### Spacing

- **Border Radius**: 12-16px for cards and panels
- **Padding**: 24px for cards, 72px header height
- **Max Width**: 1100px for hero content, 1400px for main content

## Component API

### SearchBar
```jsx
<SearchBar onSearch={(query) => console.log(query)} />
```

### Suggestions
```jsx
<Suggestions onSuggestionClick={(text) => console.log(text)} />
```

### Tabs
```jsx
<Tabs onTabChange={(tabId) => console.log(tabId)} />
```

### ResultCard
```jsx
<ResultCard
  title="Card Title"
  description="Card description"
  source="Source"
  category="Category"
  icon={IconComponent}
  gradient="from-blue-500 to-cyan-500"
/>
```

## Customization

### Changing Colors

Edit `tailwind.config.js` to customize the color palette:

```javascript
colors: {
  primary: {
    DEFAULT: '#4F8BFF',
    dark: '#3B6FDB',
    light: '#6BA3FF',
  },
  // ... more colors
}
```

### Adding New Pages

1. Create a new page component in `src/pages/`
2. Add a route in `src/App.jsx`:

```jsx
<Route path="/new-page" element={<NewPage />} />
```

## Backend Integration

This UI is designed to connect to backend APIs. To integrate:

1. Create an API service file (e.g., `src/services/api.js`)
2. Implement API calls using fetch or axios
3. Update component state with API responses
4. Handle loading and error states

Example API integration in SearchBar:

```javascript
const handleSearch = async (query) => {
  try {
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    // Handle response
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

## Contributing

This is a production-ready template. Feel free to customize and extend it for your needs.

## License

MIT

## Contact

For questions or support, visit [TekLab.dev](https://teklab.dev)
