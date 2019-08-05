#!/usr/bin/env sh

JWT="$1"

curl -XGET "localhost:5000/entries?jwt=$JWT"
