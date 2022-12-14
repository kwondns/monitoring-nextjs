import styled, { css } from 'styled-components';
import { IconButton, SideBarAddContainer } from 'molecules';
import Menu from 'icons/dehaze.svg';
import Add from 'icons/add.svg';
import { CharacterIcon, Divider } from 'atoms';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { Fetch } from 'libs';
import { GlobalContext } from 'hooks';
import { ApiTypes } from 'types';

interface SideBarType {
  devices: ApiTypes.Device[];
}

interface SideBarInputType {
  address: string;
  client: string;
  key: string;
}

const Container = styled.div`
  ${({ menuTrigger }: { menuTrigger: boolean }) => {
    return css`
      width: ${menuTrigger ? '300px' : '3rem'};
    `;
  }}
  height: 100vh;
  max-width: 80%;
  background-color: #6667ab;
  transition: all 0.2s ease-in-out;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DeviceString = styled.p`
  padding-right: 10px;
  color: white;
  width: 100%;
  align-self: center;
  margin: 0;
`;
export default function SideBar(props: SideBarType): JSX.Element {
  const { devices } = props;
  const { deviceList, setDeviceList } = GlobalContext.useGlobalContext();
  const [menuTrigger, setMenuTrigger] = useState<boolean>(false);
  const [addTrigger, setAddTrigger] = useState<boolean>(false);
  const [input, setInput] = useState<SideBarInputType>({ address: '', client: '', key: '' });
  const { setSelectedDevice } = GlobalContext.useGlobalContext();

  const onClickMenu = () => {
    setMenuTrigger((prevState) => !prevState);
  };
  const onClickAdd = () => {
    if (!addTrigger) setMenuTrigger(true);
    setAddTrigger((prevState) => !prevState);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.currentTarget;
    setInput({ ...input, [name]: value });
  };

  const onSubmit = async () => {
    const result = await Fetch.fetchPost<SideBarInputType, ApiTypes.Device>('/account_device', { ...input });
    if (result.statusCode === 200) {
      toast.success('Done');
      if (result.data) setDeviceList([...deviceList, result.data]);
    } else toast.error(result.message);
  };
  const onPressEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onSubmit();
  };

  const onClickDevice = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const target = event.currentTarget.name;
    setSelectedDevice(target);
  };

  return (
    <Container menuTrigger={menuTrigger}>
      <IconButton icon={<Menu />} name="Add" onClick={onClickMenu} />
      <Divider />
      <IconButton icon={<Add />} name="Add" onClick={onClickAdd} />
      <SideBarAddContainer
        addTrigger={addTrigger}
        onChange={onChange}
        onSubmit={onSubmit}
        onPressEnter={onPressEnter}
      />
      <Divider weight="thick" />
      {devices
        ? devices.map((device) => {
            return (
              <ButtonContainer>
                <IconButton
                  key={uuidv4()}
                  icon={<CharacterIcon text={device.client} color={device.color} />}
                  name={device.device}
                  onClick={onClickDevice}
                />
                {menuTrigger ? <DeviceString>{device.client}</DeviceString> : null}
              </ButtonContainer>
            );
          })
        : null}
      <Divider />
    </Container>
  );
}
