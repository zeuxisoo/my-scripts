#!/usr/bin/env perl

use strict;

use lib "vendor/lib/perl5";
use utf8;
use open ":encoding(utf8)";
use open IN => ":encoding(utf8)", OUT => ":utf8";
binmode(STDOUT, ":utf8");
binmode(STDIN, ":encoding(utf8)");

use WWW::Mechanize;
use Data::Dumper;

# Initial mechanize
my $agent = WWW::Mechanize->new();

# $agent->no_proxy('localhost');
# $agent->proxy(['http', 'https', 'gopher'], "http://localhost:8888/") or die $!;

# Open auction page
$agent->get('http://hk.auctions.yahoo.com/');

# Go to login page
$agent->follow_link(url_regex => qr/login.yahoo.com\/conf/i);

# Submit login form
$agent->submit_form(
    form_name => 'login_form',
    fields    => {
        login  => 'username',
        passwd => 'password'
    }
);

# Open auction page
# $agent->follow_link(url => "http://hk.auctions.yahoo.com/hk");
$agent->get('http://hk.auctions.yahoo.com/hk');

# Show link after submit login and check is or not login
for my $link ($agent->links()) {
    printf "%s\n%s\n\n", $link->text, $link->url_abs;
}
