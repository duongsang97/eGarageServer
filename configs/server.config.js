module.exports = {
    database: {
      //url: "mongodb://127.0.0.1:27017/eGarage",
      url: "mongodb+srv://sangdt:Lx8AfgxlvT7KtX4E@atlascluster.k97xz.mongodb.net/?retryWrites=true&w=majority",
    },
    whitelist:["http://localhost:8080", "https://localhost:8081"],
    serverType: 'DEV',
    appConfig: {
      port: 80,
      redis: { HOST: "localhost", PORT: 6379 },
    },
  };

