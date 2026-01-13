import "./style.css";

const prompt = document.getElementById("sparksPrompt");
const tab = document.getElementById("sparksTab");
const panel = document.getElementById("sparksPanel");
const closeBtn = document.getElementById("sparksClose");

function openPanel() {
  panel.classList.remove("hidden");
  prompt.classList.add("hidden");
  tab.classList.add("hidden");
}

function closePanel() {
  panel.classList.add("hidden");
  prompt.classList.add("hidden");
  tab.classList.remove("hidden");
}

prompt.addEventListener("click", openPanel);
tab.addEventListener("click", openPanel);
closeBtn.addEventListener("click", closePanel);
