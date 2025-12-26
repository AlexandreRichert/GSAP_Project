# GSAP_Project

A modern, multi-page website showcasing advanced GSAP (GreenSock Animation Platform) animations. This project demonstrates professional-grade web animations with a modular architecture.

## Features

This project includes the following GSAP animation features:

### 🎬 Animation Modules

1. **Preloader** (`js/animations/preloader.js`)
   - Smooth page loading animation with progress bar
   - Auto-hides when loading is complete

2. **Page Transitions** (`js/animations/pageTransition.js`)
   - Seamless transitions between pages
   - Overlay animation for smooth navigation

3. **Text Reveal** (`js/animations/textReveal.js`)
   - Elegant text reveal animations
   - Staggered word-by-word reveals
   - Perfect for hero sections

4. **Scroll Animations** (`js/animations/scrollAnimation.js`)
   - Elements animate into view on scroll
   - ScrollTrigger integration
   - Fade-in with motion effects

5. **Pin Animation** (`js/animations/pinAnimation.js`)
   - Pin sections while content animates
   - Sequential item reveals
   - ScrollTrigger pinning

6. **Horizontal Scroll** (`js/animations/horizontalScroll.js`)
   - Smooth horizontal scrolling sections
   - Perfect for portfolios and showcases
   - Multiple sections with individual animations

7. **Slider** (`js/animations/slider.js`)
   - GSAP-powered carousel/slider
   - Auto-play functionality
   - Dot navigation and prev/next controls

8. **Custom Cursor** (`js/animations/customCursor.js`)
   - Smooth custom cursor with GSAP
   - Interactive hover effects
   - Disabled on mobile devices

## Project Structure

```
GSAP_Project/
├── index.html              # Main homepage
├── pages/
│   ├── page1.html         # Gallery page (scroll animations)
│   ├── page2.html         # Horizontal scroll page
│   └── page3.html         # Slider page
├── css/
│   └── style.css          # Global styles
├── js/
│   ├── main.js            # Main initialization file
│   └── animations/        # Animation modules
│       ├── preloader.js
│       ├── pageTransition.js
│       ├── textReveal.js
│       ├── scrollAnimation.js
│       ├── pinAnimation.js
│       ├── horizontalScroll.js
│       ├── slider.js
│       └── customCursor.js
├── package.json
├── .gitignore
└── README.md
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AlexandreRichert/GSAP_Project.git
cd GSAP_Project
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Development Server

Start a local development server:
```bash
npm run dev
```

Then open your browser and navigate to `http://localhost:8080`

### Without npm

You can also open `index.html` directly in your browser since GSAP is included locally in the `lib/` directory.

## Pages

- **Home (`index.html`)**: Features preloader, text reveals, scroll animations, and pin animations
- **Gallery (`pages/page1.html`)**: Showcases scroll-triggered animations with a grid layout
- **Horizontal (`pages/page2.html`)**: Demonstrates horizontal scrolling with GSAP ScrollTrigger
- **Slider (`pages/page3.html`)**: GSAP-powered image/content slider with auto-play

## Technologies Used

- **GSAP**: Core animation library (included in lib/ directory)
- **ScrollTrigger**: GSAP plugin for scroll-based animations (included in lib/ directory)
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with custom properties
- **HTML5**: Semantic markup

## Animation Architecture

Each animation is modular and self-contained:

- **Separation of Concerns**: Each animation type has its own file
- **Easy Initialization**: All animations are initialized from `main.js`
- **Reusable**: Animations can be easily imported into other projects
- **No Dependencies**: Each module can work independently

## Customization

### Modifying Animations

Each animation module follows this pattern:

```javascript
const AnimationName = {
    init() {
        // Animation logic here
    }
};
```

To customize:
1. Open the relevant file in `js/animations/`
2. Modify the GSAP timeline or animation parameters
3. Refresh your browser to see changes

### Adding New Pages

1. Create a new HTML file in the `pages/` directory
2. Copy the structure from an existing page
3. Include the desired animation modules
4. Update the navigation menu

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- GSAP is loaded from CDN for optimal caching
- Animations use hardware acceleration
- ScrollTrigger efficiently manages scroll events
- Custom cursor disabled on mobile for better performance

## License

MIT License - feel free to use this project for learning or in your own projects.

## Credits

- Built with [GSAP](https://greensock.com/gsap/)
- ScrollTrigger plugin by GreenSock

## Contributing

Feel free to open issues or submit pull requests to improve the project!

---

**Enjoy creating amazing animations with GSAP!** ✨