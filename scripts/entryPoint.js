//Check if user already logIn
if(localStorage.getItem('login') != null && localStorage.getItem('jwt') != null)
{
    //Check if token has expired
    if(localStorage.getItem('jwtExpire') <= Date.now()) //token expired
    {
        localStorage.removeItem('login');
        localStorage.removeItem('jwt');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('jwtExpire');
    }
    else //token has not expired
    {
        logInSuccess();
    }
}

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
    if (map.getSource('events') == undefined){
        map.addSource('events', {
            type: 'geojson',
            data: geojsonAllDataEvents,
        });
    }

    $( document ).ready(function() { // страничка прогружена
        
        // регистрация(установка) слушателей событий 
        getCoordinatesByMapButtonClk();
        logOutBtnClk();
        registerBtnClick();
        logInBtnClick();
        addEventBtnClick();
        filterGroupActive();
        aboutBtnClick();
        placeholderClk();
        adminPanelBtnClick();
        adminPanelNavClick();

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
        getEventsFromIndmAPI();
    });
});

function getEventsFromIndmAPI()
{
    $.ajax({
        url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/NaturalDisasterEvent',
        method: 'GET',
        contentType: "application/json; charset=utf-8",
        headers: {
            'Authorization':`bearer ${localStorage.getItem('jwt')}`
        },
        success: function(data){
            addIndmEventsToMap(data);
        },
        error: function(jqXHR, textStatus, error) {
            
            exceptionHandler(jqXHR, textStatus, error);
        }
    });
}

// функция сворачивания и разворачивания окна с фильтрами событий
function filterGroupActive(){
    const filterGroup = document.getElementById('filter-group');
    const filterGroupCloseButton = document.getElementById('filterGroupCloseButton');
        
    filterGroupCloseButton.addEventListener('click', (e) => {
        if(window.getComputedStyle(filterGroup).display == 'block'){ // сворачивание окна
            filterGroup.style = 'opacity: 0; width: 0;';
            setTimeout(function() {
                filterGroup.style = 'display: none;';
            }, 2000);
            filterGroupCloseButton.style= 'cursor: zoom-in;';
        }
        else{ // разворачивание окна
            filterGroup.style = 'display: block; opacity: 0; width: 0;';
            setTimeout(function() {
                filterGroup.style = 'display: block; opacity: 1; width: 207px;';
            }, 10);
            filterGroupCloseButton.style= 'cursor: zoom-out;';
        }
    });
}

//Обработчик событий, при клик на надпись в поле ввода, оно получает фокус
function placeholderClk(){
    const placeholders = document.getElementsByClassName('placeholder');
    for(var placeholder of placeholders)
    {
        addPlaceholderEventListenerSync(placeholder);
    }
}

function addPlaceholderEventListenerSync(placeholder){
    placeholder.addEventListener('click', (e) => {
        placeholder.parentElement.children[0].focus();
    });
}