const path = require('path');

exports.index = (qrWebDirectory) => (req, res) => {
  res.sendFile(path.join(qrWebDirectory, 'index.html'))
};
