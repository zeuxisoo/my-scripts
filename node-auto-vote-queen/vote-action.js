import fs from 'fs'
import request from 'request'
import xml2json from 'xml2json'
import iconv from 'iconv-lite'
import colors from 'colors'

export default class VoteAction {

    formData = {
        'mode': 'vote_complete',
        'ajax': 1,
        'p_id': 136
    }

    constructor() {
        this.cookieJar    = request.jar();
        this.requestAgent = null;
    }

    setServers(proxyServers) {
        this.proxyServers = proxyServers;

        return this;
    }

    async run() {
        console.log("Start vote action".rainbow.bgWhite);
        console.log();

        for(let proxy of this.proxyServers) {
            console.log(`Proxy: ${proxy}`.green);

            this.requestAgent = request.defaults({
                proxy: `http://${proxy}`
            });

            try {
                await this.fetchPage(proxy)
                await this.voteTarget()
            }catch(error) {
                console.log(`------ ${error}`.red);
            }

            console.log();
        }
    }

    fetchPage(proxy) {
        console.log('------ Request vote page');

        return new Promise((resolve, reject) => {
            this.requestAgent({
                uri     : 'http://www.mache.tv/m/chat_room.php?e=queen2012',
                method  : 'GET',
                jar     : this.cookieJar,
                timeout : 15000,
                headers : {
                    'Host'            : 'www.mache.tv',
                    'Accept'          : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Referer'         : 'https://www.facebook.com/',
                    'Accept-Language' : 'en-US,en;q=0.8',
                    'User-Agent'      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.3',
                },
            }, (error, response, body) => {
                if (error) {
                    reject(error);
                }else{
                    resolve(body);
                }
            });
        });
    }

    voteTarget() {
        console.log('------ Make vote action');

        return new Promise((resolve, reject) => {
            this.requestAgent({
                uri     : 'http://www.mache.tv/m/chat_room.php?e=queen2012',
                method  : 'POST',
                form    : this.formData,
                encoding: null,
                jar     : this.cookieJar,
                timeout : 15000,
                headers : {
                    'Host'            : 'www.mache.tv',
                    'Accept'          : '*/*',
                    'Origin'          : 'http://www.mache.tv',
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent'      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.3',
                    'Content-Type'    : 'application/x-www-form-urlencoded; charset=UTF-8',
                    'DNT'             : 1,
                    'Referer'         : 'http://www.mache.tv/m/chat_room.php?e=queen2012',
                    'Accept-Language' : 'en-US,en;q=0.8',
                },
            }, (error, response, body) => {
                if (error) {
                    reject(error);
                }else{
                    resolve(body);
                }
            });
        });
    }
}
