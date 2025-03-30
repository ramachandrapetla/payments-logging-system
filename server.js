const app = require('./src/app');
require('./src/cronJobs/cronJob');
require('dotenv').config();

app.listen(4000, () => {console.log('Payment-api listening on port 5000')})