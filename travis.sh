#!/bin/bash
set -ev
if [ "${TEST_SUITE}" = "tests" ]; then
  export CHROME_BIN=/usr/bin/google-chrome
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sudo apt-get update
  sudo apt-get install -y libappindicator1 fonts-liberation
  wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  sudo dpkg -i google-chrome*.deb
	gulp test
else
  gulp lint
  gulp build-release
  npm run dist
fi
