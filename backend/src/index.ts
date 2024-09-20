import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import userRoute from './routes/userRoute';
import path from 'path';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//Route
app.use('/api', userRoute)

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
