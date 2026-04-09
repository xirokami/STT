let body = document.body
let shar = '<div class="shar ent"></div>' 
const cont = document.getElementById('cont')
i = 1

body.addEventListener('click', function(){
  const ent = document.createElement('div')
  if (i < 10){
    ent.className = 'ent circle'
    i++
  }
  else{
    body.innerHTML = ''
    ent.className = 'ent square'
  }
  body.appendChild(ent)
})
