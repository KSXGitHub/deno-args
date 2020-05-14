#! /bin/sh
set -o errexit -o nounset
prefix=https://github.com/KSXGitHub/sane-fmt/releases/download
wget -O /bin/sane-fmt "$prefix/$SANE_FMT_VERSION/sane-fmt-x86_64-unknown-linux-gnu"
chmod +x /bin/sane-fmt
