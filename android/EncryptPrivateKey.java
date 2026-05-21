import java.io.*;
import java.security.*;
import java.security.spec.*;
import javax.crypto.*;
import javax.crypto.spec.*;

public class EncryptPrivateKey {
    public static void main(String[] args) throws Exception {
        // Load the upload keystore
        KeyStore keystore = KeyStore.getInstance("PKCS12");
        FileInputStream fis = new FileInputStream("upload-keystore.jks");
        keystore.load(fis, "UploadKey2025!".toCharArray());
        
        // Get the private key
        PrivateKey privateKey = (PrivateKey) keystore.getKey("upload", "UploadKey2025!".toCharArray());
        
        // Read Google's public key
        FileInputStream pubKeyFile = new FileInputStream("C:\\Users\\User\\Downloads\\encryption_public_key.pem");
        String publicKeyPEM = new String(pubKeyFile.readAllBytes());
        
        // Remove PEM headers and footers
        String publicKeyBase64 = publicKeyPEM
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replaceAll("\\s", "");
        
        // Decode the public key
        byte[] publicKeyBytes = java.util.Base64.getDecoder().decode(publicKeyBase64);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PublicKey publicKey = keyFactory.generatePublic(keySpec);
        
        // Generate a random AES key
        KeyGenerator aesKeyGen = KeyGenerator.getInstance("AES");
        aesKeyGen.init(256);
        SecretKey aesKey = aesKeyGen.generateKey();
        
        // Encrypt the AES key with RSA
        Cipher rsaCipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        rsaCipher.init(Cipher.ENCRYPT_MODE, publicKey);
        byte[] encryptedAesKey = rsaCipher.doFinal(aesKey.getEncoded());
        
        // Encrypt the private key with AES
        Cipher aesCipher = Cipher.getInstance("AES/GCM/NoPadding");
        byte[] iv = new byte[12]; // GCM recommended IV size
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);
        GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
        aesCipher.init(Cipher.ENCRYPT_MODE, aesKey, gcmSpec);
        
        byte[] privateKeyBytes = privateKey.getEncoded();
        byte[] encryptedPrivateKey = aesCipher.doFinal(privateKeyBytes);
        
        // Combine: encrypted AES key + IV + encrypted private key
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        outputStream.write(encryptedAesKey);
        outputStream.write(iv);
        outputStream.write(encryptedPrivateKey);
        byte[] encryptedData = outputStream.toByteArray();
        
        // Write the encrypted private key to a file
        FileOutputStream fos = new FileOutputStream("encrypted_private_key.pem");
        fos.write("-----BEGIN ENCRYPTED PRIVATE KEY-----\n".getBytes());
        
        // Write in Base64 with line breaks
        String encryptedBase64 = java.util.Base64.getMimeEncoder(64, new byte[]{'\n'})
            .encodeToString(encryptedData);
        fos.write(encryptedBase64.getBytes());
        fos.write("\n-----END ENCRYPTED PRIVATE KEY-----\n".getBytes());
        fos.close();
        
        System.out.println("Private key encrypted successfully!");
        System.out.println("Output file: encrypted_private_key.pem");
    }
}
