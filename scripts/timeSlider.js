function setDateFilterRange(){
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

function createFilterByLayerId(toDate, layerID){
    var filters = [
        'all',
        ['>=', 'date', toDate],
        ['==', 'categoriesNEW', layerID]
    ];
    return filters;
}

function filterByDate(toDate){

    // Применяем фильтр ко всем слоям карты
    if (map.getLayer('drought'))
        map.setFilter('drought', createFilterByLayerId(toDate, 'drought'));
    if (map.getLayer('earthquakes'))
        map.setFilter('earthquakes', createFilterByLayerId(toDate, 'earthquakes'));
    if (map.getLayer('floods'))
        map.setFilter('floods', createFilterByLayerId(toDate, 'floods'));
    if (map.getLayer('landslides'))
        map.setFilter('landslides', createFilterByLayerId(toDate, 'landslides'));
    if (map.getLayer('severeStorms'))
        map.setFilter('severeStorms', createFilterByLayerId(toDate, 'severeStorms'));
    if (map.getLayer('snow'))
        map.setFilter('snow', createFilterByLayerId(toDate, 'snow'));
    if (map.getLayer('volcanoes'))
        map.setFilter('volcanoes', createFilterByLayerId(toDate, 'volcanoes'));
    if (map.getLayer('wildfires'))
        map.setFilter('wildfires', createFilterByLayerId(toDate, 'wildfires'));
    // Меняеем подпись диапазона дат 
    document.getElementById('selectedDateLabel').textContent = `Date range: ${geojsonAllDataEvents.features[0].properties.date.substring(0,10)} - ${toDate}`;
}

// Обработчик события для диапазона дат
document.getElementById('dateSlider').addEventListener('input', (e) => {
    var selectedDateRange = e.target.value;
    var toDate = new Date();
    toDate.setDate((new Date(geojsonAllDataEvents.features[0].properties.date)).getDate() - selectedDateRange);
    filterByDate(toDate.toISOString().substring(0,10));
});