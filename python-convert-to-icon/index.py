#!/usr/bin/env python
# coding: utf-8

import os
import requests
import optparse

class ICOConverter(object):

    url = 'http://www.icoconverter.com/index.php'

    def __init__(self, file, sizes=(16, 32, 48, 64, 128, 256), bpp=32):
        self.file  = file
        self.sizes = sizes
        self.bpp   = bpp

    def convert(self):
        if not os.path.exists(self.file):
            print('Can not found the file: {0}'.format(self.file))
        else:
            filename = os.path.splitext(os.path.basename(self.file))[0]
            iconfile = os.path.join(os.path.dirname(self.file), '{0}.ico'.format(filename))

            files = { 'image': open(self.file, 'r') }
            data  = { 'sizes[]': self.sizes, 'bpp': 32 }

            r = requests.post(self.url, files=files, data=data)

            if r.status_code == 200:
                with open(iconfile, 'w') as f:
                    f.write(r.content)
                    f.close()

                print('Converted to {0}'.format(iconfile))
            else:
                print('Can not covert to ico file')

if __name__ == '__main__':
    parser = optparse.OptionParser(usage="Usage: %prog -f [FILE]")

    parser.add_option("-f", "--file", action="store", dest="file", help="Which image file want to convert to ico")

    (options, args) = parser.parse_args()

    if options.file:
        ICOConverter(options.file, sizes=(16, 32, 48), bpp=32).convert()
    else:
        parser.print_help()
