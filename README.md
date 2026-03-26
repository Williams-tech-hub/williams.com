# WiFi Data Bundle Storage Application

A web-based application that allows users to store up to 5GB of WiFi data bundles for offline use and future browsing.

## Features

- **WiFi Connection Simulation**: Connect to WiFi and automatically capture data bundles
- **5GB Storage Capacity**: Store up to 5 gigabytes of data using browser's IndexedDB
- **30-Minute Connection Timer**: Automatic data capture during WiFi connection (up to 30 minutes)
- **Real-time Storage Monitoring**: Visual progress bar and detailed storage statistics
- **Data Bundle Management**: View, use, and delete individual data bundles
- **Activity Logging**: Track all system activities and operations
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

### Data Storage Technology
The application uses **IndexedDB**, a powerful browser-based storage system that can handle large amounts of data (up to 5GB or more, depending on browser and device).

### WiFi Connection Process
1. Click "Connect to WiFi" to start capturing data
2. The system simulates a WiFi connection and begins capturing data bundles
3. Connection can last up to 30 minutes maximum
4. Data is automatically saved when you disconnect or reach the time limit

### Using Stored Data
- Stored bundles can be viewed in the "Stored Data Bundles" section
- Click "Use This Bundle" to activate a specific bundle for browsing
- The "Use Stored Bundle" button activates the most recent bundle

## Getting Started

### Installation
1. Clone this repository or download the files
2. No build process required - this is a pure HTML/CSS/JavaScript application

### Running the Application
Simply open `index.html` in a modern web browser:

```bash
# Option 1: Double-click index.html in your file explorer

# Option 2: Open from command line
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux

# Option 3: Use a local server (recommended for development)
python -m http.server 8000
# Then visit http://localhost:8000
```

### Browser Compatibility
- Chrome/Edge 24+
- Firefox 16+
- Safari 10+
- Opera 15+

All modern browsers support IndexedDB for data storage.

## Usage Guide

### Capturing Data from WiFi
1. Click the **"Connect to WiFi"** button
2. Wait for the connection to establish (simulated with 2-second delay)
3. Data capture begins automatically
4. Monitor the captured data amount in the "Connection Info" section
5. Click **"Disconnect from WiFi"** when done, or wait for the 30-minute limit

### Simulating Data Collection
For testing purposes, click **"Simulate Data Collection (100MB)"** to instantly create a 100MB data bundle without connecting to WiFi.

### Managing Storage
- View all stored bundles in the "Stored Data Bundles" section
- Each bundle shows its size, source, and creation time
- Delete individual bundles using the "Delete" button
- Clear all data using the **"Clear All Data"** button

### Using Stored Data
1. Ensure you have at least one stored bundle
2. Click **"Use Stored Bundle"** to activate the most recent bundle
3. Or click **"Use This Bundle"** on a specific bundle to activate it

## Technical Details

### Storage Architecture
- **Database**: IndexedDB (`WiFiDataBundleDB`)
- **Object Store**: `dataBundles`
- **Maximum Capacity**: 5GB (5,368,709,120 bytes)
- **Data Structure**: Each bundle includes:
  - Unique ID (auto-incremented)
  - Name and timestamp
  - Size in bytes
  - Source (WiFi or Simulated)
  - Binary data (ArrayBuffer)

### Data Capture Simulation
- Captures 1-10 MB per second during WiFi connection
- Automatically stops when storage limit is reached
- Saves all captured data when disconnecting

### Storage Limits
The application enforces the 5GB limit and will:
- Prevent new bundles if storage is full
- Stop data capture when limit is reached
- Display warnings in the activity log

## Project Structure

```
williams.com/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── app.js             # JavaScript application logic
├── README.md          # This file
├── LICENSE            # Project license
└── .gitignore         # Git ignore rules
```

## Security & Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Data persists until manually deleted or browser storage is cleared
- Uses browser's built-in IndexedDB security features

## Limitations

- This is a simulation/demonstration application
- Actual WiFi data capture would require different technologies (service workers, caching APIs)
- Real-world implementation would need backend support for actual data storage
- Browser storage limits may vary by device and available disk space

## Future Enhancements

Potential improvements for production use:
- Service Worker integration for actual offline caching
- Backend API for data synchronization
- Data compression to maximize storage efficiency
- Bandwidth monitoring and actual network data capture
- Export/import functionality for data bundles
- Data encryption for security
- Progressive Web App (PWA) features

## Troubleshooting

### Storage Not Working
- Ensure your browser supports IndexedDB
- Check browser privacy settings (some privacy modes disable storage)
- Verify available disk space on your device

### Connection Issues
- This is a simulated connection, no actual WiFi is required
- If buttons are unresponsive, check browser console for errors

### Data Not Persisting
- Check if your browser is in private/incognito mode
- Verify that cookies and site data are not being cleared automatically

## Development

To modify or extend the application:

1. **HTML** (`index.html`): Update structure and layout
2. **CSS** (`styles.css`): Modify styling and responsive behavior
3. **JavaScript** (`app.js`): Enhance functionality and add features

No build tools or dependencies are required.

## License

See the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions, please open an issue in the repository.

---

**Built with ❤️ for efficient data management**
