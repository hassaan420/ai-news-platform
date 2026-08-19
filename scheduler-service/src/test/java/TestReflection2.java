import com.rometools.rome.io.XmlReader;
import java.lang.reflect.Constructor;

public class TestReflection2 {
    public static void main(String[] args) throws Exception {
        System.out.println("Constructors:");
        for (Constructor<?> c : XmlReader.class.getConstructors()) {
            System.out.println(c);
        }
    }
}
