import { envConfig } from "./envConfig";
import { app } from "./main";

const portNumber = envConfig.portNumber || 8000;

app.listen(portNumber,()=>{
    console.log(`Server running at ${portNumber}`);
})