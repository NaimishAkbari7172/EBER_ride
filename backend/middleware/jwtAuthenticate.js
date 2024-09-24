const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // const token = authHeader ;
  const token = authHeader && authHeader.split(' ')[1];
  // console.log("token is ~~~~ " + token)
  // console.log("authheader is ~~~~ " + authHeader)

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) {
      console.log(err)
      return res.sendStatus(403)
    };
    // console.log(user)
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
