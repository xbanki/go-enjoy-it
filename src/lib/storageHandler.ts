import * as cookieStorage from 'js-cookie';

/**
 * Name of the manifest key object that will be stored
 * in selected storage target.
 */
const manifestName = 'storageData';

/**
 * Possible types for storage targets we could use.
 */
enum UsedStorageTypes {
	local = 'localStorage',
	cookie = 'cookieStorage'
}

/**
 * Manifest object containing all relevant storage entries
 * with keys representing matching names and values assigned
 * to said keys representing which type we expect the value
 * in storage to be.
 */
interface StorageManifest {
	[key: string]: unknown;
}


/**
 * Cookie/Local storage system to store data between sessions.
 * 
 * `Note` Does not take in to account overflow, therefore is not
 * meant for use with large amount of data to be stored
 */
export default class StorageHandler {

	public constructor() {
		let usedStorage: UsedStorageTypes | undefined;
		let manifest: StorageManifest = {};

		try {
			const localStorageManifest = localStorage.getItem(manifestName);

			if (!localStorageManifest) {
				const err = Error('No manifest found in localStorage');
				throw err;
			}

			manifest = JSON.parse(localStorageManifest);
			usedStorage = UsedStorageTypes.local;

		} catch (err) {

			if (err instanceof Error && !usedStorage) {
				const cookieStorageManifest = cookieStorage.get(manifestName);

				if (!cookieStorageManifest) return;

				manifest = JSON.parse(cookieStorageManifest);
				usedStorage = UsedStorageTypes.cookie;
			}
		} finally {
			if (!usedStorage) try {
				localStorage.setItem(manifestName, JSON.stringify(manifest));

				if (!localStorage.getItem(manifestName)) {
					const err = Error('Could not create manifest in localStorage');
					throw err;
				}

				usedStorage = UsedStorageTypes.local;
			} catch (error) {
				cookieStorage.set(manifestName, JSON.stringify(manifest));

				if (!cookieStorage.get(manifestName)) {
					const err = Error('Could not create manifest in cookieStorage');
					throw err;
				}

				usedStorage = UsedStorageTypes.cookie;

				return;
			}

			/*
			 * TO-DO (xbanki)
			 * If no storage could not be set, gray storage
			 * requiring options and disable functions.
			 * 
			 * TO-DO (xbanki)
			 * Expected type is not checked anywhere. Implement
			 * a runtime type checker when getting/setting values.
			 */
		}

		this._usedStorage = usedStorage;
		this._manifest = manifest;
	}

	/**
	 * Currently assigned storage target.
	 * 
	 * Options: `localStorage`, `cookieStorage`
	 */
	private readonly _usedStorage!: UsedStorageTypes;

	/**
	 * Object map of all storage entries.
	 * 
	 * Keys represent name of key/value pairs in storage, which have the same name.
	 * 
	 * Values represent what data type key/value pair is expected.
	 */
	private readonly _manifest!: StorageManifest;

	/**
	 * Update internal manifest object with matching key name representing an entry in storage.
	 * @param   {string}        key - Matching `key` name of which entry is represented in storage
	 * @param   {unknown}      type - Type of which we expect the value of entry to be in storage
	 * @param   {boolean}  override - If `true` ignores `key` existing in manifest, overriding value
	 * @returns {Promise}             `true` if success, `Error` if key already exists in manifest
	 */
	private async _updateManifest(key: string, type?: unknown, override?: boolean): Promise<boolean> {

		return new Promise<boolean>((resolve, reject) => {
			if (key in this._manifest && !override) {
				const err = new Error(`${key} already present in manifest`);
				return reject(err);
			}

			return resolve();
		})
			.then(() => {
				this._manifest[key] = type;

				switch (this._usedStorage) {
					case UsedStorageTypes.local:
						localStorage.setItem(manifestName, JSON.stringify(this._manifest));

						break;

					case UsedStorageTypes.cookie:

						cookieStorage.set(manifestName, JSON.stringify(this._manifest));

						break;
				}

				return true;
			})
			.catch((err) => err);
	}

	/**
	 * Gets all defined keys stored in selected storage, returning an array of strings or optionally
	 * objects with values assigned to the matching storage entry.
	 * @param   {boolean=}  values - Returns `Object` instead of `Array` with values included with keys
	 * @returns {Promise}			 `Promise` that returns either `Array<string>` or `Object`
	 */
	public async getAllEntries(values?: boolean): Promise<Array<string> | StorageManifest> {

		return new Promise<Array<string> | StorageManifest>((resolve, reject) => {
			const result: Array<string> = [];

			switch (this._usedStorage) {

				case UsedStorageTypes.local:
					if (values) {
						const withValues: StorageManifest = {};

						if (this._manifest.length) {
							const err = new Error('No keys in manifest');
							return reject(err);
						}

						for (const key in this._manifest) withValues[key] = localStorage.getItem(key);

						return resolve(withValues);
					}

					if (this._manifest.length) {
						const err = new Error('No keys in manifest');
					}

					for (const key in this._manifest) result.push(key);

					return resolve(result);

				case UsedStorageTypes.cookie:
					if (values) {
						const withValues: StorageManifest = {};

						if (this._manifest.length) {
							const err = new Error('No keys in manifest');
						}

						for (const key in this._manifest) withValues[key] = cookieStorage.get(key);

						return resolve(withValues);
					}

					if (this._manifest.length) {
						const err = new Error('No keys in manifest');
					}

					for (const key in this._manifest) result.push(key);

					return resolve(result);
			}
		})
			.then((res) => res)
			.catch((err) => err);
	}

	/**
	 * Get value of given key parameter from selected storage.
	 * @param   {string}   key - Name of entry in selected storage which to fetch
	 * @returns {Promise}        Parses `json` or `Error` if entry was not found
	 */
	public async getEntry(key: string): Promise<string> {

		return new Promise<string>((resolve, reject) => {
			switch (this._usedStorage) {
				case UsedStorageTypes.local:
					if (localStorage.getItem(key)) {
						const value = localStorage.getItem(key);
						value ? resolve(JSON.parse(value)) : reject(new Error('Entry not found in localStorage'));
					}

					return reject(new Error('Entry not found in manifest'));

				case UsedStorageTypes.cookie:
					if (!cookieStorage.get(key)) {
						const value = cookieStorage.get(key);
						value ? resolve(JSON.parse(value)) : reject(new Error('Entry not found in cookieStorage'));
					}

					return reject(new Error('Entry not found in manifest'));
			}
		})
			.then((res) => res)
			.catch((err) => err);
	}

	/**
	 * Create new entry in selected storage, along with adding it to the storage manifest object.
	 * @param   {string}    key - Name for the entry which to be created
	 * @param   {any}     value - Value of entry which will be converted in to a string format
	 * @returns {Promise}		  `true` if successful, `Error` if entry already exists
	 */
	public async setEntry(key: string, value: unknown): Promise<boolean> {

		return new Promise<boolean | Error>((resolve, reject) => {
			switch (this._usedStorage) {
				case UsedStorageTypes.local:
					if (key in this._manifest || key in this._manifest && !localStorage.getItem(key)) {
						const err = new Error(`${key} already exists in ${this._usedStorage}`);

						return reject(err);
					}

					localStorage.setItem(key, JSON.stringify(value));

					return resolve(true);

				case UsedStorageTypes.cookie:
					if (key in this._manifest || key in this._manifest && !localStorage.getItem(key)) {
						const err = new Error(`${key} already exists in ${this._usedStorage}`);

						return reject(err);
					}

					cookieStorage.set(key, JSON.stringify(value));

					return resolve(true);
			}
		})
			.then(() => {
				this._updateManifest(key, typeof value)
					.then((_res) => _res)
					.catch((err) => err);

				console.log(this._manifest);

				return true;
			})
			.catch((err) => err);
	}

	/**
	 * Updates existing entry in selected storage with given value parameter.
	 * @param   {string}     key - Key name of entry which to update
	 * @param   {unknown}  value - Value of which to set key entry to
	 * @returns {promise}		   `true` if successful, `Error` if entry not found
	 */
	public async updateEntry(key: string, value: unknown): Promise<boolean> {

		return new Promise<boolean>((resolve, reject) => {
			switch (this._usedStorage) {
				case UsedStorageTypes.local:
					if (!localStorage.getItem(key) || !localStorage.getItem(key) && !this._manifest.hasOwnProperty(key)) {
						const err = new Error(`${key} does not exist in ${this._usedStorage}`);

						return reject(err);
					}

					localStorage.setItem(key, JSON.stringify(value));

					return resolve(true);

				case UsedStorageTypes.cookie:
					if (!cookieStorage.get(key) || !cookieStorage.get(key) && !this._manifest.hasOwnProperty(key)) {
						const err = new Error(`${key} does not exist in ${this._usedStorage}`);

						return reject(err);
					}

					cookieStorage.set(key, JSON.stringify(value));

					return resolve(true);
			}
		})
			.then(() => {
				this._updateManifest(key, typeof value, true)
					.then((_res) => _res)
					.catch((err) => err);

				return true;
			})
			.catch((err) => err);
	}

	/**
	 * Removes given key parameter from selected storage and storage manifest object.
	 * @param   {string}   key - Name of entry in selected storage which to remove
	 * @returns {promise}		 `true` if successful, `Error` if entry not found
	 */
	public async removeEntry(key: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			switch (this._usedStorage) {
				case UsedStorageTypes.local:
					if (!localStorage.getItem(key) || !localStorage.getItem(key) && !this._manifest.hasOwnProperty(key)) {
						const err = new Error(`${key} does not exist in ${this._usedStorage}`);
						return reject(err);
					}

					localStorage.removeItem(key);

					return resolve();

				case UsedStorageTypes.cookie:
					if (!cookieStorage.get(key) || !cookieStorage.get(key) && !this._manifest.hasOwnProperty(key)) {
						const err = new Error(`${key} does not exist in ${this._usedStorage}`);
						return reject(err);
					}

					cookieStorage.remove(key);

					return resolve();
			}
		})
			.then(() => {
				delete this._manifest[key];

				switch (this._usedStorage) {
					case UsedStorageTypes.local:
						localStorage.setItem(manifestName, JSON.stringify(this._manifest));
						break;
					case UsedStorageTypes.cookie:
						cookieStorage.set(manifestName, JSON.stringify(this._manifest));
						break;
				}

				return true;
			})
			.catch((err) => err);
	}
}
