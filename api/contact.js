export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { category, firstname, lastname, company, message, email, consent } = req.body ?? {};

  if (!firstname || !lastname || !email || !message || consent !== "oui") {
    return res.status(400).json({ error: "Champs invalides" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "RESEND_API_KEY manquante" });
  }

  const to = process.env.CONTACT_TO_EMAIL || "contact@arqow.com";
  const from = process.env.CONTACT_FROM_EMAIL || "Arqow <noreply@arqow.com>";
  const subject = `[Arqow] ${category || "Contact"} — ${firstname} ${lastname}`;
  const companyLine = company ? `<p><strong>Entreprise :</strong> ${escapeHtml(company)}</p>` : "";

  const html = `
    <h2>Nouvelle demande Arqow</h2>
    <p><strong>Catégorie :</strong> ${escapeHtml(category || "—")}</p>
    <p><strong>Nom :</strong> ${escapeHtml(firstname)} ${escapeHtml(lastname)}</p>
    <p><strong>Email :</strong> ${escapeHtml(email)}</p>
    ${companyLine}
    <p><strong>Message :</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend error:", detail);
    return res.status(500).json({ error: "Envoi impossible" });
  }

  return res.status(200).json({ ok: true });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
