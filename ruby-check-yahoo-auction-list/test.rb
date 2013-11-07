#!/usr/bin/env ruby

require 'rubygems'
require 'bundler/setup'
require 'mechanize'

page = Nokogiri::HTML(open("test/current-auction-list-page.html"))

auctions = {}

# Find tr rows and skip head tr
page.css("#bd > table")[5].css("table tr").each_with_index do |tr, tr_index|
    next if tr_index == 0

    # Find td rows
    tr.css("td").each_with_index do |td, td_index|
        # Auction number
        if td_index == 0
            puts td.css("font").text
        end

        # Auction name
        if td_index == 1
            auction_info_link = td.css("font a")[0]

            puts auction_info_link['href']
            puts auction_info_link.text
        end

        # Auction bit price
        if td_index == 2
            puts td.css("font").text
        end

        # Auction bit count
        if td_index == 3
            puts td.css("font").text
        end

        # Auction bit user
        if td_index == 4
            puts td.css("font").text
        end

        # Auction remaining time
        if td_index == 5
            puts td.css("font").text
        end

        # Auction new question
        if td_index == 6
            if td.css("font").children.empty?
                puts "Not question"
            else
                puts td.css("font a")[0]['href']
            end
        end
    end
end
