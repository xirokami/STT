const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path')
const app = express()
const port = 3000

function tokenInit(user, pswd) {
    return jwt.sign({
        user: user,
        pswd: pswd
    },
    'secret'
    )
}


app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/process-data', (req,res) => {
    let user = req.body.user
    let pswd = req.body.pswd
    bcrypt.hash(pswd, 10)
        .then(hash =>{
            token = tokenInit(user,hash)
            res.send({result:"1",token})
            console.log("\nТокен пользователя:\n" + token)
        })
        .catch(error =>{
            console.error(error)
            res.send({result:"2"})
        })
})



app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});