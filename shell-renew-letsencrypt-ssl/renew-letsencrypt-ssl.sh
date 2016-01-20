#!/bin/bash

# Config
DOMAINS="domain1.com domain2.com"
EMAIL="renew-notification@email.com"

# Stop nginx
/root/script/nginx.sh stop

# Update ssl certs
for domain in $DOMAINS; do
    echo "renew: $domain"

    /root/git/letsencrypt/letsencrypt-auto certonly -a standalone -d $domain --server https://acme-v01.api.letsencrypt.org/directory --agree-dev-preview --renew

    if [ $? -ne 0 ]
        then
        ERRORLOG=`tail /var/log/letsencrypt/letsencrypt.log`
        echo -e "The Lets Encrypt Cert has not been renewed! \n \n" $ERRORLOG | mail -s "Lets Encrypt Cert Alert" $EMAIL
    fi
done

# Start nginx
/root/script/nginx.sh start
