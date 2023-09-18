// Обработчик событий для кнопки Admin Panel
function adminPanelBtnClick(){
    const adminPanelZone = document.getElementById('adminPanelZone');
    const adminPanelOpenButton = document.getElementById('adminPanelOpenButton');
    const closeBtnAdminPanelZone = document.getElementById('closeBtnAdminPanelZone');


    adminPanelOpenButton.addEventListener('click', (e) => {
        adminPanelZone.style = 'display: flex';
    });

    closeBtnAdminPanelZone.addEventListener('click', (e) => {
        adminPanelZone.style = 'display: none';
    });
}