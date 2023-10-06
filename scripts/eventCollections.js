var eventCollectionFilter

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
	if(eventFilters["collectionFilter"] == null){
		var eventIdFilter = ['in', 'Newid'];
		eventsIds.forEach(eventsId => {
			eventIdFilter.push(eventsId);
		});
		eventFilters['collectionFilter'] = eventIdFilter;
	}
	else{
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
	if ($(this).prev(this).text() == '▼ ' && $('#eventCollectionsMainRoot').children().length == 0) {
		$.ajax({
			url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/EventsCollectionInfo',
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
					eventCollectionTextInput.value = eventCollection.collectionName + ' ';
					eventCollectionSpan.append(eventCollectionTextInput);

					var eventCollectionInput = document.createElement('input');
					eventCollectionInput.classList = 'eventCollection-show-input';
					eventCollectionInput.type = 'checkbox';
					//Todo сделать через список фильтров а не 1ин единственный фильтр
					eventCollectionInput.addEventListener('change', function () {
						var eventIds = [];
						eventCollection.eventDtos.forEach(naturalEvent => {
							eventIds.push(naturalEvent.id);
						});

						if (this.checked) {
							createEventIdFilter(eventIds);
							filterEvents();

							var showAllEventsInput = document.getElementById('showAllEvents');
							showAllEventsInput.checked = false;
						}
						else{
							if(eventFilters["collectionFilter"] != null){
								eventIds.forEach(eventId => {
									var eventIndexInFilter = eventFilters['collectionFilter'].indexOf(eventId);
									if (eventIndexInFilter != -1)
									 	eventFilters['collectionFilter'].splice(eventIndexInFilter, 1);
								});
								if (eventFilters['collectionFilter'].length <= 2){
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
					editImage.addEventListener(
						'click',
						function(){doEditActionListener(eventCollectionTextInput, editImage, eventCollection);}
					);
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
					eventCollectionSpan.append(deleteImage);

					eventCollectionLi.append(eventCollectionSpan);

					var eventCollectionUl = document.createElement('ul');

					eventCollection.eventDtos.forEach(naturalEvent => {
						var eventLi = document.createElement('li');
						eventLi.className = 'tree-element';
						eventLi.innerHTML = naturalEvent.title;
						eventLi.addEventListener('click', function () {
							map.flyTo({ center: [naturalEvent.longitude, naturalEvent.latitude], zoom: 9 });
						});

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
			},
			error: function (jqXHR, textStatus, error) {
				var err = textStatus + ' ' + jqXHR.status + ', ' + error + '\n' + jqXHR.responseText?.toString();
				exceptionHandler(err);
			},
		});
	}
});

function doEditActionListener(eventCollectionTextInput, editImage, eventCollection) {
	doEditAction(eventCollectionTextInput, editImage, eventCollection);
}

function editEventCollection(eventCollectionTextInput, editImage, eventCollection) {
	console.log('here');
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

function approveEditEventCollection(eventCollectionTextInput, editImage, eventCollection){
	var updatedData = {
			id: eventCollection.id,
			collectionName: eventCollectionTextInput.value,
		};
	updatedData = JSON.stringify(updatedData);
	$.ajax({
		url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/EventsCollectionInfo/${eventCollection.id}`,
		method: 'PUT',
		dataType: 'text',
		contentType: 'application/json; charset=utf-8',
		data: updatedData,
		headers: {
			Authorization: `bearer ${localStorage.getItem('jwt')}`,
		},
		success: function (data) {
			console.log('hereX2');
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
			var err = textStatus + ' ' + jqXHR.status + ', ' + error + '\n' + jqXHR.responseText?.toString();
			exceptionHandler(err);
		},
	});
}
