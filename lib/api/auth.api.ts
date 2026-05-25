import axios from "axios";

const apiUrl = process.env.NODE_ENV ;
export  const login = async (data : {email : string , password : string})=>{
    const res =  await axios.post(`${apiUrl}/api/auth/login`);

    if(!res){
        throw new Error("Login failed");
    }

    return res.data;
    
}