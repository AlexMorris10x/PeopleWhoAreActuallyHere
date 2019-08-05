const crypto = require('crypto');

module.exports = class TokenGen {
  /*
     - refreshIntervalMs: how often to refresh the token (in ms)
     - tokenCacheTTL: how long should we keep tokens in the cache? (in ms)
  */
  constructor(refreshInterval=(60 * 1000), tokenCacheTTL=(4 * 60 * 1000)) {
    // the amount of time before we kick off our token interval. We
    // sync to *the nearest minute* and rely on NTP to set the time
    // on our clients & servers.
    this.refreshInterval = refreshInterval;
    this.tokenCacheTTL = tokenCacheTTL;

    this.token_utc_time = null;

    this.cachedTokens = {};
  }

  /*
     Start the token generation. Resolves once we're "on the minute"
  */
  async start() {
    // @TODO maybe consider using `getMilliseconds()`?
    const waitBeforeStart = (60 - new Date().getSeconds()) * 1000;

    const updateTime = () => {
      // bump the time down to the latest minute.
      this.token_utc_time = new Date(new Date().getTime()).setSeconds(0, 0);
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        updateTime();
        this.tokenInterval = setInterval(updateTime, this.refreshIntervalMs);
        resolve();
      }, waitBeforeStart);
    });
  }

  async stop() {
    this.token_utc_time = null;
    clearInterval(this.tokenInterval);
  }

  /*
     Generates a new token & returns it while also adding it to the cache.

     A very stateful function. :)
  */
  generateToken(key) {
    const shasum = crypto.createHash('sha1').update(`${this.token_utc_time}${key}`);
    const token = shasum.digest('hex');

    if (typeof this.cachedTokens[key] === 'undefined') {
      this.cachedTokens[key] = [];
    }

    if (!this.cachedTokens[key].includes(token)) {
      this.cachedTokens[key].unshift(token);
      setTimeout(() => this.cachedTokens[key].pop(), this.tokenCacheTTL);
    }

    return token;
  }

  /*
     Gets the cached tokens for the given key.
  */
  getTokens(key) {
    return this.cachedTokens[key];
  }
}

global.TokenGen = module.exports;
