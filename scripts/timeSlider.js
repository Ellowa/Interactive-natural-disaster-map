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

    var dateSliderFrom = document.getElementById('dateSliderFrom'); 
    var dateSliderTo = document.getElementById('dateSliderTo'); 
    dateSliderTo.max = daysRange;
    dateSliderTo.min = dateSliderFrom.value;
    if (dateSliderTo.value <= dateSliderFrom.value) dateSliderTo.value = daysRange;
    dateSliderFrom.max = daysRange;
}

// функция формирования фильтра событий в зависимости от id слоя(для которого делаем фильтр)
function createDateFilter(toDate, fromDate){
    eventFilters['dateFilter'] = ['>=', 'startDate', toDate];
    eventFilters['dateFilterFrom'] = ['<=', 'startDate', fromDate];
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
document.getElementById('dateSliderFrom').addEventListener('input', e => {
    var dateSliderFrom = document.getElementById('dateSliderFrom');
    var dateSliderTo = document.getElementById('dateSliderTo');
    if (parseInt(dateSliderFrom.value) > parseInt(dateSliderTo.value))
        dateSliderFrom.value = dateSliderTo.value;

    dateSliderEvents();
});
document.getElementById('dateSliderTo').addEventListener('input', e => {
    var dateSliderFrom = document.getElementById('dateSliderFrom');
    var dateSliderTo = document.getElementById('dateSliderTo');
    if (parseInt(dateSliderTo.value) < parseInt(dateSliderFrom.value))
        dateSliderTo.value = dateSliderFrom.value;

    dateSliderEvents();
});

function dateSliderEvents(){
    var selectedDateRange = document.getElementById('dateSliderTo').value;
    var selectedDateRangeFrom = document.getElementById('dateSliderFrom').value;
	var toDate = new Date();
    var fromDate = new Date();
	toDate.setDate(new Date(geojsonAllDataEvents.features[0].properties.startDate).getDate() - selectedDateRange - 1);
    fromDate.setDate(new Date(geojsonAllDataEvents.features[geojsonAllDataEvents.features.length -1].properties.startDate).getDate() - selectedDateRangeFrom);
	createDateFilter(toDate.toISOString().substring(0, 10), fromDate.toISOString().substring(0, 10));
	filterEvents();

	// Меняем подпись диапазона дат
	document.getElementById('selectedDateLabel').textContent = `Date range: 
    ${fromDate.toISOString().substring(0, 10)}
     - ${toDate.toISOString().substring(0, 10)}`;
}