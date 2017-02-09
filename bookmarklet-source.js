javascript: (
	function() {
		$('ul.cal-options-menu').each(function() {
			var ul = $(this);
			$(this).find('li.just-my-cal-option > a').each(function() {
				if ( ul.find('i.icon-external-link-sign').length > 0 ) {
					return;
				}
				var icalurl = $(this).attr('href').replace(/\?.*$/, '');
				var href = 'https://martindstone.github.io/PDcal/index.html?iCalURL=' + icalurl;
				$(ul).append('<li class="cal-subheader"><h4 class="dropdown-menu-subheader"><i class="icon icon-external-link-sign icon-fixed-width"></i>Public View</h4></li>');
				$(ul).append('<li class="cal-option"><a class=action-link cal-link" href="' + href + '" target="_blank">Open in new tab</a>');
			});
		});
	}
)