const QRCode = require('./lib/qrcode');
const TokenGen = require('js-token-gen');

(function() {
  const token_key = prompt('token key?');

  const tokenGen = new TokenGen();

  tokenGen.start().then(() => {
    const draw = () => {
      const $qr = document.querySelector("#qrcode");

      const token = tokenGen.generateToken(token_key);
      const url = `http://peoplewhoareactuallyhere.com/t/${token}`;

      document.querySelector('#url-display').innerHTML = `<a href="${url}">${url}</a>`;

      $qr.innerHTML = '';
      new QRCode($qr, { text: url, width: 400, height: 400 });
    }

    draw();
    setInterval(draw, 10000); // @TODO: make token gen an event emitter, 'on time change', etc.
  });

  document.querySelector('#content').style.display = 'flex';

})();
