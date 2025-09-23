# AI Development Rules

This document outlines the technical stack and development conventions for this application. Adhering to these rules ensures consistency, maintainability, and simplicity in the codebase.

## Tech Stack

The application is built with a modern, lightweight tech stack:

- **Framework**: React 19 with TypeScript for building a type-safe and component-based user interface.
- **Build System**: Vite provides a fast development server and an optimized build process.
- **Styling**: Tailwind CSS is used exclusively for styling. All styles should be implemented using its utility classes.
- **AI Backend**: The Google Gemini API (`@google/genai`) is the sole provider for all generative AI features, including image generation and editing.
- **State Management**: State is managed primarily with React's built-in hooks (`useState`, `useEffect`). The custom `useLocalStorage` hook is used for persisting data in the browser.
- **File Processing**: The `JSZip` library is used for creating and downloading `.zip` archives.
- **Icons**: Icons are managed as individual React components within `src/components/Icons.tsx`.
- **Application Type**: The project is a Single Page Application (SPA) where navigation is handled by internal state, not a routing library.

## Library and Convention Rules

To maintain a clean and predictable codebase, please follow these rules when adding or modifying features:

### UI Components
- **Primary Library**: **Always** use `shadcn/ui` components for common UI elements like buttons, modals, inputs, etc. The necessary components are pre-installed.
- **Custom Components**: If a suitable `shadcn/ui` component does not exist, create a new, small, single-purpose component in the `src/components/` directory.
- **Styling**: Style all components exclusively with Tailwind CSS utility classes. Do not add custom CSS files or use other styling methodologies.

### State Management
- **Local State**: Use `useState` and `useReducer` for component-level state.
- **Shared State**: For simple state shared between a few components, use React Context.
- **Persisted State**: Use the existing `useLocalStorage` hook for any data that needs to be saved across browser sessions.
- **Avoid**: Do not introduce complex state management libraries like Redux, MobX, or Zustand unless the application's complexity grows significantly and it is explicitly requested.

### Icons
- **Source**: All new icons should be sourced from the `lucide-react` package.
- **Implementation**: To maintain consistency, import the desired `lucide-react` icon into `src/components/Icons.tsx` and re-export it as a new component, following the existing pattern.

### Forms
- **Simple Forms**: Use controlled components with `useState` for handling simple forms.
- **Complex Forms**: If a form requires complex validation or state management, `react-hook-form` is the preferred library.

### API and Data Fetching
- **Service Layer**: All interactions with external APIs (including the Gemini service) must be encapsulated within the `src/services/` directory.
- **HTTP Client**: Use the native `fetch` API for making network requests. Do not add external libraries like `axios`.

### File Handling
- **Zipping**: Continue to use `JSZip` for all functionalities related to creating ZIP archives.
- **Utilities**: Use the helper functions in `src/utils/fileUtils.ts` for common file operations like Base64 conversion.