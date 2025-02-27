const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS e JSON parsing
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Aumenta o limite de JSON
app.use(express.urlencoded({ extended: true }));

// Pasta para armazenar os transcripts
const transcriptsFolder = path.join(__dirname, "transcripts");
if (!fs.existsSync(transcriptsFolder)) {
  fs.mkdirSync(transcriptsFolder);
}

// Rota para receber e salvar o transcript
app.post("/upload-transcript", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Nenhum conteúdo recebido!" });
    }

    // Nome do arquivo baseado na data/hora
    const fileName = `transcript-${Date.now()}.html`;
    const filePath = path.join(transcriptsFolder, fileName);

    // Salvar o arquivo corretamente
    fs.writeFile(filePath, content, "utf8", (err) => {
      if (err) {
        console.error("Erro ao salvar transcript:", err);
        return res.status(500).json({ error: "Erro ao salvar transcript." });
      }

      // Retornar o link do arquivo salvo
      res.json({ url: `https://api-fo68.onrender.com/transcripts/${fileName}` });
    });
  } catch (error) {
    console.error("Erro na API:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Servir os transcripts como arquivos públicos
app.use("/transcripts", express.static(transcriptsFolder));

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`);
});
