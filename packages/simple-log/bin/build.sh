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

(
    cd "${SCRIPT_PATH}/.."
    react-scripts build
    if [ -z "build" ]; then echo "react-sc" >&2; exit 1; fi
)

SIMPLE_LOG_BUILD_DIR="${BUILD_DIR}/simple-log"
rm -rf "${SIMPLE_LOG_BUILD_DIR}"
mkdir -p "${SIMPLE_LOG_BUILD_DIR}"

mv $SCRIPT_PATH/../build/* "${SIMPLE_LOG_BUILD_DIR}"
rm -r $SCRIPT_PATH/../build
