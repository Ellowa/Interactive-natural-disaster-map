mapboxgl.accessToken = 'pk.eyJ1IjoiZWxsb3dhIiwiYSI6ImNsMjdlamkzeDA3cmQzZXFseGl0bmFtdXUifQ.aslVME0d_CppwF6I_VZS9Q';
const map = new mapboxgl.Map({
    container: 'map', // html id карты
    style: 'mapbox://styles/mapbox/light-v10', // стиль карты
    zoom: 5, // начальное приближение
    center: [31.125149, 49.557266] // начальные координаты
});

// Добавление кнопок управления к карте
// zoom контроль
map.addControl(new mapboxgl.NavigationControl());
// геолокация пользователя
map.addControl(
    new mapboxgl.GeolocateControl({
    positionOptions: {
    enableHighAccuracy: true
    },
    // отслеживать в реальном времени
    trackUserLocation: true,
    // стрелка направления движения
    showUserHeading: true
    })
);

// Главная точка входа(прогрузки), происходит при загрузке карты
map.on('load', () => {
    // добавление источника данных к карте
    map.addSource('events', {
        type: 'geojson',
        data: geojsonAllDataEvents
    });

    $( document ).ready(function() { // страничка прогружена
        
        // регестрация(установка) слушателей событий 
        getCoordinatesByMapButtonClk();
        logOutBtnClk();
        registerBtnClick();
        logInBtnClick();
        addEventBtnClick();

        //Получаем список событий от NASA EONET API
        $.getJSON( "https://eonet.gsfc.nasa.gov/api/v3/events/geojson?status=all&category=drought,earthquakes,floods,landslides,severeStorms,snow,tempExtremes,volcanoes,wildfires&days=90")
        .done(function(data){
            addNasaEonetEventsToMap(data);
        });
        //Получаем список землетрясений от USGS
        $.getJSON( "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson")
        .done(function(data){
            addUsgsEarthquakeToMap(data);
        });
        $.getJSON( "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson")
        .done(function(data){
            addUsgsEarthquakeToMap(data);
        });
    });
});