#!/usr/bin/node
var fs = require('fs'),
	path = require('path'),
	util = require('util');

var Scanner = (function() {

	"use strict";

	var codec = {
			"php":  ['eval(','assert(','disk_total_space','wscript.shell','gethostbyname(','system(','exec(','escapeshell(','passthru(','base64_decode(','gzuncompress(','cmd.exe','shell.application','touch(','documents and settings','system32','serv-u','提权','phpspy','后门'],
			"asp":  ['eval(','execute(','wscript.shell','cmd.exe','touch(','documents and settings','system32','serv-u','提权','aspspy','后门'],
			"jsp":  ['getHostAddress(','wscript.shell','gethostbyname(','cmd.exe','documents and settings','system32','serv-u','提权','jspspy','后门'],
			"aspx": ['eval(','UseShellExecute','wscript.shell','cmd.exe','documents and settings','system32','serv-u','提权','aspxspy','后门']
		},
		extension = ['asp', 'php', 'aspx', 'jsp', 'cer', 'asa', 'cdx', 'ashx', 'ascx'],
		s = {};

	s.argument = function() {
		return process.argv.slice(2);
	};

	s.main = function() {
		var argument = this.argument();

		if (argument.length <= 0) {
			console.log("Please enter the scan path");
		}else if (!fs.existsSync(argument[0])) {
			console.log("Path not exists");
		}else{
			s.fn.walk(argument[0], function(error, results) {
				if (error) {
					throw error;
				}

				results.forEach(function(result) {
					for(var language in codec) {
						codec[language].forEach(function(pattern) {
							var data = fs.readFileSync(result);

							if (data.toString().indexOf(pattern) != -1) {
								console.log(util.format(
									"%s %s %s",
									s.fn.green(pattern),
									s.fn.normalize("in"),
									s.fn.purple(result)
								));
							}
						});
					}
				});
			});
		}
	};

	s.fn = {
		walk: function(directory, done) {
			var results = [];
			fs.readdir(directory, function(error, list) {
				if (error) {
					return done(error);
				}

				var i = 0;
				(function next() {
					var file = list[i++];

					if (!file) {
						return done(null, results);
					}

					file = directory + '/' + file;

					fs.stat(file, function(error, stat) {
						if (stat && stat.isDirectory()) {
							s.fn.walk(file, function(error, res) {
								results = results.concat(res);
								next();
							});
						} else {
							if (extension.indexOf(path.extname(file).slice(1)) != -1) {
								results.push(file);
							}
							next();
						}
					});
				})();
			});
		},

		green: function(text) {
			return "\x1b[32m" + text;
		},

		purple: function(text) {
			return "\x1b[35m" + text;
		},

		normalize: function(text) {
			return "\x1b[39m" + text;
		}
	};

	return s;
})();

Scanner.main();
