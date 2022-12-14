import React, { createContext, Dispatch, SetStateAction, useContext, useMemo, useState } from 'react';
import { ApiTypes } from 'types';

interface ContextType {
  deviceList: ApiTypes.Device[];
  setDeviceList: Dispatch<SetStateAction<ApiTypes.Device[]>>;
  selectedDevice: string;
  setSelectedDevice: Dispatch<SetStateAction<string>>;
  userName: string;
  setUserName: Dispatch<SetStateAction<string>>;
  accessToken: string;
  setAccessToken: Dispatch<SetStateAction<string>>;
}
export const GlobalContext = createContext<ContextType | null>(null);

export const Context = ({ children }: { children: React.ReactNode }) => {
  const [deviceList, setDeviceList] = useState<ApiTypes.Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const contextValue = useMemo(
    () => ({
      deviceList,
      setDeviceList,
      selectedDevice,
      setSelectedDevice,
      userName,
      setUserName,
      accessToken,
      setAccessToken,
    }),
    [deviceList, setDeviceList, selectedDevice, setSelectedDevice, userName, setUserName, accessToken, setAccessToken],
  );
  return <GlobalContext.Provider value={contextValue || null}>{children}</GlobalContext.Provider>;
};

export function useGlobalContext() {
  const state = useContext(GlobalContext);
  if (!state) throw new Error('Cannot find Provider'); // 유효하지 않을땐 에러를 발생
  return state;
}
