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
	}
	
	url = "https://cors-anywhere.herokuapp.com/" + url;

	$.ajax({
		url: url,
		type: "text",
		method: "get",
		success: function(data) {
			var jcalData = ICAL.parse(data);
			var comp = new ICAL.Component(jcalData);
			var vevents = comp.getAllSubcomponents("vevent");
			var events = [];
			vevents.forEach(function(vevent) {
				var event = new ICAL.Event(vevent);
				events.push({
					title: event.summary,
					start: (new ICAL.Time(event.startDate)).toString(),
					end: (new ICAL.Time(event.endDate)).toString(),
				});
			});
			$('#calendar').fullCalendar({
				events: events
			});
		}
	})
}


$(document).ready(main);
