from peewee import MySQLDatabase, Model
from peewee import CharField, IntegerField, BooleanField, DateTimeField

db = MySQLDatabase('inta', user='root', charset='utf8mb4')
db.connect()

class BaseModel(Model):
    class Meta:
        database = db

class IntaFile(BaseModel):
    inta_id        = CharField(max_length=50, index=True)
    comments_count = IntegerField(null=True)
    has_video      = BooleanField(default=False)
    cover          = CharField(max_length=200)
    image          = CharField(max_length=200, null=True)
    video          = CharField(max_length=200, null=True)
    likes_count    = IntegerField(null=True)
    type           = CharField(max_length=20)
    user_id        = IntegerField(null=True)
    username       = CharField(max_length=50)
    created_time   = DateTimeField()
