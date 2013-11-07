#!/usr/bin/env ruby

require 'rubygems'
require 'bundler/setup'
require 'mechanize'

a = Mechanize.new
a.force_default_encoding = "UTF-8"

# Login page
a.get('http://hk.auctions.yahoo.com/') do |page|
    login_page = a.click(page.link_with(:text => "會員登入"))

    auction_index_page = login_page.form_with(:action => "https://login.yahoo.com/config/login?") do |f|
        f.login  = "Username"
        f.passwd = "Password"
    end.click_button
end

# Account page
a.get('http://hk.auctions.yahoo.com/') do |page|
    # Find account link
    account_link = page.link_with(:dom_class => "account")

    # Check is or not find
    if account_link.nil?
        abort("Can not find account link, Please make sure you already login")
    end

    # Go to current auction list link
    auction_home_page         = a.click(account_link)
    current_auction_list_link = auction_home_page.link_with(:text => "拍賣中")

    # Check is or not find
    if current_auction_list_link.nil?
        abort("Can not find current auction list")
    end

    # Go to current auction page
    current_auction_list_page = a.click(current_auction_list_link)

    # Initial auctions to store all auction
    auctions = Array.new

    # Read current auctions on page
    current_auction_list_page.search("#bd > table")[5].search("table tr").each_with_index do |tr, tr_index|
        # Skip table header
        next if tr_index == 0

        # Initial auction info and base names
        auction_info = Hash.new
        auction_keys = { 0 => 'no', 2 => 'bit_price', 3 => 'bit_count', 4 => 'bit_user', 5 => 'remaining_time' }

        # Fill auction info by each line data
        tr.css("td").each_with_index do |td, td_index|
            if [0, 2, 3, 4, 5].include?(td_index)
                auction_info[auction_keys[td_index]] = td.css("font").text
            end

            if td_index == 1
                auction_info_link = td.css("font a")[0]

                auction_info['name'] = {
                    "href" => auction_info_link['href'],
                    "text" => auction_info_link.text
                }
            end

            if td_index == 6
                if td.css("font").children.empty?
                    auction_info['new_question'] = nil
                else
                    auction_info['new_question'] = td.css("font a")[0]['href']
                end
            end
        end

        auctions.push(auction_info)
    end

    # Display auctions
    auctions.each do |auction|
        printf("%-12s %-75s %s\n", auction['no'], auction['name']['href'], auction['name']['text'])
    end
end
