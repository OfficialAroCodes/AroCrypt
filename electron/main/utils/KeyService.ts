import keytar from 'keytar';

const SERVICE_NAME = 'AroCrypt';
const ACCOUNT_NAME = 'unique_key';

export default async function getKey() {
    try {
        const storedKey = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
        return storedKey;
    } catch (error) {
        return null;
    }
}

export async function saveUniqueKey(key: string): Promise<boolean> {
    try {
        await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, key);
        return true;
    } catch (error) {
        return false;
    }
}