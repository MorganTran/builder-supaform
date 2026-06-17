import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, signInAnonymously, type User } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, list, type ListOptions, type ListResult, type StorageReference, getBytes } from "firebase/storage";
import { type FileContent } from "./types/Form.ts"

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const storage = getStorage(app);

export const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_APPCHECK_RECAPTCHAV3PROVIDER),
    isTokenAutoRefreshEnabled: true
});

export const loginAnonymously = async (): Promise<User | null> => {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log("Logged in anonymously with UID:", user.uid);
    return user;
}

export const uploadFileJson = async (jsonString: string, fileName: string) => {
    try {
        const blob = new Blob([jsonString], { type: "application/json" });
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, blob);

    } catch (err) {
        console.error(err);
    }
};

export const fetchJsonFromStorage = async (fileName: string) => {
    try {
        const fileRef = ref(storage, fileName);

        const url = await getDownloadURL(fileRef);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch JSON file: ${response.statusText}`);
        }

        const jsonData = await response.json();
        return jsonData
    } catch {
        return null;
    }
};

export const listFilesWithPagination = async (
    folderPath: string,
    pageSize: number = 100
): Promise<string[]> => {
    try {
        const folderRef = ref(storage, folderPath);
        const allFiles: string[] = [];
        let pageToken: string | undefined;

        do {
            const options: ListOptions = {
                maxResults: pageSize,
                pageToken
            };

            const result: ListResult = await list(folderRef, options);

            result.items.forEach(itemRef => {
                allFiles.push(itemRef.name);
            });

            pageToken = result.nextPageToken;
        } while (pageToken);

        console.log('All files:', allFiles);
        return allFiles;
    } catch (error) {
        console.error('Error listing files:', error);
        throw error;
    }
}

export const listFilesAndGetContentWithPagination = async (
    folderPath: string,
    pageSize: number = 100
): Promise<FileContent[]> => {
    try {
        const folderRef = ref(storage, folderPath);
        const allFileContents: FileContent[] = [];
        let pageToken: string | undefined;
        let pageNumber = 1;

        do {
            console.log(`Fetching page ${pageNumber}...`);

            const options: ListOptions = {
                maxResults: pageSize,
                pageToken
            };

            const result: ListResult = await list(folderRef, options);

            const pageFileContents: FileContent[] = await Promise.all(
                result.items.map(async (itemRef: StorageReference) => {
                    const bytes = await getBytes(itemRef);
                    const textContent = new TextDecoder().decode(bytes);

                    try {
                        return {
                            name: itemRef.name,
                            fullPath: itemRef.fullPath,
                            content: JSON.parse(textContent)
                        };
                    } catch {
                        return {
                            name: itemRef.name,
                            fullPath: itemRef.fullPath,
                            content: null
                        };
                    }
                })
            );

            allFileContents.push(...pageFileContents);
            pageToken = result.nextPageToken;
            pageNumber++;

        } while (pageToken);

        console.log(`Total files retrieved: ${allFileContents.length}`);
        return allFileContents;
    } catch (error) {
        console.error('Error listing and reading files with pagination:', error);
        throw error;
    }
}