import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class WebsiteBlocker {
    // Path to hosts file (platform-dependent)
    private static final String WINDOWS_HOSTS_PATH = "C:\\Windows\\System32\\drivers\\etc\\hosts";
    private static final String UNIX_HOSTS_PATH = "/etc/hosts";
    
    // Marker for our entries in the hosts file
    private static final String START_MARKER = "# FocusMate Website Blocker - START";
    private static final String END_MARKER = "# FocusMate Website Blocker - END";
    
    // Local loopback address
    private static final String LOCALHOST = "127.0.0.1";
    
    /**
     * Determines the appropriate hosts file path based on the OS
     */
    public static String getHostsFilePath() {
        String os = System.getProperty("os.name").toLowerCase();
        
        if (os.contains("win")) {
            return WINDOWS_HOSTS_PATH;
        } else {
            return UNIX_HOSTS_PATH;
        }
    }
    
    /**
     * Blocks all websites except those in the whitelist
     */
    public static boolean blockWebsites(List<String> whitelist) {
        try {
            // Get hosts file path
            String hostsPath = getHostsFilePath();
            
            // Read current hosts file
            List<String> lines = Files.readAllLines(Paths.get(hostsPath));
            
            // Remove any existing FocusMate entries
            lines = removeExistingEntries(lines);
            
            // Add all websites to block
            lines.add(START_MARKER);
            
            // Add websites to block (all except whitelisted ones)
            // Note: In a real implementation, this would use a predefined list of common websites
            // For demonstration, we'll just add a few example websites
            List<String> commonWebsites = getCommonWebsites();
            
            for (String website : commonWebsites) {
                boolean isWhitelisted = false;
                
                for (String whitelistedSite : whitelist) {
                    if (website.contains(whitelistedSite)) {
                        isWhitelisted = true;
                        break;
                    }
                }
                
                if (!isWhitelisted) {
                    lines.add(LOCALHOST + " " + website);
                    lines.add(LOCALHOST + " www." + website);
                }
            }
            
            lines.add(END_MARKER);
            
            // Write back to hosts file
            Files.write(Paths.get(hostsPath), lines);
            
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Unblocks all websites by removing FocusMate entries from hosts file
     */
    public static boolean unblockWebsites() {
        try {
            // Get hosts file path
            String hostsPath = getHostsFilePath();
            
            // Read current hosts file
            List<String> lines = Files.readAllLines(Paths.get(hostsPath));
            
            // Remove any existing FocusMate entries
            lines = removeExistingEntries(lines);
            
            // Write back to hosts file
            Files.write(Paths.get(hostsPath), lines);
            
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Removes existing FocusMate entries from the hosts file content
     */
    private static List<String> removeExistingEntries(List<String> lines) {
        List<String> newLines = new ArrayList<>();
        boolean inFocusMateSection = false;
        
        for (String line : lines) {
            if (line.trim().equals(START_MARKER)) {
                inFocusMateSection = true;
                continue;
            }
            
            if (line.trim().equals(END_MARKER)) {
                inFocusMateSection = false;
                continue;
            }
            
            if (!inFocusMateSection) {
                newLines.add(line);
            }
        }
        
        return newLines;
    }
    
    /**
     * Returns a list of common websites to block
     * In a real implementation, this could be a much larger list
     */
    private static List<String> getCommonWebsites() {
        List<String> websites = new ArrayList<>();
        
        // Social media
        websites.add("facebook.com");
        websites.add("twitter.com");
        websites.add("instagram.com");
        websites.add("reddit.com");
        websites.add("tiktok.com");
        
        // Entertainment
        websites.add("youtube.com");
        websites.add("netflix.com");
        websites.add("twitch.tv");
        websites.add("hulu.com");
        
        // News
        websites.add("cnn.com");
        websites.add("bbc.com");
        websites.add("nytimes.com");
        
        return websites;
    }
    
    /**
     * Main method for testing the WebsiteBlocker
     */
    public static void main(String[] args) {
        // Example whitelist
        List<String> whitelist = new ArrayList<>();
        whitelist.add("google.com");
        whitelist.add("github.com");
        
        // Block all websites except those in whitelist
        boolean success = blockWebsites(whitelist);
        
        if (success) {
            System.out.println("Websites blocked successfully!");
        } else {
            System.out.println("Failed to block websites. Make sure you have permission to modify the hosts file.");
        }
        
        // To unblock all websites, uncomment the following line:
        // unblockWebsites();
    }
}
