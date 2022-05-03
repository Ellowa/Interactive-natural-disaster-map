// функция изминения dateSlider параметров в зависимости от текущего списка событий
function setDateFilterRange(){
    // сортируем события по времени их старта
    geojsonAllDataEvents.features.sort(function(a, b) {
        if (a.properties.date > b.properties.date) {
            return 1;
        }
        if (a.properties.date < b.properties.date) {
            return -1;
        }
        return 0;
    });
    
    // отобразим собития от новых к старым 
    geojsonAllDataEvents.features.reverse();

    // найдем разницу в днях между первым и последним событием
    var date1 = new Date(geojsonAllDataEvents.features[0].properties.date);
    var date2 = new Date(geojsonAllDataEvents.features[geojsonAllDataEvents.features.length -1].properties.date);

    var timeDiff = Math.abs(date1.getTime() - date2.getTime());
    var daysRange = Math.ceil(timeDiff / (1000 * 3600 * 24));

    document.getElementById('dateSlider').max = daysRange;
    //document.getElementById('dateSlider').value = daysRange;
}

// функия формирования фильтра событий в зависимости от id слоя(для которого делаем фильтр)
function createFilterByLayerId(toDate, layerID, fCollor){
    var filters = [
        'all',
        ['>=', 'date', toDate],
        ['==', 'categoriesNEW', layerID],
        ['==', 'dangerLevel', fCollor]
    ];
    return filters;
}

// функция фильтрации событий по дате их начала
function filterByDate(toDate){
    // Применяем фильтр ко всем слоям карты
    for (layerID in allLayersID)
    {
        var categoriesFromLayerID = allLayersID[layerID].split(' ')[0];
        var dangerLevelFromLayerID = allLayersID[layerID].slice(categoriesFromLayerID.length+1);
        map.setFilter(allLayersID[layerID], createFilterByLayerId(toDate, categoriesFromLayerID, dangerLevelFromLayerID));
    }

    // Меняеем подпись диапазона дат 
    document.getElementById('selectedDateLabel').textContent = `Date range: ${geojsonAllDataEvents.features[0].properties.date.substring(0,10)} - ${toDate}`;
}

// Обработчик события для диапазона дат(dateSlider)
document.getElementById('dateSlider').addEventListener('input', (e) => {
    var selectedDateRange = e.target.value;
    var toDate = new Date();
    toDate.setDate((new Date(geojsonAllDataEvents.features[0].properties.date)).getDate() - selectedDateRange -1);
    filterByDate(toDate.toISOString().substring(0,10));
});