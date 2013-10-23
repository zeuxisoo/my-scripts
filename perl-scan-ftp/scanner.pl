#!/usr/bin/perl -w
use strict;
use warnings;
use threads;
use Thread::Queue;
use IO::Socket::INET;
use Net::FTP;

our $ftp_address_queue = Thread::Queue->new();

sub ftp {
	while (my $ftp_address = $ftp_address_queue->dequeue_nb()) {
		if ($ftp_address eq "exit") {
			last;
		}

		my $ftp = Net::FTP->new($ftp_address, Timeout => 3);

		if (!$ftp || !$ftp->login()) {
			print "Not Working: $ftp_address\n";
		}else{
			print "Working: $ftp_address\n";

			open(FILE, ">>ftp-scan.txt");
			print(FILE "$ftp_address\n");
			close(FILE);

			$ftp->quit();
		}
	}
}

sub scanner {
	my $ip_range_queue = shift;

	while (my $ip_address = $ip_range_queue->dequeue_nb()) {
		my $error = 0;

		my $socket = IO::Socket::INET->new(
			PeerAddr => $ip_address,
			PeerPort => "21",
			Proto => 'tcp',
			Timeout => 3,
		) or $error = 1;

		if ($error == 1) {
			print "No FTP: $ip_address\n";
		}else{
			$ftp_address_queue->enqueue($ip_address);

			print "FTP: $ip_address\n";

			open(FILE, ">>ftp-scan.txt");
			print(FILE "$ip_address\n");
			close(FILE);

			close($socket);
		}
	}
}

sub ip_range() {
	my $start_ip = $ARGV[0];
	my $end_ip   = $ARGV[1];

	my $ip_range_queue = Thread::Queue->new();

	my @start = split(/\./, $start_ip);
	my @end   = split(/\./, $end_ip);

	$ip_range_queue->enqueue($start_ip);

	while(join(".", @start) ne $end_ip) {
		$start[3] += 1;

		for my $i (3..1) {
			if ($start[$i] == 256) {
				$start[$i] = 0;
				$start[$i-1] += 1;
			}
		}

		$ip_range_queue->enqueue(join(".", @start));
	}

	threads->create(\&scanner, $ip_range_queue) for(0..10);

	$_->join for(threads->list);

	if ($ftp_address_queue->pending <= 0) {
		print "No FTP servers found\n";
		exit;
	}

	for(0..10) {
		$ftp_address_queue->enqueue("exit");

		threads->create(\&ftp);
	}

	$_->join for(threads->list);
}

if ($#ARGV != 1) {
	print "Usage: perl ftp-scan.pl [start ip] [end ip]\n";
	print "Example: perl ftp-scan.pl 127.0.0.1 127.0.0.5\n";
	exit;
}else{
	ip_range();
}