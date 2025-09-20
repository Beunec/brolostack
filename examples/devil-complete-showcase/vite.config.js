// Simple JavaScript configuration to avoid TypeScript module resolution issues
// In a real project, you would use TypeScript and proper imports

const defineConfig = (config) => config;

export default defineConfig({
  plugins: [
    // react(), // Would be enabled in a real project
    // Note: Devil plugin would be enabled in production
    // brolostackDevilVitePlugin({ protectionLevel: 'devil' })
  ],
  build: {
    sourcemap: false, // Disable source maps for maximum protection
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: {
        toplevel: true
      }
    }
  },
  server: {
    port: 3000,
    host: true
  },
  resolve: {
    alias: {
      // Alias for local development
      'brolostack': '../../src/index.js'
    }
  }
});
