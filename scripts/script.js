//Обработчик события для кнопки получения координат с карты
function getCoordinatesByMapButtonClk(){
    const getCoordinatesByMapButton = document.getElementById('getCoordinatesByMapButton');

    getCoordinatesByMapButton.addEventListener('click', (e) => {
        document.getElementById('addEventZone').style = 'display: none;';
        map.getCanvas().style.cursor = 'pointer';
        //Получаем координаты следующего клика по карте
        map.once('click', (e) => {
            document.getElementById('lngInput').value = e.lngLat.toArray()[0];
            
            document.getElementById('latInput').value = e.lngLat.toArray()[1];
            document.getElementById('addEventZone').style = 'display: flex;';
            map.getCanvas().style.cursor = '';

            //Костыль на то чтобы надписи описания поля уезжали наверх
            document.getElementById('lngDiv').classList.add('coordinatesByMap');
            document.getElementById('latDiv').classList.add('coordinatesByMap');
        });
        

    });
}

//Обработчик событий для кнопки выхода
function logOutBtnClk(){
    const logOutButton = document.getElementById('logOutButton');

    logOutButton.addEventListener('click', (e) => {
        const userAccountButton = document.getElementById('userAccountButton');
        const registerButton = document.getElementById('registerButton');
        const logInButton = document.getElementById('logInButton');

        userAccountButton.style = 'display: none';
        logOutButton.style = 'display: none';

        registerButton.style = null;
        logInButton.style = null;
    });
}

//Функция смены стиля зоны логина при успешном входе/регистрации
function logInSuccess(){
    const registerButton = document.getElementById('registerButton');
    const logInButton = document.getElementById('logInButton');

    registerButton.style = 'display: none';
    logInButton.style = 'display: none';

    var userAccountButton = document.getElementById('userAccountButton');
    var logOutButton = document.getElementById('logOutButton');
    userAccountButton.value = account.get('login');
    userAccountButton.style = null;
    logOutButton.style = null;
    
}

//временный аккаунт пользователя (ЗАГЛУШКА)
var account = new Map([
    ['login', ''],
    ['password', '']
]);

// Обработчик событий для кнопки регистрации
function registerBtnClick(){
    const registerZone = document.getElementById('registerZone');
    const registerButton = document.getElementById('registerButton');
    const closeBtnRegZone = document.getElementById('closeBtnRegZone');
    const acceptRegButton = document.getElementById('acceptRegButton');

    registerButton.addEventListener('click', (e) => {
        registerZone.style = 'display: flex';
    });

    closeBtnRegZone.addEventListener('click', (e) => {
        registerZone.style = 'display: none';
    });

    acceptRegButton.addEventListener('click', (e) => {
        const loginRegInput = document.getElementById('loginRegInput');
        const passworRegInput = document.getElementById('passworRegInput');
        

        var allFields = [loginRegInput, passworRegInput];
        var requiredFieldsIsEmpty = false;
        for (var inputElement of allFields)
        {
            if(inputElement.value == "")
            {
                inputElement.style = 'border-color: #F44336;';
                requiredFieldsIsEmpty = true;
            }
            else
            {
                inputElement.style = null;
            }
        }

        if(requiredFieldsIsEmpty)
        {
            document.getElementById('requiredTextRegister').style = 'color: #F44336;';
        }
        else
        {
            document.getElementById('requiredTextRegister').style = null;

            //ПРОЦЕДУРА РЕГИСТРАЦИИ 
            account.set('login', loginRegInput.value);
            account.set('password', passworRegInput.value);

            for (var inputElement of allFields)
            {
                inputElement.value = null;
            }
            registerZone.style = 'display: none';
            logInSuccess();
        }
    });

}

// Обработчик событий для кнопки логина
function logInBtnClick(){
    const LogInZone = document.getElementById('LogInZone');
    const logInButton = document.getElementById('logInButton');
    const closeBtnLoginZone = document.getElementById('closeBtnLoginZone');
    const acceptLogInButton = document.getElementById('acceptLogInButton');
    

    logInButton.addEventListener('click', (e) => {
        LogInZone.style = 'display: flex';
    });

    closeBtnLoginZone.addEventListener('click', (e) => {
        LogInZone.style = 'display: none';
    });

    acceptLogInButton.addEventListener('click', (e) => {
        const loginInput = document.getElementById('loginInput');
        const passwordInput = document.getElementById('passwordInput');
        
        const requiredTextLogin = document.getElementById('requiredTextLogin');

        var allFields = [loginInput, passwordInput];
        var requiredFieldsIsEmpty = false;
        for (var inputElement of allFields)
        {
            if(inputElement.value == "")
            {
                inputElement.style = 'border-color: #F44336;';
                requiredFieldsIsEmpty = true;
            }
            else
            {
                inputElement.style = null;
            }
        }

        if(requiredFieldsIsEmpty)
        {
            requiredTextLogin.textContent = '* required fields';
            requiredTextLogin.style = 'color: #F44336;';
        }
        else
        {
            requiredTextLogin.style = null;

            //ПРОЦЕДУРА ЛОГИНА
            if(loginInput.value == account.get('login') && passwordInput.value == account.get('password'))
            {//Успешный логин

                for (var inputElement of allFields)
                {
                    inputElement.value = null;
                }
                LogInZone.style = 'display: none';
                logInSuccess();
            }
            else
            {// неуспешный логин
                requiredTextLogin.textContent = 'Not found login \n or password';
            }

            
        }
    });

}

// Обработчики событий добавления маркера на карту
function addEventBtnClick(){
    const addEventZone = document.getElementById('addEventZone');
    const addEventButton = document.getElementById('addEventButton');
    const closeBtn = document.getElementById('closeBtn');
    const addEventDataButton = document.getElementById('addEventDataButton');

    addEventButton.addEventListener('click', (e) => {
        addEventZone.style = 'display: flex';
    });

    closeBtn.addEventListener('click', (e) => {
        addEventZone.style = 'display: none';
    });

    addEventDataButton.addEventListener('click', (e) => {
        const titleInput = document.getElementById('titleInput');
        const categoryInput = document.getElementById('categoryInputCombo');
        const lngInput = document.getElementById('lngInput');
        const latInput = document.getElementById('latInput');
        const startDateInput = document.getElementById('startDateInput');
        const closedDateInput = document.getElementById('closedDateInput');
        const mUnitInput = document.getElementById('mUnitInput');
        const mValueInput = document.getElementById('mValueInput');
        const dangerLevelInputCombo = document.getElementById('dangerLevelInputCombo');
        const sourceInput = document.getElementById('sourceInput');

        var requiredFields = [titleInput, categoryInput, lngInput, latInput, startDateInput];
        var allFields = [titleInput, categoryInput, lngInput, latInput, startDateInput, closedDateInput, mUnitInput, mValueInput, sourceInput];
        var requiredFieldsIsEmpty = false;
        for (var inputElement of requiredFields)
        {
            if(inputElement.value == "")
            {
                inputElement.style = 'border-color: #F44336;';
                requiredFieldsIsEmpty = true;
            }
            else
            {
                inputElement.style = null;
            }
        }

        if(requiredFieldsIsEmpty)
        {
            document.getElementById('requiredTextAddEvent').style = 'color: #F44336;';
        }
        else
        {
            document.getElementById('requiredTextAddEvent').style = null;

            for (var inputElement of allFields)
            {
                if(inputElement.value == "")
                {
                    inputElement.value = "Нет данных";
                }
            }
            var data = {
                "type": "Feature",
                "properties": {"title": titleInput.value,
                            "Newid": geojsonAllDataEvents.features.length,
                            "categoriesNEW": categoryInput.value,
                            "categoriesTitle": categoryInput.options[categoryInput.selectedIndex].textContent,
                            "date": startDateInput.value,
                            "closed": closedDateInput.value,
                            "magnitudeUnit": mUnitInput.value,
                            "magnitudeValue": mValueInput.value,
                            "dangerLevel": dangerLevelInputCombo.options[dangerLevelInputCombo.selectedIndex].textContent,
                            "link": sourceInput.value},
                "geometry": {
                "type": "Point",
                "coordinates": [ lngInput.value, latInput.value ]
                }
            };

            //Определение уровня угрозы события;
            if(data.properties.categoriesNEW == 'severeStorms' && data.properties.magnitudeUnit == 'kts')
                data.properties.dangerLevel = getSevereStormDangerLevelByKTS(data.properties.magnitudeValue);

            geojsonAllDataEvents.features.push(data);
            map.getSource('events').setData(geojsonAllDataEvents);
            addPoints(geojsonAllDataEvents);
            setDateFilterRange();

            for (var inputElement of allFields)
            {
                inputElement.value = null;
            }
            addEventZone.style = 'display: none';
            document.getElementById('lngDiv').classList.remove('coordinatesByMap');
            document.getElementById('latDiv').classList.remove('coordinatesByMap');
        }
    });
}


function addIconSync(layerID){
    map.loadImage(`images/${layerID}.png`, (error, image) => {
        if (error){
            throw error;
        } 
        if (!map.hasImage(`${layerID}ICON`)) 
        {
            map.addImage(`${layerID}ICON`, image, { 'sdf': true });//НАДО разобраться с sdf, он нужен чтобы менять цвет фона.
        }
    });
}

function addEventListenerToEventFilterSync(layerID, fullLayerID){
    // Обработчик событий для фильтра (смена категорий) событий
    const input = document.getElementById(layerID);
    input.addEventListener('change', (e) => {
        map.setLayoutProperty(
            fullLayerID,
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
        console.log(fullLayerID);
    }); 
}

function addPoints(events){
    for (const feature of events.features) {
        var layerID = feature.properties.categoriesNEW;
        var fCollor = feature.properties.dangerLevel;

        var fullLayerID = layerID + fCollor;
        // Длбовляем новый слой для каждого типа событий
        if (!map.getLayer(fullLayerID)) {
            // добовляем картинки (метки событий) к карте
            addIconSync(layerID);
            map.addLayer({
                'id': fullLayerID,
                'type': 'symbol',
                'source': 'events',
                'layout': {
                    'icon-image': `${layerID}ICON`,
                    'icon-size': 1
                },
                'paint': {
                    'icon-color': getEventIconColorByDangerLevel(fCollor)
                },
                'filter': [
                    'all',
                    ['==', 'categoriesNEW', layerID],
                    ['==', 'dangerLevel', fCollor]
                ]
            });
            addEventListenerToEventFilterSync(layerID, fullLayerID);
            
            MarkerOnClick(fullLayerID);
        }
    }
}


var geojsonAllDataEvents = {
    "type": "FeatureCollection",
    "features": []
  };
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxsb3dhIiwiYSI6ImNsMjdlamkzeDA3cmQzZXFseGl0bmFtdXUifQ.aslVME0d_CppwF6I_VZS9Q';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    zoom: 5, // starting zoom
    center: [31.125149, 49.557266] // starting center
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


map.on('load', () => {
    map.addSource('events', {
        type: 'geojson',
        // Use a URL for the value for the `data` property.
        data: geojsonAllDataEvents
    });

    $( document ).ready(function() { //может от єтого избавиться (Получение json объекта через jquery)
        
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
    });
});

function addNasaEonetEventsToMap(data){
    //останавливаем спинер (колесо загрузки) когда данные подгрузились
    document.getElementById('nasaLogoSpinner').style = 'animation: none;';
    document.getElementById('nasaSecondTitle').textContent = 'data for the last 90 days';

    
    // Редактирование полей события
    var i = geojsonAllDataEvents.features.length;
    console.log(i);
    for (const feature of data.features) {
        feature.properties.categoriesNEW = feature.properties.categories[0].id;
        feature.properties.categoriesTitle = feature.properties.categories[0].title;
        feature.properties.link = feature.properties.sources[0].url;
        //Определение уровня угрозы события
        feature.properties.dangerLevel = 'No data';
        if(feature.properties.categoriesNEW == 'severeStorms' && feature.properties.magnitudeUnit == 'kts')
            feature.properties.dangerLevel = getSevereStormDangerLevelByKTS(feature.properties.magnitudeValue);
        
        feature.properties.Newid = i;
        i++;
        geojsonAllDataEvents.features.push(feature);
    }
   

    //ДЛЯ ТЕСТА ЗНАЧКОВ
    // data.features[281].properties.categoriesNEW = "drought";
    // data.features[107].properties.categoriesNEW = "earthquakes";
    // data.features[165].properties.categoriesNEW = "floods";
    // data.features[348].properties.categoriesNEW = "landslides";
    // data.features[100].properties.categoriesNEW = "snow";
    // data.features[200].properties.categoriesNEW = "tempExtremes";

    map.getSource('events').setData(geojsonAllDataEvents);
    addPoints(geojsonAllDataEvents);
    setDateFilterRange();
}

function addUsgsEarthquakeToMap(data){
    // Редактирование полей события
    var i = geojsonAllDataEvents.features.length;
    console.log(i);
    for (const feature of data.features) {
        feature.properties.categoriesNEW = 'earthquakes';
        feature.properties.categoriesTitle = 'Earthquakes';
        feature.properties.link = feature.properties.url;
        feature.properties.magnitudeUnit = feature.properties.magType;
        feature.properties.magnitudeValue = feature.properties.mag;
        feature.properties.date = new Date(feature.properties.time);
        feature.properties.closed = new Date(feature.properties.updated);
        //Определение уровня угрозы события
        feature.properties.dangerLevel = getEarthquakesDangerLevelByMAG(feature.properties.magnitudeValue);
        
        feature.properties.Newid = i;
        i++;
        geojsonAllDataEvents.features.push(feature);
    }

    map.getSource('events').setData(geojsonAllDataEvents);
    addPoints(geojsonAllDataEvents);
    setDateFilterRange();
}

function MarkerOnClick(LayerId){
    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', LayerId, (e) => {
        // Получаем координаты для отрисовки на этом месте описания.
        const coordinates = e.features[0].geometry.coordinates;
        
        // Формируем описание события
        let description = `<div class='popupDiscription'><p>Title: ${e.features[0].properties.title}</p>
        <p>Id: ${e.features[0].properties.Newid}</p>
        <p>Categories: ${e.features[0].properties.categoriesTitle}</p>
        <p>Coordinates: ${coordinates}</p>
        <p>Start date: ${e.features[0].properties.date}</p>
        <p>Closed/update date: ${e.features[0].properties.closed ?? 'Неоконченное событие'}</p>
        <p>Magnitude unit: ${e.features[0].properties.magnitudeUnit ?? 'Нет данных'}</p>
        <p>Magnitude value: ${e.features[0].properties.magnitudeValue ?? 'Нет данных'}</p>
        <p>Danger level: ${e.features[0].properties.dangerLevel ?? 'Нет данных'}</p>
        <p>Sources: <a href="${e.features[0].properties.link}">${(e.features[0].properties.link == 'Нет данных') ? 'Нет данных': 'click'}</a></p></div>`;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        // coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        // }

        new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });
        
        // Меняем тип курсора при наведение на маркер
        map.on('mouseenter', LayerId, () => {
        map.getCanvas().style.cursor = 'pointer';
        });
        
        // Меняем тип курсора при выходе из маркера
        map.on('mouseleave', LayerId, () => {
        map.getCanvas().style.cursor = '';
        });
}