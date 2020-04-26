#!/bin/bash

if [ -z "$EXECUTABLE_FACTORY_TAG" ]; then
  echo 'Missing variable EXECUTABLE_FACTORY_TAG' > /dev/stderr
  exit 1
fi

prefix=https://github.com/KSXGitHub/executable-factory/releases/download
url=$prefix/"$EXECUTABLE_FACTORY_TAG"/prettier
echo "Downloading from $url to /bin/prettier"
curl -fsSL "$url" > /bin/prettier || exit $?
chmod a+x /bin/prettier
