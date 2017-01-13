var colors = ["#0000f0", "#007100", "#007171", "#007900", "#008300", "#009500", "#009595", "#009f00", "#009f9f", "#00a377", "#00b400", "#00bad6", "#00c791", "#00d198", "#00d800", "#00e200", "#050", "#0c2e0c", "#0fceeb", "#0fd7f5", "#134b13", "#155315", "#161663", "#1c1c81", "#1e1e89", "#1f1ff5", "#1f1fff", "#294545", "#2a8050", "#2b2b2b", "#2fc12f", "#3091ad", "#339a61", "#345fdf", "#350000", "#365c5c", "#36a265", "#371801", "#3a6262", "#3d3d3d", "#410d41", "#420073", "#423880", "#42a2be", "#434343", "#44a9c6", "#49cb49", "#4bd34b", "#4d602a", "#4f4399", "#5347a0", "#5377e4", "#560097", "#590000", "#5a2702", "#5b7ee5", "#5c00a1", "#5f125f", "#5f4ec9", "#607935", "#628220", "#630000", "#642b02", "#668039", "#681468", "#6e0b0b", "#710071", "#742918", "#7869d2", "#789f27", "#7e0000", "#7e3e11", "#7ea729", "#7f71d4", "#831fdf", "#8f0e0e", "#902fc0", "#92341f", "#9440e1", "#950095", "#980f0f", "#992727", "#9946e6", "#9a3720", "#9d4e15", "#9f009f", "#9f48cb", "#a20000", "#a54ad3", "#a65217", "#aa7b0a", "#ac0000", "#b42f2f", "#b9147c", "#bc3131", "#cb940c", "#ce1338", "#d21f8f", "#d59b0d", "#db2095", "#dd284c", "#e6284f", "#f00000", "#f04100", "#f06b00", "#f09b00", "#f51f1f", "#f5581f", "#f57e1f", "#f5a91f", "#fd2b9c", "#ff058c", "#ff1f1f", "#ff33a1", "#ff5b1f", "#ff831f", "#ffb01f"];

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function main() {
	var url = getParameterByName("iCalURL");
	if ( !url ) {
		$('#calendar').html('<h1>Please put a PagerDuty iCal URL in the iCalURL parameter</h1>');
		return;
	}
	$('.busy').show();
	url = "https://cors-anywhere.herokuapp.com/" + url;

	$.ajax({
		url: url,
		type: "text",
		method: "get",
		headers: {
			"Origin": "local"
		},
		success: function(data) {
			$('.busy').hide();
			var jcalData = ICAL.parse(data);
			var comp = new ICAL.Component(jcalData);
			
			var calName = comp.getFirstProperty("x-wr-calname").getFirstValue();
			$('#calendar-title').html('<h1 style="background-color: #f0f0f0">' + calName + '</h1><br>');
			document.title = calName;
			
			var vevents = comp.getAllSubcomponents("vevent");
			var events = [];
			var peopleColors = {};
			vevents.forEach(function(vevent) {
				var event = new ICAL.Event(vevent);
				var title = event.summary.replace(/^On Call - /g, '');
				if ( ! peopleColors[title] ) {
					peopleColors[title] = colors[Math.floor(Math.random() * colors.length)];
				}
				events.push({
					title: title,
					start: (new ICAL.Time(event.startDate)).toString(),
					end: (new ICAL.Time(event.endDate)).toString(),
					color: peopleColors[title],
					weburl: event._firstProp("url")
				});
			});

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
	})
}

$(document).ready(main);
