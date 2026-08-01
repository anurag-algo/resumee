/**
 * Credit package definitions — single source of truth.
 * The frontend only sends a packageId; the backend resolves
 * all amounts and credits from this config. Never trust the frontend.
 *
 * amountINR: price in Indian Rupees
 * amountPaise: amount in paise (Razorpay requires smallest currency unit)
 * credits: number of credits granted on successful payment
 */
const CREDIT_PACKAGES = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Perfect for getting started",
    amountINR: 99,
    amountPaise: 9900,
    credits: 100,
    currency: "INR",
  },
  professional: {
    id: "professional",
    name: "Professional",
    description: "Great value for active job seekers",
    amountINR: 299,
    amountPaise: 29900,
    credits: 350,
    currency: "INR",
  },
  ultimate: {
    id: "ultimate",
    name: "Ultimate",
    description: "Best value for power users",
    amountINR: 499,
    amountPaise: 49900,
    credits: 650,
    currency: "INR",
  },
};

/**
 * Returns a package definition by its ID.
 * Returns null if the packageId is not found (i.e., invalid).
 */
const getPackageById = (packageId) => {
  if (!packageId || typeof packageId !== "string") return null;
  return CREDIT_PACKAGES[packageId.toLowerCase()] || null;
};

/**
 * Returns all packages as an array (safe for sending to frontend).
 * Does NOT expose amountPaise (internal only).
 */
const getAllPackages = () =>
  Object.values(CREDIT_PACKAGES).map(({ id, name, description, amountINR, credits, currency }) => ({
    id,
    name,
    description,
    amountINR,
    credits,
    currency,
  }));

export { getAllPackages, getPackageById };
export default CREDIT_PACKAGES;
