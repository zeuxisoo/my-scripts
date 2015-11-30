from os import path
from .model import IntaFile

class OutputList(object):

    def __init__(self):
        dirname = path.dirname

        self.storage_path     = path.join(dirname(dirname(__file__)), 'storage')
        self.output_list_file = path.join(self.storage_path, 'output-list.txt')

    def run(self):
        with open(self.output_list_file, 'w+') as f:
            for inta in IntaFile.select():
                if inta.image is not None and inta.image != '':
                    url = inta.image
                else:
                    url = inta.video

                f.write(url + "\n")
