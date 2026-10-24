import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves from a sub-path, so the app must be built with a base
// URL that matches the repo name. Change this if the repo is ever renamed.
export default defineConfig({
  base: '/orbit-globe/',
  plugins: [react()],
});