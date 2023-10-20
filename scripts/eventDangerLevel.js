//Функция получения цвета для маркера по уровню угрозы
function getEventIconColorByDangerLevel(dangerLevel){
    switch (dangerLevel) {
        case "Very High Danger":
            return '#800000';
        case "High Danger":
            return '#ff0000';
        case "Considerable Danger":
            return '#ff9900';
        case "Moderate Danger":
            return '#ffff00';
        case "Minor Danger":
            return '#ccff66';
        default:
            return 'black';
    }
}