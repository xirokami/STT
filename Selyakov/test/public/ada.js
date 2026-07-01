let requests = [
  {
    id: 1,
    firstName: "Иван",
    lastName: "Петров",
    email: "ivan@example.com",
    date: "22.06.2026",
    status: "new"
  },
  {
    id: 2,
    firstName: "Мария",
    lastName: "Сидорова",
    email: "maria@example.com",
    date: "22.06.2026",
    status: "new"
  },
  {
    id: 3,
    firstName: "Алексей",
    lastName: "Козлов",
    email: "alex@example.com",
    date: "21.06.2026",
    status: "learning"
  }
];

const statusLabels = {
  new: "Новая",
  learning: "Идёт обучение",
  done: "Обучение завершено"
};

const statusClasses = {
  new: "status-new",
  learning: "status-learning",
  done: "status-done"
};

function renderTable() {
  const tbody = document.getElementById("requestsTable");
  const empty = document.getElementById("emptyState");
  const badge = document.getElementById("countBadge");

  badge.textContent = `${requests.length} ${decline(requests.length, "заявка", "заявки", "заявок")}`;

  if (requests.length === 0) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  tbody.innerHTML = requests.map(req => `
    <tr>
      <td data-label="ID">#${req.id}</td>
      <td data-label="Имя">${req.firstName}</td>
      <td data-label="Фамилия">${req.lastName}</td>
      <td data-label="Email">${req.email}</td>
      <td data-label="Дата">${req.date}</td>
      <td data-label="Статус">
        <span class="status ${statusClasses[req.status]}">${statusLabels[req.status]}</span>
      </td>
      <td data-label="Действие">
        <select onchange="changeStatus(${req.id}, this.value)">
          <option value="new" ${req.status === "new" ? "selected" : ""}>Новая</option>
          <option value="learning" ${req.status === "learning" ? "selected" : ""}>Идёт обучение</option>
          <option value="done" ${req.status === "done" ? "selected" : ""}>Обучение завершено</option>
        </select>
      </td>
    </tr>
  `).join("");
}

function changeStatus(id, newStatus) {
  const req = requests.find(r => r.id === id);
  if (req) {
    req.status = newStatus;
    renderTable();

    // === ЗДЕСЬ ДОБАВЬ fetch на бэкенд ===
    // fetch(`/api/requests/${id}/status`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ status: newStatus })
    // });
  }
}

function decline(n, one, two, five) {
  n = Math.abs(n) % 100;
  if (n > 10 && n < 20) return five;
  n = n % 10;
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return two;
  return five;
}

// Инициализация
renderTable();