// Power Automate endpoint (HTTP trigger "Ko je prejeta zahteva HTTP")
const POST_URL = "https://default876318425aed4cb986a5d505d03356.70.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/22/workflows/e4119d85cf9d41c6bbb3948d01083faa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ssg4-sqidLFLqZVWbDEnbg7BTLWkiisZZAQqT2CQa-Q";

const CONTACT_EMAIL = "martin.retelj@jadek-pensa.si";

const form = document.getElementById("registration-form");
const submitButton = document.getElementById("submit-button");
const formError = document.getElementById("form-error");
const registrationView = document.getElementById("registration-view");
const confirmationMessage = document.getElementById("confirmation-message");

const dodatniGostRadios = document.querySelectorAll('input[name="dodatni-gost"]');
const gostPodatki = document.getElementById("gost-podatki");

dodatniGostRadios.forEach(function (radio) {
  radio.addEventListener("change", function () {
    const priDogodku = form["dodatni-gost"].value === "Da";
    gostPodatki.hidden = !priDogodku;

    if (!priDogodku) {
      gostPodatki.querySelectorAll("input[type=text], input[type=email]").forEach(function (input) {
        input.value = "";
      });
    }
  });
});

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

function wait(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

async function postWithRetry(data, attempts) {
  for (let poskus = 1; poskus <= attempts; poskus++) {
    try {
      const response = await fetch(POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return response;
      }

      if (poskus === attempts) {
        throw new Error("Napaka pri pošiljanju: " + response.status);
      }
    } catch (error) {
      if (poskus === attempts) {
        throw error;
      }
    }

    await wait(1000 * poskus);
  }
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  clearError();

  const imePriimek = form["ime-priimek"].value.trim();
  const email = form["email"].value.trim();
  const podjetje = form["podjetje"].value.trim();
  const funkcija = form["funkcija"].value.trim();
  const opombe = form["opombe"].value.trim();
  const soglasjeObdelava = form["soglasje-obdelava"].checked;
  const soglasjeFoto = form["soglasje-foto"].checked;
  const honeypot = form["website"].value.trim();
  const dodatniGostOdgovor = form["dodatni-gost"].value;
  const dodatniGost = dodatniGostOdgovor === "Da";

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

  if (!podjetje) {
    showError("Prosimo, vnesite podjetje.");
    return;
  }

  if (!funkcija) {
    showError("Prosimo, vnesite funkcijo.");
    return;
  }

  if (!dodatniGostOdgovor) {
    showError("Prosimo, izberite, ali se boste dogodka udeležili z dodatnim gostom.");
    return;
  }

  if (dodatniGost) {
    const gostImePriimek = form["gost-ime-priimek"].value.trim();
    const gostPodjetje = form["gost-podjetje"].value.trim();
    const gostFunkcija = form["gost-funkcija"].value.trim();
    const gostEmail = form["gost-email"].value.trim();

    if (!gostImePriimek) {
      showError("Prosimo, vnesite ime in priimek gosta.");
      return;
    }

    if (!gostPodjetje) {
      showError("Prosimo, vnesite podjetje gosta.");
      return;
    }

    if (!gostFunkcija) {
      showError("Prosimo, vnesite funkcijo gosta.");
      return;
    }

    if (!gostEmail || !isValidEmail(gostEmail)) {
      showError("Prosimo, vnesite veljaven e-poštni naslov gosta.");
      return;
    }
  }

  if (!soglasjeObdelava) {
    showError("Za prijavo je potrebno soglasje za obdelavo osebnih podatkov.");
    return;
  }

  if (!soglasjeFoto) {
    showError("Za prijavo je potrebno soglasje za fotografiranje in snemanje dogodka.");
    return;
  }

  const data = {
    imePriimek: imePriimek,
    email: email,
    podjetje: podjetje,
    funkcija: funkcija,
    prehranskeOmejitve: form["prehrana"].value.trim(),
    dodatniGost: dodatniGost,
    opombe: opombe,
    soglasjeObdelava: soglasjeObdelava,
    soglasjeFoto: soglasjeFoto
  };

  if (dodatniGost) {
    data.gost = {
      imePriimekG: form["gost-ime-priimek"].value.trim(),
      podjetjeG: form["gost-podjetje"].value.trim(),
      FunkcijaG: form["gost-funkcija"].value.trim(),
      emailG: form["gost-email"].value.trim(),
      prehranskeOmejitveG: form["gost-prehrana"].value.trim()
    };
  }

  submitButton.disabled = true;
  submitButton.textContent = "Pošiljanje...";

  try {
    await postWithRetry(data, 3);
    submitButton.textContent = "Oddano";
    registrationView.hidden = true;
    confirmationMessage.hidden = false;
  } catch (error) {
    showError(
      "Prijava ni bila uspešna, poskusite znova ali nas kontaktirajte na " + CONTACT_EMAIL + "."
    );
    submitButton.disabled = false;
    submitButton.textContent = "Prijava";
  }
});
