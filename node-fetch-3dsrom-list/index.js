var cheerio = require('cheerio'),
	request = require('request'),
	printf = require('printf'),
	colors = require('colors'),
	optimist = require('optimist');
	
var options = optimist.usage('Usage $0 -p [PAGE_NO]')
	.alias('p', 'page').describe('p', 'Number of page').demand('p').check(function(argv) {
		if (/^\d+$/.test(argv.page) === false) {
			throw "Number of page must integer";
		}
	})
	.alias('e', 'end').describe('e', 'End of page').check(function(argv) {
		if (argv.end !== undefined) {
			if (argv.page >= argv.end) {
				throw "End of page can not equals or bigger than number of page";
			}else if (/^\d+$/.test(argv.end) === false) {
				throw "End of page must integer";
			}
		}
	})
	.argv;

var RomFinder = function() {}

RomFinder.prototype.findMultiDownloadPage = function(pageNo, endPageNo) {
	for(var i=pageNo; i<=endPageNo; i++) {
		this.findSingleDownloadPage(i);
	}
};

RomFinder.prototype.findSingleDownloadPage = function(pageNo) {
	var self = this;
	request.get('http://tvgdb.duowan.com/3ds?state=dl&search_state=dl&page=' + pageNo, function(error, response, body) {
		var $ = cheerio.load(body);	
		
		$(".item h4 > a").each(function(i, element) {
			var romName = $(this).text(),
				downloadPageUrl = $(this).attr('href');
			
			self.findDownloadPost(romName, downloadPageUrl);
		});
	});
};

RomFinder.prototype.findDownloadPost = function(romName, downloadPageUrl) {
	var self = this;
	request.get(downloadPageUrl, function(error, response, body) {
		var bbsPostUrl = cheerio.load(body)(".xunlei").eq(1).find('a').attr('href');
		
		if (bbsPostUrl !== undefined) {
			self.findDownloadLink(romName, bbsPostUrl);
		}
	});
};

RomFinder.prototype.findDownloadLink = function(romName, bbsPostUrl) {
	request.get(bbsPostUrl, function(error, response, body) {
		var $ = cheerio.load(body);
		
		$("#postlist .plc").eq(2).find('a').each(function(i, element) {
			var downloadLink = $(this).attr('href');
			
			if (/^http:\/\/kuai/.test(downloadLink) === true) {
				var romInfos = romName.split(" "), 
					areaName = romInfos.pop();
					gameName = romInfos.join();

				console.log(printf("%-45s %-10s %s", downloadLink, areaName.yellow, gameName.cyan).green);
			}
		});
	});
};

if (options.end === undefined || options.end === 0) {
	new RomFinder().findSingleDownloadPage(options.page);
}else{
	new RomFinder().findMultiDownloadPage(options.page, options.end);
}