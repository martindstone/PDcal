var colors = ["#0000f0", "#007100", "#007171", "#007900", "#008300", "#009500", "#009595", "#009f00", "#009f9f", "#00a377", "#00b400", "#00bad6", "#00c791", "#00d198", "#00d800", "#00e200", "#050", "#0c2e0c", "#0fceeb", "#0fd7f5", "#134b13", "#155315", "#161663", "#1c1c81", "#1e1e89", "#1f1ff5", "#1f1fff", "#294545", "#2a8050", "#2b2b2b", "#2fc12f", "#3091ad", "#339a61", "#345fdf", "#350000", "#365c5c", "#36a265", "#371801", "#3a6262", "#3d3d3d", "#410d41", "#420073", "#423880", "#42a2be", "#434343", "#44a9c6", "#49cb49", "#4bd34b", "#4d602a", "#4f4399", "#5347a0", "#5377e4", "#560097", "#590000", "#5a2702", "#5b7ee5", "#5c00a1", "#5f125f", "#5f4ec9", "#607935", "#628220", "#630000", "#642b02", "#668039", "#681468", "#6e0b0b", "#710071", "#742918", "#7869d2", "#789f27", "#7e0000", "#7e3e11", "#7ea729", "#7f71d4", "#831fdf", "#8f0e0e", "#902fc0", "#92341f", "#9440e1", "#950095", "#980f0f", "#992727", "#9946e6", "#9a3720", "#9d4e15", "#9f009f", "#9f48cb", "#a20000", "#a54ad3", "#a65217", "#aa7b0a", "#ac0000", "#b42f2f", "#b9147c", "#bc3131", "#cb940c", "#ce1338", "#d21f8f", "#d59b0d", "#db2095", "#dd284c", "#e6284f", "#f00000", "#f04100", "#f06b00", "#f09b00", "#f51f1f", "#f5581f", "#f57e1f", "#f5a91f", "#fd2b9c", "#ff058c", "#ff1f1f", "#ff33a1", "#ff5b1f", "#ff831f", "#ffb01f"];

// var calColors = [ "#B3001B", "#262626", "#255C99", "#7EA3CC", "#CCAD8F", "#0F7173", "#DF3B57", "#F9DC5C", "#3185FC", "#053C5E", "#8F2D56", "#1f1fff", "#294545", "#2a8050", "#2b2b2b", "#2fc12f", "#3091ad", "#339a61", "#345fdf", "#350000", "#365c5c", "#36a265", "#371801", "#3a6262", "#3d3d3d", "#410d41", "#420073", "#423880", "#42a2be", "#434343", "#44a9c6", "#49cb49", "#4bd34b", "#4d602a", "#4f4399", "#5347a0", "#5377e4", "#560097", "#590000", "#5a2702", "#5b7ee5", "#5c00a1", "#5f125f", "#5f4ec9", "#607935", "#628220", "#630000", "#642b02", "#668039", "#681468", "#6e0b0b", "#710071", "#742918", "#7869d2", "#789f27", "#7e0000", "#7e3e11", "#7ea729", "#7f71d4", "#831fdf", "#8f0e0e", "#902fc0", "#92341f", "#9440e1", "#950095", "#980f0f", "#992727", "#9946e6", "#9a3720", "#9d4e15", "#9f009f", "#9f48cb", "#a20000", "#a54ad3", "#a65217", "#aa7b0a", "#ac0000", "#b42f2f", "#b9147c", "#bc3131", "#cb940c", "#ce1338", "#d21f8f", "#d59b0d", "#db2095", "#dd284c", "#e6284f", "#f00000", "#f04100", "#f06b00", "#f09b00", "#f51f1f", "#f5581f", "#f57e1f", "#f5a91f", "#fd2b9c", "#ff058c", "#ff1f1f", "#ff33a1", "#ff5b1f", "#ff831f", "#ffb01f"];

function getParametersByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var matches = [];
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)", "g");
    var match = regex.exec(location.search);
    while (match != null) {
	    matches.push(match[1]);
	    match = regex.exec(location.search);
    }
    if ( matches.length < 1 ) {
	    return null;
    }
    
    return matches.map(function(match) {
	    return decodeURIComponent(match.replace(/\+/g, " "));
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function main() {
	var urls = getParametersByName("iCalURL");
	if ( !urls ) {
		$('#calendar').html('<h1>Please put a PagerDuty iCal URL in the iCalURL parameter</h1>');
		return;
	}
	$('.busy').show();
	
	var calNames = [];
	var calColors = {};
	var events = [];
	var peopleColors = {};
	var outstanding_requests = 0;
	
	urls.forEach(function(url, index) {
		
		outstanding_requests++;
		url = `https://salty-coast-73995.herokuapp.com/${url}`
	
		$.ajax({
			url: url,
			type: "text",
			method: "get",
			headers: {
				"Origin": "local"
			},
			success: function(data) {
				outstanding_requests--;
				var jcalData = ICAL.parse(data);
				var comp = new ICAL.Component(jcalData);
				
				var calName = comp.getFirstProperty("x-wr-calname").getFirstValue();
				calNames.push(calName);
				calColors[calName] = colors[outstanding_requests];
				
				var vevents = comp.getAllSubcomponents("vevent");
				vevents.forEach(function(vevent) {
					var event = new ICAL.Event(vevent);
					var title = event.summary.replace(/^On Call - /g, '');
					title = title.replace(/ - .*$/, '');
					if ( ! peopleColors[title] ) {
						peopleColors[title] = colors[Math.floor(Math.random() * colors.length)];
					}

					var startdate = new Date(event.startDate.toUnixTime() * 1000);
					var enddate = new Date(event.endDate.toUnixTime() * 1000);

					events.push({
						title: title,
						start: startdate,
						end: enddate,
						color: urls.length > 1 ? calColors[calName] : peopleColors[title],
						weburl: event._firstProp("url")
					});
				});
				
				if (outstanding_requests == 0) {
					$('.busy').hide();
					var headline = '<h1 style="background-color: #f0f0f0">';
					if ( calNames.length == 1 ) {
						headline += calNames[0];
						headline += '</h1><br>';
					} else {
						headline += 'On Call Schedules for: </h1><h3 style="background-color: #f0f0f0">';
						var calNamesHTML = calNames.map(function(calName, index) {
							return '<div style="background-color: ' + calColors[calName] + '; border-radius: 10px; width: 30px; display: inline-block">&nbsp;&nbsp;</div> ' + calName.replace(/On Call Schedule for /, '');
						});
						headline += calNamesHTML.join('<br>');
						headline += '</h3><br>';
					}
					$('#calendar-title').html(headline);
					document.title = calNames.join(', ');
					$('#calendar').fullCalendar({
						events: events,
						defaultView: getParameterByName("view") ? getParameterByName("view") : "month",
						header: {
						    left:   'title',
						    center: 'month,agendaWeek,agendaDay,listMonth',
						    right:  'today prev,next'
						},
						eventMouseover: function() {
							$(this)[0].style.cursor = "pointer";
						},
						eventClick: function(calEvent) {
							window.open(calEvent.weburl, "_blank");
						}
					});
				}
			}
		});
	});
}

$(document).ready(main);
