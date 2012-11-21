// CSS and html layout changed to be more pleasant
// proxy value is NO LONGER stored in the form wth the hidden input field name = proxyVal
// proxy value is stored in browser localStore via the key name = mantaproxy
// Arrived from page now defaults to main Manta page, www.manta.com
// Select Menu now just populates text fields for IP and desc
// submit will store and display the data in the text fields as the current proxy
//    and adjust the Select list appropriately:
//      if ip not yet in select list then store the ip/description
//      else ip is already in the select list then set the description for the given ip
//    and store the Added Sites array into localStorage

var SBX = function (sbx) {
	this.ip				= sbx.ip;
	this.description	= sbx.description;
	this.isGoodIP		= function () { return /([0-9]{1,3}.){3}[0-9]{1,3})/.test(this.ip); }
	this.createOption	= function () { var ele = $('<option value="' + this.ip + '">' + this.description + ' (' + this.ip + ')</option>') 
		ele.sandbox = this;
		return ele;
	};
	this.getFields		= function () {
	    this.ip          = $("#proxyForm input[name=customProxyVal]" ).val();	// get the IP from the IP text input field
	    this.description = $("#proxyForm input[name=customProxyDesc]").val();	// get the desciption from the desciption text input field
	}
	this.setFields		= function () {
		$("#proxyForm input[name=customProxyVal]" ).val(this.ip);			// put the IP in the IP text input field
		$("#proxyForm input[name=customProxyDesc]").val(this.description);	// put the desciption in the desciption text input field
	}
};

var LOCALSTORAGE = function (storage_key) (
	if (! window.localStorage) {
		window.localStorage = {};
	}
	this.store		= function (thing) { localStorage[storage_key] = JSON.stringify(thing); };
	this.retrieve	= function () { return JSON.parse(localStorage[storage_key]); };
};

var CURRENTPROXY = function () {
	var storage		= new LOCALSTORAGE ('mantaproxy');
	this.store		= function (data) { return storage.store(data); };
	this.display	= function () { 
			var data = storage.retrieve();
			return $(".currentProxy").text( data.ip "  (" + data.description + ")" ); }
		};
};

var MSG = function (jq) {
	this.jq			= jq;
	this.color		= function (color) { this.jq.css("color", color); }
	this.text		= function (text)  { this.jq.text(text); }
	this.error		= function (text)  { this.color('#990000'); this.jq.text(text); }
	this.inform		= function (text)  { this.color('#fcdb14'); this.jq.text(text); }
	this.clear		= function (text)  { this.jq.text(''); }
}

var OPTIONGROUP = function (og) {
	this.id			= og.id;
	this.label		= og.label;
	this.group		= og.group;
	var storage		= new LOCALSTORAGE ('addedhosts');
	this.length		= function () { return group.length; }
	this.element	= function () { var og = $('<optgroup id="' + this.id + '" label="' + this.label + '"></optgroup>');
		each
		return og;
	}
	this.store		= function () { 
	}
}

var SELECTLIST = function (sl) {
	this.id			= sl.id;
	this.label		= sl.label;
	this.class		= sl.class;
	this.optgroups	= sl.optgroups;
	this.element	= function () {
		var html = '<option';
		if (this.id) {
		  html = html + ' id="' + this.id + '"';
		}
		if (this.class) {
		  html = html + ' class="' + this.class + '"';
		}
		html = html + '>' + this.label + '</option>';
 		var sl = $(html);
	};
}

// -----------------------------------------------------------------------------------------------------------

$(document).ready(function() {

	var cp = new CURRENTPROXY();
	cp.display();

	msg = new MSG( $("#ipMessage") );

	var defaultSites = new OPTIONGROUP ( {
		label: 
		group: [  new SBX({ ip: "216.12.148.77",   description: "production" })
				, new SBX({ ip: "10.28.16.166",    description: "ecnext15 (qa)" })
 				, new SBX({ ip: "10.28.16.211",    description: "ecnext30 (qa)" })
				, new SBX({ ip: "10.28.16.197",    description: "ecnext37 (dataqa)" })
 				, new SBX({ ip: "10.28.16.201",    description: "ecnext33 (comsite dev)" })
			   ],
		} );


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

