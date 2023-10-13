function exceptionHandler(jqXHR, textStatus, error) {
    var exceptionMessage = jqXHR.responseText?.toString();
    console.log(exceptionMessage);
    if (exceptionMessage.includes('"message"'))
			exceptionMessage = exceptionMessage.slice(
				exceptionMessage.indexOf('"message"') + 10,
				exceptionMessage.indexOf('"statusCode"') - 1
			);
	var errorMessage = textStatus + ' ' + jqXHR.status + ', ' + error + '\n' + exceptionMessage;
	alert(`Request failure exceptionMessage: ${errorMessage}`);
}