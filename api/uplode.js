import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { html } = req.body;
  if (!html) {
    return res.status(400).json({ error: "HTML content is missing" });
  }

  // Nama acak untuk setiap deployment
  const randomName = `html-uplode-${Math.random().toString(36).substring(2, 8)}`;

  const payload = {
    name: randomName,
    files: [
      {
        file: "index.html",
        data: html,
      },
    ],
    projectSettings: {
      framework: "vite", // framework valid yang ringan
      devCommand: null,
      installCommand: null,
      buildCommand: null,
      outputDirectory: null,
    },
  };

  try {
    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Ambil alias URL dari hasil
    const alias = data?.alias || (data?.aliases?.[0] ?? null);

    if (alias) {
      return res.status(200).json({ url: `https://${alias}` });
    } else {
      console.error("⚠️ Error dari API Vercel:", data);
      return res.status(500).json({ error: "Gagal membuat deployment", data });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
