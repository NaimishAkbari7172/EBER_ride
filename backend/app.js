const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors') 
const {job}= require('./utils/cron')

require('./database/db')
const http= require('http');
const server= http.createServer(app);

app.use(cors());


const initSocket= require('./utils/socket');

require('dotenv').config({ path: "./.env" });

const PORT = process.env.PORT || 4000;
app.use(bodyParser.json());

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept,Authorization"
//     );
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
//     next();
// });

const loginRoutes = require("./routes/adminLogin");
const registerRoutes = require("./routes/adminSignin");
const updateRoutes = require('./routes/adminUpdate');
const deleteRoutes = require('./routes/adminDelete');
const fetchRoutes = require("./routes/adminFetch");
const vehicleRoutes = require('./routes/vehicle');
const countryRoutes = require('./routes/country');
const cityRoutes = require('./routes/city');
const userRoutes = require('./routes/user');
const pricingRoutes = require('./routes/vehiclepricing');
const settingRoutes = require('./routes/setting');
const driverRoutes = require('./routes/driver');
const createrideRoutes = require('./routes/createride');
const confirmrideRoutes = require('./routes/confirmride');
const ridehistoryRoutes = require('./routes/ridehistory');
const feedbackRoutes = require('./routes/feedback');
const stripeApp = require('./utils/stripe');
const notificationRoutes = require('./utils/push-notification');
const driverApiRoutes = require('./routes/driverApi');

app.use("/", express.static(__dirname + '/public/vehicle'));
app.use("/user", express.static(__dirname + '/public/user'));

app.use(loginRoutes);
app.use(registerRoutes);
app.use(updateRoutes);
app.use(deleteRoutes);
app.use(fetchRoutes);
app.use(vehicleRoutes);
app.use(countryRoutes);
app.use(cityRoutes);
app.use(userRoutes);
app.use(pricingRoutes);
app.use(settingRoutes);
app.use(driverRoutes);
app.use(createrideRoutes);
app.use(confirmrideRoutes);
app.use(ridehistoryRoutes);
app.use(feedbackRoutes);
app.use(stripeApp)
app.use(notificationRoutes)
app.use(driverApiRoutes)

app.get('*', (req, res) => {
    res.status(500).json({message:"Server-side : Requested URL not found"});
});


initSocket(server);

server.listen(PORT, () => {
    console.log(`server is running on : ${PORT}`);
})