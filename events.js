let allEvents = JSON.parse(localStorage.getItem("events")) || [];

function renderEvents(events, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (events.length === 0) {
    container.innerHTML = "<p class='text-center'>No events found.</p>";
    return;
  }

  events.forEach(event => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${event.imageUrl || 'https://via.placeholder.com/250x150'}" class="card-img-top">
        <div class="card-body">
          <h5 class="card-title">${event.title}</h5>
          <p class="card-text">${event.description}</p>
          <p><small class="text-muted">📅 ${event.date}</small></p>
          <button class="btn btn-primary w-100" onclick="registerEvent('${event.title}')">Register</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}
