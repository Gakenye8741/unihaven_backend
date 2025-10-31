
import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from "cors"
import helmet from 'helmet';
import { logger } from './middleware/logger';
import AuthRouter from './Auth/Auth.route';
import userRouter from './services/Users/users.route';
import { anyAuth } from './middleware/AuthBearer';
import { checkUserActive } from './middleware/CheckUserActivity';
import hostelRouter from './services/Hostels/Hostel.route';
import hostelOwnerRouter from './services/HostelOwners/HostelOwners.route';
import roomsRouter from './services/Rooms/Rooms.route';
import postsRouter from './services/Posts/Post.route';
import "./middleware/Merged.cron"
import adRouter from './services/Advertiser/Advertiser.route';


const app: Application = express();

// Basic Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use('/api', hostelOwnerRouter);
app.use('/api' ,hostelRouter);
app.use('/api', roomsRouter);
app.use('/api', postsRouter);
app.use('/api', adRouter)

app.use('/api/auth', AuthRouter)
app.use('/api/user',anyAuth,checkUserActive, userRouter);


// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

export default app;
