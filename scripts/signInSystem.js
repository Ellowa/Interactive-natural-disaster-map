//временный аккаунт пользователя (ЗАГЛУШКА)
var account = new Map([
    ['login', ''],
    ['password', '']
]);

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
            account.set('login', loginRegInput.value);
            account.set('password', passworRegInput.value);

            for (var inputElement of allFields)
            {
                inputElement.value = null;
            }
            registerZone.style = 'display: none';
            logInSuccess();
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
            if(loginInput.value == account.get('login') && passwordInput.value == account.get('password'))
            {//Успешный логин

                for (var inputElement of allFields)
                {
                    inputElement.value = null;
                }
                LogInZone.style = 'display: none';
                logInSuccess();
            }
            else
            {// неуспешный логин
                requiredTextLogin.textContent = 'Wrong login \n or password';
            }
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
    userAccountButton.value = account.get('login');
    userAccountButton.style = null;
    logOutButton.style = null;
    
}
