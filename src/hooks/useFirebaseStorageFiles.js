import { useState, useEffect, useCallback } from 'react';
import { storage } from '../firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

/**
 * Hook to fetch audio files from Firebase Storage
 * Returns list of files with their download URLs
 */
export function useFirebaseStorageFiles(folder = '') {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const folderRef = ref(storage, folder);
            const result = await listAll(folderRef);

            // Get download URLs for all files
            const filePromises = result.items.map(async (item) => {
                const url = await getDownloadURL(item);
                return {
                    name: item.name,
                    fullPath: item.fullPath,
                    url: url
                };
            });

            const filesWithUrls = await Promise.all(filePromises);
            setFiles(filesWithUrls);
        } catch (err) {
            console.error('Error fetching Firebase Storage files:', err);
            setError(err.message);
            setFiles([]);
        }

        setLoading(false);
    }, [folder]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    return { files, loading, error, refresh: fetchFiles };
}

export default useFirebaseStorageFiles;
