const container = document.querySelector('.content')
const but = document.querySelector('.check')
const but1 = document.querySelector('.delete')

but.addEventListener('click', function() {
  fetch('/get', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json())
  .then(data => {
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
})
but1.addEventListener('click', function() {
  container.innerHTML = '';
})
function editCard(id) {
  let data = {
    id: id,
    img:"i.webp",
    title:'solo',
    price:'152$',
  }
  fetch(`/edit/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}
