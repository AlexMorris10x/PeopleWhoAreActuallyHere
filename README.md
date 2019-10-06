# PWAAH

> People who are actually here

Dependencies
--------------------------------------------------

 * [Node.js][nodejs]
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
npm run bootstrap
```

### 4a. Development

```
source config.sh
npm start
```

### 4b. Production

```
source config.sh
npm run build
npm run prod
```

Production
--------------------

```
npm init
BUILD_DIR=<build_directory> npm run build
BUILD_DIR=<build_directory> npm run prod
```

License
--------------------

`AGPL-3.0-or-later`. See `COPYING`.
