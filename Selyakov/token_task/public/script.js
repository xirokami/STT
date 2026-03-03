function init(){
    tokenFirst = document.getElementById("tokenFirst")
    let token = localStorage.getItem("token")
    if (token !== null){
        tokenFirst.textContent = "Token: " + token
    } else {
        return
    }
}
init()
document.getElementById('enter-reg').addEventListener('click',function(event){
    user = document.getElementById('user-reg').value
    pswd = document.getElementById('pswd-reg').value
    console.log(user)
    if ( user && pswd !== ""){
        fetch('http://localhost:3000/api/process-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user: user, pswd: pswd })
        })
        .then(response => response.json())
        .then(data => {
            if (data.result == 1){
                console.log("Успех!")
                localStorage.setItem("token", data.token)
                init()
            } else {
                console.log("Ошибка")
            }
        })
    } else {
        tokenFirst = document.getElementById("tokenFirst")
        tokenFirst.textContent = "Поля должны быть заполнеными"
    }
});
