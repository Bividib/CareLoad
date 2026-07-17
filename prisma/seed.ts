import { PrismaClient } from "../generated/prisma6";
import { resetSyntheticData } from "./seed-data";

const db = new PrismaClient();

resetSyntheticData(db)
  .then(() => console.log("Seeded synthetic patient Eleanor Reed."))
  .finally(() => db.$disconnect());
