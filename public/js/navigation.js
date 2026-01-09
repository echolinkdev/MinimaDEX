/**
 * Show various panels
 */

function dex(){
	id_view_maindex.style.display="block";
	id_view_wallet.style.display="none";
	id_view_help.style.display="none";
	id_view_settings.style.display="none";
}

function wallet(){
	id_view_maindex.style.display="none";
	id_view_wallet.style.display="block";
	id_view_help.style.display="none";
	id_view_settings.style.display="none";
	
	//Reset balance.. will be cached by MiniMask anyway
	if(typeof MINIMASK !== "undefined"){
		fetchBalance();
	}
}

function help(){
	id_view_maindex.style.display="none";
	id_view_wallet.style.display="none";
	id_view_help.style.display="block";
	id_view_settings.style.display="none";
}

function settings(){
	id_view_maindex.style.display="none";
	id_view_wallet.style.display="none";
	id_view_help.style.display="none";
	id_view_settings.style.display="block";
}