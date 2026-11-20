// js/rsvp.js
// Replace BACKEND_URL with your Google Apps Script Web App URL or Node/Express endpoint
const BACKEND_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";

const form = document.getElementById("rsvp-form");
const submitBtn = document.getElementById("rsvp-submit");
const statusEl = document.getElementById("rsvp-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  statusEl.textContent = "Submitting your RSVP...";

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    // Using text/plain avoids CORS preflight issues on Google Apps Script Web Apps
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Network response was not ok");

    statusEl.textContent = "Thank you! Your RSVP has been recorded.";
    form.reset();
  } catch (err) {
    statusEl.textContent = "Could not send RSVP right now. Please try again.";
  } finally {
    submitBtn.disabled = false;
  }
});