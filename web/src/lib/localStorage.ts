const STORAGE_KEY = 'questionnaire-result';

export function saveToLocalStorage(data: any) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateLocalStorage(updates: any) {
	const existing = localStorage.getItem(STORAGE_KEY);
	if (existing) {
		const data = JSON.parse(existing);
		saveToLocalStorage({ ...data, ...updates });
	} else {
		// No existing data, just save the updates
		saveToLocalStorage(updates);
	}
}

export function getFromLocalStorage() {
	const data = localStorage.getItem(STORAGE_KEY);
	return data ? JSON.parse(data) : null;
}

export function clearLocalStorage() {
	localStorage.removeItem(STORAGE_KEY);
}
