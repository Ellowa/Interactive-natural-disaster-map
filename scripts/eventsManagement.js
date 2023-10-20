function addEventManagementCommand(eventId) {
	if (localStorage.getItem('userRole') == 'moderator') {
		addUpdateEventButton(eventId);
		addDeleteEventButton(eventId);
	}
}

function addUpdateEventButton(eventId) {
    createUpdateShortDescriptionDiv(
			$('.popupDescription'),
			eventId,
			'NaturalDisasterEvent',
			null,
			'title',
			'link',
			'startDate',
			'endDate',
			'magnitudeValue',
			'eventCategoryName',
			'magnitudeUnitName',
			'latitude',
			'longitude'
		);
}

function addDeleteEventButton(eventId) {
	var eventDeleteIsSuccess = function () {
		var eventIndex = geojsonAllDataEvents.features.findIndex(event => event.properties.id == eventId);

		//удаляем событие из списку всех событий
		while (eventIndex != -1) {
			geojsonAllDataEvents.features.splice(eventIndex, 1);
            eventIndex = geojsonAllDataEvents.features.findIndex(event => event.properties.id == eventId);
		}

		// обновление источника данных для карты
		map.getSource('events').setData(geojsonAllDataEvents);
		// обновляем временной слайдер (фильтр событий по времени)
		setDateFilterRange();
	};

	createDeleteShortDescriptionDiv(
		$('.popupDescription'),
		eventId,
		'NaturalDisasterEvent',
		eventDeleteIsSuccess
	);
}

