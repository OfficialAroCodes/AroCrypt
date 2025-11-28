const useOpenLink = async (link: any) => {
    try {
        await window.electronAPI.openExternalLink(link);
    } catch (error) {
        console.error('Failed to open external link:', error);
    }

}

export default useOpenLink