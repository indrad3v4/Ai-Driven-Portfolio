
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * TRIZ PRINCIPLE #10: Preliminary Action
 * Pre-configure the build pipeline to ensure assets are correctly
 * segmented and moved from Source (public) to Distribution (dist).
 */
export default defineConfig({
  plugins: [react()],
  // Explicitly define the public directory to ensure copying
  publicDir: 'public',
  build: {
    // Ensure this matches the "public" setting in firebase.json
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
  },
  server: {
    // handle fallback for SPA in dev mode
    historyApiFallback: true,
  }
});
