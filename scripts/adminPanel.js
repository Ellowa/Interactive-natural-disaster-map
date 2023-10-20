// Обработчик событий для кнопки Admin Panel
function adminPanelBtnClick() {
	const adminPanelZone = document.getElementById('adminPanelZone');
	const adminPanelOpenButton = document.getElementById('adminPanelOpenButton');
	const closeBtnAdminPanelZone = document.getElementById('closeBtnAdminPanelZone');
	const closeBtnAdminPaneDetails = document.getElementById('closeBtnAdminPaneDetails');

	adminPanelOpenButton.addEventListener('click', e => {
		adminPanelZone.style = 'display: flex';
		addUnconfirmedEvents();
	});

	closeBtnAdminPanelZone.addEventListener('click', e => {
		adminPanelZone.style = 'display: none';
		location.reload(); //Todo временный костыль чтобы добавить новые подтвержденные события на карту
	});

	closeBtnAdminPaneDetails.addEventListener('click', e => {
		const adminPaneDetails = document.getElementById('adminPaneDetails');
		adminPaneDetails.style = 'display: none';
	});

	var addRejectedCheckBox = document.getElementById('addRejected');
	addRejectedCheckBox.addEventListener('change', function () {
		addUnconfirmedEvents();
	});
}

function addUnconfirmedEvents() {
	var rootElement = document.getElementById('confirmRejectEvents');
	clearAdminPanMainZone(rootElement);

	var addRejectedCheckBox = document.getElementById('addRejected');
	var url = 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/UnconfirmedEvent';
	if(addRejectedCheckBox.checked == true)
		url = 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/UnconfirmedEvent?AddIsChecked=true';
	$.ajax({
		url: url,
		method: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			Authorization: `bearer ${localStorage.getItem('jwt')}`,
		},
		success: function (data) {
			for (const unconfirmedEvent of data) {
				var newEventItemDiv = document.createElement('div');
				newEventItemDiv.className = 'event-items';

				if (unconfirmedEvent.isChecked) createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.eventDto.id + ' rej');
				else createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.eventDto.id);

				createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.eventDto.title);
				createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.eventDto.category);
				createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.userDto.login);
				createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.userDto.roleName);
				addConfirmRejectAndDetailsShortDescriptionDiv(
					newEventItemDiv,
					unconfirmedEvent.eventDto.id,
					unconfirmedEvent.eventDto.title,
					rootElement
				);

				rootElement.append(newEventItemDiv);
			}
		},
		error: function (jqXHR, textStatus, error) {
			exceptionHandler(jqXHR, textStatus, error);
		},
	});
}

function clearAdminPanMainZone(adminPanMain) {
	var EventItemHeader = $(adminPanMain).find('.event-items')[0];
	var header = $(adminPanMain).find('.admin-panel-header')[0];

	//deleted existing event-items
	if ($(adminPanMain).find('.event-items').length > 1) {
		adminPanMain.replaceChildren();
		adminPanMain.append(header);
		adminPanMain.append(EventItemHeader);
	}
}

function createEventShortDescriptionDiv(root, divText) {
	var shortDescriptionDiv = document.createElement('div');
	shortDescriptionDiv.className = 'event-short-description';
	shortDescriptionDiv.innerHTML = divText;
	root.append(shortDescriptionDiv);
	return shortDescriptionDiv;
}

function addConfirmRejectAndDetailsShortDescriptionDiv(root, eventId, eventName, adminPanelMain) {
	var detailsDiv = document.createElement('div');
	detailsDiv.className = 'event-short-description event-details';
	detailsDiv.innerHTML = 'Details';
	root.append(detailsDiv);

	var confirmDiv = document.createElement('div');
	confirmDiv.className = 'event-short-description event-confirm';
	confirmDiv.innerHTML = 'Confirm';
	root.append(confirmDiv);

	var rejectDiv = document.createElement('div');
	rejectDiv.className = 'event-short-description event-reject';
	rejectDiv.innerHTML = 'Reject';
	root.append(rejectDiv);

	var confirmOrRejectData = {
		eventId: eventId,
	};
	confirmOrRejectData = JSON.stringify(confirmOrRejectData);

	confirmDiv.addEventListener('click', e => {
		if(confirm('Are you sure you want to confirm ' + `Event ${eventName}(${eventId})`)) {
			$.ajax({
				url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/UnconfirmedEvent/confirm/${eventId}`,
				method: 'PATCH',
				contentType: 'application/json; charset=utf-8',
				headers: {
					Authorization: `bearer ${localStorage.getItem('jwt')}`,
				},
				data: confirmOrRejectData,
				success: function (data) {
					adminPanelMain.removeChild(root);
				},
				error: function (jqXHR, textStatus, error) {
					exceptionHandler(jqXHR, textStatus, error);
				},
			});
		}
	});

	rejectDiv.addEventListener('click', e => {
		if(confirm('Are you sure you want to reject ' + `Event ${eventName}(${eventId})`)) {
			$.ajax({
				url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/UnconfirmedEvent/reject/${eventId}`,
				method: 'PATCH',
				contentType: 'application/json; charset=utf-8',
				headers: {
					Authorization: `bearer ${localStorage.getItem('jwt')}`,
				},
				data: confirmOrRejectData,
				success: function (data) {
					adminPanelMain.removeChild(root);
				},
				error: function (jqXHR, textStatus, error) {
					exceptionHandler(jqXHR, textStatus, error);
				},
			});
		}
	});

	detailsDiv.addEventListener('click', e => {
		const adminPaneDetails = document.getElementById('adminPaneDetails');
		adminPaneDetails.style = '';

		const closeBtnAdminPaneDetails = document.getElementById('closeBtnAdminPaneDetails');
		adminPaneDetails.replaceChildren();
		adminPaneDetails.append(closeBtnAdminPaneDetails);

		var eventDetailsItem = document.createElement('div');
		eventDetailsItem.className = 'details-item';
		var div = document.createElement('div');
		div.innerHTML = 'Event Info';
		eventDetailsItem.append(div);

		var userDetailsItem = document.createElement('div');
		userDetailsItem.className = 'details-item';
		var div = document.createElement('div');
		div.innerHTML = 'User Info';
		userDetailsItem.append(div);

		$.ajax({
			url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/UnconfirmedEvent/${eventId}`,
			method: 'GET',
			contentType: 'application/json; charset=utf-8',
			headers: {
				Authorization: `bearer ${localStorage.getItem('jwt')}`,
			},
			success: function (data) {
				div = document.createElement('div');
				div.innerHTML = 'Id: ' + data.eventDto.id;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Title: ' + data.eventDto.title;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Link: ' + data.eventDto.link;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Start Date: ' + data.eventDto.startDate;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'End Date: ' + data.eventDto.endDate;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Closed: ' + data.eventDto.closed;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Magnitude Value: ' + data.eventDto.magnitudeValue;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Confirmed: ' + data.eventDto.confirmed;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Category: ' + data.eventDto.category;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Source: ' + data.eventDto.source;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Magnitude Unit: ' + data.eventDto.magnitudeUnit;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Latitude: ' + data.eventDto.latitude;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Longitude: ' + data.eventDto.longitude;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Event Hazard Unit: ' + data.eventDto.eventHazardUnit;
				eventDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Id: ' + data.userDto.id;
				userDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'First Name: ' + data.userDto.firstName;
				userDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Email: ' + data.userDto.email;
				userDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Telegram: ' + data.userDto.telegram;
				userDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Login: ' + data.userDto.login;
				userDetailsItem.append(div);

				div = document.createElement('div');
				div.innerHTML = 'Role: ' + data.userDto.roleName;
				userDetailsItem.append(div);
			},
			error: function (jqXHR, textStatus, error) {
				exceptionHandler(jqXHR, textStatus, error);
			},
		});

		adminPaneDetails.append(eventDetailsItem);
		adminPaneDetails.append(userDetailsItem);
	});
}

// Обработчик событий для кнопок навигации админ панели
function adminPanelNavClick() {
	//Подсветка выбранного элемента навигации
	var adminPanelNavItems = $(document.getElementById('adminPanelNav')).find('.nav-item');
	for (var i = 0; i < adminPanelNavItems.length; i++) {
		adminPanelNavItems[i].addEventListener('click', e => {
			for (var j = 0; j < adminPanelNavItems.length; j++) {
				adminPanelNavItems[j].style = '';
			}
			e.target.style =
				'background-color: #1f776e;' +
				'margin-top: 0;' +
				'padding-bottom: 2px;' +
				'border-top-right-radius: 8px;' +
				'border-top-left-radius: 8px;' +
				'border-right: 0 solid #00695C;' +
				'padding-top: 3px;';
		});
	}
	adminPanelNavItems[0].click();

	//клик конкретного навигационного элемента
	var confirmRejectNavItem = document.getElementById('confirmRejectNavItem');
	confirmRejectNavItem.addEventListener('click', e => {
		var currentAdminPage = document.getElementById('confirmRejectEvents');
		showAdminPanelPage(currentAdminPage);
		addUnconfirmedEvents();
	});

	var eventCategoryNavItem = document.getElementById('eventCategoryNavItem');
	eventCategoryNavItem.addEventListener('click', e => {
		var currentAdminPage = document.getElementById('eventCategory');
		showAdminPanelPage(currentAdminPage);
		addEventCategories();
	});

	var eventHazardNavItem = document.getElementById('eventHazardNavItem');
	eventHazardNavItem.addEventListener('click', e => {
		var currentAdminPage = document.getElementById('eventHazard');
		showAdminPanelPage(currentAdminPage);
		addEventHazardUnits();
	});

	var eventSourceNavItem = document.getElementById('eventSourceNavItem');
	eventSourceNavItem.addEventListener('click', e => {
		var currentAdminPage = document.getElementById('eventSource');
		showAdminPanelPage(currentAdminPage);
		addEventSources();
	});

	var magnitudeUnitNavItem = document.getElementById('magnitudeUnitNavItem');
	magnitudeUnitNavItem.addEventListener('click', e => {
		var currentAdminPage = document.getElementById('magnitudeUnit');
		showAdminPanelPage(currentAdminPage);
		addMagnitudeUnits();
	});
}

function showAdminPanelPage(page) {
	var adminPanelAllPages = $(document.getElementById('adminPanelZone')).find('.admin-panel-main');
	for (var i = 0; i < adminPanelAllPages.length; i++) {
		adminPanelAllPages[i].style = 'display: none;';
	}
	page.style = '';
}

function addEventCategories() {
	var rootElement = document.getElementById('eventCategory');
	clearAdminPanMainZone(rootElement);

	$.ajax({
		url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/EventCategory',
		method: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			Authorization: `bearer ${localStorage.getItem('jwt')}`,
		},
		success: function (data) {
			var eventCategoryNavItem = document.getElementById('eventCategoryNavItem');
			for (const eventCategory of data) {
				var newEventItemDiv = document.createElement('div');
				newEventItemDiv.className = 'event-items';

				createEventShortDescriptionDiv(newEventItemDiv, eventCategory.id);
				createEventShortDescriptionDiv(newEventItemDiv, eventCategory.categoryName);

				createUpdateShortDescriptionDiv(
					newEventItemDiv,
					eventCategory.id,
					'EventCategory',
					eventCategoryNavItem,
					'categoryName'
				);
				createDeleteShortDescriptionDiv(newEventItemDiv, eventCategory.id, 'EventCategory',  function() {eventCategoryNavItem.click();});

				rootElement.append(newEventItemDiv);
			}
			var categoryNameInput = createTextInputForAddNewEventItem('categoryName', 'new category name');
			addNewEventItemForm(rootElement, 'EventCategory', eventCategoryNavItem, categoryNameInput);
		},
		error: function (jqXHR, textStatus, error) {
			exceptionHandler(jqXHR, textStatus, error);
		},
	});
}

function addNewEventItemForm(rootElement, additionRoute, navItem, ...textInputs) {
	var addItemDiv = document.createElement('div');
	addItemDiv.className = 'event-items';
	createEventShortDescriptionDiv(addItemDiv, 'new');

	textInputs.forEach(textInput => {
		addItemDiv.append(textInput);
	});

	var addButtonDiv = document.createElement('div');
	addButtonDiv.className = 'add-new-item-button';
	addButtonDiv.innerHTML = 'Add New';
	addButtonDiv.addEventListener('click', e => {
		var additionRequest = {};
		textInputs.forEach(textInput => {
			additionRequest[textInput.id] = textInput.value;
		});
		additionRequest = JSON.stringify(additionRequest);

		$.ajax({
			url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/${additionRoute}`,
			method: 'POST',
			contentType: 'application/json; charset=utf-8',
			headers: {
				Authorization: `bearer ${localStorage.getItem('jwt')}`,
			},
			data: additionRequest,
			success: function (data) {
				navItem.click();
			},
			error: function (jqXHR, textStatus, error) {
				exceptionHandler(jqXHR, textStatus, error);
			},
		});
	});
	addItemDiv.append(addButtonDiv);
	rootElement.append(addItemDiv);
}

function createTextInputForAddNewEventItem(id, placeholder) {
	var textInput = document.createElement('input');
	textInput.className = 'event-items-additional-input event-short-description';
	textInput.type = 'text';
	textInput.id = id;
	textInput.placeholder = placeholder;
	return textInput;
}

//Универсальная функция создания кнопки update item
function createUpdateShortDescriptionDiv(root, itemId, requestRoute, navItem, ...updateRequestParams) {
	var updateDiv = document.createElement('div');
	updateDiv.className = 'event-short-description item-update';
	updateDiv.innerHTML = 'Update';
	root.append(updateDiv);

	updateDiv.addEventListener('click', e => {
		const adminPaneDetails = document.getElementById('adminPaneDetails');
		adminPaneDetails.style = '';

		const closeBtnAdminPaneDetails = document.getElementById('closeBtnAdminPaneDetails');
		adminPaneDetails.replaceChildren();
		adminPaneDetails.append(closeBtnAdminPaneDetails);

		var updateInfoItem = document.createElement('div');
		updateInfoItem.className = 'details-item';
		var div = document.createElement('div');
		div.innerHTML = 'Update Item info';
		updateInfoItem.append(div);

		updateRequestParams.forEach(updateRequestParam => {
			input = createTextInputForAddNewEventItem(updateRequestParam, updateRequestParam);
			updateInfoItem.append(input);
		});

		var confirmUpdateDiv = document.createElement('div');
		confirmUpdateDiv.innerHTML = 'Confirm Update';
		confirmUpdateDiv.className = 'item-update';
		confirmUpdateDiv.style = 'margin-left: 10px;';
		updateInfoItem.append(confirmUpdateDiv);

		adminPaneDetails.append(updateInfoItem);

		confirmUpdateDiv.addEventListener('click', e => {
			if (confirm('Are you sure you want to update this ' + `${requestRoute} with Id(${itemId})`)) {
				var updateRequest = {
					id: itemId,
				};
				updateRequestParams.forEach(updateRequestParam => {
					var textInput = document.getElementById(updateRequestParam);
					updateRequest[textInput.id] = textInput.value;
				});
				updateRequest = JSON.stringify(updateRequest);

				$.ajax({
					url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/${requestRoute}/${itemId}`,
					method: 'PUT',
					contentType: 'application/json; charset=utf-8',
					headers: {
						Authorization: `bearer ${localStorage.getItem('jwt')}`,
					},
					data: updateRequest,
					success: function (data) {
						navItem.click();
						adminPaneDetails.style = 'display: none';
					},
					error: function (jqXHR, textStatus, error) {
						exceptionHandler(jqXHR, textStatus, error);
					},
				});
			}
		});
	});
}

//Универсальная функция создания кнопки delete item
function createDeleteShortDescriptionDiv(root, itemId, requestRoute, actionIfSuccess) {
	var deleteDiv = document.createElement('div');
	deleteDiv.className = 'event-short-description event-reject';
	deleteDiv.innerHTML = 'Delete';
	root.append(deleteDiv);

	deleteDiv.addEventListener('click', e => {
		if (confirm('Are you sure you want to delete this ' + `${requestRoute} with Id(${itemId})`)) {
			$.ajax({
				url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/${requestRoute}/${itemId}`,
				method: 'DELETE',
				contentType: 'application/json; charset=utf-8',
				headers: {
					Authorization: `bearer ${localStorage.getItem('jwt')}`,
				},
				success: function (data) {
					actionIfSuccess();
				},
				error: function (jqXHR, textStatus, error) {
					exceptionHandler(jqXHR, textStatus, error);
				},
			});
		}
	});
}

//Функция странички Event Hazard Units, админ панели
function addEventHazardUnits() {
	var rootElement = document.getElementById('eventHazard');
	clearAdminPanMainZone(rootElement);

	$.ajax({
		url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/EventHazardUnit',
		method: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			Authorization: `bearer ${localStorage.getItem('jwt')}`,
		},
		success: function (data) {
			var eventHazardUnitNavItem = document.getElementById('eventHazardNavItem');
			for (const eventHazardUnit of data) {
				var newEventItemDiv = document.createElement('div');
				newEventItemDiv.className = 'event-items';

				createEventShortDescriptionDiv(newEventItemDiv, eventHazardUnit.id);
				createEventShortDescriptionDiv(newEventItemDiv, eventHazardUnit.hazardName);
				createEventShortDescriptionDiv(newEventItemDiv, eventHazardUnit.magnitudeUnitName);
				createEventShortDescriptionDiv(newEventItemDiv, eventHazardUnit.thresholdValue);

				createUpdateShortDescriptionDiv(
					newEventItemDiv,
					eventHazardUnit.id,
					'EventHazardUnit',
					eventHazardUnitNavItem,
					'hazardName',
					'magnitudeUnitName',
					'thresholdValue'
				);
				createDeleteShortDescriptionDiv(newEventItemDiv, eventHazardUnit.id, 'EventHazardUnit', function() {eventHazardUnitNavItem.click();});

				rootElement.append(newEventItemDiv);
			}
			var eventHazardUnitNameInput = createTextInputForAddNewEventItem('hazardName', 'new hazard name');
			var magnitudeUnitNameInput = createTextInputForAddNewEventItem('magnitudeUnitName', 'magnitude unit name');
			var thresholdValueInput = createTextInputForAddNewEventItem('thresholdValue', 'new threshold value');
			addNewEventItemForm(
				rootElement,
				'EventHazardUnit',
				eventHazardUnitNavItem,
				eventHazardUnitNameInput,
				magnitudeUnitNameInput,
				thresholdValueInput
			);
		},
		error: function (jqXHR, textStatus, error) {
			exceptionHandler(jqXHR, textStatus, error);
		},
	});
}

//Функция странички Event Sources, админ панели
function addEventSources() {
	var rootElement = document.getElementById('eventSource');
	clearAdminPanMainZone(rootElement);

	$.ajax({
		url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/EventSource',
		method: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			Authorization: `bearer ${localStorage.getItem('jwt')}`,
		},
		success: function (data) {
			var eventSourceNavItem = document.getElementById('eventSourceNavItem');
			for (const eventSource of data) {
				var newEventItemDiv = document.createElement('div');
				newEventItemDiv.className = 'event-items';

				createEventShortDescriptionDiv(newEventItemDiv, eventSource.id);
				createEventShortDescriptionDiv(newEventItemDiv, eventSource.sourceType);

				createUpdateShortDescriptionDiv(
					newEventItemDiv,
					eventSource.id,
					'EventSource',
					eventSourceNavItem,
					'sourceType'
				);
				createDeleteShortDescriptionDiv(newEventItemDiv, eventSource.id, 'EventSource', function() {eventSourceNavItem.click();});

				rootElement.append(newEventItemDiv);
			}
			var eventSourceNameInput = createTextInputForAddNewEventItem('sourceType', 'new source type');
			addNewEventItemForm(rootElement, 'EventSource', eventSourceNavItem, eventSourceNameInput);
		},
		error: function (jqXHR, textStatus, error) {
			exceptionHandler(jqXHR, textStatus, error);
		},
	});
}

//Функция странички Magnitude Units, админ панели
function addMagnitudeUnits() {
	var rootElement = document.getElementById('magnitudeUnit');
	clearAdminPanMainZone(rootElement);

	$.ajax({
		url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/MagnitudeUnit',
		method: 'GET',
		contentType: 'application/json; charset=utf-8',
		headers: {
			Authorization: `bearer ${localStorage.getItem('jwt')}`,
		},
		success: function (data) {
			var magnitudeUnitNavItem = document.getElementById('magnitudeUnitNavItem');
			for (const magnitudeUnit of data) {
				var newEventItemDiv = document.createElement('div');
				newEventItemDiv.className = 'event-items';

				createEventShortDescriptionDiv(newEventItemDiv, magnitudeUnit.id);
				var magnitudeNameDiv = createEventShortDescriptionDiv(newEventItemDiv, magnitudeUnit.magnitudeUnitName);
				magnitudeNameDiv.title = 'Description: ' + magnitudeUnit.magnitudeUnitDescription;
				createEventShortDescriptionDiv(newEventItemDiv, magnitudeUnit.hazardUnitDtos.length);

				addMagnitudeUnitDetailsDiv(newEventItemDiv, magnitudeUnit.id);
				createUpdateShortDescriptionDiv(
					newEventItemDiv,
					magnitudeUnit.id,
					'MagnitudeUnit',
					magnitudeUnitNavItem,
					'magnitudeUnitName',
					'magnitudeUnitDescription'
				);
				createDeleteShortDescriptionDiv(newEventItemDiv, magnitudeUnit.id, 'MagnitudeUnit', function() {magnitudeUnitNavItem.click();});

				rootElement.append(newEventItemDiv);
			}
			var magnitudeUnitNameInput = createTextInputForAddNewEventItem('magnitudeUnitName', 'new magnitude unit name');
			var magnitudeUnitDescriptionInput = createTextInputForAddNewEventItem('magnitudeUnitDescription', 'new magnitude unit description');
			addNewEventItemForm(
				rootElement,
				'MagnitudeUnit',
				magnitudeUnitNavItem,
				magnitudeUnitNameInput,
				magnitudeUnitDescriptionInput
			);
		},
		error: function (jqXHR, textStatus, error) {
			exceptionHandler(jqXHR, textStatus, error);
		},
	});
}

function addMagnitudeUnitDetailsDiv(root, magnitudeUnitId) {
	var detailsDiv = document.createElement('div');
	detailsDiv.className = 'event-short-description event-details';
	detailsDiv.innerHTML = 'Hazard Details';
	root.append(detailsDiv);

	detailsDiv.addEventListener('click', e => {
		const adminPaneDetails = document.getElementById('adminPaneDetails');
		adminPaneDetails.style =
			'display: flex;' +
			'flex-direction: column;' +
			'align-items: flex-start;' +
			'justify-content: flex-start;' +
			'padding-left: 15px;' +
			'padding-right: 15px;' +
			'overflow: auto;';

		const closeBtnAdminPaneDetails = document.getElementById('closeBtnAdminPaneDetails');
		adminPaneDetails.replaceChildren();
		adminPaneDetails.append(closeBtnAdminPaneDetails);

		var magnitudeUnitDetailsItem = document.createElement('div');
		magnitudeUnitDetailsItem.className = 'event-items';
		magnitudeUnitDetailsItem.style = 'width: 100%;';
		var div = document.createElement('div');
		div.className = 'event-short-description';
		div.innerHTML = 'mUnit';
		magnitudeUnitDetailsItem.append(div);

		div = document.createElement('div');
		div.className = 'event-short-description';
		div.innerHTML = 'Hazard Id';
		magnitudeUnitDetailsItem.append(div);

		div = document.createElement('div');
		div.className = 'event-short-description';
		div.innerHTML = 'Hazard Name';
		magnitudeUnitDetailsItem.append(div);

		div = document.createElement('div');
		div.className = 'event-short-description';
		div.innerHTML = 'Threshold Value';
		magnitudeUnitDetailsItem.append(div);

		adminPaneDetails.append(magnitudeUnitDetailsItem);

		$.ajax({
			url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/MagnitudeUnit/${magnitudeUnitId}`,
			method: 'GET',
			contentType: 'application/json; charset=utf-8',
			headers: {
				Authorization: `bearer ${localStorage.getItem('jwt')}`,
			},
			success: function (data) {
				for (const eventHazardUnit of data.hazardUnitDtos) {
					var newEventItemDiv = document.createElement('div');
					newEventItemDiv.className = 'event-items';
					newEventItemDiv.style = 'width: 100%;';

					createEventShortDescriptionDiv(newEventItemDiv, eventHazardUnit.magnitudeUnitName);
					createEventShortDescriptionDiv(newEventItemDiv, eventHazardUnit.id);
					createEventShortDescriptionDiv(newEventItemDiv, eventHazardUnit.hazardName);
					createEventShortDescriptionDiv(newEventItemDiv, eventHazardUnit.thresholdValue);

					adminPaneDetails.append(newEventItemDiv);
				}
			},
			error: function (jqXHR, textStatus, error) {
				exceptionHandler(jqXHR, textStatus, error);
			},
		});
	});
}
