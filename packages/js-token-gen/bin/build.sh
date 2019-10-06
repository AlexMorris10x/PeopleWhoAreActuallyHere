#!/usr/bin/env dash

SCRIPT_PATH=`dirname "$0"`;
SCRIPT_PATH=`eval "cd \"$SCRIPT_PATH\" && pwd"`

if [ -z "${BUILD_DIR}" ]; then
    echo "missing environment variable BUILD_DIR" >&2
    exit 1
fi

GEN_BUILD_DIR="${BUILD_DIR}/js-token-gen"
rm -rf "${GEN_BUILD_DIR}"
mkdir -p "${GEN_BUILD_DIR}"

cp -r $SCRIPT_PATH/../* "${GEN_BUILD_DIR}"
