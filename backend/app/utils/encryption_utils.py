import struct
import math

class EncryptionUtils:
    S_MD5 = [7, 12, 17, 22] * 4 + [5, 9, 14, 20] * 4 + [4, 11, 16, 23] * 4 + [6, 10, 15, 21] * 4
    K_MD5 = [int(abs(math.sin(i + 1)) * 2**32) & 0xFFFFFFFF for i in range(64)]

    @staticmethod
    def _left_rotate(val, shift, w):
        shift = shift & (w - 1)
        return ((val << shift) | (val >> (w - shift))) & ((1 << w) - 1)

    @staticmethod
    def _right_rotate(val, shift, w):
        shift = shift & (w - 1)
        return ((val >> shift) | (val << (w - shift))) & ((1 << w) - 1)

    @staticmethod
    def MD5(message_str: str) -> str:
        a0, b0, c0, d0 = 0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476
        message = bytearray(message_str.encode('utf-8'))
        orig_len = (8 * len(message)) & 0xffffffffffffffff
        message.append(0x80)
        while len(message) % 64 != 56: message.append(0x00)
        message += struct.pack('<Q', orig_len)
        for i in range(0, len(message), 64):
            X = struct.unpack('<16I', message[i:i+64])
            a, b, c, d = a0, b0, c0, d0
            for j in range(64):
                if j <= 15: f, g = (b & c) | ((~b) & d), j
                elif j <= 31: f, g = (d & b) | ((~d) & c), (5 * j + 1) % 16
                elif j <= 47: f, g = b ^ c ^ d, (3 * j + 5) % 16
                else: f, g = c ^ (b | (~d)), (7 * j) % 16
                temp = (a + f + EncryptionUtils.K_MD5[j] + X[g]) & 0xFFFFFFFF
                a, d, c = d, c, b
                b = (b + EncryptionUtils._left_rotate(temp, EncryptionUtils.S_MD5[j], 32)) & 0xFFFFFFFF
            a0, b0, c0, d0 = (a0+a)&0xFFFFFFFF, (b0+b)&0xFFFFFFFF, (c0+c)&0xFFFFFFFF, (d0+d)&0xFFFFFFFF
        return "".join(format(x, '02x') for x in struct.unpack('<16B', struct.pack('<4I', a0, b0, c0, d0)))

    @staticmethod
    def MD5_bytes(message: bytes) -> str:
        a0, b0, c0, d0 = 0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476
        message = bytearray(message)
        orig_len = (8 * len(message)) & 0xffffffffffffffff
        message.append(0x80)
        while len(message) % 64 != 56: message.append(0x00)
        message += struct.pack('<Q', orig_len)
        for i in range(0, len(message), 64):
            X = struct.unpack('<16I', message[i:i+64])
            a, b, c, d = a0, b0, c0, d0
            for j in range(64):
                if j <= 15: f, g = (b & c) | ((~b) & d), j
                elif j <= 31: f, g = (d & b) | ((~d) & c), (5 * j + 1) % 16
                elif j <= 47: f, g = b ^ c ^ d, (3 * j + 5) % 16
                else: f, g = c ^ (b | (~d)), (7 * j) % 16
                temp = (a + f + EncryptionUtils.K_MD5[j] + X[g]) & 0xFFFFFFFF
                a, d, c = d, c, b
                b = (b + EncryptionUtils._left_rotate(temp, EncryptionUtils.S_MD5[j], 32)) & 0xFFFFFFFF
            a0, b0, c0, d0 = (a0+a)&0xFFFFFFFF, (b0+b)&0xFFFFFFFF, (c0+c)&0xFFFFFFFF, (d0+d)&0xFFFFFFFF
        return "".join(format(x, '02x') for x in struct.unpack('<16B', struct.pack('<4I', a0, b0, c0, d0)))

    @staticmethod
    def rc5_key_expansion(key, w, r):
        P = 0xB7E15163
        Q = 0x9E3779B9
        u = w // 8
        c = max(1, len(key) // u)
        L = [int.from_bytes(key[i*u:(i+1)*u], 'little') for i in range(c)]
        t = 2 * (r + 1)
        S = [0] * t
        S[0] = P
        mask = (1 << w) - 1
        for i in range(1, t):
            S[i] = (S[i-1] + Q) & mask
        i = j = A = B = 0
        for _ in range(3 * max(c, t)):
            A = S[i] = EncryptionUtils._left_rotate((S[i] + A + B) & mask, 3, w)
            B = L[j] = EncryptionUtils._left_rotate((L[j] + A + B) & mask, (A + B), w)
            i = (i + 1) % t
            j = (j + 1) % c
        return S

    @staticmethod
    def rc5_encrypt_block(data, S, w, r):
        u = w // 8
        mask = (1 << w) - 1
        A = int.from_bytes(data[:u], 'little')
        B = int.from_bytes(data[u:], 'little')
        A = (A + S[0]) & mask
        B = (B + S[1]) & mask
        for i in range(1, r + 1):
            A = (EncryptionUtils._left_rotate(A ^ B, B, w) + S[2*i]) & mask
            B = (EncryptionUtils._left_rotate(B ^ A, A, w) + S[2*i+1]) & mask
        return A.to_bytes(u, 'little') + B.to_bytes(u, 'little')

    @staticmethod
    def rc5_decrypt_block(data, S, w, r):
        u = w // 8
        mask = (1 << w) - 1
        A = int.from_bytes(data[:u], 'little')
        B = int.from_bytes(data[u:], 'little')
        for i in range(r, 0, -1):
            B = EncryptionUtils._right_rotate((B - S[2*i+1]) & mask, A, w) ^ A
            A = EncryptionUtils._right_rotate((A - S[2*i]) & mask, B, w) ^ B
        B = (B - S[1]) & mask
        A = (A - S[0]) & mask
        return A.to_bytes(u, 'little') + B.to_bytes(u, 'little')

class PRNG:
    def __init__(self, seed=31):
        self.m, self.a, self.c = 2**31 - 1, 16807, 17711
        self.current = seed
    def next_byte(self):
        self.current = (self.a * self.current + self.c) % self.m
        return self.current % 256