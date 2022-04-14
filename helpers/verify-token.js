const jwt = require('jsonwebtoken');
const getToken = require('./get-token');

const verifyToken = (req, res, next) => {
  if(!req.headers.authorization) {
    return res.status(401).json({ message: "access denied." });
  };
  const token = getToken(req);

  if(!token) {
    return res.status(401).json({ message: "access denied."} );
  };

  try {
    const verified = jwt.verify(token, "oursecret");
    req.user = verified;
    next();
  } catch(err) {
    return res.status(400).json({ message: "invalid token"} );
  };
};

module.exports = verifyToken;