/**
 * Generates a random valid CPF (Brazilian individual taxpayer ID)
 */
export function generateCPF(): string {
  const randomDigits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

  const digit1 = calculateCPFDigit(randomDigits, 10);
  const digit2 = calculateCPFDigit([...randomDigits, digit1], 11);

  return [...randomDigits, digit1, digit2].join('');
}

function calculateCPFDigit(digits: number[], factor: number): number {
  const sum = digits.reduce((acc, digit, index) => {
    return acc + digit * (factor - index);
  }, 0);

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Generates a random valid CNPJ (Brazilian company taxpayer ID)
 */
export function generateCNPJ(): string {
  const randomDigits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));

  const digit1 = calculateCNPJDigit(randomDigits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = calculateCNPJDigit([...randomDigits, digit1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return [...randomDigits, digit1, digit2].join('');
}

function calculateCNPJDigit(digits: number[], weights: number[]): number {
  const sum = digits.reduce((acc, digit, index) => {
    return acc + digit * weights[index];
  }, 0);

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Generates a random Brazilian license plate (old format)
 */
export function generateLicensePlate(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const plate =
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)] +
    Math.floor(Math.random() * 10) +
    Math.floor(Math.random() * 10) +
    Math.floor(Math.random() * 10) +
    Math.floor(Math.random() * 10);
  return plate;
}

/**
 * Generates a random VIN (Vehicle Identification Number)
 */
export function generateVIN(): string {
  const chars = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  return vin;
}

/**
 * Generates test customer data
 */
export function generateCustomerData(type: 'individual' | 'company' = 'individual') {
  const timestamp = Date.now();

  if (type === 'individual') {
    return {
      document: generateCPF(),
      name: `Test Customer ${timestamp}`,
      email: `customer.${timestamp}@example.com`,
      phone: `11${Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, '0')}`,
    };
  } else {
    return {
      document: generateCNPJ(),
      name: `Test Company ${timestamp}`,
      email: `company.${timestamp}@example.com`,
      phone: `11${Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, '0')}`,
    };
  }
}

/**
 * Generates test vehicle data
 */
export function generateVehicleData(customerId?: string) {
  const timestamp = Date.now();
  const currentYear = new Date().getFullYear();

  return {
    customerId: customerId || '',
    licensePlate: generateLicensePlate(),
    brand: 'Toyota',
    model: `Test Model ${timestamp}`,
    year: currentYear - Math.floor(Math.random() * 10),
  };
}

/**
 * Generates test service data
 */
export function generateServiceData() {
  const timestamp = Date.now();

  return {
    name: `Test Service ${timestamp}`,
    description: `Test service description ${timestamp}`,
    price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
  };
}

/**
 * Generates test part/supply data
 */
export function generatePartData() {
  const timestamp = Date.now();

  return {
    name: `Test Part ${timestamp}`,
    description: `Test part description ${timestamp}`,
    price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
    inStock: Math.floor(Math.random() * 100) + 1,
  };
}

/**
 * Generates test work order data
 */
export function generateWorkOrderData(
  customerId: string,
  vehicleId: string,
  serviceIds: string[],
  partAndSupplyIds: string[],
  status:
    | 'RECEIVED'
    | 'IN_DIAGNOSIS'
    | 'WAITING_APPROVAL'
    | 'APPROVED'
    | 'IN_EXECUTION'
    | 'FINISHED'
    | 'DELIVERED'
    | 'CANCELED'
) {
  return {
    customerId,
    vehicleId,
    serviceIds,
    partAndSupplyIds,
    status,
  };
}

/**
 * Generates test user data
 */
export function generateUserData() {
  const timestamp = Date.now();

  return {
    name: `Test User ${timestamp}`,
    email: `user.${timestamp}@example.com`,
    password: 'Test@1234',
  };
}
