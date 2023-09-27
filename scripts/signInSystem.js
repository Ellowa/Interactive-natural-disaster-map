//Обработчик событий для кнопки выхода
function logOutBtnClk(){
    const logOutButton = document.getElementById('logOutButton');

    logOutButton.addEventListener('click', (e) => {
        const userAccountButton = document.getElementById('userAccountButton');
        const registerButton = document.getElementById('registerButton');
        const logInButton = document.getElementById('logInButton');

        userAccountButton.style = 'display: none';
        logOutButton.style = 'display: none';

        registerButton.style = null;
        logInButton.style = null;

        localStorage.removeItem('login');
        localStorage.removeItem('jwt');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('jwtExpire');

        location.reload();//Todo временный костыль чтобы очистить события прошлого пользователя
    });
}

// Обработчик событий для кнопки регистрации
function registerBtnClick(){
    const registerZone = document.getElementById('registerZone');
    const registerButton = document.getElementById('registerButton');
    const closeBtnRegZone = document.getElementById('closeBtnRegZone');
    const acceptRegButton = document.getElementById('acceptRegButton');

    registerButton.addEventListener('click', (e) => {
        registerZone.style = 'display: flex';
    });

    closeBtnRegZone.addEventListener('click', (e) => {
        registerZone.style = 'display: none';
    });

    acceptRegButton.addEventListener('click', (e) => {
        const loginRegInput = document.getElementById('loginRegInput');
        const passworRegInput = document.getElementById('passworRegInput');
        

        var allFields = [loginRegInput, passworRegInput];
        var requiredFieldsIsEmpty = false;
        for (var inputElement of allFields)
        {
            if(inputElement.value == "")
            {
                inputElement.style = 'border-color: #F44336;';
                requiredFieldsIsEmpty = true;
            }
            else
            {
                inputElement.style = null;
            }
        }

        if(requiredFieldsIsEmpty)
        {
            document.getElementById('requiredTextRegister').style = 'color: #F44336;';
        }
        else
        {
            document.getElementById('requiredTextRegister').style = null;

            //ПРОЦЕДУРА РЕГИСТРАЦИИ 
            var user = 
            {
                "login": loginRegInput.value,
                "password": passworRegInput.value,
                "refreshToken": ""
            };
            user = JSON.stringify(user);
            $.ajax({
                url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/User',
                method: 'POST',
                dataType: 'text',
                contentType: "application/json; charset=utf-8",
                data: user,
                success: function(data){
                    for (var inputElement of allFields)
                    {
                        inputElement.value = null;
                    }
                    registerZone.style = 'display: none';

                    
                    localStorage.setItem('jwt', data);

                    var jwtPayload = decodeJwt(data);
                    localStorage.setItem('login', jwtPayload.name);
                    localStorage.setItem('userRole', jwtPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
                    localStorage.setItem('userId', jwtPayload.sub);
                    localStorage.setItem('jwtExpire', jwtPayload.exp*1000);
                    logInSuccess();
                },
                error: function(jqXHR, textStatus, error) {
                    var err = textStatus + " " + jqXHR.status + ", " + error + "\n"
                            + jqXHR.responseText.toString();
                    exceptionHandler(err);
                }
            });
        }
    });

}

// Обработчик событий для кнопки логина
function logInBtnClick(){
    const LogInZone = document.getElementById('LogInZone');
    const logInButton = document.getElementById('logInButton');
    const closeBtnLoginZone = document.getElementById('closeBtnLoginZone');
    const acceptLogInButton = document.getElementById('acceptLogInButton');
    

    logInButton.addEventListener('click', (e) => {
        LogInZone.style = 'display: flex';
    });

    closeBtnLoginZone.addEventListener('click', (e) => {
        LogInZone.style = 'display: none';
    });

    acceptLogInButton.addEventListener('click', (e) => {
        const loginInput = document.getElementById('loginInput');
        const passwordInput = document.getElementById('passwordInput');
        
        const requiredTextLogin = document.getElementById('requiredTextLogin');

        var allFields = [loginInput, passwordInput];
        var requiredFieldsIsEmpty = false;
        for (var inputElement of allFields)
        {
            if(inputElement.value == "")
            {
                inputElement.style = 'border-color: #F44336;';
                requiredFieldsIsEmpty = true;
            }
            else
            {
                inputElement.style = null;
            }
        }

        if(requiredFieldsIsEmpty)
        {
            requiredTextLogin.textContent = '* required fields';
            requiredTextLogin.style = 'color: #F44336;';
        }
        else
        {
            requiredTextLogin.style = null;

            //ПРОЦЕДУРА ЛОГИНА
            var loginData = 
            {
                "login": loginInput.value,
                "password": passwordInput.value
            };
            loginData = JSON.stringify(loginData);
            $.ajax({
                url: 'https://interactivenaturaldisastermapapi.azurewebsites.net/api/Authentication/login',
                method: 'POST',
                dataType: 'text',
                contentType: "application/json; charset=utf-8",
                data: loginData,
                success: function(data){
                    localStorage.setItem('jwt', data);

                    var jwtPayload = decodeJwt(data);
                    localStorage.setItem('login', jwtPayload.name);
                    localStorage.setItem('userRole', jwtPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
                    localStorage.setItem('userId', jwtPayload.sub);
                    localStorage.setItem('jwtExpire', jwtPayload.exp*1000);

                    for (var inputElement of allFields)
                    {
                        inputElement.value = null;
                    }
                    LogInZone.style = 'display: none';
                    logInSuccess();
                },
                error: function(jqXHR, textStatus, error) {
                    var err = textStatus + " " + jqXHR.status + ", " + error + "\n"
                            + jqXHR.responseText.toString();
                    exceptionHandler(err);
                    requiredTextLogin.textContent = 'Wrong login \n or password';
                }
            });
        }
    });
}

//Функция смены стиля зоны логина при успешном входе/регистрации
function logInSuccess(){
    const registerButton = document.getElementById('registerButton');
    const logInButton = document.getElementById('logInButton');

    registerButton.style = 'display: none';
    logInButton.style = 'display: none';

    var userAccountButton = document.getElementById('userAccountButton');
    var logOutButton = document.getElementById('logOutButton');
    userAccountButton.value = localStorage.getItem('login');
    userAccountButton.style = null;
    logOutButton.style = null;

    const adminPanelOpenButton = document.getElementById('adminPanelOpenButton');
    const adminPanelZone = document.getElementById('adminPanelZone');
    if(localStorage.getItem('userRole') != null && localStorage.getItem('userRole') == "moderator"){
        adminPanelOpenButton.style = null;
        adminPanelZone.style = null;
    }
    else{
        adminPanelOpenButton.style = 'display: none';
        adminPanelZone.style = 'display: none';
    }

    getEventsFromIndmAPI();
}

function decodeJwt(token) {
    var base64Payload = token.split(".")[1];
    var payload = decodeURIComponent(
      atob(base64Payload)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(payload);
  }
