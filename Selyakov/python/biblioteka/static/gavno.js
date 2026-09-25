const container = document.querySelector('.content')
const but = document.querySelector('.roblox')
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
      container.innerHTML = '';
    } else {
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
              <button type=""><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><path d="m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18"/><path d="M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25"/><circle cx="18" cy="20" r="2"/><circle cx="8" cy="20" r="2"/></svg></button>
            </div>
          </div>
        `)
      }
    }
  })
})
