# tumburu
Music Generator
# AI Code Editor Prompts & Scalable Project Structure

## Complete Project Structure

```
musicgen/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
├── README.md
├── nginx/
│   ├── nginx.conf
│   └── nginx.prod.conf
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   ├── settings.py
│   │   │   └── database.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── dependencies.py
│   │   │   ├── security.py
│   │   │   ├── logging.py
│   │   │   └── exceptions.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── generation.py
│   │   │   ├── user.py
│   │   │   └── audio.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── generation.py
│   │   │   ├── user.py
│   │   │   └── audio.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── audio_generation.py
│   │   │   ├── file_storage.py
│   │   │   ├── audio_analysis.py
│   │   │   ├── prompt_builder.py
│   │   │   └── stable_audio.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── health.py
│   │   │   ├── generation.py
│   │   │   ├── audio.py
│   │   │   ├── upload.py
│   │   │   └── websocket.py
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── audio_processing.py
│   │   │   ├── file_utils.py
│   │   │   ├── validation.py
│   │   │   └── cleanup.py
│   │   └── static/
│   │       └── audio/
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_generation.py
│       ├── test_audio.py
│       └── test_services/
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── public/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── vite-env.d.ts
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Slider.tsx
│   │   │   │   ├── Progress.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Toast.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── generation/
│   │   │   │   ├── PromptBox.tsx
│   │   │   │   ├── GenerationControls.tsx
│   │   │   │   ├── GenreSelector.tsx
│   │   │   │   ├── InstrumentPicker.tsx
│   │   │   │   ├── TechnicalControls.tsx
│   │   │   │   ├── ReferenceAudioUpload.tsx
│   │   │   │   └── GenerationQueue.tsx
│   │   │   ├── audio/
│   │   │   │   ├── AudioPlayer.tsx
│   │   │   │   ├── Waveform.tsx
│   │   │   │   ├── AudioControls.tsx
│   │   │   │   └── AudioList.tsx
│   │   │   ├── common/
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   └── FileUpload.tsx
│   │   │   └── panels/
│   │   │       ├── ControlPanel.tsx
│   │   │       ├── ResultPanel.tsx
│   │   │       ├── HistoryPanel.tsx
│   │   │       └── PresetPanel.tsx
│   │   ├── hooks/
│   │   │   ├── useAudioGeneration.ts
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useAudioPlayer.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useFileUpload.ts
│   │   │   └── useTheme.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── websocket.ts
│   │   │   ├── audio.ts
│   │   │   └── storage.ts
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   ├── generationStore.ts
│   │   │   ├── audioStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── userStore.ts
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   ├── generation.ts
│   │   │   ├── audio.ts
│   │   │   ├── ui.ts
│   │   │   └── api.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   ├── audio.ts
│   │   │   └── helpers.ts
│   │   ├── data/
│   │   │   ├── genres.ts
│   │   │   ├── instruments.ts
│   │   │   ├── presets.ts
│   │   │   └── timeSignatures.ts
│   │   └── styles/
│   │       ├── globals.css
│   │       ├── components.css
│   │       └── themes.css
│   └── tests/
│       ├── setup.ts
│       ├── components/
│       ├── hooks/
│       └── utils/
└── shared/
    ├── types/
    │   ├── generation.ts
    │   ├── audio.ts
    │   └── api.ts
    └── constants/
        ├── audio.ts
        ├── genres.ts
        └── validation.ts
```

## Phase 1: Complete Project Foundation

### AI Prompt 1: Project Scaffolding
```
Create a complete music generation web application with the following exact structure:

[PASTE THE COMPLETE STRUCTURE ABOVE]

Requirements:
- FastAPI backend with async support and proper Python module structure
- React + TypeScript + Vite frontend with modern tooling
- Docker Compose setup with nginx reverse proxy
- Tailwind CSS with custom configuration
- Complete development environment with hot reloading
- Proper TypeScript configurations and linting
- Environment variable setup with .env.example

Backend Stack:
- FastAPI with uvicorn
- Pydantic for data validation
- python-multipart for file uploads
- websockets for real-time updates
- aiofiles for async file operations
- pytest for testing

Frontend Stack:
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- React Query for API state
- Framer Motion for animations

Docker Setup:
- Development compose with bind mounts
- Production-ready configuration
- Nginx reverse proxy routing:
  - / -> React app
  - /api/* -> FastAPI
  - /ws -> WebSocket endpoint

Generate ALL files needed to run `docker-compose up` and have a working development environment. Include proper CORS, error handling, and logging setup.
```

### AI Prompt 2: Backend Core Architecture
```
Implement the complete FastAPI backend architecture with this modular structure:

backend/app/
├── config/settings.py - Pydantic settings with environment variables
├── core/dependencies.py - FastAPI dependencies and dependency injection
├── models/generation.py - SQLAlchemy models (if using DB) or Pydantic models
├── schemas/generation.py - Request/Response schemas
├── services/audio_generation.py - Business logic for music generation
├── routers/generation.py - API endpoints
└── main.py - FastAPI application setup

Requirements:
1. **Settings Management**: Use Pydantic BaseSettings for configuration
2. **Dependency Injection**: Proper FastAPI dependencies for services
3. **Error Handling**: Custom exception classes with proper HTTP status codes
4. **Logging**: Structured logging with correlation IDs
5. **Validation**: Comprehensive Pydantic models with validation
6. **Async/Await**: Proper async patterns throughout

Key Models Needed:
- GenerationRequest (prompt, genre, instruments, bpm, duration, etc.)
- GenerationResponse (id, status, audio_url, metadata)
- AudioFile (id, filename, size, duration, format)

API Endpoints:
- POST /api/generate - Start generation
- GET /api/generate/{id} - Check status
- GET /api/audio/{id} - Serve audio file
- POST /api/upload - Upload reference audio
- WebSocket /ws - Real-time updates

Include proper error handling, input validation, and async file operations.
Make it production-ready with proper separation of concerns.
```

### AI Prompt 3: Frontend Core Architecture
```
Create the complete React frontend with this modular component architecture:

src/
├── components/ui/ - Reusable UI components
├── components/generation/ - Music generation specific components
├── hooks/ - Custom React hooks
├── services/ - API clients and external services
├── store/ - Zustand stores for state management
├── types/ - TypeScript type definitions
└── utils/ - Helper functions and utilities

Requirements:
1. **TypeScript**: Strict mode with proper typing throughout
2. **State Management**: Zustand stores for different domains
3. **API Integration**: React Query for server state management
4. **Component Library**: Custom UI components with consistent design
5. **Real-time Updates**: WebSocket integration with reconnection logic
6. **File Handling**: Drag-and-drop upload with progress tracking
7. **Audio Playback**: Web Audio API integration with waveform visualization

Key Components Needed:
- PromptBox: Advanced text input with suggestions and validation
- GenerationControls: BPM, duration, time signature controls
- GenreSelector: Hierarchical genre selection with search
- InstrumentPicker: Multi-select instrument picker with categories
- AudioPlayer: Full-featured audio player with waveform
- GenerationQueue: Real-time queue with progress tracking

Zustand Stores:
- generationStore: Current generation parameters and history
- audioStore: Audio playback state and file management
- uiStore: Theme, notifications, modal states

Make it responsive, accessible, and performant. Use modern React patterns (hooks, suspense, error boundaries).
Include proper loading states, error handling, and optimistic updates.
```

## Phase 2: Core Feature Implementation

### AI Prompt 4: Stable Audio Integration
```
Implement complete Stable Audio API integration with robust error handling:

Files to create/modify:
- backend/app/services/stable_audio.py - Main API client
- backend/app/services/audio_generation.py - Generation orchestration
- backend/app/utils/audio_processing.py - Audio file utilities
- backend/app/routers/generation.py - API endpoints

Requirements:
1. **Async Client**: Full async HTTP client with retry logic
2. **Error Handling**: Comprehensive error handling for API failures
3. **File Management**: Automatic cleanup and storage management
4. **Progress Tracking**: Real-time generation status updates
5. **Rate Limiting**: Built-in rate limiting and queue management

Integration Flow:
1. Receive generation request → Validate → Queue
2. Build prompt from parameters → Call Stable Audio API
3. Poll for completion → Download audio → Store locally
4. Update clients via WebSocket → Clean up temp files

Error Scenarios to Handle:
- API rate limits and quotas
- Network timeouts and failures  
- Invalid audio formats
- Storage space issues
- Corrupted downloads

Include proper logging, metrics collection, and graceful degradation.
Use the actual Stable Audio API documentation I'll provide.

API Client Features:
- Automatic retries with exponential backoff
- Request/response logging
- Authentication handling
- File streaming for large audio files
- Progress callbacks for real-time updates
```

### AI Prompt 5: Real-time WebSocket System
```
Implement complete WebSocket system for real-time generation updates:

Backend Files:
- backend/app/routers/websocket.py - WebSocket endpoint and connection management
- backend/app/services/websocket_manager.py - Connection pool and broadcasting
- backend/app/core/events.py - Event system for generation updates

Frontend Files:
- src/hooks/useWebSocket.ts - WebSocket hook with reconnection
- src/services/websocket.ts - WebSocket client with event handling
- src/store/websocketStore.ts - Connection state management

Requirements:
1. **Connection Management**: Handle multiple concurrent connections
2. **Event Broadcasting**: Send updates to specific clients or all clients
3. **Reconnection Logic**: Automatic reconnection with exponential backoff
4. **Message Types**: Structured message format for different event types
5. **Queue Updates**: Real-time queue position and ETA updates

WebSocket Message Types:
- generation_started: { id, position_in_queue, eta }
- generation_progress: { id, progress, stage, eta }
- generation_completed: { id, audio_url, metadata }
- generation_failed: { id, error, retry_available }
- queue_updated: { position, total_queue_size, eta }

Backend Features:
- Connection authentication and validation
- Graceful connection cleanup
- Message broadcasting to specific users
- Integration with generation service events

Frontend Features:
- Automatic reconnection on connection loss
- Message queue for offline scenarios
- TypeScript event typing
- React integration with proper cleanup
- Connection status indicators

Handle edge cases: page refresh, network issues, server restart, multiple tabs.
```

## Phase 3: Advanced UI Components

### AI Prompt 6: Advanced Music Controls
```
Create sophisticated music generation controls with professional UX:

Components to Build:
- src/components/generation/GenreSelector.tsx - Hierarchical genre picker
- src/components/generation/InstrumentPicker.tsx - Multi-select instrument picker  
- src/components/generation/TechnicalControls.tsx - BPM, key, time signature
- src/components/generation/PromptBuilder.tsx - Smart prompt construction
- src/data/genres.ts - Complete genre taxonomy
- src/data/instruments.ts - Instrument categorization

Genre Hierarchy Structure:
- Electronic → House → Deep House, Tech House, Progressive House
- Rock → Alternative → Indie Rock, Post Rock, Math Rock
- Hip Hop → Trap, Boom Bap, Lo-fi Hip Hop
- Jazz → Smooth Jazz, Bebop, Fusion
- Classical → Baroque, Romantic, Contemporary

UX Requirements:
1. **Genre Selector**: Tree view with search, breadcrumbs, popular presets
2. **Instrument Picker**: Categorized multi-select with visual icons
3. **Technical Controls**: Sliders, dropdowns with live preview
4. **Smart Prompts**: Auto-completion, templates, validation
5. **Preset System**: Save/load combinations, community presets

Advanced Features:
- Search within categories
- Recently used items
- Drag and drop reordering
- Preset combinations (genre + instruments + settings)
- Context-aware suggestions
- Real-time prompt preview

Make it look like professional music software (Ableton Live, Logic Pro).
Use proper keyboard navigation, accessibility, and responsive design.
Include micro-animations and smooth transitions.
```

### AI Prompt 7: Professional Audio Player
```
Build a feature-rich audio player with waveform visualization:

Components to Create:
- src/components/audio/AudioPlayer.tsx - Main player component
- src/components/audio/Waveform.tsx - Interactive waveform display
- src/components/audio/PlaylistManager.tsx - Generation history and playlists
- src/hooks/useAudioPlayer.ts - Audio playback logic
- src/utils/audio.ts - Web Audio API utilities

Audio Player Features:
1. **Waveform Visualization**: Interactive waveform with zoom/pan
2. **Playback Controls**: Play, pause, seek, loop, speed control
3. **Audio Analysis**: Real-time frequency analysis and visualization  
4. **Playlist Management**: Queue multiple generations, reorder, repeat modes
5. **Export Options**: Download, share, format conversion

Technical Requirements:
- Web Audio API for precise control
- Canvas-based waveform rendering
- Audio buffer management for smooth playback
- Real-time audio analysis (FFT for frequency display)
- Keyboard shortcuts (spacebar, arrow keys)
- Touch/gesture support for mobile

Waveform Features:
- Zoom in/out functionality
- Click to seek functionality  
- Visual markers for different sections
- Peak detection and highlighting
- Color coding for different frequencies

Player UI:
- Professional timeline with time markers
- Volume controls with visual feedback
- Speed/pitch controls (preserve quality)
- Loop section selection
- A/B comparison between generations

Make it look like SoundCloud or Spotify player but optimized for music generation workflows.
Include proper loading states, error handling, and accessibility.
```

## Phase 4: File Management & Polish

### AI Prompt 8: Complete File Management System
```
Implement comprehensive file management with smart organization:

Backend Components:
- backend/app/services/file_storage.py - File operations and cleanup
- backend/app/utils/file_utils.py - File validation and processing
- backend/app/routers/audio.py - File serving and management endpoints

Frontend Components:
- src/components/panels/HistoryPanel.tsx - Generation history browser
- src/components/audio/AudioLibrary.tsx - File organization interface
- src/hooks/useFileManagement.ts - File operations hook

Features to Implement:
1. **Smart Organization**: Auto-categorization by genre, date, prompt similarity
2. **Search & Filter**: Full-text search, metadata filtering, date ranges
3. **Batch Operations**: Select multiple files, bulk download/delete
4. **Tagging System**: Custom tags, auto-tags from generation parameters
5. **Storage Management**: Automatic cleanup, storage quotas, optimization

File Management Backend:
- Automatic file cleanup based on age/usage
- Metadata extraction and indexing
- Duplicate detection and deduplication
- Storage quota enforcement
- File compression and format optimization

Frontend Library Interface:
- Grid/list view toggle with thumbnails
- Advanced filtering sidebar
- Drag-and-drop organization
- Quick preview without full loading
- Batch selection with keyboard shortcuts

Search Capabilities:
- Search by prompt text, genre, instruments
- Metadata search (BPM, key, duration)
- Similar sound detection
- Date range filtering
- Usage frequency sorting

Make it feel like a professional DAW's sample library browser.
Include proper virtualization for large collections and smooth performance.
```

### AI Prompt 9: Production Polish & Optimization
```
Add production-ready features and performance optimizations:

Backend Optimizations:
- backend/app/core/caching.py - Redis caching layer
- backend/app/core/rate_limiting.py - Advanced rate limiting
- backend/app/core/monitoring.py - Health checks and metrics

Frontend Optimizations:
- src/components/common/VirtualizedList.tsx - Performance for large lists
- src/hooks/useInfiniteScroll.ts - Pagination for audio library
- src/utils/performance.ts - Performance monitoring utilities

Production Features:
1. **Caching Strategy**: Redis for API responses, browser cache for audio
2. **Performance Monitoring**: Real-time metrics, error tracking
3. **Progressive Loading**: Lazy loading, infinite scroll, image optimization
4. **Offline Support**: Service worker, offline audio playback
5. **Analytics**: Usage tracking, feature adoption, error reporting

Security Enhancements:
- Input sanitization and validation
- Rate limiting per user/IP
- File upload security scanning
- CORS configuration
- Content Security Policy

Performance Optimizations:
- Audio file compression and streaming
- Component code splitting
- Image optimization and lazy loading
- Bundle size optimization
- Memory leak prevention

User Experience Polish:
- Keyboard shortcuts throughout the app
- Context menus for common actions
- Drag-and-drop everywhere
- Toast notifications system
- Loading skeletons and smooth transitions

Error Handling:
- Global error boundary with recovery options
- Network error handling with retry mechanisms
- Graceful degradation for missing features
- User-friendly error messages

Include proper testing setup with unit tests for critical functions.
Add comprehensive logging and monitoring for production deployment.
```

## Success Criteria

After each phase, verify:
- [ ] All TypeScript compiles without errors
- [ ] Docker containers start successfully
- [ ] API endpoints respond correctly
- [ ] WebSocket connections establish properly
- [ ] Audio files upload/download/play correctly
- [ ] Real-time updates work across browser tabs
- [ ] Mobile responsive design functions properly
- [ ] No console errors or warnings

## Additional AI Assistant Tips

### Context Preservation
Always include in prompts:
```
Use this exact project structure: [paste structure]
Maintain consistency with existing code patterns
Follow TypeScript strict mode requirements
Use existing utility functions where possible
```

### Integration Instructions
```
Integrate this new component with:
- Existing Zustand stores in src/store/
- API client in src/services/api.ts  
- WebSocket system in src/hooks/useWebSocket.ts
- Theme system in src/styles/themes.css
```

### Error Handling Template
```
Include comprehensive error handling for:
- Network failures and timeouts
- Invalid user input
- File upload/processing errors  
- Authentication/authorization issues
- Resource not found scenarios
```

This modular structure ensures clean separation of concerns, easy testing, and room for future scalability. Each module has a single responsibility and clear interfaces with other modules.