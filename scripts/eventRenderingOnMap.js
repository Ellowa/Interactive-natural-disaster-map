var allLayersID = []; // нужно для удобного извлечения всех слоёв карты
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
    }); 
}

// функция отрисовки событий на карте 
function addPoints(events){
    for (const feature of events.features) {
        var layerID = feature.properties.category;
        var fColor = feature.properties.dangerLevel;

        var fullLayerID = layerID + ' ' + fColor
        // Добавляем новый слой для каждого типа событий
        if (!map.getLayer(fullLayerID)) {
            // добавляем картинки (метки событий) к карте
            addIconSync(layerID);
            allLayersID.push(fullLayerID);
            // добавление нового слоя к карте (с уникальным id и уникальным набором событий)
            map.addLayer({
							id: fullLayerID,
							type: 'symbol',
							source: 'events',
							layout: {
								'icon-image': `${layerID}ICON`,
								'icon-size': 1,
							},
							paint: {
								'icon-color': getEventIconColorByDangerLevel(fColor),
							},
							filter: [
								'all',
								['==', 'category', layerID],
								['==', 'dangerLevel', fColor],
							],
						})
            // установка события фильтра событий для этого слоя карты
            addEventListenerToEventFilterSync(layerID, fullLayerID);
            
            // добавляем к событиям слоя описания (по клику на маркер)
            MarkerOnClick(fullLayerID);
        }
    }
}

// функция добавления описания для каждого события 
function MarkerOnClick(LayerId){
    // обработчик события, когда клик происходит по событию из слоя(для каждого слоя) карты
    map.on('click', LayerId, (e) => {
        // Получаем координаты для отрисовки на этом месте описания.
        const coordinates = e.features[0].geometry.coordinates;
        
        // Формируем html описание события
        let eventDescription = `<div class='popupDescription'>
        <p>Id: ${e.features[0].properties.id}</p>
        <p>Title: ${e.features[0].properties.title}</p>
        <p>Confirmed: ${e.features[0].properties.confirmed}</p>
        <p>Categories: ${e.features[0].properties.categoriesTitle}</p>
        <p>Coordinates: ${coordinates}</p>
        <p>Start date: ${e.features[0].properties.startDate}</p>
        <p>Closed/Update date: ${e.features[0].properties.endDate ?? 'Not closed'}</p>
        <p>Magnitude unit: ${e.features[0].properties.magnitudeUnit}</p>
        <p>Magnitude value: ${e.features[0].properties.magnitudeValue ?? 'No data'}</p>
        <p>Danger level: ${e.features[0].properties.dangerLevel}</p>`;
        if(e.features[0].properties.link !=null){
            eventDescription += `<p>Source: <a href="${e.features[0].properties.link}">${e.features[0].properties.link}</a></p></div>`;
        }
        else{
            eventDescription += `<p>Source: No data</p></div>`;
        }

        new mapboxgl.Popup().setLngLat(coordinates).setHTML(eventDescription).addTo(map);

        // Добавление кнопок управления событием
        addEventManagementCommand(e.features[0].properties, e.features[0].geometry);
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