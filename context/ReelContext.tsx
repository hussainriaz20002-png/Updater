import React, { createContext, useContext, useState } from "react";

const ReelContext = createContext<any>(null);

export const ReelProvider = ({ children }: any) => {
  const [userReels, setUserReels] = useState<any[]>([]);

  const addReel = (newReel: any) => {
    setUserReels((prev) => [newReel, ...prev]);
  };

  return (
    <ReelContext.Provider value={{ userReels, addReel }}>
      {children}
    </ReelContext.Provider>
  );
};

export const useReels = () => useContext(ReelContext);
