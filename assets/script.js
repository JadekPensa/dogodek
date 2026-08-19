// Power Automate endpoint (HTTP trigger "Ko je prejeta zahteva HTTP")
const POST_URL = "https://default876318425aed4cb986a5d505d03356.70.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/22/workflows/e4119d85cf9d41c6bbb3948d01083faa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ssg4-sqidLFLqZVWbDEnbg7BTLWkiisZZAQqT2CQa-Q";

const CONTACT_EMAIL = "aljaz.jadek@jadek-pensa.si";

const form = document.getElementById("registration-form");
const submitButton = document.getElementById("submit-button");
const formError = document.getElementById("form-error");
const confirmationMessage = document.getElementById("confirmation-message");

const dodatniGostCheckbox = document.getElementById("dodatni-gost");
const gostPodatki = document.getElementById("gost-podatki");
const prehranaDrugoCheckbox = document.getElementById("prehrana-drugo");
const prehranaDrugoPolje = document.getElementById("prehrana-drugo-polje");
const gostPrehranaDrugoCheckbox = document.getElementById("gost-prehrana-drugo");
const gostPrehranaDrugoPolje = document.getElementById("gost-prehrana-drugo-polje");

dodatniGostCheckbox.addEventListener("change", function () {
  gostPodatki.hidden = !dodatniGostCheckbox.checked;
});

prehranaDrugoCheckbox.addEventListener("change", function () {
  prehranaDrugoPolje.hidden = !prehranaDrugoCheckbox.checked;
});

gostPrehranaDrugoCheckbox.addEventListener("change", function () {
  gostPrehranaDrugoPolje.hidden = !gostPrehranaDrugoCheckbox.checked;
});

function collectPrehrana(checkboxName, opisFieldName) {
  const izbrane = Array.from(form.querySelectorAll('input[name="' + checkboxName + '"]:checked'));
  const opis = form[opisFieldName].value.trim();
  return izbrane.map(function (checkbox) {
    if (checkbox.value === "Drugo" && opis) {
      return "Drugo: " + opis;
    }
    return checkbox.value;
  });
}

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
  const podjetje = form["podjetje"].value.trim();
  const funkcija = form["funkcija"].value.trim();
  const soglasje = form["soglasje"].checked;
  const honeypot = form["website"].value.trim();
  const dodatniGost = dodatniGostCheckbox.checked;

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

  if (prehranaDrugoCheckbox.checked && !form["prehrana-drugo-opis"].value.trim()) {
    showError("Prosimo, navedite vašo prehransko omejitev.");
    return;
  }

  if (dodatniGost) {
    const gostEmail = form["gost-email"].value.trim();

    if (gostEmail && !isValidEmail(gostEmail)) {
      showError("Prosimo, vnesite veljaven e-poštni naslov gosta.");
      return;
    }

    if (gostPrehranaDrugoCheckbox.checked && !form["gost-prehrana-drugo-opis"].value.trim()) {
      showError("Prosimo, navedite prehransko omejitev gosta.");
      return;
    }
  }

  if (!soglasje) {
    showError("Za prijavo je potrebno soglasje za obdelavo osebnih podatkov.");
    return;
  }

  const data = {
    imePriimek: imePriimek,
    email: email,
    podjetje: podjetje,
    funkcija: funkcija,
    prehranskeOmejitve: collectPrehrana("prehrana", "prehrana-drugo-opis"),
    dodatniGost: dodatniGost,
    soglasje: soglasje
  };

  if (dodatniGost) {
    data.gost = {
      imePriimek: form["gost-ime-priimek"].value.trim(),
      podjetjeFunkcija: form["gost-podjetje-funkcija"].value.trim(),
      email: form["gost-email"].value.trim(),
      prehranskeOmejitve: collectPrehrana("gost-prehrana", "gost-prehrana-drugo-opis")
    };
  }

  submitButton.disabled = true;
  submitButton.textContent = "Pošiljanje...";

  try {
    const response = await fetch(POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      submitButton.textContent = "Oddano";
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
