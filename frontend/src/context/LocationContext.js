import { createContext, useContext } from "react";

export const cities = [
  "Delhi NCR",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Jaipur",
  "Ahmedabad",
  "Vadodara",
  "Chandigarh",
  "Kolkata",
  "Pune",
  "Indore",
];

export const LocationContext = createContext(null);

export function useLocationPreference() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error(
      "useLocationPreference must be used within a LocationProvider.",
    );
  }
  return context;
}
