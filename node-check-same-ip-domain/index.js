var request = require('request'),
	cheerio = require('cheerio'),
	printf = require('printf'),
	colors = require('colors'),
	optimist = require('optimist');

var opts = optimist.usage("Usage: $0 -a [IP or Domain Name]")
	.demand('a').alias('a', 'address').describe('a', "IP or Domain Name")
	.argv

request("http://tool.chinaz.com/Same/", {
	form: {
		s: opts.address
	}
}, function(error, response, body) {
	var $ = cheerio.load(body);

	var info = $("#ipinfo").text().match(/((?:[0-9]{1,3}\.){3}[0-9]{1,3})\[(.*)\]/);
		ip   = info[1],
		name = info[2],

	console.log("\nDomain information\n".green);

	console.log(printf("%-10s: %s", "Search", opts.address));
	console.log(printf("%-10s: %s", "IP Address", ip));
	console.log(printf("%-10s: %s", "ISP Name", name));

	console.log("\nDomain in same IP\n".green);

	var domains = [];
	$("#contenthtml ul li a").each(function(i) {
		console.log(printf("%02d. %s", i, $(this).text()));
	});

	console.log();
});
