import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;

class PerformanceObject {

    @SerializedName("performanceList")
    ArrayList<Performance> performance;

    @SerializedName("performanceQuotaStatusList")
    ArrayList<String> performanceQuotaStatus;

}
