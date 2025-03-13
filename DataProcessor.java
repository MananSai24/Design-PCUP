import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class DataProcessor {
    // Path to data directory
    private static final String DATA_DIR = "data";
    private static final String ANALYTICS_FILE = "analytics.json";
    
    /**
     * Updates the analytics data with the focus time for today
     */
    public static boolean updateAnalytics(int focusMinutes) {
        try {
            // Create data directory if it doesn't exist
            File dataDir = new File(DATA_DIR);
            if (!dataDir.exists()) {
                dataDir.mkdir();
            }
            
            String analyticsFilePath = DATA_DIR + File.separator + ANALYTICS_FILE;
            File analyticsFile = new File(analyticsFilePath);
            
            // Initialize with empty data if the file doesn't exist
            if (!analyticsFile.exists()) {
                Map<String, Integer> initialData = new HashMap<>();
                initialData.put("Mon", 0);
                initialData.put("Tue", 0);
                initialData.put("Wed", 0);
                initialData.put("Thu", 0);
                initialData.put("Fri", 0);
                initialData.put("Sat", 0);
                initialData.put("Sun", 0);
                
                writeAnalyticsToFile(initialData, analyticsFilePath);
            }
            
            // Read existing analytics data
            Map<String, Integer> analyticsData = readAnalyticsFromFile(analyticsFilePath);
            
            // Get current day abbreviation (Mon, Tue, etc.)
            LocalDate today = LocalDate.now();
            DayOfWeek dayOfWeek = today.getDayOfWeek();
            String dayAbbr = dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            
            // Update analytics for today
            int currentMinutes = analyticsData.getOrDefault(dayAbbr, 0);
            analyticsData.put(dayAbbr, currentMinutes + focusMinutes);
            
            // Write updated data back to file
            writeAnalyticsToFile(analyticsData, analyticsFilePath);
            
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Reads analytics data from file
     */
    @SuppressWarnings("unchecked")
    private static Map<String, Integer> readAnalyticsFromFile(String filePath) throws IOException, ParseException {
        Map<String, Integer> analyticsData = new HashMap<>();
        
        JSONParser parser = new JSONParser();
        Object obj = parser.parse(new FileReader(filePath));
        JSONObject jsonObject = (JSONObject) obj;
        
        for (Object key : jsonObject.keySet()) {
            String dayKey = (String) key;
            long minutes = (long) jsonObject.get(dayKey);
            analyticsData.put(dayKey, (int) minutes);
        }
        
        return analyticsData;
    }
    
    /**
     * Writes analytics data to file
     */
    @SuppressWarnings("unchecked")
    private static void writeAnalyticsToFile(Map<String, Integer> analyticsData, String filePath) throws IOException {
        JSONObject jsonObject = new JSONObject();
        
        for (Map.Entry<String, Integer> entry : analyticsData.entrySet()) {
            jsonObject.put(entry.getKey(), entry.getValue());
        }
        
        try (FileWriter file = new FileWriter(filePath)) {
            file.write(jsonObject.toJSONString());
            file.flush();
        }
    }
    
    /**
     * Gets the total focus time for the week
     */
    public static int getWeeklyFocusTime(String analyticsFilePath) {
        try {
            Map<String, Integer> analyticsData = readAnalyticsFromFile(analyticsFilePath);
            
            int totalMinutes = 0;
            for (int minutes : analyticsData.values()) {
                totalMinutes += minutes;
            }
            
            return totalMinutes;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
    
    /**
     * Gets the average daily focus time
     */
    public static double getAverageDailyFocusTime(String analyticsFilePath) {
        try {
            Map<String, Integer> analyticsData = readAnalyticsFromFile(analyticsFilePath);
            
            int totalMinutes = 0;
            int daysWithFocus = 0;
            
            for (int minutes : analyticsData.values()) {
                totalMinutes += minutes;
                if (minutes > 0) {
                    daysWithFocus++;
                }
            }
            
            if (daysWithFocus == 0) {
                return 0;
            }
            
            return (double) totalMinutes / daysWithFocus;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
    
    /**
     * Main method for testing the DataProcessor
     */
    public static void main(String[] args) {
        // Update analytics with 30 minutes of focus time
        boolean success = updateAnalytics(30);
        
        if (success) {
            System.out.println("Analytics updated successfully!");
            
            // Get and print weekly focus time
            String analyticsFilePath = DATA_DIR + File.separator + ANALYTICS_FILE;
            int weeklyFocusTime = getWeeklyFocusTime(analyticsFilePath);
            System.out.println("Weekly focus time: " + weeklyFocusTime + " minutes");
            
            // Get and print average daily focus time
            double avgDailyFocusTime = getAverageDailyFocusTime(analyticsFilePath);
            System.out.println("Average daily focus time: " + avgDailyFocusTime + " minutes");
        } else {
            System.out.println("Failed to update analytics.");
        }
    }
}
