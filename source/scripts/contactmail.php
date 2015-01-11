<?php header('content-type: application/json; charset=utf-8');

function is_valid_callback($subject) {
    $identifier_syntax
      = '/^[$_\p{L}][$_\p{L}\p{Mn}\p{Mc}\p{Nd}\p{Pc}\x{200C}\x{200D}]*+$/u';

    $reserved_words = array('break', 'do', 'instanceof', 'typeof', 'case',
      'else', 'new', 'var', 'catch', 'finally', 'return', 'void', 'continue',
      'for', 'switch', 'while', 'debugger', 'function', 'this', 'with',
      'default', 'if', 'throw', 'delete', 'in', 'try', 'class', 'enum',
      'extends', 'super', 'const', 'export', 'import', 'implements', 'let',
      'private', 'public', 'yield', 'interface', 'package', 'protected',
      'static', 'null', 'true', 'false');

    return preg_match($identifier_syntax, $subject)
        && ! in_array(mb_strtolower($subject, 'UTF-8'), $reserved_words);
}

function is_ajax_request() {
	//ServerSide if ajax Check
	return (
	(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest')
	) ? true : false;
	
	//check if Ajax request reading a value of the GET
	//(substr($_GET['ajx'], 0, 2)) == 1 ? true : false;
}

function isValidEmail($email){
    return preg_match("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,6})$^", $email);
}

function isValidString($str){
	return (strlen($str) > 2 ? true : false);
}

$email_to = "toomuchdesign@gmail.com";

//Get vars end cut them
if (is_ajax_request()) {
	$name = substr($_GET['name'], 0, 50);
	$spam = substr($_GET['mail'], 0, 50);
	$email = substr($_GET['email'], 0, 50);
	$comment = urldecode(substr($_GET['message'], 0, 1000));
	$lang = substr($_GET['lang'], 0, 2);
	
} else {
	$name = substr($_POST['name'], 0, 50);
	$spam = substr($_POST['mail'], 0, 50);
	$email = substr($_POST['email'], 0, 50);
	$comment = substr($_POST['message'], 0, 1000);
	$lang = substr($_POST['lang'], 0, 2);
}

$message = "Name: $name \ne-mail: $email \n\nComment: $comment";
$headers = 'From: '.$email. "\r\n" .
			'Reply-To: '.$email. "\r\n" .
			'X-Mailer: PHP/' . phpversion();

//Set Reply message according to Language
if($lang=='it'){		
$reply_message = "Ciao $name,

grazie per il tempo che hai dedicato a visitare il mio sito,
riceverai risposta a breve.

Sotto una copia del tuo messaggio
A presto.

Andrea Carraro

------+------
$comment
------+------

andreacarraro.it | toomuchdesign.net | info@andreacarraro.it";
} else {
$reply_message = "Hi $name,

thank you for the time you spent on my website,
I'll endeavour to reply to you shortly.

Below you'll find a copy of your message.
See you.

Andrea Carraro

------+------
$comment
------+------

andreacarraro.it | toomuchdesign.net | info@andreacarraro.it";
}

$reply_headers = 'From: info@andreacarraro.it' . "\r\n" .
			'Reply-To: info@andreacarraro.it' . "\r\n" .
			'X-Mailer: PHP/' . phpversion();

$validation = 0;

//Do Validation
if ( isValidEmail($email) &&  isValidString($name) && isValidString($message) && $spam == '' ) {
	$validation = 1;
}

if ($validation == 1) {
	//If validation OK e mail OK
	if (	mail("$email_to",
				"Form spedito da andreacarraro.it",
				$message,
				$headers) ){
	 
		$data['sent'] = '1';
		$data['msg'] = 'Email sent!';
		
		//Send a copy to writer
		mail("$email",
			"andreacarraro.it: message received!",
			$reply_message,
			$reply_headers);

	//if mail KO
	} else {
	$data['sent'] = '0';
	$data['msg'] = 'Looks like we are having some server troubles. Please, try again.';
	}
	
	//if validation KO
} else  {
	$data['sent'] = '0';
	$data['msg'] = 'I found some validation problems. Please, check your inputs again.';
}

//$data = array(1, 2, 3, 4, 5, 6, 7, 8, 9);
$json = json_encode($data);

//if JSON or JSONP request
if(is_ajax_request()){

	// JSON if no callback
	if( ! isset($_GET['callback']))
		exit($json);

	// JSONP if valid callback
	if(is_valid_callback($_GET['callback']))
		exit("{$_GET['callback']}($json)");
		
} else {
	//Else.. redirect in case of request without JS
	if( $data['sent'] == '1') {
		if ($lang=='it'){
			header("Location: http://www.andreacarraro.it/grazie.html");
		} else {
			header("Location: http://www.andreacarraro.it/thankyou.html");
		}
		exit;
		}
	if( $data['sent'] == '0') {
		if ($lang=='it'){
			header("Location: http://www.andreacarraro.it/errore.html");
		} else {
			header("Location: http://www.andreacarraro.it/error.html");
		}
		exit;
		}
}
// Otherwise, bad request
header('status: 400 Bad Request', true, 400);
?>