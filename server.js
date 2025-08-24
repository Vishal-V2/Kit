// server.js
const express = require('express');
// const mongoose = require('mongoose'); // COMMENTED OUT: MongoDB dependency removed
const dotenv = require('dotenv');
const scrapeRoute = require('./routes/scrapeRoute');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/scrape', scrapeRoute);

const detectRoute = require('./routes/detectRoute');
app.use('/api/detect', detectRoute);

const factCheckRoute = require('./routes/factCheckRoute');
app.use('/api/factcheck', factCheckRoute);

const imageDetectRoute = require('./routes/imageDetectRoute');
app.use('/api/image-detect-ai', imageDetectRoute);

const summarizeRoute = require('./routes/summarizeRoute');
app.use('/api/summarize', summarizeRoute);

const qaRoute = require('./routes/qaRoute');
app.use('/api/qa', qaRoute);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const sentimentRoute = require('./routes/sentimentRoute');
app.use('/api/sentiment', sentimentRoute);

// COMMENTED OUT: MongoDB connection removed to bypass dependency
/*
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
        console.log("Server is running at port " + process.env.PORT);
    });
}).catch(err => console.log(err));
*/

// DIRECT SERVER START: Bypass MongoDB and start server directly
console.log("Starting server without MongoDB dependency...");
app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running at port " + (process.env.PORT || 5000));
    console.log("MongoDB dependency bypassed - running in stateless mode");
});
