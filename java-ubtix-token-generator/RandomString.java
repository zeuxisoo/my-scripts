import java.util.Random;

public class RandomString {
    private static char[] symbols;
    private final char[] buf;
    private final Random random = new Random();

    static {
        StringBuilder temp = new StringBuilder();
        for (char ch = '0'; ch <= '9'; ++ch) temp.append(ch);
        for (char ch = 'a'; ch <= 'z'; ++ch) temp.append(ch);
        symbols = temp.toString().toCharArray();
    }

    public RandomString(int theLength) {
        if (theLength < 1) {
            throw new IllegalArgumentException(
                "length < 1: " + theLength
            );
        }else{
           buf = new char[theLength];
        }
    }

    public String nextString() {
        for (int idx = 0; idx < buf.length; ++idx)
            buf[idx] = symbols[random.nextInt(symbols.length)];
        return new String(buf);
    }

}
