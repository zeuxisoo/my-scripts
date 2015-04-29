var fs      = require('fs');
var url     = require("url");
var path    = require('path');
var cheerio = require('cheerio');
var unirest = require('unirest');
var datauri = require('datauri');
var async   = require('async');

var inputWord  = process.argv[2] || 'a';
var nextWord   = "";
var getWordURL = function(word) {
    return 'http://www.onlinedict.com/servlet/MobiDictLookup14?WoRd=' + encodeURIComponent(word) + '&example=true&phrase=true&from=prev';
}

var fetchPage = function(callback) {
    unirest
        .get(getWordURL(inputWord))
        .header('User-agent', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')
        .end(function (response) {
            callback(null, response);
        });
};

var formatPage = function(response, callback) {
    var $     = cheerio.load(response.body);
    var table = $("table tr:nth-child(2) td");

    var moccasin = table.find("tr[bgcolor=moccasin] td font b").text();
    var beige    = table.find("tr[bgcolor=beige] td font b").text();

    // Remove 4 links
    table.find("tr[bgcolor=moccasin] td[align=center] a").each(function() {
        $(this).remove();
    });

    // Get next word
    nextWord = table.find("tr:nth-last-child(5) td a").html();

    // Remove "looking for" keyboard
    table.find("tr:first-child").remove();

    // Remove last 3 lines
    for(var i=0; i<5; i++) {
        table.find("tr:last-child").remove();
    }

    // If found PREVIOUS WORD tr, remove again
    if (table.find("tr:last-child td").text().indexOf("PREVIOUS WORD") == 0) {
        table.find("tr:last-child").remove();
    }

    callback(null, $, table);
};

var findPhoneticImagesUrl = function($, table, callback) {
    var images = [];
    table.find("tr:nth-child(2) td img").each(function() {
        var image_url = url.resolve("http://www.onlinedict.com/", $(this).attr('src'));
        var image_ext = path.extname($(this).attr('src'));

        images.push({
            'url': image_url,
            'ext': image_ext,
        });
    });

    callback(null, $, table, images);
};

var convertPhoneticImagesToDataUri = function($, table, images, waterfallCallback) {
    var image_uris = [];
    async.eachSeries(images, function(image, callback) {
        unirest
            .get(image.url)
            .encoding(null)
            .end(function(response) {
                var uri     = new datauri();
                var format  = uri.format(image.ext, new Buffer(response.raw_body));
                var content = format.content;

                image_uris.push(content);

                callback(null);
            });
    }, function(err) {
        waterfallCallback(null, $, table, image_uris);
    });
};

var replacePhoneticImagesUrl = function($, table, image_uris, callback) {
    table.find("tr:nth-child(2) td img").each(function(i) {
        $(this).attr('src', image_uris[i]);
    });

    callback(null, table);
};

async.waterfall([
    fetchPage,
    formatPage,
    findPhoneticImagesUrl,
    convertPhoneticImagesToDataUri,
    replacePhoneticImagesUrl
], function(err, result) {
    fs.writeFile("./" + inputWord + ".html", result.html(), function(err) {
        if (err) {
            console.log(err);
        }else{
            console.log('OK');
            console.log('Input word: ' + inputWord);
            console.log('Next word : ' + nextWord);
        }
    });
});
