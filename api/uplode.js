import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { html } = req.body;
  const token = process.env.VERCEL_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "Token tidak ditemukan di server" });
  }
  if (!html) {
    return res.status(400).json({ error: "HTML kosong" });
  }

  const payload = {
    name: "html-uplode",
    files: [
      {
        file: "index.html",
        data: html,
      },
    ],
    projectSettings: {
      framework: "vite",
      devCommand: null,
      installCommand: null,
      buildCommand: null,
      outputDirectory: null,
    },
  };

  try {
    const response = await fetch(
      "https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (response.status !== 200) {
      console.error("⚠️ Error dari API Vercel:", data);
    }

    const alias = data?.alias || data?.aliases?.[0];
    if (alias) {
      return res.status(200).json({ url: `https://${alias}` });
    } else {
      return res.status(500).json({ error: "Gagal mendapatkan URL", data });
    }
  } catch (err) {
    console.error("🚨 Upload error:", err);
    return res.status(500).json({ error: err.message });
  }
}

