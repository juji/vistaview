#!/usr/bin/env bash
set -e

VERSION=$(node -p "require('./package.json').version")
npm deprecate vistaview@"<${VERSION}" "Deprecated: upgrade to v${VERSION} or later"
