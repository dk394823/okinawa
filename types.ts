

export enum ItemType {
  ACTIVITY = 'ACTIVITY',
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  HOTEL = 'HOTEL'
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  location: string;
  address?: string; // New field for navigation
  type: ItemType;
  notes?: string;
  weatherForecast?: string;
  lat?: number;
  lng?: number;
}

export interface DaySchedule {
  date: string;
  dayLabel: string;
  weekday: string;
  locationHint: string;
  items: ItineraryItem[];
  generalWeather?: string;
}

export type ItineraryState = Record<string, DaySchedule>;

export const DATES = [
  { date: '2026-03-11', dayLabel: 'Day 1', weekday: '週三' },
  { date: '2026-03-12', dayLabel: 'Day 2', weekday: '週四' },
  { date: '2026-03-13', dayLabel: 'Day 3', weekday: '週五' },
  { date: '2026-03-14', dayLabel: 'Day 4', weekday: '週六' },
  { date: '2026-03-15', dayLabel: 'Day 5', weekday: '週日' },
];

// --- Resources Types ---

export interface FlightInfo {
  date: string;
  time: string; // Departure Time
  arrivalTime?: string; // Arrival Time
  airline: string;
  flightNumber: string;
  terminal: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  note?: string;
  avatar?: string; // Base64 string
}

export interface Expense {
  id: string;
  title: string;
  amount: number; // JPY
  payer: string; // Name of person who paid
  beneficiaries: string[]; // Names of people who split this expense
  date: string;
  // New fields
  paymentMethod?: 'CASH' | 'CARD';
  timestamp?: string; // ISO string for sorting
  exchangeRate?: number; // Historical rate snapshot
}

export type ShoppingColorType = 'ocean' | 'terracotta' | 'wasabi' | 'sakura' | 'slate' | 'coral';

export interface ShoppingCategory {
  id: string;
  name: string;
  icon: string; // Icon identifier
  color: ShoppingColorType;
  customImage?: string; // Base64 string for custom uploaded icon
}

export type ConvenienceStoreType = 'SEVEN' | 'FAMILY' | 'LAWSON';

export interface ShoppingItem {
  id: string;
  name: string;
  note?: string; // Price or description
  categoryId: string;
  isBought: boolean;
  image?: string; // Base64 string for thumbnail
  targetStores?: ConvenienceStoreType[]; // Which stores sell this
}

export interface ShoppingLocation {
  id: string;
  name: string;
  address: string;
  note?: string; // Description or note
}

export interface TripData {
  appTitle: string;
  appDeclaration: string;
  flights: {
    north: { outbound: FlightInfo; inbound: FlightInfo };
    south: { outbound: FlightInfo; inbound: FlightInfo };
  };
  contacts: Contact[];
  expenses: Expense[];
  shoppingTitle: string;
  shoppingCategories: ShoppingCategory[]; 
  shoppingList: ShoppingItem[];
  shoppingLocations: ShoppingLocation[];
  shoppingLocationTitle: string; // Title for the Shopping Locations section
  exchangeRate: number; // JPY to TWD
}