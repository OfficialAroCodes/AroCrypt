export default async function getKeys() {
    try {
        const getKey = await window.electronAPI.getKeys();
        return getKey;
    } catch (error) {
        console.error('Failed to get user keys:', error);
    }
}