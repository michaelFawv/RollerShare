// Roller created by Michael Fawver
// Copyright 2015 Michael Fawver All rights reserved.
 
var Roller = (function() {
	var _p = {
		parseXml: null,
		zipFileLoaded: null,
		skillDescriptions: {},
		userName: '',
		characterName: 'Someone',
		d20Distribution: [],

		initialize: function() {
			for(var i = 0; i < 20; i++) { 
				this.d20Distribution[i] = 0;
			}
		},
		
		setElementValue: function( elementName, elementValue) {
			if(document.getElementById(elementName)) {
				document.getElementById(elementName).value = elementValue;
			}
		},
		
		getElementValue: function( elementName ) {
			var elementValue = '';
			if(document.getElementById(elementName)) {
				elementValue = document.getElementById(elementName).value;
			}
			return elementValue;
		},
		
		setCookie: function(cname, cvalue, exdays) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays*24*60*60*1000));
			var expires = 'expires='+d.toUTCString();
			document.cookie = cname + '=' + cvalue + '; ' + expires;
		},

		getCookie: function (cname) {
			var name = cname + '=';
			var ca = document.cookie.split(';');
			for(var i=0; i<ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1);
				if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
			}
			return '';
		},
		
		findXMLStatblockFileName: function (indexFile) {
			var xml = this.parseXml(indexFile.asText());
			var statBlocks = xml.getElementsByTagName('statblock');
			var fileName = '';
			for (var i=0; i < statBlocks.length; i++) {
				if(statBlocks[i].attributes['format'].value === 'xml') {
					fileName = statBlocks[i].attributes['folder'].value + '/' + statBlocks[i].attributes['filename'].value;
					break;
				}
			}
			return fileName;
		},
		
		makeCharacterStuff: function (characterFile)
		{
			var xmlDoc = this.parseXml(characterFile.asText());
			var characters = xmlDoc.getElementsByTagName('character');
			var character = characters[0];

			character.children['57'].remove(); // remove minions so their stats don't get mixed in

			this.writeInitTable(character);

			this.writeCharacterDescription(character);
			
			this.writeWeaponTable(character);

			this.writeSavesTable(character);
			
			this.writeCMBTable(character);
			
			this.writeCMDTable(character);
			
			this.writeAttributesTables(character);

			this.writeSkillsTable(character);

		},
		
		removeAllChildren: function (element) {
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
		},
		
		writeInitTable: function (character) {
			var element = document.getElementById('init');
			if(!element) { return; }
			this.removeAllChildren(element);
			
			var init = character.getElementsByTagName('initiative');
			var initRoll = init[0].attributes['total'];
			
			var input = document.createElement('input');
			input.type = 'button';
			input.value = 'Initiative ' + initRoll.value;
			input.onclick = function(){
				Roller.OnRoll( Number(initRoll.value), 20, 'Initiative' );
			}
			element.appendChild(input);
		},

		writeCharacterDescription: function (character) {
			var element = document.getElementById('char');
			if(!element) { return; }
			this.removeAllChildren(element);

			var name = character.attributes['name'].value;
			this.characterName = name;
			this.enableChartButton();  //We can do this because we now have a name
			var playerName = character.attributes['playername'].value;
			userName = playerName;
			var classes = character.getElementsByTagName('classes');
			var classText = classes[0].attributes['summary'].value;
			
			var race = character.getElementsByTagName('race');
			var raceText = race[0].attributes['racetext'].value;
			
			var personal = character.getElementsByTagName('personal');
			var gender = personal[0].attributes['gender'].value;
			var descrip = personal[0].getElementsByTagName('description');
			var description = descrip[0].textContent
			
			var alignment = character.getElementsByTagName('alignment');
			var alignmentText = alignment[0].attributes['name'].value;
			
			var armoclass = character.getElementsByTagName('armorclass');
			var ac = armoclass[0].attributes['ac'].value;
			var touch = armoclass[0].attributes['touch'].value;
			var flatfooted = armoclass[0].attributes['flatfooted'].value;
			
			
			var span1 = document.createElement('span');
			span1.title = description;
			span1.appendChild( document.createTextNode(name + ': '));
			
			var span2 = document.createElement('span');
			span2.appendChild( document.createTextNode(classText + ', ' + gender + ' ' + raceText + ', ' + alignmentText + ', '));
			
			var span3 = document.createElement('span');
			span3.title = ' Touch: ' + touch +  ', Flat footed: ' + flatfooted;
			span3.appendChild( document.createTextNode('AC: ' + ac));
						
			var span4 = document.createElement('span');
			span4.appendChild( document.createTextNode(' Player: ' + playerName));
						
			var myParagraph = document.createElement('p');
			myParagraph.style = 'margin: 3px 0px;';  // make the spacing a bit smaller. default for a paragraph is 16 0
			myParagraph.appendChild(span1);
			myParagraph.appendChild(span2);
			myParagraph.appendChild(span3);
			myParagraph.appendChild(document.createElement('br'));
			myParagraph.appendChild(span4);
			element.appendChild(myParagraph);
		},
		
		writeCMBTable: function (character) {
			var maneuvers = character.getElementsByTagName('maneuvers');
			var cmbRoll = maneuvers[0].attributes['cmb'];
			var element = document.getElementById('cmb');
			if(!element) { return; }
			this.removeAllChildren(element);
			
			var input = document.createElement('input');
			input.type = 'button';
			input.value = 'CMB ' + cmbRoll.value;
			input.onclick = function(){
				Roller.OnRoll( Number(cmbRoll.value), 20, 'CMB' );
			}
			element.appendChild(input);
		},
		
		writeCMDTable: function (character) {
			var maneuvers = character.getElementsByTagName('maneuvers');
			var cmd = maneuvers[0].attributes['cmd'];
			var cmdflatfooted = maneuvers[0].attributes['cmdflatfooted'];
			var element = document.getElementById('cmd');
			if(!element) { return; }
			this.removeAllChildren(element);
			
			element.appendChild( document.createTextNode('CMD: ' + cmd.value));
			element.appendChild( document.createElement('br'));
			element.appendChild( document.createTextNode('Flat footed: ' + cmdflatfooted.value));
		},

		writeAttributesTables: function (character) {
			var attribRowOut = function (attrib) {
				var name = attrib.attributes['name'].value;
				var attrBonus = attrib.getElementsByTagName('attrbonus');
				var attrValue = attrib.getElementsByTagName('attrvalue');
				var bonus = attrBonus[0].attributes['modified'].value;
				var value = attrValue[0].attributes['modified'].value;

				var row = document.createElement('tr');
				var data = document.createElement('td');
				var input = document.createElement('input');
				input.type = 'button';
				input.value = name + ' ' + value + ': ' + bonus;
				input.title = 'Roll ' + name + ' check';
				input.style = 'width:100%';
				input.onclick = function(){
					Roller.OnRoll( Number(bonus), 20, name );
				}
				
				data.appendChild(input);
				row.appendChild(data);
				return row;
			}
			
			var attributesElement = character.getElementsByTagName('attributes');
			var attributes = attributesElement[0].getElementsByTagName('attribute');
			var count = attributes.length;
			var i=0;
			
			var element = document.getElementById('str');
			if(!element) { return; }
			this.removeAllChildren(element);

			var table = document.createElement('table');
			element.appendChild(table);
			for (;i<count/2;i++)
			{
				table.appendChild( attribRowOut(attributes[i]) );
			}
			
			var element = document.getElementById('int');
			if(!element) { return; }
			this.removeAllChildren(element);

			var table2 = document.createElement('table');
			element.appendChild(table2);
			for (;i<count;i++)
			{
				table2.appendChild( attribRowOut(attributes[i]) );
			}
		},

		writeWeaponTable: function (character) {
						
			var appendWeaponRows = function (weaponTable, weapons) {
				// do it this way, [].forEach.call, to fake a for each over weapons that is an HTMLCollection not an array
				[].forEach.call(weapons, function(element, index) {
					var attributes = element.attributes;
					var description = element.getElementsByTagName('description');
					var equipped = (attributes.hasOwnProperty('equipped') && attributes['equipped'].value.length > 0);
					var attackStrings = [];

					var weaponRow = document.createElement('tr');
					if(equipped) { 
						weaponRow.style = 'background-color:#99EB99;';
					}
					
					var td = document.createElement('td');
					td.title = description[0].textContent;
					if(equipped) { 
						td.style = 'font-weight: bold;';
					}
					td.appendChild(document.createTextNode(attributes['name'].value));
					weaponRow.appendChild(td);

					td = document.createElement('td');
					td.appendChild(document.createTextNode('Critical ' + attributes['crit'].value));
					weaponRow.appendChild(td);
					
					var attacks = attributes['attack'].value.split('/');
					
					attackStrings = [];
					var i;
					var arrayLength = attacks.length;
					for (i = 0; i < arrayLength; i++) {
						attackStrings.push([Number(attacks[i]), 20, 'Attack ' + (i+1).toString() + ' with ' + attributes['name'].value, attributes['crit'].value]);
					}
					
					td = document.createElement('td');
					var input = document.createElement('input');
					input.type = 'button';
					input.value = 'Full';
					input.title = 'This rolls each of the following attacks once.';
					var setFullClick = function() {
						input.onclick = function() {
							Roller.RollFullAttack( attackStrings[0], attackStrings[1], attackStrings[2], attackStrings[3] );
						};
						td.appendChild(input);
						weaponRow.appendChild(td);
					};
					setFullClick.call();

					attackStrings.forEach( function(element, index) {
						td = document.createElement('td');
						input = document.createElement('input');
						input.type = 'button';
						input.value = 'Attack ' + (index+1).toString() + ' ' + attacks[index];
						input.style = 'width:100%';
						
						var setClickAndAppend = function() {
							input.onclick = function() {
								Roller.RollAttack.apply(null, element);
							};
							td.appendChild(input);
							weaponRow.appendChild(td);
						};
						setClickAndAppend.call();
					}, this);
					
					td = document.createElement('td');
					input = document.createElement('input');
					input.type = 'button';
					input.value = 'Damage ' + attributes['damage'].value;
					input.style = 'width:100%';
					var setDieClick = function() {
						input.onclick = function() {
							Roller.OnRollDie( attributes['damage'].value , 'Damage' );
						};
						td.appendChild(input);
						weaponRow.appendChild(td);
					};
					setDieClick.call();

					weaponTable.appendChild(weaponRow);
				}, this);
			}
			
			var element = document.getElementById('weapons');
			if(!element) { return; }
			this.removeAllChildren(element);

			var weaponTable = document.createElement('table');
			element.appendChild(weaponTable);
			
			var melee = character.getElementsByTagName('melee');	
			for (var i=0;i<melee.length;i++)
			{ 
				var weapons = melee[i].getElementsByTagName('weapon');
				appendWeaponRows(weaponTable, weapons);
			}
			
			var ranged = character.getElementsByTagName('ranged');		
			for (i=0;i<ranged.length;i++)
			{ 
				weapons = ranged[i].getElementsByTagName('weapon');
				appendWeaponRows(weaponTable, weapons);
			}
			
		},

		writeSavesTable: function (character) {
			var element = document.getElementById('saves');
			if(!element) { return; }
			this.removeAllChildren(element);

			var table = document.createElement('table');
			table.class = 'none';
			
			var saves=character.getElementsByTagName('saves');
			var savingThrow = saves[0].getElementsByTagName('save'); // assume one set of saves
			[].forEach.call(savingThrow, function(element, index) {
				var attributes = element.attributes;
				var row = document.createElement('tr');
				var td = document.createElement('td');
				td.appendChild(document.createTextNode(attributes['name'].value));
				row.appendChild(td);
				td = document.createElement('td');

				input = document.createElement('input');
				input.type = 'button';
				input.value = attributes['save'].value;
				input.style = 'width:100%';
				var setClick = function() {
					input.onclick = function() {
						Roller.OnRoll( Number(attributes['save'].value) , 20, attributes['name'].value );
					};
					td.appendChild(input);
					row.appendChild(td);
				};
				setClick.call();
				
				table.appendChild(row);
			}, this);
				
			element.appendChild(table);
		},

		writeSkillsTable: function (character) {
			var me = this;
			var skillsOut = function (skill, row) {
				var attributes = skill.attributes;
				var description = skill.getElementsByTagName('description');
				var notUseable = attributes.hasOwnProperty('usable') ? attributes['usable'].value === 'no' : false;
				me.skillDescriptions[attributes['name'].value] = description[0].textContent;

				var td = document.createElement('td');
				td.title = (notUseable ? '(Unusable) ' : '') + 'Click to see description';
				td.style = notUseable ? 'color:#4B4B4B;' : '';
				td.onclick = function(){
					Roller.ShowSkillPopup( attributes['name'].value );
				}
				td.appendChild(document.createTextNode(attributes['name'].value));
				row.appendChild(td);
				
				td = document.createElement('td');
				var input = document.createElement('input');
				input.type = 'button';
				
				var sign = '+';
				if(attributes['value'].value < 0) {
					sign = '';
				}
				input.value = sign + attributes['value'].value;
				input.style = 'width:100%';
				if(notUseable) {
					input.disabled = 'true';
				}
				input.onclick = function(){
					Roller.OnRoll( Number(attributes['value'].value), 20, attributes['name'].value );
				}
				
				td.appendChild(input);
				row.appendChild(td);
			}
			
			var element = document.getElementById('skills');
			if(!element) { return; }
			this.removeAllChildren(element);

			var table = document.createElement('table');
			table.class = 'none';

			var skills=character.getElementsByTagName('skill');
			var numberOfRows = ~~((skills.length / 4)+0.5);
			for (var i=0;i<numberOfRows;i++)
			{ 
				var row = document.createElement('tr');
				var index = i;
				if( index < skills.length) { 
					skillsOut(skills[index],row);
				}
				index = i + numberOfRows;
				if( index < skills.length) { 
					skillsOut(skills[index],row);
				}
				index = i + (numberOfRows * 2);
				if( index < skills.length) { 
					skillsOut(skills[index],row);
				}
				index = i + (numberOfRows * 3);
				if( index < skills.length) { 
					skillsOut(skills[index],row);
				}
				table.appendChild(row);
			}
			element.appendChild(table);

		},
		
		addStringToLog: function (string, color, doNotSend) {
			//this.setElementValue('logText',  string + '\n' + this.getElementValue('logText'));
			if(color === undefined) {
				color = 'Black';
			}
			if(doNotSend === undefined) {
				doNotSend = false;
			}
			var element = document.getElementById('logText');
			if(element) {
				var span = document.createElement('span');
				span.style = "color: " + color;
				
				span.appendChild( document.createTextNode(string));
				span.appendChild(document.createElement('br'));
				
				element.insertBefore(span, element.firstChild);
			}
			
			var muteElement = document.getElementById('mute');
			var sharingMuted = false;
			if(muteElement) { 
				sharingMuted = !!muteElement.checked; 
			}
			if(!sharingMuted && !doNotSend) {
				sendMessage(this.characterName + ': ' + string, this.characterName);
			}
		},
		
		calcAndLogRandom: function(die) {
			var randomValue = Math.floor( (Math.random() * die) + 1 );
			if(die === 20) {
				this.d20Distribution[randomValue-1] += 1; // count how many of each value was rolled on te d20 this session.
				sendRollUpdate(this.characterName, this.d20Distribution);
			}
			return randomValue;
		},
		
		comp: function  (s, m, n, f, a) {
			m = parseInt( m );
			if( isNaN( m ) ) m = 1;
			n = parseInt( n );
			if( isNaN( n ) ) n = 1;
			f = parseInt( f );
			a = typeof(a) == 'string' ? parseInt( a.replace(/\s/g, '') ) : 0;
			if( isNaN( a ) ) a = 0;
			var r = 0;
			for( var i=0; i<n; i++ )
				r += this.calcAndLogRandom(f);
			var total = r * m + a;
			return '(' + r + ' + ' + a + '): ' + total;
		},
		
		parse: function ( de ) {
			var secondaryDamageString = '';
			var mainDamageString = '';
			var endOf = 0;
			var startOfLastPart = 0;
			var firstString = '';
			var secondString = '';

			var post = de.match(/plus (.*$)/i);
			if (post) {
				endOf = de.indexOf(post[0]);
				startOfLastPart = de.indexOf(post[1]);
				firstString = de.substring(0, endOf );
				secondString = de.substring(startOfLastPart, de.length );
				mainDamageString = this.comp.apply( this, firstString.match(/(?:(\d+)\s*\*\s*)?(\d*)d(\d+)(?:\s*([\+\-]\s*\d+))?/i) );
				secondaryDamageString = this.comp.apply( this, secondString.match(/(?:(\d+)\s*\*\s*)?(\d*)d(\d+)(?:\s*([\+\-]\s*\d+))?/i) );
			} else {	
				mainDamageString = this.comp.apply( this, de.match(/(?:(\d+)\s*\*\s*)?(\d*)d(\d+)(?:\s*([\+\-]\s*\d+))?/i) );
			}
			
			var damageString = mainDamageString;
			if(secondaryDamageString.length > 0) {
				damageString = damageString + '\n       plus ' + secondString + ' ' + secondaryDamageString;
			}
			
			return damageString;
		},
		
		// this is just for a joke page
		writeDMRoller: function() {
			var element = document.getElementById('DMRoller');
			if(!element) { return; }
			element.innerHTML = '';
			var html = '<center>';
			html += '<H1> DM Big Button Attack Roller</H1>  <BR><BR>';
			html += "<INPUT style=\"width: 200px;  height: 75px;  \"  onclick=\"Roller.OnRoll( 0, 3, 'DM Rolled a' ) \" type=\"button\" value=\" Roll a D20 to attack \" name=\"rollbtn\" />";
			html += "</center>";
			element.innerHTML = html;

		},
		
		enableChartButton: function() {
			var element = document.getElementById('chartbtn');
			if(!element) { return; }
			element.disabled = false;
		}
		

	};
	
	/////////////////////////////
	// start of public members //
	return {
	
		init: function () {
			if (typeof window.DOMParser != 'undefined') {
				_p.parseXml = function(xmlStr) {
					return ( new window.DOMParser() ).parseFromString(xmlStr, 'text/xml');
				};
			} else if (typeof window.ActiveXObject != 'undefined' &&
				   new window.ActiveXObject('Microsoft.XMLDOM')) {
				_p.parseXml = function(xmlStr) {
					var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
					xmlDoc.async = 'false';
					xmlDoc.loadXML(xmlStr);
					return xmlDoc;
				};
			} else {
				throw new Error('No XML parser found');
			}
			
			_p.initialize();
			
			_p.setElementValue('rollString1', _p.getCookie('rollString1'));
			_p.setElementValue('rollString2', _p.getCookie('rollString2'));
			_p.setElementValue('rollString3', _p.getCookie('rollString3'));
			_p.setElementValue('rollString4', _p.getCookie('rollString4'));
			_p.setElementValue('rollString5', _p.getCookie('rollString5'));
			_p.setElementValue('rollString6', _p.getCookie('rollString6'));
			
			
			_p.writeDMRoller(); // this will only be there for a joke.
			
		},
		
		onInputBlur: function (itemName) {
			_p.setCookie( itemName, _p.getElementValue(itemName), 90);
		},
		
		inputFile_Changed: function ()
		{
			var inputFile = document.getElementById('inputFile');
			if(!inputFile) { return; }
			var zipFileToLoad = inputFile.files[0];

			var fileReader = new FileReader();

			fileReader.onload = function(fileLoadedEvent) 
			{
				try {
					var zip = new JSZip();
					var zipFileLoaded = zip.load(fileLoadedEvent.target.result);

					var indexFile = zipFileLoaded.files['index.xml'];
					var characterFileName = _p.findXMLStatblockFileName(indexFile);
					var characterFile = zipFileLoaded.files[characterFileName];
					_p.makeCharacterStuff(characterFile);
					if(document.getElementById('refresh')) {
						document.getElementById('refresh').hidden = false;
						document.getElementById('refresh').style.color = 'black';
					}
				} catch (e) {
					if(document.getElementById('refresh')) {
						document.getElementById('refresh').style.color = 'red';
					}
				}
			};

			fileReader.readAsArrayBuffer(zipFileToLoad);
		},
		
		onRefreshClick: function () {
			document.getElementById('refresh').style.color = 'green';
			this.inputFile_Changed();
		},
		
		clearLog: function () {
			var element = document.getElementById('logText');
			if(element) {
				_p.removeAllChildren(element);
			}
		},
		
		rollFromRoller: function (baseDie)
		{
			var number = _p.getElementValue('numberOfDice');
			var plus = _p.getElementValue('plusToDice') ? _p.getElementValue('plusToDice') : '0';
			var sign = '+';
			if(plus < 0) {
				sign = '';
			}
			var rollString = number + baseDie + '+' + plus;
			this.OnRollDie(rollString, 'Rolled' );
		},

		clearRoller: function () {
			_p.setElementValue('numberOfDice', 1);
			_p.setElementValue('plusToDice', '');
		},

		rollRollString: function (which) {
			var elementName = 'rollString' + which;
			var string = _p.getElementValue(elementName);
			if(string.length > 0) {
				this.OnRollDie(string, 'Rolled' );
			} else {
				_p.addStringToLog('Must enter a roll string.', 'Red', true);
			}
		},

		OnRoll: function (plusValue, die, label) {
			var roll = _p.calcAndLogRandom(die);
			var sum = roll + plusValue;
			var sign = ' + ';
			if(plusValue < 0) {
				sign = '';
			}			
			var rollString = label + ' ( ' + roll + sign + plusValue + ' ) Total: ' + sum;
			_p.addStringToLog(rollString);
		},

		OnRollDie: function (dieString, label ) {
			var rollString = label + ' ' + dieString + ' ' + _p.parse(dieString);
			_p.addStringToLog( rollString );
		},
		
		RollFullAttack: function (attack1, attack2, attack3, attack4) {
			// just bad code, but it works
			_p.addStringToLog( '^Full^', 'Black', false);
			this.RollAttack(attack1[0],attack1[1],attack1[2],attack1[3]);
			if( attack2 && attack2.length > 1 ) {
				this.RollAttack(attack2[0],attack2[1],attack2[2],attack2[3]);
			}
			if( attack3 && attack3.length > 1 ) {
				this.RollAttack(attack3[0],attack3[1],attack3[2],attack3[3]);
			}
			if( attack4 && attack4.length > 1 ) {
				this.RollAttack(attack4[0],attack4[1],attack4[2],attack4[3]);
			}
		},
		
		RollAttack: function (plusValue, die, label, critString) {
			//var regex = /\d*/i;
			var multiplier = critString.match(/\d*$/i);
			var lowCritRoll = critString.match(/\d*/i);
			if(lowCritRoll == '') {
				lowCritRoll = '20';
			}
			lowCritRoll = parseInt(lowCritRoll); // changes type
			var highCritRoll = critString.match(/\d*(?=\/)/i);
			if(highCritRoll == '') {
				highCritRoll = '20';
			}
			highCritRoll = parseInt(highCritRoll); // changes type
			
			var roll = _p.calcAndLogRandom(die);
			var isCriticalThreat = false;
			if(roll >= lowCritRoll) {
				isCriticalThreat = true;
			}
			
			var sum = roll + plusValue;
			
			var rollString = '';
			if(isCriticalThreat) {
				var sign = ' + ';
				if(plusValue < 0) {
					sign = '';
				}			
				rollString = '**** ' + label + ' ( ' + roll + sign + plusValue + ' ) AC: ' + sum;

				roll = _p.calcAndLogRandom(die);
				sum = roll + plusValue;
				
				sign = ' + ';
				if(plusValue < 0) {
					sign = '';
				}			
				var critRollString = '**** Critical Threat X' + multiplier + ' ( ' + roll + sign + plusValue + ' ) to AC: ' + sum;
				_p.addStringToLog(critRollString, 'Green');
				_p.addStringToLog(rollString, 'Green');

			} else {
				var sign = ' + ';
				if(plusValue < 0) {
					sign = '';
				}			
				rollString = label + ' ( ' + roll + sign + plusValue + ' ) AC: ' + sum;
				_p.addStringToLog(rollString);
			}
		},
		
		ShowSkillPopup: function(name) {
			alert(_p.skillDescriptions[name]);
		},
		
		rollsChartLoaded: function(name) {
			if(name === _p.characterName) {
				sendRollUpdate(_p.characterName, _p.d20Distribution);
			}
		},
		
		openRollsChart: function() {
			var url = "Chart.html?" + encodeURIComponent(_p.characterName);
			window.open(url, '_blank');
		},
		
		handleMessageFromServerToClients: function(message) {
			console.log('Got message from server: ' + message);
		}
	}
}());
     
     