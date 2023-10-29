// Обработчик событий для кнопки User Account
function userAccountBtnClick() {
	const userAccountDetails = document.getElementById('userAccountDetails');
	const userAccountOpenButton = document.getElementById('userAccountButton');
	const closeBtnUserAccountDetails = document.getElementById('closeBtnUserAccountDetails');
    
	userAccountOpenButton.addEventListener('click', e => {
		userAccountDetails.style = 'display: flex';
        showUserInfo();
	});

	closeBtnUserAccountDetails.addEventListener('click', e => {
		userAccountDetails.style = 'display: none';
	});
}

function showUserInfo(){
    const userInfoDiv = document.getElementById('userInfoDiv');

    var userInfoHeader = $(userInfoDiv).children()[0];
    userInfoDiv.replaceChildren();
    userInfoDiv.append(userInfoHeader);
    var userId = localStorage.getItem('userId');
    $.ajax({
        url: `https://interactivenaturaldisastermapapi.azurewebsites.net/api/User/${userId}`,
        method: 'GET',
        contentType: 'application/json; charset=utf-8',
        headers: {
            Authorization: `bearer ${localStorage.getItem('jwt')}`,
        },
        success: function (data) {
            div = document.createElement('div');
            div.innerHTML = 'Id: ' + data.id;
            userInfoDiv.append(div);

            div = document.createElement('div');
            div.innerHTML = 'Login: ' + data.login;
            userInfoDiv.append(div);

            div = document.createElement('div');
            div.innerHTML = 'First Name: ' + data.firstName;
            userInfoDiv.append(div);

            div = document.createElement('div');
            div.innerHTML = 'Second Name: ' + data.secondName;
            userInfoDiv.append(div);

            div = document.createElement('div');
            div.innerHTML = 'Last Name: ' + data.lastName;
            userInfoDiv.append(div);

            div = document.createElement('div');
            div.innerHTML = 'Email: ' + data.email;
            userInfoDiv.append(div);

            div = document.createElement('div');
            div.innerHTML = 'Telegram: ' + data.telegram;
            userInfoDiv.append(div);

            addUpdateUserButton(userId);
            addDeleteUserButton(userId);
        },
        error: function (jqXHR, textStatus, error) {
            exceptionHandler(jqXHR, textStatus, error);
        },
    });
}

function addUpdateUserButton(userId) {
	var userUpdateIsSuccess = function () {
        const userAccountButton = document.getElementById('userAccountButton');
        const newLogin = document.getElementById('login');
        userAccountButton.value = newLogin.value;
        localStorage.setItem('login', newLogin.value);
		showUserInfo();
	};

	createUpdateShortDescriptionDiv(
		$('#userInfoDiv'),
		userId,
		'User',
		userUpdateIsSuccess,
		'login',
		'firstName',
		'secondName',
		'lastName',
		'email',
		'telegram',
		'password'
	);
}

function addDeleteUserButton(userId) {
	var userDeleteIsSuccess = function () {
		const logOutButton = document.getElementById('logOutButton');
		logOutButton.click();
	};

	createDeleteShortDescriptionDiv($('#userInfoDiv'), userId, 'User', userDeleteIsSuccess);
}
