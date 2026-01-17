import { decodeCBOR } from 'tiny-cbor';

/**
 * Convert response.attestationObject to a dev-friendly format
 *
 * @param {string} base64urlString
 * @returns {{
 *   fmt: "fido-u2f" | "packed" | "android-safetynet" | "android-key" | "tpm" | "none";
 *   attStmt: AttestationStatement;
 *   authData: ArrayBuffer;
 * }}
 */
export function decodeAttestationObject(base64urlString) {
  return decodeCBOR(base64urlString, 'base64');
}

/**
 * @typedef AttestationStatement
 * @type {object}
 * @property {Uint8Array<ArrayBuffer>?} sig
 * @property {number?} alg
 * @property {Uint8Array<ArrayBuffer>[]?} x5c
 * @property {Uint8Array<ArrayBuffer>?} response
 * @property {string?} ver
 * @property {Uint8Array<ArrayBuffer>?} certInfo
 * @property {Uint8Array<ArrayBuffer>?} pubArea
 */
