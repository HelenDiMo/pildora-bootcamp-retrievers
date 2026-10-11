import datos from "./data/expediente.json";
import { crearMotor } from "./lib/retrieval.js";

export const motor = crearMotor(datos);
