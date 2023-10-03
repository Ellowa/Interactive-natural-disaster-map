$('span.collapse').next().hide();

$('span.collapse').before('<span>► </span>');

$('span.collapse').click(function () {
	$(this).next().slideToggle('normal');

	if ($(this).prev(this).text() == '► ')
		$(this).prev(this).replaceWith('<span>▼ </span>');
	else if ($(this).prev(this).text() == '▼ ')
		$(this).prev(this).replaceWith('<span>► </span>');
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
                eventsIds,
                categoriesFromLayerID,
                dangerLevelFromLayerID
            )
        );
            
    }
}

// Обработчик события для диапазона дат(dateSlider)
var t = document.getElementById('showAllEvents');
t.addEventListener('change', function () {
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
	}
});
