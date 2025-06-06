import app from './app';

const PORT = process.env.SERVER_PORT || 5000;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
