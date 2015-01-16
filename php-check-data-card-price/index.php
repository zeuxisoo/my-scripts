<?php
// Request JSON
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL,            "http://store.hk.chinaunicom.com/good_detail/good_detail!loadGoodDetail.action");
curl_setopt($curl, CURLOPT_HEADER,         0);
curl_setopt($curl, CURLOPT_VERBOSE,        0);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_USERAGENT,      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36");
curl_setopt($curl, CURLOPT_POST,           true);
curl_setopt($curl, CURLOPT_POSTFIELDS,     http_build_query(['salproId' => 453477]));
$json = curl_exec($curl);
curl_close($curl);

// Decode JSON
$result = json_decode($json);

// Output price
$price = $result[0]->SAL_PRICE;

if ($price != 199) {
    $config = [
        'api_key' => "key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        'api_url' => "https://api.mailgun.net/v2/DOMAIN.COM/messages",
    ];

    $message = [
        'from'    => "no-reply@no-reply.com",
        'to'      => "YOUR_EMAIL@gmail.com",
        'subject' => "Email notification sent by data card monitor",
        'html'    => "The price was updated to $price"
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,            $config['api_url']);
    curl_setopt($ch, CURLOPT_HTTPAUTH,       CURLAUTH_BASIC);
    curl_setopt($ch, CURLOPT_USERPWD,        "api:{$config['api_key']}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_POST,           true);
    curl_setopt($ch, CURLOPT_POSTFIELDS,     $message);
    $result = curl_exec($ch);
    curl_close($ch);

    echo "Price change at ".date("Y-m-d H:i:s");
}else{
    echo "No price change";
}