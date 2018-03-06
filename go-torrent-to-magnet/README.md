# Torrent 2 Magent

A golang version torrent 2 magent program

## Installation

Download the `dep` tools

    brew install dep
    
Create project directory

	mkdir -p ~/path/to/project/src/github.com/zeuxisoo/tr2mg
	cd ~/path/to/project/src/github.com/zeuxisoo/tr2mg
	export GOPATH= ~/path/to/project
	
Copy project files to this directory

	cp -Rf my-scripts/go-torrent-to-magent/* .

Install the dependencies

    dep ensure

## Usage

Development

    go run main.go [PATH]

Production

    ./tr2mg [PATH]
