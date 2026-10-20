const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.post('/api/transcribe', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'কোনো ফাইল পাওয়া যায়নি!' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Render-এ GROQ_API_KEY সেট করা নেই!' });
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);
        formData.append('model', 'whisper-large-v3'); // Groq-এর সুপারফাস্ট ফ্র্রি মডেল
        formData.append('language', 'bn');

        const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${apiKey}`
            }
        });

        // ফাইল প্রসেস শেষে ডিলিট করা
        fs.unlinkSync(req.file.path);

        res.json({ text: response.data.text });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Transcription error:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            error: error.response?.data?.error?.message || 'সার্ভারে ক্যাপশন প্রসেস করতে সমস্যা হয়েছে।' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
         
