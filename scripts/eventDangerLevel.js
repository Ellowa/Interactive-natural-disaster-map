//Функция получения цвета для маркера по уровню угрозы
function getEventIconColorByDangerLevel(dangerLevel){
    switch (dangerLevel) {
        case "Very high danger":
            return '#800000';
        case "High danger":
            return '#ff0000';
        case "Considerable danger":
            return '#ff9900';
        case "Moderate danger":
            return '#ffff00';
        case "Minor danger":
            return '#ccff66';
        default:
            return 'black';
    }
}