const container = document.querySelector('.content')


function get_cards() {
  fetch('/get', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json())
  .then(data => {
    container.innerHTML = '';
    if (container.innerHTML.trim() !== '') {
    } else {
      container.innerHTML = '';
      for (const [id, info] of Object.entries(data)) {
        container.insertAdjacentHTML('beforeend', `
          <div class="card">
            <img src="/static/${info.img}" alt="">
            <div class="main-content">
              <div class="description-container">
                <div class="description">
                  ${info.title}
                </div>
                <div class="price">
                  ${info.price}
                </div>
              </div>
              <button onclick="editCard(${id})" type=""><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen preview-icon"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg></button>
            </div>
          </div>
        `)
      }
    }
  })
}
function clear_cards() {
  container.innerHTML = '';
}

function editCard(id) {
  let img = document.getElementById('img').value
  let title = document.getElementById('title').value
  let price = document.getElementById('price').value
  if (!img || !title || !price){
    console.log("empty")
  } else {
    let data = {
      id: id,
      img: img,
      title: title,
      price: price,
    }
    fetch(`/edit/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    get_cards()
  }
}
get_cards()
