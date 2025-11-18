const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError"); 

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    loginError.innerText = "";

    try {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await fetch("http://127.0.0.1:8000/auth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            loginError.innerText = data.detail || "Invalid credentials";
            loginError.style.color = "red";
            loginError.style.display = "block";
            return;
        }

        localStorage.setItem("access_token", data.access_token);

        window.location.href = "/frontend/flashcard.html";

    } catch (error) {
        console.error("Login error:", error);
        loginError.innerText = "Something went wrong. Try again.";
        loginError.style.color = "red";
        loginError.style.display = "block";
    }
});
