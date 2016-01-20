### Usage

1. Open `renew-letsencrypt-ssl.sh`
2. Update configures like

    Domains

        DOMAINS="domain1.com domain2.com"

    Notification Email when got error

        EMAIL="renew-notification@email.com"

    Other

        # Nginx start or stop commands
        /root/script/nginx.sh stop
        /root/script/nginx.sh stop

        # Let's encrypt commands path
        /root/git/letsencrypt/letsencrypt-auto

3. Save and test the commands

    bash renew-letsencrypt-ssl.sh

### Cron job

Set up cron job run at every first day of month

    0 0 1 * * /bin/bash /path/to/renew-letsencrypt-ssl.sh
