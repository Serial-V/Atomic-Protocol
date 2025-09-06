import { v3 } from "uuid-1345";

export const uuidFrom = (value: string) => {
    return v3({ namespace: '6ba7b811-9dad-11d1-80b4-00c04fd430c8', name: value });
};

export const nextUUID = () => {
    return uuidFrom(Date.now().toString());
};

export const toBase64 = (value: string) => {
    return Buffer.from(value).toString('base64');
};