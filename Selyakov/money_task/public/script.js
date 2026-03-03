document.getElementById("usd").addEventListener("click", function(event) {
    const inputValue = document.getElementById("inp").value
    fetch('http://localhost:3000/api/process-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: inputValue, valute: "usd" })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("money").textContent = data.result;
    });
});
document.getElementById("eur").addEventListener("click", function(event) {
    const inputValue = document.getElementById("inp").value
    fetch('http://localhost:3000/api/process-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: inputValue , valute: "eur"})
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("money").textContent = data.result;
    });
});
