# Prijava na dogodek — GitHub Pages

Statična stran s prijavnim obrazcem za dogodek. Obrazec podatke pošlje neposredno iz brskalnika (JS `fetch`) na Power Automate endpoint, ki jih zapiše v SharePoint/Excel. Stran sama ne shranjuje in ne posreduje nobenih osebnih podatkov na GitHub.

## Vzdrževanje

1. **Power Automate endpoint URL** — zamenjaj konstanto `POST_URL` na vrhu [assets/script.js](assets/script.js).
2. **Kontaktni e-mail ob napaki** — zamenjaj `CONTACT_EMAIL` v [assets/script.js](assets/script.js).
3. **Besedilo GDPR soglasja** — v [index.html](index.html) dopolni `[IME DOGODKA]` in `[OBDOBJE HRAMBE]` v checkbox oznaki.
4. **Logo** — zamenjaj datoteko [assets/img/logo.png](assets/img/logo.png) (obdrži isto ime ali posodobi pot v `index.html`).
5. **Naslov strani / meta naslov** — po potrebi uredi `<title>` v [index.html](index.html).

## Pomembno

- GitHub Pages gosti izključno statično kodo (HTML/CSS/JS) — repozitorij ne vsebuje in ne sme vsebovati nobenih osebnih podatkov (ne v kodi, ne v testnih datotekah, ne v komentarjih).
- Vsi prijavni podatki gredo neposredno iz brskalnika uporabnika na Power Automate endpoint prek `fetch` — GitHub Pages jih nikoli ne vidi niti ne shranjuje.
- Obrazec vsebuje honeypot polje (`website`) za osnovno zaščito pred boti — mora ostati skrito (CSS `.honeypot`).
