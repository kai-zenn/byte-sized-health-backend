import App from "./app.js";
import "dotenv/config"
const PORT = process.env.PORT;

const initializeApp = async () => {
    try{
        App.listen(PORT, () => {
            console.log(
               `[server]: server is running at http://localhost:${PORT}`
            );
        });
    } catch (err) {
        console.error(err);
        process.exit(1)
    }
}

initializeApp()
