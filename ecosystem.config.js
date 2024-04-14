module.exports = {
    apps : [{
      name: "gotruBE",
      script: "src/index.ts",
      watch: true,
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }]
  };
  