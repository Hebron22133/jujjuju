// Nigerian Banks List
// Used for withdrawal bank selection

export interface Bank {
  code: string;
  name: string;
  slug: string;
}

export const NIGERIAN_BANKS: Bank[] = [
  { code: "001", name: "Access Bank", slug: "access-bank" },
  { code: "002", name: "Citibank Nigeria", slug: "citibank" },
  { code: "003", name: "First Bank Nigeria", slug: "first-bank" },
  { code: "004", name: "Guaranty Trust Bank", slug: "gtb" },
  { code: "005", name: "Zenith Bank", slug: "zenith-bank" },
  { code: "006", name: "First City Monument Bank", slug: "fcmb" },
  { code: "007", name: "Stanbic IBTC Bank", slug: "stanbic" },
  { code: "008", name: "Wema Bank", slug: "wema-bank" },
  { code: "009", name: "Union Bank Nigeria", slug: "union-bank" },
  { code: "011", name: "United Bank For Africa", slug: "uba" },
  { code: "012", name: "Ecobank Nigeria", slug: "ecobank" },
  { code: "013", name: "Heritage Bank", slug: "heritage-bank" },
  { code: "014", name: "GTCo Nigeria", slug: "gtco" },
  { code: "015", name: "Keystone Bank Nigeria", slug: "keystone-bank" },
  { code: "016", name: "Fidelity Bank", slug: "fidelity-bank" },
  { code: "017", name: "Bank of Agriculture", slug: "bank-of-agriculture" },
  { code: "018", name: "SunTrust Bank", slug: "suntrust-bank" },
  { code: "019", name: "Providus Bank", slug: "providus-bank" },
  { code: "020", name: "Titan Trust Bank", slug: "titan-trust-bank" },
  { code: "021", name: "Polaris Bank", slug: "polaris-bank" },
  { code: "025", name: "Standard Chartered Bank", slug: "standard-chartered" },
  { code: "026", name: "Globus Bank", slug: "globus-bank" },
  { code: "035", name: "Jaiz Bank", slug: "jaiz-bank" },
  { code: "037", name: "Signature Bank", slug: "signature-bank" },
  { code: "038", name: "Sterling Bank", slug: "sterling-bank" },
  { code: "039", name: "Fcmb", slug: "fcmb-alt" },
  { code: "040", name: "Eco Bank PLC", slug: "ecobank-plc" },
  { code: "044", name: "Access Bank Plc", slug: "access-bank-plc" },
  { code: "045", name: "Skye Bank", slug: "skye-bank" },
  { code: "049", name: "Afex Bank", slug: "afex-bank" },
  { code: "050", name: "Fidelity Bank PLC", slug: "fidelity-bank-plc" },
  { code: "051", name: "Ecobank Plc", slug: "ecobank-plc-2" },
  { code: "052", name: "OFI Bank", slug: "ofi-bank" },
  { code: "053", name: "Infinite Bank", slug: "infinite-bank" },
  { code: "054", name: "Imperial Homes Mortgage Bank", slug: "imperial-homes" },
  { code: "055", name: "Safehaven Mortgage Bank", slug: "safehaven" },
  { code: "056", name: "Covenant Mortgage Bank", slug: "covenant" },
  { code: "057", name: "Cornerstone Mortgage Bank", slug: "cornerstone" },
  { code: "058", name: "Umoa Bank", slug: "umoa-bank" },
  { code: "059", name: "Zenith Bank", slug: "zenith-bank-alt" },
  { code: "060", name: "Access Bank", slug: "access-bank-alt" },
  { code: "063", name: "Moniepoint", slug: "moniepoint" },
  { code: "064", name: "Sumeria Fintech", slug: "sumeria" },
  { code: "065", name: "PayAttitude Online", slug: "payattitude" },
  { code: "066", name: "ICAN", slug: "ican" },
  { code: "100", name: "Providus Bank", slug: "providus-alt" },
  { code: "108", name: "Ecobank", slug: "ecobank-alt" },
  { code: "109", name: "Zenith Bank", slug: "zenith-alt" },
  { code: "110", name: "Bank of Commerce", slug: "bank-of-commerce" },
  { code: "111", name: "All Times Bank", slug: "all-times" },
  { code: "999", name: "NIP Virtual Bank", slug: "nip-virtual" },
];

export function getBankByCode(code: string): Bank | undefined {
  return NIGERIAN_BANKS.find(b => b.code === code);
}

export function getBankByName(name: string): Bank | undefined {
  return NIGERIAN_BANKS.find(b => b.name.toLowerCase() === name.toLowerCase());
}
