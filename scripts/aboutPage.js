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