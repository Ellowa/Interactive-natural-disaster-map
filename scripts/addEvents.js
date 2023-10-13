var geojsonAllDataEvents = {
	// список всех событий
	type: 'FeatureCollection',
	features: [],
};

//Обработчик события для кнопки получения координат с карты
function getCoordinatesByMapButtonClk() {
	const getCoordinatesByMapButton = document.getElementById('getCoordinatesByMapButton');

	getCoordinatesByMapButton.addEventListener('click', e => {
		document.getElementById('addEventZone').style = 'display: none;';
		map.getCanvas().style.cursor = 'pointer';
		//Получаем координаты следующего клика по карте
		map.once('click', e => {
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
function addEventBtnClick() {
	const addEventZone = document.getElementById('addEventZone');
	const addEventButton = document.getElementById('addEventButton');
	const closeBtn = document.getElementById('closeBtn');
	const addEventDataButton = document.getElementById('addEventDataButton');

	addEventButton.addEventListener('click', e => {
		//Проверка авторизации пользователя
		if (localStorage.getItem('login') == null) {
			window.alert('Only authorized users can add events');
			document.getElementById('LogInZone').style = 'display: flex';
			return 0;
		}

		var mUnitInput = document.getElementById('mUnitInputCombo');
		mUnitInput.replaceChildren();
		var mUnitDefaultOption = document.createElement('option');
		mUnitDefaultOption.selected = true;
		mUnitDefaultOption.disabled = true;
		mUnitInput.append(mUnitDefaultOption);

		$.ajax({
			url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/MagnitudeUnit`,
			method: 'GET',
			contentType: 'application/json; charset=utf-8',
			headers: {
				Authorization: `bearer ${localStorage.getItem('jwt')}`,
			},
			success: function (data) {
				data.forEach(mUnit => {
					var mUnitOptionElement = document.createElement('option');
					mUnitOptionElement.value = mUnit.magnitudeUnitName;
					mUnitOptionElement.innerHTML = mUnit.magnitudeUnitName;
					mUnitInput.append(mUnitOptionElement);
				});

				addEventZone.style = 'display: flex';
			},
			error: function (jqXHR, textStatus, error) {
				exceptionHandler(jqXHR, textStatus, error);
				addEventZone.style = 'display: none';
			},
		});

		var categoryInput = document.getElementById('categoryInputCombo');
		categoryInput.replaceChildren();
		var categoryDefaultOption = document.createElement('option');
		categoryDefaultOption.selected = true;
		categoryDefaultOption.disabled = true;
		categoryInput.append(categoryDefaultOption);

		$.ajax({
			url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/EventCategory`,
			method: 'GET',
			contentType: 'application/json; charset=utf-8',
			headers: {
				Authorization: `bearer ${localStorage.getItem('jwt')}`,
			},
			success: function (data) {
				data.forEach(eventCategory => {
					var eventCategoryOptionElement = document.createElement('option');
					eventCategoryOptionElement.value = eventCategory.categoryName;
					eventCategoryOptionElement.innerHTML = eventCategory.categoryName;
					categoryInput.append(eventCategoryOptionElement);
				});

				addEventZone.style = 'display: flex';
			},
			error: function (jqXHR, textStatus, error) {
				exceptionHandler(jqXHR, textStatus, error);
				addEventZone.style = 'display: none';
			},
		});

		
	});

	closeBtn.addEventListener('click', e => {
		addEventZone.style = 'display: none';
	});

	addEventDataButton.addEventListener('click', e => {
		const titleInput = document.getElementById('titleInput');
		const categoryInput = document.getElementById('categoryInputCombo');
		const lngInput = document.getElementById('lngInput');
		const latInput = document.getElementById('latInput');
		const startDateInput = document.getElementById('startDateInput');
		const closedDateInput = document.getElementById('closedDateInput');
		const mUnitInput = document.getElementById('mUnitInputCombo');
		const mValueInput = document.getElementById('mValueInput');
		const sourceInput = document.getElementById('sourceInput');

		var requiredFields = [titleInput, categoryInput, lngInput, latInput, startDateInput, mUnitInput];
		var allFields = [
			titleInput,
			categoryInput,
			lngInput,
			latInput,
			startDateInput,
			closedDateInput,
			mUnitInput,
			mValueInput,
			sourceInput,
		];
		var requiredFieldsIsEmpty = false;
		for (var inputElement of requiredFields) {
			if (inputElement.value == '') {
				inputElement.style = 'border-color: #F44336;';
				requiredFieldsIsEmpty = true;
			} else {
				inputElement.style = null;
			}
		}

		if (requiredFieldsIsEmpty) {
			document.getElementById('requiredTextAddEvent').style = 'color: #F44336;';
		} else {
			document.getElementById('requiredTextAddEvent').style = null;

			var eventJSON = {
				title: titleInput.value,
				eventCategoryName: categoryInput.value,
				startDate: startDateInput.value,
				endDate: closedDateInput.value,
				magnitudeUnitName: mUnitInput.value,
				magnitudeValue: mValueInput.value,
				link: sourceInput.value,
				latitude: latInput.value,
				longitude: lngInput.value,
			};
			if (closedDateInput.value.length == 0) eventJSON.endDate = null;
			if (mValueInput.value.length == 0) eventJSON.magnitudeValue = null;
			if (sourceInput.value.length == 0) eventJSON.link = null;
			eventJSON = JSON.stringify(eventJSON);
			//ОТПРАВКА СОБЫТИЯ В API
			$.ajax({
				url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/NaturalDisasterEvent',
				method: 'POST',
				dataType: 'text',
				contentType: 'application/json; charset=utf-8',
				data: eventJSON,
				headers: {
					Authorization: `bearer ${localStorage.getItem('jwt')}`,
				},
				success: function (data) {
					//Получение и добавление нового события на карту
					$.ajax({
						url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/NaturalDisasterEvent/${data}`,
						method: 'GET',
						contentType: 'application/json; charset=utf-8',
						headers: {
							Authorization: `bearer ${localStorage.getItem('jwt')}`,
						},
						success: function (data) {
							addIndmEventsToMap(data);
						},
						error: function (jqXHR, textStatus, error) {
							exceptionHandler(jqXHR, textStatus, error);
						},
					});

					for (var inputElement of allFields) {
						inputElement.value = null;
					}
					addEventZone.style = 'display: none';
					document.getElementById('lngDiv').classList.remove('coordinatesByMap');
					document.getElementById('latDiv').classList.remove('coordinatesByMap');
				},
				error: function (jqXHR, textStatus, error) {
					exceptionHandler(jqXHR, textStatus, error);
				},
			});
		}
	});
}

// Функция получения и обработки событий от EONET API
function addNasaEonetEventsToMap(data) {
	//останавливаем спинер (колесо загрузки) когда данные подгрузились
	document.getElementById('nasaLogoSpinner').style = 'animation: none;';
	document.getElementById('nasaSecondTitle').textContent = 'data for the last 90 days';

	// Редактирование (подгонка под наш вариант хранения события) полей события
	for (const feature of data.features) {
		feature.properties.categoriesNEW = feature.properties.categories[0].id;
		feature.properties.categoriesTitle = feature.properties.categories[0].title;
		feature.properties.link = feature.properties.sources[0].url;
		//Определение уровня угрозы события
		feature.properties.dangerLevel = 'No data';
		if (feature.properties.categoriesNEW == 'severeStorms' && feature.properties.magnitudeUnit == 'kts')
			feature.properties.dangerLevel = getSevereStormDangerLevelByKTS(feature.properties.magnitudeValue);

		feature.properties.Newid = feature.properties.id;
		geojsonAllDataEvents.features.push(feature);
	}

	// обновление источника данных для карты
	map.getSource('events').setData(geojsonAllDataEvents);
	// прорисовка событий на карте
	addPoints(geojsonAllDataEvents);
	// при добавлении новых событий мы обновляем временной слайдер (фильтр событий по времени)
	setDateFilterRange();
}

// Функция получения и обработки событий(землетрясений) от USGS API
function addUsgsEarthquakeToMap(data) {
	// Редактирование (подгонка под наш вариант хранения события) полей события
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

		feature.properties.Newid = feature.properties.ids;
		geojsonAllDataEvents.features.push(feature);
	}

	// обновление источника данных для карты
	map.getSource('events').setData(geojsonAllDataEvents);
	// прорисовка событий на карте
	addPoints(geojsonAllDataEvents);
	// при добавлении новых событий мы обновляем временной слайдер (фильтр событий по времени)
	setDateFilterRange();
}

// Функция получения и обработки событий от нашего INDM API
function addIndmEventsToMap(data) {
	// Редактирование (подгонка под наш вариант хранения события) полей события
	for (const feature of data.features) {
		var categoryTitle = feature.properties.category.split(/(?=[A-Z])/).join(' ');
		var dangerLevel = feature.properties.eventHazardUnit.split(/(?=[A-Z])/).join(' ');

		feature.properties.Newid = feature.properties.id;
		feature.properties.categoriesNEW = feature.properties.category;
		feature.properties.categoriesTitle = categoryTitle[0].toUpperCase() + categoryTitle.slice(1);
		feature.properties.date = feature.properties.startDate;
		feature.properties.closed = feature.properties.endDate;
		feature.properties.magnitudeUnit = feature.properties.magnitudeUnit.split(/(?=[A-Z])/).join(' ');
		feature.properties.dangerLevel = dangerLevel[0].toUpperCase() + dangerLevel.slice(1);
		feature.properties.isClosed = feature.properties.closed;

		//Todo костыль - правильно надо брать эти данные из БД
		if (feature.properties.categoriesNEW == 'severeStorms' && feature.properties.magnitudeUnit == 'kts')
			feature.properties.dangerLevel = getSevereStormDangerLevelByKTS(feature.properties.magnitudeValue);
		if (feature.properties.categoriesNEW == 'earthquakes')
			feature.properties.dangerLevel = getEarthquakesDangerLevelByMAG(feature.properties.magnitudeValue);
		//добавляем события к списку всех событий
		if (!geojsonAllDataEvents.features.includes(feature)) {
			geojsonAllDataEvents.features.push(feature);
		}
	}
	// обновление источника данных для карты
	map.getSource('events').setData(geojsonAllDataEvents);
	// прорисовка событий на карте
	addPoints(geojsonAllDataEvents);
	// при добавлении новых событий мы обновляем временной слайдер (фильтр событий по времени)
	setDateFilterRange();
}
