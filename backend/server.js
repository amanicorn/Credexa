require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Add basic request logging directly in server.js
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

connectDB();

const PORT = process.env.PORT;

app.listen(PORT, () => {    
    console.log("Server is running on port " + PORT);
});
