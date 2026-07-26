"use server"

import { connectToMongo } from "../DL/connectToMongo";

export const creatFormAction = async (fd)=> {
const obj = Object.fromEntries(fd);
try {
    await connectToMongo();
} catch (error) {
    throw new Error('Failed to create task')
}
}