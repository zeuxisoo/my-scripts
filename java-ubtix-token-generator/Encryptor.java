import java.util.Base64;
import java.security.Key;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

class Encryptor {
    public static String encryptByKey(String content, Key theKey) {
        try {
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, theKey);
            return Base64.getEncoder().encodeToString(cipher.doFinal(
                content.getBytes("UTF-8"))
            );
        }catch(Exception e) {}
        return content;
    }

    public static Key generateKey(String content) {
        try {
            byte[] contentBytes = content.getBytes("UTF-8");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                contentBytes, 0, contentBytes.length, "AES"
            );
            return secretKeySpec;
        }catch (Exception localException) {}
        return null;
    }
}
