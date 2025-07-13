const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";
  // Add a "thinking" message for better UX
  appendMessage("bot", "Gemini is thinking...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Remove the "thinking..." message before appending the real response
    chatBox.lastChild.remove();
    appendMessage("bot", data.response);
  } catch (error) {
    console.error("Error fetching from API:", error);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
