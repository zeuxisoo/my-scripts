import com.github.kevinsawicki.http.HttpRequest;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Random;
import java.util.HashMap;
import java.util.Date;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;

class Ubx {

    String userAgent = "";

    public Ubx() {
        this.userAgent = this.getUserAgent();
    }

    public String makeAuth() throws Exception {
        HttpRequest requestAuthToken = this.doGetRequest("http://www.urbtix.hk/");

        String cookie = requestAuthToken.header("Set-Cookie");
        String location = requestAuthToken.location();

        if (location.equals("https://ticket.urbtix.hk/") != true) {
            throw new Exception("Cannot get auth token from url http://ticket.urbtix.hk");
        }

        return cookie;
    }

    public String findEventContent(String authCookie, int eventId, int perPage, int pageNo) {
        String useragent = this.userAgent;
        long timestamp   = System.currentTimeMillis() / 1000L;

        String targetUrl = "https://ticket.urbtix.hk/internet/json/event/{{EVENT_ID}}/performance/{{PER_PAGE}}/{{PAGE_NO}}/perf.json?locale=zh_TW&{{TIMESTAMP}}"
            .replace("{{EVENT_ID}}", String.valueOf(eventId))
            .replace("{{PER_PAGE}}", String.valueOf(perPage))
            .replace("{{PAGE_NO}}", String.valueOf(pageNo))
            .replace("{{TIMESTAMP}}", String.valueOf(timestamp));

        HttpRequest request = this.doGetRequest(targetUrl).header("Cookie", authCookie);

        return request.body();
    }

    public ArrayList<Performance> parseEventContent(String eventContent) {
        PerformanceObject performanceObject = new Gson().fromJson(eventContent, PerformanceObject.class);

        ArrayList<Performance> performance = performanceObject.performance;
        ArrayList<String> performanceQuotaStatus = performanceObject.performanceQuotaStatus;

        for(int i=0; i<performance.size(); i++) {
            performance.get(i).setStatus(
                performanceQuotaStatus.get(i)
            );
        }

        return performance;
    }

    private HttpRequest doGetRequest(String url) {
        String userAgent = this.userAgent;

        HttpRequest request = HttpRequest.get(url)
            .headers(new HashMap<String, String>() {{
                put("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
                put("Accept-Language", "en-US,en;q=0.8");
                put("Connection", "keep-alive");
                put("User-Agent", userAgent);
            }})
            .trustAllCerts()
            .trustAllHosts()
            .useCaches(false)
            .followRedirects(false);

        return request;
    }

    private String getUserAgent() {
        ArrayList userAgents = new ArrayList<String>(Arrays.asList(
            "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.1.6) Gecko/20091201 Firefox/3.5.6",
            "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.12 Safari/535.11",
            "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)",
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:34.0) Gecko/20100101 Firefox/34.0",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/44.0.2403.89 Chrome/44.0.2403.89 Safari/537.36",
            "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50",
            "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50",
            "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0.1) Gecko/20100101 Firefox/4.0.1",
            "Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11",
            "Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; en) Presto/2.8.131 Version/11.11",
            "Opera/9.80 (Windows NT 6.1; U; en) Presto/2.8.131 Version/11.11"
        ));

        int userAgentIndex = new Random().nextInt(userAgents.size() - 1);
        String userAgent = (String) userAgents.get(userAgentIndex);

        return userAgent;
    }

    private String timestampToDateTime(long timestamp) {
        return new SimpleDateFormat("YYYY-MM-DD HH:mm:ss").format(
            new Date(new Timestamp(timestamp).getTime())
        );
    }

    public static void main(String args[]) {
        System.out.println("Fetching...\n");

        Ubx ubx = new Ubx();

        try {
            String authCookie   = ubx.makeAuth();
            String eventContent = ubx.findEventContent(authCookie, 30437, 10, 1);

            ArrayList<Performance> eventList = ubx.parseEventContent(eventContent);

            for(Performance performance : eventList) {
                System.out.println(
                    String.format(
                        "%s => %s - %s",
                        performance.performanceName,
                        ubx.timestampToDateTime(performance.performanceDateTime),
                        performance.status
                    )
                );
            }
        }catch(Exception e) {
            System.out.println(e);
        }
    }

}
