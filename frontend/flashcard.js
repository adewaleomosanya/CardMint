function showToast(message) {
    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}


const flipBtn = document.getElementById("flipPreview");
const previewCard = document.getElementById("previewCard");
const saveBtn = document.getElementById("saveFlashcard");
const flashcardList = document.getElementById("flashcardList");


async function loadUserDetails() {
    try {
        const token = localStorage.getItem("access_token");
        
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch("http://127.0.0.1:8000/users/me", {
            method: "GET",
            credentials: "include",
            headers: headers
        });

        if (!response.ok) {
            return;
        }

        const user = await response.json();
        document.getElementById("usernameDisplay").innerText = user.email;

    } catch (error) {
        console.error("Error loading user:", error);
    }
}



flipBtn.addEventListener("click", () => {
    previewCard.classList.toggle("flip");
});



saveBtn.addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer").value.trim();

    if (!title || !question || !answer) {
        showToast("Please fill all fields.");
        return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
        showToast("Please log in first.");
        window.location.href = "/frontend/login.html";
        return;
    }

    const response = await fetch("http://127.0.0.1:8000/flashcards/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            title: title,
            question: question,
            answer: answer
        })
    });

    const data = await response.json();

    if (!response.ok) {
        showToast("Error: " + data.detail);
        return;
    }

    showToast("Flashcard created!");

    
    document.getElementById("title").value = "";
    document.getElementById("question").value = "";
    document.getElementById("answer").value = "";
    previewCard.classList.remove("flip");

    loadFlashcards();
});



async function loadFlashcards() {
    const token = localStorage.getItem("access_token");

    const response = await fetch("http://127.0.0.1:8000/flashcards/my-cards", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
        return;
    }

    const cards = await response.json();
    flashcardList.innerHTML = "";

    cards.forEach(card => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("card-wrapper");

        const cardBox = document.createElement("div");
        cardBox.classList.add("flashcard");

        const front = document.createElement("div");
        front.classList.add("front");
        front.innerHTML = `<h4>${card.title}</h4><p>${card.question}</p>`;

        const back = document.createElement("div");
        back.classList.add("back");
        back.innerHTML = `<p>${card.answer}</p>`;

        cardBox.appendChild(front);
        cardBox.appendChild(back);

        cardBox.addEventListener("click", () => {
            cardBox.classList.toggle("flip");
        });

        
        const editBtn = document.createElement("button");
        editBtn.classList.add("edit-btn");
        editBtn.innerText = "Edit";
        editBtn.onclick = () => openEditModal(card);

        
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deleteFlashcard(card.id);

        wrapper.appendChild(cardBox);
        wrapper.appendChild(editBtn);
        wrapper.appendChild(deleteBtn);

        flashcardList.appendChild(wrapper);
    });
}




let currentEditingId = null;

function openEditModal(card) {
    currentEditingId = card.id;

    document.getElementById("editFront").value = card.question;
    document.getElementById("editBack").value = card.answer;

    document.getElementById("editModal").classList.remove("hidden");
}

document.getElementById("closeEditModal").addEventListener("click", () => {
    document.getElementById("editModal").classList.add("hidden");
});

document.getElementById("saveEditBtn").addEventListener("click", async () => {
    const token = localStorage.getItem("access_token");

    const updated = {
        question: document.getElementById("editFront").value,
        answer: document.getElementById("editBack").value
    };

    const response = await fetch(`http://127.0.0.1:8000/flashcards/update/${currentEditingId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updated)
    });

    if (response.ok) {
        showToast("Flashcard updated!");
        document.getElementById("editModal").classList.add("hidden");
        loadFlashcards();
    } else {
        showToast("Update failed.");
    }
});


async function deleteFlashcard(cardId) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`http://127.0.0.1:8000/flashcards/delete/${cardId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) {
        showToast("Flashcard deleted!");
        loadFlashcards();
    } else {
        showToast("Failed to delete flashcard.");
    }
}



loadUserDetails();
loadFlashcards();
