package main

import (
    "os"
    "fmt"
    "io/ioutil"
    "path/filepath"
    "strings"

    "github.com/anacrolix/torrent/metainfo"
)

func main() {
    //
    args := os.Args

    if len(args) < 2 {
        fmt.Fprintln(os.Stderr, "Error, Please provide torrent folder path like: ./PROGRAM PATH")
        os.Exit(1)
    }

    //
    torrent_folder := os.Args[1]

    files, err := ioutil.ReadDir(torrent_folder)
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error, Cannot read the files in torrent folder path (%s)\n", err)
         os.Exit(1)
    }

    //
    fmt.Printf("Folder: %s\n", torrent_folder)
    fmt.Printf("Centerating ... ....\n\n")

    //
    var full_path string
    var magnet_links []string

    for _, f := range files {
        if (f.IsDir() == false && filepath.Ext(f.Name()) == ".torrent") {
            full_path = filepath.Join(torrent_folder, f.Name())

            mi, err := metainfo.LoadFromFile(full_path)
            if err != nil {
                fmt.Fprintf(os.Stderr, "Error, Cannot read the metainfo from file (%s)\n", err)
                continue
            }

            info, err := mi.UnmarshalInfo()
            if err != nil {
                fmt.Fprintf(os.Stderr, "Error, Cannot unmarshalling the metainfo from file (%s)\n", err)
                continue
            }

            magnet_links = append(magnet_links, mi.Magnet(info.Name, mi.HashInfoBytes()).String())
        }
    }

    fmt.Println(strings.Join(magnet_links, "\n\n"))
}
