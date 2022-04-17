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
        

        var requiredFields = [loginInput, passwordInput];
        var allFields = [loginInput, passwordInput];
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
            document.getElementById('requiredTextLogin').style = 'color: #F44336;';
        }
        else
        {
            document.getElementById('requiredTextLogin').style = null;

            //ПРОЦЕДУРА ЛОГИНА

            for (var inputElement of allFields)
            {
                inputElement.value = null;
            }
            LogInZone.style = 'display: none';
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
                            "categoriesTitle": categoryInput.value,
                            "date": startDateInput.value,
                            "closed": closedDateInput.value,
                            "magnitudeUnit": mUnitInput.value,
                            "magnitudeValue": mValueInput.value,
                            "link": sourceInput.value},
                "geometry": {
                "type": "Point",
                "coordinates": [ lngInput.value, latInput.value ]
                }
            };
            geojsonAllDataEvents.features.push(data);
            map.getSource('events').setData(geojsonAllDataEvents);
            addPoints(geojsonAllDataEvents);

            for (var inputElement of allFields)
            {
                inputElement.value = null;
            }
            addEventZone.style = 'display: none';
        }
    });
}


function addPoints(events){
    for (const feature of events.features) {
        const layerID = feature.properties.categoriesNEW;
        // Add a layer for this symbol type if it hasn't been added already.
        if (!map.getLayer(layerID)) {
            map.loadImage(`images/${layerID}.png`, (error, image) => {
            if (error) throw error;
            // Add the image to the map style.
            map.addImage(`${layerID}ICON`, image, { 'sdf': true });//НАДО разобраться с sdf, он нужен чтобы менять цвет фона.
            });
            map.addLayer({
                'id': layerID,
                'type': 'symbol',
                'source': 'events',
                'layout': {
                    'icon-image': `${layerID}ICON`,
                    'icon-size': 1
                },
                'paint': {
                    'icon-color': 'black'
                },
                'filter': ['==', 'categoriesNEW', layerID]
                });

            // When the checkbox changes, update the visibility of the layer.
            const input = document.getElementById(layerID);
            input.addEventListener('change', (e) => {
                map.setLayoutProperty(
                    layerID,
                    'visibility',
                    e.target.checked ? 'visible' : 'none'
                );
                console.log(layerID);
            });
            MarkerOnClick(layerID);
        }
    }
}


var geojsonAllDataEvents = {
    "type": "FeatureCollection",
    "features": []
  };
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxsb3dhIiwiYSI6ImNrdzIzcjJ3ejBjYWIycHBhODNpOHFpaGMifQ.ujVprrtaSgn3X0TE4T5cPw';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    zoom: 5, // starting zoom
    center: [31.125149, 49.557266] // starting center
});
map.addControl(new mapboxgl.NavigationControl());
map.on('load', () => {
    map.addSource('events', {
        type: 'geojson',
        // Use a URL for the value for the `data` property.
        data: geojsonAllDataEvents
    });

    $( document ).ready(function() { //может от єтого избавиться (Получение json объекта через jquery)
        
        logInBtnClick();
        addEventBtnClick();
        //Получаем список событий
        $.getJSON( "https://eonet.gsfc.nasa.gov/api/v3/events/geojson?status=all&category=drought,earthquakes,floods,landslides,severeStorms,snow,tempExtremes,volcanoes,wildfires&days=90")
        .done(function( data ) {
            //останавливаем спинер (колесо загрузки) когда данные подгрузились
            document.getElementById('nasaLogoSpinner').style = 'animation: none;';
            document.getElementById('nasaDataLink').textContent = 'NASA EONET';

            console.log(data);
            //Пока костыль. Нужно поскольку дальше для фильтра событий средствами mapbox я не могу пройти вглубь массива
            var i = geojsonAllDataEvents.features.length;
            console.log(i);
            for (const feature of data.features) {
                feature.properties.categoriesNEW = feature.properties.categories[0].id;
                feature.properties.categoriesTitle = feature.properties.categories[0].title;
                feature.properties.link = feature.properties.sources[0].url;
                feature.properties.Newid = i;
                i++;
            }


            //ДЛЯ ТЕСТА ЗНАЧКОВ
            // data.features[281].properties.categoriesNEW = "drought";
            // data.features[107].properties.categoriesNEW = "earthquakes";
            // data.features[165].properties.categoriesNEW = "floods";
            // data.features[348].properties.categoriesNEW = "landslides";
            // data.features[100].properties.categoriesNEW = "snow";
            // data.features[200].properties.categoriesNEW = "tempExtremes";
            // console.log(data);


            for (const feature of data.features) {
                geojsonAllDataEvents.features.push(feature);
            }
            map.getSource('events').setData(geojsonAllDataEvents);
            addPoints(geojsonAllDataEvents);
        });
    });
});

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
        <p>Closed date: ${e.features[0].properties.closed ?? 'Неоконченное событие'}</p>
        <p>Magnitude unit: ${e.features[0].properties.magnitudeUnit ?? 'Нет данных'}</p>
        <p>Magnitude value: ${e.features[0].properties.magnitudeValue ?? 'Нет данных'}</p>
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