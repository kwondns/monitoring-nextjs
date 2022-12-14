import { NextApiRequest, NextApiResponse } from 'next';
import { findOne, updateOne } from 'db';
import { Token } from 'libs';
import { ApiTypes } from 'types';

interface UserFilterType {
  userName: string;
}

interface DeviceFindFilterType {
  'information.key': string;
}

interface DeviceFindDataType {
  information: ApiTypes.DeviceDataType;
}

interface UpdateDataType {
  $addToSet: { devices: { device: string; color: string; client: string } };
  $set: { updatedAt: Date };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userName, token } = await Token.isAuth(req);
    if (userName) {
      const userFind = await findOne<UserFilterType, ApiTypes.FindAccountResponseType>('account', { userName });
      if (userFind) {
        if (token !== userFind.token.accessToken) return res.status(400).json({ message: 'AccessToken is Different!' });
      }
      if (req.method === 'POST') {
        if (req.body.address && req.body.client && req.body.key) {
          const { address, client, key } = req.body;
          const collectionName = `${address}_${client}_resource`;
          try {
            const deviceFind = await findOne<DeviceFindFilterType, DeviceFindDataType>(collectionName, {
              'information.key': key,
            });
            if (deviceFind) {
              const { client } = deviceFind.information;
              const color = Math.floor(Math.random() * 16777215).toString(16);
              try {
                const duplicatedDevice = await findOne('account', { 'devices.device': collectionName });
                if (!duplicatedDevice) {
                  try {
                    await updateOne<UserFilterType, UpdateDataType>(
                      'account',
                      { userName },
                      {
                        $addToSet: {
                          devices: {
                            device: collectionName,
                            color,
                            client,
                          },
                        },
                        $set: { updatedAt: new Date() },
                      },
                      true,
                    );
                    return res.status(200).json({ data: { device: collectionName, color, client } });
                  } catch (error) {
                    return res.status(400).json({ message: 'Update DB Failed' });
                  }
                }
                return res.status(400).json({ message: 'Already Exist' });
              } catch (error) {
                return res.status(400).json({ message: 'Search DB Failed' });
              }
            }
          } catch (error) {
            return res.status(404).json({ message: 'Not Found' });
          }
        }
      }
    }
  } catch (error) {
    return res.status(400).json({ message: 'Token Expired' });
  }
  return res.status(404).json({ message: 'Not Found' });
}
