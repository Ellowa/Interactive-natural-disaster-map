// Обработчик событий для кнопки about
function aboutBtnClick(){
    const aboutZone = document.getElementById('aboutZone');
    const aboutButton = document.getElementById('aboutButton');
    const closeBtnAboutZone = document.getElementById('closeBtnAboutZone');


    aboutButton.addEventListener('click', (e) => {
        aboutZone.style = 'display: flex';
    });

    closeBtnAboutZone.addEventListener('click', (e) => {
        aboutZone.style = 'display: none';
    });
}

// Обработчик событий для информационной зоны об опасности
function dangerValueInfoZoneBtnClick() {
	const dangerValueInfoZone = document.getElementById('dangerValueInfoZone');
    // Todo сделать кнопку открытия этой зоны из вкладки about 
    //      или сделать микро кнопку прямо рядом с местом для этой зоны
	//const dangerValueInfoZoneButton = document.getElementById('aboutButton');
	const closeBtnDangerValueInfoZone = document.getElementById('closeBtnDangerValueInfoZone');

	// dangerValueInfoZoneButton.addEventListener('click', e => {
	// 	dangerValueInfoZone.style = 'display: flex';
	// });

	closeBtnDangerValueInfoZone.addEventListener('click', e => {
		dangerValueInfoZone.style = 'display: none';
	});
}