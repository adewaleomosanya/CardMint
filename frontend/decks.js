async function loadDecksPage() {
    const token = localStorage.getItem("access_token");
    const res = await fetch("http://127.0.0.1:8000/decks/my-decks", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const container = document.getElementById("deckContainer");
    if (!res.ok) {
        container.innerText = "No decks.";
        return;
    }
    const decks = await res.json();
    container.innerHTML = '';
    decks.forEach(d => {
        const el = document.createElement("div");
        el.className = 'deck-box';
        el.innerHTML = `<h3>${d.name}</h3><p>${d.description || ''}</p><button onclick="openDeck(${d.id})">Open</button>`;
        container.appendChild(el);
    });
}
function openDeck(id){ window.location.href = `/frontend/deck_view.html?deck=${id}`; }
loadDecksPage();
