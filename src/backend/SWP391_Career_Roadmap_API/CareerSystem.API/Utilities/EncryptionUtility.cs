using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace CareerSystem.API.Utilities
{
    public static class EncryptionUtility
    {
        // 256-bit Key (32 bytes)
        private static readonly byte[] Key = Encoding.UTF8.GetBytes("CareerSystemSecretEncryptionKey!");

        /// <summary>
        /// Mã hóa API Key bằng thuật toán AES-256
        /// </summary>
        public static string Encrypt(string plainText)
        {
            if (string.IsNullOrWhiteSpace(plainText)) return plainText;

            using var aes = Aes.Create();
            aes.Key = Key;
            aes.GenerateIV();

            using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream();
            ms.Write(aes.IV, 0, aes.IV.Length);

            using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
            using (var sw = new StreamWriter(cs))
            {
                sw.Write(plainText);
            }

            return Convert.ToBase64String(ms.ToArray());
        }

        /// <summary>
        /// Giải mã API Key (Hỗ trợ fallback nếu dữ liệu cũ chưa mã hóa)
        /// </summary>
        public static string Decrypt(string cipherText)
        {
            if (string.IsNullOrWhiteSpace(cipherText)) return cipherText;

            // Nếu key chưa mã hóa (bắt đầu bằng AIzaSy) thì trả về trực tiếp
            if (cipherText.StartsWith("AIzaSy")) return cipherText;

            try
            {
                var fullCipher = Convert.FromBase64String(cipherText);
                using var aes = Aes.Create();
                aes.Key = Key;

                var iv = new byte[aes.BlockSize / 8];
                if (fullCipher.Length < iv.Length) return cipherText;

                Array.Copy(fullCipher, 0, iv, 0, iv.Length);
                aes.IV = iv;

                using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
                using var ms = new MemoryStream(fullCipher, iv.Length, fullCipher.Length - iv.Length);
                using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
                using var sr = new StreamReader(cs);

                return sr.ReadToEnd();
            }
            catch
            {
                // Fallback nếu không giải mã được (dữ liệu cũ chưa mã hóa)
                return cipherText;
            }
        }
    }
}
