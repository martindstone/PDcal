var token, anyUserID;
var schedules;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function PDRequest(endpoint, method, options) {
	
	console.log(token);

	var merged = $.extend(true, {}, {
		type: method,
		dataType: "json",
		url: "https://api.pagerduty.com/" + endpoint,
		headers: {
			"Authorization": "Token token=" + token,
			"Accept": "application/vnd.pagerduty+json;version=2"
		},
		error: function(err) {
			var alertStr = "Error '" + err.status + " - " + err.statusText + "' while attempting " + method + " request to '" + endpoint + "'";
			try {
				alertStr += ": " + err.responseJSON.error.message;
			} catch (e) {
				alertStr += ".";
			}
			
			try {
				alertStr += "\n\n" + err.responseJSON.error.errors.join("\n");
			} catch (e) {}

			alert(alertStr);
		}
	},
	options);

	$.ajax(merged);
}

function getAllSchedules(callback) {
	schedules = [];
	
	var options = {
		success: function(data) { processSchedules(callback, data); }
	};
	
	PDRequest("schedules", "GET", options);
}

function processSchedules(callback, data) {
	data.schedules.forEach(function(schedule) {
		schedules.push(schedule);
	});
	
	if ( data.more == true ) {
		var offset = data.offset + data.limit;
		var options = {
			data: {
				"offset": offset
			},
			success: function(data) { processSchedules(callback, data); }
		}
		
		PDRequest("schedules", "GET", options);		
	} else {
		callback(null, "schedules");
	}
}

function getAllScheduleURLs(callback) {
	var infoFns = [];

	schedules.forEach(function(schedule) {
		infoFns.push(function(callback) {
			var options = {
				data: {
					requester_id: anyUserID
				},
				success: function(data) {
					console.log(data);
					callback(null, data.schedule);
				}
			}
			PDRequest("schedules/" + schedule.id, "GET", options);
		});
	});
	
	async.parallel(infoFns,
		function(err, results) {
			schedules = results;
			callback(null, 'schedules');
		}
	);
}

function main() {
	token = getParameterByName('token');
	
	$('.busy').show();
	async.series([
		function(callback) {
			var options = {
				success: function(data) {
					anyUserID = data.users[0].id;
					callback(null, "anyUserID");
				}
			}
			PDRequest("/users", "GET", options);
		},
		function(callback) {
			getAllSchedules(callback);
		},
		function(callback) {
			getAllScheduleURLs(callback);
		},
		function(callback) {
			var htmlStr = '';
			schedules.forEach(function(schedule) {
				htmlStr += '<div><input type="checkbox" id="' + schedule.id + '" value="' + schedule.http_cal_url + '">';
				htmlStr += '<label for="' + schedule.id + '">' + schedule.summary + '</label></div>';
			});
			$('#calendar-list').html(htmlStr);
			
			$(':checkbox').change(function() {
				if ( $(':checked').length > 0 ) {
					var urls = [];
					$(':checked').each(function() {
						urls.push($(this).val());
					});
					var PDcalURL = 'http://martindstone.github.io/PDcal/index.html?iCalURL=' + urls.join('&iCalURL=');
					$('#calendar-url').html('<h1>PDcal URL for ' + urls.length + ' schedules:</h1><pre><a target="_blank" href="' + PDcalURL + '">' + PDcalURL + '</a></pre>');
				}
			});
			$('.busy').hide();
			console.log(schedules);
			callback(null, "log");
		}
	]);
}

$(document).ready(main);
