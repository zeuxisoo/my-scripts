"use strict";

var request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    querystring = require('querystring'),
    sprintf = require("sprintf-js").sprintf;

request.post({
    url    : "http://www.travpulse.com/web/b2b2c_returnfares_chi.asp?query=0&page_value=ReturnFares",
    headers: {
        'User-Agent': 'Mozilla/5.0 ;Windows NT 6.1; WOW64; Trident/7.0; rv:11.0; like Gecko',
        'Referer'   : 'http://www.travpulse.com/web/b2b2c_airfares_chi.asp?cmpid=<<<< YOUR_CMPID >>>>&b2cpin=<<<< YOUR_B2CPIN >>>>'
    },
    form: {
        'DPPORT'            : 'HKG',
        'ARPORT'            : 'TPE',
        'RoundTrip'         : 'RT',
        'PTP'               : 'Y',
        'DEPT_DATE_DAY'     : 29,
        'DEPT_DATE_MONTH'   : 10,
        'DEPT_DATE_YEAR'    : 2015,
        'dateboxdepart'     : '29/10/2015',
        'RETURN_DATE_DAY'   : 31,
        'RETURN_DATE_MONTH' : 10,
        'RETURN_DATE_YEAR'  : 2015,
        'dateboxarrive'     : '31/10/2015',
        'FLIGHT_CLASS'      : 'Y',
        'SortBy'            : 'SP',
        'pref_air'          : '',

        'cmpid'             : '<<<< YOUR_CMPID >>>>',
        'b2cpin'            : '<<<< YOUR_B2CPIN >>>>',
        'lang'              : '',
        'submit.x'          : 23,
        'submit.y'          : 11,
        'submit'            : 'Search'
    }
}, (err, response, body) => {
    if (err) {
        return console.error('Post data failed:', err);
    }

    if (body.match(/Invalid Visits/)) {
        return console.log('Blocked -> ' + body);
    }

    let $ = cheerio.load(body),
        $companyTable = $('a[name=fare0] table'),
        $companyList  = $companyTable.find('tr:nth-child(n+3):nth-child(odd)');

    $companyList.each((i, element) => {
        let companyCode            = $(element).find("td:nth-child(3)").text(), // 航空公司
            cabin                  = $(element).find("td:nth-child(4)").text(), // 客艙類別
            ticketPrice            = $(element).find("td:nth-child(6)").text(), // 成人票價
            stayDayMin             = $(element).find("td:nth-child(7)").text(), // 停留天數 - 最短
            stayDayMax             = $(element).find("td:nth-child(8)").text(), // 停留天數 - 最長
            validDateFrom          = $(element).find("td:nth-child(9)").text(), // 行程有效期 - 由
            validDateTo            = $(element).find("td:nth-child(10)").text(), // 行程有效期 - 至
            validBuyTicketDateFrom = $(element).find("td:nth-child(11)").text(), // 出票期限 - 由
            validBuyTicketDateTo   = $(element).find("td:nth-child(12)").text(), // 出票期限 - 至
            flightInfoLink         = $(element).find("td:nth-child(15) a").attr('href');

        let flightInfoLinkCondCode = querystring.parse(flightInfoLink).cond_code;

        console.log(sprintf(
            [
                "%(companyCode)2s",
                "%(cabin)1s",
                "%(ticketPrice)8s",
                "(%(stayDayMin)3s ~ %(stayDayMax)3s)",
                "(%(validDateFrom)10s ~ %(validDateTo)10s)",
                "(%(validBuyTicketDateFrom)10s ~ %(validBuyTicketDateTo)10s)",
                "%(flightInfoLinkCondCode)15s"
            ].join(" - "),
            {
                companyCode            : companyCode,
                cabin                  : cabin,
                ticketPrice            : ticketPrice,
                stayDayMin             : stayDayMin,
                stayDayMax             : stayDayMax,
                validDateFrom          : validDateFrom,
                validDateTo            : validDateTo,
                validBuyTicketDateFrom : validBuyTicketDateFrom,
                validBuyTicketDateTo   : validBuyTicketDateTo,
                flightInfoLinkCondCode : flightInfoLinkCondCode
            }
        ));
    });
});

/*
request.get({
    url: "http://www.travpulse.com/abacus/abacus_avail.asp?dpport=HKG&arport=TPE&RoundTrip=RT&pref_air=HX&dateboxdepart=27/10/2015&dateboxarrive=28/10/2015&bk_class=X&cond_code=HXPTPEAPXF51"
}, (err, response, body) => {
    if (err) {
        return console.log('Get flight detail faield', err);
    }

    let $ = cheerio.load(body),
        $deportFlightTable = $("form[name=form1] table tr:nth-child(4) table:nth-child(1)"), // First child is deport flight
        $deportFlightList  = $deportFlightTable.find("tr:nth-child(n+3):not(:last-child)");

    $deportFlightList.each((i, element) => {
        let airline            = $(element).find("td:nth-child(1)").text(),
            flightNo           = $(element).find("td:nth-child(2)").text(),
            departCityAndTime  = $(element).find("td:nth-child(3)").text(),
            arrivalCityAndTime = $(element).find("td:nth-child(4)").text(),
            stop               = $(element).find("td:nth-child(5)").text(),
            aircraft           = $(element).find("td:nth-child(6)").text(),
            classAvailability  = $(element).find("td:nth-child(7) font font").text();

        console.log(sprintf(
            ["%(airline)2s", "%(flightNo)6s", "%(departCityAndTime)9s", "%(arrivalCityAndTime)9s", "%(stop)3s", "%(aircraft)3s", "%(classAvailability)2s"].join(' - '),
            {
                airline            : airline,
                flightNo           : flightNo,
                departCityAndTime  : departCityAndTime,
                arrivalCityAndTime : arrivalCityAndTime,
                stop               : stop,
                aircraft           : aircraft,
                classAvailability  : classAvailability,
            }
        ));
    });
});
*/
