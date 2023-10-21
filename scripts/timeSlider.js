var eventFilters = [];

// функция изменения dateSlider параметров в зависимости от текущего списка событий
function setDateFilterRange(){
    // сортируем события по времени их старта
    geojsonAllDataEvents.features.sort(function(a, b) {
        if (a.properties.startDate > b.properties.startDate) {
					return 1;
				}
        if (a.properties.startDate < b.properties.startDate) {
					return -1;
				}
        return 0;
    });
    
    // отобразим события от новых к старым 
    geojsonAllDataEvents.features.reverse();

    // найдем разницу в днях между первым и последним событием
    var date1 = new Date(geojsonAllDataEvents.features[0].properties.startDate);
    var date2 = new Date(geojsonAllDataEvents.features[geojsonAllDataEvents.features.length - 1].properties.startDate);

    var timeDiff = Math.abs(date1.getTime() - date2.getTime());
    var daysRange = Math.ceil(timeDiff / (1000 * 3600 * 24));

    document.getElementById('dateSlider').max = daysRange;
    //document.getElementById('dateSlider').value = daysRange;
}

// функция формирования фильтра событий в зависимости от id слоя(для которого делаем фильтр)
function createDateFilter(toDate){
    eventFilters['dateFilter'] = ['>=', 'startDate', toDate];
}

// функция формирования общего фильтра
function createFilterByLayerId(layerID, fColor){
    var filters = [
			'all',
			['==', 'category', layerID],
			['==', 'dangerLevel', fColor],
		];

    for (eventFilter in eventFilters) {
        filters.push(eventFilters[eventFilter]);
    }
    return filters;
}

// функция фильтрации событий по дате их начала
function filterEvents(){
    // Применяем фильтр ко всем слоям карты
    for (layerID in allLayersID)
    {
        var categoriesFromLayerID = allLayersID[layerID].split(' ')[0];
        var dangerLevelFromLayerID = allLayersID[layerID].slice(categoriesFromLayerID.length+1);
        map.setFilter(
					allLayersID[layerID],
					createFilterByLayerId(categoriesFromLayerID, dangerLevelFromLayerID)
				);
    }
}

// Обработчик события для диапазона дат(dateSlider)
document.getElementById('dateSlider').addEventListener('input', (e) => {
	var selectedDateRange = e.target.value;
	var toDate = new Date();
	toDate.setDate(new Date(geojsonAllDataEvents.features[0].properties.startDate).getDate() - selectedDateRange - 1);
	createDateFilter(toDate.toISOString().substring(0, 10));
	filterEvents();

	// Меняем подпись диапазона дат
	document.getElementById('selectedDateLabel').textContent = `Date range: 
    ${geojsonAllDataEvents.features[0].properties.startDate.substring(0, 10)}
     - ${toDate.toISOString().substring(0, 10)}`;
});