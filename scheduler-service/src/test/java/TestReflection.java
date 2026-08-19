import com.rometools.rome.io.SyndFeedInput;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;

public class TestReflection {
    public static void main(String[] args) throws Exception {
        System.out.println("Constructors:");
        for (Constructor<?> c : SyndFeedInput.class.getConstructors()) {
            System.out.println(c);
        }
        System.out.println("Methods:");
        for (Method m : SyndFeedInput.class.getMethods()) {
            if (m.getName().toLowerCase().contains("heal") || m.getName().toLowerCase().contains("lenient") || m.getName().toLowerCase().contains("strict")) {
                System.out.println(m);
            }
        }
    }
}
