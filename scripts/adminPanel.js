// Обработчик событий для кнопки Admin Panel
function adminPanelBtnClick(){
    const adminPanelZone = document.getElementById('adminPanelZone');
    const adminPanelOpenButton = document.getElementById('adminPanelOpenButton');
    const closeBtnAdminPanelZone = document.getElementById('closeBtnAdminPanelZone');
    const closeBtnAdminPaneDetails = document.getElementById('closeBtnAdminPaneDetails');


    adminPanelOpenButton.addEventListener('click', (e) => {
        adminPanelZone.style = 'display: flex';
        addUnconfirmedEvents();
    });

    closeBtnAdminPanelZone.addEventListener('click', (e) => {
        adminPanelZone.style = 'display: none';
        location.reload();//Todo временный костыль чтобы добавить новые подтвержденные события на карту
    });

    closeBtnAdminPaneDetails.addEventListener('click', (e) => {
        const adminPaneDetails = document.getElementById('adminPaneDetails');
        adminPaneDetails.style = 'display: none';
    });
}

function addUnconfirmedEvents(){
    var rootElement = document.getElementById("confirmRejectEvents");
    clearAdminPanMainZone(rootElement);

    $.ajax({
        url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/UnconfirmedEvent',
        method: 'GET',
        contentType: "application/json; charset=utf-8",
        headers: {
            'Authorization':`bearer ${localStorage.getItem('jwt')}`
        },
        success: function(data){
            for (const unconfirmedEvent of data) {
                var newEventItemDiv = document.createElement("div");
                newEventItemDiv.className = "event-items";

                createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.eventDto.id);
                createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.eventDto.title);
                createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.eventDto.category);
                createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.userDto.login);
                createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.userDto.roleName);
                addConfirmRejectAndDetailsShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.eventDto.id, rootElement);

                rootElement.append(newEventItemDiv);
            }
        },
        error: function(jqXHR, textStatus, error) {
            var err = textStatus + " " + jqXHR.status + ", " + error + "\n"
                    + jqXHR.responseText.toString();
            exceptionHandler(err);
        }
    });
}

function clearAdminPanMainZone(adminPanMain){
    var EventItemHeader = ($(adminPanMain).find(".event-items"))[0];
    var header = ($(adminPanMain).find(".admin-panel-header"))[0];

    //deleted existing event-items
    if ($(adminPanMain).find(".event-items").length > 1){
        adminPanMain.replaceChildren();
        adminPanMain.append(header);
        adminPanMain.append(EventItemHeader);
    }
}

function createEventShortDescriptionDiv(root, divText){
    var shortDescriptionDiv = document.createElement("div");
    shortDescriptionDiv.className = "event-short-description";
    shortDescriptionDiv.innerHTML = divText;
    root.append(shortDescriptionDiv);
}

function addConfirmRejectAndDetailsShortDescriptionDiv(root, eventId, adminPanelMain){
    var confirmDiv = document.createElement("div");
    confirmDiv.className = "event-short-description event-confirm";
    confirmDiv.innerHTML = "Confirm";
    root.append(confirmDiv);

    var rejectDiv = document.createElement("div");
    rejectDiv.className = "event-short-description event-reject";
    rejectDiv.innerHTML = "Reject";
    root.append(rejectDiv);

    var detailsDiv = document.createElement("div");
    detailsDiv.className = "event-short-description event-details";
    detailsDiv.innerHTML = "Details";
    root.append(detailsDiv);

    var confirmOrRejectData = 
    {
        "eventId": eventId
    };
    confirmOrRejectData = JSON.stringify(confirmOrRejectData);

    confirmDiv.addEventListener('click', (e) => {
        $.ajax({
            url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/UnconfirmedEvent/confirm/${eventId}`,
            method: 'PATCH',
            contentType: "application/json; charset=utf-8",
            headers: {
                'Authorization':`bearer ${localStorage.getItem('jwt')}`
            },
            data: confirmOrRejectData,
            success: function(data){
                adminPanelMain.removeChild(root);
            },
            error: function(jqXHR, textStatus, error) {
                var err = textStatus + " " + jqXHR.status + ", " + error + "\n"
                        + jqXHR.responseText.toString();
                exceptionHandler(err);
            }
        });
    });

    rejectDiv.addEventListener('click', (e) => {
        $.ajax({
            url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/UnconfirmedEvent/reject/${eventId}`,
            method: 'PATCH',
            contentType: "application/json; charset=utf-8",
            headers: {
                'Authorization':`bearer ${localStorage.getItem('jwt')}`
            },
            data: confirmOrRejectData,
            success: function(data){
                adminPanelMain.removeChild(root);
            },
            error: function(jqXHR, textStatus, error) {
                var err = textStatus + " " + jqXHR.status + ", " + error + "\n"
                        + jqXHR.responseText.toString();
                exceptionHandler(err);
            }
        });
    });

    detailsDiv.addEventListener('click', (e) => {
        const adminPaneDetails = document.getElementById('adminPaneDetails');
        adminPaneDetails.style = '';

        const closeBtnAdminPaneDetails = document.getElementById('closeBtnAdminPaneDetails');
        adminPaneDetails.replaceChildren();
        adminPaneDetails.append(closeBtnAdminPaneDetails);

        var eventDetailsItem = document.createElement("div");
        eventDetailsItem.className = "details-item";
        var div = document.createElement("div");
        div.innerHTML = "Event Info";
        eventDetailsItem.append(div);

        var userDetailsItem = document.createElement("div");
        userDetailsItem.className = "details-item";
        var div = document.createElement("div");
        div.innerHTML = "User Info";
        userDetailsItem.append(div);

        $.ajax({
            url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/UnconfirmedEvent/${eventId}`,
            method: 'GET',
            contentType: "application/json; charset=utf-8",
            headers: {
                'Authorization':`bearer ${localStorage.getItem('jwt')}`
            },
            success: function(data){
                div = document.createElement("div");
                div.innerHTML = "Id: " + data.eventDto.id;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Title: " + data.eventDto.title;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Link: " + data.eventDto.link;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Start Date: " + data.eventDto.startDate;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "End Date: " + data.eventDto.endDate;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Closed: " + data.eventDto.closed;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Magnitude Value: " + data.eventDto.magnitudeValue;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Confirmed: " + data.eventDto.confirmed;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Category: " + data.eventDto.category;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Source: " + data.eventDto.source;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Magnitude Unit: " + data.eventDto.magnitudeUnit;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Latitude: " + data.eventDto.latitude;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Longitude: " + data.eventDto.longitude;
                eventDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Event Hazard Unit: " + data.eventDto.eventHazardUnit;
                eventDetailsItem.append(div);


                div = document.createElement("div");
                div.innerHTML = "Id: " + data.userDto.id;
                userDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "First Name: " + data.userDto.firstName;
                userDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Email: " + data.userDto.email;
                userDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Telegram: " + data.userDto.telegram;
                userDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Login: " + data.userDto.login;
                userDetailsItem.append(div);

                div = document.createElement("div");
                div.innerHTML = "Role: " + data.userDto.roleName;
                userDetailsItem.append(div);
            },
            error: function(jqXHR, textStatus, error) {
                var err = textStatus + " " + jqXHR.status + ", " + error + "\n"
                        + jqXHR.responseText.toString();
                exceptionHandler(err);
            }
        });

        adminPaneDetails.append(eventDetailsItem);
        adminPaneDetails.append(userDetailsItem);
    });
}

// Обработчик событий для кнопок навигации админ панели
function adminPanelNavClick(){
    //Подсветка выбранного элеиента навигации
    var adminPanelNavItems = ($(document.getElementById("adminPanelNav")).find(".nav-item"));
    for(var i = 0; i < adminPanelNavItems.length; i++){
        adminPanelNavItems[i].addEventListener('click', (e) =>{
            for(var j = 0; j < adminPanelNavItems.length; j++){
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
    var confirmRejectNavItem = document.getElementById("confirmRejectNavItem");
    confirmRejectNavItem.addEventListener('click', (e) =>{
        var currentAdminPage = document.getElementById("confirmRejectEvents");
        showAdminPanelPage(currentAdminPage);
        addUnconfirmedEvents();
    });

    var eventCategoryNavItem = document.getElementById("eventCategoryNavItem");
    eventCategoryNavItem.addEventListener('click', (e) =>{
        var currentAdminPage = document.getElementById("eventCategory");
        showAdminPanelPage(currentAdminPage);
        addEventCategories();
    });

    var eventHazardNavItem = document.getElementById("eventHazardNavItem");
    eventHazardNavItem.addEventListener('click', (e) =>{
        var currentAdminPage = document.getElementById("eventHazard");
        showAdminPanelPage(currentAdminPage);
    });

    var eventSourceNavItem = document.getElementById("eventSourceNavItem");
    eventSourceNavItem.addEventListener('click', (e) =>{
        var currentAdminPage = document.getElementById("eventSource");
        showAdminPanelPage(currentAdminPage);
    });

    var magnitudeUnitNavItem = document.getElementById("magnitudeUnitNavItem");
    magnitudeUnitNavItem.addEventListener('click', (e) =>{
        var currentAdminPage = document.getElementById("magnitudeUnit");
        showAdminPanelPage(currentAdminPage);
    });
}

function showAdminPanelPage(page){
    var adminPanelAllPages = ($(document.getElementById("adminPanelZone")).find(".admin-panel-main"));
    for(var i = 0; i < adminPanelAllPages.length; i++){
        adminPanelAllPages[i].style = 'display: none;';
    }
    page.style = '';
}

function addEventCategories(){
    var rootElement = document.getElementById("eventCategory");
    clearAdminPanMainZone(rootElement);

    $.ajax({
        url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/EventCategory',
        method: 'GET',
        contentType: "application/json; charset=utf-8",
        headers: {
            'Authorization':`bearer ${localStorage.getItem('jwt')}`
        },
        success: function(data){
            for (const eventCategory of data) {
                var newEventItemDiv = document.createElement("div");
                newEventItemDiv.className = "event-items";

                createEventShortDescriptionDiv(newEventItemDiv, eventCategory.id);
                createEventShortDescriptionDiv(newEventItemDiv, eventCategory.categoryName);
                var eventCategoryNavItem = document.getElementById('eventCategoryNavItem');
                createUpdateShortDescriptionDiv(newEventItemDiv, eventCategory.id, "EventCategory", eventCategoryNavItem, "categoryName");
                createDeleteShortDescriptionDiv(newEventItemDiv, eventCategory.id, "EventCategory", eventCategoryNavItem);

                rootElement.append(newEventItemDiv);
            }
            var categoryNameInput = createTextInputForAddNewEventItem("categoryName", "new category name");
            var eventCategoryNavItem = document.getElementById('eventCategoryNavItem');
            addNewEventItemForm(rootElement, "EventCategory", eventCategoryNavItem, categoryNameInput);
            
        },
        error: function(jqXHR, textStatus, error) {
            var err = textStatus + " " + jqXHR.status + ", " + error + "\n"
                    + jqXHR.responseText.toString();
            exceptionHandler(err);
        }
    });
}

function addNewEventItemForm(rootElement, additionRoute, navItem, ...textInputs){
    var addItemDiv = document.createElement("div");
    addItemDiv.className = "event-items";
    createEventShortDescriptionDiv(addItemDiv, "new");
    
    textInputs.forEach(textInput => {
        addItemDiv.append(textInput);
    });

    var addButtonDiv = document.createElement("div");
    addButtonDiv.className = "add-new-item-button"
    addButtonDiv.innerHTML = "Add New";
    addButtonDiv.addEventListener('click', (e) => {
        var additionRequest = {};
        textInputs.forEach(textInput => {
            additionRequest[textInput.id] = textInput.value;
        });
        additionRequest = JSON.stringify(additionRequest);

        $.ajax({
            url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/${additionRoute}`,
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            headers: {
                'Authorization':`bearer ${localStorage.getItem('jwt')}`
            },
            data: additionRequest,
            success: function(data){
                navItem.click();
            },
            error: function(jqXHR, textStatus, error) {
                var err = textStatus + " " + jqXHR.status + ", " + error + "\n"
                        + jqXHR.responseText.toString();
                exceptionHandler(err);
            }
        });
    });
    addItemDiv.append(addButtonDiv);
    rootElement.append(addItemDiv);
}

function createTextInputForAddNewEventItem(id, placeholder){
    var textInput = document.createElement("input");
    textInput.className = "event-items-additional-input event-short-description";
    textInput.type = "text";
    textInput.id = id;
    textInput.placeholder = placeholder;
    return textInput;
}

//Универсальная функция создания кнопки update item
function createUpdateShortDescriptionDiv(root, itemId, requestRoute, navItem, ...updateRequestParams){
    var updateDiv = document.createElement("div");
    updateDiv.className = "event-short-description item-update";
    updateDiv.innerHTML = "Update";
    root.append(updateDiv);

    updateDiv.addEventListener('click', (e) => {
        const adminPaneDetails = document.getElementById('adminPaneDetails');
        adminPaneDetails.style = '';

        const closeBtnAdminPaneDetails = document.getElementById('closeBtnAdminPaneDetails');
        adminPaneDetails.replaceChildren();
        adminPaneDetails.append(closeBtnAdminPaneDetails);

        var updateInfoItem = document.createElement("div");
        updateInfoItem.className = "details-item";
        var div = document.createElement("div");
        div.innerHTML = "Update Item info";
        updateInfoItem.append(div);

        updateRequestParams.forEach(updateRequestParam => {
            input = createTextInputForAddNewEventItem(updateRequestParam, updateRequestParam);
            updateInfoItem.append(input);
        });

        var cinfirmUpdatediv = document.createElement("div");
        cinfirmUpdatediv.innerHTML = "Confirm Update";
        cinfirmUpdatediv.className = "item-update";
        cinfirmUpdatediv.style = "margin-left: 10px;";
        updateInfoItem.append(cinfirmUpdatediv);

        adminPaneDetails.append(updateInfoItem);

        cinfirmUpdatediv.addEventListener('click', (e) => {
            var updateRequest = 
            {
                "id": itemId
            };
            updateRequestParams.forEach(updateRequestParam => {
                var textInput = document.getElementById(updateRequestParam);
                updateRequest[textInput.id] = textInput.value;
            });
            updateRequest = JSON.stringify(updateRequest);

            $.ajax({
                url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/${requestRoute}/${itemId}`,
                method: 'PUT',
                contentType: "application/json; charset=utf-8",
                headers: {
                    'Authorization':`bearer ${localStorage.getItem('jwt')}`
                },
                data: updateRequest,
                success: function(data){
                    navItem.click();
                    adminPaneDetails.style = 'display: none';
                },
                error: function(jqXHR, textStatus, error) {
                    var err = textStatus + " " + jqXHR.status + ", " + error + "\n"
                            + jqXHR.responseText.toString();
                    exceptionHandler(err);
                }
            });
        });
    });
}

//Универсальная функция создания кнопки delete item
function createDeleteShortDescriptionDiv(root, itemId, requestRoute, navItem){
    var deleteDiv = document.createElement("div");
    deleteDiv.className = "event-short-description event-reject";
    deleteDiv.innerHTML = "Delete";
    root.append(deleteDiv);

    deleteDiv.addEventListener('click', (e) => {
        $.ajax({
            url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/${requestRoute}/${itemId}`,
            method: 'DELETE',
            contentType: "application/json; charset=utf-8",
            headers: {
                'Authorization':`bearer ${localStorage.getItem('jwt')}`
            },
            success: function(data){
                navItem.click();
            },
            error: function(jqXHR, textStatus, error) {
                var err = textStatus + " " + jqXHR.status + ", " + error + "\n"
                        + jqXHR.responseText.toString();
                exceptionHandler(err);
            }
        });
    });
}