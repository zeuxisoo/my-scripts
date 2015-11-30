import requests
from time import sleep
from datetime import datetime
from dateutil.relativedelta import relativedelta
from ..model import IntaFile

class FetchList(object):

    def __init__(self, user_id=None):
        self.id_done = False
        self.user_id = user_id

    def convert_created_time(self, created_time):
        suffix = created_time[-1]
        number = int(created_time[:-1])

        now = datetime.now()

        if suffix == "h":
            return now + relativedelta(hours=-number)
        elif suffix == "d":
            return now + relativedelta(days=-number)
        elif suffix == "m":
            return now + relativedelta(months=-number)
        elif suffix == "w":
            return now + relativedelta(weeks=-number)
        elif suffix == "y":
            return now + relativedelta(years=-number)
        else:
            raise Exception('Can not convert {0}'.format(created_time))

    def fetch(self, max_id=None):
        if self.id_done:
            print("Done !!!")
            return

        params = {
            'endpoint': 'user_recent',
            'param'   : self.user_id,
            'max_id'  : max_id
        }

        response = requests.get("http://sharetagram.com/media", params=params)

        if response.status_code != 200:
            sleep(2); self.fetch(max_id)
        else:
            response = response.json()

            if response['code'] != 200:
                print(" Error! max id : {0}, status code : {1} ----->> re-fetch".format(max_id, response['code']))

                sleep(2); self.fetch(max_id)
            else:
                print("Current max id : {0}".format(max_id))
                print("   Next max id : {0}".format(response['max_id']))

                rows = []
                for data in response['data']:
                    rows.append({
                        'inta_id'       : data['id'],
                        'comments_count': data['comments_count'],
                        'has_video'     : data['has_video'],
                        'cover'         : data['image'],
                        'likes_count'   : data['likes_count'],
                        'type'          : data['type'],
                        'user_id'       : data['user_id'],
                        'username'      : data['user_name'],
                        'created_time'  : self.convert_created_time(data['created_time']),
                    })

                IntaFile.insert_many(rows).execute()

                if len(response['max_id']) <= 0:
                    self.id_done = True

                sleep(1)
                self.fetch(response['max_id'])

    def run(self):
        self.fetch()
