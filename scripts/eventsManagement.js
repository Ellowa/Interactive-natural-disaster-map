function addEventManagementCommand(eventId) {
	if (localStorage.getItem('userRole') == 'moderator') {
		addUpdateEventButton(eventId);
		addDeleteEventButton(eventId);
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

