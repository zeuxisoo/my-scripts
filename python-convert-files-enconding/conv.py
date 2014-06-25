#!/usr/bin/env python
# -*- coding: utf-8 -*-.

import sys
import os

class Conv(object):
    def __init__(self):
        if len(sys.argv) < 2:
            print("Usage: python conv.py [PATH]")
            sys.exit(0)
        else:
            self.folder = sys.argv[1]
        
    def run(self):
        for f in os.listdir(self.folder):
            full_path = os.path.join(self.folder, f)
            if os.path.isfile(full_path) and full_path.endswith((".cgi", ".txt")):
                self.convert(full_path)

    def convert(self, file_path):
        print("File Path: {0}".format(file_path))
    
        encodings       = ('windows-1253', 'iso-8859-7', 'cp950', 'big5')
        file_content    = open(file_path, 'r').read()
        decoded_content = None
        
        for enconding_name in encodings:
            try:
                decoded_content = file_content.decode(enconding_name)
                print("--> encode {0}".format(enconding_name))
                break
            except:
                if enconding_name == encodings[-1]:
                    print("--> encode Fail")
                    
        if decoded_content:
            f = open(file_path, 'w')
            try:
                f.write(decoded_content.encode("UTF-8"))
                print("--> convert OK")
            except Exception, e:
                print("--> convert Fail")
            finally:
                f.close()

if __name__ == "__main__":
    Conv().run()