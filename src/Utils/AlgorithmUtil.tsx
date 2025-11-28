import React from 'react';

const Available_Algorithms = [
    'AES-256-GCM',
    'AES-192-GCM',
    'AES-128-GCM',
    'AES-256-CBC',
    'AES-192-CBC',
    'AES-128-CBC',
    'AES-256-CTR',
    'AES-192-CTR',
    'AES-128-CTR',
];

const DEFAULT_ALGO = 'AES-256-GCM';

const getAlgorithm = (key: string) => {
    const raw = localStorage.getItem(key);
    if (raw && Available_Algorithms.includes(raw)) return raw;
    localStorage.setItem(key, DEFAULT_ALGO);
    return DEFAULT_ALGO;
};

export const CheckAlgorithm = () => {
    getAlgorithm('encryptionMethod');
    getAlgorithm('decryptionMethod');
};

const Algorithm: React.FC = () => {
    CheckAlgorithm();
    return null;
};

export default Algorithm;
