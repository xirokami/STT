const express = require('express')
let cors = require('cors')
const path = require('path')
const app = express()
const port = 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'money.html'));
});

app.post('/api/process-data', (req,res) => {
    console.log(req.body);
    const inputValue = req.body.data
    const valute = req.body.valute
    fetch('https://www.cbr-xml-daily.ru/daily_json.js')
                .then (response => response.json())
                .then(data => {
                    let Dollar = data.Valute.USD.Value; 
                    let Euro = data.Valute.EUR.Value;
                    switch (valute){
                        case "usd":
                            let retur = (Dollar*inputValue).toFixed(2)
                            res.send({result: retur})
                            break;
                
                        case "eur":
                            let retura = (Euro*inputValue).toFixed(2)
                            res.send({result: retura})
                            break;
                    }
                })
            })
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});