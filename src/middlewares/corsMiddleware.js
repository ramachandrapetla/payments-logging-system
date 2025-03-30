const cors = require('cors');

const allowedOrigins = ['http://localhost:3000'];

const corsOptions = {
    origin: (origin, callback) => {
        if(!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not Allowed by CORS'));
        }
    }
}

module.exports = cors(corsOptions);