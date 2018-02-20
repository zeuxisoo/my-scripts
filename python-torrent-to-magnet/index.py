#!/usr/bin/env python3
# coding: utf-8

import sys
import os
import bencodepy
import hashlib
import base64

def generate_magnet_from_file(file) :
    meta_data     = bencodepy.decode_from_file(file)
    meta_info     = meta_data[b'info']
    meta_announce = meta_data[b'announce']

    hash_contents = bencodepy.encode(meta_info)
    digest        = hashlib.sha1(hash_contents).digest()
    b32hash       = base64.b32encode(digest).decode()

    return "magnet:?xt=urn:btih:{0}&dn={1}&tr={2}".format(
        b32hash,
        meta_info[b'name'].decode(),
        meta_announce.decode()
    )

def t2m(folder):
    magents = []

    for file in os.listdir(folder):
        full_file_path = os.path.join(folder, file)

        magents.append(generate_magnet_from_file(full_file_path))

    return magents

if __name__ == "__main__":
    magents = t2m(folder=sys.argv[1])

    print("\n".join(magents))
