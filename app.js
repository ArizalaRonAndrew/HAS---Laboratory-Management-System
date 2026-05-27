import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import labRoutes from './routes/labRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/lab', labRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Lab Management System running on port ${port}`);
});