export function authErrorMessage(error) {
  const code = error?.code || '';
  const messages = {
    'auth/invalid-credential': 'Email atau password tidak valid.',
    'auth/user-not-found': 'Akun tidak ditemukan.',
    'auth/wrong-password': 'Password tidak valid.',
    'auth/email-already-in-use': 'Email sudah digunakan.',
    'auth/weak-password': 'Gunakan password minimal 6 karakter.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/popup-closed-by-user': 'Proses masuk dengan Google dibatalkan.',
    'auth/popup-blocked': 'Popup diblokir browser. Izinkan popup lalu coba lagi.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa saat nanti.',
    'auth/network-request-failed': 'Koneksi jaringan bermasalah.'
  };
  return messages[code] || error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
}
