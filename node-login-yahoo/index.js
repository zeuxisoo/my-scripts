var mechanize = require('mechanize'),
    printf = require('printf');

agent = mechanize.newAgent();

agent.get({
    uri: "http://hk.auctions.yahoo.com/"
}, function(err, page) {
    login(page.search('//*[@id="ygmauserinfo"]/li[2]/a')[0].attr('href').value())
});

function success(subject, message) {
    console.log(printf("%-15s: %s", subject, message));
}

function login(login_link) {
    agent.get({
        uri: login_link
    }, function(err, page) {
        form = page.form("login_form");
        form.setFieldValue('login', 'username');
        form.setFieldValue('passwd', 'password');
        form.submit(function(err, page) {
            if (err) throw err;

            var statusCode = page.statusCode();
            if (statusCode == 301 || statusCode == 302) {
                success('Get redriect', page.response.headers.location);
                check_login("http://hk.auctions.yahoo.com/");
            }else{
                throw new Error('Login failed')
            }
        });
    });
}

function check_login(after_login_link) {
    agent.get({
        uri: after_login_link
    }, function(err, page) {
        usernameElement = page.search('//a[@id="ygmausername"]');

        if (usernameElement.length <= 0) {
            throw new Error('Check login failed');
        }

        success('Find user', usernameElement[0].text());
        success('Find link', usernameElement[0].attr('href').value());
    });
}
