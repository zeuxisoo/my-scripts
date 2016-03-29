import yargs from 'yargs'
import request from 'request'
import moment from 'moment'

const argv = yargs
    .usage('Usage: $0 <command> [options]')
    .demand('event').describe('event', 'Event id')
    .help('h').alias('h', 'help')
    .argv

let eventId         = argv.event;
var performanceList = [];
let perPage         = 5;

let cookieJar = request.jar();
let agent     = request.defaults({
    headers: {
        "Accept"          : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language" : "en-US,en;q=0.8",
        "Connection"      : "keep-alive",
        "User-Agent"      : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.73 Safari/537.36"
    },
    jar: cookieJar,
    followRedirect: false
});

function fetchAuth() {
    return new Promise((resolve, reject) => {
        agent({
            url: "http://www.urbtix.hk/"
        }, (error, response, body) => {
            if (error) {
                reject("Can not connect to website");
            }else if (response.headers.location !== "https://ticket.urbtix.hk/") {
                reject("Website response incorrect");
            }else{
                resolve(body);
            }
        });
    })
}

function fetchEventList(pageNo) {
    const timestamp = new Date().getTime();
    const targetUrl = `https://ticket.urbtix.hk/internet/json/event/${eventId}/performance/${perPage}/${pageNo}/perf.json?locale=zh_TW&${timestamp}`;

    return new Promise((resolve, reject) => {
        agent({
            url: targetUrl
        }, (error, response, body) => {
            if (error) {
                reject("Can not connect to event page");
            }else{
                resolve(body);
            }
        });
    });
}

function parseEventList(body) {
    let events          = JSON.parse(body);
    let performanceList = [];
    let performance     = {};

    Object.keys(events.performanceList).forEach(index => {
        performance           = events.performanceList[index];
        performance['status'] = events.performanceQuotaStatusList[index];

        performanceList.push(performance);
    });

    return performanceList;
}

async function reap(pageNo) {
    let auth      = await fetchAuth();
    let eventList = await fetchEventList(pageNo);
    let events    = JSON.parse(eventList);

    let performance = {};

    Object.keys(events.performanceList).forEach(index => {
        performance           = events.performanceList[index];
        performance['status'] = events.performanceQuotaStatusList[index];

        performanceList.push(performance);
    });

    if (events.performanceList.length > 0) {
        reap(pageNo + 1);
    }else{
        for(let performance of performanceList) {
            console.log(
                "%s - %s - %s",
                performance.performanceName,
                moment(new Date(performance.performanceDateTime)).format("YYYY-MM-DD HH:mm:ss"),
                performance.status
            );
        }
    }
}

reap(1);
