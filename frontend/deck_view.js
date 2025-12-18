const params = new URLSearchParams(window.location.search);
const deckId = params.get("deck");

let currentCardIndex = 0;
let deck = [];
let correctCount = 0;
let baseTitle = "";

const studyModal = document.getElementById("studyModal");
const studyCard = document.getElementById("studyCard");
const studyQuestion = document.getElementById("studyQuestion");
const studyAnswer = document.getElementById("studyAnswer");
const nextCardBtn = document.getElementById("nextCardBtn");
const studyProgress = document.getElementById("studyProgress");
const studyCorrect = document.getElementById("studyCorrect");
const studyWrong = document.getElementById("studyWrong");
const closeStudyBtn = document.getElementById("closeStudyBtn");
const deckTitle = document.getElementById("deckTitle");
const studyEmpty = document.getElementById("studyEmpty");
const cardsContainer = document.getElementById("cardsContainer");
const toastContainer = document.getElementById("toastContainer");

async function loadDeck() {
    if (!deckId) {
        studyEmpty.style.display = "block";
        studyEmpty.textContent = "No deck selected.";
        return;
    }

    const token = localStorage.getItem("access_token");

    try {
        const deckRes = await fetch(`http://127.0.0.1:8000/decks/${deckId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!deckRes.ok) throw new Error();
        const deckData = await deckRes.json();

        baseTitle = deckData.name || "Deck";
        deckTitle.textContent = baseTitle;

        const cardsRes = await fetch(`http://127.0.0.1:8000/decks/${deckId}/cards`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!cardsRes.ok) throw new Error();
        const cardsData = await cardsRes.json();

        if (!cardsData.length) {
            studyEmpty.style.display = "block";
            studyEmpty.textContent = "No cards available in this deck.";
            return;
        }

        deck = cardsData.map(c => ({
            id: c.id,
            question: c.question,
            answer: c.answer
        }));

        displayCardsGrid();
        await loadLastProgress();

    } catch {
        studyEmpty.style.display = "block";
        studyEmpty.textContent = "Could not load deck.";
    }
}

function displayCardsGrid() {
    studyModal.style.display = "none";
    cardsContainer.innerHTML = "";

    deck.forEach((card, index) => {
        const cardEl = document.createElement("div");
        cardEl.className = "grid-card";

        cardEl.innerHTML = `
            <div class="grid-card-inner">
                <div class="grid-card-front">
                    ${card.question}
                    <button class="delete-card-btn" data-index="${index}">🗑️</button>
                </div>
                <div class="grid-card-back">${card.answer}</div>
            </div>
        `;

        cardEl.addEventListener("click", () => {
            cardEl.classList.toggle("flipped");
        });

        cardsContainer.appendChild(cardEl);
    });

    attachDeleteHandlers();
}

function startStudyMode() {
    if (!deck.length) return;

    currentCardIndex = 0;
    correctCount = 0;
    studyModal.style.display = "flex";
    showCard(currentCardIndex);
}

function showCard(index) {
    studyCard.classList.remove("flipped");
    studyQuestion.textContent = deck[index].question;
    studyAnswer.textContent = deck[index].answer;
    nextCardBtn.style.display = "none";
    studyProgress.textContent = `Card ${index + 1} of ${deck.length}`;
}

studyCard.addEventListener("click", () => {
    studyCard.classList.toggle("flipped");
});

studyCorrect.addEventListener("click", e => {
    e.stopPropagation();
    studyCard.classList.add("flipped");
    nextCardBtn.style.display = "inline-block";
    correctCount++;
});

studyWrong.addEventListener("click", e => {
    e.stopPropagation();
    studyCard.classList.add("flipped");
    nextCardBtn.style.display = "inline-block";
});

nextCardBtn.addEventListener("click", async () => {
    currentCardIndex++;

    if (currentCardIndex < deck.length) {
        showCard(currentCardIndex);
    } else {
        studyModal.style.display = "none";
        const percentage = Math.round((correctCount / deck.length) * 100);
        deckTitle.textContent = `${baseTitle} | Last Study: ${percentage}% correct`;
        showToast(`Deck completed: ${percentage}% correct`);
        await sendProgressToBackend(correctCount, deck.length);
    }
});

closeStudyBtn.addEventListener("click", () => {
    studyModal.style.display = "none";
});

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

async function sendProgressToBackend(correct, total) {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    await fetch(`http://127.0.0.1:8000/decks/progress/${deckId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            correct_increment: correct,
            wrong_increment: total - correct,
            total_cards: total
        })
    });
}

async function loadLastProgress() {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const res = await fetch(`http://127.0.0.1:8000/decks/progress/${deckId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const progress = await res.json();
    deckTitle.textContent = `${baseTitle} | Last Study: ${progress.percentage}% correct`;
}

function attachDeleteHandlers() {
    document.querySelectorAll(".delete-card-btn").forEach(btn => {
        btn.addEventListener("click", async e => {
            e.stopPropagation();
            const index = btn.dataset.index;
            await deleteCard(deck[index].id, index);
        });
    });
}

async function deleteCard(cardId, index) {
    const token = localStorage.getItem("access_token");

    const res = await fetch(`http://127.0.0.1:8000/flashcards/delete/${cardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return showToast("Delete failed");

    deck.splice(index, 1);
    displayCardsGrid();
    showToast("Card deleted");
}

function goBack() {
    window.history.back();
}

loadDeck();
