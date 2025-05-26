const useOpenLink = async (link: any) => {
    try {
        await window.electronAPI.openExternalLink(link);
    } catch (error) {
        console.error('Failed to fetch app version:', error);
    }

}

export default useOpenLink