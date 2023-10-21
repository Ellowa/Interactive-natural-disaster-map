function addEventManagementCommand(eventProperties, eventGeometry) {
    var eventIndex = geojsonAllDataEvents.features.findIndex(event => event.properties.id == eventProperties.id);

	if (
		localStorage.getItem('userRole') == 'moderator' ||
		!geojsonAllDataEvents.features[eventIndex].properties.confirmed
	) {
		addUpdateEventButton(eventProperties.id);
		addDeleteEventButton(eventProperties.id);
	}
    if (localStorage.getItem('login') != null) {
        addEventCollectionButton(eventProperties, eventGeometry);
    }
}

function addUpdateEventButton(eventId) {
    var updateDiv = document.createElement('div');
	updateDiv.className = 'event-short-description item-update';
	updateDiv.innerHTML = 'Update';
	$('.popupDescription').append(updateDiv);
    
	updateDiv.addEventListener('click', e => {
        var updateButton = $('#updateEventDataButton')[0];

        var updateButtonClone = updateButton.cloneNode(true);

        updateButton.parentNode.replaceChild(updateButtonClone, updateButton);
        
        var addEventButton = $('#addEventDataButton')[0];
        addEventButton.style = 'display: none';

        updateButtonClone.addEventListener('click', e => {
            const titleInput = document.getElementById('titleInput');
            const categoryInput = document.getElementById('categoryInputCombo');
            const lngInput = document.getElementById('lngInput');
            const latInput = document.getElementById('latInput');
            const startDateInput = document.getElementById('startDateInput');
            const closedDateInput = document.getElementById('closedDateInput');
            const mUnitInput = document.getElementById('mUnitInputCombo');
            const mValueInput = document.getElementById('mValueInput');
            const sourceInput = document.getElementById('sourceInput');

            var requiredFields = [titleInput, categoryInput, lngInput, latInput, startDateInput, mUnitInput];
            var allFields = [
                titleInput,
                categoryInput,
                lngInput,
                latInput,
                startDateInput,
                closedDateInput,
                mUnitInput,
                mValueInput,
                sourceInput,
            ];
            var requiredFieldsIsEmpty = false;
            for (var inputElement of requiredFields) {
                if (inputElement.value == '') {
                    inputElement.style = 'border-color: #F44336;';
                    requiredFieldsIsEmpty = true;
                } else {
                    inputElement.style = null;
                }
            }

            if (requiredFieldsIsEmpty) {
                document.getElementById('requiredTextAddEvent').style = 'color: #F44336;';
            } else {
                document.getElementById('requiredTextAddEvent').style = null;

                var eventJSON = {
                    id: eventId,
                    title: titleInput.value,
                    eventCategoryName: categoryInput.value,
                    startDate: startDateInput.value,
                    endDate: closedDateInput.value,
                    magnitudeUnitName: mUnitInput.value,
                    magnitudeValue: mValueInput.value,
                    link: sourceInput.value,
                    latitude: latInput.value,
                    longitude: lngInput.value,
                };
                if (closedDateInput.value.length == 0) eventJSON.endDate = null;
                if (mValueInput.value.length == 0) eventJSON.magnitudeValue = null;
                if (sourceInput.value.length == 0) eventJSON.link = null;
                eventJSON = JSON.stringify(eventJSON);
                //ОТПРАВКА СОБЫТИЯ В API
                $.ajax({
                    url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/NaturalDisasterEvent/${eventId}`,
                    method: 'PUT',
                    contentType: 'application/json; charset=utf-8',
                    data: eventJSON,
                    headers: {
                        Authorization: `bearer ${localStorage.getItem('jwt')}`,
                    },
                    success: function (data) {
                        //Получение и добавление обновленного события на карту
                        $.ajax({
                            url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/NaturalDisasterEvent/${eventId}`,
                            method: 'GET',
                            contentType: 'application/json; charset=utf-8',
                            headers: {
                                Authorization: `bearer ${localStorage.getItem('jwt')}`,
                            },
                            success: function (data) {
                                var eventIndex = geojsonAllDataEvents.features.findIndex(event => event.properties.id == eventId);

                                //удаляем событие из списку всех событий
                                while (eventIndex != -1) {
                                    geojsonAllDataEvents.features.splice(eventIndex, 1);
                                    eventIndex = geojsonAllDataEvents.features.findIndex(event => event.properties.id == eventId);
                                }

                                addIndmEventsToMap(data);
                            },
                            error: function (jqXHR, textStatus, error) {
                                exceptionHandler(jqXHR, textStatus, error);
                            },
                        });

                        for (var inputElement of allFields) {
                            inputElement.value = null;
                        }
                         $('#addEventZone')[0].style = 'display: none';
                        document.getElementById('lngDiv').classList.remove('coordinatesByMap');
                        document.getElementById('latDiv').classList.remove('coordinatesByMap');

                        updateButtonClone.style = 'display: none';
                        addEventButton.style = 'display: block';
                    },
                    error: function (jqXHR, textStatus, error) {
                        exceptionHandler(jqXHR, textStatus, error);
                    },
                });
            }
        });

        updateButtonClone.style = 'display: block';
        $('#addEventButton').click();  
    });
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

function addEventCollectionButton(eventProperties, eventGeometry) {
	var collectionSelect = document.createElement('select');
	collectionSelect.classList = 'combo-box';
	collectionSelect.id = 'collectionSelect-' + eventProperties.id;
	collectionSelect.required = true;

	$.ajax({
		url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/EventsCollection`,
		method: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			Authorization: `bearer ${localStorage.getItem('jwt')}`,
		},
		success: function (data) {
			data.forEach(eventsCollection => {
				var collectionOptionElement = document.createElement('option');
				collectionOptionElement.value = eventsCollection.id;
				collectionOptionElement.innerHTML = eventsCollection.collectionName;
				collectionSelect.append(collectionOptionElement);
			});
		},
		error: function (jqXHR, textStatus, error) {
			exceptionHandler(jqXHR, textStatus, error);
		},
	});
	$('.popupDescription').append(collectionSelect);

	var eventCollectionDiv = document.createElement('div');
	eventCollectionDiv.className = 'event-short-description event-add-to-collection';
	eventCollectionDiv.innerHTML = 'Add to collection';
	$('.popupDescription').append(eventCollectionDiv);

	eventCollectionDiv.addEventListener('click', e => {
		var addEventToCollectionRequestJSON = {
			eventId: eventProperties.id,
			collectionId: collectionSelect.value,
		};
		addEventToCollectionRequestJSON = JSON.stringify(addEventToCollectionRequestJSON);

		$.ajax({
			url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/EventsCollection/AddEvent`,
			method: 'POST',
			dataType: 'text',
			contentType: 'application/json; charset=utf-8',
			data: addEventToCollectionRequestJSON,
			headers: {
				Authorization: `bearer ${localStorage.getItem('jwt')}`,
			},
			success: function (data) {
                if ($('#allEventCollections').prev(this).text() == '► ') $('#allEventCollections').click();

				var eventCollectionUl = document.getElementById(`collectionUl-${collectionSelect.value}`);
                if (eventCollectionUl != null)
                {
                    var eventLi = document.createElement('li');
                    eventLi.style = 'padding: 8px 0';
                    eventLi.className = 'tree-element';
                    eventLi.id = `eventId-${eventProperties.id}`;

                    var eventTextDiv = document.createElement('div');
                    eventTextDiv.innerHTML = eventProperties.title;
                    eventTextDiv.style = 'width: auto; max-width: 120px; overflow: auto';
                    eventLi.append(eventTextDiv);

                    eventLi.addEventListener('click', function () {
                        map.flyTo({ center: [eventGeometry.coordinates[0], eventGeometry.coordinates[1]], zoom: 9 });
                    });

                    var deleteEventImage = document.createElement('img');
                    deleteEventImage.style = `float: right; padding-right: 8px; margin-top: -20px`;
                    var srcDelete = 'images/delete.png';
                    deleteEventImage.src = srcDelete;
                    $(deleteEventImage).hover(
                        function () {
                            $(this).attr('src', 'images/delete.gif');
                        },
                        function () {
                            $(this).attr('src', srcDelete);
                        }
                    );
                    deleteEventImage.addEventListener('click', function () {
                        deleteEventFromCollection(collectionSelect.value, eventProperties.id, eventLi);
                    });
                    eventLi.append(deleteEventImage);
                    eventCollectionUl.append(eventLi);
                }
			},
			error: function (jqXHR, textStatus, error) {
				exceptionHandler(jqXHR, textStatus, error);
			},
		});
	});
}
