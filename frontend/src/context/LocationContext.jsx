import { useEffect, useMemo, useState } from "react";
import { LocationContext } from "./LocationContext.js";

export function LocationProvider({ children }) {
  const [city, setCity] = useState(
    () => window.localStorage.getItem("trifler-city") || "Delhi NCR",
  );

  useEffect(() => {
    window.localStorage.setItem("trifler-city", city);
  }, [city]);

  const value = useMemo(() => ({ city, setCity }), [city]);

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}