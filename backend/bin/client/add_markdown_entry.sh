#!/usr/bin/env sh

JWT="$1"
MARKDOWN="$2"

curl -XPOST "localhost:5000/entries?jwt=$JWT" \
     -H 'Content-Type: application/json' \
     -d "{ \"contents\": [ { \"type\": \"markdown\", \"markdown\": \"$MARKDOWN\" } ] }"
