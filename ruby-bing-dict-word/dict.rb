#!/usr/bin/env ruby

require 'rubygems'
require 'nokogiri'
require 'open-uri'
require 'uri'

# Check
if ARGV.empty? then
	puts "Usage: #{$0} [word]"
	exit
end

# URL
base_url = "http://cn.bing.com/dict/search?q=#{URI.escape(ARGV.shift)}&go=&qs=bs&form=CM&mkt=zh-CN&setlang=ZH"

# Fetch
page = Nokogiri::HTML(open(base_url))

# Parse head
head_word = page.css('div#headword strong')[0].text
head_prUS = page.css('div.hd_prUS')[0].text
head_prEN = page.css('div.hd_pr')[0].text

# Parse mean
means = {}
page.css('div.qdef > ul > li').each do |li|
	pos  = li.css('span.pos')[0].text
	def_ = li.css('span > span')[0].text
	
	means[pos] = def_
end

# Result
puts "#{head_word}"
puts "----------------"
puts "|-- #{head_prUS}"
puts "|-- #{head_prEN}"
puts "----------------"
means.each { |pos, def_| puts "|-- #{def_} [#{pos}]" }