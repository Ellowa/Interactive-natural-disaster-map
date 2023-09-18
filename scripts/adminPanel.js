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
    });
}

function addUnconfirmedEvents(){
    var rootElement = document.getElementById("adminPanelMain");
    var firstEventItems = ($(rootElement).find(".event-items"))[0];

    //deleted existing event-items
    if ($(rootElement).find(".event-items").length > 1){
        rootElement.replaceChildren();
        rootElement.append(firstEventItems);
    }

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
                addConfirmAndRejectShortDescriptionDiv(newEventItemDiv);

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

function createEventShortDescriptionDiv(root, divText){
    var shortDescriptionDiv = document.createElement("div");
    shortDescriptionDiv.className = "event-short-description";
    shortDescriptionDiv.innerHTML = divText;
    root.append(shortDescriptionDiv);
}

function addConfirmAndRejectShortDescriptionDiv(root){
    var confirmDiv = document.createElement("div");
    confirmDiv.className = "event-short-description event-confirm";
    confirmDiv.innerHTML = "Confirm";
    root.append(confirmDiv);

    var rejectDiv = document.createElement("div");
    rejectDiv.className = "event-short-description event-reject";
    rejectDiv.innerHTML = "Reject";
    root.append(rejectDiv);
}