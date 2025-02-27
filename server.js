const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const transcriptsDir = path.join(__dirname, "transcripts");

// Criar a pasta transcripts se não existir
if (!fs.existsSync(transcriptsDir)) {
    fs.mkdirSync(transcriptsDir);
}

// 📌 Servir o site da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// 📌 Rota para receber um transcript e salvar no servidor
app.post("/upload-transcript", (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Conteúdo do transcript não encontrado." });
    }

    const fileName = `transcript-${Date.now()}.html`;
    const filePath = path.join(transcriptsDir, fileName);

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error("Erro ao salvar transcript:", err);
            return res.status(500).json({ error: "Erro ao salvar transcript." });
        }

        res.json({ url: `/transcripts/${fileName}` });
    });
});

// 📌 Rota para listar todos os transcripts disponíveis
app.get("/transcripts", (req, res) => {
    fs.readdir(transcriptsDir, (err, files) => {
        if (err) {
            console.error("Erro ao listar transcripts:", err);
            return res.status(500).json({ error: "Erro ao listar transcripts." });
        }

        res.json(files);
    });
});

// 📌 Servir os arquivos de transcript diretamente
app.use("/transcripts", express.static(transcriptsDir));

// 🔥 Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
