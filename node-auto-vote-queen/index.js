import ProxyList from './proxy-list'
import VoteAction from './vote-action'

const apiKey   = '___YOUR___API___KEY___'
const apiArea  = 'JP'

let proxyList  = new ProxyList(apiKey, apiArea)
let voteAction = new VoteAction();

proxyList
    .fetch()
    .then(proxies    => proxyList.toServers(proxies))
    .then(servers    => voteAction.setServers(servers))
    .then(voteAction => voteAction.run());
