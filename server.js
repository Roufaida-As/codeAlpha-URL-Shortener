const express = require('express');
const app = express();
const dotenv = require("dotenv");
const mongoose = require('mongoose')
const urlRouter = require('./routes/url_router')
const userRouter = require('./routes/user_router')
const path = require('path');



dotenv.config({ path: './config.env' })
port = process.env.port

//add request body to request object(middleware)
app.use(express.json())


// Serve static files from the "img" folder
//in order to access those images from the frontend
//app.use('/img', express.static(path.join(__dirname, 'img')));


mongoose.connect(process.env.CONN_STR).then(() => {
    console.log('DB connected successfully')
}).catch((error) => {
    console.log(error)
})

app.use("/urls", urlRouter)
app.use('/', userRouter)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
