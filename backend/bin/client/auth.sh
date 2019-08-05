#!/usr/bin/env sh

TOKEN=$1

echo $TOKEN

curl -XPOST localhost:5000/auth \
     -H 'Content-Type: application/json' \
     -d "{ \"token\": \"$TOKEN\" }"
