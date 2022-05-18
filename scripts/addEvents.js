var geojsonAllDataEvents = { // список всех событий
    "type": "FeatureCollection",
    "features": []
};

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

// Обработчики событий добавления маркера на карту
function addEventBtnClick(){
    const addEventZone = document.getElementById('addEventZone');
    const addEventButton = document.getElementById('addEventButton');
    const closeBtn = document.getElementById('closeBtn');
    const addEventDataButton = document.getElementById('addEventDataButton');

    
    addEventButton.addEventListener('click', (e) => {
        //Проверка авторизации пользователя
        if(account.get('login') == ''){
            window.alert('Only authorized users can add events');
            document.getElementById('LogInZone').style = 'display: flex';
            return 0;
        }

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
                    inputElement.value = "No data";
                }
            }
            // формируем новое событие
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
            if(data.properties.categoriesNEW == 'earthquakes')
                data.properties.dangerLevel = getEarthquakesDangerLevelByMAG(data.properties.magnitudeValue);

            //добавляем события к списку всех событий и отображаем их на карте
            geojsonAllDataEvents.features.push(data);
            map.getSource('events').setData(geojsonAllDataEvents);
            addPoints(geojsonAllDataEvents); // костыль (ибо мы запихиваем не 1 новую точку на карту а перересовываем все точки), может негативно сказываться на производительности (но нужно если вдруг поменяется информация об уже отрисованной точки)
            // при добавлении новых событий мы обновляем временной слайдер (фильтр событий по времени)
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

// Функция получения и обработки событий от EONET API
function addNasaEonetEventsToMap(data){
    //останавливаем спинер (колесо загрузки) когда данные подгрузились
    document.getElementById('nasaLogoSpinner').style = 'animation: none;';
    document.getElementById('nasaSecondTitle').textContent = 'data for the last 90 days';

    
    // Редактирование (подгонка под наш вариант хранения события) полей события
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

    // обновление источника данных для карты
    map.getSource('events').setData(geojsonAllDataEvents);
    // прорисовка событий на карте
    addPoints(geojsonAllDataEvents);
    // при добавлении новых событий мы обновляем временной слайдер (фильтр событий по времени)
    setDateFilterRange();
}

// Функция получения и обработки событий(землетрясений) от USGS API
function addUsgsEarthquakeToMap(data){
    // Редактирование (подгонка под наш вариант хранения события) полей события
    var i = geojsonAllDataEvents.features.length;
    console.log(i);
    for (const feature of data.features) {
        feature.properties.categoriesNEW = 'earthquakes';
        feature.properties.categoriesTitle = 'Earthquakes';
        feature.properties.link = feature.properties.url;
        feature.properties.magnitudeUnit = feature.properties.magType;
        feature.properties.magnitudeValue = feature.properties.mag;
        feature.properties.date = new Date(feature.properties.time).toISOString();
        feature.properties.closed = new Date(feature.properties.updated).toISOString();
        //Определение уровня угрозы события
        feature.properties.dangerLevel = getEarthquakesDangerLevelByMAG(feature.properties.magnitudeValue);
        
        feature.properties.Newid = i;
        i++;
        geojsonAllDataEvents.features.push(feature);
    }

    // обновление источника данных для карты
    map.getSource('events').setData(geojsonAllDataEvents);
    // прорисовка событий на карте
    addPoints(geojsonAllDataEvents);
    // при добавлении новых событий мы обновляем временной слайдер (фильтр событий по времени)
    setDateFilterRange();
}