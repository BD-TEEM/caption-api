const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/transcribe', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "কোনো ফাইল পাওয়া যায়নি!" });
        }

        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        formData.append('model', 'whisper-1');
        formData.append('language', 'bn');

        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer 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`
            }
        });

        res.json({ text: response.data.text });

    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).json({ error: "সার্ভারে ক্যাপশন প্রসেস করতে সমস্যা হয়েছে।" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
