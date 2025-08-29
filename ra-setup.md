# Free Viewing Task - Instructions

## 📋 **Setup**

To add you to the notification system, please provide:

### **Your Telegram Chat ID**

1. **Install Telegram** on your phone or computer
2. **Message this bot:** `@userinfobot`
3. **Copy your Chat ID**
4. **Send me your Chat ID** along with your preferred name

**Example**

```
- Name: Sarah
- Chat ID: 123456789
```

### **That's it!**

Once I add your Chat ID, you'll automatically receive notifications when participants complete experiments.

---

## 🔔 **What You'll Receive (Notifications)**

Every time a participant completes an experiment, you'll get a Telegram message like:

```
🔬 Experiment Completed

👤 Participant: p105
📧 Email: participant@email.com
📋 Session: 001
📅 Date: 28/8/2025
⏰ Time: 3:45 PM
🆔 Session ID: EXP_20250828_p105_s001
✅ Status: completed

🔗 View Dashboard: https://nus-cts-lab.github.io/free-viewing-remote/
```

**Notification includes:**

- Participant ID and email
- Session number and completion time
- Unique session ID for easy identification
- Link to access data

---

## 🖥️ **Using the Admin Dashboard**

### **Accessing the Dashboard**

1. Click on the notification link
2. Select **"Admin"**
3. Enter password: `free2025viewing@cts`

### **Dashboard Features**

- **View all sessions** - See participant data, completion status
- **Filter by session** - Search for specific sessions (case sensitive)
- **Download data** - Get all files for a participant
- **Delete sessions** - Remove data after download

### **Data Download**

Each download includes:

- **Trial data** (CSV) - Response times, image categories, outcomes
- **Mouse data** (CSV) - X/Y coordinates, timestamps, movement patterns
- **Participant info** (CSV) - ID, email, session details
- **Heatmaps** (ZIP) - Visual attention pattern images

**File Format:** All data is packaged as a single ZIP file named `EXP_DATE_ParticipantID_SessionNumber_data.zip` (e.g., `EXP_20250828_p105_s001_data.zip`)

**⚠️ VERY Important:** Each participant should have a **unique combination** of Participant ID and Session Number. If you need to reuse the same ID/session combination, ensure you have **downloaded and deleted** the previous participant's data first to avoid data conflicts.

---

## ⚠️ **Important: Data Management**

### **Please Download & Delete Regularly**

We're using a free database (Supabase) tier with limited storage. To avoid hitting limits:

1. **Download data promptly** when you receive notifications
2. **Delete data after downloading** using the dashboard
3. **Store downloaded files locally** for analysis

Note: The delete button permanently removes that participant's entire session (all files + database record).

### **Recommended Workflow**

1. ✅ Get notification → Download data when available
2. ✅ Save files to your research folder
3. ✅ Delete from dashboard
4. ✅ Analyze your local files

---

## 👥 **For Participants**

### **Sharing the Experiment Link**

Send participants this link: https://nus-cts-lab.github.io/free-viewing-remote/

### **Participant Instructions**

1. Click **"Participant"**
2. Enter their **Participant ID**, **email**, and **session number**
3. Complete **20 image viewing trials**
4. Data automatically uploads to database
5. Only close browser when "Data Saved Successfully" screen appears

### **What Participants Need**

- **Computer/laptop** with modern browser (Chrome, Firefox, Safari)
- **Mouse** (touchpad works but mouse is better)

Please feel free to reach out on telegram should you need any help or run into any issues!

---
