#!/usr/bin/env python
# coding:utf-8

import re
import random
import requests

# Account data
username = ''
password = ''

# Custom request information
user_agents = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36",
    "Mozilla/5.0 (Macintosh; U; PPC Mac OS X; fr) AppleWebKit/416.12 (KHTML, like Gecko) Safari/412.5",
    "Mozilla/5.0 (Windows NT 6.1; rv:15.0) Gecko/20120819 Firefox/15.0 PaleMoon/15.0",
    "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; GTB6; Acoo Browser; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
    "Mozilla/5.0 (Windows; U; Windows NT 5.1; pt-BR) AppleWebKit/534.12 (KHTML, like Gecko) NavscapeNavigator/Pre-0.1 Safari/534.12",
    "Mozilla/5.0 (Windows; U; WinNT4.0; de-AT; rv:1.7.11) Gecko/20050728",
]

custom_headers = {
    'User-Agent': random.choice(user_agents),
    'Referer'   : 'http://v2ex.com/signin'
}

# Setup request agent
session         = requests.Session()
session.verify  = False
session.headers = custom_headers

# Find signin information
signin_page_response       = session.get('https://www.v2ex.com/signin')
name_field, password_field = re.findall(r'class="sl" name="([0-9A-Za-z]{64})"', signin_page_response.text)
once_field_value           = re.search(r'value="(\d+)" name="once"', signin_page_response.text).group(1)

# Do signin action
signed_response = session.post('https://www.v2ex.com/signin', {
    name_field    : username,
    password_field: password,
    'once'        : once_field_value,
    'next'        : '/'
})

# Find mission information
mission_page_response = session.get('https://www.v2ex.com/mission/daily')

if u'每日登录奖励已领取' in mission_page_response.text:
    print('Already got it.')
else:
    mission_path = re.search(r'/mission/daily/redeem\?once=\d+', mission_page_response.text).group()
    mission_url  = 'https://www.v2ex.com' + mission_path

    mission_response = session.get(mission_url)

    print(mission_response.ok)
