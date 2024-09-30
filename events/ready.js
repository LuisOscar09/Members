const express = require('express');
const path = require('path');
const app = express();
const usersData = require('../src/models/Users.js');
const axios = require('axios');

// Serve static files from the 'views' folder
app.use(express.static(path.join(__dirname, '../views')));

// إعداد روت الصفحة الرئيسية
app.get('/', (req, res) => {
  res.send(`
  <body>
  <center><h1>Bot 24H ON!</h1></center>
  </body>`);
});

app.get('/login', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send('Authorization code not provided.');
  }

  try {
    const response = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: "https://sphenoid-wholesale-asparagus.glitch.me/login",
      scope: 'identify guilds.join',
    }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, refresh_token } = response.data;

    const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = userResponse.data;

    await usersData.findOneAndUpdate(
      { id: userData.id },
      {
        accessToken: access_token,
        refreshToken: refresh_token,
        email: userData.email,
      },
      { upsert: true }
    );

    // Send the success HTML file
    res.sendFile(path.join(__dirname, '../views/login-success.html'));
  } catch (error) {
    console.error('Error during OAuth process:', error);
    res.send('حدث خطأ أثناء عملية.');
  }
});

module.exports = {
  name: 'ready',
  execute(client) {
    const listener = app.listen(process.env.PORT || 2000, () => {
      console.log('Your app is listening on port ' + listener.address().port);
    });

    console.log(`${client.user.username} Is Online !`);
    console.log("I'm Ready To Work..! 24H");
  },
};
