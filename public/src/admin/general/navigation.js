"use strict";
/* global define, app, ajaxify, socket, templates, bootbox */

define('admin/general/navigation', function() {
	var navigation = {},
		available;

	navigation.init = function() {
		available = JSON.parse(ajaxify.variables.get('available'));

		$('#save').on('click', save);
		$('.delete').on('click', remove);
		$('.toggle').on('click', toggle);

		$('#enabled')
			.sortable()
			.droppable({
				accept: $('#available li')
			});

		$('#available li')
			.draggable({
				connectToSortable: '#enabled',
				helper: 'clone',
				distance: 10,
				stop: drop
			});
	};

	function drop(ev, ui) {
		var id = ui.helper.attr('data-id'),
			el = $('#enabled [data-id="' + id + '"]'),
			data = id === 'custom' ? {} : available[id];

		templates.parse('admin/general/navigation', 'enabled', {enabled: [data]}, function(li) {
			li = $(li);
			el.after(li);
			el.remove();
		});
	}

	function save() {
		var nav = [];

		$('#enabled li').each(function() {
			var form = $(this).find('form').serializeArray(),
				data = {};

			form.forEach(function(input) {
				data[input.name] = input.value;
			});

			available.forEach(function(item) {
				if (item.route.match(data.route)) {
					data.properties = item.properties;
				}
			});

			nav.push(data);
		});

		socket.emit('admin.navigation.save', nav, function(err) {
			if (err) {
				app.alertError(err.message);
			} else {
				app.alertSuccess('Successfully saved navigation');
			}
		});
	}

	function remove() {
		$(this).parents('li').remove();
	}

	function toggle() {
		var btn = $(this),
			disabled = btn.html() === 'Enable';

		btn.toggleClass('btn-warning').toggleClass('btn-success').html(!disabled ? 'Enable' : 'Disable');
		btn.parents('li').find('[name="enabled"]').val(disabled);
		return false;
	}

	return navigation;
});