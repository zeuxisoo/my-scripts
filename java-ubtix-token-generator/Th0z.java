import java.util.Date;

class Th0z {
    public static void main(String args[]) {
        String encryptKey   = "ZsDEKRJadtBpJ9Qe";
        String targetVesion = "1.0.1";

        StringBuilder temp = new StringBuilder();
        temp.append(new RandomString(6).nextString()).append("_");
        temp.append(targetVesion).append("_");
        temp.append(Long.valueOf(new Date().getTime()));

        System.out.println("Content: " + temp.toString());
        System.out.println("Token  : " + Encryptor.encryptByKey(
            temp.toString(), Encryptor.generateKey(encryptKey)
        ));
    }
}
