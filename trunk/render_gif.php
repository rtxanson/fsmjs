<?PHP

$code = $_GET["code"]; 
$code = stripslashes( $code ); 

if ( $code ) {
	header("Content-type: image/gif"); 
	passthru( 'echo ' . escapeshellarg( $code )   . ' | dot -Tgif' );
}

