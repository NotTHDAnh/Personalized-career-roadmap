using System;
using System.Security.Cryptography;
using System.Text;

namespace CareerSystem.API.Utilities
{
    public static class PassHashValidation
    {
        // PBKDF2 settings
        private const int SaltSize = 16; // 128 bit
        private const int HashSize = 32; // 256 bit
        private const int Iterations = 100_000;

        // Format: {iterations}.{saltBase64}.{hashBase64}
        public static string HashPassword(string password)
        {
            if (password is null) throw new ArgumentNullException(nameof(password));

            byte[] salt = new byte[SaltSize];
            RandomNumberGenerator.Fill(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
            byte[] hash = pbkdf2.GetBytes(HashSize);

            string saltB64 = Convert.ToBase64String(salt);
            string hashB64 = Convert.ToBase64String(hash);

            return $"{Iterations}.{saltB64}.{hashB64}";
        }

        public static bool VerifyPassword(string password, string storedHash)
        {
            if (password is null) throw new ArgumentNullException(nameof(password));
            if (storedHash is null) throw new ArgumentNullException(nameof(storedHash));

            // expected format: iterations.salt.hash
            var parts = storedHash.Split('.');
            if (parts.Length != 3) return false;

            if (!int.TryParse(parts[0], out int iterations)) return false;

            byte[] salt;
            byte[] hash;
            try
            {
                salt = Convert.FromBase64String(parts[1]);
                hash = Convert.FromBase64String(parts[2]);
            }
            catch
            {
                return false;
            }

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
            byte[] computed = pbkdf2.GetBytes(hash.Length);

            return FixedTimeEquals(computed, hash);
        }

        private static bool FixedTimeEquals(byte[] a, byte[] b)
        {
            if (a == null || b == null) return false;
            if (a.Length != b.Length) return false;

            int diff = 0;
            for (int i = 0; i < a.Length; i++)
            {
                diff |= a[i] ^ b[i];
            }
            return diff == 0;
        }
    }
}
