module.exports = {
    database: {
      url: "mongodb://127.0.0.1:27017/eGarage",
    },
    whitelist:["http://localhost:8080", "https://localhost:8081"],
    serverType: 'DEV',
    appConfig: {
      port: 3000,
      redis: { HOST: "localhost", PORT: 6379 },
    },
  };

  