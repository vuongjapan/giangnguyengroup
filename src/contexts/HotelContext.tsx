import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HotelSession {
  hotelId: string;
  hotelName: string;
  discountPercent: number;
  roomNumber?: string;
  guestName?: string;
}

interface HotelContextType {
  hotelSession: HotelSession | null;
  setHotelSession: (session: HotelSession | null) => void;
  clearHotelSession: () => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export function HotelProvider({ children }: { children: ReactNode }) {
  const [hotelSession, setHotelSessionState] = useState<HotelSession | null>(() => {
    try {
      const saved = sessionStorage.getItem('hotel_session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (hotelSession) {
      sessionStorage.setItem('hotel_session', JSON.stringify(hotelSession));
    } else {
      sessionStorage.removeItem('hotel_session');
    }
  }, [hotelSession]);

  const setHotelSession = (session: HotelSession | null) => setHotelSessionState(session);
  const clearHotelSession = () => setHotelSessionState(null);

  return (
    <HotelContext.Provider value={{ hotelSession, setHotelSession, clearHotelSession }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used within HotelProvider');
  return ctx;
}
