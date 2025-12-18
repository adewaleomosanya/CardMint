function showToast(message) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3400);
}

const flipBtn = document.getElementById("flipPreview");
const previewCard = document.getElementById("previewCard");
const saveBtn = document.getElementById("saveFlashcard");

const deckList = document.getElementById("deckList");
const existingDecksSelect = document.getElementById("existingDecks");

const newDeckFields = document.getElementById("newDeckFields");
const existingDeckFields = document.getElementById("existingDeckFields");
const deckModeRadios = document.getElementsByName("deckMode");

let deckToDelete = null;
async function loadUserDetails() {
    try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch("http://127.0.0.1:8000/users/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) return;

        const user = await res.json();
        document.getElementById("usernameDisplay").innerText = user.email;

    } catch (err) {
        console.error("User load error:", err);
    }
}
loadUserDetails();
function updateDeckModeUI() {
    const mode = Array.from(deckModeRadios).find(r => r.checked).value;

    newDeckFields.style.display = mode === "new" ? "block" : "none";
    existingDeckFields.style.display = mode === "existing" ? "block" : "none";
}
Array.from(deckModeRadios).forEach(r =>
    r.addEventListener("change", updateDeckModeUI)
);
flipBtn.addEventListener("click", () => {
    previewCard.classList.toggle("flip");
});
async function loadDecks() {
    const token = localStorage.getItem("access_token");
    deckList.innerHTML = "";
    existingDecksSelect.innerHTML = "";

    try {
        const res = await fetch("http://127.0.0.1:8000/decks/my-decks", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch decks");

        const decks = await res.json();

        existingDecksSelect.innerHTML = `<option value="">Select deck</option>`;

        for (const d of decks) {
            const cardRes = await fetch(`http://127.0.0.1:8000/decks/${d.id}/cards`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            let cards = [];
            if (cardRes.ok) cards = await cardRes.json();

            const cardCount = cards.length;

            const box = document.createElement("div");
            box.className = "deck-box";
            box.innerHTML = `
                <div class="deck-card">
                    <h3 class="deck-title">${d.name}</h3>
                    <p class="deck-count">${cardCount} ${cardCount === 1 ? "card" : "cards"}</p>

                    <div class="deck-buttons">
                        <button class="study-btn" onclick="openDeck(${d.id})">Study</button>
                        <button class="delete-deck-btn" onclick="showDeleteModal(${d.id})">Delete</button>
                    </div>
                </div>
            `;

            deckList.appendChild(box);

            const opt = document.createElement("option");
            opt.value = d.id;
            opt.innerText = d.name;
            existingDecksSelect.appendChild(opt);
        }

        if (decks.length === 0) {
            deckList.innerHTML = "<p>No decks found.</p>";
            existingDecksSelect.innerHTML = `<option value="">No decks available</option>`;
        }

    } catch (err) {
        console.error(err);
        deckList.innerHTML = "<p>Error loading decks.</p>";
        existingDecksSelect.innerHTML = `<option value="">Error loading decks</option>`;
    }
}
loadDecks();

function openDeck(deckId) {
    window.location.href = `/frontend/deck_view.html?deck=${deckId}`;
}
saveBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
        showToast("Login required");
        return;
    }

    const title = document.getElementById("title").value.trim() || null;
    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer").value.trim();
    const deckMode = Array.from(deckModeRadios).find(r => r.checked).value;

    if (!question || !answer) {
        showToast("Enter question & answer");
        return;
    }

    let deckId = null;
    if (deckMode === "new") {
        const deckName = document.getElementById("deckName").value.trim();
        const deckDesc = document.getElementById("deckDesc").value.trim();

        if (!deckName) {
            showToast("Enter a deck name");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/decks/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: deckName, description: deckDesc })
            });

            if (!res.ok) throw new Error("Failed to create deck");

            const deck = await res.json();
            deckId = deck.id;

            showToast("New deck created!");
            await loadDecks();

            existingDecksSelect.value = deckId;

        } catch (err) {
            console.error(err);
            showToast("Error creating deck");
            return;
        }

    } else {
        deckId = existingDecksSelect.value;
        if (!deckId) {
            showToast("Select a deck first");
            return;
        }
    }
    try {
        const cardRes = await fetch("http://127.0.0.1:8000/flashcards/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, question, answer, deck_id: deckId })
        });

        if (!cardRes.ok) throw new Error("Card creation failed");
        document.getElementById("title").value = "";
        document.getElementById("question").value = "";
        document.getElementById("answer").value = "";
        document.getElementById("deckName").value = "";
        document.getElementById("deckDesc").value = "";

        previewCard.classList.remove("flip");
        showToast("Flashcard saved!");

        await loadDecks();

    } catch (err) {
        console.error(err);
        showToast("Error saving flashcard");
    }
});

function showDeleteModal(deckId) {
    deckToDelete = deckId;
    document.getElementById("confirmModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("confirmModal").style.display = "none";
}

document.getElementById("confirmDeleteBtn").onclick = async function () {
    await deleteDeck(deckToDelete);
    closeModal();
};

async function deleteDeck(deckId) {
    const token = localStorage.getItem("access_token");

    const res = await fetch(`http://127.0.0.1:8000/decks/delete/${deckId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
        showToast("Deck deleted");
        loadDecks();
    } else {
        showToast("Failed to delete deck");
    }
}
