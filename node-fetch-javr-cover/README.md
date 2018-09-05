# Fetch Javr Cover

A script for user to download the target cover image from specified website by folder name

## Installation

Install the vendors

    npm install

Copy and edit the config

    cp config.json.example config.json

    perl -i -pe 's#https://domain.com#https://yourDomain.com#g' config.json

## Usage

First, You must ensure cover directory looks like the following structure

    .
    ├── ABC-001
    │   └── ABC-001.txt
    ├── ABC-002
    │   ├── ABC-002.txt
    │   ├── ABC-001.dat
    │   └── ABC-001.cab
    ├── ABC-003
    ├── ABC-004
    └── ABC-005

If all should be fine, ran the command, it will automatically find and download the cover to each library directory

    node index.js /path/to/your/parent/cover/directory
