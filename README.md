# PWAAH

> People who are actually here

```
> What is this project?

It's a demo of the idea: "how can we
ensure that only people at a location
can participate in an online community?"

The name "people who are actually
here (PWAAH)" is a joke, but one
that drives that point home...

> What does it do?

It ensures that only folks who have been to
a particular location can gain access to
something. Currently that means some hacked
together frontend chat-thing, but it can be
anything really.

> How does one use it?

Find a PWAAH QR code (/link), scan it, and
authenticate with whatever PWAAH server it's
associated with. The server owner can determine
what lives behind the authentication.

```

Dependencies
--------------------------------------------------

 * [Node.js][node]
 * [Dash][dash]

[node]: https://en.wikipedia.org/wiki/Nodejs
[dash]: https://en.wikipedia.org/wiki/Almquist_shell

Setup
--------------------------------------------------

### 0. Configure `config.sh`

In this top-level directory, there is a default "config.sh" script
that you can modify as you wish.


### 1. Generate RSA Keys

```
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout > keys/public.pem
```

### 2. Create secrets file

```
mkdir -p keys
echo "some-secret-here" > keys/token.keys
```

### 3. Install dependencies

```
npm install
npm run bootstrap
```

### 4. Start
if on mac os
```
brew install coreutils 
```

#### Development

```
source config.sh
npm start
```

#### Production

```
source config.sh
npm run build
npm run prod
```

License
--------------------

`AGPL-3.0-or-later`. See `COPYING`.
