var SBX = function (sbx) {
	this.ip = sbx.ip;
	this.description = sbx.description;
	this.createOption = function () { return $('<option value="' + this.ip + '">' + this.description + ' (' + this.ip + ')</option>') };
};

var localStorage = function () (
		if (! window.localStorage) {
			window.localStorage = {};
		}
};









// CSS and html layout changed to be more pleasant
// proxy value is NO LONGER stored in the form wth the hidden input field name = proxyVal
// proxy value is stored in browser localStore via the cookie name = mantaproxy
// Referred page now defaults to main Manta page, www.manta.com
// Select Menu now just populates text fields for IP and desc
// submit will set the the cookie and adjust the Select list appropriately

$(document).ready(function() {
	$(".currentProxy").text($.cookie('mantaproxy'));
//	$('#proxyForm input[name=proxyVal]').val($.cookie('mantaproxy'));

	var defaultSites = [];
	if (! window.localStorage) {
		window.localStorage = {};
	}
// these should come from a config file!!
	defaultSites = 
		[ new SBX({ ip: "216.12.148.77",   description: "production" })
		, new SBX({ ip: "10.28.16.166",    description: "ecnext15 (qa)" })
 		, new SBX({ ip: "10.28.16.211",    description: "ecnext30 (qa)" })
		, new SBX({ ip: "10.28.16.197",    description: "ecnext37 (dataqa)" })
 		, new SBX({ ip: "10.28.16.201",    description: "ecnext33 (comsite dev)" })
		//, { ip: "", description: "" },
		];
	var mySites = [];
	if (localStorage.mySites) {
		mySites = $.map(JSON.parse(localStorage.mySites), function (site) { return new SBX(site) } ); 							// and in the mySites array;
	}
	

	setArrivedFromURL();
	populateSelectList(sandboxSelectList(),defaultSites,mySites);

	$(".selectProxy").change(function() {                               // Select an IP/Description from the list
	    var selectedIP = $(".selectProxy").val();                       // get the choosen IP
	    var selectedDesc = $("select option:selected").text();          // get the choosen description
		selectedDesc = selectedDesc.replace(/ \([0-9][^)]+\)/,'');

	    $("#proxyForm input[name=customProxyVal]").val(selectedIP);     // put the IP in the IP text input field
	    $("#proxyForm input[name=customProxyDesc]").val(selectedDesc);  // put the desciption in the desciption text input field
	});

	$("#proxyForm input[name=customProxyVal]").blur(cycleNetworks);
	$("#proxyForm input[name=customProxyDesc]").blur(cycleNetworks);

	$("#proxyForm").submit(function() {

		var selectedIP    =  $(".selectProxy :selected").val();
		var selectedDesc  =  $(".selectProxy :selected").text();
		selectedDesc      = selectedDesc.replace(/ \([0-9][^)]+\)/,'');

		var textIPField   = $("#proxyForm input[name=customProxyVal]");
		var textDescField = $("#proxyForm input[name=customProxyDesc]");
		var textIP        = textIPField.val();
		var textDesc      = textDescField.val();

		var inMySites     = false;
		var optgroup      = $('optgroup #mySites');

		var goodIP = new RegExp('([0-9]{1,3}.){3}[0-9]{1,3})').test(textIP);
		if ( ! goodIP ) { 				      			                // text fields for ip populated from select
			errorMessage("you have entered an invalid or incomplete IP address");
			return false;
		}

		if ( textIP === selectedIP ) {                                  // IP text field for select and input are the same
			if ( selectedDesc != textDescField.val() ) {				// check that description is the same
				$.each(mySites, function () { 							// and in the mySites array
					if ( this.ip === textIP ) { 						
		    			this.description = textDescField.val();
						populateSelectList(sandboxSelectList(),defaultSites,mySites);
					}
				});
			};
		} else {                                                        // new IP and description typed into the text field
			$.each(mySites, function (i) { 								// go thru IP's already stored in mySites,
				if ( textIP === this.ip ) { 							// if entry is there
					inMySites = true;									// set found flag and set description field
		    		this.description = textDescField.val();
					populateSelectList(sandboxSelectList(),defaultSites,mySites);
				}
			});
			if ( ! inMySites ) {
				var entry = {
					ip: textIP,
					description: textDescField.val() || "SANDBOX",
				};
				populateSelectList(sandboxSelectList(),defaultSites,mySites);
//				entry.description = entry.description + "<super>*</super>";
				mySites.push(entry);
			}
		}
		if (window.localStorage && window.JSON) {
			localStorage.mySites = JSON.stringify(mySites);
		}
		$.cookie('mantaproxy', textIP, { path: "/", domain: "manta.com" });
		$(".currentProxy").text($.cookie('mantaproxy'));
		return false;
	});
});

function sandboxSelectList () {
	var selectList=$("select [name=selectProxy]");
	if ( selectList.length > 0 ) { // have one, so use it
		selectList = $("select [name=selectProxy]")[0];
		selectList.empty();
	} else {
		selectList = $('<select name="selectProxy" class="selectProxy"></select>');
    }
	$(".selectListContainer").empty();
	$(".selectListContainer").append(selectList);

	selectList.addGroup = function (id, label, list) {
		optgroup=$('<optgroup id="'+id+'" label="'+label+'"></optgroup>');
		$.each(list, function() { optgroup.append(this.createOption()); });
		this.append(optgroup);
		return this;
	};

	return selectList;
}

function populateSelectList(selectList, defaultSites,mySites) {
	
	selectList.append($('<option value="">select a server...</option>'));

	selectList.addGroup("defaultSites", "Default Sites", defaultSites);
	
	selectList.addGroup("mySites", "Added Sites", mySites);
}

function setArrivedFromURL() {
	var urlParam = function(name) {
		var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
		return results ? results[1] : 0;
	};
	var ref = urlParam("ref");
	if (ref) {
		$(".refLink").attr("href", ref);
		$(".refLink").text(ref);
		$(".refLinkContainer").show();
	} else { // sparker adds default of company home page on 2012/4/4
		$(".refLink").attr("href", "http://www.manta.com");
		$(".refLink").text("http://www.manta.com");
		$(".refLinkContainer").show();
	}
}

function errorMessage(message) {
	colorMessage('#990000',message)
}
function goldMessage(message) {
	colorMessage('#fcbd14',message)
}
function colorMessage(color,message) {
			$("#ipMessage").css("color",color);
			$("#ipMessage").text(message);
}

function cycleNetworks() {
	var textIPField  = $("#proxyForm input[name=customProxyVal]");
	var textDescField = $("#proxyForm input[name=customProxyDesc]");
	var textIP = textIPField.val();
	if ( textIP == '192.168.241.' ) {
		textIPField.val('10.28.16.');
        textDescField .val('ecnext');
		goldMessage("network containing QA and Developement servers, ie. ecnext15 and ecnext30");
	}
	if ( textIP == '10.28.16.' ) {
		textIPField.val('216.12.148.');
        textDescField .val('production');
		goldMessage("outside network containing Production servers, ie. ecnext55");
	}
	if ( textIP == '216.12.148.' || ( textIP == '' ) ) {
		textIPField.val('192.168.241.');
        textDescField .val('-sbx');
		goldMessage("internal network containing all sandboxes (240 & 241), all hostnames should end with '-sbx'");
	}
}









