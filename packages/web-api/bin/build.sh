#!/usr/bin/env dash

SCRIPT_PATH=`dirname "$0"`;
SCRIPT_PATH=`eval "cd \"$SCRIPT_PATH\" && pwd"`

if [ -z "${BUILD_DIR}" ]; then
    echo "missing environment variable BUILD_DIR" >&2
    exit 1
fi

# install npm modules if necessary
if [ -z "${SCRIPT_PATH}/../node_modules" ]; then
    (cd "${SCRIPT_PATH}/.."; npm install)
fi

PATH=$SCRIPT_PATH/../node_modules/.bin:$PATH

API_BUILD_DIR="${BUILD_DIR}/web-api"
rm -rf "${API_BUILD_DIR}"
mkdir -p "${API_BUILD_DIR}"

cp -r $SCRIPT_PATH/../* "${API_BUILD_DIR}"
