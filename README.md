# Solar System Simulator

Interactive 3D Solar System visualization built with Three.js and WebGL.

**[Live Demo](https://axisrow.github.io/open-solar-system/)**

## Features

- **Sun** with custom animated GLSL shaders
- **8 planets** with procedurally generated textures (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)
- **2 dwarf planets** (Pluto, Ceres)
- **18+ moons** including Earth's Moon, Jupiter's Galilean moons, Saturn's Titan, and more
- **Asteroid belt** and **Kuiper belt** with 3000+ procedural asteroids
- **4 comets** (Halley, Hale-Bopp, Encke, 67P)
- **Hubble Space Telescope**
- Realistic orbital mechanics with inclinations and axial tilts
- Post-processing bloom effects
- Time control (pause, speed up to 100,000x, reverse)
- Educational info panel with astronomical data

## Controls

### Mouse
- **Left click** - Select object
- **Double click** - Fly to object
- **Drag** - Rotate view
- **Scroll** - Zoom in/out

### Keyboard
| Key | Action |
|-----|--------|
| Space | Play/Pause |
| Arrow Up/Down | Change speed |
| Arrow Left | Reverse time |
| F | Free-flight mode |
| WASD | Move (in free-flight) |
| O | Toggle orbits |
| L | Toggle labels |
| 0-8 | Jump to planets |
| H | Help |
| Esc | Exit mode |

## Getting Started

No build required. Simply open `index.html` in a modern browser.

```bash
# Clone and open
git clone https://github.com/axisrow/open-solar-system.git
cd open-solar-system
open index.html
```

## Project Structure

```
solar-system/
├── index.html              # Entry point
├── css/styles.css          # Styling
└── js/
    ├── main.js             # App entry, animation loop
    ├── scene.js            # Three.js scene setup
    ├── sun.js              # Sun with animated shaders
    ├── planets.js          # Planet generation
    ├── moons.js            # Moon systems
    ├── asteroids.js        # Asteroid belts
    ├── comets.js           # Comet simulation
    ├── effects.js          # Star field
    ├── controls.js         # Camera controls
    ├── time.js             # Time management
    ├── ui.js               # UI interactions
    └── data/
        └── solarSystemData.js  # Astronomical data
```

## Technologies

- [Three.js](https://threejs.org/) v0.160.0
- WebGL with post-processing (UnrealBloomPass)
- Custom GLSL shaders
- Simplex Noise for procedural textures
- ES6 modules (no bundler needed)

## Notes

- UI language is Russian
- Works best in Chrome, Firefox, or Edge
- Requires WebGL support

## Roadmap

- [ ] Real photo textures from NASA
- [ ] Add James Webb Space Telescope (JWST)
- [ ] Add International Space Station (ISS)
- [ ] Sound effects and ambient music
- [ ] New modes: planet size comparison, planet parade
- [ ] Space mission trajectories (Voyager, New Horizons)
- [ ] Constellations
- [ ] Famous stars (Sirius, Betelgeuse, Polaris, etc.)
- [ ] Galaxies (Andromeda, Milky Way visualization, etc.)
- [ ] Solar and lunar eclipses
- [ ] Mobile adaptation with touch controls
- [ ] Localization to other languages
- [ ] Object search by name
- [ ] Real-time mode (sync with actual planet positions)
- [ ] More famous space objects:
  - Sputnik-1 (first artificial satellite)
  - Apollo Lunar Module
  - Lunokhod 1 & 2 (Soviet lunar rovers)
  - Tesla Roadster with Starman
  - Voyager 1 & 2 (interstellar probes)
  - Pioneer 10 & 11
  - New Horizons
  - Cassini (Saturn)
  - Juno (Jupiter)
  - Parker Solar Probe
  - Mars rovers: Curiosity, Perseverance, Opportunity, Spirit
  - Ingenuity helicopter (Mars)
  - Tiangong space station
  - Chandrayaan (India lunar missions)
  - Chang'e lunar landers (China)

and more and more...

## License

MIT
