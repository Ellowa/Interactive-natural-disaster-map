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
function createEventIdFilterByLayerId(eventsIds, layerID, fColor) {
	var filters = [
		'all',
		['==', 'categoriesNEW', layerID],
		['==', 'dangerLevel', fColor],
	];
    var eventIdFilter = ['in', 'Newid'];
    eventsIds.forEach(eventsId => {
        eventIdFilter.push(eventsId);
    });
    filters.push(eventIdFilter);
	return filters;
}

// функция фильтрации событий по их Id
function filterEventsById(...eventsIds){
    // Применяем фильтр ко всем слоям карты
    for (layerID in allLayersID)
    {
        var categoriesFromLayerID = allLayersID[layerID].split(' ')[0];
        var dangerLevelFromLayerID = allLayersID[layerID].slice(categoriesFromLayerID.length+1);

        map.setFilter(
            allLayersID[layerID],
            createEventIdFilterByLayerId(
                ...eventsIds,
                categoriesFromLayerID,
                dangerLevelFromLayerID
            )
        );
            
    }
}

// Обработчик события для показа всех событий (отмены выбора коллекций)
var showAllEventsCheckBox = document.getElementById('showAllEvents');
showAllEventsCheckBox.addEventListener('change', function () {
	if (this.checked) {
		allLayersID.forEach(layerID => {
			var categoriesFromLayerID = layerID.split(' ')[0];
			var dangerLevelFromLayerID = layerID.slice(
				categoriesFromLayerID.length + 1
			);
			map.setFilter(layerID, [
				'all',
				['==', 'categoriesNEW', categoriesFromLayerID],
				['==', 'dangerLevel', dangerLevelFromLayerID],
			]);
		});

        var eventCollectionsMainRoot = document.getElementById('eventCollectionsMainRoot');
        var eventCollectionsMainRootInputs = $(eventCollectionsMainRoot).find('input');
        for(var i = 0; i < eventCollectionsMainRootInputs.length; i++){
            eventCollectionsMainRootInputs[i].checked = false;
        }
	}
});


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
					eventCollectionSpan.innerHTML = eventCollection.collectionName + ' ';

					var eventCollectionInput = document.createElement('input');
					eventCollectionInput.type = 'checkbox';
					//Todo сделать через список фильтров а не 1ин единственный фильтр
					eventCollectionInput.addEventListener('change', function () {
						if (this.checked) {
							var eventIds = [];
							eventCollection.eventDtos.forEach(naturalEvent => {
								eventIds.push(naturalEvent.id);
							});
							filterEventsById(eventIds);

							var showAllEventsInput = document.getElementById('showAllEvents');
							showAllEventsInput.checked = false;
						}
					});

					eventCollectionSpan.append(eventCollectionInput);
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

					$(eventCollectionSpan).click(function () {
						$(this).next().slideToggle('normal');

						if ($(this).prev(this).text() == '► ') $(this).prev(this).replaceWith('<span>▼ </span>');
						else if ($(this).prev(this).text() == '▼ ') $(this).prev(this).replaceWith('<span>► </span>');
					});
				});
			},
			error: function (jqXHR, textStatus, error) {
				var err = textStatus + ' ' + jqXHR.status + ', ' + error + '\n' + jqXHR.responseText.toString();
				exceptionHandler(err);
			},
		});
	}
    
});