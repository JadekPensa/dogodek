// Power Automate endpoint (HTTP trigger "Ko je prejeta zahteva HTTP")
const POST_URL = "https://default876318425aed4cb986a5d505d03356.70.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/22/workflows/e4119d85cf9d41c6bbb3948d01083faa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ssg4-sqidLFLqZVWbDEnbg7BTLWkiisZZAQqT2CQa-Q";

const CONTACT_EMAIL = "aljaz.jadek@jadek-pensa.si";

const form = document.getElementById("registration-form");
const submitButton = document.getElementById("submit-button");
const formError = document.getElementById("form-error");
const confirmationMessage = document.getElementById("confirmation-message");

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function clearError() {
  formError.hidden = true;
  formError.textContent = "";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  clearError();

  const imePriimek = form["ime-priimek"].value.trim();
  const email = form["email"].value.trim();
  const soglasje = form["soglasje"].checked;
  const honeypot = form["website"].value.trim();

  // Honeypot je izpolnjen - domnevamo bota, prijavo tiho zavrnemo.
  if (honeypot !== "") {
    return;
  }

  if (!imePriimek) {
    showError("Prosimo, vnesite ime in priimek.");
    return;
  }

  if (!email || !isValidEmail(email)) {
    showError("Prosimo, vnesite veljaven e-poštni naslov.");
    return;
  }

  if (!soglasje) {
    showError("Za prijavo je potrebno soglasje za obdelavo osebnih podatkov.");
    return;
  }

  const data = {
    imePriimek: imePriimek,
    email: email,
    soglasje: soglasje
  };

  submitButton.disabled = true;
  submitButton.textContent = "Pošiljanje...";

  try {
    const response = await fetch(POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      form.hidden = true;
      confirmationMessage.hidden = false;
    } else {
      throw new Error("Napaka pri pošiljanju");
    }
  } catch (error) {
    showError(
      "Prijava ni bila uspešna, poskusite znova ali nas kontaktirajte na " + CONTACT_EMAIL + "."
    );
    submitButton.disabled = false;
    submitButton.textContent = "Prijava";
  }
});
