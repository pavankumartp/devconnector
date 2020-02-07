const express = require('express');
const app = express();
const log = console.log;

const PORT = process.env.PORT || 5000;

const connectDB = require('./config/db');
connectDB();

app.use(express.json({extended: false}));
app.get("/", (req, res)=>{
    res.send('API running');
})

app.use('/api/users', require("./routes/api/users"));
app.use('/api/auth', require("./routes/api/auth"));
app.use('/api/posts', require("./routes/api/posts"));
app.use('/api/profile', require("./routes/api/profile"));

app.listen(PORT, ()=>{
    log(`Server started on port ${PORT}`);
});