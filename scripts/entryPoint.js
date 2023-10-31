availableEventCategories = [
	'volcanoes',
	'severeStorms',
	'wildfires',
	'drought',
	'earthquakes',
	'floods',
	'landslides',
	'snow',
	'tempExtremes',
    'other'
];

//Check if user already logIn
if (localStorage.getItem('login') != null && localStorage.getItem('jwt') != null) {
	//Check if token has expired
	if (localStorage.getItem('jwtExpire') <= Date.now()) {
		//token expired
		localStorage.removeItem('login');
		localStorage.removeItem('jwt');
		localStorage.removeItem('userRole');
		localStorage.removeItem('userId');
		localStorage.removeItem('jwtExpire');

		if (localStorage.getItem('additionalDate') != null) localStorage.removeItem('additionalDate');
		if (localStorage.getItem('additionalDateRange') != null) localStorage.removeItem('additionalDateRange');
	} //token has not expired
	else {
		logInSuccess();
	}
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZWxsb3dhIiwiYSI6ImNsMjdlamkzeDA3cmQzZXFseGl0bmFtdXUifQ.aslVME0d_CppwF6I_VZS9Q';
const map = new mapboxgl.Map({
	container: 'map', // html id карты
	style: 'mapbox://styles/mapbox/light-v10', // стиль карты
	zoom: 5, // начальное приближение
	center: [31.125149, 49.557266], // начальные координаты
});

// Добавление кнопок управления к карте
// zoom контроль
map.addControl(new mapboxgl.NavigationControl());
// геолокация пользователя
map.addControl(
	new mapboxgl.GeolocateControl({
		positionOptions: {
			enableHighAccuracy: true,
		},
		// отслеживать в реальном времени
		trackUserLocation: true,
		// стрелка направления движения
		showUserHeading: true,
	})
);

// Главная точка входа(прогрузки), происходит при загрузке карты
map.on('load', () => {
	// добавление источника данных к карте
	if (map.getSource('events') == undefined) {
		map.addSource('events', {
			type: 'geojson',
			data: geojsonAllDataEvents,
		});
	}

	$(document).ready(function () {
		// страничка прогружена

		// регистрация(установка) слушателей событий
		additionalDateRangeController();
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
		dangerValueInfoZoneBtnClick();
		aboutPanelNavClick();
		userAccountBtnClick();

		//Получаем список событий от INDM API
		getEventsFromIndmAPI();
	});
});

function getEventsFromIndmAPI() {
	var getRequestQueryData = '';
	if (localStorage.getItem('additionalDate') == 'true' && localStorage.getItem('additionalDateRange') != null)
		getRequestQueryData = '?ExtendedPeriodEndPoint=' + localStorage.getItem('additionalDateRange');
	$.ajax({
		url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/NaturalDisasterEvent' + getRequestQueryData,
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
}

// функция сворачивания и разворачивания окна с фильтрами событий
function filterGroupActive() {
	const filterGroup = document.getElementById('filter-group');
	const filterGroupCloseButton = document.getElementById('filterGroupCloseButton');

	filterGroupCloseButton.addEventListener('click', e => {
		if (window.getComputedStyle(filterGroup).display == 'block') {
			// сворачивание окна
			filterGroup.style = 'opacity: 0; width: 0;';
			setTimeout(function () {
				filterGroup.style = 'display: none;';
			}, 2000);
			filterGroupCloseButton.style = 'cursor: zoom-in;';
		} else {
			// разворачивание окна
			filterGroup.style = 'display: block; opacity: 0; width: 0;';
			setTimeout(function () {
				filterGroup.style = 'display: block; opacity: 1; width: 207px;';
			}, 10);
			filterGroupCloseButton.style = 'cursor: zoom-out;';
		}
	});
}

//Обработчик событий, при клик на надпись в поле ввода, оно получает фокус
function placeholderClk() {
	const placeholders = document.getElementsByClassName('placeholder');
	for (var placeholder of placeholders) {
		addPlaceholderEventListenerSync(placeholder);
	}
}

function addPlaceholderEventListenerSync(placeholder) {
	placeholder.addEventListener('click', e => {
		placeholder.parentElement.children[0].focus();
	});
}

function additionalDateRangeController() {
	var additionalDateInput = document.getElementById('additionalDateInput');
	var additionalDate = document.getElementById('additionalDate');
	dateNow = new Date();
	dateFiveYearsAgo = new Date();
	dateFiveYearsAgo.setDate(dateNow.getDate() - 1824);
	additionalDateInput.min = `${dateFiveYearsAgo.getFullYear()}-${
		dateFiveYearsAgo.getMonth() < 10 ? '0' + dateFiveYearsAgo.getMonth() : dateFiveYearsAgo.getMonth()
	}-${dateFiveYearsAgo.getDate()}`;

	additionalDateInput.max = `${dateNow.getFullYear()}-${
		dateNow.getMonth() < 10 ? '0' + dateNow.getMonth() : dateNow.getMonth()
	}-${dateNow.getDate()}`;

	dateOneYearsAgo = new Date();
	dateOneYearsAgo.setDate(dateNow.getDate() - 365);
	additionalDateInput.value = `${dateOneYearsAgo.getFullYear()}-${
		dateOneYearsAgo.getMonth() < 10 ? '0' + dateOneYearsAgo.getMonth() : dateOneYearsAgo.getMonth()
	}-${dateOneYearsAgo.getDate()}`;

	if (localStorage.getItem('additionalDate') == 'true' && localStorage.getItem('additionalDateRange') != null) {
		additionalDate.checked = true;
		additionalDateInput.value = localStorage.getItem('additionalDateRange');
	}

	additionalDate.addEventListener('change', function () {
		if (this.checked) {
			localStorage.setItem('additionalDate', true);
			localStorage.setItem('additionalDateRange', additionalDateInput.value);
			geojsonAllDataEvents.features = [];
			getEventsFromIndmAPI();
		} else {
			if (localStorage.getItem('additionalDate') != null) localStorage.removeItem('additionalDate');
			if (localStorage.getItem('additionalDateRange') != null) localStorage.removeItem('additionalDateRange');

			geojsonAllDataEvents.features = [];
			getEventsFromIndmAPI();
		}
	});

	additionalDateInput.addEventListener('change', function () {
		localStorage.setItem('additionalDateRange', additionalDateInput.value);
		if (localStorage.getItem('additionalDate') == 'true') {
			geojsonAllDataEvents.features = [];
			getEventsFromIndmAPI();
		}
	});
}
