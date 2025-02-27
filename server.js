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

    // Certifique-se de que o conteúdo é uma string
    const transcriptContent = typeof content === "string" ? content : JSON.stringify(content);

    // Nome do arquivo baseado na data/hora
    const fileName = `transcript-${Date.now()}.html`;
    const filePath = path.join(transcriptsFolder, fileName);

    // Salvar o arquivo corretamente
    fs.writeFile(filePath, transcriptContent, "utf8", (err) => {
      if (err) {
        console.error("Erro ao salvar transcript:", err);
        return res.status(500).json({ error: "Erro ao salvar transcript." });
      }

      console.log("Arquivo salvo em:", filePath);
      res.json({ url: `/transcripts/${fileName}` });
    });
  } catch (error) {
    console.error("Erro na API:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Servir os transcripts como arquivos públicos
app.use("/transcripts", express.static(transcriptsFolder, {
  extensions: ["html"],
  setHeaders: (res, path, stat) => {
    res.set("Content-Type", "text/html");
  },
}));

// Rota para listar os transcripts disponíveis
app.get("/transcripts/list", (req, res) => {
  fs.readdir(transcriptsFolder, (err, files) => {
    if (err) {
      console.error("Erro ao listar transcripts:", err);
      return res.status(500).json({ error: "Erro ao listar transcripts." });
    }
    res.json({ transcripts: files });
  });
});

app.get("/", (req, res) => {
  res.send("🚀 API da Rebel City rodando com sucesso!");
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`);
});
