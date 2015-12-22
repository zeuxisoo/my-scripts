import request from 'request'
import xml2json from 'xml2json'

export default class ProxyList {

    constructor(key, area) {
        this.key  = key;
        this.area = area;
    }

    fetch() {
        return new Promise((resolve, reject) => {
            request.get({
                url: 'http://www.getproxy.jp/proxyapi',
                qs : {
                    ApiKey : this.key,
                    area   : this.area,
                    sort   : 'requesttime',
                    orderby: 'desc',
                    page   : 1
                }
            }, (error, response, body) => {
                if (error) {
                    reject(body);
                }else{
                    let jsonString = xml2json.toJson(body);
                    let jsonObject = JSON.parse(jsonString);

                    resolve(jsonObject.items.item);
                }
            });
        });
    }

    toServers(proxies) {
        let servers = []

        proxies.forEach((proxy) => {
            servers.push(proxy.ip);
        });

        return servers;
    }

}
