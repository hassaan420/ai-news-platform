import org.testcontainers.DockerClientFactory;
import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.model.Info;

public class TestProbe {
    public static void main(String[] args) {
        try {
            System.out.println("Initializing DockerClientFactory...");
            DockerClient client = DockerClientFactory.instance().client();
            System.out.println("Client initialized.");
            System.out.println("Executing infoCmd()...");
            Info info = client.infoCmd().exec();
            System.out.println("Success! Docker Server Version: " + info.getServerVersion());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
