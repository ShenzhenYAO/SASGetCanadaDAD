<?php
    //load the tools in phptoos.php
    //must have!!! as the function to connect to MySQL database is in that file
    // include ('phptools.php'); //include the phptools

    //The following is received from posted json by _POST 
    // the posted json is like {binstr: <the binary stringified json string>}

    //1. save the posted data into variables
    $passcode =  $_POST['passcode']; 
    // echo $passcode;

    // check the passcode;
    // if passcode = '9602' then convert the hexstr to binary and echo it
    if ($passcode == '9602') {

        $binstr = pack('H*', $hexstr );
        echo $binstr;

    } else {

        echo "inCorRect";

    }

?>