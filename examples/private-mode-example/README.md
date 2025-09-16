# Brolostack Private Mode Example

This example demonstrates Brolostack's comprehensive private mode support across all browsers, including DuckDuckGo browser support.

## 🌐 **Features Demonstrated**

### **Private Mode Detection**
- Universal private mode detection across all browsers
- Chrome Incognito, Firefox Private Browsing, Safari Private Browsing
- Edge InPrivate, Brave Private Window, DuckDuckGo Private Mode, Opera Private Window

### **Storage Management**
- Automatic storage fallback (sessionStorage → memory)
- Private mode storage adapter
- Data export/import functionality
- Real-time storage method detection

### **DuckDuckGo Support**
- DuckDuckGo browser detection
- Enhanced privacy feature detection
- Privacy-first storage handling

### **UI Features**
- Real-time private mode status display
- Browser information display
- Storage method indicator
- Data management interface

## 🚀 **Getting Started**

### **Installation**
```bash
cd examples/private-mode-example
npm install
```

### **Development**
```bash
npm run dev
```

### **Build**
```bash
npm run build
```

## 🔒 **Testing Private Mode**

### **Chrome Incognito**
1. Open Chrome
2. Press `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
3. Navigate to `http://localhost:3006`
4. Observe private mode detection

### **Firefox Private Browsing**
1. Open Firefox
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Navigate to `http://localhost:3006`
4. Observe private mode detection

### **Safari Private Browsing**
1. Open Safari
2. Press `Cmd+Shift+N` (Mac)
3. Navigate to `http://localhost:3006`
4. Observe private mode detection

### **Edge InPrivate**
1. Open Edge
2. Press `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
3. Navigate to `http://localhost:3006`
4. Observe private mode detection

### **Brave Private Window**
1. Open Brave
2. Press `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
3. Navigate to `http://localhost:3006`
4. Observe private mode detection

### **DuckDuckGo Private Mode**
1. Open DuckDuckGo browser
2. Enable private mode
3. Navigate to `http://localhost:3006`
4. Observe DuckDuckGo detection and private mode

### **Opera Private Window**
1. Open Opera
2. Press `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
3. Navigate to `http://localhost:3006`
4. Observe private mode detection

## 📊 **What to Observe**

### **Private Mode Detection**
- Status indicator changes to 🔒 (red)
- "Private Mode Active" message
- Storage method shows "sessionStorage" or "memory"
- Limitations and recommendations displayed

### **Normal Mode**
- Status indicator shows 🌐 (green)
- "Normal Mode" message
- Storage method shows "localStorage" or "indexedDB"
- Full storage capabilities available

### **DuckDuckGo Detection**
- Special DuckDuckGo section appears
- Enhanced privacy features detected
- Privacy-first messaging

### **Storage Behavior**
- **Normal Mode**: Data persists across browser sessions
- **Private Mode**: Data persists during session only
- **Export/Import**: Works in both modes for data backup

## 🔧 **Code Examples**

### **Private Mode Detection**
```typescript
import { privateModeManager } from 'brolostack';

const info = privateModeManager.detectPrivateMode();
console.log(`Private Mode: ${info.isPrivateMode ? 'Active' : 'Not Active'}`);
```

### **Private Mode Storage**
```typescript
import { PrivateModeStorageAdapter } from 'brolostack';

const storage = new PrivateModeStorageAdapter({
  name: 'my-app',
  version: 1,
  size: 50 * 1024 * 1024
});

await storage.setItem('key', 'value');
```

### **DuckDuckGo Detection**
```typescript
import { browserCompatibility } from 'brolostack';

const report = browserCompatibility.generateReport();
if (report.browser.name === 'DuckDuckGo') {
  console.log('DuckDuckGo browser detected');
}
```

## 🛡️ **Privacy Features**

### **Data Protection**
- No tracking or analytics
- Local-only data storage
- Automatic privacy mode detection
- Respects browser privacy settings

### **Storage Security**
- sessionStorage in private mode
- Memory storage as fallback
- No cross-site data sharing
- Isolated per origin

## 📱 **Mobile Testing**

### **iOS Safari Private Mode**
1. Open Safari on iOS
2. Tap the tabs button
3. Tap "Private" at the bottom
4. Navigate to the example
5. Observe private mode detection

### **Android Chrome Incognito**
1. Open Chrome on Android
2. Tap the menu (three dots)
3. Tap "New incognito tab"
4. Navigate to the example
5. Observe private mode detection

## 🐛 **Troubleshooting**

### **Private Mode Not Detected**
- Check browser console for errors
- Ensure localStorage is actually disabled
- Try refreshing the page
- Check browser version compatibility

### **Storage Not Working**
- Check if sessionStorage is available
- Look for storage errors in console
- Verify browser permissions
- Test in different browsers

### **DuckDuckGo Not Detected**
- Ensure you're using DuckDuckGo browser
- Check user agent string
- Verify browser version
- Test privacy features

## 📚 **Additional Resources**

- [Brolostack Documentation](../../README.md)
- [Private Mode Support](../../PRIVATE_MODE_SUPPORT.md)
- [Browser Compatibility](../../BROWSER_COMPATIBILITY.md)
- [Examples Overview](../README.md)

---

**This example demonstrates Brolostack's industry-leading private mode support across all browsers, ensuring your applications work seamlessly regardless of the user's privacy settings.**
