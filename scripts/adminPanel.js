// Обработчик событий для кнопки Admin Panel
function adminPanelBtnClick(){
    const adminPanelZone = document.getElementById('adminPanelZone');
    const adminPanelOpenButton = document.getElementById('adminPanelOpenButton');
    const closeBtnAdminPanelZone = document.getElementById('closeBtnAdminPanelZone');


    adminPanelOpenButton.addEventListener('click', (e) => {
        adminPanelZone.style = 'display: flex';
        addUnconfirmedEvents();
    });

    closeBtnAdminPanelZone.addEventListener('click', (e) => {
        adminPanelZone.style = 'display: none';
        location.reload();//Todo временный костыль чтобы добавить новые подтвержденные события на карту
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
                addConfirmAndRejectShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.eventDto.id, rootElement);

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

function addConfirmAndRejectShortDescriptionDiv(root, eventId, adminPanelMain){
    var confirmDiv = document.createElement("div");
    confirmDiv.className = "event-short-description event-confirm";
    confirmDiv.innerHTML = "Confirm";
    root.append(confirmDiv);

    var rejectDiv = document.createElement("div");
    rejectDiv.className = "event-short-description event-reject";
    rejectDiv.innerHTML = "Reject";
    root.append(rejectDiv);

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
            for (const unconfirmedEvent of data) {
                var newEventItemDiv = document.createElement("div");
                newEventItemDiv.className = "event-items";

                createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.id);
                createEventShortDescriptionDiv(newEventItemDiv, unconfirmedEvent.categoryName);;

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