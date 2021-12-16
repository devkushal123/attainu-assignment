const config = {
    mongo: {
        options: {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            socketTimeoutMS: 30000,
            keepAlive: true,
            // poolSize: 50,
            autoIndex: false,
            retryWrites: false
        },
        url: 'mongodb://localhost:27017/attainu' //database name
    },
    server: {
        host: 'localhost',
        port: 8000
    }
};

module.exports = config;
