# Inta

## Installation

Create virtual env

    make env

Install requirements

    make install

Create database

    make database

## Usage

Fetch user photo list and save to database (target page url)

    python index.py --fetch=list --user_id=[USER_ID]

Fetch each photo page from fetched photo list (target large image or video url)

    python index.py --fetch=page

Ouput download list to text file for aria2c to download

    python index.py --output

Download the files from output list

    cd storage/ && aria2c -i output-list.txt -j5 && cd -
