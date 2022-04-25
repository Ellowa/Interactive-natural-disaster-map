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

//Функция определения уровня опасности Severe Storms из kts(скорость в узлах)
function getSevereStormDangerLevelByKTS(kts){
    //Данные из системы GDACS
    if(kts < 64)
        return "Minor danger";
    if(kts < 83)
        return "Moderate danger";
    if(kts < 113)
        return "Considerable danger";
    if(kts < 137)
        return "High danger";
    if(kts > 137)
        return "Very high danger";
}

//Функция определения уровня опасности Earthquakes из magnitude
function getEarthquakesDangerLevelByMAG(mag){
    if(mag < 4.0)
        return "Minor danger";
    if(mag < 5.5)
        return "Moderate danger";
    if(mag < 6.1)
        return "Considerable danger";
    if(mag < 7.0)
        return "High danger";
    if(mag >= 7.0)
        return "Very high danger";
    return "No data";
}