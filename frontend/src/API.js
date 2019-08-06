class API {

  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async authenticate(token) {
    const res = await fetch(`${this.baseURL}/auth`, {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' }
    });

    return await res.json();
  }

  async getEntries(jwt) {
    const res = await fetch(`${this.baseURL}/entries?jwt=${jwt}`, {
      method: 'GET'
    });

    return await res.json();
  }

  /**
     curl -XPOST "localhost:5000/entries?jwt=$JWT" \
     -H 'Content-Type: application/json' \
     -d "{ \"contents\": [ { \"type\": \"markdown\", \"markdown\": \"$MARKDOWN\" } ] }"
   */
  async addEntry(jwt, markdown) {
    const res = await fetch(`${this.baseURL}/entries?jwt=${jwt}`, {
      method: 'POST',
      body: JSON.stringify({
        contents: [
          { type: "markdown", markdown }
        ]
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    return await res.json();
  }

}

export default API
