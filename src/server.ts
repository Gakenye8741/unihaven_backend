import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`🚀 UniHaven API is live at http://localhost:${PORT}`);
    console.log(`🏠 Welcome to UniHaven – your platform for managing hostels, tenants, and everything campus life!`);
});