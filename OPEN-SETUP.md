# Free Viewing Task - Open Source Setup Guide

## 🔐 Secure Configuration Setup

This guide walks you through setting up your own instance of the Free Viewing Task experiment with secure credential management.

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get the Code
```bash
# Option A: Download as ZIP from GitHub
# Option B: Clone repository
git clone https://github.com/yourusername/free-viewing-remote.git
cd free-viewing-remote
```

### Step 2: Configure Credentials
1. **Copy the template file:**
   ```bash
   cp config/secrets-template.js config/secrets.js
   ```

2. **Get your Supabase credentials:**
   - Go to [supabase.com](https://supabase.com) and create a project
   - Navigate to **Settings > API** in your Supabase dashboard
   - Copy your **Project URL** and **anon public** key

3. **Create a Telegram bot:**
   - Message `@BotFather` on Telegram
   - Send `/newbot` and follow the instructions
   - Copy your **bot token**

4. **Edit `config/secrets.js`** with your actual credentials:
   ```javascript
   window.SECRETS = {
       TELEGRAM_BOT_TOKEN: '1234567890:AABBCCDDEEFFgghhiijjkkll',
       SUPABASE_URL: 'https://your-project.supabase.co',
       SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIs...'
   };
   ```

### Step 3: Set Up Database
1. **In Supabase dashboard**, go to **SQL Editor**
2. **Copy and paste** the entire contents of `database-setup.sql`
3. **Click "Run"** to create tables and storage

**Add yourself to notifications:**
```sql
INSERT INTO telegram_subscribers (chat_id, name, active) 
VALUES (YOUR_CHAT_ID_HERE, 'Your Name', true);
```
*Get your chat ID by messaging `@userinfobot` on Telegram*

---

## 🌐 Deployment Options

### GitHub Pages (Free)
1. **Push to GitHub repository** (secrets.js won't be included - it's gitignored)
2. **Settings > Pages** in your GitHub repo
3. **Source:** Deploy from branch `main`
4. **Your site:** `https://yourusername.github.io/repository-name/`

### Netlify (Free)
1. **Drag and drop** your project folder to [netlify.com](https://netlify.com)
2. **Builds automatically** and gives you a URL
3. **Custom domain** available

### Local Development
1. **Open `index.html`** directly in your browser
2. **Or use a local server:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (if you have live-server)
   npx live-server
   ```

---

## ✅ Testing Your Setup

### 1. Test Supabase Connection
Open browser console on your site and run:
```javascript
testSupabaseConnection()
```
Should show: `✅ Supabase connection successful`

### 2. Test Telegram Bot
In browser console:
```javascript
testTelegramBot()
```
Should show: `✅ Telegram bot connection successful: YourBotName`

### 3. Test Notifications
Complete a test experiment and check if you receive a Telegram notification.

---

## 🔧 Configuration Details

### File Structure
```
config/
├── secrets-template.js    # Template (safe to commit)
└── secrets.js            # Your actual credentials (gitignored)
```

### Security Features
- ✅ **Credentials separated** from source code
- ✅ **Template provided** for easy setup
- ✅ **Automatic gitignore** prevents accidental commits
- ✅ **Clear error messages** if misconfigured
- ✅ **Validation checks** for missing values

### What's Protected
- **Telegram Bot Token** - Prevents unauthorized bot access
- **Supabase Credentials** - Protects your database (though anon keys are client-safe)

---

## 🎓 For Research Teams

### Adding Team Members to Notifications
1. **Get their Telegram Chat ID:**
   - They message `@userinfobot` on Telegram
   - Copy the chat ID number

2. **Add to database via Supabase:**
   ```sql
   INSERT INTO telegram_subscribers (chat_id, name, active) 
   VALUES (123456789, 'Team Member Name', true);
   ```

3. **Or add multiple at once:**
   ```sql
   INSERT INTO telegram_subscribers (chat_id, name, active) 
   VALUES 
       (123456789, 'Alice Research', true),
       (987654321, 'Bob Psychology', true),
       (555666777, 'Carol Analysis', true);
   ```

### Managing Subscribers
- **Deactivate:** `UPDATE telegram_subscribers SET active = false WHERE chat_id = 123456789;`
- **Reactivate:** `UPDATE telegram_subscribers SET active = true WHERE chat_id = 123456789;`
- **Remove:** `DELETE FROM telegram_subscribers WHERE chat_id = 123456789;`

---

## ❗ Troubleshooting

### Common Issues

**"Missing configuration: config/secrets.js not found"**
- ✅ Copy `config/secrets-template.js` to `config/secrets.js`
- ✅ Fill in your actual credentials

**"Missing Telegram bot token"**
- ✅ Create bot with @BotFather
- ✅ Update `TELEGRAM_BOT_TOKEN` in `config/secrets.js`

**"Supabase connection failed"**
- ✅ Check your Supabase project is active
- ✅ Verify URL and anon key in `config/secrets.js`
- ✅ Run the database-setup.sql script

**"No notifications received"**
- ✅ Add your chat ID to `telegram_subscribers` table
- ✅ Check bot token is correct
- ✅ Test with `telegramNotifications.sendTestNotification()`

### File Permissions
If you're getting file access errors, make sure:
- `config/secrets.js` is readable by your web server
- All files have appropriate permissions for your hosting environment

---

## 📊 Monitoring Usage

### Free Tier Limits
- **Supabase:** 500MB database + 1GB file storage
- **GitHub Pages:** 1GB storage + 100GB bandwidth/month
- **Telegram:** Unlimited notifications (with rate limits)

### Best Practices
- **Regular cleanup** - Download and delete experiment data
- **Monitor storage** - Check Supabase dashboard for usage
- **Backup data** - Keep local copies of important experiments

---

## 🔒 Security Notes

### For Production Use
- Consider implementing proper authentication instead of simple passwords
- Use HTTPS for all connections (automatic with GitHub Pages/Netlify)
- Regularly rotate API keys and tokens
- Monitor access logs in Supabase dashboard

### For Research Use
- Current setup is appropriate for academic research
- Simple password authentication is sufficient for small teams
- Data is automatically encrypted in transit and at rest by Supabase

---

## 📞 Support

### Self-Help Resources
1. **Check browser console** for error messages
2. **Test connections** using provided functions
3. **Verify configuration** in `config/secrets.js`

### Common Fixes
- **Hard refresh** browser (Ctrl+Shift+R) after changes
- **Clear browser cache** if seeing old versions
- **Check Supabase dashboard** for database/storage issues

### Getting Help
- Check GitHub Issues for common problems
- Review browser console error messages
- Ensure all setup steps were completed

---

## 🎯 Ready to Deploy!

Once configured:
1. ✅ Participants visit your site and complete experiments
2. ✅ Data automatically uploads to Supabase
3. ✅ Team receives instant Telegram notifications
4. ✅ Download and manage data via admin dashboard

**Your experiment system is now ready for psychology research!** 🧠✨