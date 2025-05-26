export default async function getCurrentKey() {
    try {
        const getKey = await window.electronAPI.getUniqueKey();
        return getKey;
    } catch (error) {
        console.error('Failed to fetch app version:', error);
    }
}