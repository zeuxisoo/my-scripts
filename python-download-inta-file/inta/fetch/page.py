import requests
from queue import Queue
from time import sleep
from bs4 import BeautifulSoup
from ..model import IntaFile

class FetchPage(object):

    def __init__(self):
        self.queue = Queue()

    def page_type(self, soup):
        if len(soup.select(".item-media-mg img")) <= 0:
            return "video"
        else:
            return "image"

    def fetch(self):
        while not self.queue.empty():
            inta = self.queue.get()

            print("\nInta id: {0} - {1}".format(inta.id, inta.inta_id))

            page_url = "http://sharetagram.com/m/{0}".format(inta.inta_id)
            response = requests.get(page_url, headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
            })

            if response.status_code != 200:
                print("====> Error !! Status code : {0} ----> put back inta".format(response.status_code))
                self.queue.put(inta)
            else:
                html = response.text
                soup = BeautifulSoup(html, 'html.parser')

                if self.page_type(soup) != inta.type:
                    print("====> Error !! type not equals ----> put back inta".format(response.status_code))
                    self.queue.put(inta)
                else:
                    if self.page_type(soup) == "image":
                        src = soup.select(".item-media-mg img")[0]['src']

                        inta.image     = src
                        inta.has_video = False

                        print("====> type : image")
                        print("====>  src : {0}".format(src))
                    else:
                        src = soup.select(".item-media-mg video source")[0]['src']

                        inta.image     = src
                        inta.has_video = True

                        print("====> type : video")
                        print("====>  src : {0}".format(src))

                    inta.save()

                sleep(1)

    def run(self):
        for inta in IntaFile.select().where( (IntaFile.image == "") | (IntaFile.image == None) ).where( (IntaFile.video == "") | (IntaFile.video == None) ):
            self.queue.put(inta)

        self.fetch()
