var eventCollectionFilter;

var allEventCollectionsSpan = document.getElementById('allEventCollections');
$(allEventCollectionsSpan).next().hide();

$(allEventCollectionsSpan).before('<span>► </span>');

$(allEventCollectionsSpan).click(function () {
	$(this).next().slideToggle('normal');

	if ($(this).prev(this).text() == '► ') {
		$(this).prev(this).replaceWith('<span>▼ </span>');
		divTreeEventCollections.style = 'display: block; width: 100%';
	} else if ($(this).prev(this).text() == '▼ ') {
		$(this).prev(this).replaceWith('<span>► </span>');
		divTreeEventCollections.style = 'display: block; width: 170px';
	}
});

// функция формирования фильтра событий по Id в зависимости от id слоя(для которого делаем фильтр)
function createEventIdFilter(eventsIds) {
	if (eventFilters['collectionFilter'] == null) {
		var eventIdFilter = ['in', 'id'];
		eventsIds.forEach(eventsId => {
			eventIdFilter.push(eventsId);
		});
		eventFilters['collectionFilter'] = eventIdFilter;
	} else {
		eventsIds.forEach(eventsId => {
			eventFilters['collectionFilter'].push(eventsId);
		});
	}
}

// Обработчик события для показа всех событий (отмены выбора коллекций)
var showAllEventsCheckBox = document.getElementById('showAllEvents');
showAllEventsCheckBox.addEventListener('change', function () {
	if (this.checked) {
		delete eventFilters['collectionFilter'];
		filterEvents();

		var eventCollectionsMainRoot = document.getElementById('eventCollectionsMainRoot');
		var eventCollectionsMainRootInputs = $(eventCollectionsMainRoot).find('input');
		for (var i = 0; i < eventCollectionsMainRootInputs.length; i++) {
			eventCollectionsMainRootInputs[i].checked = false;
		}
	}
});

var doEditAction;

// Обработчик события для показа коллекций пользователя
var allEventCollections = document.getElementById('allEventCollections');
allEventCollections.addEventListener('click', function () {
	if ($(this).prev(this).text() == '▼ ' && $('#eventCollectionsMainRoot').children().length <= 1) {
		getAndShowAllEventCollections();
	}
});

function getAndShowAllEventCollections() {
	$.ajax({
		url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/EventsCollection',
		method: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			Authorization: `bearer ${localStorage.getItem('jwt')}`,
		},
		success: function (data) {
			var mainUl = document.getElementById('eventCollectionsMainRoot');
			mainUl.replaceChildren();

			data.forEach(eventCollection => {
				var eventCollectionLi = document.createElement('li');

				var eventCollectionSpan = document.createElement('span');
				eventCollectionSpan.className = 'collapse';

				var eventCollectionTextInput = document.createElement('input');
				eventCollectionTextInput.classList = 'eventCollection-name';
				eventCollectionTextInput.type = 'text';
				eventCollectionTextInput.readOnly = true;
				eventCollectionTextInput.value = eventCollection.collectionName;
				eventCollectionSpan.append(eventCollectionTextInput);

				var eventCollectionInput = document.createElement('input');
				eventCollectionInput.classList = 'eventCollection-show-input';
				eventCollectionInput.type = 'checkbox';
				var eventIds = [];
				eventCollectionInput.addEventListener('change', function () {
					eventCollection.eventDtos.forEach(naturalEvent => {
						eventIds.push(naturalEvent.id);
					});

					if (this.checked) {
						createEventIdFilter(eventIds);
						filterEvents();

						var showAllEventsInput = document.getElementById('showAllEvents');
						showAllEventsInput.checked = false;
					} else {
						if (eventFilters['collectionFilter'] != null) {
							eventIds.forEach(eventId => {
								var eventIndexInFilter = eventFilters['collectionFilter'].indexOf(eventId);
								if (eventIndexInFilter != -1) eventFilters['collectionFilter'].splice(eventIndexInFilter, 1);
							});
							if (eventFilters['collectionFilter'].length <= 2) {
								delete eventFilters['collectionFilter'];
							}

							filterEvents();
						}
					}
				});

				eventCollectionSpan.append(eventCollectionInput);

				var editImage = document.createElement('img');
				var srcEdit = 'images/edit.png';
				editImage.src = srcEdit;
				$(editImage).hover(
					function () {
						$(this).attr('src', 'images/edit.gif');
					},
					function () {
						$(this).attr('src', srcEdit);
					}
				);
				doEditAction = editEventCollection;
				editImage.addEventListener('click', function () {
					doEditActionListener(eventCollectionTextInput, editImage, eventCollection.id);
				});
				eventCollectionSpan.append(editImage);

				var deleteImage = document.createElement('img');
				var srcDelete = 'images/delete.png';
				deleteImage.src = srcDelete;
				$(deleteImage).hover(
					function () {
						$(this).attr('src', 'images/delete.gif');
					},
					function () {
						$(this).attr('src', srcDelete);
					}
				);
				deleteImage.addEventListener('click', function () {
					deleteEventCollection(eventCollection.id, eventCollectionLi);

					if (eventFilters['collectionFilter'] != null) {
						eventIds.forEach(eventId => {
							var eventIndexInFilter = eventFilters['collectionFilter'].indexOf(eventId);
							if (eventIndexInFilter != -1) eventFilters['collectionFilter'].splice(eventIndexInFilter, 1);
						});
						if (eventFilters['collectionFilter'].length <= 2) {
							delete eventFilters['collectionFilter'];
						}

						filterEvents();
					}
				});
				eventCollectionSpan.append(deleteImage);

				eventCollectionLi.append(eventCollectionSpan);

				var eventCollectionUl = document.createElement('ul');

				eventCollection.eventDtos.forEach(naturalEvent => {
					var eventLi = document.createElement('li');
					eventLi.style = 'padding: 8px 0';
					eventLi.className = 'tree-element';

					var eventTextDiv = document.createElement('div');
					eventTextDiv.innerHTML = naturalEvent.title;
					eventTextDiv.style = 'width: auto; max-width: 120px; overflow: auto';
					eventLi.append(eventTextDiv);

					eventLi.addEventListener('click', function () {
						map.flyTo({ center: [naturalEvent.longitude, naturalEvent.latitude], zoom: 9 });
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
						deleteEventFromCollection(eventCollection.id, naturalEvent.id, eventLi);
					});
					eventLi.append(deleteEventImage);
					eventCollectionUl.append(eventLi);
				});
				eventCollectionLi.append(eventCollectionUl);
				mainUl.append(eventCollectionLi);

				$(eventCollectionSpan).next().hide();

				$(eventCollectionSpan).before('<span>► </span>');

				$(eventCollectionTextInput).click(function () {
					$(eventCollectionSpan).next().slideToggle('normal');

					if ($(eventCollectionSpan).prev(eventCollectionSpan).text() == '► ')
						$(eventCollectionSpan).prev(eventCollectionSpan).replaceWith('<span>▼ </span>');
					else if ($(eventCollectionSpan).prev(eventCollectionSpan).text() == '▼ ')
						$(eventCollectionSpan).prev(eventCollectionSpan).replaceWith('<span>► </span>');
				});
			});

			addAddEventCollectionButton();
		},
		error: function (jqXHR, textStatus, error) {
			exceptionHandler(jqXHR, textStatus, error);
		},
	});
}

function doEditActionListener(eventCollectionTextInput, editImage, eventCollectionId) {
	doEditAction(eventCollectionTextInput, editImage, eventCollectionId);
}

function editEventCollection(eventCollectionTextInput, editImage, eventCollectionId) {
	doEditAction = approveEditEventCollection;

	eventCollectionTextInput.readOnly = false;
	eventCollectionTextInput.focus();

	$(editImage).attr('src', 'images/save.png');
	$(editImage).hover(
		function () {
			$(editImage).attr('src', 'images/save.gif');
		},
		function () {
			$(editImage).attr('src', 'images/save.png');
		}
	);
}

function approveEditEventCollection(eventCollectionTextInput, editImage, eventCollectionId) {
	if (confirm('Are you sure you want to update this ' + `eventsCollection`)) {
		var updatedData = {
			id: eventCollectionId,
			collectionName: eventCollectionTextInput.value,
		};
		updatedData = JSON.stringify(updatedData);
		$.ajax({
			url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/EventsCollection/${eventCollectionId}`,
			method: 'PUT',
			dataType: 'text',
			contentType: 'application/json; charset=utf-8',
			data: updatedData,
			headers: {
				Authorization: `bearer ${localStorage.getItem('jwt')}`,
			},
			success: function (data) {
				doEditAction = editEventCollection;

				eventCollectionTextInput.readOnly = true;

				$(editImage).attr('src', 'images/edit.png');
				$(editImage).hover(
					function () {
						$(editImage).attr('src', 'images/edit.gif');
					},
					function () {
						$(editImage).attr('src', 'images/edit.png');
					}
				);
			},
			error: function (jqXHR, textStatus, error) {
				exceptionHandler(jqXHR, textStatus, error);
			},
		});
	}
}

function deleteEventCollection(eventCollectionId, eventCollectionLi) {
	if (confirm('Are you sure you want to delete this ' + `eventsCollection`)) {
		var deletedData = {
			id: eventCollectionId,
		};
		deletedData = JSON.stringify(deletedData);
		requestDelete(`EventsCollection/${eventCollectionId}`, deletedData, eventCollectionLi);
	}
}

function deleteEventFromCollection(eventCollectionId, naturalEventId, eventLi) {
	if (confirm('Are you sure you want to delete this ' + `event(${naturalEventId}) from eventsCollection`)) {
		var deletedData = {
			collectionId: eventCollectionId,
			eventId: naturalEventId,
		};
		deletedData = JSON.stringify(deletedData);
		requestDelete(`EventsCollection/DeleteEvent`, deletedData, eventLi);
	}
}

function requestDelete(uri, deletedData, deletedHtmlElement) {
	$.ajax({
		url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/${uri}`,
		method: 'DELETE',
		dataType: 'text',
		contentType: 'application/json; charset=utf-8',
		data: deletedData,
		headers: {
			Authorization: `bearer ${localStorage.getItem('jwt')}`,
		},
		success: function (data) {
			if (deletedHtmlElement != null && deletedHtmlElement != undefined) {
				deletedHtmlElement.remove();
			}
		},
		error: function (jqXHR, textStatus, error) {
			exceptionHandler(jqXHR, textStatus, error);
		},
	});
}

function addAddEventCollectionButton() {
	var mainUl = document.getElementById('eventCollectionsMainRoot');

	var eventCollectionLi = document.createElement('li');

	var eventCollectionSpan = document.createElement('span');
	eventCollectionSpan.className = 'collapse';

	var eventCollectionTextInput = document.createElement('input');
	eventCollectionTextInput.style = 'width: auto; max-width: 165px;';
	eventCollectionTextInput.classList = 'eventCollection-name-add';
	eventCollectionTextInput.type = 'text';
	eventCollectionTextInput.value = 'Add eventCollection';
	eventCollectionSpan.append(eventCollectionTextInput);

	var saveImage = document.createElement('img');
	saveImage.style = 'margin-bottom: -7px; margin-left: 2px;';
	var srcSave = 'images/save.png';
	saveImage.src = srcSave;
	$(saveImage).hover(
		function () {
			$(this).attr('src', 'images/save.gif');
		},
		function () {
			$(this).attr('src', srcSave);
		}
	);
	saveImage.addEventListener('click', function () {
		addEventCollection(eventCollectionTextInput.value);
	});
	eventCollectionSpan.append(saveImage);

	eventCollectionLi.append(eventCollectionSpan);

	mainUl.append(eventCollectionLi);
}

function addEventCollection(collectionName) {
	var collectionAddedData = {
		collectionName: collectionName,
	};
	collectionAddedData = JSON.stringify(collectionAddedData);
	requestAdd(`EventsCollection`, collectionAddedData, updateEventCollectionListElement);
}

function updateEventCollectionListElement() {
	delete eventFilters['collectionFilter'];
	filterEvents();
	var showAllEventsCheckBox = document.getElementById('showAllEvents');
	showAllEventsCheckBox.checked = true;

	getAndShowAllEventCollections();
}

function requestAdd(uri, addedData, successCallbackFunction) {
	$.ajax({
		url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/${uri}`,
		method: 'POST',
		dataType: 'text',
		contentType: 'application/json; charset=utf-8',
		data: addedData,
		headers: {
			Authorization: `bearer ${localStorage.getItem('jwt')}`,
		},
		success: function (data) {
			successCallbackFunction();
		},
		error: function (jqXHR, textStatus, error) {
			exceptionHandler(jqXHR, textStatus, error);
		},
	});
}
