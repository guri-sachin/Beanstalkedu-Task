const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require("cors");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());
const port = 4000;

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

class LogParser {
  static parseLogFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const logs = fileContent.split('\n');

    // Filter logs with error or warn levels
    const errorLogs = logs.map((log) => {
      const jsonStartIndex = log.indexOf('{');
      const jsonPart = jsonStartIndex !== -1 ? log.substring(jsonStartIndex) : null;

      if (!jsonPart) {
        console.error('log entry (no JSON found): we process file and get response', log);
        return null;
      }

      try {
        const parsedLog = JSON.parse(jsonPart);
        return {
          timestamp:Date.now(),
          loglevel: log.split(' ')[2].toLowerCase(),
          transactionId: parsedLog.transactionId,
          err: parsedLog.err || 'not found',
        };
      } catch (error) {
        console.error('Error parsing log:', error);
        console.error('Failed log entry:', jsonPart);
        return null;
      }
    }).filter(Boolean); // Remove any entries that couldn't be parsed

    return errorLogs;
  }
}

app.post('/parseLog', upload.single('logFile'), (req, res) => {
  const filePath = req.file.path;
  const parsedLogs = LogParser.parseLogFile(filePath);

  // Transform logs into the desired response format
  const responseLogs = parsedLogs.map((log) => ({
    timestamp: log.timestamp,
    loglevel: log.loglevel,
    transactionId: log.transactionId,
    err: log.err,
  }));

  res.json(responseLogs);

  // Clean up: Delete the uploaded file after processing
  fs.unlinkSync(filePath);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});