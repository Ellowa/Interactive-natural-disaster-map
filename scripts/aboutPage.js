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

// Обработчик событий для кнопок навигации about панели
function aboutPanelNavClick() {
	//Подсветка выбранного элемента навигации
	var aboutPanelNavItems = $(document.getElementById('aboutPanelNav')).find('.nav-about');
	for (var i = 0; i < aboutPanelNavItems.length; i++) {
		aboutPanelNavItems[i].addEventListener('click', e => {
			for (var j = 0; j < aboutPanelNavItems.length; j++) {
				aboutPanelNavItems[j].style = '';
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
	aboutPanelNavItems[0].click();

	//клик конкретного навигационного элемента
	var aboutInfoNavItem = document.getElementById('aboutInfoNavItem');
	aboutInfoNavItem.addEventListener('click', e => {
		var currentAboutPage = document.getElementById('aboutInfoPage');
		showAboutPanelPage(currentAboutPage);
	});

	var aboutDangerGradationNavItem = document.getElementById('aboutDangerGradationNavItem');
	aboutDangerGradationNavItem.addEventListener('click', e => {
		var currentAboutPage = document.getElementById('dangerGradationPage');
		showAboutPanelPage(currentAboutPage);
	});

	var aboutLinksNavItem = document.getElementById('aboutLinksNavItem');
	aboutLinksNavItem.addEventListener('click', e => {
		var currentAboutPage = document.getElementById('eventSource');
		showAboutPanelPage(currentAboutPage);
	});
}

function showAboutPanelPage(page) {
	var aboutPanelAllPages = $(document.getElementById('aboutZone')).find('.about-main');
	for (var i = 0; i < aboutPanelAllPages.length; i++) {
		aboutPanelAllPages[i].style = 'display: none;';
	}
	page.style = '';
}