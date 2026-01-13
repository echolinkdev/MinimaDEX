/**
 * Show various panels
 */

function navigate_clear(){
	id_view_maindex.style.display="none";
	id_view_wallet.style.display="none";
	id_view_allorders.style.display="none";
	id_view_history.style.display="none";
	id_view_help.style.display="none";
	id_view_settings.style.display="none";
}

function navigate_dex(){
	navigate_clear();
	id_view_maindex.style.display="block";
}

function navigate_wallet(){
	navigate_clear();
	id_view_wallet.style.display="block";
	
	//Reset balance.. will be cached by MiniMask anyway
	if(typeof MINIMASK !== "undefined"){
		fetchBalance(function(){
			updateBalancePanel();
		});
	}else{
		updateBalancePanel();
	}
}

function navigate_allorders(){
	navigate_clear();
	id_view_allorders.style.display="block";
}

function navigate_history(){
	navigate_clear();
	id_view_history.style.display="block";
}

function navigate_help(){
	navigate_clear();
	id_view_help.style.display="block";
}

function navigate_settings(){
	navigate_clear();
	id_view_settings.style.display="block";
}