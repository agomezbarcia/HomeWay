/* VUE CONFIG FOR DEVELOPMENT SERVER */

module.exports = {  
  // Define base path for the app
  publicPath: process.env.FRONTEND_BASEPATH || '',

  // Development server configuration
  devServer: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: process.env.FRONTEND_PORT || 8089, // Customizable port
    hot: true, // Enable Hot Module Replacement
    https: false, // Use HTTP
    allowedHosts: 'all', // Allow all hosts
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws' // WebSocket URL for HMR client
    }
  },

  // Webpack configuration overrides
  configureWebpack: config => {
    // Watch options for file changes
    config.watchOptions = {
      poll: 3000, // Check for changes every 3 seconds
      aggregateTimeout: 500, // Delay before rebuilding
      ignored: ['files/**/*.js', 'node_modules/**'] // Ignore these paths
    };
  },

  // CSS loader options
  css: {
    loaderOptions: {
      // SCSS global imports
      scss: {
        additionalData: `@import "@/assets/scss/custom.scss";`
      },
      // SASS global imports
      sass: {
        additionalData: `@import "@/assets/scss/custom.scss";`
      }
    }
  }
}