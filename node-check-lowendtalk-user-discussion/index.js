var mechanize = require('mechanize')
    libxmljs = require('mechanize/node_modules/libxmljs'),
    printf = require('printf'),
    colors = require('colors'),
    optimist = require('optimist');

var argv = optimist.usage('Usage: $0')
    .demand('e').alias('e', 'email').describe('e', 'Email field')
    .demand('p').alias('p', 'password').describe('p', 'Password field')
    .demand('u').alias('u', 'url').describe('u', 'Discussions Url like')
    .argv;

var agent = mechanize.newAgent();

agent.get({
	uri: 'http://lowendtalk.com/entry/signin'
}, function(err, signinPage) {
	form = signinPage.form('Form_User_SignIn');
    form.deleteField("Email"); // Fix bug when name="Email" defined x2
	form.setFieldValue("Email", argv.email);
	form.setFieldValue("Password", argv.password);
	form.submit(function(err, submitPage) {
        if (submitPage.statusCode() === 302) {
            agent.get({
                uri: argv.url
            }, function(err, discussPage) {
                discussPage.search('//ul[@class="DataList Discussions"]/li/div[@class="ItemContent Discussion"]').forEach(function(html, index) {
                    var doc, topic, date, result;

                    doc    = libxmljs.parseHtmlString(html);
                    topic  = doc.find('//div[@class="ItemContent Discussion"]/div[@class="Title"]/a[1]/text()')[0].text();
                    date   = doc.find('//div[@class="ItemContent Discussion"]/div[@class="Meta Meta-Discussion"]/span[@class="MItem LastCommentDate"]/time[1]/text()')[0].text();
                    result = printf("%15s %5s %s", date, '-----', topic);

                    console.log(index == 0 ? result.red : result.green);
                });
            });
        }
	})
})
