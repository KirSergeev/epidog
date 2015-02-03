<?php

header('Access-Control-Allow-Origin: *'); 
header("Access-Control-Allow-Headers: *");
header('Access-Control-Allow-Headers: Content-Type, x-xsrf-token');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
header('Content-Type: application/json; charset=utf-8');


require_once "config.php";

if($_SERVER['QUERY_STRING'] == 'authenticate') {

    $request_body = file_get_contents('php://input');
    $data = json_decode($request_body);

    if( $data->password && $data->username ) {
        $myConn = mysql_connect($mysql['host'],$mysql['login'],$mysql['pass']);


        if($myConn) {
            mysql_query("SET NAMES utf8");
            mysql_select_db($mysql['db']);

            $auth = "SELECT * FROM `epi_members` WHERE `login` = '".mysql_real_escape_string($data->username)."'
                     and `pass` = md5('".mysql_real_escape_string($data->password)."')";

            $r = mysql_query($auth);

            if($r) {
                $profile = mysql_fetch_assoc($r);
                if($profile['id'] > 0 ) {

                    unset($profile['pass']);
                    echo json_encode($profile);
                    return;
                }
            }
        }
    }

    header('HTTP/1.0 401 Unauthorized');
    exit;
}