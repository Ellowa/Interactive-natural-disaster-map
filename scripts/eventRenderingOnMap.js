var allLayersID = []; // нужно для удобного извличения всех слаёв карты
//Функция добавления(подгрузки для карты) новой иконки
function addIconSync(layerID){
    map.loadImage(`images/${layerID}.png`, (error, image) => {
        if (error){
            throw error;
        } 
        if (!map.hasImage(`${layerID}ICON`)) 
        {
            map.addImage(`${layerID}ICON`, image, { 'sdf': true });//sdf изображения используем чтобы ему динамически(от уровня угрозы) менять цвет
        }
    });
}

//Обработчик событий установки фильтров категорий событий
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

// функция отрисовки событий на карте 
function addPoints(events){
    for (const feature of events.features) {
        var layerID = feature.properties.categoriesNEW;
        var fCollor = feature.properties.dangerLevel;

        var fullLayerID = layerID + " " + fCollor;
        // Длбовляем новый слой для каждого типа событий
        if (!map.getLayer(fullLayerID)) {
            // добовляем картинки (метки событий) к карте
            addIconSync(layerID);
            allLayersID.push(fullLayerID);
            // добавление нового слоя к карте (с уникальным id и уникальным набором событий)
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
            // установка события фильтра событий для этого слоя карты
            addEventListenerToEventFilterSync(layerID, fullLayerID);
            
            // добавляем к событиям слоя описания (по клику на маркер)
            MarkerOnClick(fullLayerID);
        }
    }
}

// фукция добавления описания для каждого события 
function MarkerOnClick(LayerId){
    // обработчик события, когда клик происходит по событию из слоя(для каждого слоя) карты
    map.on('click', LayerId, (e) => {
        // Получаем координаты для отрисовки на этом месте описания.
        const coordinates = e.features[0].geometry.coordinates;
        
        // Формируем html описание события
        let description = `<div class='popupDiscription'><p>Title: ${e.features[0].properties.title}</p>
        <p>Id: ${e.features[0].properties.Newid}</p>
        <p>Categories: ${e.features[0].properties.categoriesTitle}</p>
        <p>Coordinates: ${coordinates}</p>
        <p>Start date: ${e.features[0].properties.date}</p>
        <p>Closed/update date: ${e.features[0].properties.closed ?? 'Not closed'}</p>
        <p>Magnitude unit: ${e.features[0].properties.magnitudeUnit ?? 'No data'}</p>
        <p>Magnitude value: ${e.features[0].properties.magnitudeValue ?? 'No data'}</p>
        <p>Danger level: ${e.features[0].properties.dangerLevel ?? 'No data'}</p>
        <p>Sources: <a href="${e.features[0].properties.link}">${(e.features[0].properties.link == 'No data') ? 'No data': 'click'}</a></p></div>`;

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