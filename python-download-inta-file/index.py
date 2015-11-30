#!/usr/bin/env python

import optparse
from peewee import InternalError
from inta.model import IntaFile
from inta.fetch import FetchList, FetchPage
from inta.output import OutputList

if __name__ == "__main__":
    parser = optparse.OptionParser(usage="Usage: %prog [options]")

    parser.add_option("--init", action="store_true", dest="init", help="init database")

    parser.add_option("--fetch", action="store", dest="fetch", help="fetch target user id data to database [list, page]")
    parser.add_option("--user_id", action="store", dest="user_id", help="target user id")

    parser.add_option("--output", action="store_true", dest="out", help="out image or video url to text file for download")

    (options, args) = parser.parse_args()

    if options.init:
        try:
            IntaFile.create_table()
            print("Success: database created")
        except InternalError as e:
            print("Error: {0}".format(e))
    elif options.fetch:
        if options.user_id is None:
            print("Error: Please enter user id")
        else:
            if options.fetch == "list":
                FetchList(user_id=options.user_id).run()
            elif options.fetch == "page":
                FetchPage().run()
    elif options.out:
        OutputList().run()
    else:
        parser.print_help()
