#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import re
import requests
from bs4 import BeautifulSoup
from tidylib import tidy_document

# Initial requests object
agent = requests.session()

# Find login url
response  = agent.get("http://hk.auctions.yahoo.com/")
login_url = BeautifulSoup(response.text).select("ul#ygmauserinfo li.ygmabg a")[1]['href']

# Go to login page
response  = agent.get(login_url)

# Bulid post form data
request_datas  = dict(login='USERNAME', passwd='PASSWORD')
request_url    = BeautifulSoup(response.text).select("form[name=login_form]")[0]['action']
input_elements = BeautifulSoup(response.text).select("form[name=login_form] input[type=hidden]")

for input_element in input_elements:
    request_datas[input_element.get('name')] = input_element.get('value')

# Submit login action with post form data
response = agent.post(request_url, data=request_datas)

# Get submitted response and check is or not successful
click_here_text = BeautifulSoup(response.text).select("a")[0].string
click_here_url  = BeautifulSoup(response.text).select("a")[0]['href']

# if click_here_text != "click here":
#     sys.exit("Can not found click here text when submitted login action")

# Back to home page and find my auction home url
response = agent.get("http://hk.auctions.yahoo.com/")
auction_home_url = BeautifulSoup(response.text).select("div#ypsauuf div.bd a.account")[0]['href']

# Go to my auction home page and find my auctioning url
response = agent.get(auction_home_url)
auction_auctioning_url = BeautifulSoup(response.text).select("table tr[align=middle] a")[5]['href']

# Go to my auctioning page
response   = agent.get(auction_auctioning_url)

# Find total of auctioning record
total_rows = re.findall(r"\d+", BeautifulSoup(response.text).select("font.stext")[0].string)[0]

# Find auctioning records
auctions     = []
auction_keys = { 0: 'no', 2: 'bit_price', 3: 'bit_count', 4: 'bit_user', 5: 'remaining_time' }

# for tr_index, tr in enumerate(BeautifulSoup(tidy_document(open("auctioning_index.html").read().decode("UTF-8"))[0].encode("UTF-8")).select("#bd table table[cellpadding=4] tr")):
for tr_index, tr in enumerate(BeautifulSoup(tidy_document(response.text)[0]).select("#bd table table[cellpadding=4] tr")):
    if tr_index == 0:
        continue
    else:
        auction_info = dict()

        for td_index, td in enumerate(tr.select("td")):
            if td_index in [0, 2, 3, 4, 5]:
                auction_info[auction_keys[td_index]] = td.select("font")[0].string.encode("UTF-8")

            if td_index == 1:
                auction_info_link = td.select("font a")[0]

                auction_info['name'] = {
                    "href": auction_info_link['href'],
                    "text": auction_info_link.string
                }

            if td_index == 6:
                auction_new_question_link = td.select("a[class=a]")

                if not auction_new_question_link:
                    auction_info['new_question'] = None
                else:
                    auction_info['new_question'] = auction_new_question_link[0]['href']

        auctions.append(auction_info)

# Display auction records
for auction in auctions:
    print("{0:<12} {1:<75} {2}".format(auction['no'], auction['name']['href'], auction['name']['text'].encode("UTF-8")))

    # Go to auction detail page and find Q&A url
    response    = agent.get(auction['name']['href'])
    q_and_a_url = "http://hk.f1.page.auctions.yahoo.com/" + BeautifulSoup(response.text).select("#yauittab .bd.nospace ul li a")[1]['href']

    # Go to auction Q&A page and find all username
    response = agent.get(q_and_a_url)

    # Display auction Q&A page comment
    for tr_index, tr in enumerate(BeautifulSoup(response.text).select("#yauitqna .bd table tr")):
        if tr_index == 0:
            continue
        else:
            # Focus on td.first element
            td_first = tr.select("td.first")[0]

            # Check is or not empty list
            if td_first.find("p").text.encode("UTF-8") == "沒有任何問題":
                print("|---- {0}".format("Not found questions"))
            else:
                # Find no, username, rank
                no       = td_first.select("h4")[0].text.encode("UTF-8").split(" ")[1]
                username = td_first.select("p a")[0].text.encode("UTF-8")
                rank     = td_first.select("p a")[1].text.encode("UTF-8")

                # Find message text node, remove all newline char between words, convert to string, substr after ":"
                message  = td_first.select("p")[0].findAll(text=True)[4].encode("UTF-8")
                message  = ''.join(message.splitlines())
                message  = message[message.find(":") + 1:].strip()

                # Focus on td.asktime element
                td_asktime = tr.select("td.asktime")[0]

                # Find create_at
                create_at = td_asktime.findAll(text=True)[0].strip()

                print("|---- {0:<20} {1:<5} {2:<15} {3}".format(create_at, no, username, message))
