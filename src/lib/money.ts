/** Prices are stored as whole rupees; payment providers want paise. */
export const formatINR = (rupees: number) => `₹${rupees.toLocaleString("en-IN")}`;
export const toPaise = (rupees: number) => Math.round(rupees * 100);
