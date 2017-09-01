<?php
// Basic setup
date_default_timezone_set("Asia/Hong_Kong");

// Define helper
function logger($message) {
    return sprintf("[%s] %s\n", date("Y-m-d H:i:s"), $message);
}

// Request data
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL,            "https://www.cuniq.com/frontend/goodsController/loadGoodsDetail");
curl_setopt($curl, CURLOPT_HEADER,         0);
curl_setopt($curl, CURLOPT_VERBOSE,        0);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_USERAGENT,      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36");
curl_setopt($curl, CURLOPT_POST,           true);
curl_setopt($curl, CURLOPT_POSTFIELDS,     http_build_query([
    'categoryId' => 453547,
    'goodsId'    => 'b55c0aed-0155-1034-a99e-c7874ce9aca2',
    'orgId'      => '10c967c4-ec8d-4f82-9ace-bf24d8b6f470'
]));
$result = curl_exec($curl);
curl_close($curl);

// Decode response
$deocdedResult = json_decode($result);

// Get currnet price
$currentPrice = $deocdedResult->goodsPrice;

// Compare price
echo logger("Notification: Price != 268");

if ($currentPrice != 268) {
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

    echo logger("Price change: YES");
}else{
    echo logger("Price change: NO");
}
