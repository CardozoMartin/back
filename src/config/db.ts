import mongoose from "mongoose"

mongoose.set('strictQuery', true);

export const connectDB = async()=>{
    try {
        
        await mongoose.connect("mongodb+srv://martincardozo1993xp:wCqSETzkYhwSSpk3@cluster-63i.bkvhzgl.mongodb.net/bahia?retryWrites=true&w=majority&appName=Cluster-63i").then(() => {
            console.log("Base de datos conectada")
        }).catch((e) => {
            console.error("Error en la base de dato" + e)
        })
    } catch (error) {
        
    }
}