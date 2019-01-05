<?php
define('SEND_LOCK_FILE', '/path/to/php-check-available-ship.mail.lock');

$client = new SoapClient("http://example.com/mobileservice/ws/mobileservice.asmx?WSDL"/*, array(
    'proxy_host' => '127.0.0.1',
    'proxy_port' => 8888
)*/);

// Get available methods
// print_r($client->__getFunctions());

$voyageList = $client->getVoyageList(array(
    'lang'       => 'T',
    'parameters' => array(
        array('sailDate',       '2013-11-06'),
        array('sailDateReturn', '2013-11-07'),

        array('fromPortCode',       'HKC'),
        array('toPortCode',         'ZS'),

        array('fromPortCodeReturn', 'ZS'),
        array('toPortCodeReturn',   'HKC'),

        array('currencyCode',       'HKD'),
        array('discounttype',       '1'),
        array('isRoundtrip',        '1'),
    )
));

$voyageListResult = $voyageList->getVoyageListResult;

$dom = new DomDocument('1.0', 'UTF-8');
$dom->loadXML($voyageListResult->any);

$dataset_main = $dom->getElementsByTagName('dataset_main');

if ($dataset_main->length >= 1) {
    $forwards = $dataset_main->item(0)->getElementsByTagName('Forward');

    for($i=0; $i<$forwards->length; $i++) {
        $forward = $forwards->item($i);

        $fromport      = $forward->getElementsByTagName('FROMPORT')->item(0)->nodeValue;
        $toport        = $forward->getElementsByTagName('TOPORT')->item(0)->nodeValue;
        $fportcode     = $forward->getElementsByTagName('FPORTCODE')->item(0)->nodeValue;
        $tportcode     = $forward->getElementsByTagName('TPORTCODE')->item(0)->nodeValue;
        $ship          = $forward->getElementsByTagName('SHIP')->item(0)->nodeValue;
        $shipcode      = $forward->getElementsByTagName('SHIPCODE')->item(0)->nodeValue;
        $setofftime    = $forward->getElementsByTagName('SETOFFTIME')->item(0)->nodeValue;
        $setofftime1   = $forward->getElementsByTagName('SETOFFTIME1')->item(0)->nodeValue;
        $sellstatus    = $forward->getElementsByTagName('SELLSTATUS')->item(0)->nodeValue;
        $status        = $forward->getElementsByTagName('STATUS')->item(0)->nodeValue;
        $linecode      = $forward->getElementsByTagName('LINECODE')->item(0)->nodeValue;
        $voyagerouteid = $forward->getElementsByTagName('VOYAGEROUTEID')->item(0)->nodeValue;
        $ticketnum     = $forward->getElementsByTagName('TICKETNUM')->item(0)->nodeValue;

        if ($i === 0) {
            printf("===========================================\n");
        }

        printf("%-20s: %s\n", "From port",       $fromport);
        printf("%-20s: %s\n", "From port code",  $fportcode);

        printf("%-20s: %s\n", "To port",         $toport);
        printf("%-20s: %s\n", "To port code",    $tportcode);

        printf("%-20s: %s\n", "Ship Name",       $ship);
        printf("%-20s: %s\n", "Ship Code",       $shipcode);
        printf("%-20s: %s\n", "Set of Clock",    $setofftime);
        printf("%-20s: %s\n", "Set of Time",     $setofftime1);

        printf("%-20s: %s\n", "Sell status",     $sellstatus);
        printf("%-20s: %s\n", "Normal status",   $status);

        printf("%-20s: %s\n", "Line Code",       $linecode);
        printf("%-20s: %s\n", "Voyage Route ID", $voyagerouteid);

        printf("%-20s: %s\n", "Ticket Number",   $ticketnum);

        printf("............................................\n");

        $seatranks   = $forward->getElementsByTagName('SEATRANK');
        $seatprice1s = $forward->getElementsByTagName('PRICE1');
        $seatprice2s = $forward->getElementsByTagName('PRICE2');

        for($j=0; $j<$seatranks->length; $j++) {
            $name   = $seatranks->item($j)->nodeValue;
            $price1 = $seatprice1s->item($j)->nodeValue;
            $price2 = $seatprice2s->item($j)->nodeValue;

            printf("%-20s: %s\n", "Seat Name",  $name);
            printf("%-20s: %s\n", "Seat Price", $price1);
            printf("%-20s: %s\n", "Seat Price", $price2);
        }

        printf("===========================================\n");
    }

    send_mailgun();
}else{
    echo "Not found data";
}

function send_mailgun() {
    printf("Send mail\n");

    if (file_exists(SEND_LOCK_FILE) && is_file(SEND_LOCK_FILE)) {
        printf("=> !!! Lock exists, dont send email\n");

        return false;
    }

    printf("=> Prepare send email\n");

    $config = array();
    $config['api_key'] = "key-FOR-THE-MAILGUN"; // mailgun api key
    $config['api_url'] = "https://api.mailgun.net/v3/PLEASE_CHANGE_TO_YOUR_DOMAIN_NAME/messages"; // mailgun domain

    $message = array();
    $message['from']    = "Your Name <your@email.com>";
    $message['to']      = "to-your-name@email.com";
    $message['subject'] = "Ship ticket is fine";
    $message['html']    = "You can buy the ticket now.";

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $config['api_url']);
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($ch, CURLOPT_USERPWD, "api:{$config['api_key']}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS,$message);

    $result = curl_exec($ch);

    curl_close($ch);

    printf("=> Mailgun response: %s\n", $result);
    printf("=> Write lock file for send once\n");

    file_put_contents(SEND_LOCK_FILE, date("Y-m-d H:i:s"));

    printf("=> Finish!\n");

    return $result;
}
