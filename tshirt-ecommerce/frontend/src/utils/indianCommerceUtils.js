// Indian Commerce Utilities — Formatting, GST, PIN codes, and Address Standards

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Sample Pincode Serviceability Directory (Can be extended with API)
export const PINCODE_DIRECTORY = {
  "560001": { city: "Bengaluru", district: "Bengaluru Urban", state: "Karnataka", days: 2, cod: true },
  "560038": { city: "Bengaluru (Indiranagar)", district: "Bengaluru Urban", state: "Karnataka", days: 1, cod: true },
  "400001": { city: "Mumbai (Fort)", district: "Mumbai City", state: "Maharashtra", days: 2, cod: true },
  "400050": { city: "Mumbai (Bandra)", district: "Mumbai Suburban", state: "Maharashtra", days: 2, cod: true },
  "110001": { city: "New Delhi (Connaught Place)", district: "Central Delhi", state: "Delhi", days: 2, cod: true },
  "110016": { city: "New Delhi (Hauz Khas)", district: "South Delhi", state: "Delhi", days: 2, cod: true },
  "600001": { city: "Chennai (George Town)", district: "Chennai", state: "Tamil Nadu", days: 3, cod: true },
  "600028": { city: "Chennai (R.A. Puram)", district: "Chennai", state: "Tamil Nadu", days: 2, cod: true },
  "500001": { city: "Hyderabad (Abids)", district: "Hyderabad", state: "Telangana", days: 2, cod: true },
  "500081": { city: "Hyderabad (Madhapur/Hitec)", district: "Rangareddy", state: "Telangana", days: 1, cod: true },
  "700001": { city: "Kolkata (B.B.D. Bagh)", district: "Kolkata", state: "West Bengal", days: 3, cod: true },
  "411001": { city: "Pune", district: "Pune", state: "Maharashtra", days: 2, cod: true },
  "380001": { city: "Ahmedabad", district: "Ahmedabad", state: "Gujarat", days: 3, cod: true },
  "302001": { city: "Jaipur", district: "Jaipur", state: "Rajasthan", days: 3, cod: true },
  "226001": { city: "Lucknow", district: "Lucknow", state: "Uttar Pradesh", days: 3, cod: true },
  "682001": { city: "Kochi", district: "Ernakulam", state: "Kerala", days: 3, cod: true }
};

export const checkPincodeServiceability = (pincode) => {
  const cleanPin = String(pincode).trim();
  if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
    return { valid: false, message: "Enter a valid 6-digit Indian PIN code" };
  }
  const match = PINCODE_DIRECTORY[cleanPin];
  if (match) {
    return {
      valid: true,
      serviceable: true,
      city: match.city,
      district: match.district,
      state: match.state,
      estimatedDays: match.days,
      codAvailable: match.cod,
      message: `Delivering in ${match.days} days to ${match.city}, ${match.state} (COD Available)`
    };
  }
  // Generic fallback for any other valid 6-digit Indian PIN
  return {
    valid: true,
    serviceable: true,
    city: "Standard Delivery Hub",
    district: "Direct Express",
    state: "India",
    estimatedDays: 4,
    codAvailable: true,
    message: "Standard delivery within 4-5 business days (COD Available)"
  };
};

// Format currency as Indian Rupee (₹) with Indian number grouping
export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0.00";
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(num);
};

// Validate 10-digit Indian Mobile Number
export const validateIndianPhone = (phone) => {
  const cleanPhone = String(phone).replace(/[\s\-\+]/g, '');
  const digits = cleanPhone.startsWith('91') && cleanPhone.length === 12
    ? cleanPhone.slice(2)
    : cleanPhone;
  return /^[6-9]\d{9}$/.test(digits);
};

// Format Indian Date Time (e.g. 17 Sep 2026, 05:30 PM IST)
export const formatIndianDateTime = (isoString) => {
  if (!isoString) return "N/A";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + " IST";
  } catch {
    return isoString;
  }
};

// GST Calculation breakdown for orders & invoices
export const calculateGST = (subtotal, gstRatePercent = 12, isInterState = false) => {
  const rate = Number(gstRatePercent);
  const taxTotal = (subtotal * rate) / 100;
  if (isInterState) {
    return {
      gstRate: rate,
      cgst: 0,
      sgst: 0,
      igst: Number(taxTotal.toFixed(2)),
      totalTax: Number(taxTotal.toFixed(2))
    };
  }
  const halfTax = Number((taxTotal / 2).toFixed(2));
  return {
    gstRate: rate,
    cgst: halfTax,
    sgst: halfTax,
    igst: 0,
    totalTax: Number((halfTax * 2).toFixed(2))
  };
};

// Available Payment Methods
export const INDIAN_PAYMENT_METHODS = [
  {
    id: "UPI",
    name: "UPI (Google Pay, PhonePe, Paytm, QR)",
    description: "Instant 0% transaction fee via any UPI App or QR code",
    badge: "RECOMMENDED",
    icon: "Smartphone"
  },
  {
    id: "COD",
    name: "Cash on Delivery (COD)",
    description: "Pay with cash or UPI QR at your doorstep",
    badge: "AVAILABLE",
    icon: "Banknote"
  },
  {
    id: "CARD",
    name: "RuPay / Credit / Debit Card",
    description: "All Indian and International Cards supported via 256-bit SSL",
    badge: null,
    icon: "CreditCard"
  },
  {
    id: "NETBANKING",
    name: "Net Banking",
    description: "SBI, HDFC, ICICI, Axis, PNB and 50+ Indian banks",
    badge: null,
    icon: "Building"
  }
];
