const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const createJwt = (projectId, privateKeyFile, algorithm) => {
  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 86400 * 60, // 1 day
    aud: projectId
  };

  const privateKey = fs.readFileSync(path.join(__dirname, privateKeyFile));

  return jwt.sign(token, privateKey, { algorithm: algorithm });
};

module.exports = createJwt;
