#!/usr/bin/env sh

SCRIPT_PATH=`dirname "$0"`; SCRIPT_PATH=`eval "cd \"$SCRIPT_PATH\" && pwd"`

rm -rf build;
mkdir -p build;

(
    cd build;
    cp -r $SCRIPT_PATH/../src/* .

    $SCRIPT_PATH/../node_modules/.bin/browserify $SCRIPT_PATH/../../shared-js/TokenGen.js > ./lib/TokenGen.js
)
