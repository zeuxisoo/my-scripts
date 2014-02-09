#!/usr/bin/env python
# -*- coding: utf-8 -*-

import random
import re
import logging
import optparse
from motorise import Agent

class Mission(object):

    v2ex_url        = "http://www.v2ex.com"
    v2ex_signin_url = v2ex_url + "/signin"

    def __init__(self, username, password):
        self.get_agent()
        self.get_logger()

        self.username = username
        self.password = password

    def get_agent(self):
        user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
            'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:25.0) Gecko/20100101 Firefox/25.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.73.11 (KHTML, like Gecko) Version/7.0.1 Safari/537.73.11',
            'Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))',
        ]

        agent = Agent()
        agent.session.headers.update({
            'User-Agent': random.choice(user_agents),
            "Referer"   : self.v2ex_signin_url,
        })

        self.agent = agent

    def get_logger(self):
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.DEBUG)

        logger_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

        logger_stream_handler = logging.StreamHandler()
        logger_stream_handler.setLevel(logging.DEBUG)
        logger_stream_handler.setFormatter(logger_formatter)
        logger.addHandler(logger_stream_handler)

        self.logger = logger

    def work(self):
        self.signin(self.username, self.password)

        if self.is_over_login():
            self.debug(self.over_login_message())
        elif not self.has_screen_name():
            self.debug("Not found screen name")
        else:
            self.debug("Your screen name is {0}".format(self.screen_name()))

            if self.daily_mission():
                self.debug("You completed daily mission")
            else:
                self.debug("You can not complete daily mission")

    def signin(self, username, password):
        page = self.agent.get(self.v2ex_signin_url)

        form = page.form("form", index=1)
        form.action = self.v2ex_signin_url
        form.fields.update({
            'u': username,
            'p': password
        })
        self.signin_response = form.submit()

    def is_over_login(self):
        return self.signin_response.select("div.message")

    def over_login_message(self):
        return self.get_text(self.signin_response.select("div.message")[0])

    def has_screen_name(self):
        return self.signin_response.select("span.bigger a")

    def screen_name(self):
        return self.get_text(self.signin_response.select("span.bigger a")[0])

    def daily_mission(self):
        self.debug("Opening the daily mission page")
        page = self.agent.get("http://www.v2ex.com/mission/daily")

        self.debug("Finding the daily mission link")
        searches = re.search(r"'([^']*)", page.select("input.super.normal.button")[0].get("onclick"))

        if searches:
            mission_uri = searches.group(1)

            if mission_uri == "/balance":
                self.debug("You already completed daily mission")
            else:
                mission_link = "{0}{1}".format(self.v2ex_url, searches.group(1))

                self.debug("Opening the daily mission link")
                self.debug("==> {0}".format(mission_link))

                page = self.agent.get(mission_link)

                return re.findall(u'已成功领取每日登录奖励', page.html())
        else:
            self.debug("Cna not found daily mission link")

    def get_text(self, node_html):
        return node_html.text.encode("UTF-8").strip()

    def debug(self, message):
        self.logger.debug(message)

if __name__ == "__main__":
    parser = optparse.OptionParser(usage="Usage: %prog -u [USERNAME] -p [PASSWORD]")

    parser.add_option("-u", action="store", dest="username", help="Username")
    parser.add_option("-p", action="store", dest="password", help="Password")

    (options, args) = parser.parse_args()

    if options.username and options.password:
        mission = Mission(options.username, options.password)
        mission.work()
    else:
        parser.print_help()
