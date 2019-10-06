#!/usr/bin/env dash

# Paths to an RSA keypair
export PRIVATE_RSA_PEM=$(realpath keys/private.pem)
export PUBLIC_RSA_PEM=$(realpath keys/public.pem)

# shared secrets file
export TOKEN_KEYS=$(realpath keys/token.keys)

# where should we build the project?
export BUILD_DIR=/tmp/pwaah

# where should we store persistent data for the project?
export DATA_DIR=$(realpath data)
