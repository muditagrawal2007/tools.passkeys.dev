import { AsnParser } from "@peculiar/asn1-schema";
import { Certificate } from "@peculiar/asn1-x509";

/**
 * Parse X.509 certificates into something legible
 * @param {Uint8Array<ArrayBuffer>[]} x5c
 * // Certificate[]
 * @returns {any[]}
 */
export default function x5cToStrings(x5c) {
  return x5c.map((cert) => AsnParser.parse(Buffer.from(cert), Certificate));
}
